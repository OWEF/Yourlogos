import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

// This project intentionally uses no browser-framework dependency.
// Exercise the onboarding event/state machine with small DOM and auth doubles.
const source=readFileSync(new URL("../onboarding.js",import.meta.url),"utf8")
 .replace(/^import\s+\{[^}]+\}\s+from\s+["'][^"']+["'];?\s*$/gm,"");

function harness({saved={},signedIn=false}={}){
 const storage=new Map(Object.entries(saved));
 const calls=[],handlers={},rootHandlers={};
 const classNames=new Set();
 const root={hidden:true,innerHTML:"",
   setAttribute(name,value){this[name]=value},
   removeAttribute(name){delete this[name]},
   replaceChildren(){this.innerHTML=""},
   addEventListener(name,fn){rootHandlers[name]=fn}};
 const slider={inert:false,setAttribute(){this.inert=true},removeAttribute(){this.inert=false}};
 const app={inert:false,setAttribute(){this.inert=true},removeAttribute(){this.inert=false}};
 class Clickable{constructor(dataset){this.dataset=dataset}closest(selector){return selector==="button"?this:null}}
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const window={addEventListener:(name,fn)=>{handlers[name]=fn},dispatchEvent:event=>{calls.push(event);handlers[event.type]?.(event)}};
 const context={
  document:{readyState:"complete",getElementById:id=>({"yl-onboarding":root,"yl-entrance":slider,app})[id]||null,
    body:{classList:{add:c=>classNames.add(c),remove:c=>classNames.delete(c)}}},
  localStorage,window,Element:Clickable,location:{search:""},URLSearchParams,FormData,
  CustomEvent:class{constructor(type,{detail}={}){this.type=type;this.detail=detail}},
  Event:class{constructor(type){this.type=type}},
  AUTH_ENABLED:signedIn,getVerifiedIdentity:async()=>signedIn?{id:"verified",email:"verified@example.test"}:null,
  requestMagicLink:async()=>{},console
 };
 runInNewContext(source,context,{filename:"onboarding.js"});
 return {storage,root,slider,app,calls,handlers,rootHandlers,
  click:dataset=>rootHandlers.click({target:new Clickable(dataset)}),
  replay:()=>window.dispatchEvent(new context.Event("yourlogos:onboarding-replay")),
  events:type=>calls.filter(x=>x.type===type)};
}

test("new user sees approved invitation and can complete the two-signal flow",()=>{
 const h=harness();
 assert.equal(h.root.hidden,false);
 assert.match(h.root.innerHTML,/A world of ideas/);
 assert.match(h.root.innerHTML,/Get started/);
 assert.match(h.root.innerHTML,/Already have an account/);
 assert.match(h.root.innerHTML,/yl-v2-cover-media/);
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/PHILOSOPHER/);
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/Truth & knowledge/);
 assert.match(h.root.innerHTML,/yl-v2-topic-art/);
 h.click({topic:"knowledge"});
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/What would you consider first/);
 h.click({reason:"facts"});
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/René Descartes/);
 h.click({step:"next"});
 const state=JSON.parse(h.storage.get("yourlogos_web_v1"));
 assert.equal(state.personalization.status,"completed");
 assert.equal(state.personalization.answers.concerns[0],"uncertainty");
 assert.equal(state.personalization.answers.approach,"facts");
 assert.equal(state.personalization.startingPoint.reason,"facts");
 assert.equal(h.storage.get("yourlogos-introduction-v1"),"done");
 assert.equal(h.root.hidden,true);
 assert.equal(h.events("yourlogos:onboarding-complete").length,1);
 assert.equal(h.events("yourlogos:skip-entrance").length,0);
});

