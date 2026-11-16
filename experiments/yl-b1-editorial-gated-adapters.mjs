/**
 * CZ-134 B1 — admission-gated canonical intent adapters, research only.
 * This module never creates a game-selection layer, source approval or
 * philosopher-specific routing. The frozen engines remain authoritative.
 */
import {validateContentRecordV21,validateChoiceV21,GAME_IDS}
 from "../philosophy-engine/content/content-contract-v21.js";
import {assessAllSixPeerGames,authoritativeContextForRecord,sourceBoundBranchParity}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {selectMiniGameV22,runSelectedEncounterResearchV22}
 from "./yl-milestone-a-selector.mjs";
export const B1_VERSION="source-gated-b1/1.0.0";
export const B1_GAMES=Object.freeze(["balance_of_values","future_reveal"]);
/* Intentionally empty. Only a later qualified CZ-121 exact-hash code review
 * may add a static, server-owned game/source warrant. Never accept caller flags. */
export const QUALIFIED_WARRANTS=Object.freeze([]);
const env=Object.freeze({isolated:true,publicVisibility:false,provisionalDisclosure:true});
const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const keys=(x,allowed)=>obj(x)&&Object.keys(x).every(k=>allowed.includes(k));
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const fail=(code,reason)=>({status:"blocked",code,reason,
 publicationAllowed:false,productionPlayable:false});
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function inspectB1Source(record,gameId){
 if(!B1_GAMES.includes(gameId)||!GAME_IDS.includes(gameId))
  return fail("unknown_game","Not a B1 peer");
 const v=validateContentRecordV21(record);
 if(v.status!=="valid_research_record")
  return fail("invalid_source","Content not admitted: "+v.errors.map(x=>x.field).join(", "));
 const cap=assessAllSixPeerGames(record,GAME_IDS).find(x=>x.id===gameId);
 if(!cap?.eligible||!record.gameCompatibility.some(g=>g.id===gameId&&g.eligible))
  return fail("source_ineligible",cap?.reason||"No evidence-derived capability");
 const signed=QUALIFIED_WARRANTS.some(w=>w.gameId===gameId&&
  w.versionHash===record.versionHash&&
  w.referenceUrl===record.source.referenceUrl&&
  w.approval==="qualified_independent_pass");
 if(record.source.reviewState!=="source_verified"||!signed)
  return fail("editorial_pending","No independent qualified game-specific source approval");
 const selection=selectMiniGameV22(record,{mode:"prototype",preferredGameId:gameId});
 if(selection.status!=="research_selected"||selection.selected_game_id!==gameId||
    !selection.selected_game?.browserPrototypeAvailable)
  return fail("selector_refused","Existing one six-peer selector refuses this source/game");
 return {status:"admitted",selection,publicationAllowed:false};
}
/* Does NOT measure real human values. Only a reviewed two-choice common
 * resource can yield a canonical finite allocation (otherwise refusal). */
export function normalizeBalance(record,input){
 if(!keys(input,["leftSlots","touched"])||input.touched!==true||
    !integer(input.leftSlots))
  return fail("invalid_input","A deliberate symbolic adjustment is required");
 const c=record?.scenario?.constraints;
 if(c?.kind!=="finite_budget"||(c.capacityMode||"exact")!=="exact"||
   !integer(c.capacity)||c.capacity<2||c.capacity>24||
   !eq(c.costs,[1,1])||record.scenario.choices.length!==2||
   input.leftSlots>c.capacity)
  return fail("incompatible_source","No authorized two-priority common resource");
 const candidate={gameId:"balance_of_values",
  amounts:[input.leftSlots,c.capacity-input.leftSlots],
  ...(c.repetitions!==null?{repetitions:c.repetitions}:{})};
 const valid=validateChoiceV21(record,{...candidate,gameId:"trade_off"});
 if(valid.status!=="ready")return fail("canonical_refused","Frozen trade-off validator abstained");
 return {status:"normalized",choice:candidate,canonical:valid.canonical};
}
/** Enumerate only already-authored hypothetical events from the frozen graph.
 * This is a RESEARCH-ONLY viewing menu, never source admission or causal agency.
 * The reader selects which FICTIONAL possibility to explore, not which event occurs.
 */
export function listAuthoredPossibilities(record,startId){
 const parity=sourceBoundBranchParity(record,authoritativeContextForRecord(record));
 if(!parity.ok)return fail("source_graph_refused",parity.reason);
 if(typeof startId!=="string"||!record.scenario.choices.some(c=>c.id===startId))
  return fail("invalid_decision","Unknown initial choice");
 const options=new Map();
 for(const r of record.scenario.constraints.routes.filter(x=>x.path[0]===startId)){
  const id=r.path[1],narration=r.authoredDevelopments;
  if(typeof id!=="string"||!id||!Array.isArray(narration)||!narration.length||
   !narration.every(x=>typeof x==="string"&&x.trim()))
   return fail("missing_authored_scene","No exact source-authored wording");
  if(options.has(id)&&!eq(options.get(id).authoredText,narration))
   return fail("conflicting_authored_scene","Inconsistent text for same fictional scene");
  options.set(id,{sceneId:id,authoredText:[...narration],
   role:"AUTHORED_DEVELOPMENT",readerAction:"EXPLORE_ONLY",
   causedByReader:false,predictedRealFuture:false,unchosenFutureKnown:false});
 }
 if(!options.size)return fail("missing_authored_scene","No source-authored route");
 return {status:"research_options_only",sourceVersionHash:record.versionHash,
  options:[...options.values()],sourceApproved:false,publicationAllowed:false};
}
/* Replay typed user actions. Exact authored event IDs come ONLY from source.
 * A viewing selection is NOT a user's causal decision. */
