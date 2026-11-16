/**
 * CZ-145 real IN-APPLICATION quote->Discover->game->40–65-word
 * Result->Finish&Save->MyWorld->Revisit/Remove. NOT B2.6 lab.
 * Chrome simulation is not physical iPhone Safari/VoiceOver or reader study.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as netServer} from "node:net";
import {mkdirSync} from "node:fs";
mkdirSync("qa-evidence",{recursive:true});
async function freePort(){
 const s=netServer();
 await new Promise((ok,bad)=>s.once("error",bad).listen(0,"127.0.0.1",ok));
 const port=s.address().port;
 await new Promise((ok,bad)=>s.close(err=>err?bad(err):ok()));
 return port;
}
async function startApp(){
 const port=await freePort(),base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),YOURLOGOS_B27_PREVIEW:"1"},
  stdio:["ignore","pipe","pipe"]});
 let stderr="";
 child.stderr.on("data",x=>stderr+=String(x).slice(0,500));
 for(let i=0;i<120;i++){
  if(child.exitCode!==null)throw Error("Application exited: "+stderr);
  try{const res=await fetch(base+"/api/health");
   if(res.ok)return {base,close:()=>new Promise(ok=>{
    child.once("exit",ok);child.kill("SIGTERM");
    setTimeout(ok,1200).unref();
   })};}catch{}
  await new Promise(ok=>setTimeout(ok,75));
 }
 child.kill();throw Error("Local app did not become ready: "+stderr);
}
const current=page=>page.evaluate(()=>window.__YL_B27_QA?.getState());
const seed=async(page,id)=>{
 await page.addInitScript(({quoteId})=>{
  const d=new Date(),day=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),
   String(d.getDate()).padStart(2,"0")].join("-");
  localStorage.setItem("yourlogos_web_v1",JSON.stringify({
   saved:[],practice:{[day]:{quoteId}},started:true,
   personalization:{status:"skipped",answers:{concerns:[]}},
   savedEncounters:[],arrivals:[],themes:[]
  }));
  localStorage.setItem("yourlogos-introduction-v1","done");
  localStorage.setItem("yourlogos-developer-preview-v1","on");
 },{quoteId:id});
};
async function openAt(page,url,id,author){
 await page.goto(url+"/?b27=1",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
  document.querySelector('[data-action="discover"]'));
 await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
 const caption=await page.locator(".today .quote").innerText();
 assert.ok(caption.length>10);
 if(author)assert.match(await page.locator(".today .author").innerText(),new RegExp(author));
 assert.equal(await page.locator('[data-action="toggle-save"]').count(),1);
 assert.equal(await page.locator('[data-action="discover"]').count(),1);
 const response=page.waitForResponse(x=>x.url().endsWith("/api/b27/start"));
 await page.locator('[data-action="discover"]').click();
 const b=await(await response).json();
 assert.equal(b.quoteId,id);
 if(b.status==="ready"){
  await page.locator(".b27-game").waitFor({state:"visible"});
  assert.equal(await page.locator('#questions,#qa-panel,[data-game]').count(),0);
  assert.equal((await current(page)).stage,"play");
 }else if(b.status==="no_fit")await page.locator(".b27-source-note").waitFor({state:"visible"});
 return b;
}
async function finish(page,family){
 const endpoint=page.waitForResponse(x=>x.url().endsWith("/api/b27/run"));
 await page.locator('[data-b27="complete"]').click();
 const result=await(await endpoint).json();
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,700));
 await page.locator(".b27-result").waitFor({state:"visible"});
 assert.equal(result.selectedFamilyId,family);
 assert.ok(result.saveKey.startsWith("sha256:"));
 assert.equal(result.compact.sections.length,3);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.equal(result.compact.fullWordCount,result.fullExpression.wordCount);
 assert.equal(await page.locator(".b27-result-section").count(),3);
 assert.equal(await page.locator(".b27-result-section.b27-education").count(),1);
 assert.equal(await page.locator('.b27-result-section .b27-deepen summary').count(),1);
 assert.equal(await page.locator('[data-b27="save"]').count(),1);
 assert.equal((await current(page)).saved,false);
 assert.equal((await current(page)).fullMeaningWordCount,result.fullExpression.wordCount);
 return result;
}
test("Real quote-selected direct app journey: Smith human dilemma, save readback, revisit, delete and independent Like",async()=>{
 const app=await startApp(),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({viewport:{width,height:920},
    reducedMotion:"reduce",isMobile:width<=430,hasTouch:width<=430});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await seed(page,91);
   const source=await openAt(page,app.base,91,"Smith");
   assert.equal(source.status,"ready");
   assert.equal(source.selectedFamilyId,"tap_pair");
   assert.match(await page.locator(".b27-scenario").innerText(),/friend|birthday|gift/i);
   assert.doesNotMatch(await page.locator(".b27-scenario").innerText(),/booklet|printing/i);
   assert.equal(await page.locator(".b27-concept").count(),4);
   if(width===390)await page.screenshot({path:"qa-evidence/b27-app-smith-play-390.png",fullPage:true});
   await page.locator('[data-b27="pair"][data-value="sketch"]').focus();
   await page.keyboard.press("Enter");
   assert.equal((await current(page)).game.first,"sketch");
   await page.locator('[data-b27="pair"][data-value="friend"]').click();
   assert.equal((await current(page)).game.pairs.length,1);
   const result=await finish(page,"tap_pair");
   assert.match(result.compact.sections[1].text,/Smith/);
   assert.equal((await current(page)).quoteLikeCount,0);
   if(width===390)await page.screenshot({path:"qa-evidence/b27-app-smith-compact-390.png",fullPage:true});
   await page.locator('[data-b27="save"]').click();
   assert.equal((await current(page)).saved,true);
   const disk=await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")));
   assert.equal(disk.savedEncounters.length,1);
   assert.equal(disk.saved.length,0,"Completing and saving must not auto-Like");
   assert.equal(disk.savedEncounters[0].saveKey,result.saveKey);
   assert.deepEqual(disk.savedEncounters[0].canonicalChoice,result.canonical_choice);
   assert.equal(disk.savedEncounters[0].fullExpression.wordCount,result.fullExpression.wordCount);
   await page.locator('[data-b27="world"]').click();
   assert.equal(await page.locator(".b27-world-item").count(),1);
   await page.locator('[data-b27="reopen"]').click();
   assert.equal((await current(page)).saved,true);
   assert.equal(await page.locator(".b27-result-section").count(),3);
   await page.locator('button[data-action="close-discover"]').click();
   await page.locator('[data-view="profile"]').first().click();
   await page.locator('[data-b27="delete"]').click();
   assert.equal(await page.locator(".b27-world-item").count(),0);
   const end=await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")));
   assert.equal(end.savedEncounters.length,0);
   assert.deepEqual(errors,[]);
   assert.equal(await page.evaluate(()=>
    document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false);
   console.log("B27_APP_SMITH "+JSON.stringify({width,fromRealQuote:true,
    matching:true,actualReadback:true,revisit:true,deleted:true,
    physicalSafari:false,readersFive:false}));
   await context.close();
  }
 }finally{await browser.close();await app.close();}
});
test("Real quotation entry handles Dillard Balance, Kierkegaard Decision, and Hegel reading refusal",async()=>{
 const app=await startApp(),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const variant of [
   {quoteId:12,expect:"balance_move"},
   {quoteId:34,expect:"decision_cards"},
   {quoteId:31,expect:"no_fit"}
  ]){
   const page=await browser.newPage({viewport:{width:390,height:890},
    reducedMotion:"reduce"});
   await seed(page,variant.quoteId);
   const route=await openAt(page,app.base,variant.quoteId);
   if(variant.expect==="no_fit"){
    assert.equal(route.status,"no_fit");
    assert.equal(await page.locator(".b27-game").count(),0);
    assert.equal(await page.locator(".b27-source-note").count(),1);
   }else{
    assert.equal(route.selectedFamilyId,variant.expect);
    if(variant.expect==="balance_move"){
     assert.equal(await page.locator("#b27-slider").getAttribute("max"),"6");
     await page.locator("#b27-slider").evaluate(el=>{
      el.value="4";el.dispatchEvent(new Event("change",{bubbles:true}));
     });
     assert.equal((await current(page)).game.owners.filter(x=>x===0).length,4);
    }else{
     await page.locator('[data-b27="branch"][data-value="change"]').click();
     await page.locator('[data-b27="branch"][data-value="risk"]').click();
     await page.locator('[data-b27="branch"][data-value="continue"]').click();
    }
    await finish(page,variant.expect);
    assert.equal((await current(page)).quoteLikeCount,0);
   }
   await page.close();
  }
 }finally{await browser.close();await app.close();}
});
test("Quote Like is independent: like action does not create a completed Encounter",async()=>{
 const app=await startApp(),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage();
  await seed(page,12);
  await page.goto(app.base+"/?b27=1",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&document.querySelector('[data-action="toggle-save"]'));
  await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
  await page.locator('[data-action="toggle-save"]').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")));
  assert.equal(saved.saved.includes(12),true);
  assert.equal(saved.savedEncounters?.length||0,0);
  assert.equal((await current(page)).stage,null);
 }finally{await browser.close();await app.close();}
});
