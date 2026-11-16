/**
 * CZ-134 B2.3 — founder-authorized ISOLATED RESEARCH six-peer successor.
 *
 * The founder replaced the INDEPENDENT qualified philosophical reviewer
 * requirement for CURRENT DEVELOPMENT, not the publication/source-text gate.
 * This is NOT a scholarly signoff, approved historical translation, public
 * source catalogue, second selectable router, or change to frozen engines.
 *
 * Research result READY means a validated six-peer game and existing
 * Reasoning -> Emotion -> Expression produced a bounded result IN A LAB.
 * It never implies public publication or a completed independent UX gate.
 */
import {createHash} from "node:crypto";
import {GAME_IDS,validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {assessAllSixPeerGames,graphPathsFromContext}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {semanticCases,semanticSources}
 from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {constructScenario,reasonSemantically,expressSemantic}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {renderEncounterV20,validateEncounterV20}
 from "../philosophy-engine/encounter/encounter-v20.js";
import {SIX_PEER_GAMES,selectMiniGameV22,runSelectedEncounterResearchV22}
 from "./yl-milestone-a-selector.mjs";
import {normalizeFuture}
 from "./yl-b1-editorial-gated-adapters.mjs";
import {KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {B2_SOURCE_PROPOSALS}
 from "./yl-b2-source-proposals.mjs";

export const B23_VERSION="founder-authorized-six-peer-research/0.1.0";
export const FOUNDER_SOURCE_POLICY=Object.freeze({
  authority:"FOUNDER_EDITORIAL_REVIEW_REPLACES_INDEPENDENT_SCHOLAR_FOR_DEVELOPMENT",
  basis:"Founder explicitly authorized this temporary review policy in conversation 2026-11-16.",
  scope:"ISOLATED_NONPUBLIC_RESEARCH_ONLY",
  verifiedEdition:false,independentlyQualifiedScholarlyApproval:false,
  quotedTranslationApprovedForPublication:false,
  positiveResearchAllowed:true,productionAllowed:false,readerStudyAllowed:false,
  physicalIphoneAccepted:false,accountPersistenceAllowed:false
});
const env=Object.freeze({isolated:true,publicVisibility:false,provisionalDisclosure:true});
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 isObject(x)?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const fingerprint=x=>"sha256:"+createHash("sha256").update(stable(x)).digest("hex");
const same=(a,b)=>stable(a)===stable(b);
const blocked=(code,reason)=>({status:"blocked",code,reason,
  publicationAllowed:false,productionPlayable:false});
const unchanged=Object.freeze([...GAME_IDS]);
const words=s=>s.trim().split(/\s+/).filter(Boolean).length;

/* New source/meaning model: two ACTUAL common hour-uses, not the frozen
 * 3-furnishing $20-token cap model. The arbitrary $20/h rate is NOT needed
 * by the authoritative reasoning kernel: it never proves a purchase or virtue.
 */
const hoursModel={
 resources:[{id:"fictional_discretionary_hours",label:"Invented hours for the week",
  min:8,max:8,type:"exact"}],
 choices:[
  {id:"paid_optional_furnishing",label:"hours of extra paid work",
   readingLabel:"extra paid work",singular:"hour of extra paid work",cost:[1],max:8},
  {id:"hours_kept",label:"hours retained for other uses",
   readingLabel:"hours kept",singular:"hour kept for other uses",cost:[1],max:8}
 ],
 unitHours:1,unitLabel:"hours",metric:{op:"sum",weights:[1,0],
  unit:"hypothetical extra work hours",singular:"hypothetical extra work hour"}
};
const hourContext=constructScenario(semanticSources.thoreau,{
 id:"thoreau:hours-exact-v1",
 scenario:"An imagined person has exactly eight discretionary hours this week and can choose extra paid work toward an optional furnishing or keep those hours for other purposes.",
 assumptions:[
  "Exactly eight discretionary hours are invented for the scenario, not observed.",
  "Every extra hour of work is assumed to earn $20 net; this is NOT a historical wage or evidence of buying anything.",
  "The two uses cost one hour each, so the total hours must remain eight."
 ],
 model:hoursModel,
 initial:{amounts:[2,6],budgets:[8]}
});
const safeContract=x=>Object.freeze({...x,
  scenario:Object.freeze(x.scenario),
  source:Object.freeze(x.source),
  proposalFingerprint:x.proposalFingerprint,
  contentFingerprint:fingerprint({
   version:x.version,recordId:x.recordId,gameId:x.gameId,source:x.source,
   scenario:x.scenario,proposalFingerprint:x.proposalFingerprint,
   meaningModelVersion:x.meaningModelVersion
  }),
  editorialAuthority:"FOUNDER_POLICY_RESEARCH_ONLY",
  independentlyScholarlyApproved:false,
  contentEditoriallyVerified:false,
  publicationAllowed:false
});
const contracts=[
 safeContract({
  recordId:"founder-research:walden-life-hours:1.0",
  version:"provisional-source-and-meaning/1.0",
  gameId:"balance_of_values",
  proposalFingerprint:B2_SOURCE_PROPOSALS[0].proposalFingerprint,
  meaningModelVersion:"thoreau-eight-hour-exact/1.0",
  source:{author:semanticSources.thoreau.author,
   work:semanticSources.thoreau.source.work,
   quote:semanticSources.thoreau.quote,
   locator:"Walden (1854), chapter I Economy; exact printed-edition signoff for publication pending",
   referenceUrl:semanticSources.thoreau.source.url,reviewState:"founder_provisional"},
  scenario:{capacity:8,costs:[1,1],unitHours:1,unit:"hour",
   choiceIds:["paid_optional_furnishing","hours_kept"],capacityMode:"exact",
   fictionalNetHourlyEarnings:20,
   nonmoral:true,unobserved:true},
  context:hourContext
 }),
 safeContract({
  recordId:"founder-research:jj167-authored:1.0",
  version:"provisional-source-and-meaning/1.0",
  gameId:"future_reveal",
  proposalFingerprint:B2_SOURCE_PROPOSALS[1].proposalFingerprint,
  meaningModelVersion:"kierkegaard-unchanged-frozen-graph/1.2",
  source:{author:semanticCases.kierkegaard.author,
   work:semanticCases.kierkegaard.source.work,
   quote:semanticCases.kierkegaard.quote,
   locator:"Journal JJ:167 (1843), SKS vol.18, p.194 original Danish; English rendering and all fictional scene wording provisional",
   referenceUrl:semanticCases.kierkegaard.source.url,
   reviewState:"founder_provisional"},
  scenario:{initialOptions:["change","stay"],viewMode:"EXPLORE_ONLY",
   stages:["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION","RETROSPECTIVE_INTERPRETATION"],
   reviewedEventsForPublication:false,actualFutureKnown:false},
  context:semanticCases.kierkegaard
 })
];
if(GAME_IDS.length!==6||!same(contracts.map(x=>x.gameId),
 ["balance_of_values","future_reveal"]))
 throw Error("One six-peer source contract not in expected registry");
export const B23_SOURCE_CONTRACTS=Object.freeze(contracts);

/* ONE peer evaluation: six explicit peers in a single ordered set.
 * Author name does NOT determine game, and a caller's self-attestation
 * cannot authorize source admission. The special research records must
 * match an internal exact fingerprint AND use the exact registered source.
 */
export const B23_SIX_PEERS=Object.freeze(SIX_PEER_GAMES.map((g,i)=>Object.freeze({
 ...g,
 sourceResearchPrototype:GAME_IDS[i]==="balance_of_values"||
  GAME_IDS[i]==="future_reveal"?true:g.browserPrototypeAvailable,
  availableOnlyWithFounderContract:["balance_of_values","future_reveal"].includes(g.id),
  productionPlayable:false
})));
function identified(input){
 if(typeof input==="string"){
  const r=contracts.find(c=>c.recordId===input);
  return r?{type:"founder",record:r}:null;
 }
 if(isObject(input)){
  const c=contracts.find(c=>c.recordId===input.recordId);
  if(c)return same(input,c)?{type:"founder",record:c}:null;
  if(validateContentRecordV21(input).status==="valid_research_record")
   return {type:"legacy",record:input};
  // A genuinely source-rejected Atlas item must remain a real no_fit, not
  // be confused with an arbitrary caller-injected forged source.
  if(input.route==="no_fit"&&selectMiniGameV22(input).status==="no_fit")
   return {type:"legacy_no_fit",record:input};
 }
 return null;
}
export function selectMiniGameB23(recordRef,{preferredGameId=null}={}){
 if(preferredGameId!==null&&!GAME_IDS.includes(preferredGameId))
  return blocked("invalid_preference","Unknown peer mini-game");
 const matched=identified(recordRef);
 if(!matched)return blocked("untrusted_source","No exact trusted research content record");
 const {type,record}=matched;
 const capabilities=type==="legacy"?
  assessAllSixPeerGames(record,GAME_IDS):
  GAME_IDS.map(id=>({id,eligible:type==="founder"&&id===record.gameId,
   reason:type==="founder"&&id===record.gameId?
    "Exact founder-scoped provisional research scenario":"Source/game mismatch"}));
 const rows=B23_SIX_PEERS.map((g,i)=>{
  const evidence=capabilities[i];
  const eligible=type==="founder"?evidence.eligible:
   type==="legacy_no_fit"?false:
   evidence.eligible&&record.gameCompatibility.some(c=>c.id===g.id&&c.eligible)&&
   !g.availableOnlyWithFounderContract&&g.executableInResearch;
  return {id:g.id,eligible,reason:eligible?"Supported by this exact research scenario":evidence.reason,
   browserPrototypeAvailable:g.sourceResearchPrototype,productionPlayable:false};
 });
 const selected=preferredGameId?rows.find(r=>r.id===preferredGameId&&r.eligible):
  rows.find(r=>r.eligible);
 if(!selected)return {status:"no_fit",version:B23_VERSION,
  selection_trace:{evaluatedPeerIds:[...GAME_IDS],rows},
  publicationAllowed:false};
 return {status:"research_selected",version:B23_VERSION,
  recordId:type==="founder"?record.recordId:record.id,
  recordVersionHash:type==="founder"?record.contentFingerprint:record.versionHash,
  preferredGameId,selected_game_id:selected.id,
  sourceReview:type==="founder"?"founder_provisional_not_scholar_verified":"curated_provisional",
  selection_trace:{evaluatedPeerIds:[...GAME_IDS],rows},
  publicationAllowed:false,productionPlayable:false};
}
export function runSelectedEncounterB23(recordRef,selection,input){
 const matched=identified(recordRef);
 if(!matched||!isObject(selection)||!isObject(input))
  return blocked("invalid_request","Untrusted source or selection");
 const replay=selectMiniGameB23(recordRef,{preferredGameId:selection.preferredGameId});
 if(replay.status!=="research_selected"||!same(replay,selection))
  return blocked("forged_selector","Selection trace must be replayable from source");
 const gameId=replay.selected_game_id;
 if(matched.type==="legacy"){
  const legacySelection=selectMiniGameV22(matched.record,
   {mode:"prototype",preferredGameId:gameId});
  if(legacySelection.status!=="research_selected"||
     legacySelection.selected_game_id!==gameId)
   return blocked("legacy_selection_refused","Original four game authority abstained");
  const legacy=runSelectedEncounterResearchV22(matched.record,legacySelection,
   {gameId,...input},env);
  return legacy.status==="ready"?
   {...legacy,version:B23_VERSION,sourceReview:"curated_provisional",publicationAllowed:false}:
   blocked("legacy_engine_abstained",legacy.reason||legacy.status);
 }
 const contract=matched.record;
 if(gameId!==contract.gameId)return blocked("source_game_mismatch","Wrong source mini-game");
 if(contract.gameId==="balance_of_values"){
  if(!same(Object.keys(input).sort(),["leftSlots","touched"])||
     input.touched!==true||!Number.isSafeInteger(input.leftSlots)||
     input.leftSlots<0||input.leftSlots>contract.scenario.capacity)
   return blocked("invalid_allocation","Only an intentional whole-hour 0..8 allocation is permitted");
 }else if(!same(Object.keys(input),["actions"])||!Array.isArray(input.actions))
  return blocked("invalid_timeline","Only exact typed stage actions are permitted");
 let canonical,provenance;
 if(gameId==="balance_of_values"){
  canonical={amounts:[input.leftSlots,8-input.leftSlots],budgets:[8]};
  provenance={authoritativeResource:"fictional_discretionary_hours",
   exactConservation:true,fictionalHourlyWage:20,actualPurchaseInferred:false};
 }else{
  /* Only source-owned graph event IDs; stage 2 is not a user causal choice.
   * This normalization checks revisions, locked stages and all eight routes.
   */
  const normalized=normalizeFuture(KIERKEGAARD_V21,input.actions);
  if(normalized.status!=="normalized")
   return blocked(normalized.code||"invalid_timeline",normalized.reason);
  canonical={path:normalized.canonical.path};
  provenance=normalized.provenance;
 }
 const meaning=reasonSemantically(contract.context,canonical);
 if(meaning.status!=="ready"||
   meaning.source?.url!==contract.source.referenceUrl||
   meaning.author!==contract.source.author||
   meaning.sourceAdmission?.independentlySourceVerified!==false)
  return blocked("meaning_refused",meaning.reason||"Frozen reasoning source mismatch");
 let expression=null;
 let expressionVerification="frozen_v20";
 const attempted=[];
 for(const tone of [undefined,"reflective","warm","contemplative","challenging"]){
  const r=tone?renderEncounterV20(meaning,{tone}):renderEncounterV20(meaning);
  const validity=r.status==="ready"?validateEncounterV20(meaning,r):null;
  attempted.push({tone:tone||"auto",status:r.status,reason:r.reason||null,
   wordCount:r.wordCount??null,validity:validity?.status||null});
  if(r.status!=="ready"||validity?.status!=="ready")continue;
  if(r.wordCount<80||r.wordCount>120||r.sections?.length!==3)continue;
  expression=r;break;
 }
 if(!expression&&gameId==="balance_of_values"&&meaning.meaning?.kind==="conversion"){
  // The frozen v2.0 composer explicitly excludes source conversion and must
  // remain unchanged. Reuse the *existing frozen v1.2 semantic expression*
  // only as a clearly distinguished research path, not a fake v2.0 PASS.
  const legacy=expressSemantic(meaning,"reflective");
  attempted.push({tone:"semantic_v12_reflective",status:legacy?.status||"no_result",
   reason:legacy?.reason||null,wordCount:legacy?.wordCount||null});
  if(legacy?.status==="ready"){
   const sections=[
    {label:"Your Choice",text:legacy.headline+" "+legacy.experience},
    {label:"Back to the Philosopher",text:legacy.interpretation},
    {label:"One Last Thing…",text:legacy.proactiveQuestion}
   ];
   if(sections.reduce((n,x)=>n+words(x.text),0)===legacy.wordCount){
    expression={status:"ready",version:"semantic-expression/1.2",
     wordCount:legacy.wordCount,sections,
     brief:{strategy:"reflective",version:"semantic-mode/1.2",
      v20Verified:false}};
    expressionVerification="frozen_v12_semantic_not_v20";
   }
  }
 }
 if(!expression)return blocked("expression_abstained",
  "Frozen Expression refuses this source: "+JSON.stringify(attempted));
 return {status:"ready",version:B23_VERSION,selected_game_id:gameId,
  sourceReview:"founder_policy_research_not_scholarly_verified",
  sourceEditorialApproval:"founder_authorized_development_only",
  sourceContractFingerprint:contract.contentFingerprint,
  proposalFingerprint:contract.proposalFingerprint,
  canonical_choice:canonical,meaning,emotion:expression.brief,expression,
  expressionVerification,provenance,publicationAllowed:false,productionPlayable:false,
  realHumanReaderGatePassed:false,physicalSafariVoiceOverGatePassed:false,
  accountPersistenceAllowed:false,
  stages:["ONE mini-game selection","User interaction","Reasoning","Emotion","Expression"]
 };
}
