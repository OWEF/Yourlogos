/**
 * CZ-131 — ONE six-peer mini-game selector (research-only, NOT a public router).
 *
 * A source's independently admitted content and authored model remain the
 * authority. This module evaluates ALL six games in ONE pass; no philosopher
 * names, quote keywords or preliminary mechanism route select the game.
 *
 * The existing v2.1.2 content contract, frozen v2.0 engines, Token Studio
 * and Swipe Decision browser prototypes are not modified by this module.
 */
import {GAME_IDS,validateContentRecordV21,validateChoiceV21,
  canRunIsolatedResearchV21,canPublishEncounterV21}
 from "./content-contract-v21.js";
import {assessAllSixPeerGames,authoritativeContextForRecord}
 from "./content-capabilities-v211.js";
import {reasonSemantically} from "../encounter/semantic-reasoning-v12.js";
import {renderSourceGroundedResearchV211,validateSourceGroundedResearchV211}
 from "./source-grounded-composer-v211.js";

export const SELECTION_VERSION="single-six-peer-selection/2.1.0";
const research="research_adapter";
const prototype="isolated_browser_prototype";
const unavailable="not_implemented";
const def=(id,label,capability,requiredFields,choiceSchema,operations,contraindications,
            accessibilityFallback,implementationStatus)=>Object.freeze({
 id,label,capability,requiredFields,choiceSchema,allowedReasoningOperations:operations,
 contraindications,accessibilityFallback,implementationStatus,
 // 'prototype' means only an isolated research HTML artifact, NOT production.
 executableInResearch:implementationStatus!==unavailable,
 browserPrototypeAvailable:implementationStatus===prototype,
 productionPlayable:false,
 editorialStatus:"research_only"
});
export const SIX_PEER_GAMES=Object.freeze([
 def("trade_off","Trade-Off","finite_budget",
  ["scenario.constraints.capacity","scenario.constraints.costs","scenario.choices","argument.sourceWarrant"],
  "canonical_allocation",["tradeoff"],
  ["No independently warranted shared finite resource","Do not infer moral scores or lived behaviour"],
  "Research form/keyboard contract; no product UI supplied in this stage",research),
 def("decision_map","Decision Map","authored_branch",
  ["scenario.constraints.routes","scenario.choices","argument.uncertaintyLimit"],
  "canonical_terminal_path",["decision_map"],
  ["No complete trusted decision graph","Do not present authored external events as decisions"],
  "Research step-description only; no product UI supplied in this stage",research),
 def("token_studio","Token Studio","finite_equal_cost_tokens",
  ["scenario.constraints.capacity","scenario.constraints.unitHours","scenario.constraints.costs"],
  "canonical_allocation",["tradeoff"],
  ["Unequal token costs","No warranted uniform slot or finite capacity"],
  "Draft browser buttons accompany gestures; screen-reader acceptance remains unverified",prototype),
 def("balance_of_values","Balance of Values","commensurable_value_scale",
  ["argument.sourceWarrant","scenario.variables","scenario.choices"],
  "unimplemented",["tradeoff","decision_map"],
  ["Do not invent moral commensurability","No independently approved value scale"],
  "Unimplemented: no accessible or playable interaction",unavailable),
 def("swipe_decision","Swipe Decision","decision_external_development_decision",
  ["scenario.constraints.routes","scenario.choices","scenario.consequences.unknowns"],
  "canonical_terminal_path",["decision_map"],
  ["Must distinguish authored development from user action","No forecast of unchosen future"],
  "Draft button alternatives to swipe; actual physical iPhone/VoiceOver not verified",prototype),
 def("future_reveal","Future Reveal","authored_hypothetical_milestones",
  ["scenario.constraints.routes","scenario.consequences.unknowns"],
  "unimplemented",["decision_map"],
  ["No independently source-authorized dated branches","No predictions of personal future"],
  "Unimplemented: no accessible or playable interaction",unavailable)
]);
if(GAME_IDS.length!==SIX_PEER_GAMES.length||
  SIX_PEER_GAMES.some((g,i)=>g.id!==GAME_IDS[i]))
 throw Error("The selector's six peers are out of sync with the accepted content contract.");

