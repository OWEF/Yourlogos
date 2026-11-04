import test from "node:test";
import assert from "node:assert/strict";
import { planAgentTask, evaluateHumanAllowance, TIERS, ALLOCATION } from "./cz75-smart-allowance.mjs";

const attested = { extraUsageDisabled: true, monthlyUsedPercent: 21, fiveHourUsedPercent: 10 };
const task = (overrides = {}) => ({
  project: "YourLogos", kind: "bugfix", reproduced: true,
  hasAcceptanceCriteria: true, hasFileAllowlist: true,
  hasRollbackPlan: true, hasSourceContext: true,
  expectedFiles: 2, referenceAssets: 0, estimatedAgentSteps: 6,
  ...overrides
});
test("60/20/20 reserve is a planning allocation, not measured provider credits", () => {
  assert.deepEqual(ALLOCATION, { approvedEngineering:60, debuggingAndRework:20, untouchedReserve:20 });
});
test("all tier budgets remain bounded and adviser can never authorize execution", () => {
  assert.deepEqual([TIERS.small.maxWallSeconds,TIERS.normal.maxWallSeconds,TIERS.complex.maxWallSeconds], [150,360,600]);
  for (const t of [task(), task({kind:"animation",referenceAssets:2,estimatedAgentSteps:14}), task({estimatedAgentSteps:24})]) {
    const p=planAgentTask(t,attested);
    assert.equal(p.authorizedToDispatch,false);
    assert.equal(p.accountBillingCapVerified,false);
    assert.equal(p.requiresOneUseFounderApproval,true);
  }
});
test("ordinary narrow bugfix chooses small; visual animation chooses normal not a 150s timeout", () => {
  const a=planAgentTask(task(),attested);
  assert.equal(a.decision,"candidate");
  assert.equal(a.tier,"small");
  const b=planAgentTask(task({kind:"animation",expectedFiles:2,referenceAssets:2,estimatedAgentSteps:14,contextPacketReady:true}),attested);
  assert.equal(b.decision,"candidate");
  assert.equal(b.tier,"normal");
  assert.equal(b.requiresSeparatelyReviewedWorkflow,true);
  assert.equal(b.currentHarnessTierEnabled,false);
});
test("large multi-asset assignments without a prepared context pack are split", () => {
  const p=planAgentTask(task({kind:"animation",referenceAssets:6,expectedFiles:2,estimatedAgentSteps:14}),attested);
  assert.equal(p.decision,"split");
  const q=planAgentTask(task({kind:"animation",referenceAssets:6,expectedFiles:4,estimatedAgentSteps:29,contextPacketReady:true}),attested);
  assert.equal(q.decision,"split");
});
test("missing tests, rollback and sensitive data never qualify as model tasks", () => {
  for (const change of [
    {hasAcceptanceCriteria:false},{hasRollbackPlan:false},
    {hasFileAllowlist:false},{hasSourceContext:false},
    {secretsOrProductionChange:true},{databaseOrAuthChange:true}
  ]) assert.equal(planAgentTask(task(change),attested).decision,"hold");
});
test("zero-model work comes first; nonpriority live products defer optional changes", () => {
  assert.equal(planAgentTask(task({kind:"review"}),attested).decision,"no-model");
  assert.equal(planAgentTask(task({project:"TrendForge",kind:"feature"}),attested).decision,"defer");
  assert.equal(planAgentTask(task({project:"CryptoComply",kind:"incident",reproduced:true}),attested).decision,"candidate");
});
test("unverified or overage-enabled accounts cannot be mistaken for verified quota", () => {
  assert.equal(evaluateHumanAllowance(null).state,"unverified");
  assert.equal(evaluateHumanAllowance({...attested,extraUsageDisabled:false}).state,"unverified");
  assert.equal(evaluateHumanAllowance({...attested,monthlyUsedPercent:120}).state,"unverified");
  assert.equal(planAgentTask(task()).humanAllowance.mayAutomaticallySpend,false);
});
test("monthly reserve and five-hour pressure defer non-urgent Kimi, not verified emergencies", () => {
  assert.equal(planAgentTask(task(),{...attested,monthlyUsedPercent:83}).decision,"defer");
  assert.equal(planAgentTask(task(),{...attested,fiveHourUsedPercent:89}).decision,"defer");
  assert.equal(planAgentTask(task({kind:"incident",reproduced:true}),{...attested,monthlyUsedPercent:83}).decision,"candidate");
});
test("unknown snapshots yield advice but still require separate human authorization",()=>{
  const p=planAgentTask(task(),null);
  assert.equal(p.decision,"candidate");
  assert.equal(p.humanAllowance.state,"unverified");
  assert.equal(p.authorizedToDispatch,false);
});
