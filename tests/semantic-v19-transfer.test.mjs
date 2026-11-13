import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases,semanticSources} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,expressSemantic,validateTension,constructScenario} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
import {selectExpressionMeaning,composeExpression} from '../philosophy-engine/encounter/expression-engine-v1.js';

test('six distinct philosophers all use the same meaning/1.2 and consumer expression contract',()=>{
 const expected=['money','workshop','apology','evidence','dillard','kierkegaard'];
 assert.deepEqual(Object.keys(semanticCases).sort(),expected.sort());
 for(const [key,c] of Object.entries(semanticCases)){
  const p=reasonSemantically(c,c.initial);
  assert.equal(p.status,'ready',key+': '+p.reason);
  assert.equal(p.version,'meaning/1.2');
  assert.ok(p.meaning.evidence);
  assert.ok(c.semantic.selection.central.includes(p.meaning.kind));
  const meaning=selectExpressionMeaning(p);
  assert.equal(meaning.kind,'semantic');
  const rendered=composeExpression(meaning);
  assert.equal(rendered.status,'ready',key+': '+JSON.stringify(rendered));
  assert.ok(rendered.interpretation.includes(c.semantic.boundary));
 }
});

test('Dillard 28 bounded schedules use a shared hypothesis of repetition, not a habit diagnosis',()=>{
 const c=semanticCases.dillard;
 const results=[];
 for(let writing=0;writing<=6;writing++)for(let messages=0;messages<=6-writing;messages++){
  const rest=6-writing-messages;
  const p=reasonSemantically(c,{amounts:[writing,messages,rest],budgets:[6],repetitions:5});
  assert.equal(p.status,'ready',JSON.stringify({writing,messages,rest,p}));
  assert.equal(p.meaning.kind,'repetition');
  assert.equal(p.meaning.evidence.cumulative[0].units,5*writing);
  assert.ok(p.meaning.text.includes('not evidence that you will adopt it'));
  results.push(p.meaning.text);
 }
 assert.equal(results.length,28);
 assert.equal(new Set(results).size,28,'materially different schedules must remain distinguishable');
 assert.equal(reasonSemantically(c,{amounts:[6,1,0],budgets:[6],repetitions:5}).status,'incompatible');
 assert.equal(reasonSemantically(c,{amounts:[2,2,2],budgets:[6],repetitions:1}).status,'incompatible');
});

test('Kierkegaard eight pathways retain their chosen action, hypothetical new event and later response',()=>{
 const c=semanticCases.kierkegaard;
 const paths=[];
 function collect(at,path){
  if(at===null){paths.push(path);return;}
  for(const option of c.model.nodes[at].options)collect(option.next,[...path,option.id]);
 }
 collect(c.model.start,[]);
 assert.equal(paths.length,8);
 const texts=new Set();
 for(const path of paths){
  const p=reasonSemantically(c,{path});
  assert.equal(p.status,'ready',JSON.stringify(path));
  assert.equal(p.meaning.kind,'information');
  assert.equal(p.structure.steps.length,3);
  assert.equal(p.meaning.evidence.firstChoice,path[0]);
  assert.equal(p.meaning.evidence.lastChoice,path[2]);
  assert.match(p.meaning.text,/imagined route/);
  assert.match(p.meaning.text,/unchosen future/);
  texts.add(p.meaning.text);
 }
 assert.equal(texts.size,8,'eight different choice histories must not collapse to one generic reading');
});

test('wrong mechanism and absence of observed later information decline instead of invented transfer',()=>{
 const c=semanticCases.kierkegaard;
 const invalid=constructScenario(semanticSources.kierkegaard,{model:semanticCases.dillard.model});
 assert.equal(validateTension(invalid).status,'incompatible');
 const erased=structuredClone(c);
 for(const node of Object.values(erased.model.nodes))for(const option of node.options)delete option.reveal;
 assert.equal(reasonSemantically(erased,c.initial).status,'incompatible');
});
