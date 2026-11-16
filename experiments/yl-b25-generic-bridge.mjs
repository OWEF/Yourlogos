/**
 * CZ-128 B2.5 — generic source-bound, v2-compatible Value Balance composer.
 *
 * NO author names, fixed capacity, wage, number of days, wording of the
 * historical source, or preselected interpretation is hardcoded in the
 * operation. Source claims + interpretations live in fingerprinted authored
 * scenario records. A new author without a compatible source claim ABSTAINS.
 *
 * Frozen Reasoning/Emotion/Expression and B2.4 proof remain untouched.
 */
import {inspectB25Contract} from "./yl-b25-authored-scenarios.mjs";
export const B25_BRIDGE_VERSION="evidence-bound-encounter-v2-compatible/2.5.0";
export const B25_EMOTION_VERSION="evidence-bound-emotion/2.5.0";
export const B25_EXPRESSION_VERSION="evidence-bound-expression/2.5.0";
const LABELS=["Your Choice","Back to the Philosopher","One Last Thing…"];
const POLICY={total:[80,120],sections:[[10,48],[18,65],[9,26]]};
const words=x=>x.trim().split(/\s+/).filter(Boolean).length;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const abstain=(reason)=>({status:"needs_editorial_review",version:B25_BRIDGE_VERSION,
 reason,publicationAllowed:false,productionPlayable:false});
