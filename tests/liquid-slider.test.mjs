import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {enhanceEntranceSlider} from "../liquid-slider.js";

const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");

function harness({reduce=false}={}){
  const listeners={},canvasListeners={};
  const originalWindow=globalThis.window,originalDocument=globalThis.document;
  const canvas={
    className:"",width:0,height:0,clientWidth:302,clientHeight:70,
    setAttribute(){},getContext(){return null},
    addEventListener(name,cb){canvasListeners[name]=cb;}
  };
  globalThis.window={
    devicePixelRatio:3,
    matchMedia:()=>({matches:reduce}),
    addEventListener(){}
  };
  globalThis.document={
    hidden:false,
    createElement(type){assert.equal(type,"canvas");return canvas;},
    addEventListener(){}
  };
  let added=0;
  const slider={dataset:{},classList:{add(name){assert.equal(name,"waterline-slider");added++;}}};
  const track={
    firstChild:null,
    style:{getPropertyValue:()=>".0"},
    insertBefore(node){assert.equal(node,canvas);},
    addEventListener(name,cb){listeners[name]=cb;}
  };
  const root={hidden:false};
  const restore=()=>{globalThis.window=originalWindow;globalThis.document=originalDocument;};
  return {slider,track,root,canvas,canvasListeners,listeners,restore,get added(){return added;}};
}

test("Slider Waterline gracefully falls back with unsupported WebGL",()=>{
  const h=harness();
  try{
    const state=enhanceEntranceSlider(h.slider,h.track,h.root);
    assert.equal(h.slider.dataset.liquidGl,"off");
    assert.equal(state.progress,0);
    h.listeners["yourlogos:slider-progress"]({detail:{progress:.63,animated:false}});
    assert.equal(state.progress,.63);
    h.listeners["yourlogos:slider-progress"]({detail:{progress:1,animated:true}});
    assert.equal(state.progress,1);
    assert.equal(enhanceEntranceSlider(h.slider,h.track,h.root),state);
    assert.equal(h.added,1,"Do not duplicate visual enhancements");
  }finally{h.restore();}
});

test("Reduced motion disables the shader while retaining original gesture events",()=>{
  const h=harness({reduce:true});
  try{
    const state=enhanceEntranceSlider(h.slider,h.track,h.root);
    assert.equal(state.ctx,null);
    h.listeners["yourlogos:slider-progress"]({detail:{progress:.4}});
    assert.equal(state.progress,.4);
    assert.equal(h.slider.dataset.liquidGl,"off");
  }finally{h.restore();}
});

test("Original slide threshold, keyboard support, and label remain intact",()=>{
  const welcome=read("welcome.js"),html=read("index.html"),css=read("liquid-slider.css");
  assert.match(welcome,/progress>=\.88/,"The release threshold must remain unchanged");
  assert.match(welcome,/thumb\.addEventListener\("pointerdown"/);
  assert.match(welcome,/thumb\.addEventListener\("pointermove"/);
  assert.match(welcome,/thumb\.addEventListener\("pointerup"/);
  assert.match(welcome,/thumb\.addEventListener\("keydown"/);
  assert.match(welcome,/track\.dispatchEvent\(new CustomEvent\("yourlogos:slider-progress"/);
  assert.match(html,/Philosophy it/);
  assert.match(html,/liquid-slider\.css/);
  assert.match(html,/liquid-slider\.js/);
  assert.match(css,/\.yl-slider\.waterline-slider/,"Styles must be scoped to the slider");
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Liquid slider assets are precached for an offline iPhone PWA",()=>{
  const sw=read("sw.js");
  assert.ok(sw.includes('"/liquid-slider.css"'));
  assert.ok(sw.includes('"/liquid-slider.js"'));
});
