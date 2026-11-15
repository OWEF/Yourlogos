/**
 * Real interactive Chromium acceptance at mobile viewport widths.
 * DO NOT label this physical iPhone Safari/VoiceOver verification (CZ-126).
 */
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {createIntegratedResearchServer}
 from "../experiments/cz128-research-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const screenshots=new URL("../artifacts/cz128/",import.meta.url);
mkdirSync(screenshots,{recursive:true});
const app=await createIntegratedResearchServer();
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const sleep=t=>new Promise(ok=>setTimeout(ok,t));
const current=page=>page.evaluate(()=>window.__YL_CZ128_RESEARCH.getState());
const ready=page=>page.waitForFunction(()=>window.__YL_CZ128_RESEARCH?.getState().ready===true);
const result=page=>page.waitForFunction(()=>window.__YL_CZ128_RESEARCH?.getState().resultStatus==="ready");
async function stages(page,n){
 for(const [i,id] of ["choice-card","teaching-card","last-card"].entries())
  assert.equal(await page.locator("#"+id).isVisible(),i<=n,id+" at "+n);
}
try{
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,
   reducedMotion:"reduce"});
  const errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{
   if(r.url().startsWith("http")&&!r.url().startsWith(app.url))
    external.push(r.url());
  });
  await page.goto(app.url);
  await ready(page);
  let s=await current(page);
  assert.equal(s.ready,true);
  assert.equal(s.selectedGameId,"token_studio");
  assert.equal(s.adapterAvailable,true);
  assert.equal(s.publicationAllowed,false);
  assert.equal(s.peerTrace.length,6);
  assert.equal(await page.locator(".game-picker").isVisible(),false,
   "Old manual philosopher->game picker must not be visible");
  assert.equal(await page.locator("#cz128-peer-reasons .cz128-peer").count(),6);
  assert.match(await page.locator("#cz128-selection-summary").innerText(),/Automatically selected/);
  assert.match(await page.locator("#dilemma-situation").innerText(),/three hours/i);
  assert.match(await page.locator("#dilemma-decision").innerText(),/six|6/);
  assert.match(await page.locator("#intro-author").innerText(),/Annie Dillard/);
  await page.locator("#start").click();
  assert.equal(await page.locator("#token-game").isVisible(),true);
  for(const [i,n] of [[0,3],[1,1],[2,2]]){
   for(let j=0;j<n;j++)await page.locator('[data-add="'+i+'"]').click();
  }
  assert.equal(await page.locator("#submit").isDisabled(),false);
  await page.locator("#submit").click();
  await result(page);
  await stages(page,0);
  s=await current(page);
  assert.equal(s.wordCount>=80&&s.wordCount<=120,true);
  assert.deepEqual(s.canonicalChoice,{amounts:[3,1,2],budgets:[6],repetitions:5});
  assert.match(await page.locator("#choice-dashboard").innerText(),/1.5 hours/);
  assert.match(await page.locator("#choice-dashboard").innerText(),/0.5 hours/);
  assert.equal(s.rememberVisible,false);
  await page.locator("#reveal-next").click();
  await stages(page,1);
  assert.match(await page.locator("#teaching-text").innerText(),/Dillard/);
  await page.locator("#reveal-next").click();
  await stages(page,2);
  assert.equal((await current(page)).rememberVisible,true);
  await page.locator("#cz128-recall-choice").fill("Three imagined hours allocated across writing, messages and rest.");
  await page.locator("#cz128-recall-thesis").fill("Repeated days form an imagined pattern.");
  await page.locator("#cz128-recall-limits").fill("My actual habits and unchosen outcomes remain unknown.");
  assert.match(await page.locator("#cz128-recall-thesis").inputValue(),/Repeated days/);
  if(width===390)await page.screenshot({
   path:new URL("token-390-remember.png",screenshots).pathname,fullPage:true});
  // New passage selection is a CONTENT selection; the NODE selector decides
  // the game, never a client-side author->game lookup.
  await page.locator("#cz128-source").selectOption(KIERKEGAARD_V21.id);
  await ready(page);
  s=await current(page);
  assert.equal(s.selectedGameId,"swipe_decision");
  assert.equal(s.adapterAvailable,true);
  assert.match(await page.locator("#dilemma-decision").innerText(),/hypothetical development/i);
  assert.match(await page.locator("#intro-author").innerText(),/Kierkegaard/);
  await page.locator("#start").click();
  assert.equal(await page.locator("#swipe-game").isVisible(),true);
  await page.locator('#swipe-choices [data-choice="0"]').click();
  assert.equal(await page.locator("#swipe-card").isVisible(),false);
  assert.equal(await page.locator("#development-explorer").isVisible(),true);
  assert.match(await page.locator("#agency-step-explainer").innerText(),/not something you choose/i);
  const spoof=await page.evaluate(()=>window.__YL_CZ140_TEST.tryAgencySpoof());
  assert.equal(spoof,false,"The original PR #182 agency guard must remain effective.");
  await page.locator('#development-options [data-development="1"]').click();
  await page.locator('#swipe-choices [data-choice="0"]').click();
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,
   ["change","surprise","adapt"]);
  await page.locator("#swipe-finish").click();
  await result(page);
  await stages(page,0);
  s=await current(page);
  assert.deepEqual(s.canonicalChoice,{path:["change","surprise","adapt"]});
  assert.equal(["contemplative","provocative"].includes(s.emotionStrategy),true);
  assert.match(await page.locator("#choice-dashboard").innerText(),/AUTHORED HYPOTHETICAL/);
  assert.equal(await page.locator('#choice-dashboard [data-role="AUTHORED_DEVELOPMENT"]').count(),1);
  assert.match(await page.locator("#source-detail").innerText(),/unknown|hypothetical|imagined/i);
  await page.locator("#reveal-next").click();
  await page.locator("#reveal-next").click();
  assert.equal((await current(page)).rememberVisible,true);
  if(width===390)await page.screenshot({
   path:new URL("swipe-390-remember.png",screenshots).pathname,fullPage:true});
  // An admitted philosophical source may still have NO browser-adapter game.
  await page.locator("#cz128-source").selectOption(HEGEL_NO_FIT_V21.id);
  await page.waitForFunction(()=>window.__YL_CZ128_RESEARCH?.getState().status==="no_fit");
  s=await current(page);
  assert.equal(s.adapterAvailable,false);
  assert.equal(s.ready,false);
  assert.equal(await page.locator("#start").isDisabled(),true);
  assert.match(await page.locator("#cz128-no-fit").innerText(),/whole|represent|fit|source/i);
  await page.locator("#cz128-source").selectOption(DILLARD_V21.id);
  await ready(page);
  assert.equal((await current(page)).selectedGameId,"token_studio");
  assert.equal(await page.locator("#cz128-remember").isVisible(),false);
  const overflow=await page.evaluate(()=>
   document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  assert.equal(overflow,false,"Horizontal overflow at "+width+"px");
  assert.deepEqual(external,[],"Unexpected external network calls at "+width);
  assert.deepEqual(errors,[],"Browser errors at "+width);
  console.log("CZ128-MOBILE "+JSON.stringify({width,
   dillard:"token_studio",kierkegaard:"swipe_decision",
   path:["change","surprise","adapt"],sourceNoFit:true,
   browserErrors:errors,external,overflow:false,rememberPrompts:3}));
  await page.close();
 }
}finally{
 await browser.close();
 await app.close();
}
