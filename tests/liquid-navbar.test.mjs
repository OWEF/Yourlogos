import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {attachLiquidNavbar,syncLiquidNavbar} from "../liquid-navbar.js";

const read=name=>fs.readFileSync(new URL("../"+name,import.meta.url),"utf8");
const originalWindow=globalThis.window,originalDocument=globalThis.document;
const originalResize=globalThis.ResizeObserver,originalIntersection=globalThis.IntersectionObserver;
const originalRaf=globalThis.requestAnimationFrame,originalPerformance=globalThis.performance;

function mount({reducedMotion=false}={}){
  let requested=0;
  globalThis.window={devicePixelRatio:2,matchMedia:()=>({matches:reducedMotion})};
  globalThis.document={
    hidden:false,activeElement:null,
    createElement:()=>({
      width:0,height:0,className:"",
      setAttribute(){},
      getContext(){return null}, // Simulate unsupported WebGL on iOS/old browsers.
      addEventListener(){}
    }),
    addEventListener(){}
  };
  globalThis.ResizeObserver=class{observe(){}};
  globalThis.IntersectionObserver=class{constructor(callback){this.callback=callback;}observe(){this.callback([{isIntersecting:true}]);}};
  globalThis.requestAnimationFrame=()=>++requested;
  globalThis.performance={now:()=>300};
  const buttons=[0,1,2].map((n)=>({
    active:n===0,offset:n,
    getBoundingClientRect(){return {left:20+80*n,top:12,width:64,height:48}},
    focus(){document.activeElement=this},
    click(){buttons.forEach(b=>b.active=false);this.active=true},
  }));
  const listeners={};
  const dock={
    isConnected:true,clientWidth:280,clientHeight:68,dataset:{},
    classList:{add(){}},
    getBoundingClientRect(){return {left:10,top:0,width:280,height:68}},
    insertBefore(){},
    addEventListener(type,callback){listeners[type]=callback},
    querySelector(selector){
      if(selector===".dock-btn.active")return buttons.find(b=>b.active)||null;
      if(selector===".dock-btn")return buttons[0];
      return null;
    },
    querySelectorAll(){return buttons}
  };
  const nav={querySelector:selector=>selector===".dock-glass"?dock:null};
  return {nav,dock,buttons,listeners,requests:()=>requested};
}

test("YourLogos preserves three original nav routes and mounting contract",()=>{
  const app=read("app.js"),html=read("index.html"),css=read("liquid-navbar.css");
  assert.match(app,/\["today","Encounter"\],\["library","Library"\],\["profile","My World"\]/);
  assert.match(app,/document\.body\.appendChild\(replacementNav\)/);
  assert.match(app,/syncLiquidNavbar\(document\.querySelector\("body > \.mobile-tabs"\)\)/);
  assert.match(html,/liquid-navbar\.css/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/waterline-dock\[data-water-gl="off"\]/);
});

test("No-WebGL dock remains functional and follows active app navigation",()=>{
  const {nav,dock,buttons,listeners}=mount();
  const state=attachLiquidNavbar(nav);
  assert.equal(dock.dataset.waterGl,"off");
  assert.equal(state.targetX,42);
  buttons[0].active=false;buttons[2].active=true;
  syncLiquidNavbar(nav);
  assert.equal(state.targetX,202);
  assert.equal(attachLiquidNavbar(nav),state,"Persistent dock is not reinitialized");
  document.activeElement=buttons[2];
  listeners.keydown({key:"ArrowRight",preventDefault(){}});
  assert.equal(buttons[0].active,true,"Arrow keys wrap and invoke existing click handlers");
});

test("Reduced-motion users get a static CSS capsule without requesting WebGL",()=>{
  const {nav,dock}=mount({reducedMotion:true});
  attachLiquidNavbar(nav);
  assert.equal(dock.dataset.waterGl,"off");
});

test("New navbar assets are available for offline PWA use",()=>{
  const sw=read("sw.js");
  assert.ok(sw.includes('"/liquid-navbar.js"'));
  assert.ok(sw.includes('"/liquid-navbar.css"'));
});
