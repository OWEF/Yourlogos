// Fixtures transcribed from independent review after engine changes were frozen.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticSources,semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {constructScenario,reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
const run=(c,input)=>{const p=reasonSemantically(c,input);assert.equal(p.status,'ready');assert.equal(expressSemantic(p).status,'ready');return p;};
test('independent T1: carrying capacity and earning time constrain purchases separately',()=>{
 const c=constructScenario(semanticSources.thoreau,{model:{resources:[{id:'money',min:7,max:7,type:'cap'},{id:'carry',min:5,max:5,type:'cap'}],choices:[{id:'kit',label:'repair kits',max:4,cost:[1,2]},{id:'lamp',label:'lamps',max:3,cost:[3,1]}],metric:{op:'sum',weights:[1,3],unit:'extra working hours'}}});
 const a=run(c,{amounts:[2,1],budgets:[7,5]}),b=run(c,{amounts:[1,2],budgets:[7,5]});
 assert.deepEqual(a.structure.spent,[5,5]);assert.equal(a.meaning.evidence.measure,5);assert.equal(b.meaning.evidence.measure,7);
 assert.equal(reasonSemantically(c,{amounts:[3,1],budgets:[7,5]}).status,'incompatible');
});
test('independent T2: three indispensable stages and an absent-stage boundary',()=>{
 const c=constructScenario(semanticSources.smith,{model:{resources:[{id:'people',min:6,max:6,type:'exact'}],choices:['scan','proofread','bind'].map(id=>({id,label:id,max:6,cost:[1]})),metric:{op:'minimum',weights:[3,2,1],unit:'finished collections'}}});
 for(const [amounts,measure] of [[[2,2,2],2],[[1,2,3],3],[[0,3,3],0]]){const p=run(c,{amounts,budgets:[6]});assert.equal(p.meaning.kind,'dependency');assert.equal(p.meaning.evidence.measure,measure);}
});
test('independent D1: convergent final action preserves different histories',()=>{
 const c=structuredClone(semanticCases.apology);
 c.model.nodes.first.options[1].label='Draft an apology privately';c.model.nodes.first.options[1].action='Draft an apology privately';
 const a=run(c,{path:['offer','space']}),b=run(c,{path:['space','space']});
 assert.equal(a.structure.semanticRevisions.length,0);assert.equal(b.structure.semanticRevisions.length,0);
 assert.notDeepEqual(a.meaning.evidence.events,b.meaning.evidence.events);
 assert.notEqual(expressSemantic(a).headline,expressSemantic(b).headline);
});
test('independent D2: convergent evidence routes preserve prerequisites and publication closure',()=>{
 const c=constructScenario(semanticSources.descartes,{assumptions:['Document checking is a limited analogy to restrained assent.'],model:{start:'seek',initial:[],assentField:'claim',commitmentDomains:{claim:{states:['qualified','withhold'],oppositions:[['qualified','withhold']]}},nodes:{
 seek:{prompt:'Which record?',options:[{id:'original',label:'Read original',next:'review',reveal:['originalSeen']},{id:'copy',label:'Read a transcription',next:'review'}]},
 review:{prompt:'What can be reported?',options:[{id:'cite',label:'Publish a qualified original citation',requires:['originalSeen'],commitments:{claim:'qualified'},closes:['edit'],next:'after'},{id:'hold',label:'Withhold the claim',commitments:{claim:'withhold'},next:null}]},
 after:{prompt:'Later correction',options:[{id:'correct',label:'Publish a correction',commitments:{claim:'withhold'},next:null},{id:'edit',label:'Edit before publication',next:null}]}
 }}});
 assert.equal(reasonSemantically(c,{path:['copy','cite','correct']}).status,'incompatible');
 assert.equal(reasonSemantically(c,{path:['original','cite','edit']}).status,'incompatible');
 const a=run(c,{path:['original','cite','correct']});assert.equal(a.structure.semanticRevisions.length,1);assert.ok(a.structure.locked.includes('edit'));
 run(c,{path:['copy','hold']});
});
test('incompatible source/mechanism and missing interpretive warrant decline',()=>{
 const c=structuredClone(semanticCases.money);c.operations=['decision_map'];assert.equal(reasonSemantically(c,c.initial).status,'incompatible');
 const d=structuredClone(semanticCases.apology);delete d.model.agency;assert.equal(reasonSemantically(d,d.initial).status,'incompatible');
});
