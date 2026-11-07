const CACHE="yourlogos-v93-waterline-glass-theme-art";const PRECACHE=["/","/index.html","/styles.css","/app.js","/encounter-queue.js","/schools.js","/cosmos-v2.html","/constellation-embed.css","/v22.css","/daily-arrival.css","/world.css","/library-atmosphere.css","/v26.css","/motion.css","/liquid-navbar.css","/liquid-navbar.js","/liquid-slider.css","/liquid-slider.js","/v29.css","/v30.css","/v31.css","/encounter-v31.js","/encounter-feedback.js","/v32.css","/v33.css","/welcome.css","/slider-lambda.css","/library-bridge.css","/welcome.js","/thought-threads.js","/tension-engine.js","/explore-catalogue.js","/personalization.js","/living-threads.js","/world-memory.js","/discover-ai-client.js","/discover-concept-grammar.js","/discover-concept.css","/discover-quote-drag.js","/discover-quote-schema.js","/discover-quote-standard-substitutions.js","/discover-quote-editorial.js","/onboarding.js","/onboarding.css","/tension-catalogue-a.js","/tension-catalogue-b.js","/tension-catalogue-c.js","/tension-catalogue-d.js","/tension-catalogue-e.js","/school-scenes.js","/world-view.js","/auth-client.js","/auth-config.js","/icon.svg","/apple-touch-icon.svg","/manifest.webmanifest","/little-logo-v1.avif","/little-logo-hd-v2.jpg","/little-logo-live.css","/little-logo-discover.css","/little-logo-cutout-fix.css","/little-logo-ritual.css","/little-logo-poses-v5.css","/little-logo-poses-v5.webp","/little-logo-fx.js","/little-logo-cutout-mask.svg","/philosopher-portraits.js","/philosopher-gallery.js","/philosopher-gallery.css","/philosopher-gallery-v2.css","/philosopher-featured-art.js","/little-logo-presence.js","/discover-living-v2.css"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting()});self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});// HTML and code are network-first: a returning installed iPhone PWA must not
// be pinned to an obsolete Discover experience by its previous CacheStorage.
// Keep offline support, but do not cache authentication/configuration APIs.
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith("/api/"))return;
 const code=request.mode==="navigate"||url.pathname==="/"||/\.(?:html|css|js|mjs)$/.test(url.pathname);
 if(code){
  event.respondWith(fetch(request,{cache:"no-store"}).then(response=>{
   if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,response.clone())).catch(()=>{}));
   return response;
  }).catch(async error=>{
   const cache=await caches.open(CACHE);
   const cached=await cache.match(request);
   if(cached)return cached;
   const canonical=await cache.match(new URL(url.pathname,url.origin).href);
   if(canonical)return canonical;
   const fallback=await cache.match(request,{ignoreSearch:true});
   if(fallback)return fallback;
   if(request.mode==="navigate")return (await caches.match("/index.html"))||Promise.reject(error);
   throw error;
  }));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok)event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,response.clone())).catch(()=>{}));
  return response;
 })));
});
