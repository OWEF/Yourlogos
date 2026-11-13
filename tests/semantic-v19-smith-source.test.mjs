import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases,semanticSources} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {constructScenario,reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
test('Smith source teaching compares a declared fictional generalist baseline with specialized allocations',()=>{
 const c=semanticCases.workshop;
 const weaker=reasonSemantically(c,{amounts:[3,1],budgets:[4]});
 const balanced=reasonSemantically(c,{amounts:[2,2],budgets:[4]});
 assert.equal(weaker.status,'ready',weaker.reason);
 assert.equal(balanced.status,'ready',balanced.reason);
 for(const p of [weaker,balanced]){
  assert.equal(p.meaning.kind,'specialization_effect');
  assert.equal(p.meaning.evidence.baseline,1);
  assert.deepEqual(p.sourceAdmission.claimPremiseIds,['hypothetical_switching_baseline']);
  assert.equal(p.meaning.evidence.staffing,4);
  assert.match(p.sourceAdmission.scenarioBridge,/invented rotating-team comparison/);
  const output=expressSemantic(p);
  assert.equal(output.status,'ready',JSON.stringify(output));
  assert.match(output.experience,/fictional staffing/);
  assert.match(output.interpretation,/does not prove specialization increases productivity/);
  assert.ok(output.headline.split(/\s+/).length<=14);
 }
 assert.equal(weaker.meaning.evidence.specialized,1);
 assert.equal(weaker.meaning.evidence.delta,0);
 assert.equal(balanced.meaning.evidence.specialized,2);
 assert.equal(balanced.meaning.evidence.delta,1);
 assert.notEqual(expressSemantic(weaker).headline,expressSemantic(balanced).headline);
});
test('unverified or resource-mismatched generalist comparisons cannot be admitted',()=>{
 const c=semanticCases.workshop;
 for(const mutate of [
  x=>{x.model.comparison.baselineMeasure=-1;},
  x=>{x.model.comparison.baselineMeasure=1.5;},
  x=>{x.model.comparison.explanation='';},
  x=>{x.model.comparison.staffing=6;},
  x=>{x.model.comparison.resourceId='absent';},
  x=>{x.model.comparison.kind='historic_fact';}
 ]){
  const clone=structuredClone(c);mutate(clone);
  const p=reasonSemantically(clone,clone.initial);
  assert.equal(p.status,'incompatible',JSON.stringify(clone.model.comparison));
 }
});
test('a self-consistent-looking comparator cannot claim specialization without its own premise',()=>{
 const c=structuredClone(semanticCases.workshop);
 c.premiseIds=c.premiseIds.filter(id=>id!=='hypothetical_switching_baseline');
 assert.ok(c.model.comparison,'the numerical comparison still exists');
 assert.equal(reasonSemantically(c,c.initial).status,'incompatible');
});

test('Smith model without comparator still makes only a limited dependency claim',()=>{
 const model={resources:[{id:'team',min:6,max:6,type:'exact'}],
 choices:[{id:'print',label:'printers',cost:[1],max:6},{id:'bind',label:'binders',cost:[1],max:6}],
 metric:{op:'minimum',weights:[2,1],unit:'finished collections'}};
 const context=constructScenario(semanticSources.smith,{model});
 const p=reasonSemantically(context,{amounts:[2,4],budgets:[6]});
 assert.equal(p.status,'ready',p.reason);
 assert.equal(p.meaning.kind,'dependency');
 assert.equal(p.claims.some(c=>c.kind==='specialization_effect'),false);
});
test('counterfactual press restriction retains distinct evidence, not a generalist historical assertion',()=>{
 const c=semanticCases.workshop;
 const p=reasonSemantically(c,{first:{amounts:[3,1],budgets:[4]},developmentId:c.development.id,amounts:[2,2],budgets:[4]});
 assert.equal(p.status,'ready',p.reason);
 assert.equal(p.meaning.kind,'transition');
 assert.equal(p.structure.transition.deltaMetric,1);
 assert.equal(p.claims.some(c=>c.kind==='specialization_effect'),true);
 assert.ok(p.sourceAdmission.independentlySourceVerified===false);
});
