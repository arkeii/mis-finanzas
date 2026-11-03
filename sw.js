const CACHE='mis-finanzas-v5';
const ASSETS=['./','./index.html','./app.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys()){if(key!==CACHE&&key.startsWith('mis-finanzas-'))await caches.delete(key)}await self.clients.claim()})())});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone())}return response}catch{return (await caches.match(event.request))||Response.error()}})())});
