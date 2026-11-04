import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../experiments/cz80-cz81-reward-lab.html",import.meta.url),"utf8");

test("the standalone preview compiles without a runtime or paid dependency",()=>{
  assert.match(source,/<!doctype html>/i);
  const code=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(code?.length>1000);
  assert.doesNotThrow(()=>new Function(code));
  assert.doesNotMatch(source,/<script[^>]+src=|https?:\/\/|import\s+.*from\s+['"]/i);
});
test("four meaningfully distinct stages and three paths are present",()=>{
  for(const stage of ["encounter","insight","reflection","complete"]) {
    assert.match(source,new RegExp('id="phase-'+stage+'"'));
  }
  for(let i=0;i<3;i++)assert.match(source,new RegExp('data-lens="'+i+'"'));
  assert.match(source,/const lenses=\[/);
  assert.match(source,/function choose\(index\)/);
  assert.match(source,/function finish\(\)/);
  assert.match(source,/function reset\(\)/);
});
test("independent head eyes arms body legs and scarf are articulated",()=>{
  for(const part of ["ll-head","ll-gaze","ll-eyelids","ll-arm-left","ll-arm-right",
    "ll-torso","ll-leg-left","ll-leg-right","ll-scarf-tail"]) {
    assert.match(source,new RegExp('id="'+part+'"'));
  }
  assert.match(source,/@keyframes (head|look)/);
  assert.match(source,/@keyframes (armL|reach)/);
  assert.match(source,/@keyframes (torso|hop)/);
});
test("prototype has reduced-motion fallback and does not collect or persist user data",()=>{
  assert.match(source,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(source,/window\.matchMedia/);
  assert.match(source,/NO PERSONAL DATA SAVED/);
  assert.doesNotMatch(source,/localStorage|indexedDB|sessionStorage|document\.cookie|navigator\.sendBeacon|fetch\(|XMLHttpRequest|WebSocket/);
});
