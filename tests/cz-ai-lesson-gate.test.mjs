import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,renderCandidate,section,getMergedPR,collectFiles} from '../.github/scripts/cz-ai-lesson-gate.mjs';
const sha='b'.repeat(40);
const pr={number:140,title:'fix(ui): restore LilLogo offline loading',body:'## Root cause\nOld cache key masked the new resource.\n## Tests\nnode --test tests/sw.test.mjs\n## Rollback\nRevert merge and restore cache version.',merged_at:'2026-11-05T23:00:00Z',state:'closed',base:{ref:'main'},head:{sha:'a'.repeat(40)},merge_commit_sha:sha};
const files=[{filename:'sw.js'},{filename:'tests/sw.test.mjs'}];
const checks=[{name:'Discover regression tests',status:'completed',conclusion:'success'}];
const base=()=>({repository:'OWEF/Yourlogos',pr,mergeSha:sha,files,checks});
test('merged fix plus changed test and completed successful CI yields candidate only',()=>{
  const eligibility=evaluate(base());assert.equal(eligibility.eligible,true);
  assert.equal(eligibility.path,'docs/cz-ai-library/candidates/2026-11-05-pr-140.md');
  const s=renderCandidate({...base(),evaluation:eligibility});
  assert.match(s,/\*\*Status:\*\* candidate/);
  assert.match(s,/Old cache key masked/);
  assert.match(s,/Founder decision: PENDING/);
  assert.doesNotMatch(s,/\*\*Status:\*\* ci-verified/);
});
test('no lesson for a feature, open PR, mismatched merge, wrong repository',()=>{
  assert.equal(evaluate({...base(),pr:{...pr,title:'feat(ui): add gallery'}}).eligible,false);
  assert.equal(evaluate({...base(),pr:{...pr,merged_at:null}}).eligible,false);
  assert.equal(evaluate({...base(),mergeSha:'c'.repeat(40)}).eligible,false);
  assert.equal(evaluate({...base(),repository:'OTHER/repo'}).eligible,false);
});
test('no lesson without a changed regression test and matching source code file',()=>{
  assert.equal(evaluate({...base(),files:[files[0]]}).eligible,false);
  assert.equal(evaluate({...base(),files:[files[1]]}).eligible,false);
  assert.equal(evaluate({...base(),files:[{filename:'docs/cz-ai-library/README.md'},{filename:'tests/sw.test.mjs'}]}).eligible,false);
});
test('no lesson when CI missing, pending or failed',()=>{
  assert.equal(evaluate({...base(),checks:[]}).eligible,false);
  assert.equal(evaluate({...base(),checks:[{name:'test',status:'completed',conclusion:'failure'}]}).eligible,false);
  assert.equal(evaluate({...base(),checks:[{name:'test',status:'in_progress',conclusion:null}]}).eligible,false);
  assert.equal(evaluate({...base(),checks:[...checks,{name:'QA',status:'completed',conclusion:'failure'}]}).eligible,false);
});
test('root cause extraction is bounded and removes likely secrets',()=>{
  const s=section('## Root Cause\nFound sk_test_abcdefghijklnopqrst, alice@example.com, and github_pat_x1234567890123\n## Tests\npass','Root cause');
  assert.doesNotMatch(s,/alice@example\.com|github_pat_x1234567890123|sk_test_abcdefghijklnopqrst/);
  assert.match(s,/\[REDACTED/);
});
test('candidate is robust to absent root-cause evidence and never invents proof',()=>{
  const other={...pr,body:'No evidence included.'};
  const s=renderCandidate({...base(),pr:other,evaluation:evaluate({...base(),pr:other})});
  assert.match(s,/NOT ESTABLISHED/);
  assert.match(s,/NOT proof of production correctness/);
});
test('ambiguous associated PR list is rejected not guessed',async()=>{
  const get=async()=>[{number:1,merged_at:pr.merged_at,merge_commit_sha:sha,state:'closed',base:{ref:'main'}},{number:2,merged_at:pr.merged_at,merge_commit_sha:sha,state:'closed',base:{ref:'main'}}];
  assert.equal(await getMergedPR(sha,'fake',get),null);
});
test('paginated PR file listing keeps full evidence and fails on excessive diff',async()=>{
  const arr=Array.from({length:100},()=>({filename:'src/foo.js'}));let calls=0;
  const get=async()=>{calls++;return calls===1?arr:[{filename:'tests/bug.test.mjs'}]};
  assert.equal((await collectFiles(3,'fake',get)).length,101);
  assert.equal(calls,2);
});