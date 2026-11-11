import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases,semanticSources,commitmentScenario} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {constructScenario,reasonSemantically,expressSemantic,validateTension} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
test('shared semantic pipeline and four modes preserve meaning',()=>{
 for(const c of Object.values(semanticCases)){
  const p=reasonSemantically(c,c.initial);assert.equal(p.status,'ready');
  const outputs=['reflective','surprising','playful','challenging'].map(m=>expressSemantic(p,m));
  for(const o of outputs){assert.equal(o.status,'ready',JSON.stringify(o));assert.ok(o.wordCount>=45&&o.wordCount<=70);assert.equal(o.headline,outputs[0].headline);assert.equal(o.interpretation,outputs[0].interpretation);assert.deepEqual(o.evidence,p.meaning.evidence);}
 }
});
test('redundant and compatible decisions are incompatible',()=>{
 const c=structuredClone(semanticCases.apology);c.model.nodes.first.options[1].sets={response:'offer'};
 assert.equal(validateTension(c).status,'incompatible');
 c.model.nodes.first.options[1].sets={unrelated:'yes'};assert.equal(validateTension(c).status,'incompatible');
});
test('repetition and intentions are observable inputs, never identity',()=>{
 const c=semanticCases.money,p=reasonSemantically(c,c.initial);
 assert.equal(p.meaning.kind,'intention_gap');assert.ok(p.claims.some(c=>c.kind==='repetition'));
 assert.notEqual(reasonSemantically(c,{...c.initial,intentions:{}}).meaning.kind,'intention_gap');
 assert.equal(reasonSemantically(c,{...c.initial,intentions:{missing:1}}).status,'incompatible');
});
// Transfer fixtures authored after the semantic operations: no kernel changes
// may be made to accommodate a failed held-out case without declaring leakage.
test('held-out shared staffing and archival domains transfer without new inference code',()=>{
 const supply=constructScenario(semanticSources.smith,{model:{resources:[{id:'team',min:6,max:6,type:'exact'}],choices:[{id:'catalog',label:'cataloguers',cost:[1],max:6},{id:'scan',label:'scanners',cost:[1],max:6}],metric:{op:'minimum',weights:[3,1],unit:'archived collections'}}});
 const p=reasonSemantically(supply,{amounts:[4,2],budgets:[6]});assert.equal(p.meaning.kind,'complementarity');assert.equal(p.structure.measure,2);
 const q=reasonSemantically(supply,{amounts:[2,4],budgets:[6]});assert.equal(q.structure.measure,4);
 const dispute=constructScenario(semanticSources.descartes,{model:commitmentScenario({prompt:'Assess a disputed translation',field:'translation',initial:['Two translations disagree.'],development:'A newly found manuscript contradicts the first reading.',actions:[{id:'accept',label:'Accept the first reading',commitment:'accept'},{id:'hold',label:'Withhold assent',commitment:'withhold'}]})});
 assert.equal(reasonSemantically(dispute,{path:['accept','hold']}).meaning.kind,'revision');
 assert.equal(reasonSemantically(dispute,{path:['hold','hold']}).meaning.kind,'information');
});