const plain=x=>x&&typeof x==="object"&&!Array.isArray(x);
const clone=x=>JSON.parse(JSON.stringify(x));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function normalizedRequest(options){
 if(options===undefined)return {mode:"research",preferredGameId:null,
  accessibility:{screenReaderRequired:false,reducedMotionRequired:false}};
 if(!plain(options)||Object.keys(options).some(k=>
    !["mode","preferredGameId","accessibility"].includes(k)))return null;
 const mode=options.mode??"research";
 const preferredGameId=options.preferredGameId??null;
 const accessibility=options.accessibility??{};
 if(!["research","prototype"].includes(mode)||
  !(preferredGameId===null||GAME_IDS.includes(preferredGameId))||
  !plain(accessibility)||Object.keys(accessibility).some(k=>
    !["screenReaderRequired","reducedMotionRequired"].includes(k))||
  ["screenReaderRequired","reducedMotionRequired"].some(k=>
    accessibility[k]!==undefined&&typeof accessibility[k]!=="boolean"))
  return null;
 return {mode,preferredGameId,accessibility:{
  screenReaderRequired:accessibility.screenReaderRequired===true,
  reducedMotionRequired:accessibility.reducedMotionRequired===true
 }};
}
function nonready(status,record,req,why,rows){
 return {status,version:SELECTION_VERSION,sourceRecordId:record?.id??null,
  sourceVersionHash:record?.versionHash??null,request:req,
  eligible_games:[],rejected_games:rows.map(x=>({id:x.id,label:x.label,
   reason:why,sourceGrounded:x.sourceGrounded??false,availableInResearch:false,
   browserPrototypeAvailable:x.browserPrototypeAvailable})),
  selected_game_id:null,selected_game:null,canonical_choice_contract:null,
  reasoning_operation:null,selection_trace:{version:SELECTION_VERSION,
   evaluatedPeerIds:[...GAME_IDS],candidates:rows,selected:null,
   policy:"six peers evaluated together; fail closed before any interaction"},
  no_fit_status:status==="no_fit"?"source_no_fit":
   status==="needs_source_review"?"needs_source_review":"needs_interaction",
  fallback_reason:why,publicationAllowed:false};
}
function choiceContract(record,game,context){
 const constraints=record.scenario.constraints;
 const common={version:"canonical-choice/2.1",gameId:game.id,
  evidenceSource:record.versionHash,sourceWarrant:record.argument.sourceWarrant,
  unknowns:clone(record.scenario.consequences.unknowns),
  validation:"validateChoiceV21; frozen reasonSemantically; no game-authored claims"};
 if(game.choiceSchema==="canonical_allocation"){
  return {...common,kind:"finite_budget_allocation",
   input:{gameId:game.id,amounts:"array of safe nonnegative integer counts",
    repetitions:constraints.repetitions===null?"must be absent":"must equal "+constraints.repetitions},
   budget:{capacity:constraints.capacity,capacityMode:constraints.capacityMode??"exact",
    unitHours:constraints.unitHours,costs:[...constraints.costs],
    repetitions:constraints.repetitions},
   choices:record.scenario.choices.map((c,i)=>({
    id:c.id,label:c.label,cost:constraints.costs[i],
    max:context.model.choices[i].max
   })),
   actions:[{role:"USER_DECISION",kind:"allocation"}]};
 }
 if(game.choiceSchema==="canonical_terminal_path"){
  return {...common,kind:"source_authored_terminal_path",
   input:{gameId:game.id,path:"one exact source-authorized terminal path, including authored event IDs"},
   initialChoices:clone(record.scenario.choices),
   stages:[
    {index:0,role:"USER_DECISION",control:"user",description:"Select initial action"},
    {index:1,role:"AUTHORED_DEVELOPMENT",control:"source_authored_scenario",
     description:"Display an explicitly hypothetical event; NOT a user choice"},
    {index:2,role:"USER_DECISION",control:"user",
     description:"Respond after the hypothetical event"}
   ],
   // A path is canonical data, not a declaration that an event was chosen by the reader.
   sourceAuthoredRoutes:constraints.routes.map(r=>({
    path:[...r.path],agencyRoles:[...r.agencyRoles],
    authoredDevelopments:clone(r.authoredDevelopments),
    unchosenOutcomeKnown:false
   })),
   externalEventPolicy:"Never expose stage 1 event selection as a user action; event sequencing is source-authored",
   unchosenFuture:"unknown"};
 }
 return null;
}

