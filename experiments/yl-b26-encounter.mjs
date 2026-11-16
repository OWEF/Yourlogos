/**
 * CZ-141 B2.6 ONE four-family execution boundary over exact source records.
 * The existing six internal operations remain private, frozen, unmodified.
 */
import {assessInteractionFamiliesB26,INTERACTION_FAMILIES}
 from "./yl-b26-four-family-contract.mjs";
import {inspectPairSource,runPairEncounterB26}
 from "./yl-b26-relations.mjs";
import {selectMiniGameB25,runSelectedEncounterB25}
 from "./yl-b25-encounter.mjs";
import {B25_BALANCE_CONTRACTS,inspectB25Contract}
 from "./yl-b25-authored-scenarios.mjs";
import {DILLARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
export const B26_ENCOUNTER_VERSION="four-source-driven-tactile-families/2.6.0";
const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 obj(x)?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const deny=(code,reason)=>({status:"blocked",code,reason,
 publicationAllowed:false,productionPlayable:false});
const keys=x=>Object.keys(x).sort().join(",");
export function selectFourFamiliesB26(ref,{preferredFamilyId=null}={}){
 return assessInteractionFamiliesB26(ref,{preferredFamilyId});
}
/** Source-invariant shared resource packet; accepts unused capacity only if
 * an accepted model resource explicitly has type "cap".
 */
function validateAllocation(input,ref){
 if(!obj(input)||!Array.isArray(input.amounts)||!Array.isArray(input.budgets)||
    input.budgets.length!==1||input.touched!==true||
    input.amounts.some(n=>!Number.isSafeInteger(n)||n<0)||
    !Number.isSafeInteger(input.budgets[0]))
   return null;
 const authored=inspectB25Contract(ref),legacy=ref===DILLARD_V21;
 if(!authored&&!legacy)return null;
 const model=authored?.context?.model??null;
 const capacity=authored?.scenario.capacity??ref.scenario.constraints.capacity;
 const costs=model?.choices?.map(x=>x.cost[0])??ref.scenario.constraints.costs;
 const exact=model?.resources[0]?.type==="exact"||
   (legacy&&ref.scenario.constraints.kind==="finite_budget");
 if(input.budgets[0]!==capacity||input.amounts.length!==costs.length||
    input.amounts.some((n,i)=>model&&n>model.choices[i].max))
   return null;
 const used=input.amounts.reduce((n,v,i)=>n+v*costs[i],0);
 if(!Number.isSafeInteger(used)||used>capacity||(exact&&used!==capacity))
   return null;
 if(authored){
  if(keys(input)!=="amounts,budgets,focus,touched"&&
     keys(input)!=="amounts,budgets,touched")return null;
  if(typeof input.focus!=="undefined"&&
     !authored.editorial.lenses.some(x=>x.id===input.focus))return null;
  return {canonical:{amounts:[...input.amounts],budgets:[capacity],
   ...(authored.scenario.repetitions===null?{}:
     {repetitions:authored.scenario.repetitions})},
   legacyInput:{leftSlots:input.amounts[0],touched:true,
    focus:input.focus??authored.editorial.lenses[0].id},
   spent:used,unusedCapacity:capacity-used,resourceType:model.resources[0].type};
 }
 if(keys(input)!=="amounts,budgets,repetitions,touched"||
    input.repetitions!==ref.scenario.constraints.repetitions)
  return null;
 return {canonical:{amounts:[...input.amounts],budgets:[capacity],
   repetitions:input.repetitions},
  legacyInput:{amounts:[...input.amounts],repetitions:input.repetitions},
  spent:used,unusedCapacity:capacity-used,resourceType:"exact"};
}
export function runFourFamilyEncounterB26(ref,selection,input){
 if(!obj(selection)||!obj(input))return deny("untyped","Source selection and typed canonical choice required");
 const family=selection.selectedFamilyId;
 if(!INTERACTION_FAMILIES.includes(family))
  return deny("invalid_family","Only the registered four families can be selected");
 const replay=assessInteractionFamiliesB26(ref,{preferredFamilyId:family});
 if(replay.status!=="research_selected"||
    stable({...replay,selectedFamilyId:null})!==
    stable({...selection,selectedFamilyId:null}))
  return deny("selection_forgery","The source cannot authorize or replay this selected family");
 let result,canonical,provenance={};
 if(family==="tap_pair"){
  if(!inspectPairSource(ref))return deny("source_relation_refused","Missing reviewed provisional relationship record");
  result=runPairEncounterB26(ref,input);
  canonical=result.canonical_choice??null;
  provenance={relationOperation:"source_warranted_relation",
   sourceOwnedAuthoredEdges:true,hiddenCorrectAnswer:false,
   inferredMoralScore:false};
 }else if(family==="balance_move"){
  const valid=validateAllocation(input,ref);
  if(!valid)return deny("allocation_refused","Resource conservation or source contract failed");
  const old=selectMiniGameB25(ref,{preferredGameId:selection.internalLegacyGameId});
  if(old.status!=="research_selected"||
     old.recordVersionHash!==selection.sourceVersionHash)
    return deny("source_refused","Legacy meaning operation is not authorized for this source");
  result=runSelectedEncounterB25(ref,old,valid.legacyInput);
  canonical=valid.canonical;
  if(result.status==="ready"&&
    stable(result.canonical_choice)!==stable(canonical))
    return deny("canonical_parity","Slider and movable pieces must replay one authoritative choice");
  provenance={spent:valid.spent,unusedCapacity:valid.unusedCapacity,
   resourceType:valid.resourceType,
   conserved:valid.unusedCapacity===0,
   choiceInputMethodNotSemantic:true};
 }else if(family==="decision_cards"){
  if(keys(input)!=="path"||!Array.isArray(input.path)||
    input.path.length!==3||input.path.some(x=>typeof x!=="string"))
   return deny("decision_input_refused","A typed three-stage decision path is required");
  const old=selectMiniGameB25(ref,{preferredGameId:selection.internalLegacyGameId});
  result=runSelectedEncounterB25(ref,old,input);
  canonical=result.canonical_choice??{path:[...input.path]};
 }else{
  if(keys(input)!=="actions"||!Array.isArray(input.actions))
   return deny("reveal_input_refused","Only the typed authored four-stage reveal is permitted");
  const old=selectMiniGameB25(ref,{preferredGameId:selection.internalLegacyGameId});
  result=runSelectedEncounterB25(ref,old,input);
  canonical=result.canonical_choice??null;
  provenance={sourceOwnedAuthoredPossibilities:true,actualFuturePredicted:false,
    authoredEventCausedByReader:false,unchosenFutureKnown:false};
 }
 if(result.status!=="ready")return result;
 const output=result.expression;
 if(!output||output.status!=="ready"||output.sections?.length!==3||
    !["Your Choice","Back to the Philosopher","One Last Thing…"].every(
      (label,i)=>output.sections[i].label===label))
  return deny("expression_refused","Exactly three sourced philosophical sections required");
 const count=text=>text.trim().split(/\s+/).filter(Boolean).length;
 const n=output.sections.map(x=>count(x.text)),total=n.reduce((a,b)=>a+b,0);
 if(total!==output.wordCount||total<80||total>120||
    n.some((v,i)=>v<[10,18,9][i]||v>[48,65,26][i]))
  return deny("expression_policy_refused","The source-bound word and section policy failed");
 return {status:"ready",version:B26_ENCOUNTER_VERSION,
  selectedFamilyId:family,sourceRecordId:selection.sourceRecordId,
  sourceVersionHash:selection.sourceVersionHash,
  canonical_choice:canonical,
  meaning:result.meaning,emotion:result.emotion,
  expression:output,
  expressionVerification:result.expressionVerification??"source_warranted_relations_v26",
  provenance:{...result.provenance,...provenance},
  sourceReview:"founder_provisional_not_scholarly_verified",
  publicationAllowed:false,productionPlayable:false,
  accountPersistenceAllowed:false};
}
