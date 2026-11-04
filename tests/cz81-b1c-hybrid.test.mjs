import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const svg=readFileSync(new URL("../assets/lillogo-v3-layered-hybrid.svg",import.meta.url),"utf8");
const html=readFileSync(new URL("../experiments/cz81-b1c-layer-study.html",import.meta.url),"utf8");

test("original portrait bytes are preserved exactly once, with no substituted character",()=>{
  const image=svg.match(/href="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/);
  assert.ok(image,"embedded source JPEG missing");
  const original=readFileSync(new URL("../little-logo-hd-v2.jpg",import.meta.url));
  const embedded=Buffer.from(image[1],"base64");
  assert.deepEqual(embedded,original,"the editable rig must use the identical approved raster");
  assert.equal((svg.match(/data:image\/jpeg;base64/g)||[]).length,1,"portrait must not be multiplied across layers");
});

test("real independent editable geometry exists for face, gaze, lids and hair",()=>{
  for(const id of ["bodyBase","neckUnderpaint","headRig","eyeBackground","eyeRig","eyelids","hairRig"]){
    assert.match(svg,new RegExp('id="'+id+'"'));
  }
  for(const id of ["headClip","forelockClip","eyeClip","bodyHeadKnockout","eyeRemoval"]){
    assert.match(svg,new RegExp('id="'+id+'"'));
  }
  for(const n of ["body-static-with-head-knockout","occlusion-restoration-provisional",
                  "head-independent","eyes-independent","blink-independent","forelock-independent"]){
    assert.match(svg,new RegExp('data-editable-layer="'+n+'"'));
  }
  assert.match(svg,/<g id="bodyBase"[^>]*>[\s\S]*?<use href="#originalPortrait" mask="url\(#bodyHeadKnockout\)"\/>/);
  assert.match(svg,/<mask id="bodyHeadKnockout"[\s\S]*?<use href="#headGeometry" fill="#000"\/>[\s\S]*?<use href="#forelockGeometry" fill="#000"\/>/);
  assert.match(svg,/<g id="eyeRig"[^>]*clip-path="url\(#eyeClip\)"/);
  assert.match(svg,/<g id="hairRig"[^>]*clip-path="url\(#forelockClip\)"/);
});

test("head, eyes, hair and eyelids have distinct movement mechanisms",()=>{
  for(const part of ["headRig","eyeRig","hairRig","eyelids"])
    assert.match(svg,new RegExp('#'+part+'\\{transform-origin:'));
  assert.match(svg,/#lillogoLayeredRig\.state-curious #headRig\{transform:rotate\(2deg\)/);
  assert.match(svg,/#lillogoLayeredRig\.state-curious #eyeRig\{transform:translate\(1\.8px/);
  assert.match(svg,/#lillogoLayeredRig\.state-curious #hairRig\{transform:rotate\(-1\.35deg/);
  assert.match(svg,/@keyframes quietBlink/);
  assert.match(svg,/#lillogoLayeredRig:not\(\.is-paused\) #eyelids\{animation:/);
  assert.match(svg,/@media\(prefers-reduced-motion:reduce\)/);
});

test("original body is not ghosted beneath a translated head",()=>{
  assert.match(svg,/<mask id="bodyHeadKnockout"/);
  assert.match(svg,/<g id="neckUnderpaint"/);
  assert.match(svg,/occluded anatomy is approximated/);
});

test("a standalone, keyboard-friendly mobile comparison and state control exist",()=>{
  assert.match(html,/<img class="artwork" src="\.\.\/little-logo-hd-v2\.jpg"/);
  assert.match(html,/<object id="rigObject" class="artwork" data="\.\.\/assets\/lillogo-v3-layered-hybrid\.svg"/);
  assert.match(html,/id="idle"[^>]*aria-pressed="true"/);
  assert.match(html,/id="curious"[^>]*aria-pressed="false"/);
  assert.match(html,/class="controls" role="group"/);
  assert.match(html,/:focus-visible/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/addEventListener\("visibilitychange",apply\)/);
  assert.match(html,/document\.hidden\|\|motion\.matches/);
  assert.match(html,/prefers-reduced-motion: reduce/);
  const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(code?.length>700);
  assert.doesNotThrow(()=>new Function(code));
});

test("prototype discloses art limits and never alters app or user data",()=>{
  assert.match(html,/not a fully traced vector illustration/);
  assert.match(html,/masks are hand-estimated/i);
  assert.match(html,/founder compares it with CZ-23/i);
  assert.doesNotMatch(html+svg,/<script[^>]+src=|https?:\/\/|fetch\(|XMLHttpRequest|WebSocket|new Worker|localStorage|sessionStorage|indexedDB|Supabase|KIMI_MODEL_API_KEY/);
  assert.doesNotMatch(svg,/<script\b/);
});

test("source art, preview and test remain nonproduction artifacts",()=>{
  assert.match(svg,/CZ-81 B1c PROTOTYPE/);
  assert.match(html,/REVIEW ONLY/);
  assert.match(html,/not yet a finished, approved replacement/);
});
