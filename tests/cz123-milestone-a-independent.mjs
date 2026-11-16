/** CZ-123 independent milestone A adversarial acceptance (QA-only).
 * Frozen candidate 14c4cdbb1ad47b68dca3708b42a55b08895e5422.
 * No simulation of human understanding or iPhone VoiceOver.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {createMilestoneAServer} from "../experiments/yl-milestone-a-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";

async function api(app,path,body){
 const res=await fetch(app.url+path,{method:"POST",
  headers:{"content-type":"application/json",origin:app.url},
  body:JSON.stringify(body)});
 return {status:res.status,json:await res.json()};
}
async function choose(app,record,game){
 return api(app,"/api/research/select",{recordId:record.id,preferredGameId:game});
}
async function run(app,record,game,data){
 return api(app,"/api/research/run",{
  recordId:record.id,versionHash:record.versionHash,
  preferredGameId:game,choice:{gameId:game,...data}});
}

test("QA-1: zero-action Token Studio is genuinely unallocated and cannot Discover",async()=>{
 const app=await createMilestoneAServer(),browser=await chromium.launch({
  channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const external=[],errors=[];
  page.on("request",req=>{if(req.url().startsWith("http")&&!req.url().startsWith(app.url))external.push(req.url());});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(app.url);
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().recordId);
  await page.locator("#qa-controls summary").click();
  await page.locator("#source").selectOption(DILLARD_V21.id);
  await page.locator("#preferred").selectOption("token_studio");
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().selectedGameId==="token_studio");
  await page.locator("#start").click();
  assert.equal(await page.locator("#play-next").isDisabled(),true);
  assert.equal(await page.locator(".slot").count(),6);
  assert.equal(await page.locator(".slot").filter({hasText:"Unassigned"}).count(),6);
  assert.equal(await page.locator(".slot").filter({hasText:"30 min"}).count(),6);
  assert.equal((await page.evaluate(()=>window.__YL_CZ128_MILESTONE_A.getState())).canonicalChoice,null);
  // Tapping without the activity selected cannot covertly count all six units.
  await page.locator(".slot").nth(0).click();
  assert.equal(await page.locator("#play-next").isDisabled(),true);
  await page.locator(".tokens-legend button").nth(1).click();
  await page.locator(".slot").nth(1).click();
  await page.locator(".slot").nth(2).click();
  await page.locator(".tokens-legend button").nth(0).click();
  for(const i of [3,4,5])await page.locator(".slot").nth(i).click();
  assert.equal(await page.locator("#play-next").isEnabled(),true);
  let state=await page.evaluate(()=>window.__YL_CZ128_MILESTONE_A.getState());
  assert.deepEqual(state.canonicalChoice.amounts,[4,2,0]);
  await page.locator(".distribution .activity").nth(0).locator("button").first().click();
  assert.equal(await page.locator("#play-next").isDisabled(),true);
  await page.locator("#undo").click();
  assert.equal(await page.locator("#play-next").isEnabled(),true);
  await page.locator("#play-next").click();
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().resultStatus==="ready");
  assert.equal(await page.locator("#section-title").textContent(),"Your Choice.");
  await page.locator("#result-next").click();
  await page.locator("#result-next").click();
  assert.equal(await page.locator("#result-next").isDisabled(),true,"No fake My World saved state.");
  assert.equal(await page.locator("#save-notice").isVisible(),true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  console.log("CZ123-MILESTONE-A "+JSON.stringify({fixture:"token-no-phantom-choice",
   completed:true,saveAvailable:false,externalCalls:0,errors:0}));
  await page.close();
 }finally{await browser.close();await app.close();}
});

test("QA-2: authored-development selection is visually consistent but never represented as real agency",async()=>{
 const app=await createMilestoneAServer(),browser=await chromium.launch({
  channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:320,height:780},
    isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(app.url);
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().recordId);
  await page.locator("#qa-controls summary").click();
  await page.locator("#source").selectOption(KIERKEGAARD_V21.id);
  await page.locator("#preferred").selectOption("swipe_decision");
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().selectedGameId==="swipe_decision");
  await page.locator("#start").click();
  for(let step=0;step<3;step++){
   assert.equal(await page.locator(".question-square").count(),1);
   assert.equal(await page.locator(".option-pair .option-card").count(),2);
   if(step===1){
    const two=page.locator(".option-pair .option-card");
    assert.equal(await two.first().getAttribute("data-role"),"AUTHORED_DEVELOPMENT");
    assert.match(await page.locator(".question-square").innerText(),/imagined|not your action/i);
    assert.match(await two.first().getAttribute("aria-label"),/Explore authored hypothetical/i);
   }
   await page.locator(".option-pair .option-card").first().click();
   assert.equal((await page.evaluate(()=>window.__YL_CZ128_MILESTONE_A.getState())).gameStage,step+1);
  }
  assert.equal(await page.locator("#play-next").isEnabled(),true);
  assert.deepEqual(errors,[]);
  await page.close();
 }finally{await browser.close();await app.close();}
});

test("QA-3: sample multiple allocation choices across two games and verify identical source-grounded meaning",async()=>{
 const app=await createMilestoneAServer();
 try{
  for(const amounts of [[6,0,0],[0,6,0],[0,0,6],[2,2,2],[4,1,1]]){
   const data={amounts,repetitions:5};
   const [a,b]=await Promise.all([
    run(app,DILLARD_V21,"trade_off",data),
    run(app,DILLARD_V21,"token_studio",data)
   ]);
   assert.equal(a.status,b.status,"Game disagreement: "+JSON.stringify(amounts));
   assert.equal(a.json.status,b.json.status,"Status mismatch: "+JSON.stringify(amounts));
   assert.equal(a.json.status,"ready","A supported allocation must work: "+JSON.stringify({amounts,a:a.json,b:b.json}).slice(0,700));
   assert.deepEqual(a.json.result.meaning,b.json.result.meaning);
   assert.ok(a.json.result.expression.wordCount>=80&&a.json.result.expression.wordCount<=120);
  }
 }finally{await app.close();}
});

test("QA-4: compare ALL eight source-authored paths through Decision Map and Swipe Decision",async()=>{
 const app=await createMilestoneAServer();
 try{
  const selected=await choose(app,KIERKEGAARD_V21,"decision_map");
  assert.equal(selected.json.selection.canonical_choice_contract.stages[1].role,"AUTHORED_DEVELOPMENT");
  const routes=selected.json.presentation.routes;
  assert.equal(routes.length,8);
  for(const route of routes){
   const data={path:route.path};
   const [a,b]=await Promise.all([
    run(app,KIERKEGAARD_V21,"decision_map",data),
    run(app,KIERKEGAARD_V21,"swipe_decision",data)
   ]);
   assert.equal(a.status,b.status,"Game disagreement for "+JSON.stringify(route.path));
   assert.equal(a.json.status,b.json.status,"Different philosophical status for "+JSON.stringify(route.path));
   assert.equal(a.json.status,"ready","Source-authorized path not playable: "+JSON.stringify({path:route.path,a:a.json,b:b.json}).slice(0,800));
   assert.deepEqual(a.json.result.meaning,b.json.result.meaning);
   assert.deepEqual(a.json.result.expression.sections.map(s=>s.text),
    b.json.result.expression.sections.map(s=>s.text));
  }
 }finally{await app.close();}
});

test("QA-5: no-fit and cross-game false agency cannot be forced into research execution",async()=>{
 const app=await createMilestoneAServer();
 try{
  const nofit=await choose(app,HEGEL_NO_FIT_V21,"swipe_decision");
  assert.equal(nofit.json.status,"no_fit");
  assert.equal(nofit.json.adapter.available,false);
  const bad=await run(app,KIERKEGAARD_V21,"swipe_decision",
   {path:["change","completely_invented_event","continue"]});
  assert.equal(bad.status,422);
  const mismatch=await run(app,DILLARD_V21,"swipe_decision",
   {path:["change","risk","continue"]});
  assert.equal(mismatch.status,422);
  const headers=await fetch(app.url+"/api/research/select",{
   method:"POST",headers:{"content-type":"application/json",origin:"https://attacker.example"},
   body:JSON.stringify({recordId:DILLARD_V21.id})});
  assert.equal(headers.status,403);
 }finally{await app.close();}
});
