/**
 * CZ-123 independent FINAL B2.4 holdouts, reviewed EXACT SHA
 * 5bb9b69d695b713b91cd947c1b7aba4fabe233a0.
 * The tests are in a separate QA-only branch. No implementation mutations.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {B23_SOURCE_CONTRACTS,selectMiniGameB23,runSelectedEncounterB23}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {runSelectedEncounterB24}
 from "../experiments/yl-b24-encounter.mjs";
import {selectEmotionB24,renderConversionEncounterB24,
 validateConversionEncounterB24,B24_BRIDGE_VERSION}
 from "../experiments/yl-b24-conversion-bridge.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {reasonSemantically}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {selectMiniGameV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {QUALIFIED_WARRANTS,inspectB1Source,normalizeFuture}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
const words=s=>s.trim().split(/\s+/).filter(Boolean).length;
const expectSections=r=>{
 assert.equal(r.status,"ready",JSON.stringify(r).slice(0,280));
 assert.equal(r.expression.sections.length,3);
 assert.deepEqual(r.expression.sections.map(s=>s.label),[
   "Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=r.expression.sections.map(s=>words(s.text));
 assert.equal(counts.reduce((a,b)=>a+b,0),r.expression.wordCount);
 assert.ok(r.expression.wordCount>=80&&r.expression.wordCount<=120,JSON.stringify(counts));
 for(let i=0;i<3;i++)assert.ok(counts[i]>=[10,18,9][i]&&counts[i]<=[48,65,26][i]);
 assert.equal(r.publicationAllowed,false);
 assert.equal(r.productionPlayable,false);
};
test("R0: one unchanged six-peer selector and byte-equivalent original four output semantics",()=>{
 const cases=[
  [DILLARD_V21,"trade_off",{amounts:[0,4,2],repetitions:5}],
  [DILLARD_V21,"token_studio",{amounts:[0,4,2],repetitions:5}],
  [KIERKEGAARD_V21,"decision_map",{path:["change","surprise","adapt"]}],
  [KIERKEGAARD_V21,"swipe_decision",{path:["change","surprise","adapt"]}]
 ];
 const meaningGroups=new Map();
 for(const [record,id,choice] of cases){
  const selection=selectMiniGameB23(record,{preferredGameId:id});
  assert.deepEqual(selection.selection_trace.evaluatedPeerIds,[
   "trade_off","decision_map","token_studio","balance_of_values","swipe_decision","future_reveal"]);
  const result=runSelectedEncounterB24(record,selection,choice);
  const baseline=runSelectedEncounterB23(record,selection,choice);
  expectSections(result);
  assert.deepEqual(result.meaning,baseline.meaning);
  assert.deepEqual(result.expression,baseline.expression);
  assert.equal(result.expressionVerification,baseline.expressionVerification);
  const family=id==="trade_off"||id==="token_studio"?"allocation":"branch";
  if(meaningGroups.has(family))assert.deepEqual(result.meaning,meaningGroups.get(family));
  else meaningGroups.set(family,result.meaning);
 }
 assert.equal(selectMiniGameB23(HEGEL_NO_FIT_V21).status,"no_fit");
 assert.equal(selectMiniGameV22(HEGEL_NO_FIT_V21).status,"no_fit");
});
test("R1: frozen kernel source/choice is replayable; new Emotion/Expression no v1.2 fallback",()=>{
 const contract=B23_SOURCE_CONTRACTS[0],sel=selectMiniGameB23(contract);
 assert.equal(QUALIFIED_WARRANTS.length,0);
 assert.equal(inspectB1Source(contract,contract.gameId).status,"blocked");
 const first=[],second=[];
 for(let h=0;h<=8;h++){
  const a=runSelectedEncounterB24(contract,sel,{leftSlots:h,touched:true,focus:"life_exchanged"});
  const b=runSelectedEncounterB24(contract,sel,{leftSlots:h,touched:true,focus:"time_kept"});
  for(const r of [a,b]){
   expectSections(r);
   assert.equal(r.expressionVerification,B24_BRIDGE_VERSION);
   assert.equal(r.expression.version,"encounter-output-v2-compatible/2.4.0");
   assert.equal(r.emotion.version,"emotion-strategy-v2-compatible/2.4.0");
   assert.equal(r.emotion.inferredReaderEmotion,false);
   assert.doesNotMatch(JSON.stringify(r.expression),
    /frozen_v12_semantic_not_v20|semantic-expression\/1\.2/);
   assert.equal(r.meaning.meaning.evidence.measure,h);
   assert.equal(r.provenance.actualPurchaseInferred,false);
   assert.equal(r.provenance.moralValueScoreInferred,false);
   assert.match(r.expression.sections[1].text,/invented/i);
   assert.match(r.expression.sections[1].text,/cannot rank/i);
   assert.match(r.expression.sections[1].text,/life exchanged/i);
  }
  assert.deepEqual(a.meaning,b.meaning,"Lens cannot rewrite what happened");
  assert.notDeepEqual(a.expression.sections[1].text,b.expression.sections[1].text,
   "Interpretive lens actually teaches a different question, not new moral facts");
  first.push(a.meaning.meaning.text);second.push(b.meaning.meaning.text);
 }
 assert.ok(new Set(first).size>1);
 assert.deepEqual(first,second);
});
test("R1: unrecognized content, forged source, invalid agency and source-hash alteration abstain",()=>{
 const p=B23_SOURCE_CONTRACTS[0],sel=selectMiniGameB23(p);
 const canonical={amounts:[5,3],budgets:[8]};
 const meaning=reasonSemantically(p.context,canonical);
 assert.equal(meaning.status,"ready");
 const x=renderConversionEncounterB24(meaning,p,canonical,{focus:"time_kept"});
 assert.equal(x.status,"ready");
 assert.equal(validateConversionEncounterB24(meaning,p,canonical,"time_kept",x).status,"ready");
 for(const edit of [
  {...x,wordCount:0},
  {...x,sourceReview:"qualified_independent_pass"},
  {...x,sections:x.sections.map((s,i)=>i===1?{...s,text:s.text+" This is always virtuous."}:s)},
  {...x,brief:{...x.brief,inferredReaderEmotion:true}}
 ])assert.equal(validateConversionEncounterB24(meaning,p,canonical,"time_kept",edit).status,
  "needs_editorial_review");
 const falseSource={...p,contentFingerprint:"sha256:"+ "1".repeat(64)};
 assert.equal(runSelectedEncounterB24(falseSource,sel,{leftSlots:2,touched:true}).status,"blocked");
 const syntheticNew={...p,recordId:"research:novel-unseen:random-idea",
   source:{...p.source,author:"Anonymous author",quote:"A novel source should have its own contract."}};
 assert.equal(runSelectedEncounterB24(syntheticNew,sel,{leftSlots:2,touched:true}).status,"blocked");
 for(const bad of [
  {leftSlots:2,touched:true,focus:"moral_weights"},
  {leftSlots:1.5,touched:true,focus:"time_kept"},
  {leftSlots:8.5,touched:true,focus:"time_kept"},
  {leftSlots:2,touched:true,focus:"time_kept",independentReviewer:"FORGED"},
  {leftSlots:3,touched:false,focus:"life_exchanged"}
 ])assert.equal(runSelectedEncounterB24(p,sel,bad).status,"blocked");
 const badMeaning={...meaning,sourceAdmission:{...meaning.sourceAdmission,
  independentlySourceVerified:true}};
 assert.equal(selectEmotionB24(badMeaning,p,canonical,{focus:"time_kept"}).status,
  "needs_editorial_review");
});
test("R2: all 8 source-owned fictional Kierkegaard routes, revisions and incompatible scenarios",()=>{
 const p=B23_SOURCE_CONTRACTS[1],sel=selectMiniGameB23(p),seen=new Set();
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [a,b,c]=route.path,actions=[
   {type:"choose_start",optionId:a},
   {type:"explore_authored",sceneId:b},
   {type:"choose_response",optionId:c},{type:"read_retrospective"}];
  const result=runSelectedEncounterB24(p,sel,{actions});
  expectSections(result);
  assert.equal(result.expressionVerification,"frozen_v20");
  assert.equal(result.provenance.readerExploredFiction,true);
  assert.equal(result.provenance.authoredEventCausedByReader,false);
  assert.equal(result.provenance.unchosenFutureKnown,false);
  assert.deepEqual(result.canonical_choice.path,[a,b,c]);
  seen.add(JSON.stringify(route.path));
 }
 assert.equal(seen.size,8);
 for(const actions of [
  [{type:"choose_start",optionId:"stay"},{type:"explore_authored",sceneId:"risk"}],
  [{type:"choose_start",optionId:"stay"},{type:"reveal_authored"}],
  [{type:"choose_start",optionId:"stay"},{type:"scrub",stage:4}],
  [{type:"choose_start",optionId:"change"},
   {type:"explore_authored",sceneId:"risk"},
   {type:"choose_response",optionId:"continue"},
   {type:"read_retrospective"},
   {type:"revise_start",optionId:"stay"},
   {type:"scrub",stage:3}]
 ])assert.equal(runSelectedEncounterB24(p,sel,{actions}).status,"blocked");
});
