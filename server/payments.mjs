import Stripe from 'stripe';
import {transaction} from './db.mjs';
export function paymentOptions(){return {stripe:Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET&&process.env.APP_URL),paypal:Boolean(process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET&&process.env.APP_URL),zelle:Boolean(process.env.ZELLE_RECIPIENT)};}
export function stripeClient(){const key=process.env.STRIPE_SECRET_KEY;if(!key)throw new Error('Stripe is not configured');if(!key.startsWith('sk_test_')&&process.env.PAYMENTS_LIVE_ENABLED!=='true')throw new Error('Live payments are disabled');return new Stripe(key);}
async function paypal(path,body,id){const live=process.env.PAYPAL_MODE==='live';if(live&&process.env.PAYMENTS_LIVE_ENABLED!=='true')throw new Error('Live payments are disabled');const base=live?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';const tokenResponse=await fetch(`${base}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});const token=await tokenResponse.json();if(!tokenResponse.ok)throw new Error('PayPal authentication failed');const response=await fetch(base+path,{method:'POST',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json','PayPal-Request-Id':id},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw new Error('PayPal request failed');return data;}
export async function startPayment(c,body){
 const row=(await c.query('select * from orders where id=$1::uuid and tracking_token=$2',[body.id,body.token])).rows[0];if(!row)throw new Error('Order not found');if(row.status==='Cancelled'||row.payment_status==='Paid')throw new Error('Order cannot be paid');
 const provider=row.payload.customer.paymentMethod;
 if(!paymentOptions()[provider])throw new Error('Payment method is not configured');
 const total=Number(row.total_cents);if(total<=0)throw new Error('Online payment requires a positive order total');
 if(provider==='stripe'){
  const stripe=stripeClient();const session=await stripe.checkout.sessions.create({mode:'payment',client_reference_id:row.id,metadata:{orderId:row.id},line_items:[{price_data:{currency:'usd',unit_amount:total,product_data:{name:'FOURTH CROWN food order'}},quantity:1}],success_url:`${process.env.APP_URL}/payment-success?provider=stripe`,cancel_url:`${process.env.APP_URL}/payment-success?cancelled=1`},{idempotencyKey:`fcc-${row.id}`});
  await c.query('insert into payments(order_id,provider,provider_id,amount_cents) values($1,$2,$3,$4) on conflict(order_id) do nothing',[row.id,'stripe',session.id,total]);return {url:session.url};
 }
 if(provider==='paypal'){
  const order=await paypal('/v2/checkout/orders',{intent:'CAPTURE',purchase_units:[{reference_id:row.id,custom_id:row.id,amount:{currency_code:'USD',value:(total/100).toFixed(2)}}],payment_source:{paypal:{experience_context:{brand_name:'FOURTH CROWN',user_action:'PAY_NOW',return_url:`${process.env.APP_URL}/payment-success?provider=paypal`,cancel_url:`${process.env.APP_URL}/payment-success?cancelled=1`}}}},`fcc-${row.id}`);
  await c.query('insert into payments(order_id,provider,provider_id,amount_cents) values($1,$2,$3,$4) on conflict(order_id) do nothing',[row.id,'paypal',order.id,total]);return {url:order.links?.find(x=>['payer-action','approve'].includes(x.rel))?.href};
 }
 throw new Error('Unsupported payment provider');
}
export async function capturePaypal(c,body){
 const p=(await c.query("select p.* from payments p join orders o on o.id=p.order_id where p.order_id=$1::uuid and o.tracking_token=$2 and p.provider='paypal'",[body.id,body.token])).rows[0];if(!p)throw new Error('Payment not found');if(p.status==='Paid')return {paid:true};
 const data=await paypal(`/v2/checkout/orders/${encodeURIComponent(p.provider_id)}/capture`,{},`capture-${p.order_id}`);const capture=data.purchase_units?.[0]?.payments?.captures?.[0];if(data.status!=='COMPLETED'||capture?.status!=='COMPLETED'||capture.amount.currency_code!=='USD'||Math.round(Number(capture.amount.value)*100)!==Number(p.amount_cents))throw new Error('Payment is not confirmed');
 await transaction(null,async t=>{await t.query("update payments set status='Paid',capture_id=$2 where order_id=$1",[p.order_id,capture.id]);await t.query("update orders set payment_status='Paid' where id=$1",[p.order_id]);});return {paid:true};
}
