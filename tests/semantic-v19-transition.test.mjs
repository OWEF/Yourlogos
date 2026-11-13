import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {developedTradeoffModel,reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';

const revised=(context,first,amounts,budgets)=>reasonSemantically(context,{
 first:{amounts:[...first.amounts],budgets:[...first.budgets]},
 developmentId:context.development.id,amounts,budgets
});

test('a real budget constraint distinguishes forced reallocation from a voluntary choice',()=>{
 const c=semanticCases.money;
 const first={amounts:[1,2,1],budgets:[8]}; // 8 wage-hours of purchases
 const p=revised(c,first,[1,1,1],[6]);
 assert.equal(p.status,'ready',JSON.stringify(p));
 assert.equal(p.meaning.kind,'transition');
 assert.equal(p.structure.transition.initial.measure,8);
 assert.equal(p.structure.transition.revised.measure,6);
 assert.equal(p.structure.transition.deltaMetric,-2);
 assert.deepEqual(p.structure.transition.deltaAmounts,[0,-1,0]);
 assert.equal(p.structure.transition.originalSelectionStillFeasible,false);
 assert.equal(p.structure.transition.reallocationRequired,true);
 assert.match(p.meaning.text,/no longer fit/);
 assert.equal(expressSemantic(p).status,'ready');

 const stillFits={amounts:[1,0,1],budgets:[8]};
 const voluntary=revised(c,stillFits,[1,1,1],[6]);
 assert.equal(voluntary.status,'ready');
 assert.equal(voluntary.structure.transition.originalSelectionStillFeasible,true);
 assert.match(voluntary.meaning.text,/further choice/);
 assert.equal(voluntary.structure.transition.reallocationRequired,false);
});

test('voluntarily tightening a budget must not be called forced by the external event',()=>{
 const c=semanticCases.money;
 const p=revised(c,{amounts:[1,1,1],budgets:[8]},[1,0,1],[4]);
 assert.equal(p.status,'ready',JSON.stringify(p));
 assert.equal(p.structure.transition.originalSelectionStillFeasible,true,
  'the original six-token purchase fits the externally available six tokens');
 assert.equal(p.structure.transition.reallocationRequired,false);
 assert.equal(p.structure.transition.amountsChanged,true);
 assert.match(p.meaning.text,/further choice/);
 assert.doesNotMatch(p.meaning.text,/no longer fit/);
});

test('the same final allocation has a different explanation for a different first choice',()=>{
 const c=semanticCases.money;
 const revisedAmounts=[1,1,1],revisedBudgets=[6];
 const changed=revised(c,{amounts:[1,2,1],budgets:[8]},revisedAmounts,revisedBudgets);
 const retained=revised(c,{amounts:[1,1,1],budgets:[8]},revisedAmounts,revisedBudgets);
 assert.equal(changed.status,'ready');
 assert.equal(retained.status,'ready');
 assert.equal(retained.structure.transition.amountsChanged,false);
 assert.deepEqual(retained.structure.transition.deltaAmounts,[0,0,0]);
 assert.match(retained.meaning.text,/kept your original quantities/);
 assert.notEqual(changed.meaning.text,retained.meaning.text);
 assert.notDeepEqual(changed.meaning.evidence.initial,retained.meaning.evidence.initial);
});

test('press restriction requires a revised assignment and changes jointly finished output',()=>{
 const c=semanticCases.workshop;
 const unusable=revised(c,{amounts:[3,1],budgets:[4]},[3,1],[4]);
 assert.equal(unusable.status,'incompatible');
 const p=revised(c,{amounts:[3,1],budgets:[4]},[2,2],[4]);
 assert.equal(p.status,'ready',JSON.stringify(p));
 assert.equal(p.meaning.kind,'transition');
 assert.equal(p.structure.transition.initial.measure,1);
 assert.equal(p.structure.transition.revised.measure,2);
 assert.deepEqual(p.structure.transition.deltaAmounts,[-1,1]);
 assert.equal(p.structure.transition.originalSelectionStillFeasible,false);
 assert.match(p.meaning.text,/allocation had to be reconsidered/);
});

test('unannounced or ineffective developments cannot be invented',()=>{
 const c=semanticCases.money;
 assert.equal(reasonSemantically(c,{amounts:[1,1,1],budgets:[6],first:{amounts:[1,2,1],budgets:[8]}}).status,'incompatible');
 assert.equal(reasonSemantically(c,{amounts:[1,1,1],budgets:[6],first:{amounts:[1,2,1],budgets:[8]},developmentId:'not-authored'}).status,'incompatible');
 assert.equal(revised(c,{amounts:[1,2,1],budgets:[8]},[1,2,1],[8]).status,'incompatible');
 const fake=structuredClone(c);
 fake.development.resourceCaps={money:12}; // no restriction
 assert.equal(developedTradeoffModel(fake,fake.development.id),null);
 assert.equal(reasonSemantically(fake,{amounts:[1,1,1],budgets:[6],first:{amounts:[1,2,1],budgets:[8]},developmentId:fake.development.id}).status,'incompatible');
 const omitted=structuredClone(c);delete omitted.semantic.selection.changeCentral;
 assert.equal(revised(omitted,{amounts:[1,2,1],budgets:[8]},[1,1,1],[6]).status,'incompatible');
});

test('first decision remains immutable after evaluation',()=>{
 const c=semanticCases.money;
 const first={amounts:[1,2,1],budgets:[8]};
 const input={first,developmentId:c.development.id,amounts:[1,1,1],budgets:[6]};
 const p=reasonSemantically(c,input);
 assert.equal(p.status,'ready');
 input.amounts[0]=0;
 first.amounts[0]=0;
 assert.deepEqual(p.structure.transition.initial.amounts,[1,2,1]);
 assert.deepEqual(p.structure.transition.revised.amounts,[1,1,1]);
});
