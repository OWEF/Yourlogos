// CZ-75 — advisory zero-model planning. This code NEVER authorizes a Kimi call.
// Model execution requires the separately reviewed CZ-82 one-run owner issue gate.
export const TIERS = Object.freeze({
  zero: Object.freeze({ maxWallSeconds: 0, maxStepsPerTurn: 0, model: false }),
  small: Object.freeze({ maxWallSeconds: 150, maxStepsPerTurn: 8, model: true }),
  normal: Object.freeze({ maxWallSeconds: 360, maxStepsPerTurn: 18, model: true }),
  complex: Object.freeze({ maxWallSeconds: 600, maxStepsPerTurn: 30, model: true })
});
export const ALLOCATION = Object.freeze({
  approvedEngineering: 60, debuggingAndRework: 20, untouchedReserve: 20
});
const allowed = new Set(["YourLogos", "TrendForge", "CryptoComply", "ZA Portfolio", "Job Agent", "PulseOS", "Other"]);
const allowedKinds = new Set(["feature", "animation", "test", "bugfix", "incident", "research", "review", "documentation"]);

function validPct(n) {
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

// A human account snapshot is not model/provider telemetry. No session
// should be dispatched solely because this function returns "attested".
export function evaluateHumanAllowance(attestation) {
  if (!attestation || attestation.extraUsageDisabled !== true ||
      !validPct(attestation.monthlyUsedPercent) ||
      !validPct(attestation.fiveHourUsedPercent)) {
    return { state: "unverified", mayAutomaticallySpend: false };
  }
  if (attestation.monthlyUsedPercent >= 80) {
    return { state: "monthly-reserve", mayAutomaticallySpend: false };
  }
  if (attestation.fiveHourUsedPercent >= 80) {
    return { state: "rolling-window-full", mayAutomaticallySpend: false };
  }
  return { state: "human-attested", mayAutomaticallySpend: false };
}

function reply(decision, tier, reasons, humanAllowance) {
  return Object.freeze({
    decision,
    tier,
    budget: TIERS[tier],
    reasons: Object.freeze(reasons),
    reservePlanning: ALLOCATION,
    humanAllowance,
    requiresOneUseFounderApproval: TIERS[tier].model,
    // This policy cannot switch on model runs or enable legacy tier settings.
    authorizedToDispatch: false,
    currentHarnessTierEnabled: tier === "small",
    requiresSeparatelyReviewedWorkflow: tier === "normal" || tier === "complex",
    modelUsageTelemetry: "unavailable",
    accountBillingCapVerified: false
  });
}

export function planAgentTask(task, attestation) {
  const quota = evaluateHumanAllowance(attestation);
  if (!task || !allowed.has(task.project) || !allowedKinds.has(task.kind)) {
    return reply("hold", "zero", ["Missing recognized project or task kind"], quota);
  }
  const incident = task.kind === "incident" && task.reproduced === true;
  // Other deployed projects are BAU; only real incidents get discretionary Kimi.
  if (task.project !== "YourLogos" && !incident) {
    return reply("defer", "zero", ["Deployed projects remain monitoring/maintenance only; no speculative coding"], quota);
  }
  if (["research", "review", "documentation"].includes(task.kind) ||
      task.deterministicWithoutModel === true) {
    return reply("no-model", "zero", ["Use existing files, human/ChatGPT review and CI before spending Kimi allowance"], quota);
  }
  if (!task.hasAcceptanceCriteria || !task.hasFileAllowlist ||
      !task.hasRollbackPlan || !task.hasSourceContext) {
    return reply("hold", "zero", ["Define acceptance tests, allowed files, existing context and rollback first"], quota);
  }
  if (task.secretsOrProductionChange === true || task.databaseOrAuthChange === true) {
    return reply("hold", "zero", ["Sensitive/production work requires independent security review and explicit founder decision"], quota);
  }
  const files = task.expectedFiles;
  const assets = task.referenceAssets ?? 0;
  const steps = task.estimatedAgentSteps;
  if (!Number.isInteger(files) || files < 1 || !Number.isInteger(assets) || assets < 0 ||
      !Number.isInteger(steps) || steps < 1) {
    return reply("hold", "zero", ["Explicit output count, reference count and rough steps are necessary"], quota);
  }
  if (files > 3 || (assets > 3 && task.contextPacketReady !== true) || steps > 30) {
    return reply("split", "zero", ["Overloaded task: prepare one reusable context packet, then split into independently useful deliverables"], quota);
  }
  const tier = (task.kind === "animation" || assets > 1 || steps > 8 || files > 2)
    ? (steps > 18 ? "complex" : "normal") : "small";
  if (quota.state === "monthly-reserve" && !incident) {
    return reply("defer", tier, ["Monthly reserve protected; noncritical new runs are deferred"], quota);
  }
  if (quota.state === "rolling-window-full" && !incident) {
    return reply("defer", tier, ["Rolling five-hour allowance is high; defer noncritical runs"], quota);
  }
  const reasons = tier === "small"
    ? ["Single narrow source change with deterministic tests fits the small planning target"]
    : tier === "normal"
      ? ["Visual/multi-step task needs enough time to complete; small 150-second limits failed previously"]
      : ["Complex scoped task needs separate larger-budget approval; split further if practical"];
  if (quota.state !== "human-attested") {
    reasons.push("Before the next model invocation, founder reconfirms account usage and Extra Usage OFF");
  }
  return reply("candidate", tier, reasons, quota);
}
