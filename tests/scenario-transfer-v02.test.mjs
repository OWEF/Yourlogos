import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getMechanismCase,validateTradeoffVariables,optionsFor} from "../philosophy-engine/encounter/mechanism-transfer-cases-v02.js";
import {evaluateTradeoffCase,evaluateDecisionCase,evaluateTransferCase,reachableDecisionRoutes,reallocateVariableBudget} from "../philosophy-engine/encounter/mechanism-transfer-engine-v02.js";
import {buildScenarioTransferStandalone} from "../scripts/build-scenario-transfer-lab-v02.mjs";

const inputs=[];
for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++)inputs.push([a,b,6-a-b]);

test("source-informed variables: Seneca and Dillard do not reuse the same activity labels or influence options",()=>{
 const seneca=getMechanismCase("seneca"),dillard=getMechanismCase("dillard");
 assert.deepEqual(seneca.categories,["Optional work","A friend","Quiet reflection"]);
 assert.deepEqual(dillard.categories,["Write your story","Answer messages","Rest and recharge"]);
 assert.notDeepEqual(seneca.categories,dillard.categories);
 assert.deepEqual(seneca.influences.map(x=>x.id),["chosen","expected","necessary"]);
 assert.deepEqual(dillard.influences.map(x=>x.id),["planned","interrupted","obligations"]);
 assert.notDeepEqual(seneca.influences,dillard.influences);
 assert.equal(validateTradeoffVariables(seneca),true);
 assert.equal(validateTradeoffVariables(dillard),true);
 assert.match(dillard.variableBasis,/curated scenario/);
});
test("tradeoff model accepts two or three variables but never four or unsupported copies",()=>{
 const two={
  family:"tradeoff",scenario:"A two-variable illustrative test under a three-hour limit.",
  categories:["Doing one thing","Doing another thing"],
  influences:[{id:"own",label:"My preference",detail:"Chosen"},{id:"required",label:"Required",detail:"Cannot refuse"}],
  variableBasis:"Synthetic architectural fixture, not a published quote interpretation"
 };
 assert.equal(validateTradeoffVariables(two),true);
 assert.deepEqual(reallocateVariableBudget([2,4],0,6),[6,0]);
 assert.deepEqual(reallocateVariableBudget([2,4],1,1),[5,1]);
 assert.deepEqual(reallocateVariableBudget([3,3],0,0),[0,6]);
 for(let a=0;a<=6;a++)for(let idx=0;idx<2;idx++)for(let desired=0;desired<=6;desired++){
  const updated=reallocateVariableBudget([a,6-a],idx,desired);
  assert.equal(updated[idx],desired);
  assert.equal(updated.reduce((x,y)=>x+y,0),6);
 }
 assert.throws(()=>validateTradeoffVariables({...two,categories:["One","Two","Three","Four"]}),/2 or 3/);
 assert.throws(()=>validateTradeoffVariables({...two,categories:["One","One"]}),/distinct/);
 assert.throws(()=>validateTradeoffVariables({...two,variableBasis:""}),/grounding/);
 assert.throws(()=>reallocateVariableBudget([2,2,2,0],0,6),/two-or-three/);
});
test("168 allocation and quotation-specific motivation combinations transfer the allocator without borrowing values",()=>{
 let n=0;
 for(const id of ["seneca","dillard"]){
  const spec=getMechanismCase(id);
  for(const ticks of inputs){
   for(const influence of spec.influences){
    const r=evaluateTradeoffCase(id,{ticks,motivation:influence.id});
    assert.deepEqual(r.fields.variableLabels,spec.categories);
    assert.equal(r.fields.variableCount,spec.categories.length);
    assert.equal(r.fields.influenceLabel,influence.label);
    assert.equal(r.fields.hours.reduce((a,b)=>a+b,0),3);
    assert.match(r.rules.join("|"),/quote_specific_variables_not_copied/);
    assert.equal(r.input.motivation,influence.id);
    assert.equal(r.productionEligible,false);
    assert.equal(r.referenceInsight!==null,id==="seneca");
    if(id==="dillard"){
      assert.equal(r.fields.conditionalFiveWeekdays.reduce((a,b)=>a+b,0),15);
      assert.match(r.interpretation,/user's real routine is unknown/);
    }else assert.equal(r.fields.conditionalFiveWeekdays,null);
    n++;
   }
  }
 }
 assert.equal(n,168);
});
test("matched TIME ALLOCATIONS do not imply the activities or motives are the same",()=>{
 const ticks=[4,1,1];
 const seneca=evaluateTradeoffCase("seneca",{ticks,motivation:"necessary"});
 const dillard=evaluateTradeoffCase("dillard",{ticks,motivation:"planned"});
 assert.deepEqual(seneca.fields.hours,dillard.fields.hours);
 assert.notEqual(seneca.fields.variableLabels[0],dillard.fields.variableLabels[0]);
 assert.notEqual(seneca.fields.influenceLabel,dillard.fields.influenceLabel);
 assert.notEqual(seneca.interpretation,dillard.interpretation);
 assert.throws(()=>evaluateTradeoffCase("dillard",{ticks,motivation:"necessary"}),/valid influence/);
});
test("every Decision Map now starts with a two-sentence concrete situation, not source exposition",()=>{
 const expected={
  woolf:/works long hours and shares a noisy home/,
  wollstonecraft:/brothers receive schooling/,
  kierkegaard:/new offer would mean moving to another city/
 };
 for(const [id,re] of Object.entries(expected)){
  const model=getMechanismCase(id);
  assert.match(model.scenario,re);
  assert.equal(model.scenario.split(/[.!?]+/).filter(Boolean).length,2,id+" should be brief");
  assert.equal(model.steps.length,3);
  assert.equal(optionsFor(model,"resource",null).length,2);
 }
 assert.match(getMechanismCase("kierkegaard").guard,/not things Kierkegaard predicted/);
});
test("all 24 source-scoped decision routes stay conditional and preserve the real scenario",()=>{
 let n=0;
 for(const id of ["woolf","wollstonecraft","kierkegaard"]){
  const spec=getMechanismCase(id);
  const routes=reachableDecisionRoutes(id);
  assert.equal(routes.length,8);
  for(const input of routes){
   const r=evaluateDecisionCase(id,input);
   assert.equal(r.scenario,spec.scenario);
   assert.equal(r.selected.length,3);
   assert.equal(r.productionEligible,false);
   assert.equal(r.outcomePredicted,false);
   assert.equal(r.futureKnownAtChoice,false);
   assert.equal(r.referenceInsight!==null,id==="woolf");
   if(id==="kierkegaard")assert.equal(r.semanticTransfer,"UI_only_temporal_asymmetry_needs_new_kernel");
   n++;
  }
 }
 assert.equal(n,24);
});
test("invalid forks and unsuitable philosophy are rejected rather than shoehorned",()=>{
 const woolf=reachableDecisionRoutes("woolf")[0];
 assert.throws(()=>evaluateDecisionCase("woolf",{...woolf,barrier:"incompatible"}),/Incompatible choice/);
 const blocked=evaluateTransferCase("marx",{ticks:[6,0,0],motivation:"planned"});
 assert.equal(blocked.blocked,true);
 assert.match(blocked.reason,/false opposition/);
});
test("standalone new lab equals exact original modules and new source-specific configurations",()=>{
 const html=readFileSync(new URL("../experiments/mechanism-parallel-transfer-lab-v02-standalone.html",import.meta.url),"utf8");
 assert.equal(html,buildScenarioTransferStandalone());
 assert.match(html,/function validateTradeoffVariables/);
 assert.match(html,/function reallocateVariableBudget/);
 assert.match(html,/Write your story/);
 assert.match(html,/brothers receive schooling/);
 assert.match(html,/new offer would mean moving to another city/);
 assert.doesNotMatch(html,/^import\s/m);
 assert.doesNotMatch(html,/\bfetch\s*\(|\blocalStorage\s*\.|\bsessionStorage\s*\.|XMLHttpRequest\s*\(/);
});
