import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
import {readFileSync} from 'node:fs';
import Stripe from 'stripe';
import {setTestDatabase} from '../server/db.mjs';
import handler from '../api/stripe-webhook.js';
let db;const id='11111111-1111-4111-8111-111111111111',secret='whsec_LOCAL_TEST_ONLY';
process.env.NODE_ENV='test';process.env.STRIPE_SECRET_KEY='sk_test_LOCAL_TEST_ONLY';process.env.STRIPE_WEBHOOK_SECRET=secret;
before(async()=>{db=new PGlite({extensions:{pgcrypto}});await db.exec(readFileSync(new URL('../database/schema.sql',import.meta.url),'utf8'));await db.query(`insert into orders(id,idempotency_key,request_hash,tracking_token,payload,subtotal_cents,delivery_cents,tax_cents,total_cents) values($1,$2,'test','private','{}',1000,0,0,1000)`,[id,crypto.randomUUID()]);await db.query("insert into payments(order_id,provider,provider_id,amount_cents) values($1,'stripe','cs_test_sample',1000)",[id]);setTestDatabase({connect:async()=>({query:(...args)=>db.query(...args),release(){}})});});after(()=>db.close());
async function deliver(amount,signature=true,eventId='evt_test'){const event={id:eventId,type:'checkout.session.completed',data:{object:{id:'cs_test_sample',payment_status:'paid',currency:'usd',amount_total:amount,metadata:{orderId:id},payment_intent:'pi_test_sample'}}};const raw=JSON.stringify(event);const req={method:'POST',headers:{'stripe-signature':signature?Stripe.webhooks.generateTestHeaderString({payload:raw,secret}):'invalid'},async *[Symbol.asyncIterator](){yield Buffer.from(raw);}};let output;const res={setHeader(){},end:x=>output=x};await handler(req,res);return res.statusCode;}
test('invalid Stripe signatures cannot mark a payment paid',async()=>{assert.equal(await deliver(1000,false),400);assert.equal((await db.query('select payment_status from orders')).rows[0].payment_status,'Unpaid');});
test('signed but incorrect payment totals are rejected',async()=>{assert.equal(await deliver(1,true,'evt_wrong_amount'),400);assert.equal((await db.query('select count(*) as n from payment_events')).rows[0].n,0);});
test('signed matching payment is recorded once and duplicate events are harmless',async()=>{assert.equal(await deliver(1000),200);assert.equal(await deliver(1000),200);assert.equal((await db.query('select payment_status from orders')).rows[0].payment_status,'Paid');assert.equal((await db.query('select count(*) as n from payment_events')).rows[0].n,1);});
