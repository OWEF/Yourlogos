/**
 * CZ-128 B2.4 coherent Encounter successor.
 * ONE existing source→six-peer selector, unchanged four historical games.
 * Value Balance receives a new v2.0-compatible Emotion/Expression contract,
 * never the archived B2.3 v1.2 expression fallback.
 */
import {B23_SOURCE_CONTRACTS,selectMiniGameB23,
 runSelectedEncounterB23} from "./yl-b23-founder-six-peer.mjs";
import {reasonSemantically}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {renderConversionEncounterB24,validateConversionEncounterB24,
 B24_FOCI,B24_BRIDGE_VERSION}
 from "./yl-b24-conversion-bridge.mjs";
export const B24_ENCOUNTER_VERSION="coherent-six-game-encounter/2.4.0";
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const refusal=(code,reason)=>({status:"blocked",code,reason,
 publicationAllowed:false,productionPlayable:false});
export function runSelectedEncounterB24(recordRef,selection,input){
 if(!plain(input)||!plain(selection))
  return refusal("invalid_request","Typed input and source-backed selection are required");
 const check=selectMiniGameB23(recordRef,{preferredGameId:selection.preferredGameId});
 if(check.status!=="research_selected"||!eq(check,selection))
  return refusal("selection_refused","Replayed single selector differs from the submitted source/game");
 if(check.selected_game_id!=="balance_of_values"){
  if(Object.hasOwn(input,"focus"))
   return refusal("unknown_focus","Value Balance alone supports an explicitly selected interpretive lens");
  const existing=runSelectedEncounterB23(recordRef,selection,input);
  return existing.status==="ready"?{
   ...existing,version:B24_ENCOUNTER_VERSION,
   expressionVerification:existing.expressionVerification||"frozen_v20",
   publicationAllowed:false,productionPlayable:false
  }:existing;
 }
 const contract=B23_SOURCE_CONTRACTS.find(x=>x.gameId==="balance_of_values");
 if((typeof recordRef==="string"?recordRef!==contract.recordId:
     !eq(recordRef,contract))||
    check.recordVersionHash!==contract.contentFingerprint)
  return refusal("source_refused","Only exact founder-provisional source version is admitted");
 const keys=Object.keys(input).sort().join(",");
 if(keys!=="leftSlots,touched"&&keys!=="focus,leftSlots,touched")
  return refusal("forged_payload","Only hours, touched, and reader-authored focus are allowed");
 const focus=input.focus??"life_exchanged";
 if(!B24_FOCI.includes(focus)||input.touched!==true||
    !Number.isSafeInteger(input.leftSlots)||
    input.leftSlots<0||input.leftSlots!==Math.trunc(input.leftSlots)||
    input.leftSlots>contract.scenario.capacity)
  return refusal("invalid_choice","Exact fictional hour budget or chosen lens is invalid");
 const canonical={amounts:[input.leftSlots,8-input.leftSlots],budgets:[8]};
 const meaning=reasonSemantically(contract.context,canonical);
 if(meaning.status!=="ready"||
    meaning.meaning?.kind!=="conversion"||
    meaning.source?.url!==contract.source.referenceUrl||
    meaning.sourceAdmission?.centralClaim!==contract.context.semantic.admission.centralClaim)
  return refusal("reasoning_abstained",meaning.reason||"Source-bound conversion meaning refused");
 const expression=renderConversionEncounterB24(meaning,contract,canonical,{focus});
 if(expression.status!=="ready"||
    validateConversionEncounterB24(meaning,contract,canonical,focus,expression).status!=="ready")
  return refusal("expression_refused",expression.reason||"New v2-compatible Emotion/Expression abstained");
 return {status:"ready",version:B24_ENCOUNTER_VERSION,
  selected_game_id:"balance_of_values",
  sourceReview:"founder_provisional_not_scholarly_verified",
  sourceContractFingerprint:contract.contentFingerprint,
  canonical_choice:canonical,meaning,emotion:expression.brief,expression,
  expressionVerification:B24_BRIDGE_VERSION,
  provenance:{exactEightHourConservation:true,
   optionalWorkHours:canonical.amounts[0],
   hoursKept:canonical.amounts[1],
   hypotheticalNetHourlyWage:20,
   readerAuthoredFocus:focus,
   counterfactualKnown:false,actualPurchaseInferred:false,
   moralValueScoreInferred:false},
  sourceQualification:"Invented eight hours and wage; text/translation remains provisional.",
  publicationAllowed:false,productionPlayable:false,
  accountPersistenceAllowed:false,
  realHumanReaderGatePassed:false,physicalSafariVoiceOverGatePassed:false,
  stages:["ONE mini-game selection","User interaction","Reasoning","Emotion v2-compatible","Expression v2-compatible"]
 };
}
