/**
 * CZ-149 INDEPENDENT QA: written ONLY AFTER developer freeze
 * b192f5edf78e626b6fd04a176c11076701b594d9.
 * Drives real app (not standalone mock), real server and three engines.
 * Independent from CZ-149 developer's gesture test implementation.
 * Chrome viewport simulations are not physical iPhone Safari.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as netServer} from "node:net";
import {mkdirSync,writeFileSync} from "node:fs";
const outdir="qa-evidence-cz149-independent";
mkdirSync(outdir,{recursive:true});
const pause=t=>new Promise(ok=>setTimeout(ok,t));
async function boot(){
 const listener=netServer();
 await new Promise((yes,no)=>listener.once("error",no).listen(0,"127.0.0.1",yes));
 const port=listener.address().port;
 await new Promise((yes,no)=>listener.close(e=>e?no(e):yes()));
 const base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),YOURLOGOS_B27_PREVIEW:"1"},
  stdio:["ignore","pipe","pipe"]});
 let errors="";child.stderr.on("data",x=>errors+=String(x).slice(0,500));
 for(let k=0;k<140;k++){
  if(child.exitCode!==null)throw Error("Server terminated "+errors);
  try{if((await fetch(base+"/api/health")).ok)return {base,
   close:()=>new Promise(ok=>{child.once("exit",ok);child.kill("SIGTERM");
    setTimeout(ok,1800).unref();})};}catch{}
  await pause(80);
 }
 child.kill("SIGTERM");throw Error("Real app didn't start "+errors);
}
async function seed(page,id){
 await page.addInitScript(({id})=>{
  const dt=new Date(),day=[dt.getFullYear(),String(dt.getMonth()+1).padStart(2,"0"),
   String(dt.getDate()).padStart(2,"0")].join("-");
  localStorage.setItem("yourlogos_web_v1",JSON.stringify({
   saved:[],practice:{[day]:{quoteId:id}},started:true,
   personalization:{status:"skipped",answers:{concerns:[]}},
   savedEncounters:[],arrivals:[],themes:[]}));
  localStorage.setItem("yourlogos-introduction-v1","done");
  localStorage.setItem("yourlogos-developer-preview-v1","on");
 },{id});
}
async function open(page,base,id){
 await seed(page,id);
 await page.goto(base+"/?b27=1",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
  document.querySelector('[data-action="discover"]'));
 await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
 const response=page.waitForResponse(x=>x.url().endsWith("/api/b27/start"));
 await page.locator('[data-action="discover"]').click();
 const admission=await(await response).json();
 assert.equal(admission.status,"ready");
 await page.locator(".b27-game").waitFor();
 return admission;
}
async function geometry(page,width){
 const info=await page.evaluate(()=>{
  const outerWidth=document.documentElement.clientWidth;
  const hits=[...document.querySelectorAll(".b27-shell button")].filter(x=>
   x.getClientRects().length&&getComputedStyle(x).visibility!=="hidden")
   .map(x=>({w:x.getBoundingClientRect().width,
    h:x.getBoundingClientRect().height,text:x.textContent.slice(0,30)}));
  const current=scrollX;scrollTo(50,scrollY);const scrolled=scrollX;scrollTo(current,scrollY);
  return {outerWidth,hits,scrolled};
 });
 assert.equal(info.scrolled,0,"No horizontal scrolling for "+width);
 for(const hit of info.hits)assert.ok(hit.h>=43.5&&hit.w>=43.5,
  "Tiny touch target: "+JSON.stringify(hit));
}
async function finish(page,id,family){
 const response=page.waitForResponse(x=>x.url().endsWith("/api/b27/run"));
 await page.locator('[data-b27="complete"]').click();
 const result=await(await response).json();
 assert.equal(result.status,"ready",JSON.stringify({id,family,result}).slice(0,750));
 assert.equal(result.selectedFamilyId,family);
 assert.equal(result.fullMeaning.status,"ready");
 assert.equal(result.emotion.status,"ready");
 assert.equal(result.fullExpression.status,"ready");
 assert.equal(result.compact.status,"ready");
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.deepEqual(await page.locator(".b27-result-section > p").allInnerTexts(),
  result.compact.sections.map(x=>x.text));
 assert.deepEqual(result.compact.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.equal(result.emotion.inferredActualEmotion,false);
 assert.equal(result.emotion.inferredPersonality,false);
 assert.equal(result.publicationAllowed,false);
 await page.locator('[data-b27="save"]').click();
 assert.equal((await page.evaluate(()=>window.__YL_B27_QA.getState())).saved,true);
 await page.locator('[data-b27="world"]').click();
 assert.equal(await page.locator(".b27-world-item").count(),1);
 await page.locator('[data-b27="reopen"]').click();
 assert.equal(await page.locator(".b27-result-section").count(),3);
 await page.locator('button[data-action="close-discover"]').click();
 await page.locator('[data-b27="delete"]').click();
 assert.equal(await page.locator(".b27-world-item").count(),0);
 return {sourceHash:result.sourceVersionHash,canonical:result.canonical_choice,
  meaning:result.fullMeaning,emotion:result.emotion,
  full:result.fullExpression,compact:result.compact};
}
const scenarios=[
 {id:49,family:"balance_move"},
 {id:23,family:"tap_pair"},
 {id:55,family:"decision_cards"},
 {id:48,family:"flip_reveal"}
];
test("INDEPENDENT: sixteen real browser journeys across four games and four widths, source proof and stored readback",async()=>{
 const app=await boot(),browser=await chromium.launch({
  channel:"chrome",args:["--no-sandbox"]});
 const evidence=[];
 try{
  for(const width of [320,390,430,1024])for(const spec of scenarios){
   const context=await browser.newContext({
    viewport:{width,height:910},isMobile:width<=430,hasTouch:width<=430,
    reducedMotion:width===320?"reduce":"no-preference"});
   const page=await context.newPage(),errors=[],networkWrites=[];
   page.setDefaultTimeout(11000);
   page.on("pageerror",x=>errors.push(String(x)));
   page.on("request",r=>{
    if(!["GET","HEAD"].includes(r.method())&&
     !/\/api\/b27\/(?:start|run)$/.test(new URL(r.url()).pathname))
      networkWrites.push(r.url());
   });
   const admission=await open(page,app.base,spec.id);
   assert.equal(admission.selectedFamilyId,spec.family);
   await geometry(page,width);
   if(spec.family==="balance_move"){
    assert.equal(await page.locator(".b27-bucket").count(),3);
    // Accessible equivalent to touch drag: selected physical piece + destination number.
    const piece=page.locator('[data-b27-bucket="1"] .b27-piece').first();
    await piece.focus();await page.keyboard.press("1");
    assert.equal(await page.locator('[data-b27-bucket="0"] .b27-piece').count(),4);
    assert.equal(await page.locator('[data-b27-bucket="1"] .b27-piece').count(),1);
    assert.match(await page.locator(".b27-resource-status").innerText(),/8 of 8 placed/);
    await page.locator('[data-b27="undo"]').click();
    assert.equal(await page.locator('[data-b27-bucket="1"] .b27-piece').count(),2);
    await page.locator("#b27-slider").evaluate(el=>{
     el.value="7";el.dispatchEvent(new Event("change",{bubbles:true}));
    });
   }else if(spec.family==="tap_pair"){
    assert.equal(await page.locator(".b27-concept").count(),4);
    const first=page.locator('[data-b27="pair"][data-value="dominance"]');
    const second=page.locator('[data-b27="pair"][data-value="agency"]');
    await first.focus();await page.keyboard.press("Enter");
    await second.focus();await page.keyboard.press("Space");
    await page.waitForFunction(()=>document.querySelectorAll(".b27-link-lines path").length===1);
    assert.match(await page.locator(".b27-relation-evidence p").innerText(),
     /power over others|self-government/i);
    await page.locator('[data-b27="undo"]').click();
    assert.equal(await page.locator(".b27-link-lines path").count(),0);
    await page.locator('[data-b27="pair"][data-value="agency"]').click();
    await page.locator('[data-b27="undo"]').click();
    // Reversed selection points at the exact same source edge.
    await page.locator('[data-b27="pair"][data-value="agency"]').click();
    await page.locator('[data-b27="pair"][data-value="dominance"]').click();
    await page.waitForFunction(()=>document.querySelectorAll(".b27-link-lines path").length===1);
   }else if(spec.family==="decision_cards"){
    assert.equal(await page.locator(".b27-dilemma").count(),1);
    assert.equal(await page.locator(".b27-choice").count(),2);
    await page.locator('[data-b27="branch"][data-value="revisit"]').click();
    await page.locator('[data-b27="branch"][data-value="details"]').click();
    await page.locator('[data-b27="branch"][data-value="consider"]').click();
    assert.match(await page.locator(".b27-game").innerText(),/present|fictional|imagined|event/i);
   }else{
    await page.locator('[data-b27="branch"][data-value="listen"]').click();
    assert.equal(await page.locator(".b27-flip").count(),2);
    const hidden=await page.locator(".b27-flips").innerText();
    assert.doesNotMatch(hidden,/other person stays silent|meeting is postponed/i);
    assert.equal(await page.locator(".b27-flipped").count(),0);
    await page.locator('[data-b27="branch"][data-value="delay"]').click();
    await page.locator(".b27-flipped").waitFor();
    assert.equal(await page.locator(".b27-flipped").count(),1);
    assert.equal(await page.locator(".b27-flip-locked").count(),1);
    await page.locator('[data-b27="branch"][data-value="respond"]').click();
    if(width===320){
     const transform=await page.locator(".b27-flipped .b27-flip-interior").evaluate(el=>
      getComputedStyle(el).transform);
     assert.equal(transform,"none","Reduced motion should show revealed face without spinning");
    }
   }
   await geometry(page,width);
   if(width===390)
    await page.screenshot({path:outdir+"/"+spec.family+"-played-390.png",fullPage:true});
   const result=await finish(page,spec.id,spec.family);
   if(spec.family==="balance_move")
    assert.match(result.compact.sections[2].text,/study|intentional|purpose/i);
   if(spec.family==="tap_pair")
    assert.match(result.compact.sections[1].text,/independence|self-government/i);
   if(spec.family==="decision_cards")
    assert.match(result.compact.sections[1].text,/present|judgment|past words/i);
   if(spec.family==="flip_reveal"){
    assert.match(result.compact.sections[1].text,/response|event|control/i);
    assert.equal(result.meaning.meaning.choiceAnalysis.development.causedByInitialChoice,false);
   }
   assert.deepEqual(errors,[]);
   assert.deepEqual(networkWrites,[]);
   evidence.push({width,...spec,result});
   await context.close();
  }
  writeFileSync(outdir+"/independent-exact-app-and-three-engine-results.json",
   JSON.stringify({engineeringSha:"b192f5edf78e626b6fd04a176c11076701b594d9",
    browser:"Chromium (emulated responsive, NOT physical Safari)",
    actualServer:true,realApp:true,independentAfterFreeze:true,
    results:evidence},null,2));
  assert.equal(evidence.length,16);
 }finally{await browser.close();await app.close();}
});
