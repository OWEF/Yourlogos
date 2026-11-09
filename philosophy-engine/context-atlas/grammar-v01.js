/**
 * CZ-110: Four-layer philosophical grammar and cautious mechanic assessment.
 * This module maps CURATED interpretations, not quote keywords, to tentative
 * interactions. It cannot prove an author's intended meaning or find truth.
 * No LLM, network, database, personal profiles, or runtime publication.
 */
import {ATLAS_PILOT_V01} from "./pilot-records-v01.js";

export const CONTEXT_ATLAS_SCHEMA_VERSION = 1;
const mechanics = Object.freeze({
  tradeoff: "source_grounded_constraint",
  decision_map: "branch_dependency",
  counterexample: "generalization_scope",
});
const nonEmpty = v => typeof v === "string" && v.trim().length > 0;
const object = v => v !== null && typeof v === "object" && !Array.isArray(v);
const quantities = ["universal","particular","singular","generic","unspecified"];
const qualities = ["affirmative","negative","mixed","figurative","not_classifiable"];
const relations = ["categorical","hypothetical","disjunctive","mixed","not_classifiable"];
const modalities = ["problematic","assertoric","apodictic","figurative","unspecified","not_classifiable"];
const requireText = (value, name, errors) => {if (!nonEmpty(value)) errors.push(name+" must be nonempty");};

