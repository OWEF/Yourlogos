/**
 * CZ-130 correction v2.1.1: evidence-derived capabilities, not caller's
 * eligible flag. No author routing; the existing trusted source contexts are
 * matched by exact SOURCE/QUOTE/WARRANT, then their frozen models compared.
 * All new unsupported sources abstain pending independent admission.
 */
import {semanticCases} from "../encounter/semantic-cases-v12.js";
export const CAPABILITY_VERSION="six-peer-capability/2.1.1";
export const AGENCY_ROLES=Object.freeze(["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
const text=x=>typeof x==="string"&&x.trim().length>0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function authoritativeContextForRecord(record){
 const s=record?.source,a=record?.argument;
 if(!s||!a)return null;
 const matching=Object.values(semanticCases).filter(context=>
   context?.status!=="incompatible" &&
   context?.source?.url===s.referenceUrl &&
   context?.source?.work===s.work &&
   context?.quote===s.quote &&
   context?.semantic?.admission?.centralClaim===a.sourceWarrant &&
   context.semantic.admission.reviewStatus==="curated_provisional");
 return matching.length===1?matching[0]:null;
}
export function graphPathsFromContext(context){
 const m=context?.model;
 if(context?.mechanism!=="decision_map"||!text(m?.start)||!m?.nodes)return null;
 const seen=new Set(),results=[],stack=new Set();
 function walk(key,steps){
  if(steps.length>12||results.length>1024||stack.has(key))return false;
  if(key===null){results.push(steps);return true;}
  if(!text(key)||!Object.hasOwn(m.nodes,key))return false;
  const node=m.nodes[key];
  if(!Array.isArray(node.options)||!node.options.length||
    new Set(node.options.map(o=>o.id)).size!==node.options.length)return false;
  stack.add(key);
  for(const o of node.options){
   if(!text(o.id)||!text(o.label)||!(o.next===null||text(o.next))||
     !walk(o.next,[...steps,{id:o.id,label:o.label,reveal:o.reveal||[],node:key}]))return false;
  }
  stack.delete(key);seen.add(key);return true;
 }
 if(!walk(m.start,[]))return null;
 if(Object.keys(m.nodes).some(k=>!seen.has(k)))return null;
 return results;
}
function inferredRoles(steps){
 if(steps.length===3&&steps[1].reveal?.length&&steps[0].reveal?.length===0&&steps[2].reveal?.length===0)
   return [...AGENCY_ROLES];
 return steps.map(()=>"USER_DECISION");
}
export function sourceBoundBranchParity(record,context){
 const c=record?.scenario?.constraints,graph=graphPathsFromContext(context);
 if(c?.kind!=="authored_branch"||!graph?.length)return {ok:false,reason:"No complete, acyclic source-authored graph is available."};
 if(!Array.isArray(c.routes)||c.routes.length!==graph.length)
   return {ok:false,reason:"Record routes must exactly enumerate the trusted source's complete terminal graph."};
 const canonical=new Map(graph.map(steps=>[JSON.stringify(steps.map(s=>s.id)),{
   path:steps.map(s=>s.id),
   authoredDevelopments:steps.flatMap((s,i)=>inferredRoles(steps)[i]==="AUTHORED_DEVELOPMENT"?s.reveal:[]),
   agencyRoles:inferredRoles(steps)
 }]));
 const visited=new Set();
 for(const r of c.routes){
  if(!Array.isArray(r?.path)||r.unchosenOutcomeKnown!==false)return {ok:false,reason:"A route is malformed or claims to know an unchosen outcome."};
  const key=JSON.stringify(r.path),expected=canonical.get(key);
  if(!expected||visited.has(key))return {ok:false,reason:"An invented, duplicated, unreachable or incomplete canonical path was supplied."};
  if(!same(r.authoredDevelopments,expected.authoredDevelopments)||!same(r.agencyRoles,expected.agencyRoles))
    return {ok:false,reason:"Authored event text or agency ownership differs from the source graph."};
  visited.add(key);
 }
 if(visited.size!==canonical.size)return {ok:false,reason:"A terminal branch is missing."};
 const first=context.model.nodes[context.model.start].options;
 if(!same(record.scenario.choices.map(x=>x.id),first.map(x=>x.id))||
    !same(record.scenario.choices.map(x=>x.label),first.map(x=>x.label)))
   return {ok:false,reason:"The user action options do not match the trusted source's first decision."};
 return {ok:true,reason:"All terminal routes, source-authored events and agency roles match the frozen graph."};
}
function finiteParity(record,context){
 const c=record?.scenario?.constraints,m=context?.model,choices=record?.scenario?.choices;
 if(c?.kind!=="finite_budget"||context?.mechanism!=="tradeoff"||!Array.isArray(m?.resources)||m.resources.length!==1||
    !["exact","cap"].includes(m.resources[0].type)||
    (c.capacityMode||"exact")!==m.resources[0].type||
    !(Number.isSafeInteger(c.capacity)&&c.capacity>=m.resources[0].min&&c.capacity<=m.resources[0].max)||
    !Array.isArray(m.choices)||!Array.isArray(choices)||m.choices.length!==choices.length||
    !same(m.choices.map(x=>x.id),choices.map(x=>x.id))||
    !same(m.choices.map(x=>x.label),choices.map(x=>x.label))||
    !same(m.choices.map(x=>x.cost?.[0]),c.costs)||
    (m.unitHours??null)!==c.unitHours||
    !(c.repetitions===null||(Number.isSafeInteger(c.repetitions)&&c.repetitions>=2)))
  return {ok:false,reason:"Finite budget, costs, labels or unit conversion do not match the trusted meaning model."};
 return {ok:true,reason:"Exact discrete shared budget and effects match the source-authorized model."};
}
export function assessAllSixPeerGames(record,gameIds){
 const c=record?.scenario?.constraints;
 const context=authoritativeContextForRecord(record);
 const finite=context?finiteParity(record,context):{ok:false,reason:"A source-authorized finite budget context is unavailable."};
 const branch=context?sourceBoundBranchParity(record,context):{ok:false,reason:"Source-authorized dependent decisions are unavailable."};
 const graph=branch.ok?graphPathsFromContext(context):null;
 const rolesOk=!!graph?.length&&graph.every(steps=>same(inferredRoles(steps),AGENCY_ROLES))&&
   graph.every(steps=>steps.length===3);
 const criteria={
  trade_off:finite.ok,
  decision_map:branch.ok,
  token_studio:finite.ok&&c?.unitHours>0&&c?.costs?.every(x=>x===1)&&c?.capacity>=2,
  balance_of_values:false,
  swipe_decision:branch.ok&&rolesOk,
  future_reveal:false
 };
 const explanations={
  trade_off:finite.ok?"Warranted finite-resource competition is present.":finite.reason,
  decision_map:branch.ok?"The entire dependency graph exactly matches the source-authorized model.":branch.reason,
  token_studio:criteria.token_studio?"Discrete equal-cost whole slots conserve the source-backed budget.":"No validated equal-cost source-backed token allocation.",
  balance_of_values:"No separately source-authorized commensurable value scale and proportional judgment are present; do not infer moral scores.",
  swipe_decision:criteria.swipe_decision?"The exact three-stage source-authored graph distinguishes decision, external development and response.":"Missing exact three-stage source graph with explicitly separated external developments.",
  future_reveal:"No independently approved branch-linked dated hypothetical milestones; do not invent a timeline."
 };
 return gameIds.map(id=>({id,eligible:!!criteria[id],reason:explanations[id],evidenceVersion:CAPABILITY_VERSION}));
}
