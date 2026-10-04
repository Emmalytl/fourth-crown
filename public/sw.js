// Only fixed public shell assets are cached. Payments, auth, customer data and admin stay online.
const CACHE = 'fourth-crown-neon-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/images/icon-192.png', '/images/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event=> {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('fourth-crown-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=> {
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin) return;
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/admin')||url.pathname.startsWith('/payment')||url.pathname.startsWith('/checkout')) return;
  if(event.request.mode==='navigate') {
    event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));
    return;
  }
  if(!url.pathname.startsWith('/assets/')&&!url.pathname.startsWith('/images/')&&!APP_SHELL.includes(url.pathname)) return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=> {
    if(response.ok) event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,response.clone())));
    return response;
  })));
});
