-- FOURTH CROWN / Neon PostgreSQL. Additive setup; dedicated restaurant database.
begin;
create extension if not exists pgcrypto;
create table if not exists public.admin_users(id uuid primary key default gen_random_uuid(), email text not null unique, password_hash text not null, role text not null default 'admin' check(role in ('admin','staff')));
create table if not exists public.admin_sessions(token_hash text primary key, user_id uuid not null references public.admin_users(id), expires_at timestamptz not null);
create table if not exists public.request_limits(key text primary key, window_start timestamptz not null default now(), attempts integer not null default 1);
create or replace function public.actor_id() returns uuid language sql stable as $$select nullif(current_setting('app.actor_id',true),'')::uuid$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public,extensions as $$select exists(select 1 from admin_users where id=actor_id() and role='admin')$$;
create table if not exists public.menu_items(id text primary key, content jsonb not null);
create table if not exists public.categories(id text primary key, content jsonb not null);
create table if not exists public.restaurant_settings(id integer primary key check(id=1), content jsonb not null);
create table if not exists public.orders(id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), idempotency_key uuid not null unique, request_hash text not null, tracking_token text not null, payload jsonb not null, status text not null default 'Received' check(status in ('Received','Preparing','Ready','Out for delivery','Completed','Cancelled')), payment_status text not null default 'Unpaid', subtotal_cents bigint not null, delivery_cents bigint not null, tax_cents bigint not null, total_cents bigint not null);
create table if not exists public.audit_log(id bigint generated always as identity primary key, created_at timestamptz not null default now(), actor uuid, table_name text not null, record_id text, action text not null, old_data jsonb, new_data jsonb);
-- All monetary inputs must be nonnegative, finite dollar values with at most two decimals.
create or replace function public.money_cents(v jsonb) returns bigint language plpgsql immutable set search_path=public,extensions as $$declare n numeric; begin
 if v is null or jsonb_typeof(v) <> 'number' then raise exception 'Price is not configured'; end if;
 n=(v#>>'{}')::numeric; if n<0 or n>100000 or n*100<>trunc(n*100) then raise exception 'Invalid price'; end if; return (n*100)::bigint; end$$;
create or replace function public.order_json(o public.orders) returns jsonb language sql stable set search_path=public,extensions as $$select o.payload || jsonb_build_object('status',o.status,'paymentStatus',o.payment_status)$$;
create or replace function public.place_order(p_customer jsonb,p_items jsonb,p_idempotency_key uuid) returns jsonb language plpgsql security definer set search_path=public,extensions as $$
declare cfg jsonb; line jsonb; dish jsonb; extra jsonb; extra_id text; extra_names text; extra_ids jsonb; lines jsonb='[]'; qty integer; unit bigint; subtotal bigint=0; delivery bigint=0; tax bigint=0; taxrate numeric; total bigint; oid uuid=gen_random_uuid(); tok text=encode(gen_random_bytes(32),'hex'); fingerprint text; previous public.orders; result public.orders;
begin
 if p_idempotency_key is null then raise exception 'Missing request identifier'; end if;
 fingerprint=encode(digest((jsonb_build_object('customer',p_customer,'items',p_items))::text,'sha256'),'hex');
 -- Serialize duplicate submissions before checking for an existing committed order.
 perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text,0));
 select * into previous from orders where idempotency_key=p_idempotency_key;
 if found then if previous.request_hash<>fingerprint then raise exception 'Request identifier already used'; end if; return order_json(previous); end if;
 if jsonb_typeof(p_customer) is distinct from 'object' or length(coalesce(p_customer->>'name','')) not between 2 and 120 or length(coalesce(p_customer->>'phone','')) not between 7 and 40 then raise exception 'Name and phone are required'; end if;
 if coalesce(p_customer->>'fulfillment','') not in ('pickup','delivery') then raise exception 'Invalid fulfillment'; end if;
 if p_customer->>'fulfillment'='delivery' and length(coalesce(p_customer->>'address','')) not between 5 and 500 then raise exception 'Delivery address is required'; end if;
 if length(p_customer::text)>4000 then raise exception 'Customer details too long'; end if;
 if coalesce(p_customer->>'paymentMethod','cash') not in ('cash','pay-later','stripe','paypal','zelle') then raise exception 'Invalid payment method'; end if;
 select content into cfg from restaurant_settings where id=1 for share;
 if cfg is null or cfg->'acceptingOrders' is distinct from 'true'::jsonb then raise exception 'Restaurant is not accepting orders'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Invalid cart'; end if;
 for line in select value from jsonb_array_elements(p_items) loop
 if jsonb_typeof(line->'quantity') is distinct from 'number' or (line->>'quantity')::numeric<>trunc((line->>'quantity')::numeric) then raise exception 'Invalid quantity'; end if;
 qty=(line->>'quantity')::integer; if qty not between 1 and 25 then raise exception 'Invalid quantity'; end if;
 select content into dish from menu_items where id=line->>'itemId' for share;
 if dish is null or dish->'available' is distinct from 'true'::jsonb then raise exception 'Item is unavailable'; end if;
 unit=money_cents(dish->'price'); extra=null; extra_names='';
 extra_ids=coalesce(line->'addonIds', case when coalesce(line->>'addonId','')<>'' then jsonb_build_array(line->>'addonId') else '[]'::jsonb end);
 if jsonb_typeof(extra_ids)<>'array' or jsonb_array_length(extra_ids)>10 then raise exception 'Invalid extras'; end if;
 if (select count(*) from jsonb_array_elements(extra_ids))<>(select count(distinct value) from jsonb_array_elements(extra_ids)) then raise exception 'Duplicate extras'; end if;
 for extra_id in select jsonb_array_elements_text(extra_ids) loop
 select value into extra from jsonb_array_elements(coalesce(dish->'addons','[]')) where value->>'id'=extra_id;
 if extra is null then raise exception 'Invalid extra'; end if; unit=unit+money_cents(extra->'price');
 extra_names=concat_ws(', ',nullif(extra_names,''),extra->>'name'); end loop;
  subtotal=subtotal+unit*qty;
 lines=lines||jsonb_build_array(jsonb_build_object('itemId',line->>'itemId','key',(line->>'itemId')||'-'||coalesce(line->>'addonId','none'),'name',dish->>'name','image',dish->>'image','addon',extra_names,'addonIds',extra_ids,'price',unit/100.0,'quantity',qty));
 end loop;
 if subtotal<money_cents(cfg->'minimumOrder') then raise exception 'Minimum order not met'; end if;
 if p_customer->>'fulfillment'='delivery' then delivery=money_cents(cfg->'deliveryFee'); end if;
 taxrate=(cfg->>'taxRate')::numeric; if taxrate is null or taxrate<0 or taxrate>100 then raise exception 'Tax rate not configured'; end if;
 tax=round(subtotal*taxrate/100); total=subtotal+delivery+tax;
 insert into orders(id,idempotency_key,request_hash,tracking_token,payload,subtotal_cents,delivery_cents,tax_cents,total_cents) values(oid,p_idempotency_key,fingerprint,tok,jsonb_build_object('id',oid,'createdAt',now(),'customer',p_customer,'items',lines,'subtotal',subtotal/100.0,'deliveryFee',delivery/100.0,'tax',tax/100.0,'total',total/100.0,'status','Received','paymentStatus','Unpaid','trackingToken',tok),subtotal,delivery,tax,total) returning * into result;
 return order_json(result);
