// CZ-81 M5 — independent QA gate for the fully scoped M1–M4 animated
// original-art candidate (assets/lillogo-v3-layered-hybrid.svg + AI matte),
// the CZ81 rig controller, and the CZ80 choreography layer that drives it.
//
// Scope: deterministic static guards + mocked-DOM behavioral checks against
// the REAL exported modules only. No browser, no network, no shell, no
// third-party libraries, no edits to production/art sources or earlier tests.
//
// LIMITATION REGISTER — this file never claims:
//  - real iPhone Safari 60fps (static guards are NOT frame-rate evidence);
//  - founder/author-approved character fidelity to the CZ-23 reference;
//  - a visual pass on the provisional M2 neck-underpaint seam.
// Those remain human QA obligations per docs/cz80-cz81-integrated-release-checklist.md
// and are surfaced in test output by the final limitation test below.
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEncounterEventBus,ENCOUNTER_EVENT_TYPES} from "../encounter-events.js";
import {createEncounterChoreography} from "../encounter-choreography.js";
import {
  CZ81_PREVIEW_ENABLED,createLilLogoRigController,rigMoodForEvent,canTransitionRig
} from "../lillogo-rig-controller.js";
import {littleLogoPet} from "../discover-ai-client.js";

const root=new URL("..",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const svg=read("assets/lillogo-v3-layered-hybrid.svg");
const matte=read("assets/lillogo-v3-ai-matte.svg");
const controller=read("lillogo-rig-controller.js");
const choreography=read("encounter-choreography.js");
const reviewCss=read("lillogo-rig-review.css");
const beatCss=read("encounter-choreography.css");
const livingThreads=read("living-threads.js");
const aiClient=read("discover-ai-client.js");
const presence=read("little-logo-presence.js");
const index=read("index.html");
const sw=read("sw.js");
const app=read("app.js");
const MOODS=["idle","curious","reflective","restful","quietly-delighted"];

// ---------------------------------------------------------------------------
// Original-art presence: the approved raster is the single face source, kept
// byte-identical, with the original JPG retained as the no-preview fallback.
// ---------------------------------------------------------------------------
test("approved original raster is embedded exactly once and byte-identical",()=>{
  const payloads=svg.match(/data:image\/jpeg;base64,/g)||[];
  assert.equal(payloads.length,1,"exactly one embedded raster, never re-encoded");
  assert.equal((svg.match(/<image\b/g)||[]).length,1,"no second image element anywhere in the rig");
  const encoded=svg.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/)[1];
  assert.deepEqual(Buffer.from(encoded,"base64"),readFileSync(new URL("little-logo-hd-v2.jpg",root)),
    "embedded portrait must decode to the approved little-logo-hd-v2.jpg bytes");
});