export function normalizeFuture(record,actions){
 if(!Array.isArray(actions)||actions.length>48)
  return fail("invalid_actions","Unbounded or missing timeline actions");
 const parity=sourceBoundBranchParity(record,authoritativeContextForRecord(record));
 if(!parity.ok)return fail("source_graph_refused",parity.reason);
 const routes=record.scenario.constraints.routes;
 if(routes.some(r=>r.path.length!==3||
   !eq(r.agencyRoles,["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"])||
   r.unchosenOutcomeKnown!==false))
  return fail("incompatible_agency","Wrong agency or unknown-future contract");
 let start=null,authoredEvent=null,seen=false,response=null,reflected=false,unlocked=0,view=0;
 for(const a of actions){
  if(!keys(a,["type","optionId","stage","sceneId"]))return fail("forged_event","Unknown action data");
  if(a.type==="choose_start"||a.type==="revise_start"){
   if(!keys(a,["type","optionId"])||typeof a.optionId!=="string"||
      !routes.some(r=>r.path[0]===a.optionId)||
      (a.type==="choose_start"&&start!==null))
    return fail("invalid_decision","Invalid or unrevised initial choice");
   start=a.optionId;authoredEvent=null;seen=false;response=null;reflected=false;unlocked=1;view=1;
  }else if(a.type==="reveal_authored"||a.type==="explore_authored"){
   if(!start||seen)return fail("stage_locked","Authored scene not ready");
   const available=listAuthoredPossibilities(record,start);
   if(available.status!=="research_options_only")return available;
   if(a.type==="reveal_authored"){
    if(!keys(a,["type"]))return fail("forged_event","Client cannot invent an event");
    if(available.options.length!==1)
     return fail("source_ambiguity","Multiple authored fictional events: choose which to EXPLORE; never claim the action determined it");
    authoredEvent=available.options[0].sceneId;
   }else{
    if(!keys(a,["type","sceneId"])||typeof a.sceneId!=="string")
     return fail("forged_event","Only exact preauthored hypothetical IDs can be viewed");
    if(!available.options.some(o=>o.sceneId===a.sceneId))
     return fail("unapproved_scene","Unknown fictional source event");
    authoredEvent=a.sceneId;
   }
   seen=true;unlocked=Math.max(unlocked,2);view=2;
  }else if(a.type==="choose_response"||a.type==="revise_response"){
   if(!keys(a,["type","optionId"])||!seen||
      typeof a.optionId!=="string"||
      (a.type==="choose_response"&&response!==null)||
      routes.filter(r=>r.path[0]===start&&
       r.path[1]===authoredEvent&&r.path[2]===a.optionId).length!==1)
    return fail("invalid_response","Second user choice invalid or not available");
   response=a.optionId;reflected=false;unlocked=Math.max(unlocked,3);view=3;
  }else if(a.type==="read_retrospective"){
   if(!keys(a,["type"])||response===null)
    return fail("stage_locked","Cannot interpret before final reader choice");
   reflected=true;unlocked=4;view=4;
  }else if(a.type==="scrub"){
   if(!keys(a,["type","stage"])||!integer(a.stage)||
      a.stage<1||a.stage>unlocked)
    return fail("stage_locked","Cannot skip an unseen hypothetical stage");
   view=a.stage;
  }else return fail("forged_event","Unknown or invented event action");
 }
 if(!start||!seen||response===null||!reflected)
  return fail("incomplete","Missing decision, authored event, response or retrospective");
 const route=routes.find(r=>r.path[0]===start&&
  r.path[1]===authoredEvent&&r.path[2]===response);
 if(!route)return fail("unknown_path","No exact source-authored terminal path");
 const valid=validateChoiceV21(record,{gameId:"decision_map",path:route.path});
 if(valid.status!=="ready")return fail("canonical_refused","Frozen branch validator abstained");
 return {status:"normalized",choice:{gameId:"future_reveal",path:[...route.path]},
  canonical:valid.canonical,provenance:{authoredStageId:route.path[1],
  roles:[...route.agencyRoles],readerExploredFiction:true,
  authoredEventCausedByReader:false,predictedActualFuture:false,
  unchosenFutureKnown:false,view,unlocked}};
}
/** The only output boundary. Source review and same selector MUST pass before
 * normalization and calling the unchanged Reasoning/Emotion/Expression. */
export function tryB1Encounter(record,gameId,input){
 const gate=inspectB1Source(record,gameId);
 if(gate.status!=="admitted")return gate;
 if(!keys(input,gameId==="balance_of_values"?
   ["leftSlots","touched"]:["actions"]))
  return fail("forged_payload","Unsupported input or authored outcome field");
 const converted=gameId==="balance_of_values"?
  normalizeBalance(record,input):normalizeFuture(record,input.actions);
 if(converted.status!=="normalized")return converted;
 const result=runSelectedEncounterResearchV22(record,gate.selection,converted.choice,env);
 if(result.status!=="ready")
  return fail("engine_abstained",result.reason||result.status);
 if(result.expression?.wordCount<80||result.expression?.wordCount>120||
    result.expression?.sections?.length!==3)
  return fail("expression_policy","Three-section or 80–120 word policy failed");
 return {status:"ready",result,publicationAllowed:false,productionPlayable:false};
}
