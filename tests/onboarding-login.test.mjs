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
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
 const window={addEventListener:(name,fn)=>{handlers[name]=fn},dispatchEvent:event=>{calls.push(event);handlers[event.type]?.(event)}};
 const context={
  document:{getElementById:id=>({"yl-onboarding":root,"yl-entrance":slider,app})[id]||null,
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
 assert.match(h.root.innerHTML,/PHILOSOPHER/);
 assert.match(h.root.innerHTML,/Already have an account/);
 h.click({step:"next"});
 assert.match(h.root.innerHTML,/Truth & knowledge/);
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
 assert.equal(h.events("yourlogos:skip-entrance").length,1);
});

test("returning guest skips introduction; QA replay is non-destructive",()=>{
 const profile={version:1,status:"completed",answers:{concerns:["direction"],approach:"reflect"}};
 const value=JSON.stringify({personalization:profile,saved:[1,2,3]});
 const h=harness({saved:{"yourlogos_web_v1":value,"yourlogos-introduction-v1":"done"}});
 assert.equal(h.root.hidden,true);
 h.replay();
 assert.equal(h.root.hidden,false);
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
 assert.equal(h.events("yourlogos:skip-entrance").length,1);
 assert.equal(h.storage.get("yourlogos-introduction-v1"),undefined);
});

test("legacy daily arrival also counts as a returning guest",()=>{
 const h=harness({saved:{"yourlogos-daily-ritual-v1":"2026-11-06"}});
 assert.equal(h.root.hidden,true);
 assert.equal(h.events("yourlogos:onboarding-complete").length,0);
});
