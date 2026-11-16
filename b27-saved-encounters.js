/**
 * B2.7 save inside existing app-owned data + persist()/load() boundary.
 * NO independent localStorage key, no automatic quote Like or cloud sync.
 */
export const ENCOUNTER_SAVE_VERSION="app-owned-finished-encounter/2.7.0";
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 isObj(x)?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const fail=(code,reason)=>({status:"not_saved",code,reason});
export function saveFinishedEncounter(state,completed,{persist,readback,clock=()=>new Date().toISOString()}={}){
 if(!isObj(state)||!isObj(completed)||
   completed.status!=="ready"||!isObj(completed.compact)||
   completed.compact.sections?.length!==3||
   !isObj(completed.canonical_choice)||
   !Number.isSafeInteger(completed.quoteId)||
   typeof completed.quoteFingerprint!=="string"||
   typeof completed.sourceVersionHash!=="string"||
   typeof completed.saveKey!=="string"||
   typeof persist!=="function"||typeof readback!=="function")
  return fail("invalid_completion","Only a verified completed Encounter may be kept");
 const originals=Array.isArray(state.savedEncounters)?state.savedEncounters:[];
 const existing=originals.find(x=>x?.saveKey===completed.saveKey);
 if(existing){
  const read=readback()?.savedEncounters;
  return Array.isArray(read)&&read.some(x=>x.saveKey===existing.saveKey&&
   stable(x.canonicalChoice)===stable(existing.canonicalChoice))?
   {status:"saved",id:existing.saveKey,alreadyExisted:true,record:existing}:
   fail("readback_not_verified","An existing Encounter was not confirmed from app storage");
 }
 const record={
  version:ENCOUNTER_SAVE_VERSION,
  saveKey:completed.saveKey,
  quoteId:completed.quoteId,
  quoteFingerprint:completed.quoteFingerprint,
  sourceRecordId:completed.sourceRecordId,
  sourceVersionHash:completed.sourceVersionHash,
  selectedFamilyId:completed.selectedFamilyId,
  canonicalChoice:structuredClone(completed.canonical_choice),
  compact:structuredClone(completed.compact),
  fullExpression:structuredClone(completed.fullExpression),
  fullMeaning:structuredClone(completed.fullMeaning),
  sourceReview:completed.sourceReview,
  uncertainty:completed.uncertainty,
  provenance:structuredClone(completed.provenance??{}),
  savedAt:clock(),
  locallySaved:true,cloudSynchronized:false
 };
 if(!record.sourceRecordId||!record.fullExpression?.sections?.length||
    record.fullExpression.sections.length!==3)
  return fail("incomplete_source","Full meaning, source and expression must be retained");
 const previous=state.savedEncounters;
 state.savedEncounters=[...originals.slice(-199),record];
 try{
  persist();
  const read=readback()?.savedEncounters;
  const match=Array.isArray(read)?read.find(x=>x?.saveKey===record.saveKey):null;
  if(!match||stable(match.canonicalChoice)!==stable(record.canonicalChoice)||
   match.sourceVersionHash!==record.sourceVersionHash||
   match.quoteFingerprint!==record.quoteFingerprint||
   stable(match.fullExpression)!==stable(record.fullExpression))
   throw new Error("Missing or changed saved Encounter after readback");
  return {status:"saved",id:record.saveKey,alreadyExisted:false,record:match};
 }catch(e){
  state.savedEncounters=previous;
  try{persist()}catch{}
  return fail("readback_failed","The completed Encounter could not be confirmed in app storage");
 }
}
export function deleteSavedEncounter(state,id,{persist,readback}={}){
 if(!isObj(state)||typeof id!=="string"||
   typeof persist!=="function"||typeof readback!=="function")return fail("bad_request","Invalid deletion");
 const old=Array.isArray(state.savedEncounters)?state.savedEncounters:[];
 if(!old.some(x=>x?.saveKey===id))return fail("not_found","No such saved Encounter");
 const prev=state.savedEncounters;
 state.savedEncounters=old.filter(x=>x?.saveKey!==id);
 try{
  persist();
  if(readback()?.savedEncounters?.some(x=>x?.saveKey===id))
   throw Error("Deletion readback failed");
  return {status:"deleted",id};
 }catch{
  state.savedEncounters=prev;
  try{persist()}catch{}
  return fail("delete_failed","Could not confirm removal from My World");
 }
}
export function validatedSavedEncounters(value){
 return Array.isArray(value)?value.filter(x=>isObj(x)&&
   x.version===ENCOUNTER_SAVE_VERSION&&
   typeof x.saveKey==="string"&&x.saveKey.startsWith("sha256:")&&
   Number.isSafeInteger(x.quoteId)&&x.quoteId>=0&&
   typeof x.sourceVersionHash==="string"&&
   isObj(x.canonicalChoice)&&x.compact?.sections?.length===3&&
   x.fullExpression?.sections?.length===3&&
   x.locallySaved===true).slice(-200):[];
}
