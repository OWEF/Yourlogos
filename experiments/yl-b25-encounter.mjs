/**
 * CZ-128 B2.5 — ONE source-aware six-peer selection, now with independently
 * authored Value Balance cases. Original B2.4 game/engine and B2.3 selector
 * remain frozen. A source is never admitted based on a name or quotation alone.
 */
import {GAME_IDS} from "../philosophy-engine/content/content-contract-v21.js";
import {reasonSemantically}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {B23_SIX_PEERS,selectMiniGameB23}
 from "./yl-b23-founder-six-peer.mjs";
import {runSelectedEncounterB24}
 from "./yl-b24-encounter.mjs";
import {B25_BALANCE_CONTRACTS,inspectB25Contract,stableB25}
 from "./yl-b25-authored-scenarios.mjs";
import {renderEncounterB25,verifyEncounterB25,B25_BRIDGE_VERSION}
 from "./yl-b25-generic-bridge.mjs";
export const B25_ENCOUNTER_VERSION="coherent-source-driven-encounter/2.5.0";
const blocked=(code,reason)=>({status:"blocked",code,reason,
 publicationAllowed:false,productionPlayable:false});
const keys=x=>Object.keys(x).sort().join(",");
export function selectMiniGameB25(ref,{preferredGameId=null}={}){
 const contract=inspectB25Contract(ref);
 if(!contract){
  // Inherited four and Future Reveal continue through the ONE accepted
  // B2.3 selector; incompatible editorial subjects preserve no_fit.
  return selectMiniGameB23(ref,{preferredGameId});
 }
 if(preferredGameId!==null&&!GAME_IDS.includes(preferredGameId))
  return blocked("invalid_peer","Unknown game ID");
 const rows=B23_SIX_PEERS.map(x=>({
  id:x.id,eligible:x.id==="balance_of_values",
  reason:x.id==="balance_of_values"?
   "An exact source-authored resource reflection supports this choice":
   "Source does not warrant this interaction for this contract",
  browserPrototypeAvailable:x.sourceResearchPrototype,
  productionPlayable:false
 }));
 if(preferredGameId&&preferredGameId!=="balance_of_values")
  return {status:"no_fit",version:B25_ENCOUNTER_VERSION,
   selection_trace:{evaluatedPeerIds:[...GAME_IDS],rows},
   publicationAllowed:false};
 return {status:"research_selected",version:B25_ENCOUNTER_VERSION,
  recordId:contract.recordId,recordVersionHash:contract.contentFingerprint,
  preferredGameId,selected_game_id:"balance_of_values",
  sourceReview:"founder_provisional_not_scholarly_verified",
  selection_trace:{evaluatedPeerIds:[...GAME_IDS],rows},
  publicationAllowed:false,productionPlayable:false};
}
export function runSelectedEncounterB25(ref,selection,input){
 if(!selection||typeof selection!=="object"||!input||
    typeof input!=="object"||Array.isArray(input))
  return blocked("invalid_request","A source-backed selection and typed choice are required");
 const replay=selectMiniGameB25(ref,{preferredGameId:selection.preferredGameId});
 if(replay.status!=="research_selected"||stableB25(replay)!==stableB25(selection))
  return blocked("forged_selector","Single source-aware selection cannot be replayed");
 const contract=inspectB25Contract(ref);
 if(!contract){
  const legacy=runSelectedEncounterB24(ref,selection,input);
  return legacy.status==="ready"?{
   ...legacy,version:B25_ENCOUNTER_VERSION,
   publicationAllowed:false,productionPlayable:false
  }:legacy;
 }
 if(replay.selected_game_id!=="balance_of_values"||
    replay.recordVersionHash!==contract.contentFingerprint)
  return blocked("source_game_mismatch","Source/peer/content version does not match");
 if(!["focus,leftSlots,touched","leftSlots,touched"].includes(keys(input)))
  return blocked("forged_choice","Only a source-defined amount and optional lens may be chosen");
 const focus=input.focus??contract.editorial.lenses[0].id;
 const capacity=contract.scenario.capacity;
 if(!contract.editorial.lenses.some(x=>x.id===focus)||
    input.touched!==true||!Number.isSafeInteger(input.leftSlots)||
    input.leftSlots<0||input.leftSlots>capacity)
  return blocked("invalid_choice","Allocation or source-specific reading lens is invalid");
 const canonical={amounts:[input.leftSlots,capacity-input.leftSlots],
  budgets:[capacity],
  ...(contract.scenario.repetitions===null?{}:{repetitions:contract.scenario.repetitions})};
 const meaning=reasonSemantically(contract.context,canonical);
 if(meaning.status!=="ready"||
    meaning.meaning?.kind!==contract.meaningKind||
    meaning.source?.url!==contract.source.referenceUrl||
    meaning.sourceAdmission?.centralClaim!==contract.context.semantic.admission.centralClaim)
  return blocked("meaning_refused",meaning.reason||"No justified source-bound meaning");
 const expression=renderEncounterB25(meaning,contract,canonical,{focus});
 if(expression.status!=="ready"||
    verifyEncounterB25(meaning,contract,canonical,focus,expression).status!=="ready")
  return blocked("expression_refused",expression.reason||
   "The author-specific qualification cannot meet the founder expression policy");
 return {status:"ready",version:B25_ENCOUNTER_VERSION,
  selected_game_id:"balance_of_values",
  sourceReview:"founder_provisional_not_scholarly_verified",
  canonical_choice:canonical,meaning,emotion:expression.brief,expression,
  expressionVerification:B25_BRIDGE_VERSION,
  sourceContractFingerprint:contract.contentFingerprint,
  provenance:{
   resourceCapacity:capacity,resourceName:contract.scenario.unitName,
   amounts:[...canonical.amounts],readerAuthoredFocus:focus,
   meaningKind:contract.meaningKind,
   repetitions:contract.scenario.repetitions,
   actualPurchaseInferred:false,moralValueScoreInferred:false,
   impliedReaderPreference:false,unchosenOutcomeKnown:false
  },
  publicationAllowed:false,productionPlayable:false,
  accountPersistenceAllowed:false,
  realHumanReaderGatePassed:false,physicalSafariVoiceOverGatePassed:false
 };
}
