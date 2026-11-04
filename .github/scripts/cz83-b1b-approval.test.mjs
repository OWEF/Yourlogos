import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { B1B, permit, checkWorkflow } from "./cz83-b1b-approval.mjs";

const owner = {repository:"OWEF/Yourlogos",actor:"OWEF"};
const sample=()=>({
 action:"edited",
 repository:{full_name:"OWEF/Yourlogos"},
 sender:{login:"OWEF"},
 issue:{number:125,user:{login:"OWEF"},title:B1B.after,pull_request:null},
 changes:{title:{from:B1B.before}}
});
const workflow=readFileSync(new URL("../workflows/cz83-one-run-lillogo-b1b.yml",import.meta.url),"utf8");

test("only exact issue #125 owner READY -> RUN is allowed",()=>{
 assert.deepEqual(permit(sample(),owner),{issue:125,approved:true,modelUsage:"not_verified"});
 for(const modifier of [
  e=>e.issue.number=119,
  e=>e.sender.login="other",
  e=>e.issue.user.login="other",
  e=>e.repository.full_name="other/name",
  e=>e.issue.title=B1B.before,
  e=>e.changes.title.from="[CZ81-B1-BLOCKED]",
  e=>e.action="created",
  e=>e.issue.pull_request={}
 ]){const e=sample();modifier(e);assert.throws(()=>permit(e,owner),/DENY/)}
 assert.throws(()=>permit(sample(),{repository:"OWEF/Yourlogos",actor:"other"}),/DENY/);
});
test("normal 360s budget and one-run workflow pass exact security assertions",()=>{
 assert.equal(B1B.maxWallSeconds,360);
 assert.equal(B1B.maxStepsPerTurn,18);
 assert.equal(checkWorkflow(workflow),true);
});
test("security mutation denied: owner, task, time, retries, secrets, two file allowlists",()=>{
 const changes=[
  ["github.actor == 'OWEF'","github.actor == 'someone'"],
  ["github.event.issue.number == 125","github.event.issue.number == 119"],
  [B1B.before,"[CZ81-B1B-OTHER]"],
  ["timeout --signal=TERM --kill-after=5s 360s","timeout --signal=TERM --kill-after=5s 900s"],
  ["KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '1'","KIMI_LOOP_MAX_ATTEMPTS_PER_STEP: '5'"],
  ["cancel-in-progress: false","cancel-in-progress: true"],
  ["persist-credentials: false","persist-credentials: true"],
  ["gh pr create --draft --base main","gh pr merge"],
  ["node .github/scripts/cz83-b1b-approval.mjs --check","echo skip"],
  ["experiments/cz81-b1b-faithful-lillogo.html|tests/cz81-b1b-faithful-lillogo.test.mjs",
   "experiments/any-file.html|tests/cz81-b1b-faithful-lillogo.test.mjs"]
 ];
 for(const [before,after] of changes){
  assert.ok(workflow.includes(before),"Fixture absent: "+before);
  assert.throws(()=>checkWorkflow(workflow.replaceAll(before,after)),/CZ83 DENY/,"Mutated boundary accepted: "+before);
 }
});
test("no auto rerun, paid plan, scheduled agent, billing variable, released code",()=>{
 for(const bad of ["CZ75_MANUAL_QUOTA_READY","gh pr merge","gh run rerun","schedule:","workflow_dispatch:"]){
  assert.equal(workflow.includes(bad),false);
 }
 assert.match(workflow,/gh pr create --draft --base main/);
});
