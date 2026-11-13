import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,validateTension} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';

test('every admitted source exposes a provisionally curated—not independently verified—warrant',()=>{
 for(const [id,c] of Object.entries(semanticCases)){
  const p=reasonSemantically(c,c.initial);
  assert.equal(p.status,'ready',id+': '+p.reason);
  assert.equal(p.sourceAdmission.sourceUrl,c.source.url);
  assert.equal(p.sourceAdmission.sourceWork,c.source.work);
  assert.equal(p.sourceAdmission.reviewStatus,'curated_provisional');
  assert.equal(p.sourceAdmission.independentlySourceVerified,false);
  assert.ok(p.sourceAdmission.centralClaim.length>25);
  assert.ok(p.sourceAdmission.scenarioBridge.length>25);
 }
});

test('missing, wrong or silently replaced source contracts are rejected',()=>{
 const a=semanticCases.money;
 for(const mutate of [
  c=>{delete c.semantic.admission;},
  c=>{delete c.premiseIds;},
  c=>{c.premiseIds=[];},
  c=>{c.source.url='https://example.org/unsourced';},
  c=>{c.semantic.admission.sourceUrl='https://example.org/false';},
  c=>{c.semantic.admission.mechanism='decision_map';},
  c=>{c.semantic.admission.operation='complementarity';},
  c=>{c.semantic.admission.centralClaim='';},
  c=>{c.semantic.admission.scenarioBridge='';},
  c=>{c.semantic.admission.requiredPremiseIds=['never-declared'];},
  c=>{c.assumptions=[];},
 ]){
  const c=structuredClone(a);mutate(c);
  const p=reasonSemantically(c,c.initial);
  assert.equal(p.status,'incompatible',JSON.stringify(c.semantic?.admission));
 }
});

test('a central claim without permission for its inferential kind is declined',()=>{
 const c=structuredClone(semanticCases.money);
 c.semantic.admission.allowedClaimKinds=['agency'];
 assert.equal(validateTension(c).status,'supported','source skeleton can be structurally valid while its meaning is not admitted');
 assert.equal(reasonSemantically(c,c.initial).status,'incompatible');
});

test('Smith's modeled complementarity is visibly distinguished from his wider productivity argument',()=>{
 const p=reasonSemantically(semanticCases.workshop,semanticCases.workshop.initial);
 assert.equal(p.status,'ready');
 assert.match(p.sourceAdmission.centralClaim,/productivity gains/);
 assert.match(p.sourceAdmission.scenarioBridge,/does not prove specialization increases productivity/);
 assert.equal(p.sourceAdmission.independentlySourceVerified,false);
});

test('a revised decision uses the same source warrant and declares its uncertainty',()=>{
 const c=semanticCases.money;
 const p=reasonSemantically(c,{
  first:{amounts:[1,2,1],budgets:[8]},
  developmentId:'essential-bill',
  amounts:[1,1,1],budgets:[6]
 });
 assert.equal(p.status,'ready');
 assert.equal(p.meaning.kind,'transition');
 assert.ok(p.sourceAdmission.requiredPremiseIds.includes('extra_labor_constant_wage'));
 assert.equal(p.sourceAdmission.reviewStatus,'curated_provisional');
});
