/**
 * CZ-130 Milestone III research-only, source-generalized expression admission.
 *
 * This module NEVER edits frozen v2.0 Reasoning, Emotion or Expression.
 * The frozen v2.0 composition is used whenever it accepts the authenticated
 * packet. Otherwise a versioned, narrow structural operator (not a source or
 * author allowlist) may compose a source-bound research explanation.
 *
 * Not a public publication service or a guarantee of scholarly source approval.
 */
import {reasonSemantically} from "../encounter/semantic-reasoning-v12.js";
import {renderEncounterV20} from "../encounter/encounter-v20.js";
import {V20_WORD_POLICY} from "../encounter/emotion-strategy-v20.js";
import {authoritativeContextForRecord} from "./content-capabilities-v211.js";
import {validateContentRecordV21,validateChoiceV21,canRunIsolatedResearchV21}
 from "./content-contract-v21.js";
export const COMPOSITION_VERSION="source-grounded-composition/2.1.1";
const LABELS=["Your Choice","Back to the Philosopher","One Last Thing…"];
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
const text=x=>typeof x==="string"&&x.trim().length>0;
const abstain=reason=>({status:"needs_editorial_review",version:COMPOSITION_VERSION,reason});
const supported=new Set(["conversion","specialization_effect"]);
function allocationText(packet){
 if(!Array.isArray(packet.selectedChoices)||!packet.selectedChoices.length||
    !packet.selectedChoices.every(c=>Number.isSafeInteger(c.amount)&&c.amount>=0&&text(c.label)))
   return null;
 return packet.selectedChoices.map(c=>
  c.amount+" "+(c.amount===1&&text(c.singular)?c.singular:c.label)).join(", ");
}
function evidenceSafe(packet,context){
 const m=packet?.meaning,e=m?.evidence,a=packet?.sourceAdmission;
 return packet?.version==="meaning/1.2"&&packet.status==="ready"&&
   Array.isArray(packet.claims)&&packet.claims.includes(m)&&
   m.classification!=="unsupported"&&supported.has(m.kind)&&
   context?.semantic?.admission?.allowedClaimKinds?.includes(m.kind)&&
   a?.reviewStatus==="curated_provisional"&&a.independentlySourceVerified===false&&
   ["curated_passage_match","unverified"].includes(a.claimTraceStatus)&&
   packet.source?.url===context.source.url&&packet.source?.work===context.source.work&&
   packet.quote===context.quote&&packet.author===context.author&&
   a.sourceUrl===context.source.url&&a.sourceWork===context.source.work&&
   a.centralClaim===context.semantic.admission.centralClaim&&
   a.scenarioBridge===context.semantic.admission.scenarioBridge&&
   Array.isArray(packet.limitations)&&packet.limitations.length===1&&
   packet.limitations[0]===context.semantic.boundary&&
   text(a.centralClaim)&&text(a.scenarioBridge)&&!!e;
}
function safeStructure(kind,e){
 if(kind==="conversion")return Number.isFinite(e.measure)&&text(e.unit);
 if(kind==="specialization_effect")return Number.isFinite(e.baseline)&&
   Number.isFinite(e.specialized)&&Number.isFinite(e.delta)&&
   e.delta===e.specialized-e.baseline&&text(e.unit)&&
   Array.isArray(e.assignments)&&e.assignments.length>0&&
   !!e.generalistCalculation&&text(e.explanation);
 return false;
}
function compose(packet){
 const m=packet.meaning,a=packet.sourceAdmission,e=m.evidence;
 const allocation=allocationText(packet);
 if(!allocation||!safeStructure(m.kind,e))return abstain("The quantitative evidence is structurally incomplete or unsupported.");
 const unit=n=>n===1&&text(e.singular)?e.singular:e.unit;
 let first;
 if(m.kind==="conversion"){
  first="In this invented allocation, you selected "+allocation+
   ". Under the supplied costs, the model converts that choice into "+
   e.measure+" "+e.unit+
   ". These numbers describe a thought experiment, not your observed working life.";
 }else{
  first="You assigned "+allocation+
   ". Under the invented task rates, the rotating team finishes "+e.baseline+
   " "+unit(e.baseline)+" while the dedicated-stage allocation finishes "+
   e.specialized+" "+unit(e.specialized)+
   ". Neither outcome is an independently measured historical result.";
 }
 const sourceBase=a.centralClaim+" "+a.scenarioBridge;
 // Source claim remains editorially fixed, but its *educational bridge*
 // must describe the actual measured consequence, not a canned claim about
 // productivity or an unsourced evaluation of the reader's character.
 const longConsequence=m.kind==="conversion"?
  "For these possessions, "+e.measure+" "+unit(e.measure)+
   " are the modeled working life exchanged. That cost alone does not establish their worth.":
  e.delta===0?
   "This comparison shows no improvement: both arrangements finish the same number of booklets.":
  e.delta>0?
   "Under these invented rates, the dedicated arrangement finishes "+e.delta+
   " more "+(e.delta===1?"booklet":"booklets")+", a conditional modeled gain, not historical evidence.":
   "Under these invented rates, the dedicated arrangement finishes "+Math.abs(e.delta)+
   " fewer booklets, so specialization does not improve this comparison.";
 const conciseConsequence=m.kind==="conversion"?
  "Here "+e.measure+" "+unit(e.measure)+
   " measure working life exchanged for those possessions, not their moral worth.":
  e.delta===0?
   "There is no modeled improvement: the two assignments yield equal output.":
  e.delta>0?
   "This invented comparison shows a "+e.delta+"-booklet modeled gain, not a universal result.":
   "This invented comparison yields "+Math.abs(e.delta)+" fewer booklets with the specialized assignment.";
 const teachingOptions=[
  sourceBase+" "+longConsequence,
  sourceBase+" "+conciseConsequence
 ];
 const finalOptions=[
  packet.limitations[0]+" The comparison changes the question, not the answer.",
  packet.limitations[0]+" This remains a hypothetical comparison.",
  packet.limitations[0]
 ];
 // Select a complete, semantically bounded formulation. Never truncate a
 // source claim, qualification or meaningful small quantity to satisfy limits.
 for(const second of teachingOptions)for(const third of finalOptions){
  const sections=[
   {label:LABELS[0],text:first,evidence_ids:["meaning:central","choice:0"]},
   {label:LABELS[1],text:second,evidence_ids:["source:central","source:bridge","meaning:central"]},
   {label:LABELS[2],text:third,evidence_ids:["limit:0","meaning:central"]}
  ];
  const words=sections.map(s=>count(s.text)),total=words.reduce((x,y)=>x+y,0);
  if(total<V20_WORD_POLICY.total.min||total>V20_WORD_POLICY.total.max||
     !words.every((n,i)=>n>=V20_WORD_POLICY.sections[i].min&&
       n<=V20_WORD_POLICY.sections[i].max))continue;
  const brief={
   version:"emotion-strategy/2.1.1",status:"ready",strategy:"contemplative",
   source_warrant_id:"source:central",
   grounded_evidence_ids:["meaning:central","limit:0"],
   rhetorical_angle:{id:"conditional-meaning-contrast",operator:m.kind,
      scope:"fictional_example_only"},
   prohibited_claims:[...packet.limitations],
   selection_trace:{operator:m.kind,sourceBound:true,quotedSource:packet.source.url,
     reason:"Eligible meaning/1.2 operator with structural evidence; no personal emotion inferred."}
  };
  return {status:"ready",version:COMPOSITION_VERSION,
   author:packet.author,quote:packet.quote,source_url:packet.source.url,
   source_work:packet.source.work,source_review:"curated_provisional",
   source_warrant:a.centralClaim,scenario_bridge:a.scenarioBridge,
   brief,sections,wordCount:total,sectionWordCounts:words,
   source_status:"research_only_primary_source_unverified",
   evidence:[
    {id:"source:central",origin:"meaning.sourceAdmission.centralClaim",text:a.centralClaim},
    {id:"source:bridge",origin:"meaning.sourceAdmission.scenarioBridge",text:a.scenarioBridge},
    {id:"meaning:central",origin:"meaning.meaning",kind:m.kind,evidence:JSON.parse(JSON.stringify(e))},
    {id:"choice:0",origin:"meaning.selectedChoices",choices:JSON.parse(JSON.stringify(packet.selectedChoices))},
    {id:"limit:0",origin:"meaning.limitations[0]",text:packet.limitations[0]}
   ]};
 }
 return abstain("No faithful, fully qualified 80–120-word explanation meets every frozen section bound.");
}
/**
 * On every invocation, recompute actual meaning from the trusted source model.
 * A mutable caller-supplied READY packet or a forged author cannot substitute.
 */