test("returning guest skips introduction; QA replay is non-destructive",()=>{
 const profile={version:1,status:"completed",answers:{concerns:["direction"],approach:"reflect"}};
 const value=JSON.stringify({personalization:profile,saved:[1,2,3]});
 const h=harness({saved:{"yourlogos_web_v1":value,"yourlogos-introduction-v1":"done"}});
 assert.equal(h.root.hidden,true);
 h.replay();
 assert.equal(h.root.hidden,false);
 assert.match(h.root.innerHTML,/Get started/);
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/PHILOSOPHER/);
 h.click({step:"next"});
 h.click({topic:"ethics"});
 h.click({step:"next"});
 h.click({reason:"principles"});
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/Marcus Aurelius/);
 h.click({step:"next"});
 assert.equal(h.root.hidden,true);
 assert.equal(h.storage.get("yourlogos_web_v1"),value);
 assert.equal(h.events("yourlogos:onboarding-complete").length,0);
});

test("QA can cancel without losing previous data",()=>{
 const value=JSON.stringify({saved:[5],localName:"Guest"});
 const h=harness({saved:{"yourlogos_web_v1":value}});
 h.replay();h.click({step:"skip"});
 assert.equal(h.root.hidden,true);
 assert.equal(h.storage.get("yourlogos_web_v1"),value);
});

test("returning verified email identity can bypass the first visit",async()=>{
 const h=harness({signedIn:true});
 assert.equal(h.root.hidden,false);
 await Promise.resolve();await Promise.resolve();
 assert.equal(h.root.hidden,true);
 assert.equal(h.events("yourlogos:skip-entrance").length,0);
 assert.equal(h.storage.get("yourlogos-introduction-v1"),undefined);
});

test("legacy daily arrival also counts as a returning guest",()=>{
 const h=harness({saved:{"yourlogos-daily-ritual-v1":"2026-11-06"}});
 assert.equal(h.root.hidden,true);
 assert.equal(h.events("yourlogos:onboarding-complete").length,0);
});

test("developer preview uses no credentials, persists, and offers non-destructive replay",()=>{
 const first=harness();
 first.click({step:"signin"});
 assert.match(first.root.innerHTML,/Enter developer preview/);
 first.click({step:"developer-preview"});
 assert.equal(first.root.hidden,true);
 assert.equal(first.storage.get("yourlogos-developer-preview-v1"),"on");
 assert.equal(first.storage.get("yourlogos-introduction-v1"),"done");
 assert.equal(first.events("yourlogos:skip-entrance").length,0);
 // It must not manufacture a verified identity or a personalization report.
 assert.equal(first.events("yourlogos:onboarding-complete").length,0);
 const again=harness({saved:Object.fromEntries(first.storage)});
 assert.equal(again.root.hidden,true);
 assert.equal(again.events("yourlogos:skip-entrance").length,0);
 const original=again.storage.get("yourlogos-introduction-v1");
 again.replay();
 assert.equal(again.root.hidden,false);
 again.click({step:"skip"});
 assert.equal(again.root.hidden,true);
 assert.equal(again.storage.get("yourlogos-introduction-v1"),original);
 assert.equal(again.storage.get("yourlogos-developer-preview-v1"),"on");
});
test("exit preview opens login without rewriting a saved guest profile",()=>{
 const value=JSON.stringify({saved:[7],personalization:{status:"completed",answers:{concerns:["time"]}}});
 const h=harness({saved:{"yourlogos_web_v1":value,"yourlogos-introduction-v1":"done"}});
 h.handlers["yourlogos:developer-signin"]();
 assert.equal(h.root.hidden,false);
 assert.match(h.root.innerHTML,/Welcome back/);
 assert.match(h.root.innerHTML,/Enter developer preview/);
 assert.equal(h.storage.get("yourlogos_web_v1"),value);
 h.click({step:"skip"});
 assert.equal(h.root.hidden,true);
 assert.equal(h.storage.get("yourlogos_web_v1"),value);
});