test("the AI matte is pure vector: it isolates the portrait without any new raster",()=>{
  assert.doesNotMatch(matte,/<image\b|data:image\/|base64,/,"matte must not embed or re-encode art");
  assert.doesNotMatch(matte,/<script|foreignObject|onload=|onclick=/,"matte must be inert markup");
  // Matte references only its own internal soft-edge filter (checked by the
  // reference-integrity test below); it never points at network resources.
  assert.doesNotMatch(matte,/(?:href|src)="https?:|url\(https?:|@import/);
});

test("every layered-render site keeps the original JPG as the visible fallback",()=>{
  // Default production avatar: original art, no layered rig markup.
  const defaultHtml=littleLogoPet("idle");
  assert.match(defaultHtml,/little-logo-hd-v2\.jpg/);
  assert.doesNotMatch(defaultHtml,/yl-logo-v3-rig|lillogo-v3-layered-hybrid/);
  // Preview object markup (both mount sites) embeds the same JPG inside the
  // <object> so no-JS / failed SVG loads still show the approved character.
  for(const source of [aiClient,livingThreads]){
    const objectTag=source.match(/<object class="yl-logo-v3-rig"[^>]*>[\s\S]*?<\/object>/);
    assert.ok(objectTag,source===aiClient?"AI avatar object":"local companion object");
    assert.match(objectTag[0],/data="\/assets\/lillogo-v3-layered-hybrid\.svg"/);
    assert.match(objectTag[0],/<img src="\/little-logo-hd-v2\.jpg"[^>]*>/);
  }
  assert.match(livingThreads,/const companion=CZ81_PREVIEW_ENABLED\?/,"companion is preview-gated");
  assert.match(livingThreads,/class="yl-living-companion" aria-hidden="true"/,"companion is decorative");
  // Legacy ambient controller stays silent in layered review mode so the two
  // motion systems never double-drive the character.
  assert.match(presence,/if\(layeredReview\)return;/);
});

// ---------------------------------------------------------------------------
// Internal SVG reference integrity: every url(#…)/href="#…"/aria reference
// resolves inside its own document; no duplicate ids; no dangling states.
// ---------------------------------------------------------------------------
function assertReferenceIntegrity(docText,label){
  const ids=[...docText.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,label+": duplicate ids would break layering");
  const idSet=new Set(ids);
  const refs=[
    ...[...docText.matchAll(/url\(#([^)]+)\)/g)].map(m=>m[1]),
    ...[...docText.matchAll(/href="#([^"]+)"/g)].map(m=>m[1])
  ];
  const labelled=docText.match(/aria-labelledby="([^"]+)"/);
  if(labelled)refs.push(...labelled[1].trim().split(/\s+/));
  assert.ok(refs.length>0,label+": expected at least one internal reference");
  for(const ref of refs)assert.ok(idSet.has(ref),label+": dangling internal reference #"+ref);
  return idSet;
}
test("all internal SVG references resolve and layering ids are present",()=>{
  const hybridIds=assertReferenceIntegrity(svg,"layered hybrid");
  for(const id of ["originalPortrait","headGeometry","forelockGeometry","headClip","forelockClip",
    "underpaintClip","softUnderpaint","eyeClip","eyeRemoval","eyeSkin","bodyHeadKnockout",
    "bodyBase","neckUnderpaint","headRig","eyeBackground","eyeRig","eyelids","hairRig"])
    assert.ok(hybridIds.has(id),"missing layer or mask #"+id);
  assertReferenceIntegrity(matte,"AI matte");
  assert.match(svg,/<svg[^>]*id="lillogoLayeredRig" class="state-idle"/,
    "rig root must boot in the idle state");
});

test("controller mood vocabulary and SVG state classes are the same five moods",()=>{
  const validBlock=controller.match(/const VALID=new Set\(\[([^\]]+)\]\)/)[1];
  const valid=[...validBlock.matchAll(/"([\w-]+)"/g)].map(m=>m[1]);
  assert.deepEqual([...valid].sort(),[...MOODS].sort(),"controller VALID set drifted from the art");
  const svgStates=[...new Set([...svg.matchAll(/#lillogoLayeredRig(?:\.state-([\w-]+)|\.state-([\w-]+):not)/g)]
    .map(m=>m[1]||m[2]))];
  for(const mood of MOODS)
    assert.ok(svg.includes("state-"+mood),"SVG has no class for controller mood "+mood);
  assert.ok(svgStates.length>=4,"state-scoped rules must exist for the non-idle moods");
  assert.doesNotMatch(svg,/state-(?!idle\b|curious\b|reflective\b|restful\b|quietly-delighted\b)[\w-]+/,
    "art defines a state the controller cannot produce");
});

// ---------------------------------------------------------------------------
// Semantic saved-only completion: only a persisted finish completes, on BOTH
// presentation layers at once, with strict ===true payload semantics.
// ---------------------------------------------------------------------------
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
  return {dataset:{rigMood:mood},listeners:{},contentDocument:{documentElement:svgRoot},svgRoot,
    addEventListener(name,handler){this.listeners[name]=handler;}};
}
function makeRoot({views,sheet=null,stage=null}={}){
  return {
    hidden:false,documentElement:{dataset:{}},listeners:{},views,sheet,stage,
    querySelectorAll(selector){assert.equal(selector,"object.yl-logo-v3-rig");return this.views;},
    querySelector(selector){
      if(selector===".discover-sheet")return this.sheet;
      if(selector===".stage")return this.stage;
      return null;
    },
    getElementById(name){return name==="app"?{}:null;},
    addEventListener(name,handler,options){this.listeners[name]={handler,options};}
  };
}
const moodOf=view=>MOODS.find(state=>view.svgRoot.classList.contains("state-"+state))??null;

test("completion is saved-only and identical across rig and choreography layers",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const sheet={dataset:{}},stage={dataset:{}};
  const dom=makeRoot({views:[view],sheet,stage});
  const rig=createLilLogoRigController(bus,{enabled:true,root:dom,Observer:FakeObserver});
  const ch=createEncounterChoreography(bus,{enabled:true,root:dom});
  assert.equal(dom.documentElement.dataset.cz81Preview,"on");
  assert.equal(dom.documentElement.dataset.cz80Preview,"on");
  // A truthy-but-not-true payload must NOT complete: persistence is strict.
  bus.publish("encounter.finish",{saved:1});
  bus.publish("encounter.finish",{saved:"yes"});
  bus.publish("encounter.finish",{});
  assert.equal(moodOf(view),"idle","non-strict saved values never complete the rig");
  assert.deepEqual(sheet.dataset,{},"non-strict saved values never fire the beat");
  // Real path: choice -> insight -> unsaved finish is ignored by both layers.
  assert.equal(bus.publish("lens.choose",{quoteId:3,source:"ai"}),2,"both layers consume the same event");
  assert.equal(moodOf(view),"curious");
  assert.equal(sheet.dataset.cz80Beat,"choice");
  bus.publish("insight.ready",{quoteId:3});
  assert.equal(moodOf(view),"reflective");
  bus.publish("encounter.finish",{quoteId:3,saved:false});
  assert.equal(moodOf(view),"reflective","unsaved finish must not move the rig");
  assert.equal(sheet.dataset.cz80Beat,"insight","unsaved finish must not move the beat");
  // Error is an error on both layers, never a celebration.
  bus.publish("insight.error",{quoteId:3});
  assert.equal(moodOf(view),"restful");
  assert.equal(sheet.dataset.cz80Beat,"error");
  // Only the explicit persisted save completes both layers.
  bus.publish("encounter.finish",{quoteId:3,saved:true});
  assert.equal(moodOf(view),"quietly-delighted");
  assert.equal(sheet.dataset.cz80Beat,"finish");
  rig.dispose();ch.dispose();
});

test("saved finish reaches the stage fallback when the sheet is already gone",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const stage={dataset:{}};
  const dom=makeRoot({views:[view],sheet:null,stage});
  const rig=createLilLogoRigController(bus,{enabled:true,root:dom,Observer:FakeObserver});
  const ch=createEncounterChoreography(bus,{enabled:true,root:dom});
  bus.publish("encounter.finish",{saved:true});
  assert.equal(stage.dataset.cz80Beat,"finish","AI save navigates to My World; the stage takes the arrival beat");
  assert.equal(moodOf(view),"quietly-delighted");
  // The stage arrival is deliberately a short soft-appear settle, never the
  // sheet's celebration phrase: it must not reuse cz80-quiet-finish and must
  // stay sub-half-second, and reduced motion removes it entirely.
  const stageRule=beatCss.match(/\.stage\[data-cz80-beat="finish"\]\{([^}]*)\}/);
  assert.ok(stageRule,"stage finish beat is styled");
  assert.doesNotMatch(stageRule[1],/cz80-quiet-finish/,
    "arrival beat never reuses the sheet celebration keyframes");
  const stageAnim=stageRule[1].match(/animation:\S+\s+([\d.]+)s/);
  assert.ok(stageAnim&&parseFloat(stageAnim[1])<=.5,
    "arrival beat stays restrained (sub-half-second settle, not a celebration)");
  assert.match(beatCss,
    /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.stage\[data-cz80-beat="finish"\]\{[^}]*animation:none!important/,
    "reduced motion removes the stage arrival animation");
  rig.dispose();ch.dispose();
});