/**
 * The one selector. It does not select a mechanism first. Each peer is
 * evaluated from the SAME admitted source, reviewed capabilities and UX
 * availability; a stable rank is used only after these separate checks.
 */
export function selectMiniGameV21(record,options){
 const req=normalizedRequest(options);
 if(!req)return nonready("invalid_request",record,null,
  "The selection request contains unsupported options or an unknown game.",
  SIX_PEER_GAMES.map(g=>({id:g.id,label:g.label,reason:"Invalid selection request.",
    browserPrototypeAvailable:g.browserPrototypeAvailable})));
 let validation;
 try{validation=validateContentRecordV21(record);}
 catch{return nonready("needs_source_review",record,req,
  "Malformed source data cannot be admitted or evaluated safely.",
  SIX_PEER_GAMES.map(g=>({id:g.id,label:g.label,reason:"Malformed source record.",
    browserPrototypeAvailable:g.browserPrototypeAvailable})));}
 if(validation.status==="inventory_no_fit"){
  const rows=SIX_PEER_GAMES.map(g=>{
   const e=record.gameCompatibility.find(x=>x.id===g.id);
   return {id:g.id,label:g.label,sourceGrounded:true,
    philosophicalEligible:false,availableInResearch:g.executableInResearch,
    browserPrototypeAvailable:g.browserPrototypeAvailable,
    selectionEligible:false,score:null,
    reason:e?.evidenceOrRejection??"Missing source-reviewed peer rejection."};
  });
  const outcome=nonready("no_fit",record,req,record.noFitReason,rows);
  outcome.rejected_games=rows.map(({id,label,reason,sourceGrounded,
    availableInResearch,browserPrototypeAvailable})=>({
     id,label,reason,sourceGrounded,availableInResearch,browserPrototypeAvailable
    }));
  return outcome;
 }
 if(validation.status!=="valid_research_record"||
   record?.source?.reviewState==="catalogue_only"||
   record?.editorialState!=="research_only"){
  const details=validation.errors?.map(e=>e.field).join(", ")||"source review";
  return nonready("needs_source_review",record,req,
   "Source, editorial assertion or game contract is not independently admitted ("+details+").",
   SIX_PEER_GAMES.map(g=>({id:g.id,label:g.label,
    reason:"Source not admitted; avoid inventing an interpretation.",
    browserPrototypeAvailable:g.browserPrototypeAvailable})));
 }
 const context=authoritativeContextForRecord(record);
 if(!context||record.source.reviewState!=="curated_provisional"&&
      record.source.reviewState!=="source_verified")
  return nonready("needs_source_review",record,req,
   "No unchanged source-authorized meaning model is registered.",
   SIX_PEER_GAMES.map(g=>({id:g.id,label:g.label,
    reason:"No trusted meaning context.",browserPrototypeAvailable:g.browserPrototypeAvailable})));
 const caps=assessAllSixPeerGames(record,GAME_IDS);
 const rows=SIX_PEER_GAMES.map((game,index)=>{
  const cap=caps.find(x=>x.id===game.id),declared=record.gameCompatibility.find(x=>x.id===game.id);
  const reasons=[];
  if(!cap.eligible||declared.eligible!==cap.eligible)
   reasons.push(cap.reason);
  if(!game.allowedReasoningOperations.includes(context.mechanism))
   reasons.push("The registered source model does not provide this game's reasoning operation.");
  if(!game.executableInResearch)
   reasons.push("Interaction and canonical adapter are not implemented; this peer cannot be played.");
  if(req.mode==="prototype"&&!game.browserPrototypeAvailable)
   reasons.push("No existing browser prototype for this peer; research-only choice input is not a playable UI.");
  if(req.accessibility.screenReaderRequired)
   reasons.push("Screen-reader/VoiceOver verification is still outstanding; do not claim accessible gameplay.");
  // A reduced-motion requirement alone cannot certify draft prototype behavior.
  if(req.accessibility.reducedMotionRequired&&game.browserPrototypeAvailable)
   reasons.push("Draft gesture interaction has not passed reduced-motion acceptance.");
  const philosophicalEligible=cap.eligible&&declared.eligible===true&&
   game.allowedReasoningOperations.includes(context.mechanism);
  const selectionEligible=reasons.length===0&&philosophicalEligible;
  const preference=selectionEligible&&req.preferredGameId===game.id?30:0;
  const score=selectionEligible?
    100+(game.browserPrototypeAvailable?20:0)+preference: null;
  return {id:game.id,label:game.label,sourceGrounded:true,
   philosophicalEligible,availableInResearch:game.executableInResearch,
   browserPrototypeAvailable:game.browserPrototypeAvailable,
   implementationStatus:game.implementationStatus,productionPlayable:false,
   selectionEligible,score,
   capabilityEvidenceVersion:cap.evidenceVersion,
   capabilityReason:cap.reason,
   requirements:game.requiredFields,
   choiceSchema:game.choiceSchema,
   contraindications:[...game.contraindications],
   accessibilityFallback:game.accessibilityFallback,
   reason:reasons.length?reasons.join(" "):
    "Source capability and canonical interaction contract agree. "+cap.reason};
 });
 const eligible=rows.filter(r=>r.selectionEligible).sort((a,b)=>
   b.score-a.score||GAME_IDS.indexOf(a.id)-GAME_IDS.indexOf(b.id));
 const rejected=rows.filter(r=>!r.selectionEligible);
 const chosen=eligible[0]??null;
 const reasons=rejected.map(({id,label,reason,sourceGrounded,
  availableInResearch,browserPrototypeAvailable,philosophicalEligible})=>({
   id,label,reason,sourceGrounded,philosophicalEligible,
   availableInResearch,browserPrototypeAvailable
  }));
 const publicEligible=eligible.map(({id,label,score,capabilityReason,
  browserPrototypeAvailable,implementationStatus,sourceGrounded})=>({
   id,label,score,reason:capabilityReason,sourceGrounded,
   browserPrototypeAvailable,implementationStatus,productionPlayable:false
  }));
 const trace={version:SELECTION_VERSION,
  evaluatedPeerIds:[...GAME_IDS],candidates:rows,selected:chosen?.id??null,
  sourceIdentity:{recordId:record.id,versionHash:record.versionHash,
   author:record.source.author,work:record.source.work,
   quote:record.source.quote,referenceUrl:record.source.referenceUrl},
  sourceWarrant:record.argument.sourceWarrant,
  uncertaintyLimit:record.argument.uncertaintyLimit,
  requestedPreference:req.preferredGameId,
  preferenceHonored:!!chosen&&chosen.id===req.preferredGameId,
  selectionPolicy:"Single peer-wise assessment: verified evidence + source reasoning compatibility + actual available interaction + accessibility, then stable score and GAME_IDS tie-break",
  scoreBreakdown:{sourceCapability:100,existingPrototypeBonus:20,
   compatiblePreferenceBonus:30},
  noPhilosopherNameRanking:true};
 return {status:chosen?"research_selected":
    req.accessibility.screenReaderRequired||req.accessibility.reducedMotionRequired?
      "needs_accessible_interaction":"no_available_game",
  version:SELECTION_VERSION,sourceRecordId:record.id,
  sourceVersionHash:record.versionHash,request:req,
  eligible_games:publicEligible,rejected_games:reasons,
  selected_game_id:chosen?.id??null,
  selected_game:chosen?{
   id:chosen.id,label:chosen.label,
   implementationStatus:chosen.implementationStatus,
   browserPrototypeAvailable:chosen.browserPrototypeAvailable,
   productionPlayable:false,sourceGrounded:true
  }:null,
  canonical_choice_contract:chosen?
   choiceContract(record,SIX_PEER_GAMES.find(g=>g.id===chosen.id),context):null,
  reasoning_operation:chosen?context.operation:null,
  selection_trace:trace,
  no_fit_status:chosen?null:"no_playable_game",
  fallback_reason:chosen?null:
   "No source-grounded, presently executable and accessible interaction can be selected; do not force-fit.",
  publicationAllowed:false};
}

