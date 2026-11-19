/**
 * CZ-147: source-neutral Reasoning → bounded Emotion → full/compact Expression.
 * No author, quotation ID or scenario key is named in the shared engine.
 * The caller supplies an immutable, versioned, editorially reviewed-internal
 * source contract. There is no open-ended LLM inference or personal profiling.
 */
import {fingerprintB25} from "./yl-b25-authored-scenarios.mjs";
import {derivePath} from "./yl-cz155-director.mjs";
import {validateCZ152Bridge} from "./yl-cz152-bridge.mjs";
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
// A philosophical operation is separately authenticated source DATA.
// Multiple philosophers may share an operation, and the same game family
// can realize incompatible operations. Missing/unsupported kinds fail closed.
const OPERATION_FAMILIES=Object.freeze({
 habitual_pattern:"balance_move",deliberate_use:"balance_move",
 attention_evasion:"balance_move",
 coordinated_work:"tap_pair",self_governance:"tap_pair",
 source_relation:"tap_pair",
 retrospective_limits:["decision_cards","flip_reveal"],
 independent_judgment:"decision_cards",incremental_beginning:"decision_cards",
 practical_commitment:"decision_cards",agency_vs_external_reply:"decision_cards",
 event_acceptance:"flip_reveal",anticipated_vs_actual:"flip_reveal",
 non_retaliation:"flip_reveal"
});
function validateOperation(r){
 const op=r.philosophicalOperation;
 if(!obj(op)||!Object.keys(op).every(k=>["kind","focus","contrast",
  "sourceWarrantIds","activityRoles","startRoles"].includes(k))||
  !Object.hasOwn(OPERATION_FAMILIES,op.kind)||
  ![].concat(OPERATION_FAMILIES[op.kind]).includes(r.familyId)||
  !txt(op.focus,3)||!txt(op.contrast,4)||
  !size(op.sourceWarrantIds,1,8)||
  !op.sourceWarrantIds.every(id=>r.evidenceIds.includes(id)))return false;
 if(op.activityRoles!==undefined){
  if(r.familyId!=="balance_move"||!Array.isArray(op.activityRoles)||
   op.activityRoles.length!==r.allocation?.choices?.length||
   op.activityRoles.some(x=>!obj(x)||!txt(x.id,1)||
    !["deliberate_practice","possible_distraction","restorative_pause",
      "quiet_attention","social_contact","necessary_task"].includes(x.role))||
   op.activityRoles.some(x=>!r.allocation.choices.some(c=>c.id===x.id))||
   new Set(op.activityRoles.map(x=>x.id)).size!==op.activityRoles.length)
   return false;
 }
 if(op.startRoles!==undefined){
  const starts=[...new Set(r.timeline?.map(x=>x.startId)??[])];
  if(!["decision_cards","flip_reveal"].includes(r.familyId)||
   !Array.isArray(op.startRoles)||op.startRoles.length!==starts.length||
   op.startRoles.some(x=>!obj(x)||!txt(x.id,1)||
    !["retain_prior","reexamine_prior","begin_modestly","prepare_carefully",
      "deliberate_action","uncertain_commitment","retaliate","deescalate"].includes(x.role)||
    !starts.includes(x.id))||
   new Set(op.startRoles.map(x=>x.id)).size!==op.startRoles.length)return false;
 }
 return true;
}
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
  !validateOperation(r)||r.exposeInApp===true&&!validateCZ152Bridge(r)||
  typeof r.developmentOnly!=="boolean"||
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
 if(r.director || r.decisionWarrant || r.philosophicalOperation.kind==="agency_vs_external_reply"){
  const scenario=r.director,rule=r.decisionWarrant;
  if(r.familyId!=="decision_cards"||!scenario||!rule||
     !["agency_vs_external_reply","independent_judgment"].includes(r.philosophicalOperation.kind)||
     scenario.source?.quoteId!==r.quoteId||scenario.source.text!==r.source.text||
     scenario.source.work!==r.source.work||scenario.source.author!==r.source.author||
     scenario.source.referenceUrl!==r.source.referenceUrl||scenario.operation!==r.philosophicalOperation.kind||
     scenario.sourceFingerprint!==fingerprintB25(scenario.source)||
     scenario.scenarioFingerprint!==fingerprintB25(Object.fromEntries(
       Object.entries(scenario).filter(([key])=>key!=="scenarioFingerprint")))||
     !Object.hasOwn(scenario.source.warrants??{},rule.warrantId)||
     !txt(rule.fact,1)||!txt(rule.warrantId,1)||!r.evidenceIds.includes(rule.warrantId))return false;
  try{
   const start=derivePath(scenario,[]);
   if(!Object.hasOwn(start.facts,rule.fact)||
      (rule.oppositeFact!==undefined&&(!Object.hasOwn(start.facts,rule.oppositeFact)||rule.fact===rule.oppositeFact)))return false;
  }catch{return false;}
  const validJudgment=x=>{
   if(!obj(x)||!txt(x.inference,5)||!txt(x.question,9)||
      !r.affordances.includes(x.strategy))return false;
   const qualificationFields=["qualification","counterexample","compactLimit"];
   const hasAny=qualificationFields.some(key=>Object.hasOwn(x,key));
   // An optional path-specific package must be complete: no mixing a
   // selected counterexample with an unrelated global source fallback.
   return !hasAny||(
    txt(x.qualification,6)&&txt(x.counterexample,6)&&txt(x.compactLimit,4)&&
    qualificationFields.every(key=>x[key].length<=650));
  };
  if(![rule.established,rule.outstanding].every(validJudgment))return false;
  const refinements=rule.refinements??[];
  if(!Array.isArray(refinements)||refinements.length>8)return false;
  const matches=(refinement,facts)=>refinement.factsAll?
   refinement.factsAll.every(key=>facts[key]===true):
   refinement.factsAny.some(key=>facts[key]===true);
  if(!refinements.every(x=>{
    const all=Array.isArray(x?.factsAll),any=Array.isArray(x?.factsAny);
    const selected=all?x.factsAll:x?.factsAny;
    return validJudgment(x)&&all!==any&&size(selected,1,6)&&
      new Set(selected).size===selected.length&&
      selected.every(key=>scenario.selfFacts.includes(key))&&
      txt(x.warrantId,1)&&Object.hasOwn(scenario.source.warrants,x.warrantId)&&
      r.evidenceIds.includes(x.warrantId);
  }))return false;
  // Contradictory or overlapping rules would make source authoring order
  // silently choose the answer; check every reachable fictional decision.
  for(const first of scenario.openingChoices)
   for(const second of scenario.followUps[first.id]){
    const state=derivePath(scenario,[first.id,second.id]);
    if(refinements.filter(x=>matches(x,state.facts)).length>1)return false;
  }
  return true;
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
    q[3]!==input.quoteWork||input.b27DevelopmentOnly!==r.developmentOnly)
   return deny("source_identity_mismatch","The clicked immutable quotation/edition was altered");
  const quoteFingerprint=fingerprintB25({quoteId:r.quoteId,quote:q});
  return {status:"ready",version:CZ147_ENGINE_VERSION,
   quoteId:r.quoteId,quoteFingerprint,
   quote:{text:q[0],author:q[1],work:q[3],question:q[4]},
   sourceRecordId:r.recordId,sourceVersionHash:r.sourceFingerprint,
   selectedFamilyId:r.familyId,
   record:{key:r.recordId,title:r.title,intro:r.intro,
    ...(r.director?{director:structuredClone(r.director)}:{}),
    familyId:r.familyId,quote:r.source.text,author:r.source.author,
    narrativeBridge:r.narrativeBridge??null,
    work:r.source.work,sourceUrl:r.source.referenceUrl,
    allocation:r.allocation??null,timeline:r.timeline??null,
    relation:r.relation??null,sourceFingerprint:r.sourceFingerprint,
    sourceThesis:r.sourceThesis,humanTension:r.humanTension,
    epistemicLimits:r.epistemicLimits,sourceWarrantIds:r.evidenceIds,
    readerAgency:r.readerAgency,sourceReview:r.status,
    philosophicalOperation:r.philosophicalOperation,
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
    ...(r.director?{directorTranscript:{
     firstMessage:packet.meaning.choiceAnalysis.initial.literal,
     event:packet.meaning.choiceAnalysis.development.text,
     secondAction:packet.meaning.choiceAnalysis.response.literal}}:{}),
    hypotheticalScenario:true,authoredEventCausedByReader:false,
    unchosenFutureKnown:false,realFeelingInferred:false,
    prohibitedInferences:r.prohibitedInferences},
   sourceReview:"founder_provisional_development_only",
   publicationAllowed:false,productionPlayable:false,accountSaved:false};
 }
 return Object.freeze({resolve,run,size:byId.size,ids:[...byId.keys()]});
}
/**
 * Operation-specific, source-neutral meaning. The source owns its thesis,
 * scenario, edge warrants and fictional scenes; the engine interprets the
 * actual canonical choice without inferring anyone's inner life.
 */
