/** CZ-123 B1 QA-only holdout. Candidate exact c8b08562177148319c98d9cc8a37b78e73ff9b0c.
 * No implementation or source-record code changed by this QA branch.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {GAME_IDS,contentFingerprintV21,validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {assessAllSixPeerGames,sourceBoundBranchParity,authoritativeContextForRecord}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {selectMiniGameV22,runSelectedEncounterResearchV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {inspectB1Source,tryB1Encounter,normalizeFuture,QUALIFIED_WARRANTS}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
const clone=x=>JSON.parse(JSON.stringify(x));
const records=[DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21];
test("fresh QA: 6 peers still assessed; no B1 source falsely selected",()=>{
 assert.deepEqual(GAME_IDS,["trade_off","decision_map","token_studio",
  "balance_of_values","swipe_decision","future_reveal"]);
 assert.equal(QUALIFIED_WARRANTS.length,0);
 for(const r of records){
  const caps=assessAllSixPeerGames(r,GAME_IDS);
  assert.equal(caps.length,6);
  for(const g of ["balance_of_values","future_reveal"]){
   assert.equal(caps.find(x=>x.id===g).eligible,false);
   assert.equal(inspectB1Source(r,g).status,"blocked");
   assert.equal("result" in tryB1Encounter(r,g,{leftSlots:3,touched:true}),false);
   assert.equal("result" in tryB1Encounter(r,g,{actions:[]}),false);
  }
  const picked=selectMiniGameV22(r,{mode:"prototype",preferredGameId:"balance_of_values"});
  assert.equal(picked.selection_trace.evaluatedPeerIds.length,6);
  assert.notEqual(picked.selected_game_id,"balance_of_values");
 }
});
test("fresh QA: source hash rewriting and false-review injection cannot admit game",()=>{
 const counterfeit=clone(DILLARD_V21);
 counterfeit.scenario.choices=counterfeit.scenario.choices.slice(0,2);
 counterfeit.scenario.constraints.costs=[1,1];
 counterfeit.gameCompatibility.find(x=>x.id==="balance_of_values").eligible=true;
 counterfeit.source.reviewState="source_verified";
 counterfeit.source.reviewSignoff={reviewer:"attacker",reviewedAt:"now",
  versionHash:counterfeit.versionHash,passageLocation:"now",
  translationEdition:"now"};
 counterfeit.versionHash=contentFingerprintV21(counterfeit);
 assert.notEqual(validateContentRecordV21(counterfeit).status,"valid_research_record");
 assert.equal(inspectB1Source(counterfeit,"balance_of_values").status,"blocked");
 assert.equal(tryB1Encounter(counterfeit,"balance_of_values",
  {leftSlots:3,touched:true,approval:"approved"}).status,"blocked");
});
test("fresh QA: author event is not determined after first fictional choice",()=>{
 assert.equal(sourceBoundBranchParity(KIERKEGAARD_V21,
  authoritativeContextForRecord(KIERKEGAARD_V21)).ok,true);
 const paths=KIERKEGAARD_V21.scenario.constraints.routes;
 const starts=[...new Set(paths.map(r=>r.path[0]))];
 assert.ok(starts.length>=2);
 for(const start of starts){
  const events=[...new Set(paths.filter(r=>r.path[0]===start).map(r=>r.path[1]))];
  assert.ok(events.length>1,"Every branch needs independently authored event-selection policy");
  const attempt=normalizeFuture(KIERKEGAARD_V21,[
   {type:"choose_start",optionId:start},{type:"reveal_authored"}]);
  assert.equal(attempt.code,"source_ambiguity");
  assert.equal(normalizeFuture(KIERKEGAARD_V21,[
   {type:"choose_start",optionId:start},{type:"reveal_authored",eventId:events[0]}]).code,
   "forged_event");
  assert.equal(normalizeFuture(KIERKEGAARD_V21,[
   {type:"choose_start",optionId:start},{type:"revise_start",optionId:start},
   {type:"scrub",stage:2}]).code,"stage_locked");
 }
});
test("fresh QA: no-fit and client-made game selection never yields an engine encounter",()=>{
 const req={mode:"prototype",preferredGameId:"future_reveal"};
 const selection=selectMiniGameV22(KIERKEGAARD_V21,req);
 assert.notEqual(selection.selected_game_id,"future_reveal");
 const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
 const forged=clone(selection);
 forged.selected_game_id="future_reveal";
 const result=runSelectedEncounterResearchV22(KIERKEGAARD_V21,forged,
  {gameId:"future_reveal",path:["change","surprise","adapt"]},env);
 assert.notEqual(result.status,"ready");
 assert.equal(result.publicationAllowed,false);
 assert.equal(inspectB1Source(HEGEL_NO_FIT_V21,"future_reveal").status,"blocked");
});
