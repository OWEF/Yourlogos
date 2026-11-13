import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,expressSemantic,ENCOUNTER_WORD_POLICY} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
const words=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
const dimensions={
 money:[
  {amounts:[1,0,1],budgets:[8],intentions:{lamp:2}},
  {amounts:[0,0,0],budgets:[8]},
  {amounts:[1,2,1],budgets:[8]}
 ],
 workshop:[[0,4],[3,1],[1,3],[2,2],[4,0]].map(amounts=>({amounts,budgets:[4]})),
 apology:[['offer','offer'],['space','space'],['offer','space'],['space','offer']].map(path=>({path})),
 evidence:[['endorse','endorse'],['suspend','suspend'],['endorse','suspend'],['suspend','endorse']].map(path=>({path})),
 dillard:Array.from({length:7},(_,writing)=>Array.from({length:7-writing},(_,messages)=>({amounts:[writing,messages,6-writing-messages],budgets:[6],repetitions:5}))).flat(),
 kierkegaard:[]
};
function kirPaths(node,path=[]){
 if(!node){dimensions.kierkegaard.push({path});return}
 const options=semanticCases.kierkegaard.model.nodes[node].options;
 for(const o of options)kirPaths(o.next,[...path,o.id]);
}
kirPaths(semanticCases.kierkegaard.model.start);
test('Founder policy explicitly supersedes earlier 45-70 overall target',()=>{
 assert.equal(ENCOUNTER_WORD_POLICY.total.min,80);
 assert.equal(ENCOUNTER_WORD_POLICY.total.max,120);
 assert.ok(ENCOUNTER_WORD_POLICY.exclude.includes('original quotation'));
});
test('full curated allocation/decision matrix stays within each section and 80-120 total',()=>{
 for(const [id,inputs] of Object.entries(dimensions)){
  for(const input of inputs){
   const p=reasonSemantically(semanticCases[id],input);
   assert.equal(p.status,'ready',id+': '+JSON.stringify(input)+' '+p.reason);
   const o=expressSemantic(p);
   assert.equal(o.status,'ready',id+': '+JSON.stringify(input)+' '+o.reason);
   const sections={
    idea:words(o.headline+' '+o.experience),
    philosopher:words(o.interpretation),
    question:words(o.proactiveQuestion)
   };
   const total=Object.values(sections).reduce((a,b)=>a+b,0);
   for(const [section,n] of Object.entries(sections)){
    const rule=ENCOUNTER_WORD_POLICY.sections[section];
    assert.ok(n>=rule.min&&n<=rule.max,id+': '+JSON.stringify(input)+' '+section+'='+n);
   }
   assert.ok(total>=80&&total<=120,id+': '+JSON.stringify(input)+' total='+total);
   assert.equal(o.wordCount,total,id+' word counter must agree');
   assert.equal((o.proactiveQuestion.match(/\?/g)||[]).length,1,id+' one philosophical question');
   assert.doesNotMatch(o.experience+' '+o.proactiveQuestion,/After (offer an apology|give space|endorse the attribution|suspend judgment)\b/i);
   assert.doesNotMatch(o.experience,/\b1 (?:chair repairs|reading lamps|shelves)\b/);
   assert.doesNotMatch(o.experience,/This allocation corresponds to (?:0|4|8) extra working hours\./,
    'do not repeat the same conversion in the heading and experience');
  }
 }
});
test('all six scenarios have a real question grounded in the chosen route',()=>{
 for(const [id,inputs] of Object.entries(dimensions)){
  const questions=[];
  for(const input of inputs.slice(0,Math.min(4,inputs.length))){
   const p=reasonSemantically(semanticCases[id],input);
   questions.push(expressSemantic(p).proactiveQuestion);
  }
  assert.ok(new Set(questions).size>=2,id+' question must not be constant across decisions');
 }
});
