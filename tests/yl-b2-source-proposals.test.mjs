import {test} from "node:test";
import assert from "node:assert/strict";
import {GAME_IDS,validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {selectMiniGameV22,runSelectedEncounterResearchV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {listAuthoredPossibilities,QUALIFIED_WARRANTS,tryB1Encounter}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
import {B2_VERSION,B2_SOURCE_PROPOSALS,examineB2Proposal,
 rehearseFictionalHours,rehearseAuthoredExploration,verifyNoB2Admission}
 from "../experiments/yl-b2-source-proposals.mjs";
test("B2: two frozen-fingerprint reviewer proposals, neither approved or public",()=>{
 assert.equal(B2_VERSION,"review-only-source-candidates/0.1.0");
 assert.equal(B2_SOURCE_PROPOSALS.length,2);
 assert.deepEqual(B2_SOURCE_PROPOSALS.map(x=>x.gameId),
  ["balance_of_values","future_reveal"]);
 assert.equal(QUALIFIED_WARRANTS.length,0);
 for(const p of B2_SOURCE_PROPOSALS){
  assert.match(p.proposalFingerprint,/^sha256:[0-9a-f]{64}$/);
  assert.equal(p.gameSpecificApproval,"PENDING");
  assert.equal(p.independentQualifiedReviewer,null);
  assert.equal(Object.isFrozen(p.scenario),true);
  assert.equal(examineB2Proposal(p.proposalId).admission,false);
  assert.notEqual(validateContentRecordV21(p).status,"valid_research_record");
  console.log("REVIEW_ONLY_FINGERPRINT "+p.proposalId+" "+p.proposalFingerprint);
 }
 assert.equal(verifyNoB2Admission(),true);
});
test("Thoreau proposal: eight common hours, explicit arbitrary wage, never moral scores",()=>{
 const p=B2_SOURCE_PROPOSALS[0];
 assert.equal(p.scenario.capacity,8);
 assert.deepEqual(p.scenario.costs,[1,1]);
 assert.equal(p.scenario.unit,"hour");
 assert.match(p.scenario.wageOrigin,/Invented/);
 const a=rehearseFictionalHours(p.proposalId,{leftSlots:2,rightSlots:6});
 const b=rehearseFictionalHours(p.proposalId,{leftSlots:6,rightSlots:2});
 assert.equal(a.status,"proposal_preview_only");
 assert.equal(b.status,"proposal_preview_only");
 assert.equal(a.purelyAssumedEarnings,40);
 assert.equal(b.purelyAssumedEarnings,120);
 assert.equal(a.fictionalHours.kept,6);
 assert.equal(b.fictionalHours.kept,2);
 assert.equal(a.meaningEngineInvoked,false);
 assert.equal(b.gameSourceApproved,false);
 for(const bad of [
  {leftSlots:1,rightSlots:8},{leftSlots:1,rightSlots:-1},
  {leftSlots:1.5,rightSlots:6.5},{leftSlots:3,rightSlots:5,moralScore:5},
  {leftSlots:NaN,rightSlots:8},{leftSlots:999,rightSlots:0}]){
  assert.equal(rehearseFictionalHours(p.proposalId,bad).status,"review_blocked");
 }
});
test("Future Reveal proposed scene never causally chosen; all source scenes still exact",()=>{
 const available=listAuthoredPossibilities(KIERKEGAARD_V21,"change");
 assert.equal(available.status,"research_options_only");
 const scene=available.options.find(x=>x.sceneId==="risk")||available.options[0];
 assert.equal(scene.readerAction,"EXPLORE_ONLY");
 assert.equal(scene.causedByReader,false);
 const route=KIERKEGAARD_V21.scenario.constraints.routes.find(r=>
  r.path[0]==="change"&&r.path[1]===scene.sceneId);
 assert.ok(route,"Research-only normalized route already exists");
 const actions=[{type:"choose_start",optionId:"change"},
  {type:"explore_authored",sceneId:scene.sceneId},
  {type:"choose_response",optionId:route.path[2]},
  {type:"read_retrospective"}];
 const result=rehearseAuthoredExploration("change",actions);
 assert.equal(result.status,"proposal_preview_only",JSON.stringify(result));
 assert.deepEqual(result.canonicalPathFromExistingFrozenResearch.path,route.path);
 assert.equal(result.authoredEventCausalAgency,false);
 assert.equal(result.counterfactualKnowledge,false);
 assert.equal(result.meaningEngineInvoked,false);
 assert.equal(rehearseAuthoredExploration("change",[
  actions[0],{type:"explore_authored",sceneId:"unknown-dev"},
  ...actions.slice(2)]).status,"review_blocked");
 assert.equal(rehearseAuthoredExploration("change",[
  actions[0],{type:"scrub",stage:4},...actions.slice(1)]).status,"review_blocked");
 assert.equal(rehearseAuthoredExploration("change",[
  ...actions,{type:"revise_start",optionId:"stay"},{type:"scrub",stage:4}
 ]).status,"review_blocked");
});
test("None of six peer source-contract decisions can be overridden by proposal",()=>{
 assert.equal(GAME_IDS.length,6);
 for(const r of [DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21]){
  const out=selectMiniGameV22(r,{mode:"prototype",preferredGameId:"future_reveal"});
  assert.equal(out.selection_trace.evaluatedPeerIds.length,6);
  assert.notEqual(out.selected_game_id,"future_reveal");
  for(const id of ["balance_of_values","future_reveal"]){
   const blocked=tryB1Encounter(r,id,{actions:[],leftSlots:4,touched:true});
   assert.equal(blocked.status,"blocked");
   assert.equal("result" in blocked,false);
  }
 }
 const fake=runSelectedEncounterResearchV22(KIERKEGAARD_V21,
  {...selectMiniGameV22(KIERKEGAARD_V21,{mode:"prototype",preferredGameId:"swipe_decision"}),
   selected_game_id:"future_reveal"},
  {gameId:"future_reveal",path:["change","risk","continue"]},
  {isolated:true,publicVisibility:false,provisionalDisclosure:true});
 assert.notEqual(fake.status,"ready");
});
