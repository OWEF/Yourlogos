/**
 * CZ-142 / B2.6 — new SOURCE-AUTHORED RELATION reasoning operator.
 *
 * Not an allocation/branch adapter. Exact typed pairs are matched against
 * edition-provisional source-owned relation evidence; no mystery scoring.
 * Positive READY uses its OWN evidence-bound Emotion/Expression adapter.
 *
 * Founder source editorial waiver is DEVELOPMENT ONLY. Never publish.
 */
import {createHash} from "node:crypto";
import {semanticSources} from "../philosophy-engine/encounter/semantic-cases-v12.js";
export const PAIR_VERSION="source-authored-concept-relations/2.6.0";
export const RELATION_MEANING_VERSION="meaning:source-warranted-relations/2.6.0";
export const RELATION_EMOTION_VERSION="emotion:source-warranted-relations/2.6.0";
export const RELATION_EXPRESSION_VERSION="expression:source-warranted-relations/2.6.0";
const safe=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 safe(x)?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const hash=x=>"sha256:"+createHash("sha256").update(stable(x)).digest("hex");
const fail=(code,reason)=>({status:"blocked",code,reason,version:PAIR_VERSION,
 publicationAllowed:false,productionPlayable:false});
const noFit=reason=>({status:"no_fit",reason,version:PAIR_VERSION,
 publicationAllowed:false});
