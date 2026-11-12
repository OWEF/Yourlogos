import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases,semanticSources,commitmentScenario} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {constructScenario,reasonSemantically,expressSemantic,validateTension} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
test('shared semantic pipeline and four modes preserve meaning',()=>{
 for(const c of Object.values(semanticCases)){
  const p=reasonSemantically(c,c.initial);assert.equal(p.status,'ready');
  const outputs=['reflective','surprising','playful','challenging'].map(m=>expressSemantic(p,m));
  for(const o of outputs){assert.equal(o.status,'ready',JSON.stringify(o));assert.ok(o.wordCount>=45&&o.wordCount<=160);assert.equal(o.headline,outputs[0].headline);assert.ok(o.interpretation.includes(p.limitations[0]));assert.deepEqual(o.evidence,p.meaning.evidence);}
 }
});
test('action labels and ordinary succession do not imply commitment conflicts',()=>{
 const c=structuredClone(semanticCases.apology);c.model.nodes.first.options[1].sets={response:'offer'};
 assert.equal(validateTension(c).status,'supported');
 c.model.nodes.first.options[1].sets={unrelated:'yes'};assert.equal(validateTension(c).status,'supported');
});
test('repetition and intentions are observable inputs, never identity',()=>{
 const c=semanticCases.money,p=reasonSemantically(c,c.initial);
 assert.equal(p.meaning.kind,'conversion');assert.ok(p.claims.some(c=>c.kind==='repetition'));
 assert.notEqual(reasonSemantically(c,{...c.initial,intentions:{}}).meaning.kind,'intention_gap');
 assert.equal(reasonSemantically(c,{...c.initial,intentions:{missing:1}}).status,'incompatible');
});
// Transfer fixtures authored after the semantic operations: no kernel changes
// may be made to accommodate a failed held-out case without declaring leakage.
test('held-out shared staffing and archival domains transfer without new inference code',()=>{
 const supply=constructScenario(semanticSources.smith,{model:{resources:[{id:'team',min:6,max:6,type:'exact'}],choices:[{id:'catalog',label:'cataloguers',cost:[1],max:6},{id:'scan',label:'scanners',cost:[1],max:6}],metric:{op:'minimum',weights:[3,1],unit:'archived collections'}}});
 const p=reasonSemantically(supply,{amounts:[4,2],budgets:[6]});assert.equal(p.meaning.kind,'dependency');assert.equal(p.structure.measure,2);
 const q=reasonSemantically(supply,{amounts:[2,4],budgets:[6]});assert.equal(q.structure.measure,4);
 const dispute=constructScenario(semanticSources.descartes,{model:commitmentScenario({prompt:'Assess a disputed translation',field:'translation',assentField:'translation',domain:{states:['accept','withhold'],oppositions:[['accept','withhold']]},initial:['Two translations disagree.'],development:'A newly found manuscript contradicts the first reading.',actions:[{id:'accept',label:'Accept the first reading',commitment:'accept'},{id:'hold',label:'Withhold assent',commitment:'withhold'}]})});
 assert.equal(reasonSemantically(dispute,{path:['accept','hold']}).meaning.kind,'assent');
 assert.equal(reasonSemantically(dispute,{path:['hold','hold']}).meaning.kind,'assent');
});

test('conversion cost is not mistaken for complementary output',()=>{
 const c=semanticCases.money,p=reasonSemantically(c,{amounts:[1,0,1],budgets:[8]});
 assert.equal(p.meaning.kind,'conversion');
 assert.ok(!p.claims.some(c=>c.kind==='complementarity'));
});

test('commitment revisions require explicit semantic opposition',()=>{
 const apology=reasonSemantically(semanticCases.apology,semanticCases.apology.initial);
 assert.equal(apology.structure.semanticRevisions.length,0);
 assert.equal(apology.meaning.kind,'agency');
 const revised=reasonSemantically(semanticCases.evidence,{path:['endorse','suspend']});
 assert.equal(revised.structure.semanticRevisions.length,1);
 assert.equal(revised.meaning.evidence.position,'withhold');
 const maintained=reasonSemantically(semanticCases.evidence,{path:['suspend','suspend']});
 assert.equal(maintained.structure.semanticRevisions.length,0);
 assert.ok(maintained.structure.semanticEvents[1].relationships.includes('compatible_continuation'));
 const undeclared=structuredClone(semanticCases.evidence);undeclared.model.commitmentDomains.assent.oppositions=[];
 assert.equal(reasonSemantically(undeclared,undeclared.initial).status,'incompatible');
});
test('selection records source centrality instead of global operation priority',()=>{
 const p=reasonSemantically(semanticCases.money,semanticCases.money.initial);
 assert.equal(p.meaning.kind,'conversion');
 assert.equal(p.selectionTrace.find(x=>x.kind==='intention_gap').sourceFidelity,'observation_only');
 const c=structuredClone(semanticCases.money);delete c.semantic.selection;
 assert.equal(reasonSemantically(c,c.initial).status,'incompatible');
});

test('unrelated commitment revision cannot become a change of assent',()=>{
 const c=structuredClone(semanticCases.evidence);
 c.model.commitmentDomains.delivery={states:['post','call'],oppositions:[['post','call']]};
 c.model.nodes.first.options[1].commitments.delivery='post';
 c.model.nodes.later.options[1].commitments.delivery='call';
 const p=reasonSemantically(c,{path:['suspend','suspend']});
 assert.equal(p.meaning.kind,'assent');assert.equal(p.meaning.evidence.changes.length,0);
 assert.match(p.meaning.text,/maintained/);assert.equal(p.structure.semanticRevisions.length,1);
});
