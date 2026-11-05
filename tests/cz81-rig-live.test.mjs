import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEncounterEventBus} from "../encounter-events.js";
import {CZ81_PREVIEW_ENABLED,createLilLogoRigController,rigMoodForEvent} from "../lillogo-rig-controller.js";
import {littleLogoPet} from "../discover-ai-client.js";

const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../lillogo-rig-review.css",import.meta.url),"utf8");
const svg=readFileSync(new URL("../assets/lillogo-v3-layered-hybrid.svg",import.meta.url),"utf8");

test("original production LilLogo remains unchanged without the explicit query flag",()=>{
  assert.equal(CZ81_PREVIEW_ENABLED,false);
  const defaultHtml=littleLogoPet("idle");
  assert.match(defaultHtml,/little-logo-hd-v2\.jpg/);
  assert.doesNotMatch(defaultHtml,/yl-logo-v3-rig|yl-logo-pet-layered/);
  assert.match(index,/lillogo-rig-review\.css\?cz81=1/);
  assert.match(css,/html\[data-cz81-preview="on"\]/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("original art and independent face components remain embedded, not regenerated",()=>{
  const encoded=svg.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/)?.[1];
  assert.ok(encoded);
  assert.deepEqual(Buffer.from(encoded,"base64"),readFileSync(new URL("../little-logo-hd-v2.jpg",import.meta.url)));
  for(const id of ["headRig","eyeRig","eyelids","hairRig","bodyHeadKnockout"]){
    assert.match(svg,new RegExp('id="'+id+'"'));
  }
  for(const state of ["curious","reflective","restful","quietly-delighted"]){
    assert.match(svg,new RegExp('state-'+state));
  }
  assert.match(svg,/CZ-81 B1c PROTOTYPE/);
});

test("unverified finish is ignored, saved finish moves to a restrained state",()=>{
  assert.equal(rigMoodForEvent({type:"encounter.finish",payload:{saved:false}}),null);
  assert.equal(rigMoodForEvent({type:"encounter.finish",payload:{}}),null);
  assert.equal(rigMoodForEvent({type:"encounter.finish",payload:{saved:true}}),"quietly-delighted");
  assert.equal(rigMoodForEvent({type:"insight.error"}),"restful");
  assert.equal(rigMoodForEvent({type:"lens.choose"}),"curious");
  assert.equal(rigMoodForEvent({type:"encounter.unknown"}),null);
});

class FakeClassList{
  constructor(){this.items=new Set();}
  remove(x){this.items.delete(x);}
  add(x){this.items.add(x);}
  toggle(x,v){if(v)this.items.add(x);else this.items.delete(x);}
  contains(x){return this.items.has(x);}
}
class FakeObserver{
  static last=null;
  constructor(callback){this.callback=callback;this.disconnected=false;FakeObserver.last=this;}
  observe(node,options){assert.ok(node);assert.deepEqual(options,{subtree:true,childList:true});}
  disconnect(){this.disconnected=true;}
}
function fakeDocument(){
 const svgRoot={id:"lillogoLayeredRig",classList:new FakeClassList()};
 const view={dataset:{rigMood:"idle"},listeners:{},contentDocument:{documentElement:svgRoot},
  addEventListener(name,handler){this.listeners[name]=handler;}};
 const doc={hidden:false,documentElement:{dataset:{}},
  listeners:{},querySelectorAll(selector){assert.equal(selector,"object.yl-logo-v3-rig");return [view];},
  getElementById(name){assert.equal(name,"app");return {};},
  addEventListener(name,handler){this.listeners[name]=handler;}
 };
 return {doc,view,svgRoot};
}
test("one observer consumes real semantic events, cleans up, and pauses hidden tabs",()=>{
 const bus=createEncounterEventBus();
 const {doc,view,svgRoot}=fakeDocument();
 const ctl=createLilLogoRigController(bus,{enabled:true,root:doc,Observer:FakeObserver});
 assert.equal(doc.documentElement.dataset.cz81Preview,"on");
 assert.equal(view.dataset.rigListener,"yes");
 bus.publish("lens.choose",{quoteId:4,source:"ai"});
 assert.equal(svgRoot.classList.contains("state-curious"),true);
 bus.publish("insight.ready",{quoteId:4});
 assert.equal(svgRoot.classList.contains("state-reflective"),true);
 bus.publish("encounter.finish",{saved:false});
 assert.equal(svgRoot.classList.contains("state-reflective"),true);
 bus.publish("encounter.finish",{saved:true});
 assert.equal(svgRoot.classList.contains("state-quietly-delighted"),true);
 doc.hidden=true;doc.listeners.visibilitychange();
 assert.equal(svgRoot.classList.contains("is-paused"),true);
 doc.hidden=false;doc.listeners.visibilitychange();
 assert.equal(svgRoot.classList.contains("is-paused"),false);
 FakeObserver.last.callback([]);
 assert.equal(Object.keys(view.listeners).length,1,"do not accumulate load listeners");
 ctl.dispose();
 assert.equal(FakeObserver.last.disconnected,true);
 assert.equal("cz81Preview" in doc.documentElement.dataset,false);
 assert.equal(bus.publish("lens.choose",{quoteId:5}),0);
});
test("disabled rig never observes DOM or subscribes",()=>{
 const bus=createEncounterEventBus();
 const doc={documentElement:{dataset:{}},querySelectorAll(){throw Error("disabled rig touched DOM")}};
 const ctl=createLilLogoRigController(bus,{enabled:false,root:doc,Observer:FakeObserver});
 ctl.dispose();
 assert.equal(bus.publish("insight.ready",{}),0);
 assert.deepEqual(doc.documentElement.dataset,{});
});
test("integration is behind its own flag, no AI, persistence, or remote asset dependencies",()=>{
 assert.match(app,/createLilLogoRigController\(encounterEvents,\{enabled:CZ81_PREVIEW_ENABLED,root:document\}\)/);
 assert.match(index,/href="\/lillogo-rig-review\.css\?cz81=1"/);
 const controller=readFileSync(new URL("../lillogo-rig-controller.js",import.meta.url),"utf8");
 assert.doesNotMatch(controller+css,/fetch\(|localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|\/api\//);
 assert.doesNotMatch(css,/html\s*\{|body\s*\{/);
});

test("local Encounter companion is purely decorative and gated",()=>{
  const local=readFileSync(new URL("../living-threads.js",import.meta.url),"utf8");
  assert.match(local,/const companion=CZ81_PREVIEW_ENABLED/);
  assert.match(local,/class="yl-living-companion" aria-hidden="true"/);
  assert.match(local,/class="yl-logo-v3-rig"/);
  assert.doesNotMatch(local,/data-ai="pet"/);
  assert.match(css,/\.yl-living-companion/);
});
