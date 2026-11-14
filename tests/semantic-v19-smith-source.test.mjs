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
  assert.match(output.experience,/invented rotating-team baseline/);
  assert.match(output.experience,/hypothetical, not historical evidence/);
  assert.doesNotMatch(output.experience,/finished units|same number of units/);
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


/**
 * CZ-123 v1.9.6: the independent G01/G02 values are now disclosed regressions.
 * They are NOT new blind holdouts and intentionally preserve the original
 * unusual labels and hypothetical comparison assumptions.
 */
test('CZ-123 G01/G02: unique minimum stage is named even for zero or negative comparator delta',()=>{
 const fixtures=[
  {id:'G01',stages:[['print','sheet printers',5,2],['fold','page folders',2,2],['bind','book assemblers',1,2]],capacities:[10,4,2],minimum:2,baseline:2,delta:0,limiting:'book assemblers'},
  {id:'G02',stages:[['sort','ticket sorters',4,1],['check','ticket checkers',2,2],['stamp','ticket stampers',3,2],['seal','ticket sealers',1,1]],capacities:[4,4,6,1],minimum:1,baseline:2,delta:-1,limiting:'ticket sealers'}
 ];
 for(const f of fixtures){
  const c=structuredClone(semanticCases.workshop);
  const staff=f.stages.reduce((n,stage)=>n+stage[3],0);
  c.scenario='A fictional team of '+staff+' volunteers performs '+f.stages.length+
   ' required production stages; every finished item needs every stage. Rates below are invented and concern one shift only.';
  c.assumptions=['Each completed item requires all the listed stages; all rates, working times and switching penalties are invented.',
   'A rotating-generalist team serves only as a modeled, not observed, comparator.'];
  c.model.resources[0]={...c.model.resources[0],min:staff,max:staff,type:'exact',label:'Volunteers assigned in this hypothetical shift'};
  c.model.choices=f.stages.map(([id,label])=>({id,label,singular:label.endsWith('s')?label.slice(0,-1):label,cost:[1],max:staff}));
  c.model.metric={op:'minimum',weights:f.stages.map(stage=>stage[2]),unit:'finished booklets',singular:'finished booklet'};
  c.model.comparison={...c.model.comparison,staffing:staff,
   explanation:'Each of '+staff+' hypothetical workers has sixty minutes and loses thirty minutes if rotating; every finished unit is assigned ninety minutes in this invented comparison.'};
  const input={amounts:f.stages.map(stage=>stage[3]),budgets:[staff]};
  const packet=reasonSemantically(c,input);
  assert.equal(packet.status,'ready',f.id+': '+packet.reason);
  assert.equal(packet.meaning.kind,'specialization_effect',f.id);
  assert.deepEqual(packet.meaning.evidence.stageCapacities.map(stage=>stage.capacity),f.capacities,f.id);
  assert.equal(Math.min(...f.capacities),f.minimum);
  assert.equal(packet.meaning.evidence.specialized,f.minimum,f.id);
  assert.equal(packet.meaning.evidence.baseline,f.baseline,f.id);
  assert.equal(packet.meaning.evidence.delta,f.delta,f.id);
  for(const mode of ['reflective','surprising','playful','challenging']){
   const output=expressSemantic(packet,mode);
   assert.equal(output.status,'ready',f.id+'/'+mode+': '+JSON.stringify(output));
   assert.match(output.interpretation,new RegExp(f.limiting),f.id+'/'+mode+' missing bottleneck');
   assert.match(output.interpretation,/specialization can improve skill, save switching time and encourage machinery/);
   assert.match(output.interpretation,/does not prove specialization increases productivity beyond the model/);
   assert.match(output.proactiveQuestion,new RegExp(f.limiting));
   assert.match(output.experience,/hypothetical, not historical evidence/);
   assert.ok(output.wordCount>=80&&output.wordCount<=120,f.id+'/'+mode+' word policy '+output.wordCount);
  }
 }
});