export function reasonUniversal(source,input){
 if(!source||!obj(input))return deny("choice_invalid","Missing source or typed choice");
 if(source.sourceFingerprint!==fingerprintB25(Object.fromEntries(
    Object.entries(source).filter(([k])=>k!=="sourceFingerprint"))))
  return deny("source_tamper","Source content did not replay against its fingerprint");
 let canonical,feature,claim,route=null,analysis;
 if(source.familyId==="balance_move"){
  const a=source.allocation;
  const keys=Object.keys(input).sort().join("|");
  const expected=a.repetitions===null?
   ["amounts|budgets|touched","amounts|budgets|repetitions|touched"]:
   ["amounts|budgets|repetitions|touched"];
  if(!expected.includes(keys)||
    (a.repetitions===null&&Object.hasOwn(input,"repetitions")&&input.repetitions!==null)||
    input.touched!==true||!size(input.amounts,a.choices.length,a.choices.length)||
    !input.amounts.every(n=>Number.isSafeInteger(n)&&n>=0)||
    !size(input.budgets,1,1)||input.budgets[0]!==a.resourceCapacity||
    input.amounts.reduce((x,y)=>x+y,0)!==a.resourceCapacity||
    (a.repetitions!==null&&input.repetitions!==a.repetitions))
    return deny("allocation_invalid","Only one conserved source-authorized allocation is valid");
  canonical={amounts:[...input.amounts],budgets:[a.resourceCapacity],
   ...(a.repetitions===null?{}:{repetitions:a.repetitions})};
  const shares=a.choices.map((choice,i)=>({id:choice.id,label:choice.label,
   amount:input.amounts[i],index:i}));
  const high=Math.max(...input.amounts),low=Math.min(...input.amounts);
  const primary=shares.filter(x=>x.amount===high);
  const constrained=shares.filter(x=>x.amount===low);
  const excluded=shares.filter(x=>x.amount===0);
  const repetitions=a.repetitions;
  analysis={operation:"finite_resource",capacity:a.resourceCapacity,unit:a.unitName,
   shares,primary,constrained,excluded,repetitions,
   equalPriority:primary.length===shares.length,
   allAssigned:true,choiceIsMoralVerdict:false,
   sourceWarrantIds:["source:central","scenario:fictional"]};
  feature=primary.length===shares.length?"shared_use":
   shares.filter(x=>x.amount>0).length===1?"concentration":"competing_uses";
  if(primary.length===shares.length){
   claim="Time is shared equally among "+primary.map(x=>x.label).join(", ")+
    "; giving any one use more would leave less for another.";
  }else if(primary.length>1){
   claim=primary.map(x=>x.label).join(" and ")+" share the largest allocation; "+
    constrained.map(x=>x.label).join(" and ")+" have less room in the same finite budget.";
  }else{
   claim="Giving the most time to "+primary[0].label+
    " limits the remaining time for "+constrained.map(x=>x.label).join(" and ")+
    "; this does not make either use morally superior.";
  }
 }else if(source.familyId==="tap_pair"){
  if(!exact(input,["pairs"])||!size(input.pairs,1,2))
   return deny("pairs_invalid","Choose one or two source-authored concept relations");
  const picked=[],seen=new Set();
  for(const p of input.pairs){
   if(!exact(p,["aId","bId","relationId"])||
    !["aId","bId","relationId"].every(k=>typeof p[k]==="string"))
    return deny("pair_invalid","An exact typed relation is required");
   const edge=source.relation.edges.find(e=>
    key(e.aId,e.bId)===key(p.aId,p.bId)&&e.relationId===p.relationId);
   if(!edge||seen.has(key(edge.aId,edge.bId)))
    return deny("relation_unsupported","This relation lacks a specific source warrant");
   seen.add(key(edge.aId,edge.bId));picked.push(edge);
  }
  picked.sort((a,b)=>key(a.aId,a.bId).localeCompare(key(b.aId,b.bId)));
  canonical={pairs:picked.map(e=>({aId:e.aId,bId:e.bId,relationId:e.relationId}))};
  const cards=new Map(source.relation.cards.map(c=>[c.id,c.label]));
  analysis={operation:"source_relation",
   links:picked.map(e=>({aId:e.aId,bId:e.bId,
    a:cards.get(e.aId),b:cards.get(e.bId),
    type:e.relationId,label:e.label,claim:e.claim,warrantIds:e.warrantIds})),
   relationTypes:picked.map(e=>e.relationId),
   hasBoundary:picked.some(e=>["agency_boundary","contrast"].includes(e.relationId)),
   sourceWarrantIds:picked.flatMap(e=>e.warrantIds),
   noCorrectAnswer:true,noMoralScore:true};
  feature=analysis.hasBoundary?"boundary":"relation";
  claim=picked.map(e=>e.claim).join(" ");
  route=picked;
 }else if(source.director){
  if(!exact(input,["path"])||!size(input.path,3,3)||input.path.some(x=>typeof x!=="string"))
   return deny("path_invalid","Two actions and their observed event are required");
  const [first,event,second]=input.path;
  if(event!==source.director.externalEvent.id)
   return deny("unexpected_event","The selected actions cannot assign the external event");
  let state;
  try{state=derivePath(source.director,[first,second]);}
  catch{return deny("unsupported_path","The actions do not form a permitted sequence");}
  const rule=source.decisionWarrant,value=state.facts[rule.fact];
  if(state.phase!=="complete"||typeof value!=="boolean"||
     (rule.oppositeFact!==undefined&&state.facts[rule.oppositeFact]!==!value))
   return deny("warrant_evidence_missing","The required fictional fact is unresolved");
  const matches=(rule.refinements??[]).filter(x=>x.factsAll?
   x.factsAll.every(key=>state.facts[key]===true):
   x.factsAny.some(key=>state.facts[key]===true));
  if(matches.length>1)return deny("warrant_ambiguous","Multiple contradictory source-authorized distinctions apply");
  const refinement=matches[0]??null;
  const judgment=refinement??(value?rule.established:rule.outstanding);
  canonical=state.canonicalInput;
  feature=value?"established_fact":"outstanding_fact";
  claim=judgment.inference;
  analysis={operation:"directed_decision",initial:state.firstAction,response:state.secondAction,
   development:state.observation,history:state.history,establishedFacts:state.facts,
   testedFact:rule.fact,judgment,
   refinementBasis:refinement?(refinement.factsAll??refinement.factsAny):null,
   sourceWarrantIds:[...new Set([rule.warrantId,refinement?.warrantId].filter(Boolean))],
   outcomeGuaranteed:false,alternativeFutureObserved:false};
 }else{
  if(source.familyId==="decision_cards"){
   if(!exact(input,["path"])||!size(input.path,3,3)||input.path.some(x=>typeof x!=="string"))
    return deny("path_invalid","An exact three-stage choice path is required");
   route=source.timeline.find(t=>[t.startId,t.sceneId,t.responseId].every((x,i)=>x===input.path[i]));
   if(!route)return deny("unsupported_path","No authored development and response support that path");
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
    return deny("future_invention","An unauthenticated prediction cannot be played");
   canonical={path:[route.startId,route.sceneId,route.responseId]};
  }
  analysis={operation:source.familyId==="decision_cards"?"sequential_commitment":"authored_retrospective",
   initial:{id:route.startId,label:route.startLabel},
   development:{id:route.sceneId,label:route.sceneLabel,
    authoredText:[...route.authoredText],fictional:true,causedByInitialChoice:false},
   response:{id:route.responseId,label:route.responseLabel,stance:route.responseStance},
   alternativeFutureObserved:false,
   outcomeGuaranteed:false,
   sourceWarrantIds:["source:central","scenario:fictional"]};
  feature=route.responseStance==="reconsider"?"revision":
   route.responseStance==="observe"?"uncertainty":"commitment";
  const operation=source.philosophicalOperation.kind;
  if(operation==="event_acceptance")
   claim="You chose “"+clean(route.startLabel)+"” and later “"+
    clean(route.responseLabel)+"”. The fictional “"+clean(route.sceneLabel)+
    "” was an independently authored external event, not an outcome you commanded. Your response remains a distinct choice.";
  else if(operation==="independent_judgment")
   claim="The opening commitment “"+clean(route.startLabel)+
    "” meets the invented “"+clean(route.sceneLabel)+
    "”. Your later response “"+clean(route.responseLabel)+
    "” can be evaluated by present reasons, not loyalty to earlier words.";
  else if(operation==="incremental_beginning")
   claim="You first chose “"+clean(route.startLabel)+"” before the independently "+
    "invented “"+clean(route.sceneLabel)+"”. The later response “"+
    clean(route.responseLabel)+"” cannot guarantee an entire undertaking.";
  else if(source.familyId==="decision_cards")
   claim="The opening choice “"+clean(route.startLabel)+"” precedes the imagined "+
    clean(route.sceneLabel)+"; responding by “"+clean(route.responseLabel)+
    "” revisits or maintains a commitment without proving it correct.";
  else
   claim="Revealing "+clean(route.sceneLabel)+" after “"+clean(route.startLabel)+
    "” exposes one fictional possibility; “"+clean(route.responseLabel)+
    "” cannot reveal the unchosen future.";
 }
 return {status:"ready",version:"reason:"+CZ147_ENGINE_VERSION,
  sourceRecordId:source.recordId,sourceVersionHash:source.sourceFingerprint,
  selectedFamilyId:source.familyId,canonical_choice:canonical,
  meaning:{kind:source.familyId,centralClaim:source.sourceThesis,
   philosophicalOperation:structuredClone(source.philosophicalOperation),
   sourceClaim:source.evidenceClaim,selectedClaim:claim,choiceAnalysis:analysis,
   selectedTimeline:source.familyId==="tap_pair"?null:route,
   selectedRelations:source.familyId==="tap_pair"?route:null,
   limitations:source.epistemicLimits,counterexample:source.counterexample,
   prohibitedInferences:source.prohibitedInferences,
   supportedConclusions:source.supportedConclusions},
  choiceFeature:feature,evidenceIds:source.evidenceIds,
  hypothetical:true,realReaderEmotionInferred:false,publicationAllowed:false};
}
/**
 * Emotion is a rhetorical POLICY, not a reader-state detector.
 * Every selected move is a way to present the validated meaning packet.
 */
