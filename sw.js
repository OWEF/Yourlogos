const CACHE="yourlogos-v74-character-expressions-discover";const PRECACHE=["/","/index.html","/styles.css","/app.js","/encounter-queue.js","/schools.js","/cosmos-v2.html","/constellation-embed.css","/v22.css","/daily-arrival.css","/world.css","/library-atmosphere.css","/v26.css","/motion.css","/v29.css","/v30.css","/v31.css","/encounter-v31.js","/encounter-feedback.js","/v32.css","/v33.css","/welcome.css","/slider-lambda.css","/library-bridge.css","/welcome.js","/thought-threads.js","/tension-engine.js","/explore-catalogue.js","/personalization.js","/living-threads.js","/world-memory.js","/discover-ai-client.js","/onboarding.js","/onboarding.css","/tension-catalogue-a.js","/tension-catalogue-b.js","/tension-catalogue-c.js","/tension-catalogue-d.js","/tension-catalogue-e.js","/school-scenes.js","/world-view.js","/auth-client.js","/auth-config.js","/icon.svg","/apple-touch-icon.svg","/manifest.webmanifest","/little-logo-v1.avif","/little-logo-hd-v2.jpg","/little-logo-live.css","/little-logo-discover.css"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting()});self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(req).then(cached=>{
  if(cached)return cached;
  return fetch(req).then(response=>{
   if(response.ok){
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{}));
   }
   return response;
  }).catch(async error=>{
   if(req.mode==="navigate")return(await caches.match("/index.html"))||Promise.reject(error);
   throw error;
  });
 }));
});