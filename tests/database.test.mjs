import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

let db;
const admin = '11111111-1111-4111-8111-111111111111';
const staff = '22222222-2222-4222-8222-222222222222';
const customer = { name: 'Test Customer', phone: '4045550100', fulfillment: 'pickup', paymentMethod: 'cash' };
async function role(name, uid = '') {await db.query("SELECT set_config('app.actor_id', $1, false)",[uid]);}
async function place(items, key = crypto.randomUUID()) {
  return (await db.query('SELECT public.place_order($1::jsonb,$2::jsonb,$3::uuid) AS result', [JSON.stringify(customer), JSON.stringify(items), key])).rows[0].result;
}
before(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(readFileSync(new URL('../database/schema.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../database/schema.sql', import.meta.url), 'utf8'));
  await db.query("INSERT INTO public.admin_users(id,email,password_hash,role) VALUES ($1,'admin@example.test','test','admin'),($2,'staff@example.test','test','staff')",[admin,staff]);
  await db.exec(`INSERT INTO public.restaurant_settings VALUES (1,'{"acceptingOrders":true,"minimumOrder":0,"deliveryFee":5,"taxRate":10}');
    INSERT INTO public.menu_items VALUES ('rice','{"id":"rice","name":"Jollof","available":true,"price":12.50,"addons":[{"id":"chicken","name":"Chicken","price":3}]}'),('sold','{"name":"Sold out","available":false,"price":8}'),('unset','{"name":"Unset","available":true,"price":null}');`);
});
after(async () => db?.close());

test('server ignores forged prices and computes extras and tax from catalog', async () => {
  await role('anon');
  const order = await place([{ itemId: 'rice', quantity: 2, addonIds: ['chicken'], price: 0.01 }]);
  assert.equal(Number(order.subtotal), 31);
  assert.equal(Number(order.tax), 3.1);
  assert.equal(Number(order.total), 34.1);
  assert.equal(order.paymentStatus, 'Unpaid');
  assert.ok(order.trackingToken.length >= 64);
});
test('same request identifier returns one order; changed content is rejected', async () => {
  await role('anon');
  const key = crypto.randomUUID();
  const items = [{ itemId: 'rice', quantity: 1 }];
  const first = await place(items, key);
  const retry = await place(items, key);
  assert.equal(retry.id, first.id);
  await assert.rejects(place([{ itemId: 'rice', quantity: 2 }], key), /already used/);
});
test('sold-out, unpriced, malformed quantity and unrecognized extras reject orders', async () => {
  await role('anon');
  for (const items of [
    [{ itemId: 'sold', quantity: 1 }], [{ itemId: 'unset', quantity: 1 }],
    [{ itemId: 'rice', quantity: 0 }], [{ itemId: 'rice', quantity: 1.5 }],
    [{ itemId: 'rice', quantity: 1, addonIds: ['unknown'] }],
    [{ itemId: 'rice', quantity: 1, addonIds: ['chicken', 'chicken'] }],
  ]) await assert.rejects(place(items));
});
test('tracking secret is required to retrieve an order', async () => {
  await role('anon');
  const order = await place([{ itemId: 'rice', quantity: 1 }]);

  await assert.rejects(db.query('SELECT public.get_order($1,$2)', [order.id, 'wrong']), /not found/);
  const result = await db.query('SELECT public.get_order($1,$2) AS result', [order.id, order.trackingToken]);
  assert.equal(result.rows[0].result.id, order.id);
});
test('staff and anonymous actors cannot update order status', async()=>{
 await role('authenticated',staff);await assert.rejects(db.query("SELECT public.set_order_status($1,'Completed')",[crypto.randomUUID()]),/Administrator/);
 await role('anon');await assert.rejects(db.query("SELECT public.set_order_status($1,'Completed')",[crypto.randomUUID()]),/Administrator/);
});
test('admin can read shared orders and update status with audit evidence', async () => {
  await role('authenticated', admin);
  const orders = (await db.query('SELECT id FROM public.orders')).rows;
  assert.ok(orders.length >= 1);
  await db.query("SELECT public.set_order_status($1,'Preparing')", [orders[0].id]);
  const audit = await db.query("SELECT * FROM public.audit_log WHERE table_name='orders' AND action='UPDATE' AND actor=$1", [admin]);
  assert.ok(audit.rows.length >= 1);
});

test('closed restaurant rejects orders',async()=>{await role('admin',admin);await db.exec("update restaurant_settings set content=jsonb_set(content,'{acceptingOrders}','false') where id=1");await assert.rejects(place([{itemId:'rice',quantity:1}]),/not accepting/);});
