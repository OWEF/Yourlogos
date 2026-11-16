/**
 * CZ-144 exact-SHA independently authored semantic holdouts.
 * Developer SHA: 3cdceedb776c46acd45c3beb0079780e7d16a263
 * QA-only source/meaning/selection tests. No implementation mutations.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {PAIR_SOURCE_RECORDS,inspectPairSource,reasonAboutPairsB26,
 runPairEncounterB26,validateCanonicalPairsB26,validatePairExpressionB26}
 from "../experiments/yl-b26-relations.mjs";
import {assessInteractionFamiliesB26,INTERACTION_FAMILIES}
 from "../experiments/yl-b26-four-family-contract.mjs";
import {runFourFamilyEncounterB26}
 from "../experiments/yl-b26-encounter.mjs";
import {catalogueB26}
 from "../experiments/yl-b26-preview-server.mjs";
import {B25_BALANCE_CONTRACTS,stableB25}
 from "../experiments/yl-b25-authored-scenarios.mjs";
import {B23_SOURCE_CONTRACTS}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticSources}
 from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {selectMiniGameB25,runSelectedEncounterB25}
 from "../experiments/yl-b25-encounter.mjs";
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 x!==null&&typeof x==="object"?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const digest=x=>"sha256:"+createHash("sha256").update(stable(x)).digest("hex");
const wc=s=>s.trim().split(/\s+/).filter(Boolean).length;
function judge(r,id){
 assert.equal(r.status,"ready",JSON.stringify(r).slice(0,500));
 assert.equal(r.selectedFamilyId,id);
 assert.equal(r.publicationAllowed,false);
 assert.equal(r.productionPlayable,false);
 assert.equal(r.accountPersistenceAllowed,false);
 const e=r.expression;
 assert.equal(e.sections.length,3);
 assert.deepEqual(e.sections.map(s=>s.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=e.sections.map(s=>wc(s.text)),total=counts.reduce((a,b)=>a+b,0);
 assert.equal(total,e.wordCount);
 assert.ok(total>=80&&total<=120,JSON.stringify({total,counts}));
 for(let i=0;i<3;i++)assert.ok(counts[i]>=[10,18,9][i]&&counts[i]<=[48,65,26][i]);
}
test("R0 independent exact-record audit: 4 visible families, eight content records, Hegel no_fit",()=>{
 assert.deepEqual(INTERACTION_FAMILIES,[
  "balance_move","decision_cards","tap_pair","flip_reveal"]);
 const all=catalogueB26(),matrix=new Map();
 assert.equal(all.length,8);
 for(const row of all){
  assert.ok(INTERACTION_FAMILIES.includes(row.familyId));
  assert.equal(row.sourceStatus,"research_selected");
  assert.equal(row.eligibleFamilies.length,4);
  assert.ok(row.eligibleFamilies.find(x=>x.id===row.familyId)?.eligible);
  assert.equal(row.publicationAllowed,false);
  assert.ok(typeof row.quote==="string"&&row.quote.length>15,
   "Exact source quote must be populated even for old nested research records: "+row.key);
  assert.ok(typeof row.author==="string"&&row.author.length>3);
  assert.ok(row.sourceFingerprint?.length>10);
  matrix.set(row.key,row.familyId);
 }
 assert.deepEqual(Object.fromEntries(matrix),{
  dillard:"balance_move",kierkegaard_map:"decision_cards",
  thoreau_balance:"balance_move",kierkegaard_future:"flip_reveal",
  thoreau_weekend:"balance_move",dillard_pattern:"balance_move",
  epictetus_relations:"tap_pair",smith_relations:"tap_pair"
 });
 const rejected=assessInteractionFamiliesB26(HEGEL_NO_FIT_V21);
 assert.equal(rejected.status,"no_fit");
 assert.equal(assessInteractionFamiliesB26({author:"Novel invented author",
  quote:"Some fabricated philosophy cannot be routed."}).status,"blocked");
 assert.equal(catalogueB26({qa:true}).at(-1).familyId,null);
 for(const c of PAIR_SOURCE_RECORDS){
  assert.equal(c.source.quote,c.source.author===semanticSources.smith.author?
   semanticSources.smith.quote:semanticSources.epictetus.quote);
  const {sourceFingerprint,...data}=c;
  assert.equal(digest(data),sourceFingerprint);
  assert.equal(inspectPairSource(c),c);
  assert.equal(c.source.reviewState,"founder_provisional");
  assert.equal(c.independentlyScholarlyApproved,false);
 }
});
test("R1 two *distinct source authors*: source-evidenced relation and two-link holdouts, no fake scoring",()=>{
 assert.equal(new Set(PAIR_SOURCE_RECORDS.map(c=>c.source.author)).size,2);
 for(const record of PAIR_SOURCE_RECORDS){
  const sel=assessInteractionFamiliesB26(record);
  const pairs=[
   [record.edges[2]],
   [record.edges[1],record.edges[4]]
  ];
  for(const edges of pairs){
   const input={pairs:edges.map((e,i)=>({
    aId:i%2?e.aId:e.bId,bId:i%2?e.bId:e.aId,relationId:e.relationId
   }))};
   const normalized=validateCanonicalPairsB26(input,record);
   assert.equal(normalized.status,"valid");
   const result=runFourFamilyEncounterB26(record,sel,input);
   judge(result,"tap_pair");
   assert.equal(result.meaning.meaning.kind,"source_warranted_relation");
   assert.equal(result.meaning.meaning.selectedRelations.length,edges.length);
   assert.equal(result.meaning.source.quote,record.source.quote);
   assert.deepEqual(result.meaning.evidenceIds,[
    "source:central","scenario:fictional","source:boundary"]);
   assert.equal(result.emotion.inferredActualEmotion,false);
   assert.equal(result.emotion.inferredMoralRank,false);
   assert.equal(result.provenance.hiddenCorrectAnswer,false);
   assert.equal(validatePairExpressionB26(record,input,result.expression).status,"ready");
   assert.doesNotMatch(JSON.stringify(result),/moral score|you are virtuous|you must/i);
   assert.ok(result.expression.sections[1].text.includes(
    record.warrant.centralClaim),"Section II must teach the actual authored source claim");
  }
 }
});
test("R1 adversarial missing relation, forged source/authorship, duplicate/incomplete pair and tampered result",()=>{
 const record=PAIR_SOURCE_RECORDS[1],selection=assessInteractionFamiliesB26(record);
 const e=record.edges[0],p={pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId}]};
 const good=runPairEncounterB26(record,p);judge({...good,
  selectedFamilyId:"tap_pair",accountPersistenceAllowed:false},"tap_pair");
 for(const input of [
  {pairs:[]},{pairs:[{aId:"never",bId:e.bId,relationId:e.relationId}]},
  {pairs:[{aId:e.aId,bId:e.bId,relationId:"moral_superiority"}]},
  {pairs:[{aId:e.aId,bId:e.aId,relationId:e.relationId}]},
  {pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId},
   {aId:e.bId,bId:e.aId,relationId:e.relationId}]},
  {pairs:p.pairs,score:100},
  {pairs:[p.pairs[0],p.pairs[0],p.pairs[0]]}
 ])assert.notEqual(runFourFamilyEncounterB26(record,selection,input).status,"ready");
 const forgeries=[
  {...record,source:{...record.source,quote:"Unknown invented phrase"}},
  {...record,source:{...record.source,author:"Plato"}},
  {...record,warrant:{...record.warrant,limitations:"Everyone becomes morally superior"}},
  {...record,independentlyScholarlyApproved:true},
  {...record,sourceFingerprint:"sha256:"+"0".repeat(64)}
 ];
 for(const c of forgeries){
  assert.equal(inspectPairSource(c),null);
  assert.notEqual(assessInteractionFamiliesB26(c).status,"research_selected");
 }
 assert.equal(validatePairExpressionB26(record,p,{
  ...good.expression,wordCount:999}).status,"needs_editorial_review");
 assert.equal(validatePairExpressionB26(record,p,{
  ...good.expression,brief:{...good.expression.brief,inferredActualEmotion:true}
 }).status,"needs_editorial_review");
});
test("R2 same author-neutral Balance & Move canonical input handles Dillard 3-way and Thoreau/Dillard 2-way",()=>{
 const scenarios=[
  [B25_BALANCE_CONTRACTS[0],[3,5]],
  [B25_BALANCE_CONTRACTS[1],[1,11]],
  [B25_BALANCE_CONTRACTS[2],[7,3]]
 ];
 for(const [record,amounts] of scenarios){
  const sel=assessInteractionFamiliesB26(record),cap=record.scenario.capacity;
  const focus=record.editorial.lenses.at(-1).id;
  const result=runFourFamilyEncounterB26(record,sel,
   {amounts,budgets:[cap],touched:true,focus});
  judge(result,"balance_move");
  const baseline=runSelectedEncounterB25(record,
   selectMiniGameB25(record,{preferredGameId:"balance_of_values"}),
   {leftSlots:amounts[0],touched:true,focus});
  assert.deepEqual(result.meaning,baseline.meaning);
  assert.deepEqual(result.expression,baseline.expression);
  assert.deepEqual(result.canonical_choice,baseline.canonical_choice);
  assert.equal(result.provenance.unusedCapacity,0);
  assert.equal(result.provenance.choiceInputMethodNotSemantic,true);
 }
 const selected=assessInteractionFamiliesB26(DILLARD_V21),choice={
  amounts:[0,5,1],budgets:[6],repetitions:5,touched:true
 };
 const d=runFourFamilyEncounterB26(DILLARD_V21,selected,choice);
 judge(d,"balance_move");
 const old=runSelectedEncounterB25(DILLARD_V21,
  selectMiniGameB25(DILLARD_V21,{preferredGameId:"trade_off"}),
  {amounts:choice.amounts,repetitions:5});
 assert.deepEqual(d.expression,old.expression);
 assert.deepEqual(d.meaning,old.meaning);
 for(const invalid of [
  {amounts:[2,2,2],budgets:[5],repetitions:5,touched:true},
  {amounts:[-1,6,1],budgets:[6],repetitions:5,touched:true},
  {amounts:[0.5,4.5,1],budgets:[6],repetitions:5,touched:true},
  {amounts:[2,2,2],budgets:[6],repetitions:100,touched:true},
  {amounts:[2,2,2],budgets:[6],repetitions:5,touched:true,
   irrelevantPretendSourceApproval:true}
 ])assert.notEqual(runFourFamilyEncounterB26(DILLARD_V21,selected,invalid).status,"ready");
});
test("R2 decision and all eight future paths preserve exact frozen outputs and no retrospective omniscience",()=>{
 const decision=assessInteractionFamiliesB26(KIERKEGAARD_V21);
 for(const path of [
  ["change","risk","continue"],
  ["stay","surprise","continue"],
  ["stay","missed","reflect"]
 ]){
  const r=runFourFamilyEncounterB26(KIERKEGAARD_V21,decision,{path});
  judge(r,"decision_cards");
  const baseline=runSelectedEncounterB25(KIERKEGAARD_V21,
   selectMiniGameB25(KIERKEGAARD_V21,{preferredGameId:"decision_map"}),{path});
  assert.deepEqual(r.meaning,baseline.meaning);
  assert.deepEqual(r.expression,baseline.expression);
 }
 const record=B23_SOURCE_CONTRACTS[1],sel=assessInteractionFamiliesB26(record);
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [start,scene,response]=route.path;
  const actions=[{type:"choose_start",optionId:start},
   {type:"explore_authored",sceneId:scene},
   {type:"choose_response",optionId:response},
   {type:"read_retrospective"}];
  const r=runFourFamilyEncounterB26(record,sel,{actions});
  judge(r,"flip_reveal");
  assert.deepEqual(r.canonical_choice.path,route.path);
  assert.equal(r.provenance.actualFuturePredicted,false);
  assert.equal(r.provenance.authoredEventCausedByReader,false);
  assert.equal(r.provenance.unchosenFutureKnown,false);
 }
 for(const actions of [
  [{type:"choose_start",optionId:"stay"},{type:"explore_authored",sceneId:"risk"}],
  [{type:"choose_start",optionId:"stay"},{type:"scrub",stage:4}],
  [{type:"choose_start",optionId:"change"},{type:"reveal_authored"}]
 ])assert.notEqual(runFourFamilyEncounterB26(record,sel,{actions}).status,"ready");
});
