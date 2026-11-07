import test from 'node:test';
import assert from 'node:assert/strict';
import {selectContext} from '../.github/scripts/select-cz-ai-context.mjs';
const run=(role,task,budget=2500)=>selectContext({role,task,project:'YourLogos',maxTokens:budget});
test('Agent A loads animation skill for LilLogo, not full catalog',()=>{
  const x=run('frontend-ux','LilLogo animation, blink and eyelid behavior');
  assert(x.skillIds.includes('animation-lifecycle'));
  assert(x.skillIds.length<=2 && x.lessonIds.length<=3);
  assert(!x.context.includes('# Backend/API changes'));
  assert(x.estimatedTokens<=2500);
});
test('Agent D loads timeout incident and verified diagnostic lesson',()=>{
  const x=run('debugging','Kimi model output missing after hard timeout; need error diagnosis');
  assert(x.skillIds.includes('incident-triage'));
  assert(x.lessonIds.includes('2026-11-05-ci-timeout-diagnostics'));
  assert(!x.context.includes('# Mobile-first UI quality'));
  assert(x.context.includes('read-only incident diagnosis'));
});
test('Agent B chooses relevant backend or data skill',()=>{
  const x=run('backend-apis','API endpoint input validation and idempotency');
  assert(x.skillIds.includes('api-contracts'));
  assert(!x.context.includes('SKILL.md') || !x.context.includes('## Skill frontmatter'));
});
test('Agent C gets regression knowledge and avoids unrelated lessons',()=>{
  const x=run('testing-qa','regression test source modules and failures');
  assert(x.skillIds.includes('regression-design'));
  assert.equal(x.lessonIds.length,0);
});
test('No match gets one default role skill, not entire library',()=>{
  const x=run('debugging','Investigate zzz-specific unexpected behavior');
  assert.equal(x.skillIds.length,1);
  assert.equal(x.lessonIds.length,0);
});
test('Hard safety checks and input size caps',()=>{
  assert.throws(()=>run('superagent','make something big'),/unknown role/);
  assert.throws(()=>run('debugging','bad'),/invalid bounded task/);
  assert.throws(()=>run('frontend-ux','Make animation',700),/budget/);
  assert.throws(()=>run('frontend-ux','Make animation',4001),/budget/);
});
test('Different library size has no effect on prompt without matching lesson',()=>{
  const x=run('frontend-ux','LilLogo animation with neutral idle transitions');
  assert(!x.context.includes('# Accepted lessons index'));
  assert(!x.context.includes('"schema": "cz-ai-skills-v1"'));
  assert(x.totalLibrarySkills>=8);
});

test('Verified onboarding replay lesson is retrieved only for relevant Agent A and C tasks',()=>{
  const id='2026-11-07-settings-onboarding-replay-qa-gate';
  for(const role of ['frontend-ux','testing-qa']){
    const hit=run(role,'Settings onboarding replay hidden by QA flag for returning users');
    assert(hit.lessonIds.includes(id),role+' should retrieve the accepted replay lesson');
    assert(hit.estimatedTokens<=hit.maxTokens);
    assert(hit.skillIds.length<=2 && hit.lessonIds.length<=3);
  }
  const irrelevant=run('frontend-ux','LilLogo animation blink easing with eye motion');
  assert(!irrelevant.lessonIds.includes(id),'unrelated animation tasks must not receive replay lesson');
  const wrongRole=run('debugging','Settings onboarding replay hidden by QA flag');
  assert(!wrongRole.lessonIds.includes(id),'roles without approved application must not receive replay lesson');
});
