import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases,semanticSources} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';

const ready=(context,input)=>{
 const packet=reasonSemantically(context,input);
 assert.equal(packet.status,'ready',packet.reason||JSON.stringify(input));
 const output=expressSemantic(packet);
 assert.equal(output.status,'ready',output?.reason||JSON.stringify(input));
 return {packet,output};
};
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;

test('F1 RED: one validated central meaning can have a bounded, selected unmet-intention observation',()=>{
 const c=semanticCases.money;
 const input={amounts:[1,0,1],budgets:[8],intentions:{lamp:2}};
 const {packet,output}=ready(c,input);
 assert.ok(packet.claims.some(x=>x.kind==='intention_gap'));
 assert.ok(packet.secondaryObservations?.some(x=>x.kind==='intention_gap'));
 assert.match(output.experience,/lamp/i);
 assert.match(output.experience,/target|intended|planned/i);
 assert.equal(packet.meaning.kind,'conversion','secondary must not displace the source-central claim');
});

test('F1 RED: revised Descartes commitment is a secondary observation; no invented contradiction',()=>{
 const {packet,output}=ready(semanticCases.evidence,{path:['endorse','suspend']});
 assert.ok(packet.claims.some(x=>x.kind==='revision'));
 assert.equal(packet.meaning.kind,'assent');
 assert.ok(packet.secondaryObservations?.some(x=>x.kind==='revision'));
 assert.match(output.experience,/revis|changed|suspend/i);
});

test('F1/F2 RED: Dillard three distinct allocations get different path-grounded headings and questions',()=>{
 const c=semanticCases.dillard;
 const inputs=[
 {amounts:[0,3,3],budgets:[6],repetitions:5},
 {amounts:[3,1,2],budgets:[6],repetitions:5},
 {amounts:[6,0,0],budgets:[6],repetitions:5}
 ];
 const all=inputs.map(x=>ready(c,x).output);
 assert.equal(new Set(all.map(x=>x.headline)).size,3);
 assert.equal(new Set(all.map(x=>x.proactiveQuestion)).size,3);
 assert.match(all[0].proactiveQuestion,/writing|story/i);
});

test('F1/F2 RED: Kierkegaard choice histories change both headline and forward/backward question',()=>{
 const c=semanticCases.kierkegaard;
 const paths=[['change','risk','continue'],['change','surprise','adapt'],['stay','missed','reflect']];
 const all=paths.map(path=>ready(c,{path}).output);
 assert.equal(new Set(all.map(x=>x.headline)).size,3);
 assert.equal(new Set(all.map(x=>x.proactiveQuestion)).size,3);
 assert.ok(all.every(x=>/choice|later|back|future|know|event|job|offer|decision/i.test(x.proactiveQuestion)));
});

test('F2 RED: agency, assent, Thoreau use the real path in their final question',()=>{
 const a=semanticCases.apology,d=semanticCases.evidence,m=semanticCases.money;
 const agency=[
  ['offer','offer'],['space','space'],['offer','space']
 ].map(path=>ready(a,{path}).output.proactiveQuestion);
 const assent=[
  ['endorse','endorse'],['suspend','suspend'],['endorse','suspend']
 ].map(path=>ready(d,{path}).output.proactiveQuestion);
 const prices=[[1,0,1],[0,0,0],[1,2,1]].map(amounts=>
  ready(m,{amounts,budgets:[8]}).output.proactiveQuestion);
 assert.equal(new Set(agency).size,3);
 assert.equal(new Set(assent).size,3);
 assert.equal(new Set(prices).size,3);
});

test('F3/F6 RED: Smith questions branch on negative/zero/positive signed delta and actual staffing',()=>{
 const c=semanticCases.workshop;
 const cases=[
  {amounts:[0,4],budgets:[4]},
  {amounts:[3,1],budgets:[4]},
  {amounts:[1,3],budgets:[4]},
  {amounts:[2,2],budgets:[4]}
 ];
 const all=cases.map(x=>ready(c,x));
 assert.deepEqual(all.map(x=>x.packet.meaning.evidence.delta),[-1,0,1,1],
  'signed effect must not become its absolute value');
 assert.equal(new Set(all.map(x=>x.output.proactiveQuestion)).size,4);
 assert.match(all[0].output.proactiveQuestion,/less|fewer|no|zero|missing/i);
 assert.match(all[1].output.proactiveQuestion,/same|no gain|unchanged|equal/i);
 assert.match(all[2].output.proactiveQuestion,/more|increase|gain/i);
 assert.match(all[3].output.proactiveQuestion,/more|increase|gain/i);
 assert.notEqual(all[2].output.experience,all[3].output.experience,
  'distinct 1/3 and 2/2 assignments must be described distinctly');
});

test('F3 RED: baseline is derived from a documented switching-time model, not a fixed answer',()=>{
 const c=semanticCases.workshop;
 const cmp=c.model.comparison;
 assert.equal(Object.hasOwn(cmp,'baselineMeasure'),false);
 assert.equal(Number.isSafeInteger(cmp.minutesPerWorker),true);
 assert.equal(Number.isSafeInteger(cmp.switchingMinutesPerWorker),true);
 assert.equal(Number.isSafeInteger(cmp.minutesPerUnit),true);
 const base=ready(c,{amounts:[2,2],budgets:[4]}).packet.meaning.evidence.baseline;
 const altered=structuredClone(c);
 altered.model.comparison.switchingMinutesPerWorker=0;
 const fresh=ready(altered,{amounts:[2,2],budgets:[4]});
 assert.ok(fresh.packet.meaning.evidence.baseline>base,
  'reducing stipulated switching time must alter the baseline computation');
});

test('F4 RED: a materially false replacement of an existing admitted centralClaim is refused',()=>{
 const c=structuredClone(semanticCases.dillard);
 c.semantic.admission.centralClaim='Dillard proves every person who rests is morally inferior.';
 assert.equal(reasonSemantically(c,c.initial).status,'incompatible');
});

test('T5 RED: founder policy 80-120 generated words with bounded three-section outputs',()=>{
 // Policy supersedes old 45-70 for the full three-part Discover reading.
 // Count generated I heading+experience, II interpretation, III exactly one question;
 // exclude source quotation (shown verbatim), fixed UI labels and developer QA.
 for(const [id,c] of Object.entries(semanticCases)){
  const {output}=ready(c,c.initial);
  const own=count(output.headline+' '+output.experience);
  const philosopher=count(output.interpretation);
  const question=count(output.proactiveQuestion);
  assert.ok(own>=10&&own<=48,id+' I='+own);
  assert.ok(philosopher>=18&&philosopher<=65,id+' II='+philosopher);
  assert.ok(question>=9&&question<=26,id+' III='+question);
  assert.equal((output.proactiveQuestion.match(/\?/g)||[]).length,1,id+' one question');
  assert.ok(own+philosopher+question>=80&&own+philosopher+question<=120,
    id+' total='+(own+philosopher+question));
  assert.equal(output.wordCount,own+philosopher+question);
 }
});