// ---------------------------------------------------------------------------
// Event–state transition consistency: the controller applies exactly what the
// pure mood contract dictates for every bus event type, and both layers'
// event vocabularies stay inside the frozen semantic type list.
// ---------------------------------------------------------------------------
test("both layers subscribe only to frozen semantic event types",()=>{
  const busTypes=new Set(ENCOUNTER_EVENT_TYPES);
  const beatBlock=controller.match(/const BEAT_TO_MOOD=\{([\s\S]*?)\n\};/)[1];
  const rigPairs=[...beatBlock.matchAll(/"([\w.]+)":"([\w-]+)"/g)].map(m=>[m[1],m[2]]);
  const beatPairs=[...choreography.matchAll(/"([\w.]+)":"([\w-]+)"/g)].map(m=>[m[1],m[2]]);
  assert.equal(rigPairs.length,7,"rig maps 7 event types");
  assert.equal(beatPairs.length,9,"choreography maps all 9 event types");
  for(const [type]of rigPairs)assert.ok(busTypes.has(type),"rig maps unknown event "+type);
  for(const [type]of beatPairs)assert.ok(busTypes.has(type),"choreography maps unknown event "+type);
  assert.deepEqual(new Set(beatPairs.map(([t])=>t)),busTypes,"choreography covers the full vocabulary");
  for(const [,mood]of rigPairs)assert.ok(MOODS.includes(mood),"rig maps to unknown mood "+mood);
  // Both layers gate completion on the same strict payload check.
  assert.match(controller,/event\?\.payload\?\.saved!==true/);
  assert.match(choreography,/event\?\.payload\?\.saved!==true/);
});

