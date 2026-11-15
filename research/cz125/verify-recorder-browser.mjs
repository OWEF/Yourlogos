/**
 * CZ-125 real Chromium dynamic recorder QA (NO participant test).
 * QA unlock is applied IN MEMORY ONLY to the test browser page; the committed
 * HTML stays locked for enrollment. All typed answers are synthetic QA strings,
 * never stored as human research evidence.
 */
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
const original=readFileSync(new URL("./reader-response.html",import.meta.url),"utf8");
assert.match(original,/const METHOD_RELEASE_APPROVED=false/);
const testHtml=original.replace("const METHOD_RELEASE_APPROVED=false;",
 "const METHOD_RELEASE_APPROVED=true; // ephemeral QA harness, NOT committed");
const qaTemporaryDir=mkdtempSync(join(tmpdir(),"cz125-form-qa-"));
const qaFile=join(qaTemporaryDir,"instrument-QA-only.html");
writeFileSync(qaFile,testHtml);
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const TEST_WORDS="QA-ONLY TEST INPUT: no human respondent or philosophical learning result.";
const state=page=>page.evaluate(()=>window.__CZ125_INSTRUMENT?.getStatus());
async function exportInMemory(page){
  // Observe real Blob construction and the download-link click in an isolated QA
  // browser context; avoid about:blank/file:// permission quirks and persisted files.
  await page.evaluate(()=>{
    if(window.__cz125QaBlobs)return;
    window.__cz125QaBlobs=[];window.__cz125QaDownloadClicks=[];
    URL.createObjectURL=blob=>{
      window.__cz125QaBlobs.push(blob);
      return "blob:qa-only-local-file";
    };
    URL.revokeObjectURL=()=>{};
    HTMLAnchorElement.prototype.click=function(){
      window.__cz125QaDownloadClicks.push(this.download);
    };
  });
  const trigger=await page.locator("#save").isVisible()?"#save":"#done-export";
  await page.locator(trigger).click();
  const observed=await page.evaluate(async()=>({
    json:window.__cz125QaBlobs.length?
      await window.__cz125QaBlobs[window.__cz125QaBlobs.length-1].text():null,
    clicks:window.__cz125QaDownloadClicks.length,
    feedback:document.getElementById("feedback").textContent
  }));
  if(!observed.json)throw Error("Recorder did not export JSON Blob: "+observed.feedback);
  assert.equal(observed.clicks>=1,true,"Local browser download anchor must be clicked");
  assert.match(observed.feedback,/private local JSON download/i);
  return JSON.parse(observed.json);
}
async function advanceSimple(page,phase,answer=TEST_WORDS){
 assert.equal((await state(page)).phase,phase);
 await page.locator("#answer").fill(answer);
 await page.locator("#advance").click();
}
async function immediate(page,game){
 assert.equal((await state(page)).phase,"immediate");
 await page.locator("#canonical").fill(game==="dillard"?"3,1,2":"change/surprise/adapt");
 await page.locator("#gesture").selectOption("A");
 await page.locator("#interaction").fill(TEST_WORDS);
 await page.locator("#intervention").fill("QA-only: no human assistance observation.");
 await page.locator("#post-answer").fill(TEST_WORDS);
 await page.locator("#misconception").selectOption("A"); // never scored, even for Kierkegaard
 await page.locator("#misconception-reason").fill(TEST_WORDS);
 await page.locator("#transfer").fill(TEST_WORDS);
 await page.locator("#engagement").fill(TEST_WORDS);
 await page.locator("#advance").click();
}
try{
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,
   acceptDownloads:true,reducedMotion:"reduce"});
  const errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",req=>{if(/^https?:/.test(req.url()))external.push(req.url());});
  // 1. The COMMITTED form itself must not allow enrollment/export.
  await page.setContent(original,{waitUntil:"load"});
  assert.equal((await state(page)).releaseApproved,false);
  assert.equal(await page.locator("#begin").isDisabled(),true);
  assert.equal(await page.locator("#import").isDisabled(),true);
  await page.locator("#setup").evaluate(el=>el.dispatchEvent(
   new Event("submit",{bubbles:true,cancelable:true})));
  assert.match(await page.locator("#feedback").innerText(),/locked|pending/i);
  // 2. In-memory QA-only harness exercises all actual UI submission controls.
  await page.goto(pathToFileURL(qaFile).href,{waitUntil:"load"});
  assert.equal((await state(page)).releaseApproved,true);
  assert.equal(await page.locator("#begin").isDisabled(),false);
  await page.locator("#participant").selectOption("P02");
  await page.locator("#adult").check();
  await page.locator("#consent").check();
  await page.locator("#recontact").check();
  await page.locator("#known-dillard").selectOption("basic");
  await page.locator("#known-kierkegaard").selectOption("none");
  await page.locator("#known-philosophy").selectOption("basic");
  await page.locator("#known-games").selectOption("experienced");
  await page.locator("#browser-device").fill("QA-ONLY Chromium mobile emulation");
  await page.locator("#begin").click();
  let st=await state(page);assert.equal(st.participantId,"P02");
  assert.equal(st.phase,"baseline");
  assert.match(await page.locator("#neutral-prompt").innerText(),/new job/i);
  assert.equal(await page.locator("#questions label").first().innerText(),
   "What is the dilemma? Which parts could you decide yourself?");
  // Invalid blank baseline cannot advance.
  await page.locator("#advance").click();
  assert.equal((await state(page)).progress,0);
  await advanceSimple(page,"baseline");
  st=await state(page);assert.equal(st.phase,"glance");
  assert.match(await page.locator("#phase-instructions").innerText(),/BEFORE pressing/i);
  await advanceSimple(page,"glance");
  await immediate(page,"kierkegaard");
  st=await state(page);
  assert.equal(st.progress,3);
  assert.equal(st.phase,"baseline");
  assert.match(await page.locator("#neutral-prompt").innerText(),/three free hours/i);
  await advanceSimple(page,"baseline");
  await advanceSimple(page,"glance");
  await immediate(page,"dillard");
  st=await state(page);
  assert.equal(st.progress,6);
  assert.equal(st.phase,"delayed");
  // Export the full two-row pre/post bundle without saving human evidence.
  const b=await exportInMemory(page);
  assert.deepEqual(b.order,["kierkegaard","dillard"]);
  assert.equal(b.rows.length,2);
  assert.equal(b.rows[0].baseline_verbatim,TEST_WORDS);
  assert.equal(b.rows[0].first_glance_verbatim,TEST_WORDS);
  assert.equal(b.rows[1].post_verbatim,TEST_WORDS);
  assert.deepEqual(b.rows[0].chosen_canonical_path,{
   gameId:"swipe_decision",path:["change","surprise","adapt"]});
  assert.deepEqual(b.rows[1].chosen_canonical_path,{
   gameId:"token_studio",amounts:[3,1,2],repetitions:5});
  assert.equal(b.automaticScoring,false);
  assert.equal(b.rows[0].counterexample_score_0_2,null);
  assert.equal(b.rows[1].comprehension_after_0_4,null);
  assert.equal(b.consent.recontact,true);
  assert.equal(b.rows[0].qualitative_quote,TEST_WORDS);
  // Wrong SHA and corrupt file must be rejected on import.
  const wrong={...b,code_sha:"unknown"};
  await page.locator("#import-file").setInputFiles({name:"bad.json",
   mimeType:"application/json",buffer:Buffer.from(JSON.stringify(wrong))});
  assert.match(await page.locator("#feedback").innerText(),/declined|rejected/i);
  // Simulate next-day timing in QA-only memory; none of this is submitted as human evidence.
  // Shift the preceding synthetic observation timestamps, then re-import the test bundle.
  const age=t=>new Date(Date.parse(t)-24*3600000).toISOString();
  b.startedAt=age(b.startedAt);b.studyEndedAt=age(b.studyEndedAt);
  for(const row of b.rows){
   row.baseline_at=age(row.baseline_at);
   row.first_glance_at=age(row.first_glance_at);
   row.immediate_at=age(row.immediate_at);
  }
  b.testOnly=true;
  await page.locator("#import-file").setInputFiles({name:"qa-only.json",
   mimeType:"application/json",buffer:Buffer.from(JSON.stringify(b))});
  assert.equal((await state(page)).progress,6);
  assert.match(await page.locator("#questions label").first().innerText(),
   /Describe one central idea from Dillard and one from Kierkegaard/i);
  await page.locator("#delayed-answer").fill(TEST_WORDS);
  await page.locator("#advance").click();
  st=await state(page);assert.equal(st.progress,7);
  const final=await exportInMemory(page);
  assert.equal(final.delayed.validWindow,true);
  assert.equal(final.delayed.validIndependent,true);
  assert.equal(final.delayed.hours>=20&&final.delayed.hours<=28,true);
  assert.equal(final.rows[0].delayed_answer_verbatim,TEST_WORDS);
  assert.equal(final.rows[1].delayed_answer_verbatim,TEST_WORDS);
  assert.equal(final.rows[0].delayed_score_0_2,null);
  assert.equal(final.rows[1].delayed_score_0_2,null);
  assert.equal(final.testOnly,true);
  assert.equal(await page.evaluate(()=>
   document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),true);
  assert.deepEqual(external,[],"No external network requests, including export");
  assert.deepEqual(errors,[]);
  console.log("CZ125-QA-ONLY "+JSON.stringify({width,
   defaultEnrollmentLocked:true,methodTestFlow:["baseline","first-glance","immediate","delayed"],
   counterbalancedP02:["kierkegaard","dillard"],inMemoryQaOnly:true,
   completeTypedCanonicalTwoGameRows:2,delayedHourTarget:"20–28",
   ungradedHumanResponses:0,externalRequests:0,browserErrors:0,overflow:false}));
  await page.close();
 }
}finally{await browser.close();rmSync(qaTemporaryDir,{recursive:true,force:true});}
