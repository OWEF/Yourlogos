// CZ-83: owner-approved ONE run for CZ-81 B1b. Does not issue a model call.
// This is NOT Kimi quota telemetry or a billing cap.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { authorizeOneShot } from "./cz82-one-run-approval.mjs";

export const B1B = Object.freeze({
  repository: "OWEF/Yourlogos",
  owner: "OWEF",
  issueNumber: 125,
  before: "[CZ81-B1B-READY] Faithful LilLogo head and eye motion preview",
  after: "[RUN-CZ81-B1B-APPROVED] Faithful LilLogo head and eye motion preview",
  maxWallSeconds: 360,
  maxStepsPerTurn: 18,
  workflow: ".github/workflows/cz83-one-run-lillogo-b1b.yml"
});

const requireBound = (ok, reason) => {
  if (!ok) throw new Error("CZ83 DENY: " + reason);
};
export function permit(event, context) {
  return authorizeOneShot(event, context, B1B);
}
export function checkWorkflow(source) {
  const has = (s,reason) => requireBound(source.includes(s),reason);
  has("on:\n  issues:\n    types: [edited]", "only edited issues");
  for (const phrase of [
    "github.repository == 'OWEF/Yourlogos'",
    "github.actor == 'OWEF'",
    "github.event.issue.user.login == 'OWEF'",
    "github.event.issue.number == 125",
    "github.event.issue.title == '" + B1B.after + "'",
    "github.event.changes.title.from == '" + B1B.before + "'",
    "node .github/scripts/cz83-b1b-approval.mjs --check",
    'node .github/scripts/cz83-b1b-approval.mjs --event "$GITHUB_EVENT_PATH"',
    "group: cz-69-kimi-coding",
    "cancel-in-progress: false",
    "KIMI_LOOP_MAX_STEPS_PER_TURN: '18'",
    "KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '1'",
    "KIMI_CODE_INFINITE_RETRY: 'false'",
    "timeout --signal=TERM --kill-after=5s 360s",
    "--agent-file .github/kimi/profiles/frontend-ux.md",
    "npm install --global '@moonshot-ai/kimi-code@2.4.1'",
    "persist-credentials: false",
    "gh pr create --draft --base main",
    "name: cz83-lillogo-b1b-candidate"
  ]) has(phrase, "missing "+phrase);
  requireBound(source.includes("timeout-minutes: 8"), "model step timeout");
  requireBound(source.includes("timeout-minutes: 12"), "job timeout");
  requireBound(!source.includes("CZ75_MANUAL_QUOTA_READY"), "no manual variable required");
  requireBound(!source.includes("gh pr merge") && !source.includes("gh run rerun"), "no merge/retry");
  requireBound(!/path:.*kimi-(stdout|stderr)/.test(source), "no raw model logs");
  requireBound(!source.includes("schedule:") && !source.includes("workflow_dispatch:"),
    "no standing/scheduled tasks");
  const marker="experiments/cz81-b1b-faithful-lillogo.html|tests/cz81-b1b-faithful-lillogo.test.mjs";
  requireBound(source.split(marker).length===3,"candidate allowlist in BOTH implementation and writer jobs");
  requireBound(source.includes("git add -- experiments/cz81-b1b-faithful-lillogo.html tests/cz81-b1b-faithful-lillogo.test.mjs"),
    "writer cannot commit anything else");
  const [model,writer] = source.split("  open-draft-pr:");
  requireBound(Boolean(writer) && writer.length>100, "writer exists");
  requireBound(model.includes("KIMI_MODEL_API_KEY:") && !writer.includes("KIMI_MODEL_API_KEY:"),
    "Kimi secret isolated from PR writer");
  requireBound(model.includes("node --test tests/cz81-b1b-faithful-lillogo.test.mjs"),
    "actual generated test executed without Kimi credentials");
  const gate=model.indexOf("- name: Verify one-run owner authorization (no model)");
  const secret=model.indexOf("KIMI_MODEL_API_KEY: ");
  requireBound(gate>0 && secret>gate,"preflight comes before key");
  requireBound(!/^concurrency:/m.test(source),"no global cancel or batch scheduler");
  return true;
}
function main() {
  if (process.argv[2] === "--check") {
    checkWorkflow(readFileSync(resolve(B1B.workflow),"utf8"));
    process.stdout.write("CZ83 normal-tier 360s owner-only static checks PASS, zero model usage\n");
    return;
  }
  if (process.argv[2] === "--event") {
    const name=process.argv[3];
    requireBound(typeof name==="string" && name.length>0,"missing event file");
    permit(JSON.parse(readFileSync(resolve(name),"utf8")),{
      repository:process.env.GITHUB_REPOSITORY,actor:process.env.GITHUB_ACTOR
    });
    process.stdout.write("CZ83 exact issue 125 one-use authorization PASS; quota NOT verified\n");
    return;
  }
  throw new Error("Usage: --check | --event <path>");
}
if (process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) main();
