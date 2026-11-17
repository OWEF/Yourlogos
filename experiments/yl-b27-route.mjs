/**
 * CZ-145 trusted quote->source->single FOUR-family selector->reason/compact.
 * Never routes by philosopher names, themes, or client-supplied family.
 * All 91 existing quote IDs are immutable; new source excerpts 91–94
 * are opt-in development-only material behind ?b27=1 in app.js.
 */
import {B27_APP_QUOTES,B27_INHERITED_COUNT}
 from "./yl-b27-quote-ledger.mjs";
import {fingerprintB25} from "./yl-b25-authored-scenarios.mjs";
import {catalogueB26}
 from "./yl-b26-preview-server.mjs";
import {B25_BALANCE_CONTRACTS}
 from "./yl-b25-authored-scenarios.mjs";
import {DILLARD_V21,KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {PAIR_SOURCE_RECORDS}
 from "./yl-b26-relations.mjs";
import {assessInteractionFamiliesB26}
 from "./yl-b26-four-family-contract.mjs";
import {runFourFamilyEncounterB26}
 from "./yl-b26-encounter.mjs";
import {SMITH_HUMAN_CONTRACT,runSmithHumanEncounter}
 from "./yl-b27-human-content.mjs";
import {B27_KIERKEGAARD_HINDSIGHT,replayB27HindsightBase}
 from "./yl-b27-future-source.mjs";
import {compactEncounterB27}
 from "./yl-b27-compact.mjs";
import {editorialB27,reportB27Coverage} from "./yl-b27-editorial-ledger.mjs";
import {makeUniversalRegistry} from "./yl-cz147-engines.mjs";
import {CZ147_SOURCE_RECORDS} from "./yl-cz147-sources.mjs";
export {reportB27Coverage} from "./yl-b27-editorial-ledger.mjs";
export const B27_ROUTE_VERSION="quote-direct-source-bound/2.7.0";
const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const keyRef=Object.freeze({
 dillard:DILLARD_V21,
 kierkegaard_map:KIERKEGAARD_V21,
 thoreau_weekend:B25_BALANCE_CONTRACTS[1].recordId,
 epictetus_relations:PAIR_SOURCE_RECORDS[0].recordId,
 smith_human:SMITH_HUMAN_CONTRACT.recordId,
 kierkegaard_hindsight:B27_KIERKEGAARD_HINDSIGHT.recordId
});
const old=catalogueB26();
// The accepted B2.7 sources retain their exact historical path. Only newly
// admitted provisional quotations enter the shared three-engine registry.
// A compatible source needs DATA, never a new author-specific engine branch.
const generalized=makeUniversalRegistry(
 CZ147_SOURCE_RECORDS.filter(r=>r.exposeInApp),B27_APP_QUOTES);
export const CZ147_APP_ADMITTED_IDS=Object.freeze([...generalized.ids]);
const block=(code,reason)=>({status:"blocked",code,reason,
 publicationAllowed:false,productionPlayable:false});
const sourceReasoning=Object.freeze({
 dillard:{
  humanTension:"How to spend limited time without treating one activity as morally superior.",
  sourceThesis:"How repeated days can form a pattern of living.",
  sourceWarrantIds:["source:central","allocation:repetition"],
  epistemicLimits:"These repeated evenings are fictional, not your real habits.",
  readerAgency:"Allocate six half-hour slots among three ordinary uses of time."
 },
 kierkegaard_map:{
  humanTension:"The safety of staying versus an unknown possibility after changing work.",
  sourceThesis:"One must choose before later understanding; the unchosen path stays unknown.",
  sourceWarrantIds:["source:central","route:authored"],
  epistemicLimits:"Future developments are written possibilities, not predicted consequences.",
  readerAgency:"Make an initial choice and then respond to a fictional later development."
 },
 thoreau_weekend:{
  humanTension:"Earn an imagined extra amount or keep hours open for other possibilities.",
  sourceThesis:"A monetary option also involves an exchange of finite living time.",
  sourceWarrantIds:["source:central","allocation:resource"],
  epistemicLimits:"The pay and available hours are invented and cannot rank your values.",
  readerAgency:"Allocate fictional hours and choose what aspect of the exchange to notice."
 },
 epictetus_relations:{
  humanTension:"You may control offering an apology, but cannot require someone else to forgive.",
  sourceThesis:"The limits of agency distinguish chosen action from external outcome.",
  sourceWarrantIds:["source:central","relation:authored"],
  epistemicLimits:"This illustration does not establish actual forgiveness or someone's character.",
  readerAgency:"Connect the action to the external outcome it cannot determine."
 }
});
function trustedQuoteInput(input){
 if(!obj(input)||!Number.isSafeInteger(input.quoteId))return null;
 const quote=B27_APP_QUOTES[input.quoteId];
 if(!quote||input.quoteText!==quote[0]||
   input.quoteAuthor!==quote[1]||input.quoteWork!==quote[3])return null;
 return quote;
}
export function resolveQuoteB27(input){
 if(generalized.ids.includes(input?.quoteId))return generalized.resolve(input);
 const quote=trustedQuoteInput(input);
 if(!quote)return block("quote_identity_mismatch",
  "An exact existing quotation ID, text, author and source is required");
 const {quoteId}=input;
 const quoteFingerprint=fingerprintB25({quoteId,quote});
 const editorial=editorialB27(quoteId);
 const key=editorial?.status==="playable"?editorial.key:null;
 if(!key){
  // Absent or unadmitted editorial evidence is never interpreted as a game.
  // The reader sees a truthful reading-first path, not a disguised quiz.
  const coverage=editorial?.status??"reading_first";
  return {
   status:"no_fit",version:B27_ROUTE_VERSION,quoteId,
   quoteFingerprint,quote:{text:quote[0],author:quote[1],
    work:quote[3],question:quote[4]},
   sourceReview:editorial?.sourceStatus??"catalogue_source_not_admitted_for_game",
   editorialCoverageStatus:coverage,
   reason:coverage==="no_fit"?
    "This thesis requires an operation the four tactile families cannot faithfully express. A source-critical reading comes first.":
    coverage==="awaiting_reasoning_capability"?
    "This source needs a missing philosophical reasoning capability; no surrogate puzzle is admissible.":
    coverage==="awaiting_source_review"?
    "Candidate human adaptations remain unverified against the exact source and edition.":
    "No versioned source-warranted four-family interaction has been admitted for this exact quotation.",
   capabilityGap:editorial?.gap??"source_specific_semantic_admission",
   readingFirst:true,publicationAllowed:false,productionPlayable:false
  };
 }
 if(quoteId>=B27_INHERITED_COUNT&&!input.b27DevelopmentOnly)
  return block("provisional_quote_not_public",
   "A new provisional source excerpt requires an explicitly isolated development journey");
 let scenario,selection,sourceRef;
 if(key==="kierkegaard_hindsight"){
  const c=B27_KIERKEGAARD_HINDSIGHT,original=replayB27HindsightBase();
  if(!original)return block("translation_ancestry_failed",
   "The original JJ:167 reasoning contract cannot be authenticated");
  const auth=assessInteractionFamiliesB26(original.recordId);
  const candidate=old.find(x=>x.key==="kierkegaard_future");
  if(auth.status!=="research_selected"||auth.selectedFamilyId!=="flip_reveal"||
     candidate?.familyId!=="flip_reveal")return block("source_warrant_rejected",
      "The source-authored fictional timeline is not eligible");
  scenario={...candidate,key,sourceStatus:"research_selected",
   title:c.scenario.title,intro:c.scenario.description,
   author:c.source.author,work:c.source.work,
   quote:c.source.quote,sourceUrl:c.source.referenceUrl,
   sourceFingerprint:c.contentFingerprint,
   sourceReview:"founder_provisional_development_only",
   sourceThesis:c.centralThesis,humanTension:c.humanTension,
   epistemicLimits:c.scenario.assumptions.join(" "),
   sourceWarrantIds:["source:central","timeline:authored","source:boundary"],
   readerAgency:c.scenario.readerAgency,
   sourceTranslationBridge:c.sourceRelation};
  sourceRef=c.recordId;
  selection={status:"research_selected",selectedFamilyId:"flip_reveal",
    sourceRecordId:c.recordId,sourceVersionHash:c.contentFingerprint};
 }else if(key==="smith_human"){
  const c=SMITH_HUMAN_CONTRACT;
  const authorized=assessInteractionFamiliesB26(PAIR_SOURCE_RECORDS[1].recordId);
  if(authorized.status!=="research_selected"||
     authorized.selectedFamilyId!=="tap_pair")
   return block("source_warrant_rejected","Underlying Smith relation operator did not pass");
  scenario={
   key,sourceStatus:"research_selected",familyId:"tap_pair",
   familyLabel:"Tap & Pair",title:"A gift due tomorrow",
   intro:c.scenario.description,author:c.source.author,
   work:c.source.work,quote:c.source.quote,sourceUrl:c.source.referenceUrl,
   sourceFingerprint:c.contentFingerprint,
   allocation:null,timeline:null,relation:{
    cards:c.cards.map(x=>({...x})),
    edges:c.edges.map(({aId,bId,relationId,label})=>({aId,bId,relationId,label})),
    maximumPairs:2,minimumPairs:1,noCorrectMatch:true
   },
   sourceReview:"founder_provisional_development_only",
   ...{sourceThesis:c.sourceThesis,humanTension:c.humanTension,
    epistemicLimits:c.warrant.limitations,
    sourceWarrantIds:c.sourceWarrantIds,
    readerAgency:"Connect two contributions to an imagined shared birthday gift."}
  };
  sourceRef=c.recordId;
  selection={status:"research_selected",selectedFamilyId:"tap_pair",
   sourceRecordId:c.recordId,sourceVersionHash:c.contentFingerprint};
 }else{
  scenario=old.find(x=>x.key===key);
  if(!scenario)return block("source_missing","An exact source-specific scenario is unavailable");
  sourceRef=keyRef[key];
  selection=assessInteractionFamiliesB26(sourceRef);
  if(selection.status!=="research_selected"||
     selection.selectedFamilyId!==scenario.familyId||
     selection.sourceVersionHash!==scenario.sourceFingerprint)
   return block("source_ineligible","Quote's canonical source and selection did not replay");
  scenario={...scenario,...sourceReasoning[key]};
 }
 if(scenario.quote!==quote[0]||scenario.author!==quote[1])
  return block("source_quote_divergence","The research excerpt does not match the clicked quotation");
 return {
  status:"ready",version:B27_ROUTE_VERSION,quoteId,
  quoteFingerprint,quote:{text:quote[0],author:quote[1],
   work:quote[3],question:quote[4]},
  selectedFamilyId:selection.selectedFamilyId,
  sourceRecordId:selection.sourceRecordId??sourceRef,
  sourceVersionHash:selection.sourceVersionHash,
  record:{...scenario,
   key,sourceFingerprint:selection.sourceVersionHash,
   publicationAllowed:false},
  sourceReview:"founder_provisional_development_only",
  publicationAllowed:false,productionPlayable:false
 };
}
export function runQuoteEncounterB27(request){
 if(generalized.ids.includes(request?.quoteId))return generalized.run(request);
 if(!obj(request)||!obj(request.canonicalInput)||
    !Number.isSafeInteger(request.quoteId)||
    typeof request.sourceVersionHash!=="string"||
    ![true,false,undefined].includes(request.b27DevelopmentOnly))
  return block("bad_input","Typed exact quotation and canonical game input required");
 const permitted=resolveQuoteB27(request);
 if(permitted.status!=="ready")return permitted;
 if(permitted.sourceVersionHash!==request.sourceVersionHash)
  return block("stale_source","The selected source version has changed; restart Discover");
 let full;
 const key=permitted.record.key;
 if(key==="smith_human"){
  full=runSmithHumanEncounter(SMITH_HUMAN_CONTRACT,request.canonicalInput);
 }else if(key==="kierkegaard_hindsight"){
  const original=replayB27HindsightBase();
  if(!original)return block("source_translation_bridge_failed",
   "Original journal source record cannot be replayed");
  full=runFourFamilyEncounterB26(original.recordId,
   assessInteractionFamiliesB26(original.recordId),request.canonicalInput);
  if(full.status!=="ready")return full;
  if(full.sourceVersionHash!==original.contentFingerprint||
     permitted.record.sourceTranslationBridge.originalSourceRecordId!==original.recordId)
   return block("source_translation_bridge_failed","The two JJ:167 renderings cannot be shown to share an authenticated source");
 }else{
  const ref=keyRef[key],selection=assessInteractionFamiliesB26(ref);
  full=runFourFamilyEncounterB26(ref,selection,request.canonicalInput);
 }
 if(full.status!=="ready")return full;
 if(full.selectedFamilyId!==permitted.selectedFamilyId||
    (key!=="kierkegaard_hindsight"&&
     full.sourceVersionHash!==permitted.sourceVersionHash))
  return block("semantic_replay_mismatch","A full authoritative Encounter could not be replayed");
 const compact=compactEncounterB27(permitted.record,full);
 if(compact.status!=="ready")return compact;
 return {
  status:"ready",version:B27_ROUTE_VERSION,
  saveKey:fingerprintB25({quoteFingerprint:permitted.quoteFingerprint,
   sourceVersionHash:permitted.sourceVersionHash,
   selectedFamilyId:full.selectedFamilyId,
   canonicalChoice:full.canonical_choice}),
  quoteId:permitted.quoteId,quoteFingerprint:permitted.quoteFingerprint,
  sourceRecordId:permitted.sourceRecordId,
  sourceVersionHash:permitted.sourceVersionHash,
  selectedFamilyId:full.selectedFamilyId,
  canonical_choice:full.canonical_choice,
  fullExpression:full.expression,fullMeaning:full.meaning,
  emotion:full.emotion,compact,
  provenance:{...full.provenance,
    ...(key==="kierkegaard_hindsight"?{
     unchangedMeaningSourceVersionHash:full.sourceVersionHash,
     alternateEnglishExcerptBindsSameJournal:"JJ:167",
     sourceTranslationIdentityNotClaimed:true}: {})
   },uncertainty:
   permitted.record.epistemicLimits??full.meaning?.meaning?.limitations??null,
  sourceReview:"founder_provisional_development_only",
  publicationAllowed:false,productionPlayable:false,
  accountSaved:false
 };
}
