// Same-origin APIs keep the Neon connection string and session cookie off the browser.
export const configured = true;
const listeners=new Set();
export async function request(action,body){const response=await fetch(`/api/app?action=${encodeURIComponent(action)}`,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');return data;}
export const db={auth:{async signInWithPassword(credentials){try{await request('login',credentials);listeners.forEach(fn=>fn());return {error:null};}catch(error){return {error};}},async signOut(){await request('logout',{});listeners.forEach(fn=>fn());},onAuthStateChange(fn){listeners.add(fn);return {data:{listener:null,subscription:{unsubscribe:()=>listeners.delete(fn)}}};}},async rpc(name,args){try{let data;if(name==='is_admin')data=(await request('session')).admin;else if(name==='set_order_status')data=await request('status',{id:args.p_order_id,status:args.p_status});else throw new Error('Unsupported action');return {data,error:null};}catch(error){return {data:null,error};}}};
export const readCatalog=()=>request('catalog');
export const saveCatalog=(menu,categories,settings)=>request('save-catalog',{menu,categories,settings});
export const adminOrders=()=>request('admin-orders');
function tokens(){try{return JSON.parse(localStorage.getItem('fcc_tracking_v2')||'[]');}catch{return [];}}
export async function placeOrder(customer,cart,key){const order=await request('place',{customer,items:cart.map(item=>({itemId:item.itemId,addonIds:item.addonIds||[],quantity:item.quantity})),key});const saved=tokens();if(!saved.some(x=>x.id===order.id))localStorage.setItem('fcc_tracking_v2',JSON.stringify([{id:order.id,token:order.trackingToken},...saved].slice(0,50)));return order;}
export async function trackOrders(){return Promise.all(tokens().map(x=>request('track',x)));}
