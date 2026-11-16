/**
 * CZ-123 independent QA-only B2.3 six-game source-connected final browser holdout.
 * Exact developer SHA: a7a675d853d5fe9c865683ae3042a95fa70f00bc.
 * No source, emotion/meaning engine, selector, game UI or DB edits.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB23ResearchServer}
 from "../experiments/yl-b23-research-server.mjs";
import {KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const widths=[320,390,430,1024];
const wordCount=text=>text.trim().split(/\s+/).filter(Boolean).length;
const api=(page,payload)=>page.evaluate(async payload=>{
 const r=await fetch("/api/run",{method:"POST",
  headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
 return {http:r.status,data:await r.json()};
},payload);
const input=(recordKey,gameId,choice)=>({recordKey,gameId,input:choice});
const check=(result,expected)=>{
 assert.equal(result.http,200,JSON.stringify(result.data).slice(0,350));
 assert.equal(result.data.status,"ready");
 assert.equal(result.data.selected_game_id,expected);
 assert.equal(result.data.publicationAllowed,false);
 assert.equal(result.data.productionPlayable,false);
 assert.equal(result.data.accountSaved,false);
 assert.equal(result.data.sections.length,3);
 assert.deepEqual(result.data.sections.map(s=>s.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=result.data.sections.map(s=>wordCount(s.text));
 const total=counts.reduce((a,b)=>a+b,0);
 assert.equal(total,result.data.wordCount);
 assert.ok(total>=80&&total<=120,JSON.stringify({total,counts}));
 const mins=[10,18,9],maxs=[48,65,26];
 for(let i=0;i<3;i++)assert.ok(counts[i]>=mins[i]&&counts[i]<=maxs[i]);
};
test("independent six-peer source and browser negative gates: no fake approval or source/event causation",async()=>{
 const server=await createB23ResearchServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage();
  await page.goto(server.url+"/");
  const catalogue=await page.evaluate(async()=>(await(await fetch("/api/catalogue")).json()));
  assert.deepEqual(catalogue.peerIds,["trade_off","decision_map",
   "token_studio","balance_of_values","swipe_decision","future_reveal"]);
  assert.equal(catalogue.sources.length,4);
  assert.equal(catalogue.productionAllowed,false);
  assert.match(catalogue.sourceAuthority,/founder_research_only/);
  for(const record of catalogue.sources){
   const expected={
    dillard:["trade_off","token_studio"],
    kierkegaard_map:["decision_map","swipe_decision"],
    thoreau_balance:["balance_of_values"],
    kierkegaard_future:["future_reveal"]
   }[record.key];
   assert.deepEqual(record.games.filter(x=>x.eligible).map(x=>x.id),expected);
  }
  const th=[];
  for(const n of [0,2,6,8]){
   const r=await api(page,input("thoreau_balance","balance_of_values",
    {leftSlots:n,touched:true}));
   check(r,"balance_of_values");
   assert.deepEqual(r.data.canonical_choice.amounts,[n,8-n]);
   assert.equal(r.data.canonical_choice.amounts.reduce((a,b)=>a+b),8);
   assert.equal(r.data.expressionVerification,"frozen_v12_semantic_not_v20");
   assert.equal(r.data.provenance.actualPurchaseInferred,false);
   th.push(r.data.sections[0].text);
  }
  assert.ok(new Set(th).size>1,"Two allocations must create different analysis");
  for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
   const [start,sceneId,response]=route.path;
   const actions=[{type:"choose_start",optionId:start},
    {type:"explore_authored",sceneId},
    {type:"choose_response",optionId:response},
    {type:"read_retrospective"}];
   const r=await api(page,input("kierkegaard_future","future_reveal",{actions}));
   check(r,"future_reveal");
   assert.deepEqual(r.data.canonical_choice.path,route.path);
   assert.equal(r.data.provenance.authoredEventCausedByReader,false);
   assert.equal(r.data.provenance.unchosenFutureKnown,false);
  }
  for(const [key,game,payload] of [
   ["dillard","future_reveal",{actions:[]}],
   ["thoreau_balance","balance_of_values",{leftSlots:4,touched:true,scholarApproval:true}],
   ["thoreau_balance","balance_of_values",{leftSlots:9,touched:true}],
   ["kierkegaard_future","future_reveal",{actions:[
    {type:"choose_start",optionId:"change"},{type:"explore_authored",sceneId:"predict-real-future"}]}],
   ["kierkegaard_future","future_reveal",{actions:[
    {type:"choose_start",optionId:"change"},{type:"scrub",stage:4}]}],
   ["kierkegaard_future","future_reveal",{actions:[
    {type:"choose_start",optionId:"change"},{type:"reveal_authored"}]}]
  ]){
   const r=await api(page,input(key,game,payload));
   assert.equal(r.http,422,JSON.stringify(r));
   assert.equal(r.data.status,"blocked");
  }
  await page.close();
 }finally{await browser.close();await server.close();}
});
test("independent fresh responsive QA: true tactile distinctions, reset/undo, keyboard, no writes",async()=>{
 const server=await createB23ResearchServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 mkdirSync("qa-evidence",{recursive:true});
 try{
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:900},
    isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],foreign=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(!r.url().startsWith(server.url))foreign.push(r.url());});
   await page.goto(server.url+"/",{waitUntil:"networkidle"});
   await page.locator('[data-source="thoreau_balance"]').click();
   assert.equal(await page.locator("#peers button:not([disabled])").count(),1);
   assert.equal(await page.locator('[data-game="future_reveal"]').isDisabled(),true);
   await page.locator('[data-game="balance_of_values"]').click();
   assert.equal(await page.locator("#hours-slider").getAttribute("max"),"8");
   assert.equal(await page.locator("#finish").isDisabled(),true);
   await page.getByRole("button",{name:"+ One hour"}).click();
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.leftSlots,5);
   await page.locator("#undo").click();
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.leftSlots,4);
   await page.getByRole("button",{name:"− One hour"}).click();
   await page.locator("#finish").click();
   await page.locator("#result").waitFor({state:"visible"});
   assert.equal(await page.locator(".result-section").count(),3);
   assert.match(await page.locator("#result-status").innerText(),/not v2.0/);
   if(width===390)await page.screenshot({path:"qa-evidence/b23-independent-balance-390.png",fullPage:true});
   await page.locator('[data-source="kierkegaard_future"]').click();
   await page.locator('[data-game="future_reveal"]').click();
   await page.locator('[data-start="stay"]').click();
   assert.equal(await page.locator("#timeline-scrub").getAttribute("max"),"1");
   await page.locator('[data-scene="surprise"]').click();
   assert.equal(await page.locator("#timeline-scrub").getAttribute("max"),"2");
   assert.match(await page.locator(".authored").last().innerText(),/AUTHOR-WRITTEN FICTION/);
   await page.locator("#undo").click();
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.scene,null);
   assert.equal(await page.locator("#finish").isDisabled(),true);
   await page.locator('[data-scene="surprise"]').click();
   await page.locator('[data-response="continue"]').click();
   await page.locator("#finish").click();
   await page.locator("#result").waitFor({state:"visible"});
   assert.equal(await page.locator(".result-section").count(),3);
   if(width===390)await page.screenshot({path:"qa-evidence/b23-independent-future-390.png",fullPage:true});
   await page.locator('[data-source="kierkegaard_map"]').click();
   await page.locator('[data-game="swipe_decision"]').click();
   assert.equal(await page.locator('[data-swipe-surface]').count(),1);
   // Keyboard fallback is genuinely a selectable path, not a decorative promise.
   await page.locator('[data-swipe-surface]').focus();
   await page.keyboard.press("ArrowRight");
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.start,"stay");
   await page.locator('[data-scene="missed"]').click();
   await page.locator('[data-swipe-surface]').focus();
   await page.keyboard.press("ArrowLeft");
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.response,"reflect");
   await page.locator("#finish").click();
   await page.locator("#result").waitFor({state:"visible"});
   assert.equal(await page.locator(".result-section").count(),3);
   const state=await page.evaluate(()=>window.__YL_B23_QA.getState());
   assert.equal(state.productionAllowed,false);
   assert.equal(state.externalScholarApproved,false);
   assert.equal(state.accountPersistenceEnabled,false);
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>
      document.documentElement.clientWidth+1),false);
   const small=await page.locator("button:visible,input[type=range]:visible").evaluateAll(elements=>
    elements.filter(x=>!x.disabled).filter(x=>{
     const r=x.getBoundingClientRect();
     return r.width<44||r.height<44;
    }).length);
   assert.equal(small,0);
   assert.deepEqual(errors,[]);
   assert.deepEqual(foreign,[]);
   console.log("CZ123_B23_HOLDOUT "+JSON.stringify({width,sixPeerIdCount:6,
    authenticSourceBound:true,physicalSafari:false,realHumanReaders:0,
    externalRequests:0,errors:0}));
   await context.close();
  }
 }finally{await browser.close();await server.close();}
});