test("controller DOM output equals the pure contract for a deterministic event script",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const dom=makeRoot({views:[view],sheet:{dataset:{}},stage:{dataset:{}}});
  const ctl=createLilLogoRigController(bus,{enabled:true,root:dom,Observer:FakeObserver});
  const script=[
    ["lens.choose",{}],["insight.ready",{}],["encounter.finish",{saved:false}],
    ["insight.error",{}],["encounter.finish",{saved:true}],["insight.ready",{}],
    ["insight.error",{}],["encounter.resume",{}],["encounter.enter",{}],
    ["lens.press",{}],["exercise.complete",{}],["exercise.place",{}]
  ];
  let expected=null;
  for(const [type,payload] of script){
    const mood=rigMoodForEvent({type,payload});
    if(mood&&canTransitionRig(expected,mood))expected=mood;
    bus.publish(type,payload);
    assert.equal(moodOf(view),expected,
      type+" applied a mood the pure contract forbids (expected "+expected+")");
  }
  assert.equal(moodOf(view),"curious","exercise events never hijack the character mood");
  ctl.dispose();
});

// ---------------------------------------------------------------------------
// Teardown, hidden tab, and reduced motion: pausing never changes mood, and
// dispose removes every wire without re-touching views afterwards.
// ---------------------------------------------------------------------------
test("hidden tab and reduced-motion preference pause motion, never mood",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const dom=makeRoot({views:[view]});
  let reduced=false;
  const preferenceHandlers=[];
  globalThis.window={matchMedia(query){
    assert.equal(query,"(prefers-reduced-motion: reduce)");
    return {get matches(){return reduced;},
      addEventListener(name,handler){assert.equal(name,"change");preferenceHandlers.push(handler);}};
  }};
  try{
    const ctl=createLilLogoRigController(bus,{enabled:true,root:dom,Observer:FakeObserver});
    bus.publish("lens.choose",{});
    assert.equal(moodOf(view),"curious");
    assert.equal(view.svgRoot.classList.contains("is-paused"),false);
    dom.hidden=true;dom.listeners.visibilitychange.handler();
    assert.equal(view.svgRoot.classList.contains("is-paused"),true);
    assert.equal(moodOf(view),"curious","pausing must not change the semantic mood");
    dom.hidden=false;dom.listeners.visibilitychange.handler();
    assert.equal(view.svgRoot.classList.contains("is-paused"),false);
    reduced=true;
    assert.equal(preferenceHandlers.length,1);
    preferenceHandlers[0]();
    assert.equal(view.svgRoot.classList.contains("is-paused"),true,"reduced motion pauses autonomously");
    bus.publish("insight.ready",{});
    assert.equal(view.svgRoot.classList.contains("is-paused"),true);
    assert.equal(moodOf(view),"reflective");
    ctl.dispose();
  }finally{
    delete globalThis.window;
  }
  // CSS half of the pause contract: is-paused freezes all animation and the
  // media query removes it entirely with a static open eye.
  assert.match(svg,/#lillogoLayeredRig\.is-paused \*\{animation-play-state:paused!important\}/);
  assert.match(svg,/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?animation:none!important/);
  assert.match(svg,/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?#eyelids\{transform:scaleY\(0\)!important\}/);
});

test("dispose is total and idempotent: observer, listeners, flag, subscriptions",()=>{
  const bus=createEncounterEventBus();
  const view=makeView();
  const dom=makeRoot({views:[view]});
  const ctl=createLilLogoRigController(bus,{enabled:true,root:dom,Observer:FakeObserver});
  bus.publish("lens.choose",{});
  ctl.dispose();
  ctl.dispose();
  assert.equal(FakeObserver.last.disconnected,true,"mutation observer disconnected");
  assert.equal(dom.listeners.visibilitychange.options.signal.aborted,true,"DOM listener aborted");
  assert.equal("cz81Preview" in dom.documentElement.dataset,false,"preview flag removed");
  assert.equal(bus.publish("lens.choose",{}),0,"all bus subscriptions removed");
  assert.equal(bus.publish("encounter.finish",{saved:true}),0);
  dom.listeners.visibilitychange.handler();
  assert.equal(moodOf(view),"curious","post-dispose flush must not re-apply moods");
  FakeObserver.last.callback([]);
  assert.equal(moodOf(view),"curious","post-dispose scan must stay inert");
});

// ---------------------------------------------------------------------------
// No unexpected fetch / network / third-party dependencies anywhere in the
// animated-art path (controller, review CSS, both SVGs, mount sites, shell).
// ---------------------------------------------------------------------------
test("animated-art path is free of network, storage, and third-party calls",()=>{
  const code=controller+choreography+reviewCss;
  assert.doesNotMatch(code,
    /fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|import\(|localStorage|sessionStorage|indexedDB|\/api\//);
  for(const [label,text]of [["hybrid SVG",svg],["AI matte",matte]]){
    assert.doesNotMatch(text,/<script|foreignObject|on\w+=/i,label+" must not carry executable markup");
    assert.doesNotMatch(text,/(?:href|src)="https?:|url\(https?:|@import/,
      label+" must not reference remote resources (xmlns namespaces are identifiers, not fetches)");
    assert.doesNotMatch(text,/xlink:href=/,label+" must use plain same-document href");
  }
  // Namespace identifiers are expected and are NOT network dependencies.
  assert.match(svg,/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  // The review stylesheet touches only preview-gated selectors — never global
  // html/body — and adds no font or remote fetch of its own.
  assert.doesNotMatch(reviewCss,/@import|@font-face|url\(https?:|fonts\./);
  // Comments are documentation, not selectors: strip them (plus the reduced-
  // motion block) so each remaining rule's selector can be checked on its own.
  const mediaFree=reviewCss
    .replace(/@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\n\}\n?/g,"")
    .replace(/\/\*[\s\S]*?\*\//g,"");
  for(const rule of mediaFree.split("}")){
    const selector=rule.slice(0,rule.indexOf("{")).trim();
    if(selector)assert.ok(selector.startsWith("html[data-cz81-preview=\"on\"]"),
      "unpreviewed selector leaks outside the review flag: "+selector);
  }
  // Offline availability is precached, so animation needs no runtime fetch.
  assert.equal(CZ81_PREVIEW_ENABLED,false,"flag stays off in Node and normal loads");
  for(const p of ["/assets/lillogo-v3-layered-hybrid.svg","/assets/lillogo-v3-ai-matte.svg",
    "/little-logo-hd-v2.jpg","/lillogo-rig-controller.js","/lillogo-rig-review.css",
    "/encounter-choreography.js","/encounter-choreography.css"])
    assert.ok(sw.includes('"'+p+'"'),"service worker precache missing "+p);
  assert.match(index,/href="\/lillogo-rig-review\.css\?cz81=1"/);
  assert.match(index,/href="\/encounter-choreography\.css\?cz80=1"/);
  assert.match(app,/createLilLogoRigController\(encounterEvents,\{enabled:CZ81_PREVIEW_ENABLED,root:document\}\)/);
  assert.match(app,/createEncounterChoreography\(encounterEvents,\{enabled:CZ80_PREVIEW_ENABLED,root:document\}\)/);
});

// ---------------------------------------------------------------------------
// Bounded STATIC performance guards. These bound the cost shape of the
// animation (declarative-only, few slow phrases, small amplitudes). They are
// NOT frame-rate evidence: real iPhone Safari 60fps remains unverified here.
// ---------------------------------------------------------------------------
test("static performance guards: declarative-only, few slow phrases, small amplitudes (NOT 60fps proof)",()=>{
  // No JS timer/frame polling in either layer: all motion is declarative CSS.
  assert.doesNotMatch(controller,/setInterval|setTimeout|requestAnimationFrame/,
    "rig controller must not schedule JS timers/frames");
  assert.doesNotMatch(choreography,/setInterval|setTimeout|requestAnimationFrame/,
    "choreography must not schedule JS timers/frames");
  // Exactly three keyframed phrases, all slow (>=10s), all infinite — no
  // rapid loops; and exactly three animation declarations applying them.
  const keyframeNames=[...new Set([...svg.matchAll(/@keyframes\s+(\w+)/g)].map(m=>m[1]))];
  assert.deepEqual([...keyframeNames].sort(),["forelockFollow","microGaze","quietBlink"]);
  const animationDecls=[...svg.matchAll(/animation:(\w+)\s+([\d.]+)s/g)];
  assert.equal(animationDecls.length,3,"one declaration per phrase, no hidden extra loops");
  for(const [,name,duration]of animationDecls){
    assert.ok(parseFloat(duration)>=10,name+" runs a slow phrase ("+duration+"s), not a fast loop");
  }
  // Transform transitions stay sub-second so state changes feel alive but bounded.
  const transitions=[...svg.matchAll(/transition(?:-duration)?:[^;}]*?([\d.]+)s/g)].map(m=>parseFloat(m[1]));
  assert.ok(transitions.length>=3,"layer transitions declared");
  for(const seconds of transitions)assert.ok(seconds>0&&seconds<=1,"transition "+seconds+"s outside (0,1s] bound");
  // Amplitude budget re-check at the QA gate: head <=3deg, gaze <=2px,
  // micro-drift and forelock sway <=.6 units. Geometry-only, not a visual pass.
  const headTilts=[...svg.matchAll(/state-[\w-]+ #headRig\{[^}]*rotate\((-?[\d.]+)deg/g)].map(m=>Math.abs(parseFloat(m[1])));
  assert.ok(headTilts.length>=4&&headTilts.every(deg=>deg>=1&&deg<=3),"head tilt budget violated");
  const gazeOffsets=[...svg.matchAll(/--gaze-[xy]:(-?[\d.]+)px/g)].map(m=>Math.abs(parseFloat(m[1])));
  assert.ok(gazeOffsets.length===6&&gazeOffsets.every(px=>px<=2),"gaze offset budget violated");
  const microOffsets=[...svg.matchAll(/--micro-[xy]:(-?[\d.]+)px/g)].map(m=>Math.abs(parseFloat(m[1])));
  assert.ok(microOffsets.length>0&&microOffsets.every(px=>px<=.6),"micro-drift budget violated");
  const swayOffsets=[...svg.matchAll(/--hair-sway:\s*(-?[\d.]+)deg/g)].map(m=>Math.abs(parseFloat(m[1])));
  assert.ok(swayOffsets.length>0&&swayOffsets.every(deg=>deg<=.6),"forelock sway budget violated");
});

test("LIMITATION REGISTER: provisional art seam and unverified human QA stay explicit",()=>{
  // The M2 neck underpaint is a documented approximation. Its mitigation
  // guards must be present (blur + darkening matrix + full silhouette clip),
  // and the artifact itself must keep carrying the human-review disclosure —
  // otherwise this QA gate would be silently certifying a visual claim.
  assert.match(svg,/<filter id="softUnderpaint"/);
  assert.match(svg,/feGaussianBlur stdDeviation="2\.2"\/>/);
  assert.match(svg,/<feColorMatrix type="matrix" values="[^"]+"\/>/);
  assert.match(svg,/id="underpaintClip"/);
  assert.match(svg,/LIMIT: the flattened source cannot provide the true occluded backdrop/);
  assert.match(svg,/Founder art review required/);
  console.warn("[CZ81-M5-QA] LIMITATION: the M2 neck-underpaint seam is a shadow-toned " +
    "approximation; no automated test here certifies it looks right on a real device.");
  console.warn("[CZ81-M5-QA] LIMITATION: founder side-by-side comparison against the CZ-23 " +
    "approved art (idle, curious, reflective, saved) is still required; regex/geometry " +
    "guards cannot approve character fidelity.");
  console.warn("[CZ81-M5-QA] LIMITATION: static performance guards bound cost shape only; " +
    "real iPhone Safari 60fps, thermal behavior, and VoiceOver remain unverified by CI.");
});
