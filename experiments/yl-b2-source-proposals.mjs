/**
 * CZ-134 B2.1 — review-only source/game contract candidates.
 * NOT Content Database, NOT the selector, NOT admission, NOT an Encounter.
 * Generates exact fingerprints of proposals for a human CZ-121 reviewer.
 * External source excerpts are brief; no translation is claimed approved.
 */
import {createHash} from "node:crypto";
import {KIERKEGAARD_V21,DILLARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {validateContentRecordV21} from "../philosophy-engine/content/content-contract-v21.js";
import {listAuthoredPossibilities,normalizeFuture,inspectB1Source}
 from "./yl-b1-editorial-gated-adapters.mjs";
export const B2_VERSION="review-only-source-candidates/0.1.0";
const asText=x=>typeof x==="string"&&x.trim().length>0;
const obj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 obj(x)?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":JSON.stringify(x);
const deepFreeze=x=>{
 if(obj(x)||Array.isArray(x)){for(const v of Object.values(x))deepFreeze(v);Object.freeze(x);}
 return x;
};
const blocked=(code,reason)=>({status:"review_blocked",code,reason,
 engineReady:false,publicationAllowed:false,productionPlayable:false});
/* All content here is a proposal, not an already verified source record.
 * A proposal fingerprint alone cannot confer independent source admission. */
const proposals=[
 {proposalId:"cz134:b2:walden-life-hours:0.1",
  gameId:"balance_of_values",editorialState:"REVIEW_PENDING",
  source:{author:"Henry David Thoreau",work:"Walden",year:1854,
   chapter:"I. Economy",primaryLanguage:"English",translation:"none (original English)",
   shortExcerpt:"the cost of a thing is the amount of what I will call life",
   excerptType:"short verbatim fragment pending exact-edition review",
   referenceUrl:"https://digitalthoreau.org/walden/fluid/text/01.html",
   comparativeWitness:"https://en.wikisource.org/wiki/Walden_%281893%29_Thoreau/Chapter_I",
   qualifiedLocator:"Chapter I, Economy, shelter/cost-of-dwelling passage; edition/page signoff pending"},
  claim:"The cost of acquiring material things can be reconsidered as human life and working time exchanged; cost is not simply a price.",
  analogy:"In an invented eight-hour decision budget, a fictional person can allocate discrete hours to extra paid work towards an optional furnishing or retain the hours for other chosen activities.",
  scenario:{
   id:"fictional-8-hours-two-uses-v0",
   kind:"finite_budget",resourceId:"fictional_discretionary_hours",
   capacity:8,capacityMode:"exact",unit:"hour",unitHours:1,
   costs:[1,1],choiceIds:["paid_optional_furnishing","hours_kept"],
   choiceLabels:["Hours of extra paid work","Hours kept for other uses"],
   fictionalNetHourlyEarnings:20,currency:"USD",
   wageOrigin:"Invented scenario assumption; NOT a rate, quotation or promise from Thoreau",
   realPersonInference:false,
   mathematicalClaims:["hours of extra paid work + retained hours = 8",
    "illustrative earnings = extra paid hours × fictional net hourly rate"],
   neverInfer:["moral value","real preferences","purchase outcome",
    "sufficiency of earnings","mental health","actual discretionary hours"]},
  canonicalCandidate:{kind:"finite_budget_allocation",
   operation:"tradeoff",amountFields:["leftSlots","rightSlots"],
   expectedModel:"requires NEW independently admitted two-choice meaning context",
   validationStatus:"NOT REGISTERED; frozen Thoreau model has THREE furnishings and a dollar cap"},
  independentQualifiedReviewer:null,independentApprovedAt:null,
  gameSpecificApproval:"PENDING",publicationAllowed:false},
 {proposalId:"cz134:b2:jj167-explore-authored:0.1",
  gameId:"future_reveal",editorialState:"REVIEW_PENDING",
  source:{author:"Søren Kierkegaard",work:"Journal JJ:167",year:1843,
   chapter:"JJ:167, Søren Kierkegaards Skrifter, volume 18",
   primaryLanguage:"Danish",
   translation:"Iowa page English rendering authored by that page's author, NOT a qualified approved translation",
   shortExcerpt:"Det er ganske sandt, hvad Philosophien siger, at Livet maa forstaaes baglænds.",
   excerptType:"brief original Danish; complete passage review required",
   referenceUrl:"https://teol.ku.dk/skc/om-soeren-kierkegaard/soeren-kierkegaard-citater/",
   comparativeWitness:"https://homepage.divms.uiowa.edu/~jorgen/kierkegaardquotesource.html",
   qualifiedLocator:"Journal JJ:167 (1843); University of Copenhagen SKS volume 18 page 194; Iowa page reports p.306, edition pagination must be independently reconciled"},
  claim:"Life must be lived forward; later interpretation can illuminate it but does not allow a complete detached retrospective viewpoint.",
  analogy:"Choose a fictional starting decision; explore one of multiple preauthored hypothetical scenes as a VIEWING choice, not a causal event; choose a response; reflect retrospectively.",
  scenario:{id:"versioned-copy-review-needed",
   existingContentVersionHash:KIERKEGAARD_V21.versionHash,
   sourceGraphMayNotBeModified:true,viewMode:"EXPLORE_ONLY",
   roles:["USER_DECISION","AUTHORED_DEVELOPMENT",
    "USER_DECISION","RETROSPECTIVE_INTERPRETATION"],
   sceneWordingFlag:"Current fictional graph has 'You miss your old friends'; no accepted replacement",
   proposedNeutralReplacement:"An unexpected change in the imagined work schedule becomes relevant.",
   replacementStatus:"EDITORIAL COPY PROPOSAL ONLY; NOT IN FROZEN GRAPH",
   timelineBasis:"ordered narrative stages, NOT dated milestones or forecasts",
   cannotKnow:["real future","unchosen life","real personality",
    "whether an imagined event will occur"]},
  canonicalCandidate:{kind:"source_authored_terminal_path",
   operation:"decision_map",existingModel:"frozen meaning/1.2",
   gate:"requires qualified scene-specific review and an approved single-selector capability version"},
  independentQualifiedReviewer:null,independentApprovedAt:null,
  gameSpecificApproval:"PENDING",publicationAllowed:false}
];
for(const p of proposals){
 const digest=createHash("sha256").update(stable(p)).digest("hex");
 p.proposalFingerprint="sha256:"+digest;
 deepFreeze(p);
}
export const B2_SOURCE_PROPOSALS=Object.freeze(proposals);
export function examineB2Proposal(proposalId){
 const p=B2_SOURCE_PROPOSALS.find(x=>x.proposalId===proposalId);
 return p?{status:"review_pending",proposal:p,admission:false,
  missing:["qualified-source-text-and-edition",
   "qualified-game-specific-analogy","trusted-versioned-context",
   "evidence-derived-capability","selector-implementation",
   "exact-SHA-independent-positive-QA"],
  publicationAllowed:false}:
  blocked("unknown_proposal","No preauthored editorial proposal exists");
}
/** Arithmetical rehearsal, NOT a user Encounter or philosophy result. */
export function rehearseFictionalHours(proposalId,allocation){
 const p=B2_SOURCE_PROPOSALS.find(x=>x.proposalId===proposalId&&
  x.gameId==="balance_of_values");
 if(!p)return blocked("not_a_balance_proposal","No eligible review-only balance fixture");
 if(!obj(allocation)||Object.keys(allocation).some(k=>!["leftSlots","rightSlots"].includes(k))||
    !integer(allocation.leftSlots)||!integer(allocation.rightSlots))
  return blocked("invalid_choice","Only two typed nonnegative whole-hour counts");
 const cap=p.scenario.capacity;
 if(allocation.leftSlots+allocation.rightSlots!==cap)
  return blocked("not_conserved","The proposed scenario must conserve exactly eight hours");
 if(p.scenario.costs.some(x=>x!==1)||p.scenario.unitHours!==1)
  return blocked("unit_mismatch","Proposal mathematical contract changed");
 return {status:"proposal_preview_only",proposalFingerprint:p.proposalFingerprint,
  fictionalHours:{paid:allocation.leftSlots,kept:allocation.rightSlots,total:cap},
  purelyAssumedEarnings:allocation.leftSlots*p.scenario.fictionalNetHourlyEarnings,
  fictionalHourlyRate:p.scenario.fictionalNetHourlyEarnings,
  meaningEngineInvoked:false,emotionEngineInvoked:false,expressionEngineInvoked:false,
  gameSourceApproved:false,publicationAllowed:false,
  caveat:"These hypothetical hours and assumed rate are NOT Thoreau's calculations, a moral ranking, or a person's actual life."};
}
/** This deliberately gives NO game READY even if the frozen graph can be
 * replayed arithmetically. Distinct approved source/scene contracts are absent. */
export function rehearseAuthoredExploration(startId,actions){
 const p=B2_SOURCE_PROPOSALS.find(x=>x.gameId==="future_reveal");
 const options=listAuthoredPossibilities(KIERKEGAARD_V21,startId);
 if(options.status!=="research_options_only")return blocked("source_graph_refused",options.reason);
 const step=normalizeFuture(KIERKEGAARD_V21,actions);
 if(step.status!=="normalized")return blocked(step.code||"invalid_path",step.reason);
 const gate=inspectB1Source(KIERKEGAARD_V21,"future_reveal");
 if(gate.status==="admitted")return blocked("unanticipated_admission",
  "This B2 review-only fixture is not itself a trusted content record");
 return {status:"proposal_preview_only",proposalFingerprint:p.proposalFingerprint,
  canonicalPathFromExistingFrozenResearch:step.canonical,
  authoredEventCausalAgency:false,exploredFiction:true,
  counterfactualKnowledge:false,gameSourceApproved:false,
  meaningEngineInvoked:false,emotionEngineInvoked:false,expressionEngineInvoked:false,
  publicationAllowed:false};
}
/** Existing records remain untouched and the new candidacy confers no
 * privileges on previously rejected game/source combinations. */
export function verifyNoB2Admission(){
 const records=[DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21];
 return records.every(r=>
  ["balance_of_values","future_reveal"].every(id=>
   inspectB1Source(r,id).status==="blocked"))&&
  B2_SOURCE_PROPOSALS.every(p=>p.gameSpecificApproval==="PENDING"&&
   p.independentQualifiedReviewer===null)&&
  B2_SOURCE_PROPOSALS.every(p=>
   validateContentRecordV21(p).status!=="valid_research_record");
}
