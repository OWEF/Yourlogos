import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const origin="https://yourlogos.test";
function runRealServiceWorker(){
  const handlers=new Map();
  const stored=new Map();
  const cache={
    async addAll(paths){
      for(const p of paths){
        const url=new URL(p,origin).href;
        stored.set(url,{ok:true,url,source:"precache"});
      }
    },
    async match(request,{ignoreSearch=false}={}){
      let url=typeof request==="string"?request:request.url;
      if(!URL.canParse(url))url=new URL(url,origin).href;
      if(ignoreSearch){url=new URL(url);url.search="";url=url.href;}
      return stored.get(url);
    },
    async put(request,response){stored.set(request.url??request,response);}
  };
  const caches={
    async open(){return cache;},
    async keys(){return ["cz80"];},
    async delete(){return true;},
    async match(request){return cache.match(request);}
  };
  const self={
    location:{origin},clients:{claim(){return Promise.resolve();}},
    skipWaiting(){},
    addEventListener(type,fn){handlers.set(type,fn);}
  };
  let fetchCount=0;
  function offlineFetch(){fetchCount++;return Promise.reject(Error("offline"));}
  runInNewContext(sw,{self,caches,URL,fetch:offlineFetch,Promise});
  return {
    stored,handlers,get fetchCount(){return fetchCount;},
    async install(){
      let promise;
      handlers.get("install")({waitUntil(p){promise=p;}});
      await promise;
    },
    async request(path,{mode="cors",method="GET"}={}){
      let reply;
      handlers.get("fetch")({
        request:{url:new URL(path,origin).href,mode,method},
        respondWith(p){reply=p;},
        waitUntil(){}
      });
      return reply?await reply:undefined;
    }
  };
}
test("CZ-80 and CZ-81 imported assets, layered SVG, and styles are all precached at installation",async()=>{
  assert.match(sw,/yourlogos-v92-cz80-cz81-offline/);
  const worker=runRealServiceWorker();
  await worker.install();
  for(const p of ["/index.html","/app.js","/encounter-events.js",
    "/encounter-choreography.js","/encounter-choreography.css",
    "/lillogo-rig-controller.js","/lillogo-rig-review.css","/assets/lillogo-v3-layered-hybrid.svg","/assets/lillogo-v3-ai-matte.svg"]){
    assert.ok(worker.stored.has(new URL(p,origin).href),"missing offline dependency: "+p);
  }
});
test("real service-worker handler serves cached imported module offline with query-insensitive fallback",async()=>{
  const worker=runRealServiceWorker();
  await worker.install();
  const response=await worker.request("/encounter-choreography.css?cz80=1");
  assert.equal(response.source,"precache");
  assert.equal(response.url,new URL("/encounter-choreography.css",origin).href);
  assert.equal(worker.fetchCount,1);
});
test("auth/API traffic and cross-origin requests remain uncached and unhandled",async()=>{
  const worker=runRealServiceWorker();
  await worker.install();
  assert.equal(await worker.request("/api/discover-ai"),undefined);
  assert.equal(await worker.request("https://external.example/assets/app.js"),undefined);
  assert.equal(worker.fetchCount,0);
});
test("offline navigation still falls back to cached home entrypoint",async()=>{
  const worker=runRealServiceWorker();
  await worker.install();
  const response=await worker.request("/some-offline-route",{mode:"navigate"});
  assert.equal(response.url,new URL("/index.html",origin).href);
});

test("the genuine layered SVG is available offline without a network fetch",async()=>{
 const worker=runRealServiceWorker();
 await worker.install();
 const response=await worker.request("/assets/lillogo-v3-layered-hybrid.svg","/assets/lillogo-v3-ai-matte.svg");
 assert.equal(response.source,"precache");
 assert.equal(response.url,new URL("/assets/lillogo-v3-layered-hybrid.svg","/assets/lillogo-v3-ai-matte.svg",origin).href);
 assert.equal(worker.fetchCount,0,"art asset should be cached-first offline");
});