test("Settings always exposes onboarding replay without query flags or developer state",()=>{
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const start=app.indexOf("function settingsHtml()");
 const end=app.indexOf("function worldBack()",start);
 const settings=app.slice(start,end);
 assert.ok(start>0 && end>start);
 assert.match(settings,/Onboarding & preview/);
 assert.match(settings,/data-action="qa-replay-onboarding"/);
 assert.match(settings,/data-action="developer-preview-enable"/);
 assert.match(settings,/data-action="developer-preview-exit"/);
 assert.doesNotMatch(settings,/\?qa=1/);
 const switchCase=app.slice(app.indexOf('case"qa-replay-onboarding":'),app.indexOf('case"developer-preview-enable":'));
 assert.match(switchCase,/yourlogos:onboarding-replay/);
 assert.doesNotMatch(switchCase,/if\(/);
});

test("new cover leads back to itself and is non-destructive in replay",()=>{
 const value=JSON.stringify({saved:[9],personalization:{status:"completed",answers:{concerns:["direction"]}}});
 const h=harness({saved:{"yourlogos_web_v1":value}});
 h.replay();
 assert.match(h.root.innerHTML,/Get started/);
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/PHILOSOPHER/);
 h.click({step:"back"});
 assert.match(h.root.innerHTML,/A world of ideas/);
 h.click({step:"skip"});
 assert.equal(h.root.hidden,true);
 assert.equal(h.storage.get("yourlogos_web_v1"),value);
});
test("illustration dominates selections and the decision screen",()=>{
 const h=harness();
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/yl-v2-first-picture/);
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/yl-v2-illustrated-options/);
 assert.match(h.root.innerHTML,/yl-v2-topic-art/);
 h.click({topic:"identity"});
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/yl-v2-small-picture/);
 assert.match(h.root.innerHTML,/\/api\/school-art\/existentialism/);
});

test("selected topic artwork follows the choice into instinct and result",()=>{
 const cases=[
  {topic:"identity",asset:"existentialism",label:"SELF & IDENTITY"},
  {topic:"knowledge",asset:"socrates",label:"TRUTH & KNOWLEDGE"},
  {topic:"ethics",asset:"marcus_full",label:"ETHICS & ACTION"}
 ];
 for(const row of cases){
  const h=harness();
  h.click({step:"next"});h.click({step:"next"});
  assert.match(h.root.innerHTML,new RegExp("/api/school-art/"+row.asset));
  h.click({topic:row.topic});
  h.click({step:"next"});
  assert.match(h.root.innerHTML,new RegExp("/api/school-art/"+row.asset));
  assert.ok(h.root.innerHTML.includes(row.label.replace("&","&amp;")),"Instinct picture label "+row.topic);
  h.click({reason:"facts"});h.click({step:"next"});
  assert.match(h.root.innerHTML,new RegExp("/api/school-art/"+row.asset));
  assert.ok(h.root.innerHTML.includes(row.label.replace("&","&amp;")),"Result picture label "+row.topic);
 }
});
test("Waterline glass controls are present across onboarding screens",()=>{
 const css=readFileSync(new URL("../onboarding.css",import.meta.url),"utf8");
 assert.match(css,/\.yl-v2-action::before/);
 assert.match(css,/\.yl-v2-glass-panel/);
 assert.match(css,/\.yl-v2-topic-card\.selected/);
 assert.match(css,/backdrop-filter:blur/);
 const h=harness();
 assert.match(h.root.innerHTML,/yl-v2-liquid-glass/);
 h.click({step:"next"});assert.match(h.root.innerHTML,/yl-v2-glass-panel/);
 h.click({step:"next"});assert.match(h.root.innerHTML,/yl-v2-glass-panel/);
 h.click({topic:"knowledge"});h.click({step:"next"});
 assert.match(h.root.innerHTML,/yl-v2-liquid-glass/);
});
test("each launch retains the original entrance slider for returning users",()=>{
 const welcome=readFileSync(new URL("../welcome.js",import.meta.url),"utf8");
 assert.doesNotMatch(welcome,/getItem\(completedKey\)===dailyDate/);
 assert.doesNotMatch(welcome,/getItem\("yourlogos-developer-preview-v1"\)/);
 assert.match(welcome,/if\(firstArrivalToday\)window\.dispatchEvent/);
 const user=harness({saved:{"yourlogos-introduction-v1":"done"}});
 assert.equal(user.root.hidden,true);
 assert.equal(user.events("yourlogos:skip-entrance").length,0);
 const dev=harness({saved:{"yourlogos-developer-preview-v1":"on","yourlogos-introduction-v1":"done"}});
 assert.equal(dev.root.hidden,true);
 assert.equal(dev.events("yourlogos:skip-entrance").length,0);
});
