// CZ-81 M4 — semantic motion state machine tests for the LilLogo rig controller.
// Deterministic: real CZ80 encounter event bus + mocked DOM/observer only.
// No network, storage, artwork, or earlier-stage test edits.
import {test} from "node:test";
import assert from "node:assert/strict";
import {createEncounterEventBus} from "../encounter-events.js";
import {
  CZ81_PREVIEW_ENABLED,createLilLogoRigController,rigMoodForEvent,canTransitionRig
} from "../lillogo-rig-controller.js";

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
function makeView(mood="idle"){
  const svgRoot={id:"lillogoLayeredRig",classList:new FakeClassList()};
  return {
    dataset:{rigMood:mood},
    listeners:{},
    contentDocument:{documentElement:svgRoot},
    svgRoot,
    addEventListener(name,handler){this.listeners[name]=handler;}
  };
}
function makeDoc(views){
  return {
    hidden:false,
    documentElement:{dataset:{}},
    listeners:{},
    views,
    querySelectorAll(selector){assert.equal(selector,"object.yl-logo-v3-rig");return this.views;},
    getElementById(name){return name==="app"?{}:null;},
    addEventListener(name,handler,options){this.listeners[name]={handler,options};}
  };
}
const moodOf=view=>["idle","curious","reflective","restful","quietly-delighted"]
  .find(state=>view.svgRoot.classList.contains("state-"+state))??null;

test("preview flag stays off outside a flagged browser window",()=>{
  assert.equal(CZ81_PREVIEW_ENABLED,false);
});

test("semantic event map keeps finish saved-only and covers all five moods",()=>{
  assert.equal(rigMoodForEvent({type:"encounter.enter",payload:{}}),"idle");
  assert.equal(rigMoodForEvent({type:"encounter.resume",payload:{}}),"curious");
  assert.equal(rigMoodForEvent({type:"lens.press",payload:{}}),"curious");
  assert.equal(rigMoodForEvent({type:"lens.choose",payload:{}}),"curious");
  assert.equal(rigMoodForEvent({type:"insight.ready",payload:{}}),"reflective");
  assert.equal(rigMoodForEvent({type:"insight.error",payload:{}}),"restful");
  assert.equal(rigMoodForEvent({type:"encounter.finish",payload:{saved:true}}),"quietly-delighted");
  assert.equal(rigMoodForEvent({type:"encounter.finish",payload:{saved:false}}),null);
  assert.equal(rigMoodForEvent({type:"encounter.finish",payload:{}}),null);
  assert.equal(rigMoodForEvent({type:"encounter.finish"}),null);
  assert.equal(rigMoodForEvent({type:"exercise.complete",payload:{}}),null);
  assert.equal(rigMoodForEvent({type:"encounter.unknown",payload:{}}),null);
  assert.equal(rigMoodForEvent(null),null);
});

test("natural transition table: delight holds until a new encounter or renewed attention",()=>{
  assert.equal(canTransitionRig(null,"curious"),true);
  assert.equal(canTransitionRig("idle","idle"),true);
  assert.equal(canTransitionRig("idle","curious"),true);
  assert.equal(canTransitionRig("idle","reflective"),true);
  assert.equal(canTransitionRig("idle","restful"),true);
  assert.equal(canTransitionRig("idle","quietly-delighted"),true);
  assert.equal(canTransitionRig("curious","reflective"),true);
  assert.equal(canTransitionRig("curious","quietly-delighted"),true);
  assert.equal(canTransitionRig("reflective","quietly-delighted"),true);
  assert.equal(canTransitionRig("restful","quietly-delighted"),true,"a deliberate save lands even after an error");
  assert.equal(canTransitionRig("quietly-delighted","idle"),true);
  assert.equal(canTransitionRig("quietly-delighted","curious"),true);
  assert.equal(canTransitionRig("quietly-delighted","reflective"),false);
  assert.equal(canTransitionRig("quietly-delighted","restful"),false);
  assert.equal(canTransitionRig("quietly-delighted","quietly-delighted"),true);
  assert.equal(canTransitionRig("idle","nonsense"),false);
  assert.equal(canTransitionRig("nonsense","idle"),true);
});

test("controller walks natural moods with real bus events and honors saved-only finish",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const doc=makeDoc([view]);
  const ctl=createLilLogoRigController(bus,{enabled:true,root:doc,Observer:FakeObserver});
  assert.equal(doc.documentElement.dataset.cz81Preview,"on");
  assert.equal(moodOf(view),"idle","initial mount falls back to the view's rigMood");
  bus.publish("lens.choose",{quoteId:1,source:"ai",saved:false});
  assert.equal(moodOf(view),"curious");
  bus.publish("insight.ready",{quoteId:1,saved:false});
  assert.equal(moodOf(view),"reflective");
  bus.publish("encounter.finish",{quoteId:1,saved:false});
  assert.equal(moodOf(view),"reflective","unsaved finish must not move the rig");
  bus.publish("insight.error",{quoteId:1});
  assert.equal(moodOf(view),"restful");
  bus.publish("encounter.finish",{quoteId:1,saved:true});
  assert.equal(moodOf(view),"quietly-delighted");
  bus.publish("insight.error",{quoteId:1});
  assert.equal(moodOf(view),"quietly-delighted","stray error never breaks the saved finish");
  bus.publish("insight.ready",{quoteId:1});
  assert.equal(moodOf(view),"quietly-delighted","stray insight never breaks the saved finish");
  bus.publish("lens.press",{quoteId:2});
  assert.equal(moodOf(view),"curious","resumed attention leaves delight naturally");
  bus.publish("encounter.enter",{quoteId:2});
  assert.equal(moodOf(view),"idle","a new encounter resets the rig");
  bus.publish("encounter.resume",{quoteId:2});
  assert.equal(moodOf(view),"curious","explicit resume returns to curiosity");
  ctl.dispose();
});

