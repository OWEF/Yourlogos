// Validate only a trusted inspection artifact before the narrowly scoped PR writer runs.
// Does not parse arbitrary repository paths or execute any submitted Markdown.
import {readFileSync, appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export function validateCandidateArtifact(m,content,mergeSHA){
  const deny=why=>{throw Error('CZ LESSON ARTIFACT DENY: '+why)};
  if(m?.schema!=='cz-ai-candidate-v1')deny('schema');
  if(!Number.isInteger(m.sourcePR)||m.sourcePR<1||m.sourcePR>999999)deny('sourcePR');
  if(!/^[a-f0-9]{40}$/i.test(mergeSHA||'')||m.sourceMergeSha!==mergeSHA)deny('SHA');
  if(typeof m.path!=='string'||!new RegExp('^docs/cz-ai-library/candidates/\\d{4}-\\d{2}-\\d{2}-pr-'+m.sourcePR+'\\.md$').test(m.path))deny('path');
  if(typeof content!=='string'||content.length<300||content.length>20000)deny('size');
  if(!content.includes('**ID:** '+m.path.split('/').at(-1).replace(/\.md$/,'')))deny('ID mismatch');
  if(!content.includes('**Status:** candidate')||!content.includes('Founder decision: PENDING'))deny('not a pending candidate');
  if(content.includes('**Status:** ci-verified')||content.includes('**Status:** field-verified'))deny('false accepted status');
  return {path:m.path,sourcePR:m.sourcePR};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [metaPath,contentPath,sha]=process.argv.slice(2);
  if(!metaPath||!contentPath||!sha)throw Error('usage: node artifact.mjs META CONTENT SHA');
  const m=JSON.parse(readFileSync(metaPath,'utf8'));
  const x=validateCandidateArtifact(m,readFileSync(contentPath,'utf8'),sha);
  if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`source_pr=${x.sourcePR}\ncandidate_path=${x.path}\n`);
  console.log('CZ AI candidate artifact validated (no model/agent execution)');
}