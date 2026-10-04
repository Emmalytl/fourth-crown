import {paymentOptions,startPayment,capturePaypal} from './payments.mjs';
import {randomBytes} from 'node:crypto';
import {database,transaction} from './db.mjs';
import {identity,limit,hashPassword,verifyPassword,digest,cookie,sessionToken} from './auth.mjs';
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
export async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const resJson=(status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
 try{
  const action=new URL(req.url,'http://localhost').searchParams.get('action')||req.query?.action||'catalog';
  const mutation=req.method==='POST';if(!['GET','POST'].includes(req.method))throw fail('Method not allowed',405);
  if(mutation){const origin=req.headers.origin;const configured=process.env.APP_URL;const expected=configured?new URL(configured).origin:`http://${req.headers.host}`;if(!origin||origin!==expected)throw fail('Invalid request origin',403);if(!String(req.headers['content-type']||'').startsWith('application/json'))throw fail('JSON required',415);}
  let body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};if(mutation&&!req.body){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>200000)throw fail('Request too large',413);}body=JSON.parse(raw||'{}');}
  if(action==='health')return resJson(200,{configured:Boolean(process.env.DATABASE_URL)});
  const client=await database().connect();let user;
  try{user=await identity(client,req);
   if(action==='session')return resJson(200,{admin:user?.role==='admin'});
   if(action==='login'){
    if(!mutation)throw fail('Method not allowed',405);
    await limit(client,`login:${req.headers['x-forwarded-for']||req.socket?.remoteAddress}`,20);
    const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');if(password.length>256)throw fail('Invalid credentials',401);
    const row=(await client.query('select * from admin_users where email=$1',[email])).rows[0];
    // Compute a hash even for unknown accounts to reduce email enumeration through timing.
    const valid=verifyPassword(password,row?.password_hash||hashPassword('dummy-password'));
    if(!valid||row?.role!=='admin')throw fail('Invalid administrator credentials',401);
    const token=randomBytes(32).toString('hex');await client.query("insert into admin_sessions values($1,$2,now()+interval '8 hours')",[digest(token),row.id]);res.setHeader('Set-Cookie',cookie(token,28800));return resJson(200,{admin:true});
   }
   if(action==='logout'){if(!mutation)throw fail('Method not allowed',405);await client.query('delete from admin_sessions where token_hash=$1',[digest(sessionToken(req)||'')]);res.setHeader('Set-Cookie',cookie('',0));return resJson(200,{ok:true});}
   if(['save-catalog','admin-orders','status','confirm-manual'].includes(action)&&user?.role!=='admin')throw fail('Administrator access required',401);
   if(action==='catalog'){
    const menu=await client.query('select id,content from menu_items order by id'),categories=await client.query('select id,content from categories order by id'),settings=await client.query('select content from restaurant_settings where id=1');
    if(!settings.rows.length)throw fail('Run database setup first',503);
    return resJson(200,{menu:menu.rows.map(x=>({...x.content,id:x.id})),categories:categories.rows.map(x=>({...x.content,id:x.id})),settings:{...settings.rows[0].content,paymentOptions:paymentOptions(),zelleRecipient:process.env.ZELLE_RECIPIENT||'',paymentMode:process.env.PAYMENTS_LIVE_ENABLED==='true'?'live':'test'}});
   }
   if(action==='admin-orders')return resJson(200,(await client.query('select public.order_json(o) as data from orders o order by created_at desc limit 200')).rows.map(x=>x.data));
   if(action==='track') {if(!mutation)throw fail('Method not allowed',405);await limit(client,`track:${req.headers['x-forwarded-for']||req.socket?.remoteAddress}`,100);return resJson(200,(await client.query('select get_order($1::uuid,$2::text) as data',[body.id,body.token])).rows[0].data);}
   if(['payment-start','paypal-capture'].includes(action)){if(!mutation)throw fail('Method not allowed',405);await limit(client,`payment:${req.headers['x-forwarded-for']||req.socket?.remoteAddress}`,50);return resJson(200,action==='payment-start'?await startPayment(client,body):await capturePaypal(client,body));}
   if(action==='place'){if(['stripe','paypal','zelle'].includes(body.customer?.paymentMethod)&&!paymentOptions()[body.customer.paymentMethod])throw fail('Payment method unavailable');if(!mutation)throw fail('Method not allowed',405);await limit(client,`order:${req.headers['x-forwarded-for']||req.socket?.remoteAddress}`,30);return resJson(200,(await client.query('select place_order($1::jsonb,$2::jsonb,$3::uuid) as data',[JSON.stringify(body.customer),JSON.stringify(body.items),body.key])).rows[0].data);}
  }finally{client.release();}
  if(!mutation)throw fail('Method not allowed',405);
  if(action==='save-catalog'){
   if(!Array.isArray(body.menu)||!Array.isArray(body.categories)||body.menu.length>300||body.categories.length>100||!body.settings)throw fail('Invalid catalog');
   for(const item of body.menu){if(!item.id||!item.name)throw fail('Menu item requires ID and name');if(item.price!==null&&(!Number.isFinite(item.price)||item.price<0||Math.abs(Math.round(item.price*100)-item.price*100)>0.000001))throw fail('Invalid menu price');}
   await transaction(user.id,async c=>{for(const [table,items] of [['menu_items',body.menu],['categories',body.categories]])for(const item of items)await c.query(`insert into ${table}(id,content) values($1,$2::jsonb) on conflict(id) do update set content=excluded.content`,[item.id,JSON.stringify(item)]);await c.query('insert into restaurant_settings values(1,$1::jsonb) on conflict(id) do update set content=excluded.content',[JSON.stringify(body.settings)]);});return resJson(200,{ok:true});
  }
  if(action==='confirm-manual'){
   if(!['Paid','Unpaid'].includes(body.paymentStatus)||typeof body.reference!=='string'||body.reference.trim().length<3)throw fail('Payment evidence/reference is required');
   return resJson(200,await transaction(user.id,async c=>{const o=(await c.query('select * from orders where id=$1::uuid for update',[body.id])).rows[0];if(!o||!['cash','pay-later','zelle'].includes(o.payload.customer.paymentMethod))throw fail('Only manual payments can be confirmed here');await c.query("update orders set payment_status=$2,payload=jsonb_set(payload,'{paymentReference}',to_jsonb($3::text)) where id=$1",[body.id,body.paymentStatus,body.reference.trim()]);return {ok:true};}));
  }
  if(action==='status')return resJson(200,await transaction(user.id,async c=>(await c.query('select set_order_status($1::uuid,$2) as data',[body.id,body.status])).rows[0].data));
  throw fail('Unknown action',404);
 }catch(e){const safe=e.status?e.message:e.code?.startsWith('P')?e.message:'Request failed. Check server configuration or try again.';resJson(e.status||400,{error:safe});}
}
