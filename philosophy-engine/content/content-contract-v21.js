import {createHash} from "node:crypto";
import {assessAllSixPeerGames,authoritativeContextForRecord} from "./content-capabilities-v211.js";
import {reasonSemantically} from "../encounter/semantic-reasoning-v12.js";
/**
 * CZ-130 / Encounter v2.1: source-first content admission and scenario contract.
 * ISOLATED RESEARCH: no catalogue import or publishing side effects.
 * Six peer game options are metadata; selection belongs to CZ-131, never here.
 */
export const CONTENT_VERSION="philosophical-content/2.1.1";
export const GAME_IDS=Object.freeze([
 "trade_off","decision_map","token_studio","balance_of_values","swipe_decision","future_reveal"
]);
export const SOURCE_STATES=Object.freeze(["catalogue_only","curated_provisional","source_verified"]);
export const EDITORIAL_STATES=Object.freeze(["research_only","public_approved"]);
const text=x=>typeof x==="string"&&x.trim().length>0;
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const distinct=xs=>new Set(xs).size===xs.length;
const safeInt=x=>Number.isSafeInteger(x)&&x>=0;
const fail=(errors,field,reason)=>errors.push({field,reason});
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
  isObj(x)?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":JSON.stringify(x===undefined?null:x);
/** Deterministic substantive-content hash; review flags and self-declared signoffs
 * are NOT trusted source data and are intentionally omitted from this digest. */
