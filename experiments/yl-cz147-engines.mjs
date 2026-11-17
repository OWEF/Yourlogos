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
  if(source.familyId==="decision_cards")
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
 const strategy=preference.find(x=>allowed.includes(x))??"neutral_reflection";
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
 if(source.familyId==="balance_move"){
  const a=source.allocation;
  const chosen=choice.amounts.map((n,i)=>({n,label:a.choices[i].label}));
  const used=chosen.filter(x=>x.n>0),zero=chosen.filter(x=>x.n===0);
  const list=used.map(x=>x.n+" for "+x.label);
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
 if(source.familyId==="decision_cards"||source.familyId==="flip_reveal"){
  const t=packet.meaning.selectedTimeline;
  return "You first chose "+quoteAction(t.startLabel)+
   "; later you chose "+quoteAction(t.responseLabel)+".";
 }
 return describeChoice(packet,source,true);
}
function briefResponseChoice(packet,source){
 if(source.familyId==="decision_cards"||source.familyId==="flip_reveal"){
  const t=packet.meaning.selectedTimeline;
  return "After one imagined development, you chose "+quoteAction(t.responseLabel)+".";
 }
 return minimalChoice(packet,source);
}
const lowerFirst=s=>s.charAt(0).toLowerCase()+s.slice(1);
function humanTensionSentence(raw){
 // Some source records state the dilemma as a noun/gerund phrase.
 // Give it a grammatical subject rather than turning it into a fragment.
 if(/\b(?:is|are|does|can|cannot|may|must|offers|competes|remains|matters|means|asks|includes|consumes|supports)\b/i.test(raw))
  return "In this fictional situation, "+lowerFirst(clean(raw))+".";
 return "The dilemma involves "+lowerFirst(clean(raw))+".";
}
function dynamicReading(packet,emotion,source){
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
 const minimal="The imagined “"+scene+"” does not settle the choice to "+opening+".";
 return {long,short,minimal,
  focus:{initial:start,development:scene,response,stance,
   inventedNotCaused:true,unchosenUnknown:true},
  evidence:["source:central","scenario:fictional","source:boundary"]};
}
function reflectionQuestions(packet,emotion,source){
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
  const compactFallback="What could "+aLabel+" and "+bLabel+" clarify together?";
  return [question,brief,compactFallback];
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
 return [detailed,anchored,short];
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
 const limit=sentence(source.compactLimit);
 const uncertainty=sentence(source.epistemicLimits);
 const counter=sentence(source.counterexample);
 const sourceClaim=sentence(source.evidenceClaim);
 const firsts=unique([chosen,choiceBrief,minimalChoice(packet,source),
  briefResponseChoice(packet,source)]);
 // A compact output always contains an authenticated thesis AND a
 // choice-sensitive consequence; no source-key-specific fixed conclusions.
 const compactSeconds=unique([
  author+": "+thesis+" "+sentence(interpretation.short)+" "+limit,
  thesis+" "+sentence(interpretation.short)+" "+limit,
  author+": "+thesis+" "+sentence(interpretation.minimal)+" "+limit,
  thesis+" "+sentence(interpretation.minimal)+" "+limit
 ]);
 const compact=selectSections(firsts,compactSeconds,questions,
  40,65,[1,1,9],[48,65,26]);
 if(!compact)return deny("compact_overflow",
  "No concise source-grounded path-sensitive rendering satisfies the 40–65-word policy",
  "needs_editorial_review");
 const fullFirsts=unique([
  chosen+" "+humanTensionSentence(source.humanTension),
  choiceBrief+" "+humanTensionSentence(source.humanTension),
  chosen+" This fictional choice does not establish what you actually do.",
  choiceBrief+" This fictional choice does not establish what you actually do.",
  chosen,choiceBrief
 ]);
 const fullSeconds=unique([
  author+": "+thesis+" "+sentence(interpretation.long)+" "+uncertainty+" "+counter,
  author+": "+thesis+" "+sentence(interpretation.short)+" "+uncertainty+" "+counter,
  author+": "+thesis+" "+sentence(interpretation.short)+" "+uncertainty,
  author+": "+thesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+counter,
  author+": "+thesis+" "+sentence(interpretation.minimal)+" "+uncertainty+" "+sourceClaim,
  author+": "+thesis+" "+sentence(interpretation.minimal)+" "+uncertainty,
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
    necessaryLimits:source.epistemicLimits},publicationAllowed:false}};
}
