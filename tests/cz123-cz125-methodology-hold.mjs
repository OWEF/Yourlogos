/**
 * CZ-123 INDEPENDENT methodological safety review.
 * Exact candidate: PR #193 SHA 7ec22e2c0010c004fca8a82c845630f7d4d63539.
 * A passing test means enrollment cannot mistakenly start; it does NOT mean
 * the inaccessible original Linear protocol is finally reconciled.
 * No synthetic participant records or pseudohuman interviews.
 */
import {chromium} from "playwright-core";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import assert from "node:assert/strict";
const root=new URL("../research/cz125/",import.meta.url);
const read=filename=>readFileSync(new URL(filename,root),"utf8");
const expected="73849bff27fc73db97d5fb015c57f45323e18f30";
const candidate="7ec22e2c0010c004fca8a82c845630f7d4d63539";
const sourceId="bf106341-8403-4c88-a71a-67d414f2972d";
const commentId="80458715-2441-4492-bcb7-945eaf3246a8";
const doc=read("PREREG-RECONCILIATION-v0.1.md");
const protocol=read("PROTOCOL.md");
const gate=read("FOUNDER-GATE.md");

assert.ok(doc.includes(sourceId)&&doc.includes(commentId));
assert.match(doc,/EMPTY OBJECT/);
assert.match(doc,/truncated preview/);
assert.match(doc,/NOT INSPECTED/);
assert.match(doc,/PREREGISTRATION_APPROVED: false/);
assert.match(doc,/ENROLLMENT_AUTHORIZED: false/);

for(const key of ["Baseline measurement","Post-game comprehension",
 "Misconception / counterexample discrimination","Philosophical transfer",
 "Delayed recall","Learning dimensions","Pass/fail thresholds","Participants per game"]){
 assert.ok(doc.includes(key),key);
}
assert.match(protocol,/six.*dimensions/i);
assert.match(doc,/>=4\/5/);
assert.match(doc,/>=3\/5/);
assert.match(doc,/20–28/);
assert.match(doc,/18–30/);
assert.match(doc,/conditional n>=10/i);
assert.match(protocol,/UNKNOWN; recover first/);
assert.match(gate,/10 distinct readers overall/i);
assert.match(gate,/exact original question text.*unknown/i);
assert.match(gate,/Baseline philosophical knowledge.*NOT MEASURED/i);
assert.match(gate,/no improvement claim/i);

const inventory=JSON.parse(execFileSync(process.execPath,
 [new URL("audit-local-evidence.mjs",root).pathname],{encoding:"utf8"}));
assert.equal(inventory.status,"PROTOCOL_UNAPPROVED");
assert.equal(inventory.enrollmentAuthorized,false);
assert.equal(inventory.originalDocumentFullBodyInspected,false);
assert.equal(inventory.verifiedBaseline,0);
assert.equal(inventory.verifiedImmediate,0);
assert.equal(inventory.verifiedDelayed,0);
assert.equal(inventory.verifiedCounterexample,0);
assert.equal(inventory.verifiedTransfer,0);
assert.equal(inventory.verifiedLearningGain,0);
assert.equal(inventory.denominatorResolved,false);
assert.deepEqual(inventory.phaseNames,["baseline","immediate","delayed"]);
assert.deepEqual(inventory.delayedTargetHours,{min:20,max:28});
assert.ok(doc.includes(expected));

const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const pageErrors=[],external=[];
 page.on("pageerror",e=>pageErrors.push(e.message));
 page.on("request",r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
 let downloaded=false;
 page.on("download",()=>downloaded=true);
 await page.goto(new URL("reader-response.html",root).href);
 assert.equal(await page.locator("fieldset#cz125-instrument-locked").isDisabled(),true);
 assert.equal(await page.locator("#export").isDisabled(),true);
 assert.match(await page.locator("#cz125-hold").innerText(),/ENROLLMENT HOLD/);
 assert.match(await page.locator("#cz125-hold").innerText(),/six dimensions/i);
 const phases=await page.locator("#phase option").evaluateAll(opts=>opts.map(o=>o.value).filter(Boolean));
 assert.deepEqual(phases,["baseline","immediate","delayed"]);
 for(const id of ["baseline-instrument","misconception-instrument","transfer-instrument"]){
  assert.equal(await page.locator("#"+id).isDisabled(),true);
 }
 const reported=await page.evaluate(()=>{
  const e=new Event("submit",{bubbles:true,cancelable:true});
  document.getElementById("response").dispatchEvent(e);
  return {prevented:e.defaultPrevented,message:document.getElementById("state").textContent};
 });
 assert.equal(reported.prevented,true);
 assert.match(reported.message,/NOT APPROVED/i);
 assert.equal(downloaded,false);
 assert.deepEqual(pageErrors,[]);
 assert.deepEqual(external,[]);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>
  document.documentElement.clientWidth+1);
 assert.equal(overflow,false);
 console.log("CZ123-CZ125-SAFETY "+JSON.stringify({candidate,originalDocId:sourceId,
  originalBody:"INACCESSIBLE",verifiedComment:true,
  phases,exportBlocked:true,reportedHumanReaders:0,
  actualLearningMethodology:"HOLD_NOT_APPROVED",
  externalRequests:external.length,browserErrors:pageErrors.length,overflow}));
 await page.close();
}finally{await browser.close();}
