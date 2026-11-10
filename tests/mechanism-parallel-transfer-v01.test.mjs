import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getMechanismCase,optionsFor,candidateFitAudit,sourceTrace} from "../philosophy-engine/encounter/mechanism-transfer-cases-v01.js";
import {evaluateTradeoffCase,evaluateDecisionCase,evaluateTransferCase,reachableDecisionRoutes,reallocateEvening,fitMatrix} from "../philosophy-engine/encounter/mechanism-transfer-engine-v01.js";
import {buildParallelTransferStandalone} from "../scripts/build-parallel-transfer-lab-v01.mjs";
import {ATLAS_PILOT_V01} from "../philosophy-engine/context-atlas/pilot-records-v01.js";
import {evaluatePhilosophicalGrammar} from "../philosophy-engine/context-atlas/grammar-v01.js";

const allocations=[];
for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++)allocations.push([a,b,6-a-b]);
test("each candidate declares three separate gates; Marx is source-blocked",()=>{
 const statuses=fitMatrix();
 assert.equal(statuses.length,6);
 for(const x of statuses)assert.equal(x.productionEligible,false);
 assert.equal(statuses.find(x=>x.id==="dillard").sourceFit,"outside_atlas_source_review_required");
 assert.equal(statuses.find(x=>x.id==="wollstonecraft").modelTransfer,"conditional_same_enabling_condition_kernel");
 assert.equal(statuses.find(x=>x.id==="kierkegaard").modelTransfer,"ui_only_different_temporal_semantics");
 assert.equal(statuses.find(x=>x.id==="marx").uiTransfer,"blocked");
 const blocked=evaluateTransferCase("marx",{ticks:[6,0,0],motivation:"chosen"});
 assert.equal(blocked.blocked,true);
 assert.equal(blocked.productionEligible,false);
 assert.match(blocked.reason,/false opposition|false dilemma/);
 assert.throws(()=>evaluateTradeoffCase("marx",{ticks:[6,0,0],motivation:"chosen"}));
 assert.equal(evaluatePhilosophicalGrammar(ATLAS_PILOT_V01.find(x=>x.id===22)).interactiveRealization.candidate,"none");
});
test("fixed 3-hour zero-sum slider: 28 allocations × three motivations × two different source cases",()=>{
 let evaluated=0;
 for(const ticks of allocations)for(const motivation of ["chosen","expected","necessary"]){
  const input={ticks,motivation};
  for(const id of ["seneca","dillard"]){
   const r=evaluateTradeoffCase(id,input);
   assert.equal(r.fields.budget,3);
   assert.equal(r.fields.hours.reduce((a,b)=>a+b,0),3);
   assert.equal(r.productionEligible,false);
   assert.match(r.rules.join("|"),/fixed_budget:180_minutes/);
   assert.match(r.sourceRelation,/time|life|schedule|deliberate/i);
   assert.equal(r.input.motivation,motivation);
   if(id==="seneca"){
    assert.equal(r.referenceInsight?.ruleId!==undefined,true);
    assert.equal(r.fields.conditionalFiveWeekdays,null);
   }else{
    assert.equal(r.referenceInsight,null);
    assert.equal(r.fields.conditionalFiveWeekdays.reduce((a,b)=>a+b,0),15);
    assert.match(r.interpretation,/hypothetical|real routine is unknown/);
    assert.match(r.warning,/editorial/);
   }
   evaluated++;
  }
 }
 assert.equal(evaluated,168);
});
test("matched choices lead to genuinely distinct argument frames; not a simple author swap",()=>{
 const i={ticks:[4,1,1],motivation:"necessary"};
 const seneca=evaluateTradeoffCase("seneca",i),dillard=evaluateTradeoffCase("dillard",i);
 assert.deepEqual(seneca.fields.hours,dillard.fields.hours);
 assert.equal(seneca.fields.pattern,dillard.fields.pattern);
 assert.notEqual(seneca.sourceRelation,dillard.sourceRelation);
 assert.notEqual(seneca.interpretation,dillard.interpretation);
 assert.equal(dillard.quote.id,12);
 assert.equal(seneca.quote.id,49);
});
test("linked slider preserves a three-hour total and the dragged value for all states",()=>{
 for(const ticks of allocations)for(let index=0;index<3;index++)for(let tick=0;tick<=6;tick++){
  const next=reallocateEvening(ticks,index,tick);
  assert.equal(next[index],tick);
  assert.equal(next.reduce((a,b)=>a+b,0),6);
  assert.ok(next.every(n=>Number.isInteger(n)&&n>=0));
 }
});
test("existing Context Atlas approves only tentative decision-map candidates, with boundaries",()=>{
 for(const id of [23,28,34]){
  const x=ATLAS_PILOT_V01.find(record=>record.id===id);
  const p=evaluatePhilosophicalGrammar(x);
  assert.equal(p.interactiveRealization.candidate,"decision_map");
  assert.equal(p.interactiveRealization.allowedForProduction,false);
  assert.equal(p.epistemicStatus,"editorial_hypothesis");
 }
 assert.equal(getMechanismCase("kierkegaard").semanticModel,"temporal_information_asymmetry");
 assert.equal(getMechanismCase("wollstonecraft").semanticModel,"enabling_conditions");
});
test("every reachable 3-fork route evaluates without invented guaranteed outcome",()=>{
 let total=0;
 for(const id of ["woolf","wollstonecraft","kierkegaard"]){
  const routes=reachableDecisionRoutes(id);
  assert.equal(routes.length,8);
  for(const input of routes){
   const result=evaluateDecisionCase(id,input);
   assert.equal(result.productionEligible,false);
   assert.equal(result.selected.length,3);
   assert.equal(result.outcomePredicted,false);
   assert.equal(result.futureKnownAtChoice,false);
   assert.deepEqual(result.selected.map(n=>n.id),[input.resource,input.barrier,input.action]);
   assert.equal(result.rules.length,4);
   assert.match(result.interpretation,/not|cannot|unknown|guarantee|prediction|uncertain/i);
   if(id==="woolf") assert.equal(result.referenceInsight?.ruleId!==undefined,true);
   else assert.equal(result.referenceInsight,null);
   if(id==="kierkegaard"){
    assert.equal(result.semanticTransfer,"UI_only_temporal_asymmetry_needs_new_kernel");
    assert.match(result.warning,/NOT transferred/);
   }
   total++;
  }
 }
 assert.equal(total,24);
});
test("invalid cross-branch choices are blocked, not silently mapped to a philosopher",()=>{
 for(const id of ["woolf","wollstonecraft","kierkegaard"]){
  assert.throws(()=>evaluateDecisionCase(id,{resource:"bogus",barrier:"space",action:"write"}),/Incompatible choice/);
  assert.throws(()=>evaluateDecisionCase(id,{resource:null,barrier:"space",action:"write"}),/required/);
  const valid=reachableDecisionRoutes(id)[0];
  assert.throws(()=>evaluateDecisionCase(id,{...valid,action:"impossible"}),/Incompatible choice/);
 }
 assert.throws(()=>evaluateTradeoffCase("dillard",{ticks:[2,2,1],motivation:"chosen"}),/Exactly 3/);
 assert.throws(()=>evaluateTradeoffCase("dillard",{ticks:[2,2,2],motivation:"anger"}),/valid influence/);
 assert.throws(()=>optionsFor(getMechanismCase("wollstonecraft"),"action","not_an_actual_barrier"));
});
test("source provenance and exclusion controls are explicit",()=>{
 assert.ok(sourceTrace("wollstonecraft").some(x=>x.url.startsWith("https://")));
 assert.ok(sourceTrace("kierkegaard").some(x=>x.url.startsWith("https://")));
 assert.ok(sourceTrace("dillard").some(x=>x.url.includes("dltn.io")));
 const old=sourceTrace("seneca");
 assert.ok(old.find(x=>x.url==="app.js"));
 assert.equal(candidateFitAudit().find(x=>x.id==="marx").modelTransfer,"rejected_false_dilemma");
});
test("the self-contained phone artifact equals its exact source modules",()=>{
 const output=readFileSync(new URL("../experiments/mechanism-parallel-transfer-lab-v01-standalone.html",import.meta.url),"utf8");
 assert.equal(output,buildParallelTransferStandalone());
 assert.match(output,/function evaluateDecisionCase/);
 assert.match(output,/function evaluateTradeoffCase/);
 assert.match(output,/function reasonSeneca/);
 assert.match(output,/function reasonWoolf/);
 assert.match(output,/data-sync/);
 assert.match(output,/data-branch/);
 assert.doesNotMatch(output,/^import\s/m);
 assert.doesNotMatch(output,/\bfetch\s*\(|\blocalStorage\s*\.|\bsessionStorage\s*\.|XMLHttpRequest\s*\(/);
});
