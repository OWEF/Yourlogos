/**
 * CZ-123 independent PRODUCT QA for exact CZ-128 candidate.
 * This test file is absent from the implementation PR; we check actual
 * interactive Chromium display against accepted API evidence, not test-only
 * statically generated philosopher responses.
 *
 * Chromium mobile emulation is not physical iPhone Safari / VoiceOver.
 * No human-comprehension participants are simulated.
 */
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {createIntegratedResearchServer,ENGINE_SHA,SOURCE_UI_SHA}
 from "../experiments/cz128-research-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const start=async()=>{
 const app=await createIntegratedResearchServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 return {app,browser};
};
const stageIds=["choice-card","teaching-card","last-card"];
async function checkStages(page,upto){
 for(let i=0;i<stageIds.length;i++)
  assert.equal(await page.locator("#"+stageIds[i]).isVisible(),i<=upto);
}
const state=page=>page.evaluate(()=>window.__YL_CZ128_RESEARCH?.getState());
const waitReady=page=>page.waitForFunction(()=>window.__YL_CZ128_RESEARCH?.getState().ready);
const waitResult=page=>page.waitForFunction(()=>window.__YL_CZ128_RESEARCH?.getState().resultStatus==="ready");
const submitted=async(page,button)=>{
 const [response]=await Promise.all([
  page.waitForResponse(x=>x.url().includes("/api/research/run")&&x.request().method()==="POST"),
  page.locator(button).click()
 ]);
 const json=await response.json();
 await waitResult(page);
 assert.equal(response.status(),200,JSON.stringify(json));
 return json;
};
async function choose(page,id,playable){
 await page.locator("#cz128-source").selectOption(id);
 await page.waitForFunction(expected=>{
  const s=window.__YL_CZ128_RESEARCH?.getState();
  return s?.sourceId===expected&&(s.ready||s.status==="no_fit"||
   s.status==="no_available_game");
 },id);
 const s=await state(page);
 assert.equal(s.adapterAvailable,playable);
 assert.equal(s.peerTrace.length,6);
 return s;
}
const post=async(app,route,value)=>{
 const response=await fetch(app.url+route,{method:"POST",
  headers:{origin:app.url,"content-type":"application/json"},
  body:JSON.stringify(value)});
 return {status:response.status,data:await response.json()};
};
const {app,browser}=await start();
try{
 // Independent semantic and availability assertions run directly on the actual
 // Node process, then compare the browser-visible text to returned API packets.
 const all=await (await fetch(app.url+"/api/research/catalogue")).json();
 assert.equal(all.engineSha,ENGINE_SHA);
 assert.equal(all.sourceUiSha,SOURCE_UI_SHA);
 assert.equal(all.games.length,6);
 assert.ok(all.games.every(g=>g.productionPlayable===false));
 assert.equal(all.games.filter(g=>g.browserPrototypeAvailable).length,2);
 const sourceBad=await post(app,"/api/research/select",{recordId:"research:unregistered:blind-source"});
 assert.equal(sourceBad.data.status,"needs_source_review");
 const clientOverride=await post(app,"/api/research/select",{
  recordId:DILLARD_V21.id,preferredGameId:"future_reveal"});
 assert.equal(clientOverride.status,400);
 const spoof=await post(app,"/api/research/run",{
  recordId:DILLARD_V21.id,versionHash:DILLARD_V21.versionHash,
  choice:{gameId:"swipe_decision",path:["stay","missed","reflect"]}});
 assert.notEqual(spoof.status,200);
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},
   isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const jsErrors=[],requests=[];
  page.on("pageerror",e=>jsErrors.push(e.message));
  page.on("request",r=>requests.push(r.url()));
  await page.goto(app.url);
  await waitReady(page);
  assert.equal((await state(page)).selectedGameId,"token_studio");
  assert.equal(await page.locator("#start").isDisabled(),false);
  assert.equal(await page.locator(".game-picker").isVisible(),false);
  assert.match(await page.locator(".research-mode").innerText(),
   /six-peer selector chooses/i);
  assert.doesNotMatch(await page.locator(".research-mode").innerText(),
   /selector is not implemented/i);
  assert.match(await page.locator("#cz128-selection-summary").innerText(),
   /Automatically selected: Token Studio/i);
  const trace=await page.locator("#cz128-peer-reasons").innerText();
  assert.match(trace,/Value|Balance of Values|Future Reveal/i);
  assert.match(trace,/not implemented|Not eligible/i);
  await page.locator("#start").click();
  for(let n=0;n<6;n++)await page.locator('[data-add="0"]').click();
  const first=await submitted(page,"#submit");
  assert.equal(first.result.meaning.meaning.kind,"repetition");
  assert.deepEqual(first.result.canonical_choice.amounts,[6,0,0]);
  assert.equal(first.result.publicationAllowed,false);
  assert.equal(first.result.expression.sections.length,3);
  for(let i=0;i<3;i++)
   assert.equal(await page.locator(["#choice-text","#teaching-text","#ending-text"][i]).textContent(),
    first.result.expression.sections[i].text,
    "The browser must display accepted engine result, not legacy browser-generated prose.");
  await checkStages(page,0);
  assert.equal((await state(page)).rememberVisible,false);
  await page.locator("#reveal-next").click();
  await checkStages(page,1);
  await page.locator("#reveal-next").click();
  await checkStages(page,2);
  assert.equal((await state(page)).rememberVisible,true);
  await page.locator("#cz128-recall-thesis").fill("Dillard asks how imagined daily decisions accumulate.");
  assert.match(await page.locator("#cz128-recall-thesis").inputValue(),/daily decisions/);
  await page.locator("#edit").click();
  await page.locator("#reset").click();
  for(let n=0;n<6;n++)await page.locator('[data-add="2"]').click();
  const second=await submitted(page,"#submit");
  assert.deepEqual(second.result.canonical_choice.amounts,[0,0,6]);
  assert.notEqual(first.result.expression.sections[1].text,
   second.result.expression.sections[1].text);
  assert.equal(first.result.expression.source_warrant,
   second.result.expression.source_warrant);
  assert.doesNotMatch(second.result.expression.sections.join(" "),/you are lazy|morally inferior/i);
  assert.equal((await state(page)).rememberVisible,false,
   "Previous reflection must not leak into a new result");
  // One can choose a SOURCE, but a game type is never manually chosen.
  const k=await choose(page,KIERKEGAARD_V21.id,true);
  assert.equal(k.selectedGameId,"swipe_decision");
  await page.locator("#start").click();
  await page.locator('#swipe-choices [data-choice="0"]').click();
  assert.equal(await page.locator("#development-explorer").isVisible(),true);
  assert.equal(await page.locator("#swipe-card").isVisible(),false);
  assert.equal(await page.evaluate(()=>window.__YL_CZ140_TEST.tryAgencySpoof()),false);
  await page.locator('#development-options [data-development="1"]').click();
  await page.locator('#swipe-choices [data-choice="0"]').click();
  const swipe1=await submitted(page,"#swipe-finish");
  assert.deepEqual(swipe1.result.canonical_choice.path,
   ["change","surprise","adapt"]);
  assert.equal(swipe1.result.emotion.strategy,"contemplative");
  assert.equal(swipe1.result.expressionVerification,
   "frozen_v20_exact_evidence_authorized_tone");
  assert.equal(await page.locator('#choice-dashboard [data-role="AUTHORED_DEVELOPMENT"]').count(),1);
  assert.equal(await page.locator("#teaching-text").textContent(),
   swipe1.result.expression.sections[1].text);
  await checkStages(page,0);
  // A contrasting path has a different meaning when its evidence differs.
  await page.locator("#edit").click();
  await page.locator("#swipe-reset").click();
  await page.locator('#swipe-choices [data-choice="1"]').click();
  await page.locator('#development-options [data-development="0"]').click();
  await page.locator('#swipe-choices [data-choice="0"]').click();
  const swipe2=await submitted(page,"#swipe-finish");
  assert.deepEqual(swipe2.result.canonical_choice.path,
   ["stay","missed","reflect"]);
  assert.notDeepEqual(swipe1.result.meaning.meaning.evidence,
   swipe2.result.meaning.meaning.evidence);
  assert.notEqual(swipe1.result.expression.sections[0].text,
   swipe2.result.expression.sections[0].text);
  assert.equal(swipe2.result.sourceReview,"curated_provisional");
  await page.locator("#reveal-next").click();
  await page.locator("#reveal-next").click();
  assert.equal((await state(page)).rememberVisible,true);
  const noFit=await choose(page,HEGEL_NO_FIT_V21.id,false);
  assert.equal(noFit.status,"no_fit");
  assert.equal(await page.locator("#start").isDisabled(),true);
  const thoreau=all.records.find(x=>x.source.author==="Henry David Thoreau");
  const smith=all.records.find(x=>x.source.author==="Adam Smith");
  for(const x of [thoreau,smith]){
   assert.ok(x);
   const st=await choose(page,x.id,false);
   assert.equal(st.status,"no_available_game");
   assert.equal(await page.locator("#start").isDisabled(),true);
   assert.match(await page.locator("#cz128-no-fit").innerText(),
    /browser|playable|available|interaction/i);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=
    document.documentElement.clientWidth+1),true,
   "Unexpected horizontal viewport overflow at "+width);
  const external=requests.filter(url=>/^https?:/.test(url)&&!url.startsWith(app.url));
  assert.deepEqual(external,[]);
  assert.deepEqual(jsErrors,[]);
  assert.equal(requests.filter(url=>url.includes("/api/research/run")).length,4,
   "Exactly four validated user decisions, not phantom submissions");
  assert.equal(requests.some(url=>url.includes("/api/research/remember")),false);
  console.log("CZ123-CZ128-INDEPENDENT-PRODUCT "+JSON.stringify({
   width,sourceCount:all.records.length,autoSelected:["token_studio","swipe_decision"],
   distinctDillard:true,distinctKierkegaard:true,
   authoredEventNotUserAction:true,noFitAndHeadlessSafe:true,
   sectionsExactFromActualEngine:true,privateRecall:true,
   jsErrors:jsErrors.length,externalCalls:external.length,overflow:false}));
  await page.close();
 }
}finally{await browser.close();await app.close();}