const safeNum=x=>Number.isSafeInteger(x)&&x>=0;
function evidence(packet,rawContract,choice,focus){
 const contract=inspectB25Contract(rawContract),m=packet?.meaning,
  s=packet?.sourceAdmission;
 if(!contract||!packet||packet.status!=="ready"||
    packet.version!=="meaning/1.2"||!packet.claims?.includes(m)||
    m?.classification!=="conditional"||
    m.kind!==contract.meaningKind||
    !["conversion","repetition"].includes(m.kind)||
    !packet.semantic?.admission?.allowedClaimKinds?.includes(m.kind)||
    !s||s.reviewStatus!=="curated_provisional"||
    s.independentlySourceVerified!==false||
    s.centralClaim!==contract.context.semantic.admission.centralClaim||
    s.scenarioBridge!==contract.context.semantic.admission.scenarioBridge||
    s.sourceUrl!==contract.source.referenceUrl||
    !["curated_passage_match","unverified"].includes(s.claimTraceStatus)||
    packet.source?.url!==contract.source.referenceUrl||
    packet.source?.work!==contract.source.work||
    packet.author!==contract.source.author||
    packet.quote!==contract.source.quote||
    !same(packet.limitations,[contract.context.semantic.boundary])||
    contract.editorialAuthority!=="FOUNDER_POLICY_RESEARCH_ONLY"||
    contract.independentlyScholarlyApproved!==false||
    contract.publicationAllowed!==false||
    contract.source.reviewState!=="founder_provisional")
  return null;
 const lens=contract.editorial.lenses.find(x=>x.id===focus);
 if(!lens||!lens.interpretation||!lens.question||!lens.label)return null;
 const resources=contract.context.model.resources,choices=contract.context.model.choices;
 const cap=contract.scenario.capacity;
 if(resources.length!==1||resources[0].type!=="exact"||
    resources[0].min!==cap||resources[0].max!==cap||
    choices.length!==2||choices.some(x=>x.cost.length!==1||x.cost[0]!==1)||
    !same(choices.map(x=>x.id),contract.scenario.choiceIds)||
    !same(contract.scenario.costs,[1,1])||
    !Array.isArray(choice?.amounts)||choice.amounts.length!==2||
    !same(choice.budgets,[cap])||
    !choice.amounts.every(safeNum)||
    choice.amounts[0]+choice.amounts[1]!==cap||
    !same(packet.structure.amounts,choice.amounts)||
    !same(packet.structure.budgets,choice.budgets)||
    !same(packet.selectedChoices.map(c=>c.id),choices.map(c=>c.id))||
    !same(packet.selectedChoices.map(c=>c.amount),choice.amounts))
  return null;
 if(m.kind==="conversion"){
  if(contract.scenario.repetitions!==null||
     contract.context.model.metric?.op!=="sum"||
     !same(contract.context.model.metric.weights,[1,0])||
     !safeNum(m.evidence?.measure)||
     m.evidence.measure!==choice.amounts[0]||
     m.evidence.unit!==contract.context.model.metric.unit)
   return null;
 }else if(m.kind==="repetition"){
  const r=contract.scenario.repetitions,e=m.evidence;
  if(!safeNum(r)||r<2||choice.repetitions!==r||
     e?.repetitions!==r||e.perIntervalCapacity!==cap||
     e.perIntervalAllocated!==cap||e.totalCapacity!==cap*r||
     e.totalAllocated!==cap*r||e.totalUnallocated!==0||
     e.unitLabel!==contract.context.model.unitLabel||
     !same(e.cumulative.map(c=>c.units),
       choice.amounts.map(x=>x*r))||
     !same(e.cumulative.map(c=>c.label),
       choices.map(c=>c.readingLabel||c.label)))
   return null;
 }
 return {contract,packet,choice,focus,lens,
  amountA:choice.amounts[0],amountB:choice.amounts[1],
  capacity:cap,meaning:m,assumptions:packet.assumptions};
}
export function chooseEmotionB25(packet,contract,canonical,focus){
 const e=evidence(packet,contract,canonical,focus);
 if(!e)return abstain("Ineligible source, unsupported meaning operation or invalid choice");
 return {status:"ready",version:B25_EMOTION_VERSION,
  strategy:"contemplative",sourceMeaningKind:e.meaning.kind,
  rhetorical_angle:{lens:focus,mode:"reader_selected_source_perspective"},
  inferredReaderEmotion:false,groundedEvidenceIds:[
   "source:admission","meaning:"+e.meaning.kind,"scenario:conservation","limit:0"
  ],publicationAllowed:false};
}
function compose(packet,contract,canonical,focus){
 const e=evidence(packet,contract,canonical,focus);
 if(!e)return abstain("No admissible, replayable source-to-choice relationship");
 const emotion=chooseEmotionB25(packet,contract,canonical,focus);
 if(emotion.status!=="ready")return emotion;
 const {editorial,scenario}=e.contract;
 const [one,two]=editorial.useLabels;
 const first="In this "+editorial.situation+", you allocated "+e.amountA+
  " of "+e.capacity+" "+scenario.unitName+" to "+one+" and "+e.amountB+
  " to "+two+". Both draw from the same fixed resource. "+
  "This is an invented choice, not a record of your habits.";
 const metric=e.meaning.kind==="conversion"?
  "The modeled count is "+e.meaning.evidence.measure+" "+
   e.meaning.evidence.unit+"; the remainder stays with the other use.":
  "Across "+e.meaning.evidence.repetitions+" imagined "+
   e.meaning.evidence.periodPlural+", that becomes "+
   e.meaning.evidence.cumulative[0].units+" and "+
   e.meaning.evidence.cumulative[1].units+" "+
   scenario.unitName+" respectively.";
 const second=packet.sourceAdmission.centralClaim+" "+
  e.lens.interpretation+" "+metric+" "+editorial.qualification;
 const third=e.lens.question;
 const texts=[first,second,third];
 const counts=texts.map(words),total=counts.reduce((x,y)=>x+y,0);
 if(total<POLICY.total[0]||total>POLICY.total[1]||
    counts.some((x,i)=>x<POLICY.sections[i][0]||x>POLICY.sections[i][1]))
  return abstain("A source qualification cannot be sacrificed for the founder word policy: "+
   JSON.stringify({counts,total,record:e.contract.recordId}));
 const sections=texts.map((text,i)=>({label:LABELS[i],text,
  evidence_ids:i===0?["scenario:conservation","choice:0","choice:1"]:
   i===1?["source:admission","meaning:"+e.meaning.kind,"limit:0"]:
    ["source:admission","limit:0"]}));
 return {status:"ready",version:B25_EXPRESSION_VERSION,brief:emotion,
  sections,wordCount:total,sectionWordCounts:counts,
  sourceReview:"founder_provisional_not_independently_verified",
  sourceWarrant:packet.sourceAdmission.centralClaim,
  sourceUrl:e.contract.source.referenceUrl,
  author:packet.author,quote:packet.quote,
  evidenceTrace:{kind:e.meaning.kind,recordId:e.contract.recordId,
   fingerprint:e.contract.contentFingerprint,
   measure:e.meaning.evidence.measure??null,
   cumulative:e.meaning.evidence.cumulative??null,
   lens:focus},
  sourceEvidenceVerifiedForProvisionalRecord:true,
  independentlyScholarlyVerified:false,
  publicationAllowed:false,productionPlayable:false};
}
export function verifyEncounterB25(packet,contract,canonical,focus,output){
 const reproduced=compose(packet,contract,canonical,focus);
 if(reproduced.status!=="ready")return reproduced;
 return same(reproduced,output)?{
  status:"ready",wordCount:reproduced.wordCount,
  sectionWordCounts:reproduced.sectionWordCounts
 }:abstain("Submitted output differs from independently recomposed source-bound result");
}
export function renderEncounterB25(packet,contract,canonical,{focus}={}){
 const out=compose(packet,contract,canonical,focus);
 if(out.status!=="ready")return out;
 const validation=verifyEncounterB25(packet,contract,canonical,focus,out);
 return validation.status==="ready"?out:validation;
}
