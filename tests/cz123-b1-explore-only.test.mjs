import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21} from "../philosophy-engine/content/research-fixtures-v21.js";
import {validateChoiceV21} from "../philosophy-engine/content/content-contract-v21.js";
import {listAuthoredPossibilities,normalizeFuture,inspectB1Source,tryB1Encounter,QUALIFIED_WARRANTS} from "../experiments/yl-b1-editorial-gated-adapters.mjs";
const src=readFileSync(new URL("../philosophy-engine/content/content-capabilities-v211.js",import.meta.url),"utf8");
const doc=readFileSync(new URL("../research/cz121/B1-SOURCE-ELIGIBILITY.md",import.meta.url),"utf8");
test("independent exact-source gate: external witnesses do not admit either game",()=>{
 assert.deepEqual(QUALIFIED_WARRANTS,[]);
 assert.match(src,/balance_of_values:false/);
 assert.match(src,/future_reveal:false/);
 for(const record of [DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21]){
  for(const id of ["balance_of_values","future_reveal"]){
   const out=inspectB1Source(record,id);
   assert.equal(out.status,"blocked");
   const exercise=tryB1Encounter(record,id,{leftSlots:3,touched:true,
    actions:[{type:"choose_start",optionId:"change"}]});
   assert.equal(exercise.status,"blocked");
   assert.equal("result" in exercise,false);
  }
 }
 assert.match(doc,/NOT an independent qualified-source PASS|NOT an independently qualified-source PASS/i);
 assert.match(doc,/Søren Kierkegaard|Kierkegaard/);
 assert.match(doc,/Thoreau/);
});
test("independent exhaustive 8-path canonical source replay: selected fictional event never caused by reader",()=>{
 const routes=KIERKEGAARD_V21.scenario.constraints.routes;
 assert.equal(routes.length,8);
 for(const r of routes){
  const menu=listAuthoredPossibilities(KIERKEGAARD_V21,r.path[0]);
  assert.equal(menu.status,"research_options_only");
  assert.equal(menu.sourceApproved,false);
  const scene=menu.options.find(o=>o.sceneId===r.path[1]);
  assert.ok(scene,"Missing graph-authored hypothetical scene: "+r.path.join("/"));
  assert.deepEqual(scene.authoredText,r.authoredDevelopments);
  assert.equal(scene.causedByReader,false);
  assert.equal(scene.predictedRealFuture,false);
  const actions=[{type:"choose_start",optionId:r.path[0]},
   {type:"explore_authored",sceneId:r.path[1]},
   {type:"choose_response",optionId:r.path[2]},
   {type:"read_retrospective"}];
  const outcome=normalizeFuture(KIERKEGAARD_V21,actions);
  assert.equal(outcome.status,"normalized",JSON.stringify(outcome));
  assert.deepEqual(outcome.canonical.path,r.path);
  assert.deepEqual(outcome.canonical,validateChoiceV21(KIERKEGAARD_V21,{gameId:"decision_map",path:r.path}).canonical);
  assert.equal(outcome.provenance.authoredEventCausedByReader,false);
  assert.equal(outcome.provenance.predictedActualFuture,false);
  assert.equal(outcome.provenance.unchosenFutureKnown,false);
  assert.equal(tryB1Encounter(KIERKEGAARD_V21,"future_reveal",{actions}).status,"blocked");
 }
 console.log("CZ123-B1-EIGHT-PATHS "+JSON.stringify({tested:routes.length,sourceAdmitted:false,realFutureKnown:false}));
});
test("independent malicious route/event payloads and unreviewed editorial tampering fail closed",()=>{
 const init={type:"choose_start",optionId:"change"};
 assert.equal(normalizeFuture(KIERKEGAARD_V21,[init,{type:"reveal_authored"}]).code,
 "source_ambiguity","Never silently choose among distinct authored possibilities.");
 for(const malicious of [
  {type:"explore_authored",sceneId:"invented_event"},
  {type:"explore_authored",sceneId:"risk",text:"You definitely get the job"},
  {type:"explore_authored",sceneId:"risk",authoredStageId:"custom"},
  {type:"reveal_authored",eventId:"risk"}
 ]){
  assert.equal(normalizeFuture(KIERKEGAARD_V21,[init,malicious]).status,"blocked");
 }
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [init,{type:"scrub",stage:3}]).code,"stage_locked");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [init,{type:"explore_authored",sceneId:"risk"},{type:"revise_start",optionId:"stay"},
   {type:"choose_response",optionId:"continue"}]).status,"blocked");
 const clone=JSON.parse(JSON.stringify(KIERKEGAARD_V21));
 clone.source.reviewState="source_verified";
 clone.gameCompatibility.find(x=>x.id==="future_reveal").eligible=true;
 clone.source.reviewSignoff={reviewer:"invented",reviewedAt:"2026-11-16",
  versionHash:clone.versionHash,translationEdition:"invented",passageLocation:"invented"};
 assert.equal(inspectB1Source(clone,"future_reveal").status,"blocked");
});