export function validateContextRecord(r) {
  const errors = [];
  if (!object(r)) return ["record must be an object"];
  if (!Number.isInteger(r.id)||r.id<0) errors.push("invalid quote id");
  requireText(r.quote?.text,"quote text",errors);
  requireText(r.quote?.author,"quote author",errors);
  requireText(r.quote?.bundledSource,"quote work",errors);
  if (!["catalogue_only","passage_location_checked","paraphrase_context_checked"].includes(r.quote?.provenanceStatus))
    errors.push("invalid quote provenance status");
  const p=r.sourcePassage;
  requireText(p?.work,"source passage work",errors);
  requireText(p?.contextualSummary,"passage context",errors);
  if (!Array.isArray(p?.references)||!p.references.some(x=>x.kind==="internal_bundled_catalogue"&&x.url==="app.js"))
    errors.push("must retain quote identity reference to bundled catalogue");
  for (const ref of p?.references||[]) {
    if (!nonEmpty(ref.url)||!nonEmpty(ref.supports)||!nonEmpty(ref.kind))
      errors.push("incomplete provenance reference");
    if (ref.url!=="app.js"&&!/^https:\/\//.test(ref.url))
      errors.push("external references must use https");
  }
  if (p?.contextStatus==="passage_linked_editorial_summary" &&
      !p.references.some(x=>x.url!=="app.js"))
    errors.push("passage linked without an external reference");
  requireText(r.authorPosition?.scopedSummary,"author position",errors);
  requireText(r.authorPosition?.periodOrWork,"position period/work",errors);
  if (!Array.isArray(r.authorPosition?.tradition)||!r.authorPosition.tradition.length||
    r.authorPosition.tradition.some(s=>!nonEmpty(s)))
    errors.push("tradition must be nonempty array");
  const a=r.argumentModel, f=a?.logicalForm;
  for (const key of ["claim","warrant","relation","scopeOrConditions","challenge","limits"]) requireText(a?.[key],"argument "+key,errors);
  if (!Array.isArray(a?.concepts)||a.concepts.length<2||new Set(a.concepts).size!==a.concepts.length)
    errors.push("concept list must contain at least two distinct nodes");
  if (!Array.isArray(a?.alternativeReadings)||a.alternativeReadings.length<2||a.alternativeReadings.some(x=>!nonEmpty(x)))
    errors.push("at least two plausible readings must be preserved");
  for (const [name,allowed] of [["quantity",quantities],["quality",qualities],["relation",relations],["modality",modalities]])
    if (!allowed.includes(f?.[name])) errors.push("unsupported logical form "+name);
  if(f?.interpretationNotLogicalProof!==true||!nonEmpty(f?.note))errors.push("logical classification must declare tentative reading");
  for (const key of ["name","task","target"]) requireText(r.philosophicalOperation?.[key],"operation "+key,errors);

  const i=r.interactionModel;
  if (!Object.keys(mechanics).concat("none").includes(i?.candidate))
    errors.push("unsupported candidate mechanic");
  if (i?.candidate==="none") {
    if(i.eligibility!=="none_suitable"||i.mechanismProof!==null||i.scenario!==null) errors.push("none-suitable must have no fabricated mechanic");
  } else {
    if(i?.eligibility!=="conditional"||i.mechanismProof?.kind!==mechanics[i.candidate]||
       !nonEmpty(i.mechanismProof?.ground)||!nonEmpty(i.mechanismProof?.requires)||
       !nonEmpty(i.scenario))
      errors.push("candidate lacks source-related operation proof");
  }
  requireText(i?.fitnessReason,"mechanic fitness",errors);
  requireText(i?.blocker,"mechanic blocker",errors);
  if (!Array.isArray(i?.contraindicatedScenarioIds)||
      i.contraindicatedScenarioIds.some(x=>!nonEmpty(x)))
    errors.push("invalid contraindicated scenario IDs");
  if (i?.approval!=="not_approved") errors.push("pilot cannot claim mechanic approval");
  if (r.review?.status!=="draft"||r.review?.scholarlyReviewed!==false||r.review?.publisherApproved!==false)
    errors.push("pilot may not be marked verified/published");
  return errors;
}

export function evaluatePhilosophicalGrammar(r) {
  const errors=validateContextRecord(r);
  if(errors.length) throw new TypeError(errors.join("; "));
  const candidate=r.interactionModel.candidate;
  const hasExternalPassage = r.sourcePassage.references.some(x=>x.url!=="app.js");
  const eligibility = candidate==="none" ? "abstain_no_suitable_mechanic" :
    !hasExternalPassage ? "candidate_source_review_required" :
    "candidate_editorial_review_required";
  return {
    quoteId:r.id,
    version:CONTEXT_ATLAS_SCHEMA_VERSION,
    epistemicStatus:"editorial_hypothesis",
    sourceContext:{
      work:r.sourcePassage.work,
      passage:r.sourcePassage.locator,
      evidenceType:r.sourcePassage.contextStatus,
      interpretationStatus:r.review.status,
      authorPositionScope:r.authorPosition.periodOrWork,
    },
    logicalForm:{...r.argumentModel.logicalForm},
    conceptualStructure:{
      claim:r.argumentModel.claim,
      warrant:r.argumentModel.warrant,
      concepts:r.argumentModel.concepts,
      relation:r.argumentModel.relation,
      scope:r.argumentModel.scopeOrConditions,
      alternatives:r.argumentModel.alternativeReadings,
      challenge:r.argumentModel.challenge,
      boundaries:r.argumentModel.limits,
    },
    philosophicalOperation:{...r.philosophicalOperation},
    interactiveRealization:{
      candidate,eligibility,
      epistemicStatus:"unapproved_suggestion",
      proof:r.interactionModel.mechanismProof,
      proposedScenario:r.interactionModel.scenario,
      risks:r.interactionModel.blocker,
      scenarioExclusions:r.interactionModel.contraindicatedScenarioIds,
      allowedForProduction:false,
    },
    trace:[
      {layer:"quote",reason:"Identity tracked to bundled quotation "+r.id},
      {layer:"source_context",reason:r.sourcePassage.contextStatus},
      {layer:"form",reason:r.argumentModel.logicalForm.note},
      {layer:"conceptual_structure",reason:r.argumentModel.warrant},
      {layer:"operation",reason:r.philosophicalOperation.task},
      {layer:"realization",reason:r.interactionModel.fitnessReason},
    ],
  };
}

/**
 * Bridge audit against the existing REAL CZ-105 Trade-Off reasoner.
 * The test can reject an existing scenario despite a potential fit between
 * its philosopher and the abstract Trade-Off operation.
 */
export function auditLegacyReasoningResult(r, result, scenarioId) {
  const grammar=evaluatePhilosophicalGrammar(r);
  if (result?.model?.quoteId!==r.id) throw new TypeError("Quote identity mismatch between atlas and reasoner");
  if (result?.mechanism!=="tradeoff") throw new TypeError("Unsupported mechanism for existing CZ-105 audit");
  const reasons=[];
  if(grammar.interactiveRealization.candidate!=="tradeoff") reasons.push("Quote has not been fitted to Trade-Off");
  if(grammar.interactiveRealization.scenarioExclusions.includes(scenarioId))
    reasons.push("Scenario is a teaching invention that does not test the source's central relationship");
  if(result.model.productionEligible!==true)
    reasons.push("Existing philosophical model is not source-approved for production");
  if(r.review.publisherApproved!==true)
    reasons.push("Context Atlas record has not received editorial approval");
  return {
    quoteId:r.id,
    outcome: reasons.length?"blocked_for_public_expression":"eligible_for_later_expression_review",
    observedDecision:result.what_happened.summary,
    necessaryFindings:result.what_follows.necessary.map(f=>f.statement),
    conditionalFindings:result.what_follows.possible.map(f=>f.statement),
    candidateDiscovery:grammar.conceptualStructure.claim,
    candidateJustification:grammar.conceptualStructure.warrant,
    uncertainty:result.what_remains_uncertain.map(u=>u.question),
    proposedTension:result.what_follows.tensions.map(t=>t.statement),
    trace:{atlas:grammar.trace,engine:result.why_this.rule_trace},
    blockers:reasons,
    readyForExpression:reasons.length===0,
    philosophicalTruthClaim:false,
  };
}

export function summarizeAtlasPilot(records=ATLAS_PILOT_V01){
 const results=records.map(evaluatePhilosophicalGrammar);
 const candidateCounts=Object.fromEntries(["tradeoff","decision_map","counterexample","none"].map(
   m=>[m,results.filter(r=>r.interactiveRealization.candidate===m).length]));
 return {
   count:results.length,
   candidates:candidateCounts,
   readyForProduction:results.filter(r=>r.interactiveRealization.allowedForProduction).length,
   sourceLinked:results.filter(r=>r.sourceContext.evidenceType==="passage_linked_editorial_summary").length,
   notSuitable:results.filter(r=>r.interactiveRealization.eligibility==="abstain_no_suitable_mechanic").map(r=>r.quoteId),
   concerns:results.filter(r=>r.interactiveRealization.scenarioExclusions.length).map(r=>({id:r.quoteId,excluded:r.interactiveRealization.scenarioExclusions})),
 };
}
