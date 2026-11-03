import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getBundledDiscoverSpec,createFutureDiscoverDraft,validateDiscoverSpec,canPublishDiscoverSpec,DISCOVER_SPEC_VERSION,REVIEW_CHECKS} from "../discover-quote-schema.js";
import {CURATED} from "../tension-engine.js";
import {BUNDLED_INTERPRETATION_ROWS} from "../discover-quote-editorial.js";

const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const quotes=[...app.matchAll(/^\s*\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)","([^"]+)","((?:[^"\\]|\\.)*)"/gm)]
 .map(m=>m.slice(1,5).map(x=>x.replace(/\\\"/g,'"')));

test("91 bundled quotes have unique tailored lens sets and structurally valid draft specs",()=>{
 assert.equal(DISCOVER_SPEC_VERSION,1);
 assert.equal(quotes.length,91);
 assert.equal(BUNDLED_INTERPRETATION_ROWS.length,quotes.length);
 for(let id=0;id<quotes.length;id++){
   const spec=getBundledDiscoverSpec(quotes[id],id);
   assert.ok(spec,"Missing quote-specific contract "+id);
   assert.deepEqual(validateDiscoverSpec(spec),[],"Malformed draft "+id);
   assert.equal(spec.encounter.options.length,3);
   assert.equal(spec.visual.background,BUNDLED_INTERPRETATION_ROWS[id].motif);
   assert.equal(canPublishDiscoverSpec(spec),false,"Do not auto-publish unreviewed "+id);
 }
});
test("Pilot quotes contain distinct full experiences and choice-dependent meanings",()=>{
 for(const id of [0,31,70]){
   const spec=getBundledDiscoverSpec(quotes[id],id);
   assert.ok(spec.encounter.bridge.length<=85);
   assert.ok(spec.encounter.scene&&spec.encounter.question&&spec.reflection.question);
   assert.equal(new Set(spec.encounter.options.map(x=>x.insight)).size,3);
   assert.ok(spec.encounter.options.every(x=>x.insight&&x.focus&&x.key&&x.sceneMeaning&&x.quoteConnection&&x.sceneLeft&&x.sceneRight&&x.relation));
   assert.ok(!canPublishDiscoverSpec(spec),"Pilot content still needs human sign-off");
 }
});
test("Future-quote draft requires three independently chosen lenses and full review to publish",()=>{
 const draft=createFutureDiscoverDraft({id:91,
   quote:{text:"A new hypothetical quotation.",author:"A future author",source:"Reference, work and page"},
   philosophy:{claim:"A specific claim",warrant:"Its rationale",poles:["Concept A","Concept B"],friction:"A fair question"},
   visual:{template:"lens",left:"Concept A",right:"Concept B",background:"new-scene"}});
 assert.ok(validateDiscoverSpec(draft).some(x=>x.includes("three")));
 assert.equal(canPublishDiscoverSpec(draft),false);
 const complete={...draft,
   encounter:{bridge:"Here is a familiar moment:",scene:"A situation anyone can picture.",question:"How would you see it?",
     freeText:true,options:[{key:"a",label:"One reading",focus:"A",insight:"A precise insight",sceneMeaning:"A concrete explanation a",quoteConnection:"An explicit quote link a",sceneLeft:"One detail a",sceneRight:"Another detail a",relation:"helps explain"},
       {key:"b",label:"Another reading",focus:"B",insight:"Another insight",sceneMeaning:"A concrete explanation b",quoteConnection:"An explicit quote link b",sceneLeft:"One detail b",sceneRight:"Another detail b",relation:"helps explain"},
       {key:"c",label:"Third reading",focus:"C",insight:"Third insight",sceneMeaning:"A concrete explanation c",quoteConnection:"An explicit quote link c",sceneLeft:"One detail c",sceneRight:"Another detail c",relation:"helps explain"}]},
   reflection:{question:"What would you reconsider?",saveRequiresAction:true},
   conceptualExercise:{kind:"drag-substitution",variants:[0,1,2].map(i=>({
      parts:["A real example ",{slot:"a"}," connects to ",{slot:"b"},"."],
      slots:[{key:"a",hint:"First idea",word:"an everyday event "+i},
             {key:"b",hint:"Second idea",word:"its consequence "+i}],
      connection:"The example illustrates a distinct relation "+i
   }))},
   review:Object.fromEntries(REVIEW_CHECKS.map(k=>[k,true]))};
 assert.deepEqual(validateDiscoverSpec(complete,{publish:true}),[]);
 assert.equal(canPublishDiscoverSpec(complete),true);
});
test("Mismatched quote-ID pair fails closed; quote source not silently substituted",()=>{
 assert.equal(getBundledDiscoverSpec(quotes[31],0),null);
 assert.equal(getBundledDiscoverSpec(["A fake quotation","Author","Theme","Source"],31),null);
 assert.equal(CURATED.length,91);
});

test("Discover startup modules are explicitly precached for offline app evaluation",()=>{
 const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
 for(const file of ["discover-quote-schema.js","discover-quote-standard-substitutions.js"])
  assert.ok(sw.includes('"/'+file+'"'),"Offline precache must include "+file);
});

const vm=await import("node:vm");
const workerSource=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
function offlineWorker(entries){
 const listeners={},origin="https://yourlogos.test";
 const cacheName=workerSource.match(/const CACHE="([^"]+)"/)[1];
 const store=new Map(Object.entries(entries).map(([url,response])=>[new URL(url,origin).href,response]));
 let cacheReads=0,globalReads=0;
 const match=(request,options={})=>{
  cacheReads++;
  const url=typeof request==="string"?new URL(request,origin).href:request.url;
  if(!options.ignoreSearch)return store.get(url);
  const target=new URL(url);
  return [...store].find(([key])=>{
   const candidate=new URL(key);
   return candidate.origin===target.origin&&candidate.pathname===target.pathname;
  })?.[1];
 };
 const cache={match};
 vm.runInNewContext(workerSource,{
  URL,
  self:{location:{origin},addEventListener(type,listener){listeners[type]=listener},clients:{claim(){}},skipWaiting(){}},
  caches:{open:async name=>{assert.equal(name,cacheName);return cache},match:async(...args)=>{globalReads++;return match(...args)}},
  fetch:async()=>{throw Error("Offline")}
 },{filename:"sw.js"});
 return {
  async request(path,mode="no-cors"){
   let response;
   const event={request:{url:new URL(path,origin).href,method:"GET",mode},respondWith(value){response=value},waitUntil(){}};
   listeners.fetch(event);
   return response?await response:undefined;
  },
  get reads(){return {cache:cacheReads,global:globalReads}}
 };
}

test("Exact versioned cache response wins over an older canonical response",async()=>{
 const worker=offlineWorker({
  "/offline-review-probe.js":"CANONICAL_OLD",
  "/offline-review-probe.js?yl=new":"EXACT_NEW"
 });
 assert.equal(await worker.request("/offline-review-probe.js?yl=new"),"EXACT_NEW");
 assert.deepEqual(worker.reads,{cache:1,global:0});
});

test("Uncached query URL falls back to its canonical precache response offline",async()=>{
 const worker=offlineWorker({"/app.js":"CANONICAL_APP"});
 assert.equal(await worker.request("/app.js?yl=87"),"CANONICAL_APP");
 assert.deepEqual(worker.reads,{cache:2,global:0});
});

test("Canonical precache response wins over older query variants for unseen URLs",async()=>{
 const worker=offlineWorker({
  "/app.js?yl=old":"OLD_QUERY_VARIANT",
  "/app.js":"CANONICAL_APP"
 });
 assert.equal(await worker.request("/app.js?yl=unseen"),"CANONICAL_APP");
 assert.deepEqual(worker.reads,{cache:2,global:0});
});

test("Offline Discover startup requests resolve from canonical precache entries",async()=>{
 const worker=offlineWorker({
  "/":"INDEX",
  "/app.js":"APP",
  "/discover-ai-client.js":"AI_CLIENT",
  "/discover-quote-schema.js":"QUOTE_SCHEMA",
  "/discover-quote-standard-substitutions.js":"SUBSTITUTIONS"
 });
 assert.equal(await worker.request("/","navigate"),"INDEX");
 assert.equal(await worker.request("/app.js?yl=87"),"APP");
 assert.equal(await worker.request("/discover-ai-client.js?yl=87"),"AI_CLIENT");
 assert.equal(await worker.request("/discover-quote-schema.js"),"QUOTE_SCHEMA");
 assert.equal(await worker.request("/discover-quote-standard-substitutions.js"),"SUBSTITUTIONS");
});

test("API requests bypass cached responses",async()=>{
 const worker=offlineWorker({"/api/public-config":"CACHED_CONFIG"});
 assert.equal(await worker.request("/api/public-config"),undefined);
 assert.deepEqual(worker.reads,{cache:0,global:0});
});
