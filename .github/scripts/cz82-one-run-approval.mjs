// CZ-82 — owner-authorized, single-run Kimi activation gate.
// No provider quota telemetry is claimed. Exact owner issue transition is
// a one-use authorization assertion, not a financial/account-side spend cap.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const B1 = Object.freeze({
  repository: "OWEF/Yourlogos",
  owner: "OWEF",
  issueNumber: 119,
  before: "[CZ81-B1-READY] Quiet companion motion preview",
  after: "[RUN-CZ81-B1-APPROVED] Quiet companion motion preview",
  maxWallSeconds: 150,
  maxStepsPerTurn: 8,
  workflow: ".github/workflows/cz82-one-run-lillogo-b1.yml"
});

function requireCondition(ok, message) {
  if (!ok) throw new Error("CZ82 DENY: " + message);
}

export function authorizeOneShot(event, context, spec = B1) {
  requireCondition(context?.repository === spec.repository, "wrong repository");
  requireCondition(context?.actor === spec.owner, "non-owner actor");
  requireCondition(event?.action === "edited", "non-edit event");
  requireCondition(event?.repository?.full_name === spec.repository, "spoofed repository");
  requireCondition(event?.sender?.login === spec.owner, "non-owner sender");
  requireCondition(event?.issue?.user?.login === spec.owner, "not owner-created issue");
  requireCondition(event?.issue?.number === spec.issueNumber, "wrong issue");
  requireCondition(event?.issue?.pull_request == null, "PR is not a task issue");
  requireCondition(event?.changes?.title?.from === spec.before, "not exact READY predecessor");
  requireCondition(event?.issue?.title === spec.after, "not exact approved RUN title");
  return { issue: spec.issueNumber, approved: true, modelUsage: "not_verified" };
}

export function verifyOneRunWorkflow(source, spec = B1) {
  const ok = (predicate, key) => requireCondition(predicate, "workflow/" + key);
  ok(source.includes("on:\n  issues:\n    types: [edited]"), "event");
  ok(source.includes("github.repository == 'OWEF/Yourlogos'"), "repository");
  ok(source.includes("github.actor == 'OWEF'") &&
      source.includes("github.event.issue.user.login == 'OWEF'") &&
      source.includes("github.event.issue.number == 119") &&
      source.includes("github.event.issue.title == '" + spec.after + "'") &&
      source.includes("github.event.changes.title.from == '" + spec.before + "'"), "owner-trust");
  ok(source.includes("node .github/scripts/cz82-one-run-approval.mjs --event \"$GITHUB_EVENT_PATH\""), "runtime-proof");
  ok(source.includes("node .github/scripts/cz82-one-run-approval.mjs --check"), "static-proof");
  ok(source.includes("group: cz-69-kimi-coding") &&
      source.includes("cancel-in-progress: false") &&
      !/^concurrency:/m.test(source), "single-worker");
  ok(source.includes("--agent-file .github/kimi/profiles/frontend-ux.md"), "role");
  ok(source.includes("KIMI_LOOP_MAX_STEPS_PER_TURN: '8'") &&
      source.includes("KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '1'") &&
      source.includes("KIMI_CODE_INFINITE_RETRY: 'false'") &&
      source.includes("timeout --signal=TERM --kill-after=5s 150s"), "bounded-run");
  ok(source.includes("npm install --global '@moonshot-ai/kimi-code@2.4.1'"), "pinned-cli");
  ok(source.includes("persist-credentials: false"), "read-checkout");
  ok(source.includes("if [[ ! -s experiments/cz81-curious-companion-lab.html ]]") &&
      source.includes("tests/cz81-curious-companion-lab.test.mjs") &&
      source.includes("experiments/cz81-curious-companion-lab.html|tests/cz81-curious-companion-lab.test.mjs"), "file-scope");
  const gate = source.indexOf("- name: Verify one-run owner authorization (no model)");
  const install = source.indexOf("- name: Install pinned Kimi CLI before exposing membership key");
  const secret = source.indexOf("KIMI_MODEL_API_KEY: ");
  ok(gate > 0 && install > gate && secret > install, "gate-before-secret");
  ok(source.includes("gh pr create --draft --base main") &&
      !source.includes("gh pr merge") && !source.includes("gh run rerun"), "no-release-retry");
  const writer = source.split("  open-draft-pr:")[1] || "";
  ok(writer.length > 0 && !writer.includes("KIMI_MODEL_API_KEY:") &&
      !writer.includes("node --test"), "writer-isolation");
  ok(!/path:.*kimi-(stdout|stderr)/.test(source), "no-raw-logs");
  // The old persistent CZ75 variable remains default-off for legacy jobs;
  // this new route is authorized via an exact founder issue transition.
  ok(!source.includes("CZ75_MANUAL_QUOTA_READY"), "no-manual-toggle");
  return true;
}

function main() {
  const op = process.argv[2];
  if (op === "--check") {
    const source = readFileSync(resolve(B1.workflow), "utf8");
    verifyOneRunWorkflow(source);
    process.stdout.write("CZ82 one-run static gate PASS; no model use or extra spend\n");
  } else if (op === "--event") {
    const path = process.argv[3];
    requireCondition(typeof path === "string" && path.length > 0, "missing event");
    const event = JSON.parse(readFileSync(resolve(path), "utf8"));
    authorizeOneShot(event, {
      repository: process.env.GITHUB_REPOSITORY,
      actor: process.env.GITHUB_ACTOR
    });
    process.stdout.write("CZ82 owner-issue one-run authorization PASS; provider quota NOT verified\n");
  } else {
    throw Error("Usage: --check OR --event <GITHUB_EVENT_PATH>");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