export function contentFingerprintV21(r){
 if(!isObj(r))return null;
 const s=r.source||{};
 const source={author:s.author,work:s.work,quote:s.quote,locator:s.locator,
   referenceUrl:s.referenceUrl??null,verifiedSourceUrl:s.verifiedSourceUrl??null,
   translationEdition:s.translationEdition??null};
 const core={id:r.id,version:r.version,source,dilemma:r.dilemma??null,
   argument:r.argument??null,scenario:r.scenario??null,route:r.route??null,
   gameCompatibility:r.gameCompatibility??null,emotionalEligibility:r.emotionalEligibility??null,
   engineAdapter:r.engineAdapter??null,noFitReason:r.noFitReason??null};
 return "sha256:"+createHash("sha256").update(stable(core)).digest("hex");
}
export function validateContentRecordV21(record){
 const errors=[];
 if(!isObj(record)){fail(errors,"record","A record object is required.");return {status:"invalid",errors};}
 if(record.version!==CONTENT_VERSION)fail(errors,"version","Wrong content contract version.");
 if(!text(record.id)||!text(record.versionHash))fail(errors,"identity","Stable record id and immutable versionHash are required.");
 if(text(record.id)&&record.versionHash!==contentFingerprintV21(record))fail(errors,"versionHash","Substantive record changed since its content fingerprint; re-review is mandatory.");
 const s=record.source;
 if(!isObj(s)||!text(s.author)||!text(s.work)||!text(s.quote)||!text(s.locator))
  fail(errors,"source","Author, work, excerpt and passage locator are required.");
 if(!SOURCE_STATES.includes(s?.reviewState))fail(errors,"source.reviewState","Unknown source-review status.");
 if(s?.reviewState!=="catalogue_only"&&!text(s?.referenceUrl))
  fail(errors,"source.referenceUrl","Provisional/verified source needs a traceable reference.");
 if(s?.reviewState==="source_verified"&&
   (!text(s.verifiedSourceUrl)||!text(s.reviewSignoff?.reviewer)||
    !text(s.reviewSignoff?.reviewedAt)||s.reviewSignoff?.versionHash!==record.versionHash||
    !text(s.reviewSignoff?.translationEdition)||!text(s.reviewSignoff?.passageLocation)))
  fail(errors,"source.reviewSignoff","Verified source requires exact-version qualified scholarly signoff, translation and passage.");
 if(!EDITORIAL_STATES.includes(record.editorialState))
  fail(errors,"editorialState","Unknown editorial status.");
 if(record.editorialState==="public_approved"&&
   (s?.reviewState!=="source_verified"||
    !text(record.editorialSignoff?.reviewer)||
    !text(record.editorialSignoff?.reviewedAt)||
    record.editorialSignoff?.versionHash!==record.versionHash))
  fail(errors,"editorialSignoff","Public approval requires independently signed verified exact-version content.");
  const scored=assessAllSixPeerGames(record,GAME_IDS);
 const g=record.gameCompatibility;
 const peersOk=Array.isArray(g)&&g.length===GAME_IDS.length&&
   distinct(g.map(x=>x?.id))&&GAME_IDS.every(id=>g.some(x=>x?.id===id))&&
   g.every(entry=>isObj(entry)&&typeof entry.eligible==="boolean"&&
    Array.isArray(entry.requirements)&&entry.requirements.every(text)&&
    text(entry.evidenceOrRejection)&&entry.evidenceOrRejection.trim().length>=20);
 if(!peersOk)fail(errors,"gameCompatibility","All SIX direct peers require explicit, substantive evidence or rejection.");
 else{
  const incorrect=g.filter(entry=>entry.eligible!==scored.find(x=>x.id===entry.id)?.eligible);
  for(const row of incorrect){
   const finding=scored.find(x=>x.id===row.id);
   fail(errors,"gameCompatibility."+row.id,
    "Eligibility contradicts machine-checkable source capability: "+finding.reason);
  }
 }

 if(record.route==="no_fit"){
  if(!text(record.noFitReason)||record.noFitReason.trim().length<30)fail(errors,"noFitReason","Explain why all six peers cannot represent the philosophical passage.");
  if(record.gameCompatibility?.some(g=>g.eligible))fail(errors,"no_fit","Cannot admit any game when route=no_fit.");
  if(record.editorialState!=="research_only")fail(errors,"no_fit","No-fit cannot be directly published as an Encounter.");
  return {status:errors.length?"invalid":"inventory_no_fit",errors};
 }
 if(record.route!=="selector_pending")fail(errors,"route","Selectable content stays selector_pending until one six-peer service is built.");
 if(!text(record.dilemma)||!isObj(record.argument)||!text(record.argument.thesis)||
    !text(record.argument.sourceWarrant)||!text(record.argument.uncertaintyLimit)||
    !text(record.argument.accessibleInsight))
  fail(errors,"argument","Source warrant, dilemma, readable insight and uncertainty limit are mandatory.");
 const sc=record.scenario;
 if(!isObj(sc)||!text(sc.id)||!isObj(sc.variables)||!Array.isArray(sc.choices)||
    !sc.choices.length||!isObj(sc.constraints)||!text(sc.consequences?.warrant))
  fail(errors,"scenario","Variables, choices, constraints, and warranted outcomes required.");
 else{
  if(!sc.choices.every(c=>isObj(c)&&text(c.id)&&text(c.label))||
     !distinct(sc.choices.map(c=>c.id)))fail(errors,"scenario.choices","Choices need unique nonempty ids and labels.");
  if(sc.constraints.kind==="finite_budget"){
   if(!safeInt(sc.constraints.capacity)||!Array.isArray(sc.constraints.costs)||
      sc.constraints.costs.length!==sc.choices.length||
      !sc.constraints.costs.every(n=>Number.isSafeInteger(n)&&n>0)||
      !(sc.constraints.unitHours===null||(Number.isFinite(sc.constraints.unitHours)&&sc.constraints.unitHours>0))||
      !["exact","cap"].includes(sc.constraints.capacityMode||"exact")||
      !(sc.constraints.repetitions===null||(safeInt(sc.constraints.repetitions)&&sc.constraints.repetitions>=2)))
    fail(errors,"scenario.constraints","Finite resource must have safe budget, positive costs, fractional unit and repetition horizon.");
  }else if(sc.constraints.kind==="authored_branch"){
   if(!Array.isArray(sc.constraints.routes)||!sc.constraints.routes.length||
      !sc.constraints.routes.every(r=>Array.isArray(r.path)&&r.path.length&&
        r.path.every(text)&&Array.isArray(r.authoredDevelopments))||
      sc.constraints.routes.some(r=>r.unchosenOutcomeKnown===true))
    fail(errors,"scenario.constraints","Branch must have authored possible developments with unchosen outcomes unknown.");
  }else fail(errors,"scenario.constraints.kind","Unknown constraints; don't fabricate outcomes.");
 }
 // The six-peer evidence and exact capability assertions are checked above,
 // including every negative no-fit record before an early return.
 if(!isObj(record.emotionalEligibility)||typeof record.emotionalEligibility.enabled!=="boolean"||
    !Array.isArray(record.emotionalEligibility.allowedStrategies)||
    !record.emotionalEligibility.allowedStrategies.every(text))
  fail(errors,"emotionalEligibility","Allow-listed emotion strategies required.");
 return {status:errors.length?"invalid":"valid_research_record",errors};
}
export function validateChoiceV21(record,choice){
 const vr=validateContentRecordV21(record);
 if(vr.status!=="valid_research_record")return {status:"rejected",reason:"Unadmitted or invalid content record."};
 if(!text(choice?.gameId)||!record.gameCompatibility.some(g=>g.id===choice.gameId&&g.eligible))
  return {status:"rejected",reason:"The submitted game is not one of the six directly eligible peer mini-games."};
 const sc=record.scenario,c=sc.constraints,context=authoritativeContextForRecord(record);
 if(!context)return {status:"rejected",reason:"No authorized frozen meaning context matches this content record."};
 if(c.kind==="finite_budget"){
  const a=choice?.amounts;
  if(!Array.isArray(a)||a.length!==sc.choices.length||
     !a.every(safeInt)||!Number.isSafeInteger(a.reduce((n,x,i)=>n+x*c.costs[i],0))||
     (c.capacityMode==="cap"?a.reduce((n,x,i)=>n+x*c.costs[i],0)>c.capacity:
      a.reduce((n,x,i)=>n+x*c.costs[i],0)!==c.capacity)||
     a.some((n,i)=>n>(context.model.choices[i]?.max??-1))||
     (c.repetitions===null?choice?.repetitions!==undefined:choice?.repetitions!==c.repetitions))
   return {status:"rejected",reason:"Allocation must conserve exact capacity in safe whole-slot units."};
  const canonical={amounts:[...a],budgets:[c.capacity],
   ...(c.repetitions!==null?{repetitions:c.repetitions}:{})};
  const checked=reasonSemantically(context,canonical);
  if(checked.status!=="ready")return {status:"rejected",reason:"Frozen reasoning model rejected the chosen allocation: "+checked.reason};
  return {status:"ready",canonical,unitHours:c.unitHours,gameId:choice.gameId,
    meaningVersion:checked.version};
 }
 const path=choice?.path;
 if(!Array.isArray(path)||!c.routes.some(r=>JSON.stringify(r.path)===JSON.stringify(path)))
  return {status:"rejected",reason:"The branch must match a complete source-authored possible path."};
 const canonical={path:[...path]},checked=reasonSemantically(context,canonical);
 if(checked.status!=="ready")return {status:"rejected",reason:"Frozen reasoning model rejected the chosen path: "+checked.reason};
 return {status:"ready",canonical,gameId:choice.gameId,meaningVersion:checked.version};
}
export function canRunIsolatedResearchV21(record,environment){
 const v=validateContentRecordV21(record);
 return v.status==="valid_research_record" &&
  ["curated_provisional","source_verified"].includes(record.source.reviewState) &&
  record.editorialState==="research_only" &&
  environment?.isolated===true&&environment?.publicVisibility===false &&
  environment?.provisionalDisclosure===true;
}
/** Publication authority is NOT derivable from a content hash, arbitrary reviewer
 * fields or booleans. No trusted server-owned authorization boundary is
 * connected in this isolated research module, therefore PUBLICATION IS DENIED.
 * Integrators must add independently auditable server-held approval at a later
 * reviewed boundary; never add a caller token here as an escape hatch. */
export function canPublishEncounterV21(_record,_callerRelease){
 return false;
}