test("mount and remount never duplicate load listeners or subscriptions",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const doc=makeDoc([view]);
  const ctl=createLilLogoRigController(bus,{enabled:true,root:doc,Observer:FakeObserver});
  assert.equal(view.dataset.rigListener,"yes");
  FakeObserver.last.callback([]);
  FakeObserver.last.callback([]);
  assert.equal(Object.keys(view.listeners).length,1,"repeated scans reuse the one-shot load listener");
  doc.views.splice(0,1);
  FakeObserver.last.callback([]);
  doc.views.push(view);
  FakeObserver.last.callback([]);
  assert.equal(Object.keys(view.listeners).length,1,"remounting the same view adds no listener");
  assert.equal(bus.publish("insight.ready",{}),1,"exactly one live subscription per event type");
  ctl.dispose();
  assert.equal(bus.publish("insight.ready",{}),0);
});

test("unmounted views stop receiving mood updates, mounted ones follow",()=>{
  const bus=createEncounterEventBus();
  const kept=makeView(),removed=makeView();
  const doc=makeDoc([kept,removed]);
  const ctl=createLilLogoRigController(bus,{enabled:true,root:doc,Observer:FakeObserver});
  doc.views.splice(1,1);
  FakeObserver.last.callback([]);
  bus.publish("insight.ready",{});
  assert.equal(moodOf(kept),"reflective");
  assert.equal(moodOf(removed),"idle","unmounted view keeps its last applied mood");
  ctl.dispose();
});

test("visibility and reduced-motion pause motion without changing mood",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const doc=makeDoc([view]);
  let reduced=false;
  const preferenceHandlers=[];
  globalThis.window={
    matchMedia(query){
      assert.equal(query,"(prefers-reduced-motion: reduce)");
      return {get matches(){return reduced;},
        addEventListener(name,handler){preferenceHandlers.push(handler);}};
    }
  };
  try{
    const ctl=createLilLogoRigController(bus,{enabled:true,root:doc,Observer:FakeObserver});
    bus.publish("lens.choose",{});
    assert.equal(moodOf(view),"curious");
    assert.equal(view.svgRoot.classList.contains("is-paused"),false);
    doc.hidden=true;
    doc.listeners.visibilitychange.handler();
    assert.equal(view.svgRoot.classList.contains("is-paused"),true);
    assert.equal(moodOf(view),"curious","pausing never changes the semantic mood");
    doc.hidden=false;
    doc.listeners.visibilitychange.handler();
    assert.equal(view.svgRoot.classList.contains("is-paused"),false);
    reduced=true;
    assert.equal(preferenceHandlers.length,1,"preference listener registered once");
    preferenceHandlers[0]();
    assert.equal(view.svgRoot.classList.contains("is-paused"),true);
    assert.equal(moodOf(view),"curious");
    bus.publish("insight.ready",{});
    assert.equal(view.svgRoot.classList.contains("is-paused"),true,"reduced motion stays paused across moods");
    ctl.dispose();
    assert.equal(doc.listeners.visibilitychange.options.signal.aborted,true);
  }finally{
    delete globalThis.window;
  }
});

test("dispose is idempotent and fully detaches controller wiring",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const doc=makeDoc([view]);
  const ctl=createLilLogoRigController(bus,{enabled:true,root:doc,Observer:FakeObserver});
  bus.publish("lens.choose",{});
  assert.equal(moodOf(view),"curious");
  ctl.dispose();
  ctl.dispose();
  assert.equal(FakeObserver.last.disconnected,true);
  assert.equal(doc.listeners.visibilitychange.options.signal.aborted,true);
  assert.equal("cz81Preview" in doc.documentElement.dataset,false);
  assert.equal(bus.publish("lens.choose",{}),0);
  assert.equal(bus.publish("encounter.finish",{saved:true}),0);
  doc.listeners.visibilitychange.handler();
  assert.equal(moodOf(view),"curious","post-dispose visibility flushes leave views untouched");
});

test("disabled rig is inert: no DOM access, no subscriptions, harmless dispose",()=>{
  const bus=createEncounterEventBus();
  const doc={documentElement:{dataset:{}},querySelectorAll(){throw Error("disabled rig touched DOM")}};
  const ctl=createLilLogoRigController(bus,{enabled:false,root:doc,Observer:FakeObserver});
  ctl.dispose();
  assert.equal(bus.publish("lens.choose",{}),0);
  assert.deepEqual(doc.documentElement.dataset,{});
});

test("enabled rig requires a real bus and stays free of data or network APIs",async()=>{
  const doc=makeDoc([]);
  assert.throws(()=>createLilLogoRigController(null,{enabled:true,root:doc,Observer:FakeObserver}),TypeError);
  assert.throws(()=>createLilLogoRigController({},{enabled:true,root:doc,Observer:FakeObserver}),TypeError);
  const {readFileSync}=await import("node:fs");
  const controller=readFileSync(new URL("../lillogo-rig-controller.js",import.meta.url),"utf8");
  assert.doesNotMatch(controller,/fetch\(|localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|\/api\/|\.save\(/);
  assert.match(controller,/canTransitionRig\(current,mood\)/);
  assert.match(controller,/if\(disposed\)return;/);
});
