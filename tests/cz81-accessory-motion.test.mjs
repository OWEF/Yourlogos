import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const svg=readFileSync(new URL("../assets/lillogo-v3-layered-hybrid.svg",import.meta.url),"utf8");

function keyframesBody(name){
  const match=svg.match(new RegExp("@keyframes\\s+"+name+"\\s*\\{([\\s\\S]*?)\\n\\s*\\}"));
  assert.ok(match,"@keyframes "+name+" must exist in the layered rig");
  return match[1];
}
function swayValues(body){
  return [...body.matchAll(/--hair-sway:\s*(-?[\d.]+)deg/g)].map(m=>parseFloat(m[1]));
}

test("embedded source portrait is byte-identical to the approved original raster",()=>{
  assert.equal((svg.match(/data:image\/jpeg;base64,/g)||[]).length,1,"the approved raster must stay embedded exactly once");
  assert.equal((svg.match(/<image\b/g)||[]).length,1,"M3A adds no new images or layers");
  const encoded=svg.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/)[1];
  assert.deepEqual(Buffer.from(encoded,"base64"),readFileSync(new URL("../little-logo-hd-v2.jpg",import.meta.url)));
  assert.doesNotMatch(svg,/(?:href|src)="https?:|url\(https?:|@import/,
    "no external resources may be introduced (xmlns namespaces are identifiers, not fetches)");
});

test("forelock sway is one independent registered angle, composed only into hairRig",()=>{
  assert.match(svg,/@property --hair-sway\{syntax:"<angle>";inherits:false;initial-value:0deg\}/);
  const hair=svg.match(/#hairRig\{([^}]*)\}/);
  assert.ok(hair);
  assert.match(hair[1],/transform:rotate\(var\(--hair-sway\)\)/,"hairRig must compose the sway angle");
  assert.match(hair[1],/transform-origin:238px 107px/,"forelock keeps its own pivot, distinct from the head");
  for(const rig of ["headRig","eyeRig","eyelids"]){
    const rule=svg.match(new RegExp("#"+rig+"\\{([^}]*)\\}"));
    assert.ok(rule);
    assert.doesNotMatch(rule[1],/--hair-sway/,"M1/M2 "+rig+" behavior must not inherit the forelock sway");
  }
  assert.doesNotMatch(svg,/scale\([^)]*--hair-sway/,"forelock motion must never rescale the original proportions");
});

test("follow-through stays subtle, delayed, and limited to idle/curious/reflective",()=>{
  const body=keyframesBody("forelockFollow");
  const values=swayValues(body);
  assert.ok(values.length>=3,"the sway phrase needs a few waypoints, not a binary flip");
  assert.ok(values.includes(0),"the sway must return to rest");
  for(const deg of values){
    assert.ok(Math.abs(deg)<=.6,"forelock amplitude "+deg+"deg must stay imperceptibly small");
  }
  const gated=[...svg.matchAll(/#lillogoLayeredRig\.state-([\w-]+):not\(\.is-paused\) #hairRig/g)].map(m=>m[1]);
  assert.deepEqual([...gated].sort(),["curious","idle","reflective"],
    "follow-through must run only where the head turns on its own");
  const decl=svg.match(/animation:forelockFollow ([\d.]+)s ease-in-out (-?[\d.]+)s infinite/);
  assert.ok(decl,"one shared declaration must drive the gated states");
  assert.ok(parseFloat(decl[1])>=10,"the sway must be a slow phrase, no constant large motion");
  assert.ok(parseFloat(decl[2])<0,"negative delay must phase-lag the forelock behind the head");
  const base=svg.match(/#hairRig\{transform-origin[^}]*\}/);
  assert.ok(base,"base hairRig rule must exist");
  assert.doesNotMatch(base[0],/animation/,"the base hairRig must stay animation-free so is-paused and state transitions stay composable");
});

test("is-paused and reduced motion leave the forelock planted at rest",()=>{
  assert.match(svg,/#lillogoLayeredRig\.is-paused \*\{animation-play-state:paused!important\}/);
  assert.match(svg,/@property --hair-sway\{syntax:"<angle>";inherits:false;initial-value:0deg\}/,
    "the 0deg initial value is what keeps the forelock stable once animations are removed");
  const media=svg.match(/@media\(prefers-reduced-motion:reduce\)\{([\s\S]*?)\n {4}\}\n/);
  assert.ok(media);
  assert.match(media[1],/animation:none!important/);
});