export function emotionUniversal(packet,source){
 if(packet?.status!=="ready"||!source||
    packet.sourceVersionHash!==source.sourceFingerprint)
  return deny("meaning_required","A verified source meaning packet is required");
 const allowed=source.affordances;
 const kind=packet.meaning.philosophicalOperation?.kind;
 // Philosophical operation can override a family-derived rhetorical default.
 // A source still has to explicitly authorize each strategy.
 const directed=packet.meaning.choiceAnalysis.operation==="directed_decision";
 const priority=directed?[packet.meaning.choiceAnalysis.judgment.strategy]:kind==="event_acceptance"?
  ["uncertainty_awareness","boundary_awareness","choice_awareness"]:
  kind==="retrospective_limits"?
   ["uncertainty_awareness","revisability","choice_awareness"]:
  kind==="independent_judgment"?
   ["revisability","choice_awareness","uncertainty_awareness"]:
  kind==="incremental_beginning"?
   ["choice_awareness","revisability","uncertainty_awareness"]:
  kind==="habitual_pattern"?
   ["tradeoff_attention","choice_awareness","curious_reflection"]:
  kind==="attention_evasion"?
   ["curious_reflection","choice_awareness","tradeoff_attention"]:null;
 const preference=packet.choiceFeature==="boundary"?
  ["boundary_awareness","curious_reflection"]:
  packet.choiceFeature==="revision"?
   ["revisability","uncertainty_awareness"]:
  packet.choiceFeature==="uncertainty"?
   ["uncertainty_awareness","curious_reflection"]:
  packet.choiceFeature==="competing_uses"?
   ["tradeoff_attention","curious_reflection"]:
  packet.choiceFeature==="shared_use"?
   ["tradeoff_attention","curious_reflection"]:
  packet.choiceFeature==="concentration"?
   ["choice_awareness","tradeoff_attention"]:
  packet.choiceFeature==="relation"?
   ["curious_reflection","boundary_awareness"]:
  ["choice_awareness","uncertainty_awareness"];
 const strategy=(priority??preference).find(x=>allowed.includes(x))??"neutral_reflection";
 const moves={
  tradeoff_attention:"surface_opportunity_cost",
  choice_awareness:"examine_chosen_priority",
  boundary_awareness:"separate_supported_from_prohibited",
  curious_reflection:"inspect_selected_relation",
  revisability:"introduce_counterconsideration",
  uncertainty_awareness:"mark_unobserved_alternatives",
  neutral_reflection:"state_only_authenticated_meaning"
 };
 return {status:"ready",version:"emotion:"+CZ147_ENGINE_VERSION,
  strategy,move:moves[strategy],chosenFrom:packet.choiceFeature,
  attention:{operation:packet.meaning.choiceAnalysis.operation,
   philosophicalOperation:kind,
   primary:packet.meaning.choiceAnalysis.primary?.map(x=>x.id)??[],
   selectedRelations:packet.meaning.choiceAnalysis.links?.map(x=>x.type)??[],
   initialAction:packet.meaning.choiceAnalysis.initial?.id??null,
   fictionalDevelopment:packet.meaning.choiceAnalysis.development?.id??null,
   responseStance:packet.meaning.choiceAnalysis.response?.stance??null},
  rhetoricSupported:strategy!=="neutral_reflection",
  inferredActualEmotion:false,inferredMoralRank:false,
  inferredPersonality:false,evidenceIds:packet.evidenceIds,
  noMindReading:true,publicationAllowed:false};
}
function describeChoice(packet,source,brief=false){
 const choice=packet.canonical_choice;
 const a=packet.meaning.choiceAnalysis;
 if(a.operation==="directed_decision")return a.initial.recap+" "+a.response.recap;
 if(source.familyId==="balance_move"){
  const a=source.allocation;
  const chosen=choice.amounts.map((n,i)=>({n,label:a.choices[i].label}));
  const used=chosen.filter(x=>x.n>0),zero=chosen.filter(x=>x.n===0);
  const list=used.map(x=>x.n+" for "+x.label);
  if(brief&&used.length===1)
   return "You reserved all "+a.resourceCapacity+" "+a.unitName+" for "+
    used[0].label+"; none for "+zero.map(x=>x.label).join(" or ")+".";
  if(brief)return "You set "+list.join(", ")+
   (zero.length?"; none for "+zero.map(x=>x.label).join(" or "):"")+".";
  if(used.length===1)return "You reserved all "+a.resourceCapacity+" "+a.unitName+
   " for "+used[0].label+"; none for "+zero.map(x=>x.label).join(" or ")+".";
  return "You divided "+a.resourceCapacity+" "+a.unitName+": "+
   (list.length===2?list.join(" and "):
    list.slice(0,-1).join(", ")+", and "+list.at(-1))+
   (zero.length?"; none for "+zero.map(x=>x.label).join(" or "):"")+".";
 }
 if(source.familyId==="tap_pair"){
  const cards=new Map(source.relation.cards.map(c=>[c.id,c.label]));
  return "You connected "+choice.pairs.map(p=>cards.get(p.aId)+
   " with "+cards.get(p.bId)).join("; ")+".";
 }
 const t=packet.meaning.selectedTimeline;
 const initial=quoteAction(t.startLabel),next=quoteAction(t.responseLabel);
 return brief?"You chose "+initial+", saw “"+clean(t.sceneLabel)+
  "”, then chose "+next+".":"You chose "+initial+
  ", encountered the invented scene “"+clean(t.sceneLabel)+
  "”, then chose "+next+".";
}
function minimalChoice(packet,source){
 if(source.director)return describeChoice(packet,source,true);
 if(source.familyId==="decision_cards"||source.familyId==="flip_reveal"){
  const t=packet.meaning.selectedTimeline;
  return "You chose "+quoteAction(t.startLabel)+
   ", then "+quoteAction(t.responseLabel)+".";
 }
 return describeChoice(packet,source,true);
}
function briefResponseChoice(packet,source){
 if(source.director)return describeChoice(packet,source,true);
 if(source.familyId==="decision_cards"||source.familyId==="flip_reveal"){
  const t=packet.meaning.selectedTimeline;
  return "After one imagined development, you chose "+quoteAction(t.responseLabel)+".";
 }
 return minimalChoice(packet,source);
}
const lowerFirst=s=>s.charAt(0).toLowerCase()+s.slice(1);
function humanTensionSentence(raw){
 // A participial opening with a subordinate finite clause is not a
 // standalone sentence ("Choosing ... while later understanding remains...").
 const phrase=lowerFirst(clean(raw));
 if(/^[a-z]+ing\b.*\b(?:while|without|rather than|or)\b/i.test(raw))
  return "The dilemma involves "+phrase+".";
 if(/\b(?:is|are|does|can|cannot|may|must|offers|competes|remains|matters|means|asks|includes|consumes|supports)\b/i.test(raw))
  return "In this fictional situation, "+phrase+".";
 return "The dilemma involves "+phrase+".";
}