export function renderSourceGroundedResearchV211(record,choice,environment){
 if(!canRunIsolatedResearchV21(record,environment))
   return abstain("The source record is not eligible for isolated provisional research.");
 if(validateContentRecordV21(record).status!=="valid_research_record")
   return abstain("The source/content capability validation did not pass.");
 const admitted=validateChoiceV21(record,choice);
 if(admitted.status!=="ready")return abstain(admitted.reason||"Unsupported user choice.");
 const context=authoritativeContextForRecord(record);
 if(!context)return abstain("No trusted source-bound meaning model exists.");
 const packet=reasonSemantically(context,admitted.canonical);
 if(!evidenceSafeSource(packet,context))return abstain("The regenerated source-warranted meaning packet is not trustworthy.");
 const frozen=renderEncounterV20(packet);
 const allowed=record.emotionalEligibility;
 const strategyAuthorized=brief=>allowed?.enabled===true&&
   Array.isArray(allowed.allowedStrategies)&&
   allowed.allowedStrategies.includes(brief?.strategy);
 if(frozen.status==="ready"){
  if(!strategyAuthorized(frozen.brief))
   return abstain("Frozen v2.0 chose a strategy disallowed by the source-approved research record.");
  return {...frozen,research_adapter:COMPOSITION_VERSION,
   preserved_frozen_v20:true,source_status:"research_only_primary_source_unverified"};
 }
 if(!evidenceSafe(packet,context))
  return abstain("Frozen v2.0 abstained and no fully warranted new semantic operator is eligible.");
 const result=compose(packet);
 if(result.status==="ready"&&!strategyAuthorized(result.brief))
  return abstain("No evidence-grounded research strategy is authorized by this source record.");
 return {...result,preserved_frozen_v20:false};
}
function evidenceSafeSource(packet,context){
 return packet?.status==="ready"&&packet.version==="meaning/1.2"&&
   packet.source?.url===context?.source?.url&&
   packet.source?.work===context?.source?.work&&
   packet.quote===context?.quote&&packet.author===context.author&&
   packet.sourceAdmission?.centralClaim===context.semantic.admission.centralClaim&&
   packet.sourceAdmission?.scenarioBridge===context.semantic.admission.scenarioBridge&&
   packet.sourceAdmission?.reviewStatus==="curated_provisional"&&
   Array.isArray(packet.claims)&&packet.claims.includes(packet.meaning);
}
export function validateSourceGroundedResearchV211(record,choice,environment,output){
 const expected=renderSourceGroundedResearchV211(record,choice,environment);
 if(expected.status!=="ready")return expected;
 if(!output||JSON.stringify(output)!==JSON.stringify(expected))
  return abstain("Source identity, chosen evidence, emotional brief or exact wording differs from the independently re-computed research result.");
 return {status:"ready",version:COMPOSITION_VERSION,wordCount:expected.wordCount,
  sectionWordCounts:expected.sectionWordCounts};
}
