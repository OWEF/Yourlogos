/**
 * CZ-105 — Trade-Off Reasoning Engine v1
 * Pure deterministic analysis. No UI, LLM, persistence, scoring of people,
 * expression generation, or automatically initiated second interaction.
 */
import {
  SENECA_TIME_TRADEOFF_V1,
  validatePhilosophicalModel,
} from "./models/seneca-time-v1.js";

export const REASONING_RESULT_SCHEMA_VERSION = 1;
const CADENCES = ["unknown", "one_off", "recurring"];
const nonNullObject = o => o !== null && typeof o === "object" && !Array.isArray(o);
const rounded = n => Number(n.toFixed(8));
const formatHours = n => (Number.isInteger(n) ? String(n) : String(rounded(n))) + "h";
const formatPercent = p => String(rounded(p * 100)) + "%";

export function validateTradeoffInput(input, model = SENECA_TIME_TRADEOFF_V1) {
  const errors = validatePhilosophicalModel(model);
  if (errors.length) return errors.map(e => "Model: " + e);
  if (!nonNullObject(input) || !nonNullObject(input.allocation)) return ["Structured allocation required"];
  const allowed = model.scenario.categories.map(c => c.id);
  const keys = Object.keys(input.allocation);
  if (keys.length !== allowed.length || keys.some(k => !allowed.includes(k)) ||
      allowed.some(k => !Object.hasOwn(input.allocation, k)))
    errors.push("Allocation must contain exactly " + allowed.join(", "));
  const vals = allowed.map(k => input.allocation[k]);
  if (vals.some(n => typeof n !== "number" || !Number.isFinite(n) || n < 0 ||
                      n > model.scenario.budget))
    errors.push("Each allocation must be a finite nonnegative number within the budget");
  if (vals.every(n => typeof n === "number" && Number.isFinite(n)) &&
      Math.abs(vals.reduce((a, b) => a + b, 0) - model.scenario.budget) > 1e-7)
    errors.push("Allocation must sum to the exact scenario budget");
  if (input.context !== undefined) {
    if (!nonNullObject(input.context)) errors.push("Context must be an object");
    else {
      if (input.context.cadence !== undefined && !CADENCES.includes(input.context.cadence))
        errors.push("Cadence must be unknown, one_off or recurring");
      if (input.context.statedPriority !== undefined &&
          input.context.statedPriority !== null &&
          !allowed.includes(input.context.statedPriority))
        errors.push("Stated priority must refer to a scenario category or be null");
      if (Object.keys(input.context).some(k => !["cadence", "statedPriority"].includes(k)))
        errors.push("Unsupported context field");
    }
  }
  if (Object.keys(input).some(k => !["allocation", "context"].includes(k)))
    errors.push("Unsupported input field");
  return errors;
}

