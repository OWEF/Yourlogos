import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCandidateArtifact} from '../.github/scripts/cz-ai-lesson-artifact.mjs';
const sha='a'.repeat(40);
const meta={schema:'cz-ai-candidate-v1',sourcePR:123,sourceMergeSha:sha,path:'docs/cz-ai-library/candidates/2026-11-05-pr-123.md'};
const text='# Candidate lesson\n- **ID:** 2026-11-05-pr-123\n- **Status:** candidate\n'+('A'.repeat(301))+'\n- Founder decision: PENDING\n';
test('candidate artifact must be exact schema, source sha and pending',()=>{
  assert.deepEqual(validateCandidateArtifact(meta,text,sha),{path:meta.path,sourcePR:123});
  assert.throws(()=>validateCandidateArtifact({...meta,path:'../../evil'},text,sha),/path/);
  assert.throws(()=>validateCandidateArtifact({...meta,sourcePR:999},text,sha),/path/);
  assert.throws(()=>validateCandidateArtifact({...meta,sourceMergeSha:'b'.repeat(40)},text,sha),/SHA/);
  assert.throws(()=>validateCandidateArtifact(meta,text.replace('candidate','ci-verified'),sha),/pending/);
});