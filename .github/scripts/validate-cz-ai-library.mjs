// No network, credentials, paid model, file mutation or agent invocation.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ROLE_KEYS = ['frontend-ux','backend-apis','testing-qa','debugging'];
const ROOT_REL = 'docs/cz-ai-library';
function must(ok, msg) { if (!ok) throw Error('CZ-LIB DENY: '+msg); }
function safeRel(s) {
  must(typeof s === 'string' && s.length > 0 && !s.startsWith('/') &&
      !s.split('/').includes('..') && !s.includes('\\'), 'invalid relative path');
  return s;
}
export function validateManifest(m) {
  must(m?.schema === 'cz-ai-skills-v1' && m?.version === '1.0.0', 'schema/version');
  must(m.visibility === 'public-sanitized' && m.mode === 'explicit-select-on-task', 'visibility/mode');
  must(m.automaticLearning === false && m.automaticDispatch === false &&
       m.automaticMerge === false && m.maxConcurrentKimiSessions === 1, 'unsafe automation');
  must(Object.keys(m.roles||{}).sort().join(',') === [...ROLE_KEYS].sort().join(','), 'expected exactly 4 roles');
  const ids=Object.keys(m.skills||{});
  must(ids.length >= 8 && new Set(ids).size === ids.length,'expected skills catalog');
  for(const id of ids) { must(/^[a-z][a-z0-9-]+$/.test(id),'unsafe skill id'); safeRel(m.skills[id]); }
  for(const key of ROLE_KEYS) {
    const x=m.roles[key];
    must(x?.profile === '.github/kimi/profiles/'+key+'.md','invalid role profile: '+key);
    must(x.agent === ({'frontend-ux':'A','backend-apis':'B','testing-qa':'C','debugging':'D'})[key], 'agent mismatch');
    must(Array.isArray(x.skills) && x.skills.length >= 1 && x.skills.every(s => ids.includes(s)), 'unknown role skill');
    must(x.readOnly === (key==='debugging'), 'D must be read-only');
  }
  safeRel(m.lessonsIndex); safeRel(m.governance);
  return m;
}
export function validateLesson(s) {
  for(const field of ['**ID:**','**Status:**','## Symptoms','## Verification']) must(s.includes(field),'lesson missing '+field);
  must(/\*\*Status:\*\* (candidate|ci-verified|field-verified|superseded)/.test(s),'unrecognized lesson status');
  must(s.includes('https://github.com/'),'lesson requires source evidence');
  return true;
}
export function validateLibrary(root=process.cwd()) {
  const file=(p)=>{const x=resolve(root,ROOT_REL,p);const prefix=resolve(root,ROOT_REL)+sep;must(x.startsWith(prefix),'path traversal');must(existsSync(x),'missing '+p);return readFileSync(x,'utf8');};
  const m=validateManifest(JSON.parse(file('manifest.json')));
  file(m.governance);const idx=file(m.lessonsIndex);
  for(const [id,path] of Object.entries(m.skills)) {
    const s=file(path);
    must(s.startsWith('---\n'),'missing skill frontmatter '+id);
    must(s.includes('id: '+id+'\n'),'skill ID mismatch '+id);
    const roles=s.match(/^roles: \[(.*)\]$/m)?.[1]?.split(',').map(x=>x.trim())||[];
    must(roles.length>0 && roles.every(r=>ROLE_KEYS.includes(r)),'skill role declaration '+id);
    for(const r of ROLE_KEYS) if(m.roles[r].skills.includes(id))
      must(roles.includes(r),'manifest role not admitted by skill '+r+'/'+id);
  }
  const entries=[...idx.matchAll(/\[lesson\]\(([^)]+\.md)\)/g)].map(x=>x[1]);
  must(entries.length>=1,'no indexed verified lessons');
  for(const e of entries){safeRel(e);validateLesson(file('lessons/'+e));}
  return { roles:ROLE_KEYS.length,skills:Object.keys(m.skills).length,lessons:entries.length };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log('CZ AI library checks passed:',JSON.stringify(validateLibrary()));
}
