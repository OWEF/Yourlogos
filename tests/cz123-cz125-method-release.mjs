/**
 * CZ-123 INDEPENDENT QA acceptance — founder's supplied Section A–H text.
 * Reviews frozen engineering PR #193 candidate, not authors' self-test alone.
 * All user-like text is an EPHEMERAL string "QA ONLY" and is never presented
 * as real human participation, scorer evidence or learning effectiveness.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {chromium} from "playwright-core";
import {STUDY,inspectResearchBundle}
 from "../research/cz125/audit-local-evidence.mjs";

const root=new URL("../research/cz125/",import.meta.url);
const file=name=>readFileSync(new URL(name,root),"utf8");
const candidate="b95f62b8c621d8267088a772a92f1e27cdb08185";
const accepted="73849bff27fc73db97d5fb015c57f45323e18f30";
const placeholder="QA ONLY — automated behavior probe, no person interviewed.";
const expectedOrder={P01:["dillard","kierkegaard"],P02:["kierkegaard","dillard"],
 P03:["dillard","kierkegaard"],P04:["kierkegaard","dillard"],
 P05:["dillard","kierkegaard"]};

test("authoritative provenance is founder-supplied full A–H comment, NOT false claim native Linear body read",()=>{
 assert.equal(STUDY.sourceCommentId,"cc99ce7c-4037-44a6-b199-760698937258");
 assert.equal(STUDY.originalDocId,"bf106341-8403-4c88-a71a-67d414f2972d");
 assert.equal(STUDY.fullFounderTranscriptionRecovered,true);
 assert.equal(STUDY.nativeDocumentRead,false);
 assert.match(file("PROTOCOL.md"),/owner-supplied authoritative transcription/i);
 const reconciliation=file("PREREG-RECONCILIATION-v0.1.md");
 for(const section of ["Baseline (C/E)","Post-game (C/E)","Misconception (A/C/E)","Unseen transfer (C/G)","Delayed (D/E/F)","Six axes (E)","Section F thresholds","Sample (B/F)"])
  assert.ok(reconciliation.includes(section)||reconciliation.includes(section.toLowerCase()),section);
});
test("five within-subject readers, counterbalance, ten paired rows, original A–H thresholds all hold",()=>{
 assert.equal(STUDY.participants,5);
 assert.equal(STUDY.observations,10);
 assert.deepEqual(STUDY.assignedOrder,expectedOrder);
 assert.deepEqual(STUDY.followupHours,{min:20,max:28});
 const t=STUDY.thresholds;
 assert.deepEqual([
  t.interactionFullPerGame,t.philosophyPostAtLeast3PerGame,
  t.nonRegressingImprovers,t.counterexampleFullPerGame,t.validFollowups,
  t.bothIdeasFullDelayed
 ],[4,4,3,4,4,3]);
 assert.equal(t.minImprovementOneGame,1);
 assert.equal(t.sourceReviewerBothRequired,true);
 assert.equal(t.noUnresolvedP0,true);
 assert.equal(STUDY.dimensions.length,6);
 assert.deepEqual(STUDY.originalCorrectOptionsResearcherOnly,{dillard:"A",kierkegaard:"B"});
});
test("verbatim A–H instrument source is represented, options not keyed in participant HTML, no fake pass",()=>{
 const html=file("reader-response.html");
 for(const exact of [
  "What is the dilemma? Which parts could you decide yourself?",
  "In your own words, what is this experience asking you to do? What will it help you see?",
  "What is the philosopher's main point? How did your decisions or events illustrate it? Which parts were not within your control or not known?",
  "Five imagined evenings can illustrate a time-use pattern, but don't prove real-life priorities.",
  "The game can tell exactly what you do on an average night.",
  "Later invented events show the unchosen job would have been worse.",
  "You chose your response, but not which real event happened; the unchosen path remains unknown.",
  "A reader models a week with two hours of reading and five hours of rest each day. What can they conclude, and what can't they?",
  "A person moves city and discovers later that the apartment is noisier than advertised. Does this prove moving was foolish or that staying would have been better? Why?",
  "Which moment was clearest? What confused you? What if anything was worth remembering? Which interaction felt more meaningful and why?",
  "Describe one central idea from Dillard and one from Kierkegaard, and give a specific example from each game. Identify one thing the game could NOT tell you about reality."
 ])assert.ok(html.includes(exact),exact);
 for(const bad of [/correctOption/i,/answerKey/i,/correctAnswer\s*=/i,/\bfetch\s*\(/i,
  /\blocalStorage\b/i,/\bindexedDB\b/i])assert.doesNotMatch(html,bad);
 assert.match(html,/METHOD_RELEASE_APPROVED=true/);
 assert.match(file("FOUNDER-GATE.md"),/Genuine enrolled adults: 0/i);
 assert.match(file("PROTOCOL.md"),/N1|neutral dilemma/i);
 const neutralD="You have three free hours this evening. You could write, answer messages, or rest.";
 const neutralK="You have an offer to take a new job. You can accept it or remain in your current job.";
 for(const t of [file("PROTOCOL.md"),file("PREREG-RECONCILIATION-v0.1.md"),html]){
  assert.ok(t.includes(neutralD)&&t.includes(neutralK));
  assert.doesNotMatch(t,/How might you use that time\?|What do you decide\?/);
 }
 const gate=file("FOUNDER-GATE.md");
 assert.match(gate,/FOUNDER N1 APPROVED/);
 for(const ack of ["N2","N3","N4","N5"])assert.ok(gate.includes(ack));
 assert.equal(STUDY.methodReleaseApproved,true);
 assert.equal(STUDY.enrollmentAuthorized,false);
 assert.match(gate,/independent methodological PASS pending/i);
});
test("independently separate method-release activation from human enrollment and finished product claims",()=>{
 const html=file("reader-response.html"),gate=file("FOUNDER-GATE.md"),
  protocol=file("PROTOCOL.md"),reconciliation=file("PREREG-RECONCILIATION-v0.1.md");
 assert.match(html,/const METHOD_RELEASE_APPROVED=true/);
 assert.equal(STUDY.methodReleaseApproved,true);
 assert.equal(STUDY.enrollmentAuthorized,false);
 assert.match(gate,/Genuine enrolled adults: \*\*0/i);
 assert.match(gate,/NOT AUTHORIZED by this action/i);
 assert.match(gate,/CZ-121/);
 assert.match(gate,/CZ-126/);
 for(const doc of [protocol,reconciliation]){
  assert.match(doc,/2026-11-16/);
  assert.match(doc,/no recruitment|not authorized|no participants/i);
 }
 assert.doesNotMatch(html,/(?:sendBeacon|XMLHttpRequest|localStorage|indexedDB)/);
});

test("independent desktop Chrome interaction: exact activated recorder, P05 paired games, anonymous JSON and missingness",async()=>{
 const html=file("reader-response.html");
 const qaHtml=html; // EXACT reviewed and committed local recorder: no code monkey-patching.
 assert.equal(qaHtml,html);
 const dir=mkdtempSync(join(tmpdir(),"cz123-cz125-"));
 const filename=join(dir,"qa-only.html");
 writeFileSync(filename,qaHtml);
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
   reducedMotion:"reduce",acceptDownloads:true});
  const errors=[],http=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))http.push(r.url());});
  await page.setContent(html);
  assert.equal(await page.locator("#begin").isDisabled(),false);
  assert.equal(await page.locator("#import").isDisabled(),false);
  assert.equal(await page.evaluate(()=>window.__CZ125_INSTRUMENT.releaseApproved),true);
  await page.goto(pathToFileURL(filename).href);
  await page.locator("#participant").selectOption("P05");
  await page.locator("#adult").check();
  await page.locator("#consent").check();
  // Separate recontact may be DECLINED; participant can still complete initial games.
  await page.locator("#browser-device").fill("QA-only virtual browser");
  await page.locator("#begin").click();
  assert.equal(await page.locator("#neutral-prompt").innerText(),"You have three free hours this evening. You could write, answer messages, or rest.");
  const status=()=>page.evaluate(()=>window.__CZ125_INSTRUMENT.getStatus());
  const answer=async(id="answer")=>{
   await page.locator("#"+id).fill(placeholder);
   await page.locator("#advance").click();
  };
  const endGame=async(game)=>{
   await page.locator("#canonical").fill(game==="dillard"?"3,1,2":"stay/missed/reflect");
   await page.locator("#gesture").selectOption("B");
   for(const id of ["interaction","intervention","post-answer",
    "misconception-reason","transfer","engagement"])
    await page.locator("#"+id).fill(placeholder);
   await page.locator("#misconception").selectOption("C");
   await page.locator("#advance").click();
  };
  await answer();assert.equal((await status()).phase,"glance");
  await answer();await endGame("dillard");
  assert.equal((await status()).progress,3);
  assert.equal(await page.locator("#neutral-prompt").innerText(),"You have an offer to take a new job. You can accept it or remain in your current job.");
  await answer();await answer();await endGame("kierkegaard");
  assert.equal((await status()).progress,6);
  // Stub URL download ONLY in this temporary QA page; capture actual Blob bytes
  // and click request with no persisted file or human-response test artifact.
  await page.evaluate(()=>{
   window.__qaBlobs=[];window.__qaClicks=[];
   URL.createObjectURL=b=>{window.__qaBlobs.push(b);return "blob:local-only-test";};
   URL.revokeObjectURL=()=>{};
   HTMLAnchorElement.prototype.click=function(){window.__qaClicks.push(this.download);};
  });
  await page.locator("#save").click();
  const captured=await page.evaluate(async()=>({
   clicked:window.__qaClicks.length,
   json:window.__qaBlobs.length?await window.__qaBlobs.at(-1).text():null,
   feedback:document.getElementById("feedback").textContent
  }));
  assert.ok(captured.json,captured.feedback);
  assert.equal(captured.clicked,1);
  const b=JSON.parse(captured.json);
  assert.deepEqual(b.order,expectedOrder.P05);
  assert.equal(b.rows.length,2);
  assert.equal(b.rows[0].condition,"token_studio");
  assert.equal(b.rows[1].condition,"swipe_decision");
  assert.deepEqual(b.rows[0].chosen_canonical_path,{
   gameId:"token_studio",amounts:[3,1,2],repetitions:5});
  assert.deepEqual(b.rows[1].chosen_canonical_path,{
   gameId:"swipe_decision",path:["stay","missed","reflect"]});
  assert.equal(b.consent.recontact,false);
  assert.equal(b.rows[0].counterexample_score_0_2,null);
  assert.equal(b.rows[1].comprehension_before_0_4,null);
  b.testOnly=true;
  assert.equal(inspectResearchBundle(b,{allowQaTestOnly:true}).valid,true);
  assert.equal(inspectResearchBundle(b).valid,false,
   "independent QA test data cannot be counted as genuine human evidence");
  assert.equal(b.rows[0].delayed_missing,true);
  assert.equal(b.rows[0].delayed_score_0_2,null);
  assert.equal(await page.evaluate(()=>window.__CZ125_INSTRUMENT.releaseApproved),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=
   document.documentElement.clientWidth+1),true);
  assert.deepEqual(errors,[]);
  assert.deepEqual(http,[]);
  console.log("CZ123-INDEPENDENT-AH-QA "+JSON.stringify({
   engineeringCandidate:candidate,pairedRows:2,
   order:expectedOrder.P05,participantCount:0,
   syntacticQAOnly:true,keysExposed:false,
   voluntaryWritten:true,recontactOptional:true,
   delayedMissing:true,automaticGrading:false,errors:errors.length,httpCalls:http.length}));
  await page.close();
 }finally{await browser.close();}
});
