import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { B1, authorizeOneShot, verifyOneRunWorkflow } from "./cz82-one-run-approval.mjs";

const context = { repository: "OWEF/Yourlogos", actor: "OWEF" };
const approved = () => ({
  action: "edited",
  repository: { full_name: "OWEF/Yourlogos" },
  sender: { login: "OWEF" },
  issue: { number: 119, user: { login: "OWEF" }, title: B1.after, pull_request: null },
  changes: { title: { from: B1.before } }
});
const workflow = readFileSync(new URL("../workflows/cz82-one-run-lillogo-b1.yml", import.meta.url), "utf8");

test("exact one-time owner title transition is approved", () => {
  assert.deepEqual(authorizeOneShot(approved(), context), {
    issue: 119, approved: true, modelUsage: "not_verified"
  });
});
test("all other actors, repositories and issue numbers fail closed", () => {
  for (const bad of [
    [e => e.sender.login = "another", context],
    [e => e.issue.user.login = "another", context],
    [e => e.issue.number = 118, context],
    [e => e.repository.full_name = "another/repo", context],
    [e => e.issue.pull_request = {}, context],
    [e => e.action = "created", context],
    [e => e.issue.title = B1.before, context],
    [e => e.changes.title.from = "[RUN-CZ81-B1-APPROVED] Quiet companion motion preview", context],
    [() => {}, { repository: "OWEF/Yourlogos", actor: "attacker" }],
    [() => {}, { repository: "other/repo", actor: "OWEF" }]
  ]) {
    const e = approved();
    bad[0](e);
    assert.throws(() => authorizeOneShot(e, bad[1]), /CZ82 DENY/);
  }
});
test("zero-model static workflow assertions succeed for audited single job", () => {
  assert.equal(verifyOneRunWorkflow(workflow), true);
  assert.equal(workflow.includes("CZ75_MANUAL_QUOTA_READY"), false);
});
test("removing one-shot or billing-safety boundaries is rejected", () => {
  for (const [before, after] of [
    ["github.actor == 'OWEF'", "github.actor == 'anyone'"],
    ["github.event.issue.number == 119", "github.event.issue.number == 120"],
    [B1.before, "[CZ81-B1-OTHER]"],
    ["timeout --signal=TERM --kill-after=5s 150s", "timeout --signal=TERM --kill-after=5s 600s"],
    ["KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '1'", "KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '5'"],
    ["cancel-in-progress: false", "cancel-in-progress: true"],
    ["gh pr create --draft --base main", "gh pr merge"],
    ["node .github/scripts/cz82-one-run-approval.mjs --check", "echo no-preflight"],
    ["tests/cz81-curious-companion-lab.test.mjs", "tests/any.test.mjs"]
  ]) {
    assert.ok(workflow.includes(before), "Fixture missing: " + before);
    assert.throws(() => verifyOneRunWorkflow(workflow.replace(before, after)), /CZ82 DENY/);
  }
});
test("no always-on quota flag, no schedule, no workflow dispatch and no raw model logs", () => {
  assert.ok(!workflow.includes("schedule:"));
  assert.ok(!workflow.includes("workflow_dispatch:"));
  assert.ok(!workflow.includes("CZ75_MANUAL_QUOTA_READY"));
  assert.ok(!/path:.*kimi-(stdout|stderr)/.test(workflow));
  assert.ok(!workflow.includes("gh pr merge"));
});