const spec=(recordId,source,{scenario,cards,edges,limits,question,insightHint})=>{
 const data={
  recordId,version:PAIR_VERSION,familyId:"tap_pair",
  operation:"source_warranted_relation",
  source:{author:source.author,work:source.source.work,quote:source.quote,
   referenceUrl:source.source.url,reviewState:"founder_provisional"},
  warrant:{centralClaim:source.semantic.admission.centralClaim,
   sourceRelation:source.semantic.relation,
   authoredScenarioBridge:scenario,limitations:limits,
   evidenceIds:["source:central","scenario:fictional","source:boundary"],
   reviewState:"founder_provisional"},
  scenario:{title:insightHint,description:scenario,question},
  cards,edges,
  publicationAllowed:false,independentlyScholarlyApproved:false,
  editorialAuthority:"FOUNDER_POLICY_RESEARCH_ONLY"
 };
 if(cards.length<3||cards.length>6||edges.length<2||edges.some(e=>
  !cards.some(c=>c.id===e.aId)||!cards.some(c=>c.id===e.bId)||
  e.aId===e.bId||!e.claim||e.warrantIds.length<2))throw Error("Invalid source-authored relation record");
 return Object.freeze({...data,sourceFingerprint:hash(data)});
};
const epictetus=spec("b26:epictetus-own-action-external-response",semanticSources.epictetus,{
 scenario:"A fictional apology involves choices one person makes and responses that belong to another. These cards do not describe the actual reader.",
 insightHint:"Where does my action end?",
 question:"What changes in a decision when you can choose the action but cannot determine another person's response?",
 limits:"The fictional example cannot establish forgiveness, a person's inner state, or anyone's moral character.",
 cards:[
  {id:"apology",label:"Offering an apology",role:"self_action",glyph:"hand",detail:"A possible action you choose"},
  {id:"forgiveness",label:"Their forgiveness",role:"external_outcome",glyph:"heart",detail:"Another person's decision"},
  {id:"words",label:"Choosing your words",role:"self_judgment",glyph:"speech",detail:"Your own choice of expression"},
  {id:"reaction",label:"Their reaction",role:"external_outcome",glyph:"spark",detail:"An outcome not controlled by you"}
 ],
 edges:[
  {aId:"apology",bId:"forgiveness",relationId:"agency_boundary",label:"The boundary",claim:"Offering an apology cannot determine whether the other person forgives.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"apology",bId:"reaction",relationId:"agency_boundary",label:"Action and outcome",claim:"Choosing to apologise does not give control over the reaction.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"words",bId:"forgiveness",relationId:"agency_boundary",label:"Choice and result",claim:"Your choice of words cannot guarantee another person's forgiveness.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"words",bId:"reaction",relationId:"agency_boundary",label:"Control and uncertainty",claim:"Choosing words is yours; the listener's response remains theirs.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"words",bId:"apology",relationId:"self_agency",label:"Choices you make",claim:"The decision to apologise and the words chosen both belong to your action.",warrantIds:["source:central","scenario:fictional"]}
 ]
});
const smith=spec("b26:smith-specialized-work-coordination",semanticSources.smith,{
 scenario:"Four invented volunteers divide the fictional work of printing and binding booklets. These rates are not historical pin-factory data.",
 insightHint:"How do separate tasks make a whole?",
 question:"How does a finished object depend on different contributions, without proving a universal best division of labour?",
 limits:"The printing example is invented; neither a historical productivity gain nor a universally best division is demonstrated.",
 cards:[
  {id:"division",label:"Dividing the tasks",role:"coordination",glyph:"grid",detail:"How work is arranged"},
  {id:"pages",label:"Printed pages",role:"input",glyph:"pages",detail:"One imagined production stage"},
  {id:"binding",label:"Binding",role:"input",glyph:"link",detail:"A second necessary stage"},
  {id:"booklet",label:"Finished booklet",role:"output",glyph:"book",detail:"The imagined joint result"}
 ],
 edges:[
  {aId:"pages",bId:"binding",relationId:"complementarity",label:"Complementary stages",claim:"Printed pages alone are not a finished booklet without binding.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"pages",bId:"booklet",relationId:"dependence",label:"One contribution",claim:"The imagined finished booklet depends on pages being printed.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"binding",bId:"booklet",relationId:"dependence",label:"Another contribution",claim:"Binding contributes to the completed product alongside printing.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"division",bId:"pages",relationId:"coordination",label:"Organized roles",claim:"Assigning a printing task is part of this imagined division of work.",warrantIds:["source:central","scenario:fictional"]},
  {aId:"division",bId:"binding",relationId:"coordination",label:"Organized roles",claim:"Assigning binding is a different contribution in the imagined process.",warrantIds:["source:central","scenario:fictional"]}
 ]
});
export const PAIR_SOURCE_RECORDS=Object.freeze([epictetus,smith]);
const registry=new Map(PAIR_SOURCE_RECORDS.map(x=>[x.recordId,x]));
export function inspectPairSource(input){
 const found=registry.get(typeof input==="string"?input:input?.recordId);
 if(!found)return null;
 if(typeof input==="string")return found;
 if(stable(found)!==stable(input))return null;
 const {sourceFingerprint,...fields}=found;
 return hash(fields)===sourceFingerprint?found:null;
}
const normalized=(a,b)=>[a,b].sort().join("|");
export function validateCanonicalPairsB26(input,contract){
 if(!safe(input)||Object.keys(input).sort().join(",")!=="pairs"||
  !Array.isArray(input.pairs)||input.pairs.length<1||input.pairs.length>2)
  return fail("invalid_pair_input","Submit one or two typed source-owned connections");
 const seen=new Set(),evidence=[];
 for(const p of input.pairs){
  if(!safe(p)||Object.keys(p).sort().join(",")!=="aId,bId,relationId"||
   typeof p.aId!=="string"||typeof p.bId!=="string"||
   typeof p.relationId!=="string"||p.aId===p.bId)
   return fail("invalid_edge","Each link must identify two different source concepts and one relation");
  const pairId=normalized(p.aId,p.bId);
  if(seen.has(pairId))return fail("duplicate_edge","The same connection cannot count twice");
  seen.add(pairId);
  const edge=contract.edges.find(e=>
   normalized(e.aId,e.bId)===pairId&&e.relationId===p.relationId);
  if(!edge)return fail("unsupported_relation","This pair has no authored relationship warrant");
  if(!edge.warrantIds.every(id=>contract.warrant.evidenceIds.includes(id)))
   return fail("missing_warrant","This relation lacks declared source/scenario provenance");
  evidence.push({aId:edge.aId,bId:edge.bId,relationId:edge.relationId,
   claim:edge.claim,label:edge.label,warrantIds:[...edge.warrantIds],
   left:contract.cards.find(x=>x.id===edge.aId).label,
   right:contract.cards.find(x=>x.id===edge.bId).label});
 }
 return {status:"valid",canonical:{pairs:evidence.map(x=>({
  aId:x.aId,bId:x.bId,relationId:x.relationId}))},evidence};
}
export function reasonAboutPairsB26(ref,input){
 const c=inspectPairSource(ref);
 if(!c)return noFit("No exact source-authored relationship scenario is registered");
 if(c.operation!=="source_warranted_relation"||
    c.source.reviewState!=="founder_provisional"||
    c.warrant.reviewState!=="founder_provisional"||
    c.publicationAllowed!==false)
   return fail("source_refused","Record lacks compatible provisional source admission");
 const v=validateCanonicalPairsB26(input,c);
 if(v.status!=="valid")return v;
 return {status:"ready",version:RELATION_MEANING_VERSION,
  meaning:{kind:"source_warranted_relation",classification:"conditional",
   centralClaim:c.warrant.centralClaim,
   selectedRelations:v.evidence,sourceRelation:c.warrant.sourceRelation,
   limitations:c.warrant.limitations},
  source:{...c.source},sourceFingerprint:c.sourceFingerprint,
  canonical:v.canonical,
  evidenceIds:["source:central","scenario:fictional","source:boundary"],
  assumptions:[c.warrant.authoredScenarioBridge],
  uncertainty:"The relation is an authored interpretive illustration, not a historical observation.",
  publicationAllowed:false};
}
const wc=s=>s.trim().split(/\s+/).filter(Boolean).length;
const LABELS=["Your Choice","Back to the Philosopher","One Last Thing…"];
const policy=[[10,48],[18,65],[9,26]];
const revision=(reason)=>({status:"needs_editorial_review",
 version:RELATION_EXPRESSION_VERSION,reason,publicationAllowed:false});
function compose(ref,input){
 const record=inspectPairSource(ref),m=reasonAboutPairsB26(ref,input);
 if(!record||m.status!=="ready")return m;
 const links=m.meaning.selectedRelations;
 const first="You connected "+links.map(x=>x.left+" and "+x.right).join("; ")+
  ". You chose "+links.length+" relationship"+(links.length>1?"s":"")+
  " in a fictional situation, not answers to a secret matching puzzle. You can revise any connection freely.";
 const source=m.meaning.centralClaim+" "+
  links.map(x=>x.claim).join(" ")+
  " "+m.meaning.limitations;
 const question=record.scenario.question;
 const texts=[first,source,question],counts=texts.map(wc);
 const total=counts.reduce((a,b)=>a+b,0);
 if(total<80||total>120||counts.some((v,i)=>v<policy[i][0]||v>policy[i][1]))
  return revision("Cannot meet source-bound 80–120/section word limits without losing qualifications: "+JSON.stringify({counts,total}));
 const emotion={
  status:"ready",version:RELATION_EMOTION_VERSION,
  strategy:"curious_reflection",selectedBy:"source_warranted_relation",
  inferredActualEmotion:false,inferredMoralRank:false,
  sourceEvidenceIds:m.evidenceIds,publicationAllowed:false
 };
 return {status:"ready",version:RELATION_EXPRESSION_VERSION,
  sourceReview:"founder_provisional_not_scholarly_verified",
  sections:texts.map((text,i)=>({
   label:LABELS[i],text,
   evidenceIds:i===0?["choice:pairs","scenario:fictional"]:
    i===1?["source:central","scenario:fictional","source:boundary"]:
    ["source:central","source:boundary"]
  })),
  brief:emotion,wordCount:total,sectionWordCounts:counts,
  author:record.source.author,quote:record.source.quote,
  sourceUrl:record.source.referenceUrl,
  sourceFingerprint:record.sourceFingerprint,
  selectedPairEvidence:links.map(x=>x.warrantIds),
  publicationAllowed:false,productionPlayable:false};
}
export function validatePairExpressionB26(ref,input,result){
 const expected=compose(ref,input);
 if(expected.status!=="ready")return expected;
 if(stable(result)!==stable(expected))
  return revision("Expression differs from source-replayed, word-bound result");
 return {status:"ready",wordCount:expected.wordCount};
}
export function runPairEncounterB26(ref,input){
 const c=inspectPairSource(ref),meaning=reasonAboutPairsB26(ref,input);
 if(!c||meaning.status!=="ready")return meaning;
 const expression=compose(ref,input);
 if(expression.status!=="ready")return expression;
 if(validatePairExpressionB26(ref,input,expression).status!=="ready")
  return revision("Expression source replay failed");
 return {status:"ready",version:PAIR_VERSION,
  selectedFamilyId:"tap_pair",
  canonical_choice:meaning.canonical,meaning,
  emotion:expression.brief,expression,
  sourceReview:"founder_provisional_not_scholarly_verified",
  publicationAllowed:false,productionPlayable:false,
  accountPersistenceAllowed:false,actualReaderEmotionInferred:false,
  realHumanReaderGatePassed:false,physicalSafariVoiceOverGatePassed:false};
}
