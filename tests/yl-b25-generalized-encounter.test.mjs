import {test} from "node:test";
import assert from "node:assert/strict";
import {B25_BALANCE_CONTRACTS,inspectB25Contract,fingerprintB25}
 from "../experiments/yl-b25-authored-scenarios.mjs";
import {renderEncounterB25,verifyEncounterB25,B25_BRIDGE_VERSION}
 from "../experiments/yl-b25-generic-bridge.mjs";
import {selectMiniGameB25,runSelectedEncounterB25}
 from "../experiments/yl-b25-encounter.mjs";
import {runSelectedEncounterB24}
 from "../experiments/yl-b24-encounter.mjs";
import {B23_SOURCE_CONTRACTS}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {reasonSemantically} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {semanticSources} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {catalogueB25} from "../experiments/yl-b25-encounter-server.mjs";
const wc=s=>s.trim().split(/\s+/).filter(Boolean).length;
function check(r){
 assert.equal(r.status,"ready",JSON.stringify(r).slice(0,400));
 assert.equal(r.expression.sections.length,3);
 assert.deepEqual(r.expression.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=r.expression.sections.map(x=>wc(x.text));
 assert.equal(counts.reduce((a,b)=>a+b,0),r.expression.wordCount);
 assert.ok(r.expression.wordCount>=80&&r.expression.wordCount<=120,
  JSON.stringify({counts,n:r.expression.wordCount}));
 for(let i=0;i<3;i++)assert.ok(counts[i]>=[10,18,9][i]&&counts[i]<=[48,65,26][i]);
 assert.equal(r.publicationAllowed,false);
 assert.equal(r.productionPlayable,false);
}
test("Two truly new founder-authored scenarios, differing sources, resources, horizons and original quotes",()=>{
 assert.equal(B25_BALANCE_CONTRACTS.length,3);
 const [a,b,c]=B25_BALANCE_CONTRACTS;
 assert.deepEqual(B25_BALANCE_CONTRACTS.map(x=>x.scenario.capacity),[8,12,10]);
 assert.deepEqual(B25_BALANCE_CONTRACTS.map(x=>x.scenario.repetitions),[null,null,4]);
 assert.deepEqual(B25_BALANCE_CONTRACTS.map(x=>x.meaningKind),
  ["conversion","conversion","repetition"]);
 assert.equal(a.source.quote,semanticSources.thoreau.quote);
 assert.equal(b.source.quote,semanticSources.thoreau.quote);
 assert.equal(c.source.quote,semanticSources.dillard.quote);
 assert.equal(c.source.author,"Annie Dillard");
 assert.equal(c.context.model.unitHours,0.5);
 assert.equal(c.context.model.metric,undefined);
 assert.ok(b.context.scenario.includes("$15"));
 for(const p of B25_BALANCE_CONTRACTS){
  assert.equal(inspectB25Contract(p.recordId).contentFingerprint,p.contentFingerprint);
  assert.equal(inspectB25Contract(p),p);
  assert.equal(p.contentFingerprint,fingerprintB25(Object.fromEntries(
   Object.entries(p).filter(([k])=>k!=="contentFingerprint"))));
 }
});
test("Genuinely reusable source-bound bridge: 66 distinct amount/lens READY journeys",()=>{
 let n=0;
 for(const c of B25_BALANCE_CONTRACTS){
  const sel=selectMiniGameB25(c);
  assert.equal(sel.selected_game_id,"balance_of_values");
  assert.equal(sel.selection_trace.evaluatedPeerIds.length,6);
  const different=new Set();
  for(let x=0;x<=c.scenario.capacity;x++){
   const outputs=c.editorial.lenses.map(l=>runSelectedEncounterB25(c,sel,
    {leftSlots:x,touched:true,focus:l.id}));
   for(const r of outputs){
    check(r);
    assert.equal(r.expressionVerification,B25_BRIDGE_VERSION);
    assert.equal(r.expression.version,"evidence-bound-expression/2.5.0");
    assert.equal(r.emotion.inferredReaderEmotion,false);
    assert.equal(r.expression.quote,c.source.quote);
    assert.equal(r.expression.sourceWarrant,c.context.semantic.admission.centralClaim);
    assert.equal(r.expression.evidenceTrace.fingerprint,c.contentFingerprint);
    assert.equal(r.meaning.meaning.kind,c.meaningKind);
    assert.deepEqual(r.canonical_choice.amounts,[x,c.scenario.capacity-x]);
    assert.equal(r.provenance.moralValueScoreInferred,false);
    assert.doesNotMatch(JSON.stringify(r.expression),
     /frozen_v12_semantic_not_v20|semantic-expression\/1\.2/);
    n++;
   }
   assert.deepEqual(outputs[0].meaning,outputs[1].meaning);
   assert.notEqual(outputs[0].expression.sections[1].text,
    outputs[1].expression.sections[1].text);
   different.add(outputs[0].expression.sections[0].text);
  }
  assert.ok(different.size>=3);
 }
 assert.equal(n,66);
});
test("New Dillard scenario is source-warranted repetition, never a Thoreau conversion",()=>{
 const c=B25_BALANCE_CONTRACTS[2],sel=selectMiniGameB25(c);
 const r=runSelectedEncounterB25(c,sel,
  {leftSlots:3,touched:true,focus:"repeated_pattern"});
 check(r);
 assert.equal(r.meaning.meaning.kind,"repetition");
 assert.equal(r.meaning.meaning.evidence.repetitions,4);
 assert.deepEqual(r.meaning.meaning.evidence.cumulative.map(x=>x.units),[12,28]);
 assert.match(r.expression.sections[1].text,/Across 4 imagined evenings/i);
 assert.doesNotMatch(r.expression.sections[1].text,/Thoreau|wage|dollar/i);
 assert.equal(r.expression.author,"Annie Dillard");
});
test("Original four and all eight Kierkegaard branches retain canonical exact baseline outputs",()=>{
 for(const [record,game,choice] of [
  [DILLARD_V21,"trade_off",{amounts:[1,3,2],repetitions:5}],
  [DILLARD_V21,"token_studio",{amounts:[1,3,2],repetitions:5}],
  [KIERKEGAARD_V21,"decision_map",{path:["change","risk","continue"]}],
  [KIERKEGAARD_V21,"swipe_decision",{path:["change","risk","continue"]}]
 ]){
  const sel=selectMiniGameB25(record,{preferredGameId:game});
  const now=runSelectedEncounterB25(record,sel,choice);
  const frozen=runSelectedEncounterB24(record,sel,choice);
  check(now);
  assert.deepEqual(now.meaning,frozen.meaning);
  assert.deepEqual(now.expression,frozen.expression);
 }
 const f=B23_SOURCE_CONTRACTS[1],s=selectMiniGameB25(f);
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [start,scene,response]=route.path;
  const input={actions:[{type:"choose_start",optionId:start},
    {type:"explore_authored",sceneId:scene},
    {type:"choose_response",optionId:response},{type:"read_retrospective"}]};
  const now=runSelectedEncounterB25(f,s,input);
  const frozen=runSelectedEncounterB24(f,s,input);
  check(now);
  assert.deepEqual(now.meaning,frozen.meaning);
  assert.deepEqual(now.expression,frozen.expression);
  assert.equal(now.provenance.authoredEventCausedByReader,false);
 }
 assert.equal(selectMiniGameB25(HEGEL_NO_FIT_V21).status,"no_fit");
});
test("Unfamiliar authors, incompatible sources, forged editorial status and arithmetic refuse",()=>{
 const c=B25_BALANCE_CONTRACTS[1],sel=selectMiniGameB25(c);
 const canonical={amounts:[5,7],budgets:[12]},m=reasonSemantically(c.context,canonical);
 const out=renderEncounterB25(m,c,canonical,{focus:"exchange"});
 assert.equal(out.status,"ready");
 assert.equal(verifyEncounterB25(m,c,canonical,"exchange",
  {...out,wordCount:999}).status,"needs_editorial_review");
 assert.equal(renderEncounterB25({...m,sourceAdmission:{
  ...m.sourceAdmission,centralClaim:"Unrelated claim"}},c,canonical,{focus:"exchange"}).status,
  "needs_editorial_review");
 for(const bad of [{leftSlots:-1,touched:true,focus:"exchange"},
  {leftSlots:13,touched:true,focus:"exchange"},
  {leftSlots:2.5,touched:true,focus:"exchange"},
  {leftSlots:2,touched:false,focus:"exchange"},
  {leftSlots:2,touched:true,focus:"moral_score"},
  {leftSlots:2,touched:true,focus:"exchange",scholarPassed:true}
 ])assert.equal(runSelectedEncounterB25(c,sel,bad).status,"blocked");
 assert.equal(selectMiniGameB25({...c,source:{...c.source,quote:"Forged"}}).status,"blocked");
 assert.equal(selectMiniGameB25({recordId:"novel",source:{
  author:"Unknown",work:"Never recorded",quote:"Invented"}}).status,"blocked");
 assert.equal(selectMiniGameB25(c,{preferredGameId:"future_reveal"}).status,"no_fit");
});
test("Single selector records and automatic eligible consumer default remain source-derived",()=>{
 const listing=catalogueB25();
 assert.deepEqual(listing.map(x=>x.key),
  ["dillard","kierkegaard_map","thoreau_balance","kierkegaard_future",
   "thoreau_weekend","dillard_pattern"]);
 for(const x of listing){
  assert.equal(x.games.length,6);
  assert.ok(x.defaultGameId&&x.games.some(g=>g.id===x.defaultGameId&&g.eligible));
 }
 assert.deepEqual([listing[2].capacity,listing[4].capacity,listing[5].capacity],[8,12,10]);
 assert.equal(listing[5].repetitions,4);
});
