import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';

const versions=['reflective','surprising','playful','challenging'];
const packets=Object.entries(semanticCases).map(([id,scenario])=>({
 id,packet:reasonSemantically(scenario,scenario.initial)
}));

test('v1.9 meaning-first headings are readable and do not conflate editorial assumptions with observed facts',()=>{
 for(const {id,packet} of packets){
  assert.equal(packet.status,'ready',id+': '+packet.reason);
  const modes=versions.map(mode=>expressSemantic(packet,mode));
  for(const output of modes){
   assert.equal(output.status,'ready',id+': '+JSON.stringify(output));
   assert.ok(output.headline.split(/\s+/).length<=14,id+': overlong heading '+output.headline);
   assert.doesNotMatch(output.headline,/under the scenario assumptions/i);
   assert.ok(output.interpretation.includes(packet.sourceAdmission.centralClaim),id+' source argument absent');
   assert.ok(output.interpretation.includes(packet.sourceAdmission.scenarioBridge),id+' source analogy absent');
   assert.ok(output.interpretation.includes(packet.limitations[0]),id+' uncertainty absent');
   assert.ok(output.wordCount<=160,id+': exceeds safety ceiling');
   assert.equal(output.classification,packet.meaning.classification);
   assert.deepEqual(output.evidence,packet.meaning.evidence);
  }
  assert.ok(new Set(modes.map(x=>x.experience+' '+x.proactiveQuestion)).size>=3,id+' voices became identical');
 }
});

test('initial and revised tradeoff choices have distinct comprehensible reading even with same ending',()=>{
 const scenario=semanticCases.money;
 const first={amounts:[1,2,1],budgets:[8]};
 const changed=reasonSemantically(scenario,{first,developmentId:scenario.development.id,
  amounts:[1,1,1],budgets:[6]});
 const retained=reasonSemantically(scenario,{first:{amounts:[1,1,1],budgets:[8]},developmentId:scenario.development.id,
  amounts:[1,1,1],budgets:[6]});
 for(const packet of [changed,retained])assert.equal(packet.status,'ready');
 const changedText=expressSemantic(changed),retainedText=expressSemantic(retained);
 assert.equal(changedText.status,'ready');
 assert.equal(retainedText.status,'ready');
 assert.notEqual(changedText.headline,retainedText.headline);
 assert.notEqual(changedText.experience,retainedText.experience);
 assert.match(changedText.experience,/extra working hours/);
 assert.match(changedText.experience,/earlier plan no longer fit/);
 assert.match(retainedText.experience,/kept the original quantities/);
});

test('repetition is neither a prediction of habit nor a claim about the participant',()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[1,2,3],budgets:[6],repetitions:5});
 const rendered=expressSemantic(p);
 assert.equal(rendered.status,'ready');
 assert.match(rendered.experience,/imagined evenings/);
 assert.match(rendered.experience,/does not establish your actual habits/);
});

test('an unchosen Kierkegaard route is never treated as an experienced future',()=>{
 const p=reasonSemantically(semanticCases.kierkegaard,{path:['stay','missed','reflect']});
 const rendered=expressSemantic(p);
 assert.equal(rendered.status,'ready');
 assert.match(rendered.experience,/imagined scenario/);
 assert.doesNotMatch(rendered.experience,/chose to you |learn you /i);
 assert.match(rendered.experience,/outcome of the unchosen path is still unknown/);
});