/**
 * Research demonstration of the actual selected user interaction:
 * validates a SOURCE-AUTHORED canonical path or resource allocation, executes
 * unchanged Reasoning, then authenticated Emotion/Expression. Revalidates the
 * selection itself to prevent an attacker from forging the chosen game.
 */
export function runSelectedEncounterResearchV21(record,selection,choice,environment){
 const abstain=(status,reason)=>({status,version:SELECTION_VERSION,
   reason,publicationAllowed:false});
 if(!selection||!plain(selection)||!plain(choice)||
    !plain(environment)||!canRunIsolatedResearchV21(record,environment))
  return abstain("needs_source_review","An isolated, provisional research context and valid inputs are required.");
 const replay=selectMiniGameV21(record,selection.request);
 if(replay.status!=="research_selected"||!eq(selection,replay))
  return abstain("rejected_selection","The selection trace was altered or the source/game can no longer be selected.");
 const gameId=replay.selected_game_id;
 if(choice.gameId!==gameId)
  return abstain("rejected_choice","The submitted mini-game is not the selected source-authorized peer.");
 const game=SIX_PEER_GAMES.find(g=>g.id===gameId);
 if(!game?.executableInResearch)
  return abstain("rejected_choice","An unimplemented game must never execute.");
 const submitted=validateChoiceV21(record,choice);
 if(submitted.status!=="ready")
  return abstain("rejected_choice",submitted.reason);
 const context=authoritativeContextForRecord(record);
 if(!context)return abstain("needs_source_review","Trusted source model is unavailable.");
 const meaning=reasonSemantically(context,submitted.canonical);
 if(meaning.status!=="ready"||meaning.source?.url!==record.source.referenceUrl||
    meaning.author!==record.source.author||
    meaning.sourceAdmission?.centralClaim!==record.argument.sourceWarrant)
  return abstain("needs_editorial_review","Frozen meaning or source identity is inconsistent.");
 const expression=renderSourceGroundedResearchV211(record,choice,environment);
 if(expression.status!=="ready")
  return abstain("needs_editorial_review",
   expression.reason||"Source-grounded Emotion/Expression abstained.");
 const checked=validateSourceGroundedResearchV211(record,choice,environment,expression);
 if(checked.status!=="ready")
  return abstain("needs_editorial_review","The expression did not match replayed source evidence.");
 if(!record.emotionalEligibility.allowedStrategies.includes(expression.brief.strategy))
  return abstain("needs_editorial_review","The research Emotion strategy is not source-authorized.");
 return {status:"ready",version:SELECTION_VERSION,
  publicationAllowed:false,sourceReview:"curated_provisional",
  selected_game_id:gameId,
  browserPrototypeAvailable:game.browserPrototypeAvailable,
  productionPlayable:false,
  canonical_choice:clone(submitted.canonical),
  canonical_choice_contract:clone(replay.canonical_choice_contract),
  meaning,emotion:clone(expression.brief),expression,
  stages:[
   {name:"Content database",status:"approved_for_isolated_research",versionHash:record.versionHash},
   {name:"ONE mini-game selection",status:"research_selected",gameId},
   {name:"User interaction",status:"canonical_validated",choiceSchema:game.choiceSchema},
   {name:"Reasoning",status:"ready",engineVersion:meaning.version},
   {name:"Emotion",status:"ready",strategy:expression.brief.strategy},
   {name:"Expression",status:"ready",wordCount:expression.wordCount},
   {name:"Play–Discover–Remember",status:"research_handoff_only",notProduction:true}
  ],
  epistemicLimits:clone(meaning.limitations),
  selection_trace:clone(replay.selection_trace)};
}