export function analyzeTradeoff(input, model = SENECA_TIME_TRADEOFF_V1) {
  const errors = validateTradeoffInput(input, model);
  if (errors.length) throw new TypeError(errors.join("; "));

  const { budget, categories } = model.scenario;
  const allocation = Object.fromEntries(categories.map(c => [c.id, input.allocation[c.id]]));
  const percentages = Object.fromEntries(categories.map(c => [c.id, rounded(allocation[c.id] / budget * 100)]));
  const labels = Object.fromEntries(categories.map(c => [c.id, c.label]));
  const ordered = categories.map(c => c.id)
    .sort((a, b) => allocation[b] - allocation[a] || categories.findIndex(c => c.id === a) - categories.findIndex(c => c.id === b));
  const leader = ordered[0], second = ordered[1];
  const max = allocation[leader], min = allocation[ordered[ordered.length - 1]];
  const eps = 1e-9;
  const leaders = ordered.filter(k => Math.abs(allocation[k] - max) < eps);
  const excluded = ordered.filter(k => allocation[k] === 0);
  const positive = ordered.filter(k => allocation[k] > 0);
  const maxShare = max / budget;
  const dominance =
    maxShare === 1 ? "exclusive" :
    maxShare >= 0.75 ? "strong_dominance" :
    maxShare > 0.5 ? "majority" :
    Math.abs(maxShare - 0.5) < eps ? "half" : "distributed";
  const hhi = categories.reduce((s, c) => s + (allocation[c.id] / budget) ** 2, 0);
  // Balance index describes dispersion only; it is NOT a rating of good decisions.
  const balanceIndex = rounded((1 - hhi) / (1 - 1 / categories.length));
  const cadence = input.context?.cadence ?? "unknown";
  const statedPriority = input.context?.statedPriority ?? null;
  const mismatch = statedPriority !== null && allocation[statedPriority] < max - eps;
  const patterns = [];
  const necessary = [], possible = [], tensions = [], uncertainties = [], ruleTrace = [];
  const add = (collection, id, statement, refs, epistemicStatus) => {
    collection.push({ id, statement, relationIds: refs, epistemicStatus });
  };
  const trace = (ruleId, condition, findingIds, relationIds, epistemicStatus) => {
    ruleTrace.push({ ruleId, condition, findingIds, relationIds, epistemicStatus });
  };

  patterns.push({
    id: "allocation-" + dominance,
    label: dominance.replace(/_/g, " "),
    description: dominance === "exclusive" ? labels[leader] + " occupies all available time" :
      dominance === "distributed" ? "No activity holds an absolute majority" :
      labels[leader] + " receives " + formatPercent(maxShare) + " of this block",
  });
  if (leaders.length > 1)
    patterns.push({ id: "tied-leaders", label: "shared priority", description: leaders.map(k => labels[k]).join(" and ") + " tie for the largest allocation" });
  if (excluded.length)
    patterns.push({ id: "excluded-activities", label: "omissions", description: excluded.map(k => labels[k]).join(" and ") + " receive no time in this block" });
  if (max - min <= budget / 8 + eps)
    patterns.push({ id: "nearly-even", label: "near balance", description: "The gap between the largest and smallest allocations is at most one hour" });
  if (mismatch)
    patterns.push({ id: "stated-priority-mismatch", label: "intention-allocation tension", description: labels[statedPriority] + " was stated as the priority but another activity receives more time" });

  const allocationSummary = categories.map(c => c.label + " " + formatHours(allocation[c.id]) +
    " (" + formatPercent(allocation[c.id] / budget) + ")").join(", ");
  add(necessary, "finite-budget", "The " + formatHours(budget) +
    " hypothetical block is fully allocated; time assigned to one activity is unavailable to the others within this same block.",
    ["rel-finite-budget"], "scenario_necessity");
  trace("budget-invariant", "All amounts sum to " + budget, ["finite-budget"], ["rel-finite-budget"], "scenario_necessity");

  for (const id of excluded) {
    const resultId = "no-time-" + id;
    add(necessary, resultId, labels[id] +
      " receives no time inside this specific block; this does not establish that it is absent from the user's day or life.",
      ["rel-forgone-alternatives"], "scenario_necessity");
    trace("zero-allocation-" + id, id + " === 0", [resultId], ["rel-forgone-alternatives"], "scenario_necessity");
  }

  if (dominance === "exclusive") {
    const line = labels[leader] + " uses the whole block; the thought exercise therefore excludes every other activity for these eight hours.";
    add(necessary, "exclusive-choice", line, ["rel-finite-budget", "rel-forgone-alternatives"], "scenario_necessity");
    trace("exclusive-allocation", leader + " share === 100%", ["exclusive-choice"], ["rel-forgone-alternatives"], "scenario_necessity");
    const alternatives = {
      rest: "A period devoted entirely to rest might be recovery, or it might postpone activities the person also values.",
      obligations: "A block devoted entirely to obligations might express purposeful commitment, or it might crowd out care and reflection.",
      reflection: "A block devoted entirely to reflection might be a worthwhile retreat, or it might postpone putting ideas into practice.",
    };
    add(possible, "exclusive-interpretation-" + leader, alternatives[leader],
      ["rel-deliberateness"], "interpretive_possibility");
    trace("exclusive-philosophical-tension-" + leader, "Exclusive " + leader + " allocation", ["exclusive-interpretation-" + leader],
      ["rel-deliberateness"], "interpretive_possibility");
    tensions.push({ id: "exclusive-purpose", kind: "possible_tradeoff", statement:
      "Complete focus on " + labels[leader] + " raises a question about what happens to the excluded activities, not whether the focus is morally wrong.",
      isLogicalContradiction: false });
  } else {
    const leadersLabel = leaders.map(k => labels[k]).join(" and ");
    const nextAfterLeaders = ordered.find(k => !leaders.includes(k));
    const distributionSentence = leaders.length > 1
      ? leaders.map(k => labels[k]).join(" and ") + " each receive " + formatHours(max) +
        (nextAfterLeaders ? "; " + labels[nextAfterLeaders] + " receives " + formatHours(allocation[nextAfterLeaders]) : "") +
        ". This is shared leadership, not a single winner."
      : leadersLabel + " receives " + formatHours(max) +
        " while " + labels[second] + " receives " + formatHours(allocation[second]) +
        "; the relative amounts constrain what can be done within this block.";
    add(necessary, "priority-distribution", distributionSentence,
      ["rel-finite-budget"], "scenario_necessity");
    trace("relative-allocation", dominance + "; leaders=" + leaders.join(",") + "; runner_up=" + (leaders.length > 1 ? nextAfterLeaders : second),
      ["priority-distribution"], ["rel-finite-budget"], "scenario_necessity");
    const secondNonLeader = leaders.length > 1 ? nextAfterLeaders : ordered.find(k => k !== leader && allocation[k] > 0);
    const secondaryText = secondNonLeader && allocation[secondNonLeader] > 0
      ? " The next distinct priority is " + labels[secondNonLeader] + " (" + formatHours(allocation[secondNonLeader]) + ")."
      : "";
    add(possible, "relative-priorities", (leaders.length > 1
      ? "Sharing the largest allocation could reflect competing priorities rather than indifference."
      : "Giving more time to " + labels[leader] + " could express a temporary or sustained priority.") +
      secondaryText + " The value of that distribution cannot be inferred from its proportions alone.",
      ["rel-deliberateness"], "interpretive_possibility");
    trace("proportional-interpretation", dominance + "; top=" + formatPercent(maxShare),
      ["relative-priorities"], ["rel-deliberateness"], "interpretive_possibility");
    if (excluded.length)
      tensions.push({ id: "omitted-value", kind: "possible_tradeoff", statement:
        "The omitted activities may matter even when one visible priority dominates; the block alone cannot tell us their actual importance.",
        isLogicalContradiction: false });
  }

  if (mismatch) {
    const statement = "The stated priority (" + labels[statedPriority] + ") receives " +
      formatHours(allocation[statedPriority]) + ", below " + labels[leader] +
      " at " + formatHours(max) + ". That is an apparent mismatch between the declared objective and this allocation, not proof of hypocrisy.";
    tensions.push({ id: "goal-action-mismatch", kind: "stated_goal_tension",
      statement, isLogicalContradiction: false });
    trace("declared-priority-check", statedPriority + "=" + allocation[statedPriority] + " < " + leader + "=" + max,
      ["goal-action-mismatch"], ["rel-finite-budget"], "interpretive_possibility");
    uncertainties.push({ id: "priority-mismatch-context",
      question: "Is the discrepancy a compromise forced by circumstances, or a deliberate change of priority?",
      reason: "A selected allocation does not reveal external constraints." });
  }

  if (cadence === "recurring") {
    add(possible, "repetition", "If this allocation is repeated regularly, its omissions and priorities may become a persistent pattern; the actual effects still depend on the rest of the day and the person's circumstances.",
      ["rel-deliberateness"], "interpretive_possibility");
    trace("recurring-context", "cadence === recurring", ["repetition"], ["rel-deliberateness"], "interpretive_possibility");
  } else if (cadence === "one_off") {
    add(possible, "temporary-context", "A one-off allocation could serve a special purpose and cannot by itself establish a long-term way of living.",
      ["rel-deliberateness"], "interpretive_possibility");
    trace("one-off-context", "cadence === one_off", ["temporary-context"], ["rel-deliberateness"], "interpretive_possibility");
  } else {
    uncertainties.push({ id: "cadence-unknown", question: "Is this a one-off choice or a recurring routine?",
      reason: "The significance of a single unusual allocation changes with its duration and purpose." });
  }

  uncertainties.push({ id: "purpose-unknown",
    question: "What purpose and outside constraints led to this choice?",
    reason: "Numerical allocations alone cannot establish intention or moral worth." });
  uncertainties.push({ id: "full-day-unknown",
    question: "How is the rest of the day spent?",
    reason: "The thought experiment only covers one hypothetical " + formatHours(budget) + " block." });

  const philosophicalLink = {
    claimId: model.claim.id,
    proposition: "This allocation makes finite time and foregone alternatives visible. Seneca's reconstructed question concerns the meaningful use of time, which cannot be deduced from a ratio.",
    interpretationStrength: "illustration_not_proof",
    relationIds: ["rel-finite-budget", "rel-forgone-alternatives", "rel-deliberateness"],
  };
  trace("philosophical-bridge", "Finite allocation illustrates the reconstructed Senecan concern with use, rather than amount, of time",
    ["philosophical-link"], philosophicalLink.relationIds, "interpretive_possibility");

  const findings = [...necessary, ...possible].map(x => x.id);
  return {
    schemaVersion: REASONING_RESULT_SCHEMA_VERSION,
    mechanism: "tradeoff",
    model: { id: model.id, quoteId: model.quote.legacyId,
      reviewStatus: model.editorial.reviewStatus,
      sourceContextVerified: model.editorial.sourceContextVerified,
      productionEligible: model.editorial.productionEligible },
    what_happened: {
      summary: "Within this hypothetical " + formatHours(budget) + " block: " + allocationSummary + ".",
      allocation, percentages,
      signals: {
        magnitude: { maxHours: max, maxSharePercent: rounded(maxShare * 100), leaderIds: leaders },
        balance: { index: balanceIndex, maxMinGapHours: rounded(max - min),
          description: "0 = entirely concentrated; 1 = evenly distributed. This is descriptive, not a goodness score." },
        extremes: { exclusive: dominance === "exclusive", excludedCategoryIds: excluded },
        combinations: { rankedCategoryIds: ordered, activeCategoryIds: positive, dominance },
        contradictions: { apparentStatedPriorityMismatch: mismatch, isFormalLogicalContradiction: false },
        context: { cadence, statedPriority },
      },
      patterns,
    },
    what_follows: {
      necessary,
      possible,
      tensions,
      philosophical_connection: philosophicalLink,
    },
    what_remains_uncertain: uncertainties,
    why_this: {
      modelId: model.id,
      sourceStatus: model.quote.wordingStatus,
      editorialStatus: model.editorial.reviewStatus,
      rule_trace: ruleTrace,
      interpretive_boundaries: model.interpretiveBoundaries,
    },
    expression_handoff: {
      status: "placeholder_only",
      findingIds: findings,
      permittedStyleCandidates: ["reflective", "surprising", "playful", "challenging"],
      instruction: "Never change the epistemic status of a finding or invent consequences.",
    },
    tension_gate_handoff: {
      status: "placeholder_only",
      optionalSecondRoundCandidate: cadence === "unknown" ? "Is this a one-off arrangement or a recurring one?" :
        "Which of the excluded or smaller priorities matters most beyond this block?",
      firstRoundComplete: true,
      triggered: false,
    },
  };
}
