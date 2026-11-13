import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {semanticCases as nowCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically as nowReason,expressSemantic as nowExpress} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
// The baseline is a separate, read-only checkout of exactly 800f31e in CI.
// No mutation to either repo, no network calls, no user/account data.
const baselineRoot=resolve('baseline-cz13/philosophy-engine/encounter');
const beforeCases=(await import(pathToFileURL(resolve(baselineRoot,'semantic-cases-v12.js')).href)).semanticCases;
const beforeEngine=await import(pathToFileURL(resolve(baselineRoot,'semantic-reasoning-v12.js')).href);
const count=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
const inputs={
 money:[
  {amounts:[1,0,1],budgets:[8],intentions:{lamp:2}},
  {amounts:[0,0,0],budgets:[8]},
  {amounts:[1,2,1],budgets:[8]}],
 workshop:[
  {amounts:[0,4],budgets:[4]},
  {amounts:[3,1],budgets:[4]},
  {amounts:[1,3],budgets:[4]},
  {amounts:[2,2],budgets:[4]}],
 apology:[
  {path:['offer','offer']},
  {path:['space','space']},
  {path:['offer','space']}],
 evidence:[
  {path:['endorse','endorse']},
  {path:['suspend','suspend']},
  {path:['endorse','suspend']}],
 dillard:[
  {amounts:[0,3,3],budgets:[6],repetitions:5},
  {amounts:[3,1,2],budgets:[6],repetitions:5},
  {amounts:[6,0,0],budgets:[6],repetitions:5}],
 kierkegaard:[
  {path:['change','risk','continue']},
  {path:['change','surprise','adapt']},
  {path:['stay','missed','reflect']}]
};
for(const [id,examples] of Object.entries(inputs))for(const [i,input] of examples.entries()){
 const prevPacket=beforeEngine.reasonSemantically(beforeCases[id],input);
 const currPacket=nowReason(nowCases[id],input);
 if(prevPacket.status!=='ready'||currPacket.status!=='ready')
  throw Error(id+' '+i+' rejected: '+JSON.stringify({old:prevPacket.reason,new:currPacket.reason}));
 const old=beforeEngine.expressSemantic(prevPacket),current=nowExpress(currPacket);
 if(old.status!=='ready'||current.status!=='ready')
  throw Error(id+' '+i+' reading failed: '+JSON.stringify({old:old.reason,new:current.reason}));
 const brief=v=>({
  idea:v.headline+' '+v.experience,
  philosopher:v.interpretation,
  question:v.proactiveQuestion,
  words:{idea:count(v.headline+' '+v.experience),philosopher:count(v.interpretation),question:count(v.proactiveQuestion),total:count(v.headline+' '+v.experience+' '+v.interpretation+' '+v.proactiveQuestion)}
 });
 const after=brief(current),before=brief(old);
 console.log('CZ13-BEFORE-AFTER '+JSON.stringify({source:id,example:i+1,input,old:before,new:after,
  centralClaimKind:currPacket.meaning.kind,secondary:currPacket.secondaryObservations?.map(x=>x.kind)||[],
  sourceTrace:currPacket.sourceAdmission.claimTraceStatus}));
}
