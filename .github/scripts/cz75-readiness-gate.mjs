// CZ-75: zero-model policy verification for single-job, founder-supervised Kimi tasks.
// Static source checks are an early warning system, not an OS sandbox, monetary cap,
// or proof of the current Kimi membership quota.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const EXPECTED = Object.freeze([
  ["cz69-kimi-cz17-pilot.yml", 97, "legacy-test-only", 150, 8, "draft-pr"],
  ["cz76-kimi-qa-pilot.yml", 103, "testing-qa", 150, 8, "draft-pr"],
  ["cz77-kimi-frontend-pilot.yml", 106, "frontend-ux", 150, 8, "draft-pr"],
  ["cz78-kimi-debugging-pilot.yml", 109, "debugging", 120, 6, "allowlisted-issue-comment"],
  ["cz79-kimi-backend-pilot.yml", 112, "backend-apis", 150, 8, "draft-pr"]
]);
const PREFIX = ".github/workflows/";
const SWITCH = "CZ75_MANUAL_QUOTA_READY";

function ensure(condition, problem) {
  if (!condition) throw Error("CZ-75 readiness check: " + problem);
}
export function verifyReadinessPolicy(policy) {
  ensure(policy?.schema === "cz75-supervised-allowance-v1", "schema mismatch");
  ensure(policy.mode === "small-trusted-owner-tasks-only", "unreviewed model automation enabled");
  ensure(policy.maxConcurrentKimiJobs === 1, "parallel models not approved");
  ensure(policy.automaticRetries === false && policy.automaticSubagents === false &&
    policy.automaticProductionMerge === false, "automatic escalation forbidden");
  ensure(policy.quotaSource === "operator-only-not-machine-verified", "fake quota telemetry");
  const a = policy.quotaAttestation;
  ensure(a?.variable === SWITCH && a?.value === "true" &&
    a?.defaultOn === false, "attestation must be default-off");
  const r = policy.reservePlanningPercent;
  ensure(r?.approvedEngineering === 60 && r?.debugRework === 20 &&
    r?.untouchedReserve === 20, "reserve allocation is a planning policy, not provider telemetry");
  ensure(policy.tiers?.small?.enabled === true && policy.tiers.small.maxWallSeconds === 150 &&
    policy.tiers.small.maxStepsPerTurn === 8 && policy.tiers.small.maxAttemptsPerFailedStep === 1 &&
    policy.tiers.small.requiresOwnerIssueTrigger === true, "small tier budget changed");
  ensure(policy.tiers?.normal?.enabled === false && policy.tiers?.complex?.enabled === false,
    "unapproved normal/complex tier enabled");
  ensure(Array.isArray(policy.workflows) && policy.workflows.length === EXPECTED.length,
    "unexpected number of model workflows");
  for (let i = 0; i < EXPECTED.length; i++) {
    const [filename, issue, role, secs, steps, artifact] = EXPECTED[i];
    const x = policy.workflows[i];
    ensure(x?.path === PREFIX + filename && x?.issue === issue &&
      x.role === role && x.maxWallSeconds === secs &&
      x.maxStepsPerTurn === steps && x.artifactType === artifact,
    "unreviewed workflow manifest change: " + filename);
  }
  return true;
}
export function verifyWorkflowSource(source, entry) {
  const fail = (s) => ensure(s, entry.path + " failed static boundary");
  const number = entry.issue;
  fail(source.includes("github.repository == 'OWEF/Yourlogos'"));
  fail(source.includes("github.actor == 'OWEF'") &&
    source.includes("github.event.issue.user.login == 'OWEF'") &&
    source.includes("github.event.issue.number == " + number) &&
    source.includes("github.event.changes.title.from"));
  fail(/on:\s*\n  issues:\s*\n    types: \[edited\]/.test(source));
  fail(!/^concurrency:/m.test(source));
  fail(/^\s{4}concurrency:\s*\n\s{6}group: cz-69-kimi-coding\s*\n\s{6}cancel-in-progress: false/m.test(source));
  fail(source.includes("KIMI_LOOP_MAX_STEPS_PER_TURN: '" + entry.maxStepsPerTurn + "'"));
  fail(source.includes("KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '1'") &&
    source.includes("KIMI_CODE_INFINITE_RETRY: 'false'"));
  fail(source.includes("timeout --signal=TERM --kill-after=5s " + entry.maxWallSeconds + "s"));
  fail(source.includes("npm install --global '@moonshot-ai/kimi-code@2.4.1'"));
  if (entry.role !== "legacy-test-only") {
    fail(source.includes("--agent-file .github/kimi/profiles/" + entry.role + ".md"));
    fail(source.includes("node .github/scripts/cz69-role-router.mjs --check"));
  }
  fail(source.includes("persist-credentials: false"));
  fail(source.includes("CZ75 manual quota and billing attestation") &&
    source.includes("CZ75_MANUAL_QUOTA_READY: \${{ vars.CZ75_MANUAL_QUOTA_READY }}") &&
    source.includes("CZ75 HOLD: quota status and Extra Usage setting require operator review"));
  const gateAt = source.indexOf("- name: CZ75 manual quota and billing attestation");
  const installAt = source.indexOf("- name: Install pinned Kimi CLI before exposing membership key");
  const secretAt = source.indexOf("KIMI_MODEL_API_KEY: \${{ secrets.KIMI_CODE_API_KEY }}");
  fail(gateAt > 0 && installAt > gateAt && secretAt > installAt);
  fail(!source.includes("gh pr merge") && !source.includes("gh run rerun") &&
    !source.includes("cancel-in-progress: true"));
  fail(!/path:.*(?:kimi-stdout|kimi-stderr|kimi-d-raw)/.test(source));
  if (entry.artifactType === "draft-pr") {
    fail(source.includes("gh pr create --draft"));
    const writer = source.split("  open-draft-pr:")[1] || "";
    fail(writer && !writer.includes("KIMI_MODEL_API_KEY:"));
  } else {
    fail(source.includes("gh issue comment 109") && !source.includes("gh pr create"));
    const writer = source.split("  publish-diagnosis:")[1] || "";
    fail(writer && !writer.includes("KIMI_MODEL_API_KEY:"));
  }
  return true;
}
export function verifyRepo(policy, readText) {
  verifyReadinessPolicy(policy);
  for (const entry of policy.workflows) verifyWorkflowSource(readText(entry.path), entry);
  return {workflowCount:policy.workflows.length, modelUsage:"not_verified", mode:policy.mode};
}
function runCli() {
  const policy = JSON.parse(readFileSync(resolve(".github/kimi/cz75-readiness-policy.json"), "utf8"));
  const arg = process.argv[2] || "--check";
  if (arg === "--check") {
    const result = verifyRepo(policy, p=>readFileSync(resolve(p), "utf8"));
    console.log("CZ-75 safe policy PASS: " + result.workflowCount +
      " owner-only workflows; one model job at a time; no provider usage inferred.");
  } else {
    const target=policy.workflows.find(w=>w.path===arg);
    ensure(target, "unknown task workflow in preflight");
    verifyReadinessPolicy(policy);
    verifyWorkflowSource(readFileSync(resolve(target.path),"utf8"),target);
    console.log("CZ-75 zero-model policy PASS: " + target.role +
      "; operator quota attestation is a separate manual control.");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) runCli();
