import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const svg=readFileSync(new URL("../assets/lillogo-v3-layered-hybrid.svg",import.meta.url),"utf8");

function keyframesBody(name){
  const match=svg.match(new RegExp("@keyframes\\s+"+name+"\\s*\\{([\\s\\S]*?)\\n\\s*\\}"));
  assert.ok(match,"@keyframes "+name+" must exist in the layered rig");
  return match[1];
}
function scaleYValues(body){
  return [...body.matchAll(/scaleY\(([^)]+)\)/g)].map(m=>parseFloat(m[1]));
}
function pxOffsets(body,prop){
  return [...body.matchAll(new RegExp("--"+prop+":\\s*(-?[\\d.]+)px","g"))].map(m=>parseFloat(m[1]));
}

test("embedded source portrait is byte-identical to the approved original raster",()=>{
  const payloads=svg.match(/data:image\/jpeg;base64,/g);
  assert.equal(payloads.length,1,"the approved raster must be embedded exactly once, never re-encoded");
  const encoded=svg.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/)[1];
  assert.deepEqual(Buffer.from(encoded,"base64"),readFileSync(new URL("../little-logo-hd-v2.jpg",import.meta.url)));
});

test("portrait reuse stays declarative: every layer references the single embedded raster",()=>{
  assert.match(svg,/id="originalPortrait"/);
  const uses=svg.match(/<use href="#originalPortrait"/g)||[];
  assert.ok(uses.length>=3,"body, underpaint, head, eyes and hair must reuse the one raster");
  for(const id of ["headRig","eyeRig","eyelids","hairRig"]){
    assert.match(svg,new RegExp('id="'+id+'"'));
  }
});

test("eye mask proportions are internally consistent between clip and removal masks",()=>{
  const ellipseAttrs=block=>[...block.matchAll(/<ellipse ([^/]+)\/>/g)].map(m=>m[1].trim().replace(/\s+fill="#000"/g,""));
  const clip=svg.match(/<clipPath id="eyeClip"[^>]*>([\s\S]*?)<\/clipPath>/);
  const removal=svg.match(/<mask id="eyeRemoval"[^>]*>([\s\S]*?)<\/mask>/);
  assert.ok(clip&&removal);
  assert.deepEqual(ellipseAttrs(clip[1]),ellipseAttrs(removal[1]));
  assert.ok(ellipseAttrs(clip[1]).length>=2,"both eyes must keep their own mask geometry");
});

test("blink reads as irregular natural microaction, not a fixed metronome beat",()=>{
  assert.match(svg,/#lillogoLayeredRig:not\(\.is-paused\) #eyelids\{animation:quietBlink ([\d.]+)s/);
  const duration=parseFloat(svg.match(/animation:quietBlink ([\d.]+)s/)[1]);
  assert.ok(duration>=20,"blink cycle should be a long uneven phrase, not a short rigid loop");
  const body=keyframesBody("quietBlink");
  const values=scaleYValues(body);
  assert.ok(values.includes(0)&&values.includes(1),"eyelids must animate between open and closed");
  const closedBlocks=(body.match(/scaleY\(1\)/g)||[]).length;
  assert.ok(closedBlocks>=2,"at least one genuine blink closure must be defined");
  assert.ok(values.some(v=>v>0&&v<1),"a partial flutter close adds the irregular double-blink feel");
});

test("independent eye micro-drift moves only the eyes, never the head, and stays sub-pixel",()=>{
  assert.match(svg,/@property --gaze-x\{syntax:"<length>";inherits:true;initial-value:0px\}/);
  const microBody=keyframesBody("microGaze");
  for(const prop of ["micro-x","micro-y"]){
    for(const v of pxOffsets(microBody,prop)){
      assert.ok(Math.abs(v)<=.6,"micro-drift amplitude "+v+"px must stay imperceptibly small");
    }
  }
  assert.match(svg,/#lillogoLayeredRig:not\(\.is-paused\) #eyeRig\{animation:microGaze ([\d.]+)s/);
  const microDuration=parseFloat(svg.match(/#eyeRig\{animation:microGaze ([\d.]+)s/)[1]);
  const blinkDuration=parseFloat(svg.match(/animation:quietBlink ([\d.]+)s/)[1]);
  assert.notEqual(microDuration,blinkDuration,"eye drift and blink periods must not lock into a repeating beat");
  assert.doesNotMatch(svg,/#headRig\{animation:|state-\w+ #headRig\{[^}]*animation/,"head must not inherit the eye microaction");
  assert.match(svg,/#eyeRig\{[^}]*transform:translate\(calc\(var\(--gaze-x\) \+ var\(--micro-x\)\),calc\(var\(--gaze-y\) \+ var\(--micro-y\)\)\)/);
  assert.match(svg,/#lillogoLayeredRig\.state-curious\{--gaze-x:1\.8px;--gaze-y:-\.6px\}/);
  for(const state of ["reflective","restful","quietly-delighted"]){
    assert.match(svg,new RegExp("\\.state-"+state));
  }
});

test("is-paused and reduced motion leave a static open eye",()=>{
  assert.match(svg,/#lillogoLayeredRig\.is-paused \*\{animation-play-state:paused!important\}/);
  const media=svg.match(/@media\(prefers-reduced-motion:reduce\)\{([\s\S]*?)\n {4}\}\n/);
  assert.ok(media);
  assert.match(media[1],/animation:none!important/);
  assert.match(media[1],/#eyelids\{transform:scaleY\(0\)!important\}/);
});