end$$;
create or replace function public.get_order(p_order_id uuid,p_tracking_token text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$declare o public.orders; begin select * into o from orders where id=p_order_id and tracking_token=p_tracking_token; if not found then raise exception 'Order not found'; end if; return order_json(o); end$$;
create or replace function public.set_order_status(p_order_id uuid,p_status text) returns jsonb language plpgsql security definer set search_path=public,extensions as $$declare o public.orders; begin if not is_admin() then raise exception 'Administrator access required'; end if; update orders set status=p_status where id=p_order_id returning * into o; if not found then raise exception 'Order not found'; end if; return order_json(o); end$$;
create or replace function public.audit_change() returns trigger language plpgsql security definer set search_path=public,extensions as $$begin insert into audit_log(actor,table_name,record_id,action,old_data,new_data) values(actor_id(),TG_TABLE_NAME,coalesce(to_jsonb(NEW)->>'id',to_jsonb(OLD)->>'id'),TG_OP,case when TG_OP<>'INSERT' then to_jsonb(OLD) end,case when TG_OP<>'DELETE' then to_jsonb(NEW) end); return coalesce(NEW,OLD); end$$;
do $$declare t text; begin foreach t in array array['menu_items','categories','restaurant_settings','orders','admin_users'] loop execute format('drop trigger if exists audit_changes on public.%I',t); execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.audit_change()',t); end loop; end$$;
create table if not exists public.payments(order_id uuid primary key references orders(id),provider text not null,provider_id text not null unique,amount_cents bigint not null,status text not null default 'Pending',capture_id text);
create table if not exists public.payment_events(id text primary key,created_at timestamptz not null default now());
-- Database credentials belong only to the trusted server. No browser connects to Neon.
revoke all on all tables in schema public from public;
revoke execute on all functions in schema public from public;
commit;
