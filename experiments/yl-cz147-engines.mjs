/**
 * CZ-147: source-neutral Reasoning → bounded Emotion → full/compact Expression.
 * No author, quotation ID or scenario key is named in the shared engine.
 * The caller supplies an immutable, versioned, editorially reviewed-internal
 * source contract. There is no open-ended LLM inference or personal profiling.
 */
import {fingerprintB25} from "./yl-b25-authored-scenarios.mjs";
export const CZ147_ENGINE_VERSION="universal-three-engine/1.0.0";
const FAMILIES=["balance_move","decision_cards","tap_pair","flip_reveal"];
const LABELS=["Your Choice","Back to the Philosopher","One Last Thing…"];
const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const count=s=>typeof s==="string"?s.trim().split(/\s+/).filter(Boolean).length:0;
const txt=(s,n=3)=>typeof s==="string"&&count(s)>=n&&s.length<=650;
const key=(a,b)=>[a,b].sort().join("|");
const deny=(code,reason,status="blocked")=>({status,code,reason,publicationAllowed:false,productionPlayable:false});
const exact=(x,allowed,required=allowed)=>obj(x)&&
 Object.keys(x).every(k=>allowed.includes(k))&&required.every(k=>Object.hasOwn(x,k));
const clean=s=>s.trim().replace(/[.!?]+$/,"");
const sentence=s=>/[.!?]$/.test(s.trim())?s.trim():s.trim()+".";
const quoteAction=label=>{
 const v=clean(label);
 return /^you\s+/i.test(v)?"to "+v.replace(/^you\s+/i,""):
  "the option “"+v+"”";
};
const size=(x,lo,hi)=>Array.isArray(x)&&x.length>=lo&&x.length<=hi;
function validateRecord(r){
 if(!obj(r)||!Number.isSafeInteger(r.quoteId)||r.quoteId<0||
  !txt(r.recordId,1)||!txt(r.version,1)||r.status!=="development_provisional"||
  !FAMILIES.includes(r.familyId)||!txt(r.title,2)||!txt(r.intro,10)||
  !txt(r.humanTension,5)||!txt(r.sourceThesis,6)||
  !txt(r.epistemicLimits,6)||!txt(r.compactLimit,4)||
  !txt(r.readerAgency,5)||!txt(r.reflectionQuestion,9)||
  !txt(r.counterexample,6)||!txt(r.evidenceClaim,6)||
  !size(r.evidenceIds,2,12)||!r.evidenceIds.includes("source:central")||
  !size(r.prohibitedInferences,1,10)||!size(r.supportedConclusions,1,8)||
  !obj(r.source)||!txt(r.source.text,4)||!txt(r.source.author,1)||
  !txt(r.source.work,1)||typeof r.source.referenceUrl!=="string"||
  !size(r.affordances,0,5)||r.publicationAllowed!==false)return false;
 if(r.familyId==="balance_move"){
  const a=r.allocation;
  return obj(a)&&Number.isSafeInteger(a.resourceCapacity)&&
   a.resourceCapacity>=2&&a.resourceCapacity<=48&&a.resourceType==="exact"&&
   txt(a.unitName,1)&&size(a.choices,2,3)&&
   a.choices.every(c=>obj(c)&&txt(c.id,1)&&txt(c.label,1))&&
   new Set(a.choices.map(c=>c.id)).size===a.choices.length&&
   size(a.initial,a.choices.length,a.choices.length)&&
   a.initial.every(x=>Number.isSafeInteger(x)&&x>=0)&&
   a.initial.reduce((x,y)=>x+y,0)===a.resourceCapacity&&
   (a.repetitions===null||Number.isSafeInteger(a.repetitions)&&a.repetitions>0)&&
   Array.isArray(a.lenses);
 }
 if(r.familyId==="tap_pair"){
  const rel=r.relation;
  return obj(rel)&&size(rel.cards,3,6)&&size(rel.edges,2,14)&&
   rel.cards.every(c=>obj(c)&&txt(c.id,1)&&txt(c.label,1)&&txt(c.detail,2))&&
   new Set(rel.cards.map(x=>x.id)).size===rel.cards.length&&
   rel.edges.every(e=>obj(e)&&txt(e.aId,1)&&txt(e.bId,1)&&
    txt(e.relationId,1)&&txt(e.label,1)&&txt(e.claim,6)&&
    size(e.warrantIds,2,8)&&e.warrantIds.every(id=>r.evidenceIds.includes(id))&&
    e.aId!==e.bId&&rel.cards.some(c=>c.id===e.aId)&&rel.cards.some(c=>c.id===e.bId))&&
   new Set(rel.edges.map(e=>key(e.aId,e.bId))).size===rel.edges.length&&
   rel.minimumPairs===1&&rel.maximumPairs===2&&rel.noCorrectMatch===true;
 }
 const timeline=r.timeline;
 return size(timeline,4,24)&&timeline.every(t=>obj(t)&&
  ["startId","sceneId","responseId"].every(k=>txt(t[k],1))&&
  ["startLabel","sceneLabel","responseLabel"].every(k=>txt(t[k],2))&&
  size(t.authoredText,1,3)&&t.authoredText.every(x=>txt(x,5))&&
  ["reconsider","hold","observe"].includes(t.responseStance)&&
  typeof t.authoredFutureIsPrediction==="boolean"&&
  t.authoredFutureIsPrediction===false)&&
  new Set(timeline.map(t=>[t.startId,t.sceneId,t.responseId].join("|"))).size===timeline.length;
}
export function sealUniversalSource(source){
 if(!validateRecord(source))return deny("source_contract_invalid","The source contract lacks an authorized philosophical, human or family warrant");
 const immutable=structuredClone(source);
 return Object.freeze({...immutable,
  sourceFingerprint:fingerprintB25(immutable)});
}
export function makeUniversalRegistry(records,quotes){
 if(!Array.isArray(records)||!Array.isArray(quotes))throw Error("A server-side source registry and immutable quote ledger are required");
 const byId=new Map(),byRecord=new Set();
 for(const original of records){
  const r=sealUniversalSource(original);
  if(r.status==="blocked")throw Error(r.reason+" for "+original?.quoteId);
  const q=quotes[r.quoteId];
  if(!q||q[0]!==r.source.text||q[1]!==r.source.author||
    q[3]!==r.source.work||byId.has(r.quoteId)||byRecord.has(r.recordId))
   throw Error("Quote mismatch or duplicate source identity for "+r.quoteId);
  byId.set(r.quoteId,r);byRecord.add(r.recordId);
 }
 function resolve(input){
  if(!obj(input)||!Number.isSafeInteger(input.quoteId))return deny("source_identity_invalid","Exact quote identity required");
  const r=byId.get(input.quoteId),q=quotes[input.quoteId];
  if(!r)return null; // No admission; the caller must keep reading-first.
  if(!q||q[0]!==input.quoteText||q[1]!==input.quoteAuthor||
    q[3]!==input.quoteWork||input.b27DevelopmentOnly!==false)
   return deny("source_identity_mismatch","The clicked immutable quotation/edition was altered");
  const quoteFingerprint=fingerprintB25({quoteId:r.quoteId,quote:q});
  return {status:"ready",version:CZ147_ENGINE_VERSION,
   quoteId:r.quoteId,quoteFingerprint,
   quote:{text:q[0],author:q[1],work:q[3],question:q[4]},
   sourceRecordId:r.recordId,sourceVersionHash:r.sourceFingerprint,
   selectedFamilyId:r.familyId,
   record:{key:r.recordId,title:r.title,intro:r.intro,
    familyId:r.familyId,quote:r.source.text,author:r.source.author,
    work:r.source.work,sourceUrl:r.source.referenceUrl,
    allocation:r.allocation??null,timeline:r.timeline??null,
    relation:r.relation??null,sourceFingerprint:r.sourceFingerprint,
    sourceThesis:r.sourceThesis,humanTension:r.humanTension,
    epistemicLimits:r.epistemicLimits,sourceWarrantIds:r.evidenceIds,
    readerAgency:r.readerAgency,sourceReview:r.status,
    publicationAllowed:false},
   publicationAllowed:false,productionPlayable:false,
   sourceReview:"founder_provisional_development_only"};
 }
 function run(input){
  const admitted=resolve(input);
  if(!admitted)return null;
  if(admitted.status!=="ready")return admitted;
  if(input.sourceVersionHash!==admitted.sourceVersionHash)
   return deny("stale_source","The source contract changed; restart Discover");
  const r=byId.get(input.quoteId);
  const packet=reasonUniversal(r,input.canonicalInput);
  if(packet.status!=="ready")return packet;
  const emotion=emotionUniversal(packet,r);
  const output=expressUniversal(packet,emotion,r);
  if(output.status!=="ready")return output;
  const {fullExpression,compact}=output;
  return {status:"ready",version:CZ147_ENGINE_VERSION,
   saveKey:fingerprintB25({quoteFingerprint:admitted.quoteFingerprint,
    sourceVersionHash:r.sourceFingerprint,selectedFamilyId:r.familyId,
    canonicalChoice:packet.canonical_choice}),
   quoteId:r.quoteId,quoteFingerprint:admitted.quoteFingerprint,
   sourceRecordId:r.recordId,sourceVersionHash:r.sourceFingerprint,
   selectedFamilyId:r.familyId,canonical_choice:packet.canonical_choice,
   fullExpression,fullMeaning:packet,emotion,compact,
   uncertainty:r.epistemicLimits,
   provenance:{sourceWarrantIds:r.evidenceIds,sourceFingerprint:r.sourceFingerprint,
    hypotheticalScenario:true,authoredEventCausedByReader:false,
    unchosenFutureKnown:false,realFeelingInferred:false,
    prohibitedInferences:r.prohibitedInferences},
   sourceReview:"founder_provisional_development_only",
   publicationAllowed:false,productionPlayable:false,accountSaved:false};
 }
 return Object.freeze({resolve,run,size:byId.size,ids:[...byId.keys()]});
}
export function reasonUniversal(source,input){
 if(!source||!obj(input))return deny("choice_invalid","Missing source or typed choice");
 if(source.sourceFingerprint!==fingerprintB25(Object.fromEntries(
    Object.entries(source).filter(([k])=>k!=="sourceFingerprint"))))
  return deny("source_tamper","Source content did not replay against its fingerprint");
 let canonical,feature,claim,route=null;
 if(source.familyId==="balance_move"){
  const a=source.allocation;
  const keys=Object.keys(input).sort().join("|");
  const expected=a.repetitions===null?"amounts|budgets|touched":"amounts|budgets|repetitions|touched";
  if(keys!==expected||input.touched!==true||!size(input.amounts,a.choices.length,a.choices.length)||
    !input.amounts.every(n=>Number.isSafeInteger(n)&&n>=0)||
    !size(input.budgets,1,1)||input.budgets[0]!==a.resourceCapacity||
    input.amounts.reduce((x,y)=>x+y,0)!==a.resourceCapacity||
    (a.repetitions!==null&&input.repetitions!==a.repetitions))
    return deny("allocation_invalid","Only one exact conserved source-authorized allocation is valid");
  canonical={amounts:[...input.amounts],budgets:[a.resourceCapacity],
   ...(a.repetitions===null?{}:{repetitions:a.repetitions})};
  const positive=input.amounts.filter(n=>n>0).length;
  feature=positive===1?"concentration":"competing_uses";
  claim=source.evidenceClaim;
 }else if(source.familyId==="tap_pair"){
  if(!exact(input,["pairs"])||!size(input.pairs,1,2))
   return deny("pairs_invalid","Choose one or two source-authored concept relations");
  const picked=[],seen=new Set();
  for(const p of input.pairs){
   if(!exact(p,["aId","bId","relationId"])||
    !["aId","bId","relationId"].every(k=>typeof p[k]==="string"))
    return deny("pair_invalid","A typed relation is required");
   const edge=source.relation.edges.find(e=>
    key(e.aId,e.bId)===key(p.aId,p.bId)&&e.relationId===p.relationId);
   if(!edge||seen.has(key(edge.aId,edge.bId)))
    return deny("relation_unsupported","This link lacks a specific source warrant");
   seen.add(key(edge.aId,edge.bId));picked.push(edge);
  }
  picked.sort((a,b)=>key(a.aId,a.bId).localeCompare(key(b.aId,b.bId)));
  canonical={pairs:picked.map(e=>({aId:e.aId,bId:e.bId,relationId:e.relationId}))};
  feature=picked.some(e=>e.relationId==="agency_boundary"||
   e.relationId==="contrast")?"boundary":"relation";
  claim=picked.map(e=>e.claim).join(" ");
  route=picked;
 }else{
  if(source.familyId==="decision_cards"){
   if(!exact(input,["path"])||!size(input.path,3,3)||input.path.some(x=>typeof x!=="string"))
    return deny("path_invalid","An exact three-choice path is required");
   route=source.timeline.find(t=>[t.startId,t.sceneId,t.responseId].every((x,i)=>x===input.path[i]));
   if(!route)return deny("unsupported_path","No authored event/response has this path");
   canonical={path:[route.startId,route.sceneId,route.responseId]};
  }else{
   const actions=input.actions;
   if(!exact(input,["actions"])||!size(actions,4,4)||
    actions[0]?.type!=="choose_start"||actions[1]?.type!=="explore_authored"||
    actions[2]?.type!=="choose_response"||actions[3]?.type!=="read_retrospective"||
    !exact(actions[0],["type","optionId"])||
    !exact(actions[1],["type","sceneId"])||
    !exact(actions[2],["type","optionId"])||
    !exact(actions[3],["type"]))
    return deny("actions_invalid","A source-authored four-stage reveal is required");
   route=source.timeline.find(t=>t.startId===actions[0].optionId&&
    t.sceneId===actions[1].sceneId&&t.responseId===actions[2].optionId);
   if(!route||route.authoredFutureIsPrediction!==false)
    return deny("future_invention","A predicted or unapproved future cannot be played");
   canonical={path:[route.startId,route.sceneId,route.responseId]};
  }
  feature=route.responseStance==="reconsider"?"revision":route.responseStance==="observe"?"uncertainty":"commitment";
  claim=source.evidenceClaim;
 }
 return {status:"ready",version:"reason:"+CZ147_ENGINE_VERSION,
  sourceRecordId:source.recordId,sourceVersionHash:source.sourceFingerprint,
  selectedFamilyId:source.familyId,canonical_choice:canonical,
  meaning:{kind:source.familyId,centralClaim:source.sourceThesis,
   selectedClaim:claim,selectedTimeline:source.familyId==="tap_pair"?null:route,
   selectedRelations:source.familyId==="tap_pair"?route:null,
   limitations:source.epistemicLimits,counterexample:source.counterexample,
   prohibitedInferences:source.prohibitedInferences,
   supportedConclusions:source.supportedConclusions},
  choiceFeature:feature,evidenceIds:source.evidenceIds,
  hypothetical:true,realReaderEmotionInferred:false,publicationAllowed:false};
}
export function emotionUniversal(packet,source){
 if(packet?.status!=="ready"||!source)return deny("meaning_required","A verified source meaning packet is required");
 const available=source.affordances;
 const ordered=packet.choiceFeature==="boundary"?["boundary_awareness","curious_reflection"]:
  packet.choiceFeature==="revision"?["revisability","uncertainty_awareness"]:
  packet.choiceFeature==="competing_uses"?["tradeoff_attention","curious_reflection"]:
  packet.choiceFeature==="concentration"?["choice_awareness","tradeoff_attention"]:
  packet.choiceFeature==="uncertainty"?["uncertainty_awareness","curious_reflection"]:
  ["choice_awareness","curious_reflection"];
 const strategy=ordered.find(a=>available.includes(a))??"neutral_reflection";
 return {status:"ready",version:"emotion:"+CZ147_ENGINE_VERSION,
  strategy,chosenFrom:packet.choiceFeature,
  rhetoricSupported:strategy!=="neutral_reflection",
  inferredActualEmotion:false,inferredMoralRank:false,
  inferredPersonality:false,evidenceIds:packet.evidenceIds,
  noMindReading:true,publicationAllowed:false};
}
function describeChoice(packet,source){
 const choice=packet.canonical_choice;
 if(source.familyId==="balance_move"){
  const a=source.allocation;
  const items=choice.amounts.map((n,i)=>n+" to "+a.choices[i].label);
  return "You divided "+a.resourceCapacity+" "+a.unitName+": "+items.join("; ")+".";
 }
 if(source.familyId==="tap_pair"){
  const cards=new Map(source.relation.cards.map(c=>[c.id,c.label]));
  return "You connected "+choice.pairs.map(p=>cards.get(p.aId)+
   " with "+cards.get(p.bId)).join("; ")+".";
 }
 const t=packet.meaning.selectedTimeline;
 return "You chose "+quoteAction(t.startLabel)+", saw the imagined scene “"+
  clean(t.sceneLabel)+"”, then chose "+quoteAction(t.responseLabel)+".";
}
function typedWordPolicy(sections,lo,hi,min,max){
 const n=sections.map(x=>count(x.text)),total=n.reduce((x,y)=>x+y,0);
 return total>=lo&&total<=hi&&n.every((x,i)=>x>=min[i]&&x<=max[i])?
  {n,total}:null;
}
export function expressUniversal(packet,emotion,source){
 if(packet?.status!=="ready"||emotion?.status!=="ready"||
  packet.sourceVersionHash!==source?.sourceFingerprint||
  packet.evidenceIds.some(x=>!source.evidenceIds.includes(x)))
  return deny("source_replay_invalid","The composed meaning lacks exact source evidence");
 const choice=describeChoice(packet,source);
 const question=sentence(source.reflectionQuestion);
 const author=source.source.author;
 // The same three source-linked facts, not an authored full-response template,
 // power compact and complete views. No hidden inspirational assertion.
 const thesis=author+"'s argument: "+sentence(source.sourceThesis);
 const selected=sentence(packet.meaning.selectedClaim);
 const qualifier=sentence(source.compactLimit);
 const shortBase=thesis+" "+qualifier;
 const shortWithEvidence=thesis+" "+selected+" "+qualifier;
 const compactVariants=[shortWithEvidence,shortBase];
 let compact=null;
 for(const middle of compactVariants){
  let sections=[
   {label:LABELS[0],text:choice},
   {label:LABELS[1],text:middle},
   {label:LABELS[2],text:question}
  ];
  const total=sections.reduce((s,x)=>s+count(x.text),0);
  if(total>=40&&total<=65){compact=sections;break;}
 }
 if(!compact)return deny("compact_overflow","A faithful 40–65-word three-section rendering cannot be composed","needs_editorial_review");
 const fullFirstBase=choice+" This is a hypothetical exercise, not a report of choices you have actually made.";
 const fullFirst=count(fullFirstBase)<=48?fullFirstBase:choice+" The setting is invented.";
 const fullArgument=thesis+" "+selected+" "+sentence(source.epistemicLimits)+
  " "+sentence(source.counterexample);
 const fullSecond=count(fullArgument)<=65?fullArgument:thesis+" "+selected+
  " "+sentence(source.epistemicLimits);
 let full=[
  {label:LABELS[0],text:fullFirst},
  {label:LABELS[1],text:fullSecond},
  {label:LABELS[2],text:question}
 ];
 let policy=typedWordPolicy(full,80,120,[10,18,9],[48,65,26]);
 if(!policy){
  // Add only an explicit countercondition of epistemic restraint;
  // never shorten the source claim or silently drop its limitation.
  const extra="One imagined route cannot establish what would happen elsewhere, or decide what a real person ought to do.";
  if(count(fullSecond)+count(extra)<=65)
   full[1].text=fullSecond+" "+extra;
  policy=typedWordPolicy(full,80,120,[10,18,9],[48,65,26]);
 }
 if(!policy)return deny("full_policy_overflow","The authenticated full 80–120-word interpretation cannot meet all section limits","needs_editorial_review");
 const compactCounts=typedWordPolicy(compact,40,65,[1,1,1],[48,65,26]);
 if(!compactCounts)return deny("compact_policy_invalid","Concise expression breached section policy","needs_editorial_review");
 const phrase=source.source.text.trim().split(/\s+/).slice(0,5).join(" ");
 return {status:"ready",
  fullExpression:{status:"ready",version:"expression:"+CZ147_ENGINE_VERSION,
   sections:full.map((s,i)=>({...s,evidenceIds:i===0?["choice:canonical","scenario:fictional"]:source.evidenceIds})),
   wordCount:policy.total,sectionWordCounts:policy.n,
   sourceFingerprint:source.sourceFingerprint,author,quote:source.source.text,
   sourceUrl:source.source.referenceUrl,publicationAllowed:false},
  compact:{status:"ready",version:"compact:"+CZ147_ENGINE_VERSION,
   sections:compact,visibleWordCount:compactCounts.total,
   fullWordCount:policy.total,unchangedFullExpression:true,
   sourceRecordId:source.recordId,sourceVersionHash:source.sourceFingerprint,
   sourceReview:"founder_provisional_development_only",
   philosopher:{author,work:source.source.work,
    highlight:phrase,exactQuote:source.source.text,
    sourceUrl:source.source.referenceUrl},
   deepening:{fullSections:full,sourceQualification:full[1].text,
    originalSourceUrl:source.source.referenceUrl,
    necessaryLimits:source.epistemicLimits},publicationAllowed:false}};
}
