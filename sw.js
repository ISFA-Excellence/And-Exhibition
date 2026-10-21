/* ISFA service worker: network first (always fresh when online), cached copy when offline. API calls are never cached. */
const V='isfa-v2',CORE=['index.html','login.html','student.html','admin.html','assets/app.css','assets/app.js','assets/login.js','assets/student.js','assets/admin.js','assets/pwa.js','assets/logo.jpg','manifest-student.webmanifest','manifest-admin.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('login.html'))))});
