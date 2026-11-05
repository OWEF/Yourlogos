import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEncounterEventBus} from "../encounter-events.js";
import {
  CZ80_PREVIEW_ENABLED,livingTransitionEvents,createEncounterChoreography
} from "../encounter-choreography.js";

const source=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../encounter-choreography.css",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("preview flag is off on Node and normal app loads",()=>{
  assert.equal(CZ80_PREVIEW_ENABLED,false);
  const js=readFileSync(new URL("../encounter-choreography.js",import.meta.url),"utf8");
  assert.match(js,/new URLSearchParams\(window\.location\.search\)\.get\("cz80"\)==="preview"/);
  assert.match(html,/href="\/encounter-choreography\.css\?cz80=1"/);
  assert.match(css,/html\[data-cz80-preview="on"\]/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/\bbody\s*\{|\bhtml\s*\{/);
});

test("local finite state determines events, visual animations do not",()=>{
  const focus={phase:"focus"},mirror={phase:"mirror"},response={phase:"response"};
  assert.deepEqual(livingTransitionEvents(focus,mirror,"focus:freedom"),["lens.choose"]);
  assert.deepEqual(livingTransitionEvents(focus,mirror,"own-voice"),["lens.choose"]);
  assert.deepEqual(livingTransitionEvents(mirror,response,"close"),["insight.ready"]);
  assert.deepEqual(livingTransitionEvents(response,{phase:"reflection"},"continue"),["insight.ready"]);
  assert.deepEqual(livingTransitionEvents({phase:"reflection"},{phase:"summary"},"carry"),["insight.ready"]);
  assert.deepEqual(livingTransitionEvents({phase:"summary"},{phase:"done",carried:true},"save"),["encounter.finish"]);
  assert.deepEqual(livingTransitionEvents({phase:"summary"},{phase:"done",carried:false},"save"),[]);
  assert.deepEqual(livingTransitionEvents(focus,focus,"focus:freedom"),[]);
  assert.deepEqual(livingTransitionEvents(mirror,mirror,"close"),[]);
  assert.deepEqual(livingTransitionEvents(focus,mirror,"invalid-choice"),[]);
  assert.deepEqual(livingTransitionEvents({phase:"done"},{phase:"focus"},"reconsider"),["encounter.resume"]);
  assert.deepEqual(livingTransitionEvents(null,mirror,"focus:freedom"),[]);
});

test("disabled presenter neither subscribes nor changes DOM",()=>{
  const bus=createEncounterEventBus();
  const root={documentElement:{dataset:{}},querySelector(){throw Error("unexpected DOM access")}};
  const c=createEncounterChoreography(bus,{enabled:false,root});
  assert.equal(bus.publish("lens.choose",{quoteId:3}),0);
  c.dispose();
  assert.deepEqual(root.documentElement.dataset,{});
});

test("enabled presenter emits ephemeral visual cues but never saves data",()=>{
  const bus=createEncounterEventBus(),sheet={dataset:{}},root={
    documentElement:{dataset:{}},
    querySelector(q){assert.equal(q,".discover-sheet");return sheet;}
  };
  const c=createEncounterChoreography(bus,{enabled:true,root});
  assert.equal(root.documentElement.dataset.cz80Preview,"on");
  assert.equal(bus.publish("lens.choose",{quoteId:7,saved:false}),1);
  assert.equal(sheet.dataset.cz80Beat,"choice");
  bus.publish("insight.error",{quoteId:7});
  assert.equal(sheet.dataset.cz80Beat,"error");
  bus.publish("encounter.finish",{quoteId:7,saved:true});
  assert.equal(sheet.dataset.cz80Beat,"finish");
  c.dispose();
  assert.equal(bus.publish("lens.choose",{}),0);
  assert.equal("cz80Preview" in root.documentElement.dataset,false);
});

test("render-before-feedback ordering follows real authority for both local and AI",()=>{
  const local=source.indexOf("const liveEvents=livingTransitionEvents(current,next,action)");
  const saved=source.indexOf("if(next.phase===\"done\")data.livingThreads.history=archiveLiving",local);
  const persisted=source.indexOf("persist();haptic(\"selection\");playEncounterTone(\"choose\");render();",saved);
  const emitted=source.indexOf("for(const type of liveEvents)emitEncounter(type",persisted);
  assert.ok(local>0&&saved>local&&persisted>saved&&emitted>persisted);
  const aiSave=source.indexOf('if(action==="save"){');
  const summary=source.indexOf("const summary=aiSummary",aiSave);
  const duplicate=source.indexOf("if(aiConversation.saved)",summary);
  const userPersist=source.indexOf("persist();toast(\"Little Logo kept this in My World\")",duplicate);
  const finished=source.indexOf('emitEncounter("encounter.finish",{quoteId:id,source:"ai",saved:true})',userPersist);
  assert.ok(aiSave>0&&summary>aiSave&&duplicate>summary&&userPersist>duplicate&&finished>userPersist);
  assert.match(source,/emitEncounter\(insightSucceeded\?"insight.ready":"insight.error"/);
  assert.match(source,/emitEncounter\(openingSucceeded\?"insight.ready":"insight.error"/);
});

test("no external dependency or data interception from feedback layer",()=>{
  assert.doesNotMatch(css,/https?:\/\/|@import|fetch\(|localStorage|sessionStorage/);
  const js=readFileSync(new URL("../encounter-choreography.js",import.meta.url),"utf8");
  assert.doesNotMatch(js,/fetch\(|localStorage|sessionStorage|XMLHttpRequest|WebSocket|\.save\(/);
  assert.match(source,/if\(!CZ80_PREVIEW_ENABLED\|\|!discoverOpen/);
});
