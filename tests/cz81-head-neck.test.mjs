import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const svg=readFileSync(new URL("../assets/lillogo-v3-layered-hybrid.svg",import.meta.url),"utf8");

function headGeometryBBox(){
  const d=svg.match(/id="headGeometry" d="([^"]+)"/)[1];
  // headGeometry uses only M/C commands, so numbers pair as (x,y).
  const nums=[...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>parseFloat(m[0]));
  assert.equal(nums.length%2,0,"headGeometry coordinates must pair as x,y");
  const xs=[],ys=[];
  for(let i=0;i<nums.length;i+=2){xs.push(nums[i]);ys.push(nums[i+1]);}
  return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};
}
function headPivot(){
  const m=svg.match(/#headRig\{transform-origin:(-?[\d.]+)px (-?[\d.]+)px\}/);
  assert.ok(m,"headRig must declare an explicit transform-origin");
  return {x:parseFloat(m[1]),y:parseFloat(m[2])};
}
function headRotations(){
  return [...svg.matchAll(/state-[\w-]+ #headRig\{[^}]*rotate\((-?[\d.]+)deg\)/g)]
    .map(m=>Math.abs(parseFloat(m[1])));
}

test("embedded source portrait is still the single approved original raster",()=>{
  assert.equal((svg.match(/data:image\/jpeg;base64,/g)||[]).length,1);
  assert.equal((svg.match(/<image\b/g)||[]).length,1,"no second embedded image, no duplicate face source");
  const encoded=svg.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/)[1];
  assert.deepEqual(Buffer.from(encoded,"base64"),readFileSync(new URL("../little-logo-hd-v2.jpg",import.meta.url)));
});

test("head pivots at the chin/neck junction, not inside the face",()=>{
  const bbox=headGeometryBBox();
  const pivot=headPivot();
  const centerY=(bbox.minY+bbox.maxY)/2;
  assert.ok(pivot.y>centerY,"pivot y "+pivot.y+" must sit below the face midpoint "+centerY);
  assert.ok(pivot.y>=bbox.maxY-18&&pivot.y<=bbox.maxY+6,
    "pivot y "+pivot.y+" must hug the head silhouette bottom (~"+bbox.maxY+") so the jaw stays planted");
  assert.ok(pivot.x>=bbox.minX&&pivot.x<=bbox.maxX,"pivot x "+pivot.x+" must stay inside the head silhouette");
});

test("every mood tilt stays inside the approved subtle 1-3 degree band",()=>{
  const rotations=headRotations();
  assert.deepEqual(rotations.length,4,"curious, reflective, restful and quietly-delighted must each tilt the head");
  for(const deg of rotations){
    assert.ok(deg>=1&&deg<=3,"tilt "+deg+"deg must stay within the 1-3 degree budget");
  }
  assert.ok(svg.includes("#lillogoLayeredRig.state-curious #headRig{transform:rotate(2deg)"),
    "validated M1 curious tilt is preserved");
});

test("revealed neck pixels read as soft shadow, never a hard or duplicated face",()=>{
  const filter=svg.match(/<filter id="softUnderpaint"[^>]*>([\s\S]*?)<\/filter>/);
  assert.ok(filter);
  const blur=filter[1].match(/<feGaussianBlur stdDeviation="([\d.]+)"\/>/);
  assert.ok(blur&&parseFloat(blur[1])>0,"underpaint edge must stay blurred, no solid seam");
  const matrix=filter[1].match(/<feColorMatrix type="matrix" values="([^"]+)"\/>/);
  assert.ok(matrix,"M2 darkening matrix must tone the revealed pixels toward shadow");
  const coeffs=matrix[1].trim().split(/\s+/).map(Number);
  assert.equal(coeffs.length,20);
  const color=[0,1,2,5,6,7,10,11,12].map(i=>coeffs[i]);
  assert.ok(color.every(c=>c>=0),"shadow tone must not invert or subtract colour");
  const lumaScale=color.reduce((a,b)=>a+b,0)/color.length;
  assert.ok(lumaScale<.85&&lumaScale>.15,"underpaint must be visibly darkened from the face colour (scale "+lumaScale+")");
  assert.notDeepEqual(color,[1,0,0,0,1,0,0,0,1],"a bright identity underpaint would re-introduce the ghost face");
});

test("tilting the head cannot open a transparent hole at the contour",()=>{
  const clip=svg.match(/<clipPath id="underpaintClip"[^>]*>([\s\S]*?)<\/clipPath>/);
  assert.ok(clip);
  assert.match(clip[1],/href="#headGeometry"/,"underpaint must still cover the head silhouette");
  assert.match(clip[1],/href="#forelockGeometry"/,"underpaint must still cover the forelock silhouette");
  assert.match(svg,/id="bodyHeadKnockout"/);
  assert.match(svg,/<use href="#originalPortrait" mask="url\(#bodyHeadKnockout\)"\/>/);
});

test("head motion keeps original proportion and leaves M1 eye layers untouched",()=>{
  for(const rule of svg.matchAll(/state-[\w-]+ #headRig\{([^}]*)\}/g)){
    assert.doesNotMatch(rule[1],/scale\(/,"head tilt must never scale; original proportions are immutable");
    assert.doesNotMatch(rule[1],/animation/,"head tilt is a state transition, not an inherited eye microaction");
  }
  assert.match(svg,/#eyeRig\{transform-origin:292px 168px/);
  assert.match(svg,/#eyelids\{transform-origin:292px 167px/);
  assert.match(svg,/@keyframes microGaze/);
  assert.match(svg,/#lillogoLayeredRig\.state-curious\{--gaze-x:1\.8px;--gaze-y:-\.6px\}/);
  assert.match(svg,/#lillogoLayeredRig:not\(\.is-paused\) #eyeRig\{animation:microGaze/);
});
