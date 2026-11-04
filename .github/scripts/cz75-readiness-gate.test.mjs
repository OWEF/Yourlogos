import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  verifyReadinessPolicy, verifyWorkflowSource, verifyRepo
} from "./cz75-readiness-gate.mjs";

const policy=JSON.parse(readFileSync(new URL("../kimi/cz75-readiness-policy.json",import.meta.url),"utf8"));
const readText=path=>readFileSync(new URL("../../"+path,import.meta.url),"utf8");
const clone=()=>structuredClone(policy);
const role=policy.workflows.find(x=>x.role==="testing-qa");
const baseline=readText(role.path);

test("only the reviewed five small owner-bound workflows pass, without a model",()=>{
  assert.equal(verifyReadinessPolicy(policy),true);
  assert.deepEqual(verifyRepo(policy,readText),{
    workflowCount:5,modelUsage:"not_verified",mode:"small-trusted-owner-tasks-only"
  });
});

test("budget escalation, parallel agents and false quota telemetry fail closed",()=>{
  for(const mutate of [
    p=>p.maxConcurrentKimiJobs=2,
    p=>p.tiers.normal.enabled=true,
    p=>p.tiers.small.maxWallSeconds=300,
    p=>p.tiers.small.maxStepsPerTurn=18,
    p=>p.quotaSource="provider-verifiable",
    p=>p.quotaAttestation.defaultOn=true,
    p=>p.reservePlanningPercent.untouchedReserve=0,
    p=>p.workflows[2].issue=999
  ]){
    const p=clone();mutate(p);
    assert.throws(()=>verifyReadinessPolicy(p),/CZ-75 readiness check/);
  }
});

test("missing manual gate, wrong owner, wrong cap and unsafe retries fail",()=>{
  const hazards=[
    baseline.replace("CZ75_MANUAL_QUOTA_READY: \${{ vars.CZ75_MANUAL_QUOTA_READY }}","CZ75_MANUAL_QUOTA_READY: true"),
    baseline.replace("github.actor == 'OWEF'","github.actor == 'anyone'"),
    baseline.replace("issue.number == 103","issue.number == 999"),
    baseline.replace("timeout --signal=TERM --kill-after=5s 150s","timeout --signal=TERM --kill-after=5s 600s"),
    baseline.replace("KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '1'","KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '10'"),
    baseline.replace("    concurrency:\n      group: cz-69-kimi-coding\n      cancel-in-progress: false","concurrency:\n  group: cz-69-kimi-coding\n  cancel-in-progress: false"),
    baseline.replace("gh pr create --draft","gh pr merge")
  ];
  for(const src of hazards)assert.throws(()=>verifyWorkflowSource(src,role),/boundary/);
});

test("writer jobs cannot carry a Kimi model secret",()=>{
  const unsafe=baseline.replace(
    "  open-draft-pr:",
    "  open-draft-pr:\n    # KIMI_MODEL_API_KEY: injected-hypothetical"
  );
  assert.throws(()=>verifyWorkflowSource(unsafe,role),/boundary/);
});

test("the manual attestation is an operator declaration, not a financial cap",()=>{
  assert.equal(policy.quotaSource,"operator-only-not-machine-verified");
  assert.equal(policy.quotaAttestation.defaultOn,false);
  assert.equal(policy.tiers.complex.enabled,false);
  assert.equal(policy.automaticProductionMerge,false);
});