const activityRole=(source,id)=>source.philosophicalOperation.activityRoles?.find(x=>x.id===id)?.role??null;
const startRole=(source,id)=>source.philosophicalOperation.startRoles?.find(x=>x.id===id)?.role??null;
function philosophicalReading(packet,emotion,source){
 const op=source.philosophicalOperation,a=packet.meaning.choiceAnalysis;
 const bound=["source:central","scenario:fictional","source:boundary"];
 if(a.operation==="directed_decision"){
  const inference=packet.meaning.selectedClaim;
  return {long:inference+" "+sentence(source.evidenceClaim),short:inference,minimal:inference,
   evidence:a.sourceWarrantIds};
 }
 if(a.operation==="finite_resource"){
  const high=a.primary.map(x=>x.label).join(" and ");
  const low=a.constrained.map(x=>x.label).join(" and ");
  const lead=a.primary[0],role=activityRole(source,lead.id);
  if(op.kind==="deliberate_use"){
   const lens=emotion.strategy==="neutral_reflection"?
    "The imagined allocation cannot establish why this activity was chosen":
    role==="restorative_pause"?
    "Necessary recovery is not automatically wasted time":
    role==="possible_distraction"?
     "Time given to distraction invites scrutiny, not a diagnosis":
     role==="deliberate_practice"?
      "A chosen practice can serve a purpose, yet busyness alone proves little":
      "The purpose of an activity is not visible from its duration";
   const exclusive=a.shares.filter(x=>x.amount>0).length===1;
   const choice=exclusive?
    "Giving every slot to "+high+" excludes "+low+" from this imagined plan":
    a.equalPriority?
     "Sharing time equally leaves the question of deliberate use open":
     "Prioritizing "+high+" limits time for "+low;
   return {long:choice+". "+lens+". Deliberate living depends on how the time is approached, not just filling the hours.",
    short:choice+". "+lens+".",
    minimal:a.equalPriority?
     "An equal time split still raises a question of deliberate use.":
     a.shares.length===2?
      "Giving more time to "+high+" than "+low+" raises a question of purpose.":
     a.excluded.length===a.shares.length-1?
      "Giving every slot to "+high+" excludes "+low+
       "; the intention behind that priority remains unknown.":
      "Prioritizing "+high+" over "+low+
       " does not reveal whether the time was spent deliberately.",
    focus:{kind:op.kind,leading:high,role,excluded:a.excluded.map(x=>x.label)},
    evidence:bound};
  }
  if(op.kind==="habitual_pattern"){
   const point=a.repetitions?
    "If this fictional distribution repeated, it could form a visible daily pattern":
    "One imagined evening cannot establish a repeated daily pattern";
   const distribution=a.equalPriority?
    "This imagined time is divided equally among "+high:
    "The largest share went to "+high+" rather than "+low;
   const brief=a.equalPriority?
    "Repeating equal time for "+high+" could shape the pattern of ordinary days.":
    "Giving most time to "+high+" could matter if repeated across ordinary days.";
   return {long:distribution+". "+point+
     "; the pattern, not any isolated activity's moral worth, is the philosophical issue.",
    short:brief,
    minimal:a.equalPriority?
     "A repeated equal division of time could form a daily pattern.":
     "Repeated time for "+high+" could shape a daily pattern.",
    focus:{kind:op.kind,repetitions:a.repetitions,leading:high},evidence:bound};
  }
  if(op.kind==="attention_evasion"){
   const quiet=a.shares.filter(x=>activityRole(source,x.id)==="quiet_attention");
   const quietShare=quiet.reduce((n,x)=>n+x.amount,0);
   const point=quiet.length?
    "This leaves "+quietShare+" of "+a.capacity+" slots for quiet attention":
    "The allocation cannot establish whether any attention was avoided";
   return {long:point+". A fictional choice of "+high+
    " can raise questions about distraction without diagnosing aversion to solitude or discounting companionship.",
    short:point+". A schedule cannot reveal why someone seeks distraction.",
    minimal:"The amount of quiet time does not reveal why a person avoids or welcomes it.",
    focus:{kind:op.kind,quietShare,leading:high},evidence:bound};
  }
 }
 if(a.operation==="source_relation"){
  const selected=a.links[0],claims=a.links.map(x=>sentence(x.claim)).join(" ");
  const tension="This brings "+op.contrast+" into view.";
  const anchor=op.kind==="coordinated_work"?
   "The link concerns contributions to a finished task, not anyone's moral worth.":
   op.kind==="self_governance"?
    "What matters is "+op.focus+", not automatic approval or domination.":
    "A conceptual link alone does not decide a person's actual situation.";
  const relationMeaning=selected.type==="contrast"||
   selected.type==="agency_boundary"?
    op.kind==="self_governance"?sentence(selected.claim):
    "Contrasting "+lowerFirst(selected.a)+" with "+lowerFirst(selected.b)+
     " brings "+op.contrast+" into view.":
   selected.type==="complementarity"?
    "Bringing "+lowerFirst(selected.a)+" alongside "+lowerFirst(selected.b)+
     " illustrates "+op.focus+".":sentence(selected.claim);
  const brief=a.links.length===1?relationMeaning:
   "The chosen links connect "+a.links.map(x=>lowerFirst(x.label)).join(" and ")+
    " under the source's argument about "+op.focus+".";
  // Preserve the exact source-owned thesis and each selected edge. A
  // short relation-specific bridge is allowed when the original bridge
  // would breach the strict 40–65-word consumer composition limit.
  const micro=a.links.length===1?
   ["contrast","agency_boundary"].includes(selected.type)?
    "This distinguishes "+lowerFirst(selected.a)+" from "+lowerFirst(selected.b)+".":
    selected.type==="support"?
     "The “"+clean(selected.label)+"” relation concerns "+op.focus+".":
     "This links "+lowerFirst(selected.a)+" with "+lowerFirst(selected.b)+".":
   "The selected relations involve "+a.links.map(x=>lowerFirst(x.label)).join(" and ")+".";
  return {long:claims+" "+tension+" "+anchor,
   short:sentence(brief),
   minimal:sentence(relationMeaning),micro:sentence(micro),
   focus:{kind:op.kind,relationTypes:a.relationTypes,
    selectedClaims:a.links.map(x=>x.claim),sourceContrast:op.contrast},
   evidence:a.sourceWarrantIds};
 }
 const t=a.development.label,initial=a.initial.label,response=a.response.label;
 const opening=lowerFirst(clean(initial).replace(/^You\s+/i,""));
 const action=lowerFirst(clean(response).replace(/^You\s+/i,""));
 if(op.kind==="retrospective_limits"){
  return {long:"You chose to "+opening+" before the invented “"+clean(t)+"”. Looking back at that scene may change what the choice means, but cannot reveal the life not lived.",
   short:"After choosing to "+opening+", the invented “"+clean(t)+"” cannot show the unchosen life.",
   minimal:"The imagined “"+clean(t)+"” cannot reveal the life you did not live.",
   focus:{kind:op.kind,opening,development:t},evidence:bound};
 }
 if(op.kind==="event_acceptance"){
  return {long:"You could choose to "+opening+" and later "+action+
   ", but the imagined “"+clean(t)+"” was not a result you controlled. Acceptance concerns meeting the event, not surrendering your next action.",
   short:"After “"+clean(t)+"”, your response remains yours; the event was not yours to command.",
   minimal:"Your response to “"+clean(t)+"” is distinct from control over its occurrence.",
   focus:{kind:op.kind,opening,response:action,externalEvent:t},evidence:bound};
 }
 if(op.kind==="independent_judgment"){
  const role=startRole(source,a.initial.id);
  const maintained=role==="retain_prior";
  const claim=maintained?
   "Keeping the earlier position calls for present reasons rather than loyalty to past words":
   "Reopening the earlier position may express independent judgment rather than mere inconsistency";
  return {long:"After the fictional “"+clean(t)+"”, "+lowerFirst(claim)+
   ". Neither maintaining nor revising the plan proves wisdom by itself.",
   short:claim+" after the invented “"+clean(t)+"”.",
   minimal:claim+".",
   focus:{kind:op.kind,startingRole:role,development:t,response:action},evidence:bound};
 }
 if(op.kind==="incremental_beginning"){
  const begun=startRole(source,a.initial.id)==="begin_modestly";
  const result=begun?
   "A modest beginning makes a task actionable without ensuring its completion":
   "Planning can prepare a small beginning, but preparation alone has not yet begun the task";
  return {long:result+". The fictional “"+clean(t)+
   "” adds circumstances, not a guarantee; acting without forcing the result remains important.",
   short:result+"; the imagined “"+clean(t)+"” cannot promise success.",
   minimal:result+".",
   focus:{kind:op.kind,beginning:begun,development:t},evidence:bound};
 }
 if(op.kind==="practical_commitment"){
  return {long:"Your initial choice to "+opening+
   " meets the fictional “"+clean(t)+"”. The distinction is between discussing a good action and undertaking one; this imaginary choice certifies no actual virtue.",
   short:"Choosing to "+opening+" raises the gap between arguments and lived action.",
   minimal:"Words about virtue and acting on them are not interchangeable.",
   focus:{kind:op.kind,opening,development:t},evidence:bound};
 }
 if(op.kind==="non_retaliation"){
  const role=startRole(source,a.initial.id);
  const stance=role==="retaliate"?
   "Answering with hostility risks repeating the conflict":
   "Declining to retaliate may interrupt a cycle without guaranteeing peace";
  return {long:stance+". The invented “"+clean(t)+
   "” was not caused by this choice, and protecting oneself remains possible.",
   short:stance+" after the imagined “"+clean(t)+"”.",
   minimal:stance+".",
   focus:{kind:op.kind,opening,development:t,stance:role},evidence:bound};
 }
 if(op.kind==="anticipated_vs_actual"){
  return {long:"Choosing to "+opening+" before the fictional “"+clean(t)+
   "” puts an expectation beside an invented event, not beside real evidence. "+
   "Fearful anticipation and later happenings need not coincide.",
   short:"The fictional “"+clean(t)+"” is not evidence that the expected trouble will occur.",
   minimal:"Imagining “"+clean(t)+"” is not evidence of a real future.",
   focus:{kind:op.kind,opening,development:t},evidence:bound};
 }
 return null;
}
function philosophicalQuestions(packet,emotion,source){
 const op=source.philosophicalOperation,a=packet.meaning.choiceAnalysis;
 if(a.operation==="directed_decision")return [a.judgment.question];
 if(a.operation==="finite_resource"){
  const high=a.primary.map(x=>x.label).join(" and ");
  if(op.kind==="deliberate_use"){
   if(a.primary.length>1)return [
    "If "+high+" share your limited evening, which choices are intentional rather than simply habitual?",
    "How can sharing time between "+high+" reflect a deliberate life?",
    "When time is divided, what makes the pattern intentional?"];
   // Activity roles are source-authored editorial classifications, not
   // moral ranks or claims about readers. Each warrants a different
   // philosophical question under the same deliberate-use operation.
   const role=activityRole(source,a.primary[0].id);
   if(role==="restorative_pause")return [
    "Could the time devoted to "+high+" be genuine recovery rather than another demand to stay busy?",
    "What would make "+high+" an intentional recovery, not time you must justify?",
    "When is "+high+" a deliberate pause rather than a failure to produce?"];
   if(role==="possible_distraction")return [
    "When does "+high+" become chosen enjoyment, and when might the evening pass without attention?",
    "Did the imagined "+high+" serve a purpose, or merely occupy the available hours?",
    "What distinguishes "+high+" as enjoyment from time passing unnoticed?"];
   if(role==="deliberate_practice")return [
    "Can "+high+" serve a purpose worth choosing without becoming another way to stay busy?",
    "Does "+high+" express a chosen direction, or only fill the evening?",
    "When does "+high+" become meaningful practice rather than automatic busyness?"];
   return [
    "With "+high+" receiving most time, what purpose could justify that choice without ranking its moral worth?",
    "What makes time for "+high+" deliberate instead of merely occupied?"];
  }
  if(op.kind==="habitual_pattern")
   return ["If days like this repeated, what pattern would "+high+" create without defining your whole life?",
    "What pattern might repeated time for "+high+" form?",
    "If "+high+" became routine, what would that pattern mean?"];
  if(op.kind==="attention_evasion"){
   const leadingRole=activityRole(source,a.primary[0].id);
   if(leadingRole==="quiet_attention")
    return ["With "+high+" receiving the most time, what could quiet reflection reveal without judging companionship or rest?",
     "Having made room for "+high+", what might you notice without blaming other uses?",
     "What could you notice in "+high+" without judging company?"];
   return ["How might "+high+" coexist with undistracted attention rather than displace it?",
    "If "+high+" takes the most time, what room remains for quiet attention?",
    "What might be missed when "+high+" displaces reflection?"];
  }
 }
 if(a.operation==="source_relation"){
  // Relation labels are editorial display categories, not logical verbs.
  // In particular, "support" may mean examining evidence, supplying
  // context, or contributing to a task; it must never be automatically
  // rewritten as A supporting/causing B. The exact source-authored edge
  // CLAIM is authoritative, and neutral questions remain the fallback.
  const primary=a.links[0];
  const lowerClaim=lowerFirst(clean(primary.claim));
  const label=clean(primary.label);
  if(a.links.length===1){
   // Where the source operation expressly concerns self-government against
   // domination, retain that authenticated boundary. "Relate" is
   // deliberately neutral; a display category never establishes causation.
   const autonomy=op.kind==="self_governance"&&primary.type==="support"?
    "How could "+lowerFirst(primary.a)+" relate to "+lowerFirst(primary.b)+
    " without turning support into control?":null;
   const autonomyContrast=op.kind==="self_governance"&&primary.type==="contrast"?
    "When a choice is contested, what separates "+lowerFirst(primary.a)+
    " from "+lowerFirst(primary.b)+"?":null;
   const claimQuestion="If "+lowerClaim+", what does this leave open?";
   const specific="What does the “"+label+"” connection clarify about "+op.focus+"?";
   const neutral="What does the chosen “"+label+"” relation establish, and what remains uncertain?";
   const compact="What remains open about the “"+label+"” connection?";
   return [...(autonomy?[autonomy]:[]),...(autonomyContrast?[autonomyContrast]:[]),
    claimQuestion,specific,neutral,compact];
  }
  const other=a.links[1],secondLabel=clean(other.label);
  const specific="How do “"+label+"” and “"+secondLabel+
   " relate to "+op.focus+" without proving more than the source claims?";
  const neutral="What do the “"+label+"” and “"+secondLabel+"” relations establish together?";
  const compact="What remains open about these two chosen source-backed connections?";
  return [specific,neutral,compact];
 }
 const event=clean(a.development.label),response=lowerFirst(clean(a.response.label).replace(/^You\s+/i,""));
 if(op.kind==="retrospective_limits")
  return ["What can the invented “"+event+"” help you understand without disclosing the life you did not choose?",
   "What could hindsight teach after “"+event+"” without revealing the alternative?",
   "What can hindsight teach without showing the unchosen life?"];
 if(op.kind==="event_acceptance")
  // Authored developments are clauses (e.g. a listener stays silent).
  // "When [clause] happens" is stilted and can imply a predicted future.
  // Name the specific reader action instead of reciting the game mechanics.
  return ["If "+event+", can you "+response+" without claiming control over the event?",
   "If "+event+", what response remains yours to choose?",
   "If "+event+", how can you "+response+" without requiring a certain outcome?"];
 if(op.kind==="independent_judgment"){
  const retained=startRole(source,a.initial.id)==="retain_prior";
  // Preserving a position and revising it are distinct exercises of
  // present judgment. The philosopher cannot assess either by its label.
  return retained?[
   "Would you still keep the plan if no one remembered your earlier words, and what reasons support it today?",
   "After considering the imagined development, what evidence still warrants keeping the plan?",
   "What makes keeping the plan a judgment rather than loyalty to your past statement?"]:[
   "What new evidence would justify revising the plan rather than changing it merely to avoid criticism?",
   "If no one judged your consistency, would present reasons still lead you to revise the plan?",
   "What evidence makes revising the plan your own judgment, rather than a reaction to criticism?"];
 }
 if(op.kind==="incremental_beginning"){
  const role=startRole(source,a.initial.id);
  const concise=role==="begin_modestly"?
   "What could starting now teach without forcing its outcome?":
   role==="prepare_carefully"?
    "When might careful planning become an actual first step?":
    "What small beginning could follow this choice without force?";
  return ["After the invented “"+event+"”, what small beginning avoids forcing a promised outcome?",
   "What is a modest next step after “"+event+"”, without grasping at success?",
   concise];
 }
 if(op.kind==="practical_commitment")
  return ["After the invented “"+event+"”, what action could test your words without proving your moral worth?",
   "How might you act on your argument after “"+event+"”?",
   "What practice would go beyond arguing about virtue?"];
 if(op.kind==="non_retaliation")
  return ["After the imagined “"+event+"”, how could you "+response+" without reproducing hostility or promising reconciliation?",
   "How might your response avoid repeating hostility after “"+event+"”?",
   "What response could resist hostility without guaranteeing peace?"];
 if(op.kind==="anticipated_vs_actual")
  return ["What does the imagined “"+event+"” fail to prove about the outcome you expected?",
   "How would you distinguish expecting “"+event+"” from knowing it will happen?",
   "What evidence would separate anticipation from what actually occurs?"];
 return [];
}

