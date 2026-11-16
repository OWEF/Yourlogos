import {test} from "node:test";
import assert from "node:assert/strict";
import {PAIR_SOURCE_RECORDS,inspectPairSource,reasonAboutPairsB26,
 runPairEncounterB26,validatePairExpressionB26,RELATION_MEANING_VERSION}
 from "../experiments/yl-b26-relations.mjs";
import {assessInteractionFamiliesB26,INTERACTION_FAMILIES}
 from "../experiments/yl-b26-four-family-contract.mjs";
import {runFourFamilyEncounterB26}
 from "../experiments/yl-b26-encounter.mjs";
import {catalogueB26}
 from "../experiments/yl-b26-preview-server.mjs";
import {B25_BALANCE_CONTRACTS}
 from "../experiments/yl-b25-authored-scenarios.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {B23_SOURCE_CONTRACTS}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {selectMiniGameB25,runSelectedEncounterB25}
 from "../experiments/yl-b25-encounter.mjs";
const words=x=>x.trim().split(/\s+/).filter(Boolean).length;
function check(result,kind){
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,650));
 assert.equal(result.selectedFamilyId,kind);
 assert.equal(result.publicationAllowed,false);
 assert.equal(result.expression.sections.length,3);
 assert.deepEqual(result.expression.sections.map(x=>x.label),[
  "Your Choice","Back to the Philosopher","One Last Thing…"]);
 const n=result.expression.sections.map(s=>words(s.text)),total=n.reduce((a,b)=>a+b,0);
 assert.equal(total,result.expression.wordCount);
 assert.ok(total>=80&&total<=120,JSON.stringify({total,n}));
 for(let i=0;i<3;i++)assert.ok(n[i]>=[10,18,9][i]&&n[i]<=[48,65,26][i]);
}
test("exactly FOUR exposed families, existing six internal engines unchanged and no-fit source",()=>{
 assert.deepEqual(INTERACTION_FAMILIES,[
  "balance_move","decision_cards","tap_pair","flip_reveal"]);
 assert.equal(assessInteractionFamiliesB26(HEGEL_NO_FIT_V21).status,"no_fit");
 assert.equal(assessInteractionFamiliesB26({
  author:"Unknown",quote:"Invented words"}).status,"blocked");
 assert.equal(catalogueB26().length,8);
 assert.equal(catalogueB26({qa:true}).length,9);
 const last=catalogueB26({qa:true}).at(-1);
 assert.equal(last.sourceStatus,"no_fit");
 assert.equal(last.familyId,null);
 for(const src of catalogueB26()) {
  assert.ok(src.familyId&&INTERACTION_FAMILIES.includes(src.familyId));
  assert.equal(src.eligibleFamilies.filter(x=>x.eligible).length,1);
  assert.equal(src.publicationAllowed,false);
 }
});
test("Genuine Tap & Pair relation engine: distinct Epictetus and Smith contracts, one/two valid pairs and source warrants",()=>{
 assert.equal(PAIR_SOURCE_RECORDS.length,2);
 assert.equal(new Set(PAIR_SOURCE_RECORDS.map(x=>x.source.author)).size,2);
 let complete=0;
 for(const c of PAIR_SOURCE_RECORDS){
  assert.equal(inspectPairSource(c),c);
  assert.equal(c.cards.length,4);
  assert.ok(c.edges.length>=4);
  assert.ok(c.source.referenceUrl.startsWith("https://"));
  const sel=assessInteractionFamiliesB26(c);
  assert.equal(sel.status,"research_selected");
  assert.equal(sel.selectedFamilyId,"tap_pair");
  assert.deepEqual(sel.selectionTrace.evaluatedFamilies,INTERACTION_FAMILIES);
  for(const e of c.edges){
   const single={pairs:[{aId:e.bId,bId:e.aId,relationId:e.relationId}]};
   const r=runFourFamilyEncounterB26(c,sel,single);
   check(r,"tap_pair");
   assert.equal(r.meaning.version,RELATION_MEANING_VERSION);
   assert.equal(r.meaning.source.quote,c.source.quote);
   assert.equal(r.meaning.meaning.selectedRelations.length,1);
   assert.equal(r.expression.author,c.source.author);
   assert.equal(r.expression.quote,c.source.quote);
   assert.equal(r.emotion.inferredActualEmotion,false);
   assert.equal(r.emotion.inferredMoralRank,false);
   assert.equal(r.provenance.hiddenCorrectAnswer,false);
   assert.equal(validatePairExpressionB26(c,single,r.expression).status,"ready");
   complete++;
  }
  for(let i=0;i<c.edges.length;i++)for(let j=i+1;j<c.edges.length;j++){
   const a=c.edges[i],b=c.edges[j];
   const pair={pairs:[
    {aId:a.aId,bId:a.bId,relationId:a.relationId},
    {aId:b.aId,bId:b.bId,relationId:b.relationId}
   ]};
   const r=runFourFamilyEncounterB26(c,sel,pair);
   check(r,"tap_pair");
   assert.equal(r.meaning.meaning.selectedRelations.length,2);
   complete++;
  }
 }
 assert.ok(complete>=25,"Every authored edge and two-link pairing is tested");
});
test("Tap & Pair refuses fake quotes, unknown edges, wrong relations, duplicate/too many, tampered expression",()=>{
 const c=PAIR_SOURCE_RECORDS[0],sel=assessInteractionFamiliesB26(c);
 const e=c.edges[0],one={pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId}]};
 for(const input of [
  {pairs:[]},{pairs:[{aId:"fake",bId:e.bId,relationId:e.relationId}]},
  {pairs:[{aId:e.aId,bId:e.bId,relationId:"contradiction"}]},
  {pairs:[{aId:e.aId,bId:e.aId,relationId:e.relationId}]},
  {pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId},
   {aId:e.bId,bId:e.aId,relationId:e.relationId}]},
  {pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId},one.pairs[0],one.pairs[0]]},
  {pairs:one.pairs,score:100}
 ])assert.notEqual(runFourFamilyEncounterB26(c,sel,input).status,"ready");
 assert.equal(inspectPairSource({...c,source:{...c.source,quote:"Fake"}}),null);
 assert.notEqual(assessInteractionFamiliesB26({...c,source:{...c.source,quote:"Fake"}}).status,
  "research_selected");
 const correct=runPairEncounterB26(c,one);
 assert.equal(correct.status,"ready");
 assert.equal(validatePairExpressionB26(c,one,{
  ...correct.expression,sections:correct.expression.sections.map((s,i)=>
  i===1?{...s,text:s.text+" Everyone must forgive you."}:s)
 }).status,"needs_editorial_review");
 assert.equal(assessInteractionFamiliesB26(DILLARD_V21,
  {preferredFamilyId:"tap_pair"}).status,"capability_research");
});
test("Shared canonical balance state preserves source budget, units and identical B2.5 reasoning",()=>{
 for(const c of B25_BALANCE_CONTRACTS){
  const sel=assessInteractionFamiliesB26(c);
  assert.equal(sel.selectedFamilyId,"balance_move");
  const cap=c.scenario.capacity,units=[Math.floor(cap/2),cap-Math.floor(cap/2)];
  const choice={amounts:units,budgets:[cap],touched:true,
   focus:c.editorial.lenses[0].id};
  const result=runFourFamilyEncounterB26(c,sel,choice);
  check(result,"balance_move");
  const legacySel=selectMiniGameB25(c,{preferredGameId:"balance_of_values"});
  const legacy=runSelectedEncounterB25(c,legacySel,
   {leftSlots:units[0],touched:true,focus:choice.focus});
  assert.deepEqual(result.meaning,legacy.meaning);
  assert.deepEqual(result.expression,legacy.expression);
  assert.deepEqual(result.canonical_choice,legacy.canonical_choice);
  assert.equal(result.provenance.unusedCapacity,0);
  assert.equal(runFourFamilyEncounterB26(c,sel,{
   ...choice,amounts:[cap,cap]}).status,"blocked");
 }
 const sel=assessInteractionFamiliesB26(DILLARD_V21);
 const d=runFourFamilyEncounterB26(DILLARD_V21,sel,
  {amounts:[2,3,1],budgets:[6],repetitions:5,touched:true});
 check(d,"balance_move");
 const old=runSelectedEncounterB25(DILLARD_V21,
  selectMiniGameB25(DILLARD_V21,{preferredGameId:"trade_off"}),
  {amounts:[2,3,1],repetitions:5});
 assert.deepEqual(d.meaning,old.meaning);
 assert.deepEqual(d.expression,old.expression);
});
test("Decision Cards and Flip Reveal preserve all original Kierkegaard source paths and noncausal agency",()=>{
 const branch=assessInteractionFamiliesB26(KIERKEGAARD_V21);
 assert.equal(branch.selectedFamilyId,"decision_cards");
 const decision=runFourFamilyEncounterB26(KIERKEGAARD_V21,branch,
  {path:["change","risk","continue"]});
 check(decision,"decision_cards");
 assert.equal(assessInteractionFamiliesB26(KIERKEGAARD_V21,
  {preferredFamilyId:"flip_reveal"}).status,"no_fit");
 const record=B23_SOURCE_CONTRACTS[1],flip=assessInteractionFamiliesB26(record);
 assert.equal(flip.selectedFamilyId,"flip_reveal");
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [start,scene,response]=route.path,actions=[
   {type:"choose_start",optionId:start},
   {type:"explore_authored",sceneId:scene},
   {type:"choose_response",optionId:response},
   {type:"read_retrospective"}
  ];
  const r=runFourFamilyEncounterB26(record,flip,{actions});
  check(r,"flip_reveal");
  assert.deepEqual(r.canonical_choice.path,route.path);
  assert.equal(r.provenance.authoredEventCausedByReader,false);
  assert.equal(r.provenance.unchosenFutureKnown,false);
 }
 for(const actions of [
  [{type:"choose_start",optionId:"stay"},{type:"explore_authored",sceneId:"risk"}],
  [{type:"choose_start",optionId:"change"},{type:"scrub",stage:4}],
  [{type:"choose_start",optionId:"change"},{type:"reveal_authored"}]
 ])assert.notEqual(runFourFamilyEncounterB26(record,flip,{actions}).status,"ready");
});
