import {test} from "node:test";
import assert from "node:assert/strict";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {SIX_PEER_GAMES,selectMiniGameV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {B1_GAMES,QUALIFIED_WARRANTS,inspectB1Source,
 tryB1Encounter,normalizeBalance,normalizeFuture,listAuthoredPossibilities}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
test("ONE six-peer registry: both new games blocked for all current sources",()=>{
 assert.equal(SIX_PEER_GAMES.length,6);
 assert.deepEqual(B1_GAMES,["balance_of_values","future_reveal"]);
 assert.deepEqual(QUALIFIED_WARRANTS,[]);
 for(const record of [DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21]){
  for(const id of B1_GAMES){
   assert.equal(inspectB1Source(record,id).status,"blocked");
   assert.equal(tryB1Encounter(record,id,{}).status,"blocked");
  }
  const selected=selectMiniGameV22(record,{mode:"prototype",
   preferredGameId:"future_reveal"});
  assert.equal(selected.selection_trace.evaluatedPeerIds.length,6);
  assert.notEqual(selected.selected_game_id,"future_reveal");
 }
});
test("fake editorial status and caller flags cannot authorize a source",()=>{
 for(const [r,id] of [[DILLARD_V21,B1_GAMES[0]],[KIERKEGAARD_V21,B1_GAMES[1]]]){
  const fake=clone(r);
  fake.gameCompatibility.find(g=>g.id===id).eligible=true;
  fake.source.reviewState="source_verified";
  fake.source.reviewSignoff={reviewer:"attacker",reviewedAt:"2026-11-16",
   versionHash:r.versionHash,translationEdition:"fake",passageLocation:"fake"};
  fake.editorialApproval=true;
  assert.notEqual(validateContentRecordV21(fake).status,"valid_research_record");
  assert.equal(inspectB1Source(fake,id).status,"blocked");
 }
});
test("three-activity schedule cannot be changed into two moral-weight scores",()=>{
 assert.equal(normalizeBalance(DILLARD_V21,{leftSlots:3,touched:true}).code,
  "incompatible_source");
 assert.equal(normalizeBalance(DILLARD_V21,{leftSlots:3,touched:false}).code,"invalid_input");
 assert.equal(normalizeBalance(DILLARD_V21,{leftSlots:3,touched:true,
  personalityScore:10}).code,"invalid_input");
});
test("existing route has multiple unchosen developments: do not invent which one occurs",()=>{
 const actions=[
  {type:"choose_start",optionId:"change"},
  {type:"reveal_authored"},
  {type:"choose_response",optionId:"adapt"},
  {type:"read_retrospective"}
 ];
 const result=normalizeFuture(KIERKEGAARD_V21,actions);
 assert.equal(result.code,"source_ambiguity",
  "An initial choice does not determine an unchosen external event");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,actions.slice(0,1)).code,"incomplete");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"scrub",stage:4},...actions.slice(1)]).code,"stage_locked");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"reveal_authored",eventId:"fabricated"},...actions.slice(2)]).code,"forged_event");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"choose_response",optionId:"adapt"}]).code,"invalid_response");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"revise_start",optionId:"stay"},{type:"scrub",stage:2}]).code,
  "stage_locked","Revision discards the first route's imagined future");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"choose_start",optionId:"stay"}]).code,"invalid_decision");
});
test("no source-ineligible game can emit an engine result",()=>{
 const out=tryB1Encounter(KIERKEGAARD_V21,"future_reveal",{
  actions:[{type:"choose_start",optionId:"change"},{type:"reveal_authored"},
   {type:"choose_response",optionId:"adapt"},{type:"read_retrospective"}]});
 assert.equal(out.status,"blocked");
 assert.equal(out.publicationAllowed,false);
 assert.equal("result" in out,false);
});

test("research-only hypothetical exploration lists ONLY preauthored possibilities, never real futures",()=>{
 const options=listAuthoredPossibilities(KIERKEGAARD_V21,"change");
 assert.equal(options.status,"research_options_only");
 assert.equal(options.sourceApproved,false);
 assert.equal(options.publicationAllowed,false);
 assert.ok(options.options.length>=2,"Ambiguous authored scenes must be visible as explorations");
 const routeIds=new Set(KIERKEGAARD_V21.scenario.constraints.routes.filter(r=>r.path[0]==="change").map(r=>r.path[1]));
 assert.deepEqual(new Set(options.options.map(x=>x.sceneId)),routeIds);
 for(const scene of options.options){
  assert.equal(scene.role,"AUTHORED_DEVELOPMENT");
  assert.equal(scene.readerAction,"EXPLORE_ONLY");
  assert.equal(scene.causedByReader,false);
  assert.equal(scene.predictedRealFuture,false);
  assert.equal(scene.unchosenFutureKnown,false);
  assert.ok(scene.authoredText.length>0);
 }
 assert.equal(listAuthoredPossibilities(KIERKEGAARD_V21,"invented").code,"invalid_decision");
});
test("reader explores one exact authored possibility without causing it; original source gate remains closed",()=>{
 const options=listAuthoredPossibilities(KIERKEGAARD_V21,"change");
 const one=options.options.find(x=>x.sceneId==="risk");
 assert.ok(one,"Existing accepted research graph includes risk");
 const terminal=KIERKEGAARD_V21.scenario.constraints.routes.find(r=>r.path[0]==="change"&&r.path[1]===one.sceneId);
 assert.ok(terminal);
 const path=terminal.path;
 const actions=[{type:"choose_start",optionId:path[0]},
  {type:"explore_authored",sceneId:one.sceneId},
  {type:"choose_response",optionId:path[2]},
  {type:"read_retrospective"}];
 const r=normalizeFuture(KIERKEGAARD_V21,actions);
 assert.equal(r.status,"normalized",JSON.stringify(r));
 assert.deepEqual(r.canonical.path,path);
 assert.equal(r.provenance.authoredEventCausedByReader,false);
 assert.equal(r.provenance.predictedActualFuture,false);
 assert.equal(r.provenance.unchosenFutureKnown,false);
 assert.equal(r.provenance.readerExploredFiction,true);
 assert.equal(tryB1Encounter(KIERKEGAARD_V21,"future_reveal",{actions}).status,"blocked",
  "Normalized test-only decisions cannot bypass qualified source/selector gates");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"explore_authored",sceneId:"invented"},...actions.slice(2)]).code,
  "unapproved_scene");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"explore_authored",sceneId:one.sceneId,authoredText:"You win"},...actions.slice(2)]).code,
  "forged_event");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,
  [actions[0],{type:"explore_authored",sceneId:one.sceneId},
   {type:"revise_start",optionId:"stay"},...actions.slice(2)]).code,"invalid_response",
  "Changing the initial action invalidates the previously explored fictional scene");
});