function dynamicReading(packet,emotion,source){
 const specified=philosophicalReading(packet,emotion,source);
 if(specified)return specified;
 const a=packet.meaning.choiceAnalysis;
 if(a.operation==="finite_resource"){
  const high=a.primary.map(x=>x.label).join(" and ");
  const low=a.constrained.map(x=>x.label).join(" and ");
  const gap=a.primary[0].amount-a.constrained[0].amount;
  const equal=a.equalPriority;
  const core=equal?
   "Sharing time equally between the named uses still makes every additional slot a trade-off.":
   a.primary.length>1?
    "Giving "+high+" a joint lead leaves less room for "+low+".":
    "Giving "+high+" the largest share leaves less time for "+low+".";
  const brief=emotion.strategy==="neutral_reflection"?
   "This fictional allocation shows "+high+" receiving more room than "+low+"; it does not establish actual habits.":
   equal?
   "Equal shares still carry a cost if one grows.":
   a.excluded.length&&a.primary.length===1?
    "Giving every slot to "+high+" excludes "+low+" from this imagined plan.":
   a.primary.length>1?
    "The shared lead for "+high+" leaves less for "+low+".":
    "Prioritizing "+high+" limits time for "+low+".";
  const focus=emotion.strategy==="choice_awareness"?
   "The largest share is a choice of emphasis, not proof of higher worth.":
   emotion.strategy==="tradeoff_attention"?
    "A gain for one use must cost another a slot of the same finite time.":
    "The distribution shows a possibility, not a measured habit.";
  return {long:core+" "+focus,short:brief,
   minimal:equal?"An equal division still has opportunity costs.":
    "Giving more to "+high+" leaves less for "+low+".",
   focus:{leading:high,constrained:low,spread:gap,repetitions:a.repetitions},
   evidence:["choice:canonical","scenario:fictional","source:central"]};
 }
 if(a.operation==="source_relation"){
  const first=a.links[0];
  const claims=a.links.map(x=>sentence(x.claim)).join(" ");
  const core=emotion.strategy==="boundary_awareness"?
   "The source-backed link marks a boundary: "+claims:
   "Your selected relation carries this specific claim: "+claims;
  const brief=a.links.length===1?
   sentence(first.claim):
   "These selected links concern "+a.links.map(x=>clean(x.label).toLowerCase()).join(" and ")+".";
  const minimal=a.links.length===1?
   "The selected link concerns "+first.label.toLowerCase()+".":
   "The two selected links have distinct source-owned claims.";
  return {long:core,short:brief,minimal,
   focus:{relationTypes:a.relationTypes,claims:a.links.map(x=>x.claim)},
   evidence:a.sourceWarrantIds};
 }
 const start=clean(a.initial.label),scene=clean(a.development.label);
 const opening=lowerFirst(start.replace(/^You\s+/i,""));
 const response=clean(a.response.label),stance=a.response.stance;
 const retrospective=a.operation==="authored_retrospective";
 const startClause="Your initial choice “"+start+"”";
 const sceneClause="the invented “"+scene+"”";
 const principle=retrospective?
  "reveals just one imagined development, not the life left unchosen":
  "introduces an imagined complication, not a verdict on the earlier commitment";
 const responseClause=stance==="reconsider"?
  "Reconsidering after it can reopen reasons without proving that you were wrong.":
  stance==="observe"?
   "Attending to this scene cannot uncover the alternative that was never lived.":
   "Continuing afterward does not prove that the earlier choice was correct.";
 const long=startClause+" precedes "+sceneClause+", which "+principle+". "+
  responseClause+" Your selected response is “"+response+"”.";
 const short=retrospective?
  "After choosing to "+opening+", “"+scene+"” cannot reveal the unchosen life.":
  "After choosing to "+opening+", the invented “"+scene+"” cannot certify that commitment.";
 const minimal="The imagined “"+scene+"” cannot validate choosing to "+opening+".";
 return {long,short,minimal,
  focus:{initial:start,development:scene,response,stance,
   inventedNotCaused:true,unchosenUnknown:true},
  evidence:["source:central","scenario:fictional","source:boundary"]};
}
function reflectionQuestions(packet,emotion,source){
 const specified=philosophicalQuestions(packet,emotion,source);
 if(specified.length)return specified;
 const a=packet.meaning.choiceAnalysis;
 if(a.operation==="finite_resource"){
  const high=a.primary.map(x=>x.label).join(" and ");
  const low=a.constrained.map(x=>x.label).join(" and ");
  const detailed=a.equalPriority?
   "If you gave more time to one of these uses, which other use would yield?":
   "With "+high+" taking the most time, what might be lost from "+low+"?";
  const short=a.equalPriority?
   "If you shifted one slot, what would you be giving up?":
   "What would you give up to make more room for "+high+"?";
  return [detailed,short,"What competing use would need to yield if your priority changed?"];
 }
 if(a.operation==="source_relation"){
  const first=a.links[0],label=clean(first.label).toLowerCase();
  const aLabel=lowerFirst(first.a),bLabel=lowerFirst(first.b);
  const question=["agency_boundary","contrast"].includes(first.type)?
   "What becomes clearer when you distinguish "+aLabel+" from "+bLabel+"?":
   first.type==="support"?
    "How could "+aLabel+" support "+bLabel+" without guaranteeing it?":
    "What does connecting "+aLabel+" with "+bLabel+" explain, and what remains uncertain?";
  const brief="What remains unresolved about "+aLabel+" and "+bLabel+" here?";
  const reflective=["agency_boundary","contrast"].includes(first.type)?
   "If "+aLabel+" differs from "+bLabel+", what does that distinction allow us to conclude, and what must remain unsettled?":
   first.type==="support"?
    "If "+aLabel+" supports "+bLabel+", what else would need to be known before relying on this relationship?":
    "What can the chosen relation between "+aLabel+" and "+bLabel+" establish in this fictional example, and what is still untested?";
  const compactFallback="What could "+aLabel+" and "+bLabel+" clarify together?";
  return [reflective,question,brief,compactFallback];
 }
 const first=clean(a.initial.label),scene=clean(a.development.label);
 const after=emotion.strategy==="revisability"?
  "what reason might justify revisiting your opening choice?":
  emotion.strategy==="uncertainty_awareness"?
   "what does the unknown alternative prevent you from concluding?":
   "what would justify keeping or changing your original commitment?";
 const detailed="After the invented “"+scene+"”, "+after.charAt(0).toLowerCase()+after.slice(1);
 const anchored="You first chose “"+first+"”. What might the imagined “"+scene+"” leave unresolved?";
 const short="After “"+scene+"”, what remains uncertain about your opening choice?";
 const concise="What does “"+scene+"” still leave unresolved?";
 return [detailed,anchored,short,concise];
}
function typedWordPolicy(sections,lo,hi,min,max){
 const n=sections.map(x=>count(x.text)),total=n.reduce((x,y)=>x+y,0);
 return total>=lo&&total<=hi&&n.every((x,i)=>x>=min[i]&&x<=max[i])?
  {n,total}:null;
}
const unique=items=>[...new Set(items.map(x=>x.trim()))].filter(Boolean);
function selectSections(firsts,seconds,thirds,lo,hi,min,max){
 // Semantic priority: prefer explicit consequences and source-authored limits,
 // never insert filler words merely to hit a number.
 for(const f of firsts)for(const s of seconds)for(const t of thirds){
  const parts=[f,s,t].map((text,i)=>({label:LABELS[i],text:sentence(text)}));
  const policy=typedWordPolicy(parts,lo,hi,min,max);
  if(policy)return {parts,policy};
 }
 return null;
}
/**
 * A source thesis may already name its author (including via their
 * surname or a phrase such as "For Aristotle"). Add the display-name
 * prefix only when the source text does not already carry attribution.
 * No author-specific exceptions or edits to authenticated theses.
 */
