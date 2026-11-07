import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLibrary, validateManifest, validateLesson } from '../.github/scripts/validate-cz-ai-library.mjs';
import { readFileSync } from 'node:fs';

const orig=JSON.parse(readFileSync('docs/cz-ai-library/manifest.json','utf8'));
const clone=(x)=>JSON.parse(JSON.stringify(x));
test('exactly 4 role bindings, 8 scoped skills and at least 1 indexed verified lesson',()=>{
  const v=validateLibrary();
  assert.equal(v.roles,4);
  assert.equal(v.skills,8);
  assert.ok(v.lessons>=1,'accepted verified lesson index must not be empty');
});
test('deny implicit automated learning or dispatch',()=>{
  for(const k of ['automaticLearning','automaticDispatch','automaticMerge']){
    const m=clone(orig);m[k]=true;assert.throws(()=>validateManifest(m),/unsafe automation/);
  }
});
test('deny role D escalating to write access',()=>{
  const m=clone(orig);m.roles.debugging.readOnly=false;
  assert.throws(()=>validateManifest(m),/read-only/);
});
test('deny rogue/unapproved role profiles and path traversal',()=>{
  const m=clone(orig);m.roles['frontend-ux'].profile='other.md';
  assert.throws(()=>validateManifest(m),/role profile/);
  const n=clone(orig);n.skills['incident-triage']='../../secrets';
  assert.throws(()=>validateManifest(n),/relative path/);
});
test('deny an unverified lesson without evidence',()=>{
  assert.throws(()=>validateLesson('**ID:** fake\n**Status:** ci-verified\n## Symptoms\n## Verification'),/source evidence/);
});
