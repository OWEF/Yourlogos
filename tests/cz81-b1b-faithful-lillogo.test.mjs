import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../experiments/cz81-b1b-faithful-lillogo.html",import.meta.url),"utf8");

test("standalone preview compiles with only inline, dependency-free script",()=>{
  assert.match(source,/<!doctype html>/i);
  const code=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(code?.length>400);
  assert.doesNotThrow(()=>new Function(code));
  assert.doesNotMatch(source,/<script[^>]+src=|<link[^>]+href=|@import|https?:\/\//i);
});

test("uses the original art via same-origin relative paths only",()=>{
  assert.match(source,/\.\.\/little-logo-poses-v5\.webp/);
  assert.match(source,/\.\.\/little-logo-hd-v2\.jpg/);
  assert.match(source,/background-size:800% 100%/);
  assert.match(source,/background-position:0% 50%/);
  assert.match(source,/28\.5714286% 50%/);
  assert.doesNotMatch(source,/url\(["']?\/little-logo-|src="\/little-logo-/);
});

test("exposes exactly the two approved state controls, keyboard accessible",()=>{
  assert.match(source,/id="btn-idle"[^>]*data-state="idle"[^>]*aria-pressed/);
  assert.match(source,/id="btn-curious"[^>]*data-state="curious"[^>]*aria-pressed/);
  assert.match(source,/role="group"[^>]*aria-label="LilLogo attention state"/);
  assert.match(source,/:focus-visible/);
  assert.doesNotMatch(source,/onclick=/i);
});

test("keeps motion layered, subtle and within the 1-4 degree head-shift budget",()=>{
  for(const layer of ["pose-idle","pose-curious","tilt","breath","gaze-drift"])
    assert.match(source,new RegExp('data-layer="'+layer+'"'));
  assert.match(source,/@keyframes sway\b/);
  assert.match(source,/@keyframes swayCurious/);
  assert.match(source,/@keyframes breathe/);
  assert.match(source,/@keyframes glance/);
  const degrees=[...source.matchAll(/rotate\((-?[\d.]+)deg\)/g)].map(m=>Math.abs(Number(m[1])));
  assert.ok(degrees.length>0&&degrees.every(d=>d<=4),`found out-of-budget rotations: ${degrees}`);
});

test("honors reduced motion, pauses on hidden tab, and declares the flattening limitation",()=>{
  assert.match(source,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(source,/prefers-reduced-motion: reduce/);
  assert.match(source,/visibilitychange/);
  assert.match(source,/function syncVisibility\(\)/);
  assert.match(source,/classList\.toggle\('paused',document\.visibilityState==='hidden'\|\|reduced\(\)\)/);
  assert.match(source,/pagehide.*classList\.add\('paused'\)/);
  assert.match(source,/animation-play-state:paused/);
  assert.match(source,/aria-live="polite"/);
  assert.match(source,/flattened raster illustration/);
  assert.match(source,/cannot be reconstructed/);
  assert.match(source,/deliberately absent rather than fabricated/i);
});

test("makes no network, AI, save, or audio calls",()=>{
  assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon|import\(|localStorage|sessionStorage|indexedDB|document\.cookie|AudioContext|webkitAudioContext|new Worker/);
  assert.match(source,/NO NETWORK · NO AI CALLS · NO PERSONAL DATA SAVED/);
});

test("scope guard: does not claim a proven rig or verified identity",()=>{
  assert.match(source,/does <strong>not<\/strong> prove an independent head rig/);
  assert.doesNotMatch(source,/fully articulated|production-ready rig/i);
});