function formatSourceAttribution(author,thesis){
 const full=author.trim().toLocaleLowerCase();
 const surname=full.split(/\s+/).at(-1)??"";
 const leading=thesis.trim().replace(/^(?:for|according to)\s+/i,"").toLocaleLowerCase();
 const names=[full,surname].filter(Boolean);
 // Do not mistake a shared prefix for an author's name.
 const alreadyAttributed=names.some(name=>{
  if(!leading.startsWith(name))return false;
  const following=leading.slice(name.length);
  return following===""||/^[\s,:;.!?'’]/.test(following);
 });
 return alreadyAttributed?thesis:author+": "+thesis;
}
export function expressUniversal(packet,emotion,source){
 if(packet?.status!=="ready"||emotion?.status!=="ready"||
  packet.sourceVersionHash!==source?.sourceFingerprint||
  packet.evidenceIds.some(x=>!source.evidenceIds.includes(x))||
  emotion.evidenceIds.some(x=>!packet.evidenceIds.includes(x))||
  emotion.chosenFrom!==packet.choiceFeature)
  return deny("source_replay_invalid","The composed meaning lacks exact source or canonical-choice evidence");
 const author=source.source.author;
 const chosen=describeChoice(packet,source,false);
 const choiceBrief=describeChoice(packet,source,true);
 const interpretation=dynamicReading(packet,emotion,source);
 const questions=unique(reflectionQuestions(packet,emotion,source));
 const thesis=sentence(source.sourceThesis);
 const attributedThesis=formatSourceAttribution(author,thesis);
 const judgment=packet.meaning.choiceAnalysis.operation==="directed_decision"?
  packet.meaning.choiceAnalysis.judgment:null;
 const customQualifier=["qualification","counterexample","compactLimit"]
  .every(key=>typeof judgment?.[key]==="string");
 const limit=sentence(customQualifier?judgment.compactLimit:source.compactLimit);
 const uncertainty=sentence(customQualifier?judgment.qualification:source.epistemicLimits);
 const counter=sentence(customQualifier?judgment.counterexample:source.counterexample);
 const sourceClaim=sentence(source.evidenceClaim);
 const firsts=unique([chosen,choiceBrief,minimalChoice(packet,source),
  briefResponseChoice(packet,source)]);
 // A compact output always contains an authenticated thesis AND a
 // choice-sensitive consequence; no source-key-specific fixed conclusions.
 const compactSeconds=unique([
  attributedThesis+" "+sentence(interpretation.short)+" "+limit,
  thesis+" "+sentence(interpretation.short)+" "+limit,
  attributedThesis+" "+sentence(interpretation.minimal)+" "+limit,
  thesis+" "+sentence(interpretation.minimal)+" "+limit,
  ...(interpretation.micro?[
   attributedThesis+" "+sentence(interpretation.micro)+" "+limit,
   thesis+" "+sentence(interpretation.micro)+" "+limit
  ]:[])
 ]);
 const compact=selectSections(firsts,compactSeconds,questions,
  40,65,[1,1,9],[48,65,26]);
 if(!compact)return deny("compact_overflow",
  "No concise source-grounded path-sensitive rendering satisfies the 40–65-word policy",
  "needs_editorial_review");
 const fullFirsts=unique([
  ...(source.director?[chosen+" "+packet.meaning.choiceAnalysis.development.text]:[]),
  chosen+" "+humanTensionSentence(source.humanTension),
  choiceBrief+" "+humanTensionSentence(source.humanTension),
  chosen+" This fictional choice does not establish what you actually do.",
  choiceBrief+" This fictional choice does not establish what you actually do.",
  chosen,choiceBrief
 ]);
 const fullSeconds=customQualifier?unique([
  // A warrant-specific qualification AND its counterexample are mandatory.
  // Do not silently fall back to generic source boilerplate to hit 120 words.
  attributedThesis+" "+sentence(interpretation.short)+" "+uncertainty+" "+counter,
  thesis+" "+sentence(interpretation.short)+" "+uncertainty+" "+counter,
  attributedThesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+counter,
  thesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+counter
 ]):unique([
  attributedThesis+" "+sentence(interpretation.long)+" "+uncertainty+" "+counter,
  attributedThesis+" "+sentence(interpretation.short)+" "+uncertainty+" "+counter,
  attributedThesis+" "+sentence(interpretation.short)+" "+uncertainty,
  attributedThesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+counter,
  attributedThesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+sourceClaim,
  attributedThesis+" "+sentence(interpretation.minimal)+" "+uncertainty,
  thesis+" "+sentence(interpretation.short)+" "+uncertainty+" "+counter,
  thesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+counter,
  thesis+" "+sentence(interpretation.short)+" "+uncertainty,
  thesis+" "+sentence(interpretation.minimal)+" "+uncertainty
 ]);
 const full=selectSections(fullFirsts,fullSeconds,questions,
  80,120,[10,18,9],[48,65,26]);
 if(!full)return deny("full_policy_overflow",
  "No 80–120-word three-section response can preserve source thesis, chosen consequence and uncertainty",
  "needs_editorial_review");
 const fragment=source.source.text.trim().split(/\s+/).slice(0,5).join(" ");
 return {status:"ready",
  fullExpression:{status:"ready",version:"expression:"+CZ147_ENGINE_VERSION,
   sections:full.parts.map((s,i)=>({...s,evidenceIds:i===0?
    ["choice:canonical","scenario:fictional"]:source.evidenceIds})),
   wordCount:full.policy.total,sectionWordCounts:full.policy.n,
   sourceFingerprint:source.sourceFingerprint,author,quote:source.source.text,
   sourceUrl:source.source.referenceUrl,publicationAllowed:false},
  compact:{status:"ready",version:"compact:"+CZ147_ENGINE_VERSION,
   sections:compact.parts,visibleWordCount:compact.policy.total,
   fullWordCount:full.policy.total,unchangedFullExpression:true,
   sourceRecordId:source.recordId,sourceVersionHash:source.sourceFingerprint,
   sourceReview:"founder_provisional_development_only",
   philosopher:{author,work:source.source.work,
    highlight:fragment,exactQuote:source.source.text,
    sourceUrl:source.source.referenceUrl},
   deepening:{fullSections:full.parts,sourceQualification:full.parts[1].text,
    originalSourceUrl:source.source.referenceUrl,
    necessaryLimits:customQualifier?judgment.qualification:source.epistemicLimits},publicationAllowed:false}};
}
