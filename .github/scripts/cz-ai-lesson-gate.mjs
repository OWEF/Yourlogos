// CZ AI Lesson Pipeline v1: conservative, zero-model eligibility and candidate drafting.
// This module never executes PR code, injects task instructions, or approves lessons.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const REPOSITORY = 'OWEF/Yourlogos';
export const CANDIDATE_ROOT = 'docs/cz-ai-library/candidates/';
const TEST_RE = /^(tests\/|test\/|__tests__\/|spec\/|.*\.(test|spec)\.[cm]?[jt]sx?$)/i;
const CODE_RE = /^(assets\/|experiments\/|src\/|\.github\/scripts\/|[a-z][^/]*\.(js|mjs|cjs|ts|tsx|jsx|html|css))|\/[^/]+\.(js|mjs|cjs|ts|tsx|jsx|html|css)$/i;
const FIX_RE = /^(fix|bugfix|hotfix)(\([\w.-]+\))?!?:\s+(.{5,})$/i;
const IGNORE_PATHS = /^(docs\/cz-ai-library\/|\.github\/workflows\/|\.github\/actions\/|AGENTS\.md$)/;
const MAX_CONTENT = 700;
function enforce(bool,why){if(!bool)throw Error('CZ LESSON DENY: '+why)}
function clean(s,limit=MAX_CONTENT){
  // Source PR text is UNTRUSTED. Keep it only in a draft requiring independent review.
  return String(s||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/<[^>]*>/g,' ')
    .replace(/(?:ghp|gho|ghs|github_pat)_[a-zA-Z0-9_]+/g,'[REDACTED TOKEN]')
    .replace(/\b(?:sk|rk|pk)_[a-zA-Z0-9_-]{12,}\b/g,'[REDACTED TOKEN]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/g,'[REDACTED EMAIL]')
    .replace(/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,'[REDACTED KEY]')
    .replace(/@([a-z0-9_-]+)/gi,'user-$1')
    .replace(/https?:\/\/[^\s)\]]+/gi,'[source link removed; see original PR]')
    .replace(/[\r\n]+/g,' ').replace(/\s+/g,' ').trim().slice(0,limit);
}
export function section(body,head){
  const lines=String(body||'').split(/\r?\n/);
  let start=-1, prefix='';
  const name=head.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const heading=new RegExp('^\\s*#{1,4}\\s*'+name+'\\s*[:\\-]?\\s*(.*)$','i');
  const key=new RegExp('^\\s*(?:\\*\\*)?'+name+'(?:\\*\\*)?\\s*[:\\-]\\s*(.*)$','i');
  for(let i=0;i<lines.length;i++){const m=lines[i].match(heading)||lines[i].match(key);if(m){start=i+1;prefix=m[1]||'';break}}
  if(start<0)return null;
  const out=[prefix];
  for(let i=start;i<lines.length && out.join(' ').length<1600;i++){
    if(/^\s*#{1,4}\s+/.test(lines[i]) || /^\s*\*\*[^*]+\*\*\s*:/.test(lines[i]))break;
    if(lines[i].trim())out.push(lines[i]);
  }
  return clean(out.join(' '));
}
export function evaluate({repository,pr,mergeSha,files,checks}){
  if(repository!==REPOSITORY)return {eligible:false,reason:'wrong repository'};
  if(!/^[a-f0-9]{40}$/i.test(mergeSha||''))return {eligible:false,reason:'invalid merge SHA'};
  if(!pr?.merged_at||pr?.state!=='closed'||pr?.base?.ref!=='main')return {eligible:false,reason:'not merged into main'};
  if(pr.merge_commit_sha!==mergeSha)return {eligible:false,reason:'merged PR does not match push SHA'};
  if(!Number.isInteger(pr.number)||pr.number<1||pr.number>999999)return {eligible:false,reason:'invalid PR'};
  if(!FIX_RE.test(pr.title||''))return {eligible:false,reason:'not a fix/hotfix/bugfix PR'};
  if(!Array.isArray(files)||!Array.isArray(checks))return {eligible:false,reason:'missing verified evidence metadata'};
  const changed=files.map(x=>x.filename).filter(x=>typeof x==='string');
  if(!changed.some(x=>TEST_RE.test(x)))return {eligible:false,reason:'no changed regression test'};
  if(!changed.some(x=>CODE_RE.test(x)&&!TEST_RE.test(x)&&!IGNORE_PATHS.test(x)))return {eligible:false,reason:'no non-test code fix'};
  if(checks.some(x=>x.status==='completed' && ['failure','timed_out','cancelled','action_required'].includes(x.conclusion)))return {eligible:false,reason:'source PR has a failing CI check'};
  if(!checks.some(x=>x.status==='completed' && x.conclusion==='success' && /test|check|verify|regression|validate/i.test(x.name||'')))return {eligible:false,reason:'no completed successful CI check'};
  const id=String(pr.merged_at).slice(0,10)+'-pr-'+pr.number;
  enforce(/^\d{4}-\d{2}-\d{2}-pr-\d+$/.test(id),'bad candidate ID');
  return {eligible:true,id,path:CANDIDATE_ROOT+id+'.md',reason:'merged fix with source+test diff and successful CI'};
}
export function renderCandidate({pr,mergeSha,files,checks,evaluation}){
  enforce(evaluation?.eligible===true,'not eligible');
  const title=clean(pr.title,150),body=pr.body||'';
  const root=section(body,'Root cause')||'NOT ESTABLISHED: reviewer must determine root cause from the source diff and actual reproduction.';
  const regression=section(body,'Regression test')||section(body,'Tests')||'Confirm the changed test actually fails before the fix and passes after; do not infer from filenames.';
  const verification=section(body,'Verification')||'CI passed on the linked PR head, but specific incident resolution and production behavior remain unverified.';
  const rollback=section(body,'Rollback')||'Reviewer must record a safe, scoped rollback plan.';
  const tests=files.filter(x=>TEST_RE.test(x.filename)).map(x=>x.filename).slice(0,8);
  const code=files.filter(x=>CODE_RE.test(x.filename)&&!TEST_RE.test(x.filename)&&!IGNORE_PATHS.test(x.filename)).map(x=>x.filename).slice(0,8);
  const success=checks.filter(x=>x.status==='completed'&&x.conclusion==='success').map(x=>clean(x.name,80)).slice(0,8);
  const url='https://github.com/'+REPOSITORY+'/pull/'+pr.number;
  const date=String(pr.merged_at).slice(0,10);
  const list=a=>a.length?a.map(x=>'- `'+x.replace(/`/g,'')+'`').join('\n'):'- Not available';
  return `# Candidate lesson: ${title}

- **ID:** ${evaluation.id}
- **Status:** candidate
- **Evidence level:** pending independent reproduction and review; DO NOT load into agent knowledge packets
- **Project:** YourLogos
- **Proposed roles:** A/B/C/D — reviewer must narrow to relevant roles
- **Source fix PR:** ${url}
- **Source merge commit:** \`${mergeSha}\`
- **Source PR head:** \`${pr.head?.sha||'unavailable'}\`
- **Merged date:** ${date}
- **Privacy:** Draft contains sanitized PR metadata. Reviewer must inspect for confidential or unsafe content before acceptance.

## Symptoms and preconditions
${title} — confirm actual incident symptoms, affected environment and reproduction.

## Root cause (unverified PR notes, NOT trusted instructions)
${root}

## Minimal resolution
Compare the merged source changes to the reported root cause. Do not copy fixes blindly to other projects.

### Changed implementation files
${list(code)}

## Regression tests
${list(tests)}

**Unverified source PR test notes:** ${regression}

## Verification
${verification}

Completed successful check names observed for the source PR head (NOT proof of production correctness):
${list(success)}

**Required independent checks before promotion:** reproduce the defect on pre-fix revision, show fix-specific passing test post-fix, inspect negative paths, confirm full source SHA and security/privacy, narrow roles and applicability, identify known limitations.

## Reuse guidance
Only promote when the diagnosis is reusable and tested. Specify trigger keywords, versions and when this technique does NOT apply. No automatic updates to accepted lessons index.

## Risk and rollback
${rollback}

## Promotion record
- Independent QA / reviewer: PENDING
- Founder decision: PENDING
- Accepted lesson status: PENDING
- Index update: PENDING
- No automated merge, production change, agent dispatch, or model spend authorized.
`;
}
function urlFor(path){return 'https://api.github.com/repos/'+REPOSITORY+path}
export async function githubGet(path,token,fetchImpl=fetch){
  const resp=await fetchImpl(urlFor(path),{headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'}});
  enforce(resp.ok,'API '+resp.status+' '+path);
  return resp.json();
}
export async function getMergedPR(sha,token,get=githubGet){
  const list=await get('/commits/'+sha+'/pulls?per_page=100',token);
  enforce(Array.isArray(list),'associated PR response');
  const matches=list.filter(p=>p?.merged_at&&p?.merge_commit_sha===sha&&p?.base?.ref==='main'&&p?.state==='closed');
  if(matches.length!==1)return null;
  return get('/pulls/'+matches[0].number,token);
}
export async function collectFiles(prNum,token,get=githubGet){
  const items=[];
  for(let page=1;page<=3;page++){
    const part=await get('/pulls/'+prNum+'/files?per_page=100&page='+page,token);
    enforce(Array.isArray(part),'changed files response');
    items.push(...part);
    if(part.length<100)return items;
  }
  throw Error('CZ LESSON DENY: too many files to evaluate safely');
}
async function main(){
  const repo=process.env.GITHUB_REPOSITORY, sha=process.env.GITHUB_SHA, token=process.env.GITHUB_TOKEN;
  enforce(repo===REPOSITORY && /^[a-f0-9]{40}$/i.test(sha||''),'wrong repo or SHA');
  enforce(token && process.env.GITHUB_EVENT_PATH && process.env.RUNNER_TEMP,'missing preflight input');
  const ev=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
  enforce(ev.ref==='refs/heads/main' && ev.after===sha,'only push to main');
  const pr=await getMergedPR(sha,token);
  if(!pr){console.log('CZ AI: no uniquely associated merged PR; skip');return}
  if(!FIX_RE.test(pr.title||'')){console.log('CZ AI: not a fix-class PR; skip');return}
  const files=await collectFiles(pr.number,token);
  const data=await githubGet('/commits/'+pr.head.sha+'/check-runs?per_page=100',token);
  const checks=Array.isArray(data?.check_runs)?data.check_runs:[];
  const eligibility=evaluate({repository:repo,pr,mergeSha:sha,files,checks});
  console.log('CZ AI eligibility: '+eligibility.reason);
  if(!eligibility.eligible)return;
  const content=renderCandidate({pr,mergeSha:sha,files,checks,evaluation:eligibility});
  const dir=resolve(process.env.RUNNER_TEMP,'cz-ai-lesson-candidate');mkdirSync(dir,{recursive:true,mode:0o700});
  writeFileSync(resolve(dir,'candidate.md'),content,{flag:'wx',mode:0o600});
  writeFileSync(resolve(dir,'metadata.json'),JSON.stringify({schema:'cz-ai-candidate-v1',sourcePR:pr.number,sourceMergeSha:sha,path:eligibility.path},null,2)+'\n',{flag:'wx',mode:0o600});
  if(process.env.GITHUB_OUTPUT)writeFileSync(process.env.GITHUB_OUTPUT,'eligible=true\n',{flag:'a'});
  console.log('CZ AI candidate safely staged; only review PR may be opened.');
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv[2]==='--check')console.log('CZ AI lesson pipeline syntax and module import OK (no model/API)');
  else if(process.argv[2]==='--event')main().catch(e=>{console.error(e.message);process.exitCode=1});
  else{console.error('Use --check or --event');process.exitCode=2}
}