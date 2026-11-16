/**
 * CZ-123 independently written QA-only holdouts, scoped exact B2.3 developer
 * SHA 07d8ca2611821eef84a69550489deab327557921.
 *
 * Tests REAL six game positive engine execution. This is not scholarly
 * evidence, a 5-person novice study, a physical Safari run or browser QA.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {B23_SOURCE_CONTRACTS,FOUNDER_SOURCE_POLICY,
 B23_SIX_PEERS,selectMiniGameB23,runSelectedEncounterB23}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {SIX_PEER_GAMES,selectMiniGameV22,runSelectedEncounterResearchV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {GAME_IDS,validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {KIERKEGAARD_V21,DILLARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {normalizeFuture,inspectB1Source,QUALIFIED_WARRANTS}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
import {V20_WORD_POLICY}
 from "../philosophy-engine/encounter/emotion-strategy-v20.js";
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 x!==null&&typeof x==="object"?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const sha=x=>"sha256:"+createHash("sha256").update(stable(x)).digest("hex");
const wc=x=>x.trim().split(/\s+/).filter(Boolean).length;
const checkOutput=(out,id)=>{
 assert.equal(out.status,"ready",JSON.stringify(out).slice(0,350));
 assert.equal(out.selected_game_id,id);
 assert.equal(out.publicationAllowed,false);
 assert.equal(out.productionPlayable,false);
 const e=out.expression;
 assert.equal(e.status,"ready");
 assert.equal(e.sections.length,3);
 assert.deepEqual(e.sections.map(s=>s.label),["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=e.sections.map(x=>wc(x.text)),total=counts.reduce((a,b)=>a+b,0);
 assert.equal(total,e.wordCount,"expression words equal direct observed section text count");
 assert.ok(total>=V20_WORD_POLICY.total.min&&total<=V20_WORD_POLICY.total.max,JSON.stringify(counts));
 for(let i=0;i<3;i++)
  assert.ok(counts[i]>=V20_WORD_POLICY.sections[i].min&&
   counts[i]<=V20_WORD_POLICY.sections[i].max,JSON.stringify({i,counts}));
};
test("R0 original four unchanged by B23: exact source, meaning-equivalence and real 3-section READY",()=>{
 assert.equal(B23_SIX_PEERS.length,6);
 assert.deepEqual(B23_SIX_PEERS.map(x=>x.id),GAME_IDS);
 assert.equal(SIX_PEER_GAMES.filter(g=>g.browserPrototypeAvailable).length,4);
 const testCases=[
  [DILLARD_V21,"trade_off",{amounts:[4,1,1],repetitions:5}],
  [DILLARD_V21,"token_studio",{amounts:[4,1,1],repetitions:5}],
  [KIERKEGAARD_V21,"decision_map",{path:["stay","missed","reflect"]}],
  [KIERKEGAARD_V21,"swipe_decision",{path:["stay","missed","reflect"]}]
 ];
 let trade=null,branch=null;
 for(const [record,game,input] of testCases){
  const selection=selectMiniGameB23(record,{preferredGameId:game});
  assert.equal(selection.status,"research_selected");
  assert.deepEqual(selection.selection_trace.evaluatedPeerIds,GAME_IDS);
  const result=runSelectedEncounterB23(record,selection,input);
  checkOutput(result,game);
  const old=selectMiniGameV22(record,{mode:"prototype",preferredGameId:game});
  const historical=runSelectedEncounterResearchV22(record,old,{gameId:game,...input},
   {isolated:true,publicVisibility:false,provisionalDisclosure:true});
  assert.equal(historical.status,"ready");
  assert.deepEqual(result.meaning,historical.meaning);
  if(game==="trade_off")trade=result;
  if(game==="token_studio")assert.deepEqual(result.meaning,trade.meaning);
  if(game==="decision_map")branch=result;
  if(game==="swipe_decision")assert.deepEqual(result.meaning,branch.meaning);
 }
 assert.equal(selectMiniGameB23(HEGEL_NO_FIT_V21).status,"no_fit");
});
test("R1 founder policy is narrowly research-only and CANNOT be forged as academic or public authority",()=>{
 assert.equal(FOUNDER_SOURCE_POLICY.independentlyQualifiedScholarlyApproval,false);
 assert.equal(FOUNDER_SOURCE_POLICY.quotedTranslationApprovedForPublication,false);
 assert.equal(FOUNDER_SOURCE_POLICY.productionAllowed,false);
 assert.equal(QUALIFIED_WARRANTS.length,0);
 for(const p of B23_SOURCE_CONTRACTS){
  const actual=sha({
   version:p.version,recordId:p.recordId,gameId:p.gameId,source:p.source,
   scenario:p.scenario,proposalFingerprint:p.proposalFingerprint,
   meaningModelVersion:p.meaningModelVersion
  });
  assert.equal(actual,p.contentFingerprint);
  assert.equal(p.independentlyScholarlyApproved,false);
  assert.equal(p.contentEditoriallyVerified,false);
  assert.equal(p.publicationAllowed,false);
  assert.equal(validateContentRecordV21(p).status,"invalid");
  assert.equal(inspectB1Source(p,p.gameId).status,"blocked");
  const forged={...p,editorialAuthority:"qualified_independent_pass"};
  assert.equal(selectMiniGameB23(forged).status,"blocked");
  const forgedSource={...p,source:{...p.source,referenceUrl:"https://fake.invalid/source"}};
  assert.equal(selectMiniGameB23(forgedSource).status,"blocked");
  const corrupt={...p,contentFingerprint:"sha256:"+"a".repeat(64)};
  assert.equal(selectMiniGameB23(corrupt).status,"blocked");
 }
});
test("R2 three distinct Thoreau budget choices change reasoned result with NO invented moral score",()=>{
 const p=B23_SOURCE_CONTRACTS.find(x=>x.gameId==="balance_of_values");
 const selection=selectMiniGameB23(p,{preferredGameId:"balance_of_values"});
 assert.equal(selection.status,"research_selected");
 const seen=new Set();
 for(const n of [0,2,4,6,8]){
  const r=runSelectedEncounterB23(p,selection,{leftSlots:n,touched:true});
  checkOutput(r,"balance_of_values");
  assert.deepEqual(r.canonical_choice.amounts,[n,8-n]);
  assert.deepEqual(r.canonical_choice.budgets,[8]);
  assert.equal(r.meaning.structure.measure,n);
  assert.equal(r.expressionVerification,"frozen_v12_semantic_not_v20");
  assert.equal(r.emotion.v20Verified,false,"Do NOT claim frozen v2 Emotion/Expression converted");
  assert.equal(r.provenance.fictionalHourlyWage,20);
  assert.equal(r.provenance.actualPurchaseInferred,false);
  assert.match(r.expression.sections[1].text,/Thoreau|life/i);
  assert.doesNotMatch(JSON.stringify(r.canonical_choice),/moralScore|virtue|purchaseSucceeded/);
  seen.add(r.meaning.meaning.text);
 }
 assert.ok(seen.size>=3,"Different hour allocations should yield diverse philosophical consequences");
 for(const b of [
  {leftSlots:4,touched:false},{leftSlots:9,touched:true},{leftSlots:-1,touched:true},
  {leftSlots:2.5,touched:true},{leftSlots:2,touched:true,authorship:"scholar"},
  {leftSlots:NaN,touched:true}
 ]){
  const r=runSelectedEncounterB23(p,selection,b);
  assert.equal(r.status,"blocked",JSON.stringify(r));
 }
});
test("R2 all eight Kierkegaard historical graph paths are hypothetical authored-stage choices, NOT external event causation",()=>{
 const p=B23_SOURCE_CONTRACTS.find(x=>x.gameId==="future_reveal");
 const selection=selectMiniGameB23(p,{preferredGameId:"future_reveal"});
 assert.equal(selection.status,"research_selected");
 const seen=new Set();
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [start,sceneId,response]=route.path;
  const actions=[{type:"choose_start",optionId:start},
    {type:"explore_authored",sceneId},
    {type:"choose_response",optionId:response},
    {type:"read_retrospective"}];
  const r=runSelectedEncounterB23(p,selection,{actions});
  checkOutput(r,"future_reveal");
  assert.deepEqual(r.canonical_choice.path,[start,sceneId,response]);
  assert.equal(r.provenance.readerExploredFiction,true);
  assert.equal(r.provenance.authoredEventCausedByReader,false);
  assert.equal(r.provenance.predictedActualFuture,false);
  assert.equal(r.provenance.unchosenFutureKnown,false);
  assert.equal(r.expressionVerification,"frozen_v20");
  seen.add(JSON.stringify(r.canonical_choice.path));
 }
 assert.equal(seen.size,8);
 const malicious=[
  [{type:"choose_start",optionId:"change"},{type:"explore_authored",sceneId:"future-prediction"}],
  [{type:"choose_start",optionId:"change"},{type:"scrub",stage:4}],
  [{type:"choose_start",optionId:"change"},{type:"reveal_authored"}],
  [{type:"choose_start",optionId:"change"},
   {type:"explore_authored",sceneId:"risk"},{type:"choose_response",optionId:"continue"},
   {type:"read_retrospective"},{type:"revise_start",optionId:"stay"},
   {type:"scrub",stage:4}],
  [{type:"choose_start",optionId:"stay"},{type:"explore_authored",sceneId:"missed"},
   {type:"choose_response",optionId:"fake"}]
 ];
 for(const actions of malicious){
  const r=runSelectedEncounterB23(p,selection,{actions});
  assert.equal(r.status,"blocked",JSON.stringify(r));
 }
});
