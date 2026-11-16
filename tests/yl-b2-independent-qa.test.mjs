/**
 * CZ-123 B2 independent QA-only holdouts against PR #206 exact
 * 074da155c44d13f600c11b8ba6baf0f9d8b69f30.
 * No source text/editorial approval, engine or implementation modifications.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {B2_SOURCE_PROPOSALS,rehearseFictionalHours,
 rehearseAuthoredExploration,verifyNoB2Admission}
 from "../experiments/yl-b2-source-proposals.mjs";
import {createMilestoneAServer,milestoneACatalogue}
 from "../experiments/yl-milestone-a-server.mjs";
import {KIERKEGAARD_V21,DILLARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {listAuthoredPossibilities,inspectB1Source,
 QUALIFIED_WARRANTS}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
import {selectMiniGameV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";

const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 x!==null&&typeof x==="object"?"{"+Object.keys(x).sort().map(k=>
 JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":JSON.stringify(x);
const rem=(x,k)=>Object.fromEntries(Object.entries(x).filter(([key])=>key!==k));

test("QA1: independently recompute fingerprint, assert no reviewer identity or source admission",()=>{
 assert.equal(B2_SOURCE_PROPOSALS.length,2);
 for(const p of B2_SOURCE_PROPOSALS){
  const externalDigest="sha256:"+createHash("sha256").update(stable(rem(p,"proposalFingerprint"))).digest("hex");
  assert.equal(p.proposalFingerprint,externalDigest);
  assert.equal(p.editorialState,"REVIEW_PENDING");
  assert.equal(p.independentQualifiedReviewer,null);
  assert.equal(p.independentApprovedAt,null);
  assert.equal(p.gameSpecificApproval,"PENDING");
  assert.equal(p.publicationAllowed,false);
  assert.equal(Object.isFrozen(p.source),true);
  assert.notEqual(validateContentRecordV21(p).status,"valid_research_record");
 }
 assert.deepEqual(QUALIFIED_WARRANTS,[]);
 assert.equal(verifyNoB2Admission(),true);
});
test("QA2: reject altered resource accounting and false moral/earnings claims",()=>{
 const p=B2_SOURCE_PROPOSALS.find(p=>p.gameId==="balance_of_values");
 assert.match(p.canonicalCandidate.expectedModel,/NEW independently admitted/);
 assert.deepEqual(p.scenario.choiceIds,["paid_optional_furnishing","hours_kept"]);
 assert.ok(p.scenario.neverInfer.includes("moral value"));
 for(let left=0;left<=p.scenario.capacity;left++){
  const o=rehearseFictionalHours(p.proposalId,
   {leftSlots:left,rightSlots:p.scenario.capacity-left});
  assert.equal(o.status,"proposal_preview_only");
  assert.equal(o.fictionalHours.total,8);
  assert.equal(o.purelyAssumedEarnings,left*20);
  assert.equal(o.gameSourceApproved,false);
  assert.equal(o.expressionEngineInvoked,false);
 }
 for(const v of [{leftSlots:8,rightSlots:8},{leftSlots:2,rightSlots:7},
  {leftSlots:2,rightSlots:6,realityPredicted:true},
  {leftSlots:2,rightSlots:6.1},{leftSlots:"2",rightSlots:6}]){
  assert.equal(rehearseFictionalHours(p.proposalId,v).status,"review_blocked");
 }
});
test("QA3: multi-event source graph is only viewable, never caused by user",()=>{
 const all=KIERKEGAARD_V21.scenario.constraints.routes;
 assert.equal(all.length,8);
 for(const start of [...new Set(all.map(x=>x.path[0]))]){
  const choices=listAuthoredPossibilities(KIERKEGAARD_V21,start);
  assert.equal(choices.status,"research_options_only");
  for(const c of choices.options){
   assert.equal(c.causedByReader,false);
   assert.equal(c.unchosenFutureKnown,false);
   assert.equal(c.readerAction,"EXPLORE_ONLY");
   for(const r of all.filter(x=>x.path[0]===start&&x.path[1]===c.sceneId)){
    const events=[{type:"choose_start",optionId:start},
     {type:"explore_authored",sceneId:c.sceneId},
     {type:"choose_response",optionId:r.path[2]},
     {type:"read_retrospective"}];
    // Workbench demonstrates that the preapproved graph path can be normalized,
    // NOT that this game/source has passed qualified editorial admission.
    if(start==="change"){
     const o=rehearseAuthoredExploration(start,events);
     assert.equal(o.status,"proposal_preview_only",JSON.stringify(o));
     assert.deepEqual(o.canonicalPathFromExistingFrozenResearch.path,r.path);
     assert.equal(o.meaningEngineInvoked,false);
    }
   }
  }
 }
 const injected=rehearseAuthoredExploration("change",[
  {type:"choose_start",optionId:"change"},
  {type:"explore_authored",sceneId:"invented source future"},
  {type:"choose_response",optionId:"continue"},
  {type:"read_retrospective"}]);
 assert.equal(injected.status,"review_blocked");
});
test("QA4: real four-game research server still serves bounded three-section outputs",async()=>{
 const app=await createMilestoneAServer();
 try{
  const catalogue=milestoneACatalogue();
  for(const [record,game,choice] of [
   [DILLARD_V21,"trade_off",{amounts:[2,2,2],repetitions:5}],
   [DILLARD_V21,"token_studio",{amounts:[2,2,2],repetitions:5}],
   [KIERKEGAARD_V21,"decision_map",{path:["change","risk","continue"]}],
   [KIERKEGAARD_V21,"swipe_decision",{path:["change","risk","continue"]}]
  ]){
   assert.ok(catalogue.has(record.id));
   const response=await fetch(app.url+"/api/research/run",{
    method:"POST",
    headers:{"content-type":"application/json",origin:app.url},
    body:JSON.stringify({recordId:record.id,versionHash:record.versionHash,
     preferredGameId:game,choice:{gameId:game,...choice}})
   });
   const d=await response.json();
   assert.equal(response.status,200,JSON.stringify(d).slice(0,300));
   assert.equal(d.status,"ready");
   assert.equal(d.selectedGameId,game);
   assert.equal(d.result.expression.sections.length,3);
   assert.ok(d.result.expression.wordCount>=80&&d.result.expression.wordCount<=120);
   assert.equal(d.publicationAllowed,false);
  }
  for(const game of ["balance_of_values","future_reveal"]){
   const r=game==="balance_of_values"?DILLARD_V21:KIERKEGAARD_V21;
   assert.equal(inspectB1Source(r,game).status,"blocked");
   assert.notEqual(selectMiniGameV22(r,{mode:"prototype",
    preferredGameId:game}).selected_game_id,game);
   const res=await fetch(app.url+"/api/research/run",{
    method:"POST",headers:{"content-type":"application/json",origin:app.url},
    body:JSON.stringify({recordId:r.id,versionHash:r.versionHash,
     preferredGameId:game,choice:{gameId:game,amounts:[4,4],path:["change","risk","continue"]}})
   });
   assert.equal(res.status,422);
  }
  assert.equal(selectMiniGameV22(HEGEL_NO_FIT_V21).status,"no_fit");
 }finally{await app.close();}
});
