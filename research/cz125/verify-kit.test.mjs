/**
 * CZ-125 methodology SAFETY HOLD tests. A PASS here means the old inadequate
 * instrument is safely blocked, NOT that the original six-dimensional
 * preregistration has been inspected or reconciled, and NOT learning efficacy.
 * No simulated respondents or synthetic human data are constructed.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {Script,runInNewContext} from "node:vm";

const root=new URL("./",import.meta.url);
const load=name=>readFileSync(new URL(name,root),"utf8");
const prototypeSha="73849bff27fc73db97d5fb015c57f45323e18f30";
const originalDocId="bf106341-8403-4c88-a71a-67d414f2972d";
const originalCommentId="80458715-2441-4492-bcb7-945eaf3246a8";

test("corrective kit is anchored to exact accepted research UI and known original provenance",()=>{
 const docs=["PROTOCOL.md","reader-response.html","FOUNDER-GATE.md",
  "PREREG-RECONCILIATION-v0.1.md"];
 for(const name of docs)assert.ok(load(name).includes(prototypeSha),name);
 const reconciliation=load("PREREG-RECONCILIATION-v0.1.md");
 for(const s of [originalDocId,originalCommentId,"get_document","truncated",
   "NOT INSPECTED","PREREGISTRATION_APPROVED: false",
   "ENROLLMENT_AUTHORIZED: false"])
  assert.ok(reconciliation.includes(s),s);
});
test("reconciliation covers every conflicted original objective and refuses false 4-axis to 6-dimension mapping",()=>{
 const doc=load("PREREG-RECONCILIATION-v0.1.md");
 for(const phrase of ["Baseline measurement","Post-game comprehension","Misconception",
  "Philosophical transfer","Delayed recall","Learning dimensions",
  "Pass/fail thresholds","Participants per game"])
  assert.ok(doc.includes(phrase),"missing comparison item: "+phrase);
 assert.match(doc,/six learning dimensions/i);
 assert.match(doc,/four.*six/i);
 assert.match(doc,/full.*document.*NOT INSPECTED/i);
 assert.match(doc,/conditional n>=10|minimum is .*10/i);
 assert.match(doc,/>=4\/5/i);
 assert.match(doc,/20–28/);
 assert.doesNotMatch(doc,/PREREGISTRATION_APPROVED: true/);
});
test("protocol forbids enrollment and declares all original baseline/misconception/transfer wording unknown",()=>{
 const p=load("PROTOCOL.md");
 for(const word of ["ENROLLMENT PROHIBITED","NOT accessible","UNKNOWN; recover first",
  "counterexample","transfer","20–28","six","10 unique"])
  assert.ok(p.toLowerCase().includes(word.toLowerCase()),word);
 assert.match(p,/source.*comment/i);
 assert.match(p,/conditional/i);
 assert.doesNotMatch(p,/Original CZ-125 established no universal numeric PASS cutoff/);
});
test("offline form exposes all three phase names, but is hard disabled pending original study and no export can occur",()=>{
 const html=load("reader-response.html");
 assert.match(html,/<fieldset disabled id="cz125-instrument-locked">/);
 assert.match(html,/<button[^>]*id="export" disabled/);
 assert.match(html,/const PREREGISTRATION_APPROVED=false/);
 for(const phase of ["baseline","immediate","delayed"])
  assert.ok(html.includes('value="'+phase+'"'));
 for(const id of ["baseline-instrument","misconception-instrument","transfer-instrument"])
  assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/original.*six-dimensional/i);
 assert.match(html,/20–28-hour/i);
 assert.match(html,/voluntar/i);
 assert.doesNotMatch(html,/<script[^>]*src=/i);
 assert.doesNotMatch(html,/<link[^>]*rel="stylesheet"[^>]*href=/i);
 assert.doesNotMatch(html,/\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/i);
 assert.doesNotMatch(html,/\b(?:localStorage|sessionStorage|indexedDB)\b/i);
 const match=html.match(/<script>([\s\S]*?)<\/script>/i);
 assert.ok(match,"self-contained response JS required");
 new Script(match[1],{filename:"reader-response.html"});
 let callback=null,blocked=0,downloaded=false;
 const form={addEventListener:(event,handler)=>{
  assert.equal(event,"submit");callback=handler;
 },reportValidity:()=>{throw Error("The blocked form must not attempt field validation");}};
 const message={textContent:""};
 const dom={getElementById:id=>{
  if(id==="response")return form;
  if(id==="state")return message;
  throw Error("Disallowed attempt to inspect form input while enrollment is held: "+id);
 }};
 const fakeURL={createObjectURL:()=>{downloaded=true;throw Error("unapproved download");}};
 runInNewContext(match[1],{document:dom,URL:fakeURL,
  Blob:class{constructor(){downloaded=true;throw Error("unapproved blob");}},
  setTimeout:()=>{downloaded=true;throw Error("timer should not run");}});
 assert.equal(typeof callback,"function");
 callback({preventDefault:()=>blocked++});
 assert.equal(blocked,1);
 assert.equal(downloaded,false);
 assert.match(message.textContent,/NOT APPROVED/i);
});
test("inventory explicitly declares six-dimension source inaccessible and never certifies participant gain",()=>{
 const a=load("audit-local-evidence.mjs");
 assert.match(a,/preregistrationApproved:false/);
 assert.match(a,/originalFullBodyInspected:false/);
 assert.match(a,/originallyCommentedDelayedHours:\{min:20,max:28\}/);
 assert.match(a,/phaseNames:\["baseline","immediate","delayed"\]/);
 assert.match(a,/originalDenominatorsResolved:false/);
 const result=JSON.parse(execFileSync(process.execPath,
  [new URL("audit-local-evidence.mjs",root).pathname],{encoding:"utf8"}));
 assert.equal(result.status,"PROTOCOL_UNAPPROVED");
 assert.equal(result.enrollmentAuthorized,false);
 assert.equal(result.originalDocumentFullBodyInspected,false);
 for(const field of ["verifiedGenuineParticipants","verifiedBaseline",
  "verifiedImmediate","verifiedDelayed","verifiedPairedPrePost",
  "verifiedCounterexample","verifiedTransfer","verifiedSixDimensionScores","verifiedLearningGain"])
  assert.equal(result[field],0);
 assert.deepEqual(result.phaseNames,["baseline","immediate","delayed"]);
 assert.deepEqual(result.delayedTargetHours,{min:20,max:28});
 assert.equal(result.denominatorResolved,false);
 assert.equal(result.conditionedMinimumPerGame,5);
 assert.equal(result.observedPrivateJsonFileCount,0);
});
test("founder acceptance remains blocked; no private HTTPS deployment or human source scholar/device claims",()=>{
 const d=load("FOUNDER-GATE.md"), preview=load("PRIVATE-HTTPS-PREVIEW.md");
 assert.match(d,/UNAPPROVED \/ BLOCK/);
 assert.match(d,/0 baseline responses/i);
 assert.match(d,/0 immediate responses/i);
 assert.match(d,/0 valid follow-ups/i);
 assert.match(d,/per game/i);
 assert.match(d,/CZ-121/);
 assert.match(d,/CZ-126/);
 assert.match(d,/final.*BLOCK/i);
 assert.match(preview,/NOT DEPLOYED/);
 assert.match(preview,/Host\/Origin/);
});
