/**
 * CZ-149 P0: exercises the REAL index.html, CSS, app controller,
 * /api/b27/start and /api/b27/run. Neither prose nor meanings are mocked.
 * Chromium emulation is not physical iPhone Safari or human acceptance.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as netServer} from "node:net";
import {mkdirSync,writeFileSync} from "node:fs";
const OUT="qa-evidence-cz149";
mkdirSync(OUT,{recursive:true});
const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
async function server(){
 const listener=netServer();
 await new Promise((ok,fail)=>listener.once("error",fail).listen(0,"127.0.0.1",ok));
 const port=listener.address().port;
 await new Promise((ok,fail)=>listener.close(err=>err?fail(err):ok()));
 const base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),YOURLOGOS_B27_PREVIEW:"1"},
  stdio:["ignore","pipe","pipe"]});
 let errors="";child.stderr.on("data",s=>errors+=String(s).slice(0,300));
 for(let i=0;i<120;i++){
  if(child.exitCode!==null)throw Error("Real server quit: "+errors);
  try{if((await fetch(base+"/api/health")).ok)return {
   base,close:()=>new Promise(ok=>{child.once("exit",ok);child.kill("SIGTERM");
    setTimeout(ok,1200).unref();})};}catch{}
  await pause(90);
 }
 child.kill();throw Error("Server not ready "+errors);
}
async function seed(page,quoteId){
 await page.addInitScript(({quoteId})=>{
  const now=new Date(),date=[now.getFullYear(),
   String(now.getMonth()+1).padStart(2,"0"),
   String(now.getDate()).padStart(2,"0")].join("-");
  localStorage.setItem("yourlogos_web_v1",JSON.stringify({
   saved:[],practice:{[date]:{quoteId}},started:true,
   personalization:{status:"skipped",answers:{concerns:[]}},
   savedEncounters:[],arrivals:[],themes:[]}));
  localStorage.setItem("yourlogos-introduction-v1","done");
  localStorage.setItem("yourlogos-developer-preview-v1","on");
 },{quoteId});
}
async function enter(page,base,id,family){
 await seed(page,id);
 await page.goto(base+"/?b27=1",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
  document.querySelector('[data-action="discover"]'));
 await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
 const api=page.waitForResponse(r=>r.url().endsWith("/api/b27/start"));
 await page.locator('[data-action="discover"]').click();
 const admission=await(await api).json();
 assert.equal(admission.status,"ready",JSON.stringify(admission).slice(0,500));
 assert.equal(admission.selectedFamilyId,family);
 await page.locator(".b27-game").waitFor();
 return admission;
}
const amounts=page=>page.locator(".b27-bucket-heading strong")
 .allInnerTexts().then(x=>x.map(Number));
const branch=(page,id)=>page.locator('[data-b27="branch"][data-value="'+id+'"]').click();
async function capture(page,label){
 const api=page.waitForResponse(r=>r.url().endsWith("/api/b27/run"));
 await page.locator('[data-b27="complete"]').click();
 const result=await(await api).json();
 assert.equal(result.status,"ready",JSON.stringify({label,status:result.status,
  reason:result.reason}).slice(0,600));
 assert.equal(result.fullMeaning.status,"ready");
 assert.equal(result.emotion.status,"ready");
 assert.equal(result.fullExpression.status,"ready");
 assert.equal(result.compact.status,"ready");
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.deepEqual(result.compact.sections.map(s=>s.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.equal(result.emotion.inferredActualEmotion,false);
 assert.equal(result.emotion.inferredMoralRank,false);
 assert.equal(result.publicationAllowed,false);
 await page.locator(".b27-result").waitFor();
 assert.deepEqual(await page.locator(".b27-result-section > p").allInnerTexts(),
  result.compact.sections.map(s=>s.text));
 await page.screenshot({path:OUT+"/"+label+"-result-390.png",fullPage:true});
 await page.locator('[data-b27="save"]').click();
 assert.equal((await page.evaluate(()=>window.__YL_B27_QA.getState())).saved,true);
 await page.locator('[data-b27="world"]').click();
 assert.equal(await page.locator(".b27-world-item").count(),1);
 await page.locator('[data-b27="reopen"]').click();
 assert.equal(await page.locator(".b27-result-section").count(),3);
 await page.locator('button[data-action="close-discover"]').click();
 await page.locator('[data-b27="delete"]').click();
 assert.equal(await page.locator(".b27-world-item").count(),0);
 return {meaning:result.fullMeaning,emotion:result.emotion,
  full:result.fullExpression,compact:result.compact,canonical:result.canonical_choice,
  source:result.sourceVersionHash,saveKey:result.saveKey};
}
async function moveWithTouch(page,source,target){
 await source.scrollIntoViewIfNeeded();
 await target.scrollIntoViewIfNeeded();
 const a=await source.boundingBox(),b=await target.boundingBox();
 assert.ok(a&&b);
 const dev=await page.context().newCDPSession(page);
 const p1={x:a.x+a.width/2,y:a.y+a.height/2,id:1},p2={
  x:b.x+b.width/2,y:b.y+b.height/2,id:1};
 await dev.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[p1]});
 for(let i=1;i<=6;i++)await dev.send("Input.dispatchTouchEvent",{
  type:"touchMove",touchPoints:[{id:1,x:p1.x+(p2.x-p1.x)*i/6,
   y:p1.y+(p2.y-p1.y)*i/6}]});
 await dev.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
 await dev.detach();
}
test("CZ-149 real app: four different tactile mechanics and actual three-engine outputs",async()=>{
 const app=await server(),browser=await chromium.launch({
  channel:"chrome",args:["--no-sandbox"]});
 const evidence=[];
 const specs=[
  {id:49,family:"balance_move",name:"Seneca"},
  {id:23,family:"tap_pair",name:"Wollstonecraft"},
  {id:55,family:"decision_cards",name:"Emerson"},
  {id:48,family:"flip_reveal",name:"Epictetus"}
 ];
 try{
  for(const spec of specs){
   const results=[];
   for(let variant=0;variant<2;variant++){
    const context=await browser.newContext({viewport:{width:390,height:890},
     isMobile:true,hasTouch:true,reducedMotion:"no-preference"});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e)));
    page.setDefaultTimeout(12000);
    const admitted=await enter(page,app.base,spec.id,spec.family);
    if(spec.family==="balance_move"){
     assert.equal(await page.locator(".b27-bucket").count(),3);
     assert.deepEqual(await amounts(page),[3,2,3]);
     const first=page.locator('[data-b27-bucket="0"] .b27-piece').first();
     const destination=page.locator('[data-b27-bucket="'+(variant?"2":"1")+'"]');
     if(variant===0)await first.dragTo(destination);
     else await moveWithTouch(page,first,destination);
     await page.waitForFunction(()=>window.__YL_B27_QA.getState().game.owners
      .filter(x=>x===0).length===2);
     assert.deepEqual(await amounts(page),variant?[2,2,4]:[2,3,3]);
     assert.match(await page.locator(".b27-resource-status").innerText(),/8 of 8 placed/);
     assert.match(await page.locator(".b27-resource-status").innerText(),/0 unassigned/);
     await page.screenshot({path:OUT+"/balance-"+variant+"-gesture-390.png",fullPage:true});
     await page.locator('[data-b27="undo"]').click();
     assert.deepEqual(await amounts(page),[3,2,3]);
     await page.locator('[data-b27="reset"]').click();
     assert.deepEqual(await amounts(page),[3,2,3]);
     await page.locator("#b27-slider").evaluate((el,val)=>{
      el.value=val;el.dispatchEvent(new Event("change",{bubbles:true}));
     },variant?"0":"8");
     assert.equal((await amounts(page)).reduce((x,y)=>x+y,0),8);
    }else if(spec.family==="tap_pair"){
     assert.equal(await page.locator(".b27-concept").count(),4);
     const pair=variant?["dominance","agency"]:["education","judgment"];
     await page.locator('[data-b27="pair"][data-value="'+pair[0]+'"]').click();
     assert.equal(await page.locator(".b27-concept.active").count(),1);
     await page.locator('[data-b27="pair"][data-value="'+pair[1]+'"]').click();
     await page.waitForFunction(()=>document.querySelectorAll(
      '.b27-link-lines path').length===1);
     assert.equal(await page.locator(".b27-relation-evidence").count(),1);
     const claim=await page.locator(".b27-relation-evidence p").innerText();
     assert.ok(claim.length>35);
     await page.screenshot({path:OUT+"/pair-"+variant+"-linked-390.png",fullPage:true});
     await page.locator('[data-b27="undo"]').click();
     assert.equal(await page.locator(".b27-link-lines path").count(),0);
     // Undo the first card selection as well: each tap is independently reversible.
     await page.locator('[data-b27="undo"]').click();
     assert.equal(await page.locator(".b27-concept.active").count(),0);
     await page.locator('[data-b27="pair"][data-value="'+pair[1]+'"]').click();
     await page.locator('[data-b27="pair"][data-value="'+pair[0]+'"]').click();
     await page.waitForFunction(()=>document.querySelectorAll(".b27-link-lines path").length===1);
     assert.match(await page.locator(".b27-scenario").innerText(),
      /woman|course|education|choose/i);
     assert.doesNotMatch(await page.locator(".b27-scenario").innerText(),
      /community group|authority over men/i);
    }else if(spec.family==="decision_cards"){
     assert.equal(await page.locator(".b27-dilemma").count(),1);
     assert.equal(await page.locator(".b27-choice").count(),2);
     await page.screenshot({path:OUT+"/decision-"+variant+"-dilemma-390.png",fullPage:true});
     await branch(page,variant?"revisit":"maintain");
     assert.equal(await page.locator(".b27-dilemma").count(),1);
     await branch(page,variant?"critique":"details");
     assert.match(await page.locator(".b27-dilemma").innerText(),/situation changed/i);
     assert.equal(await page.locator(".b27-choice").count(),2);
     await branch(page,"consider");
     assert.match(await page.locator(".b27-game").innerText(),/You chose, learned, and responded/);
    }else if(spec.family==="flip_reveal"){
     await branch(page,variant?"listen":"prepare");
     assert.equal(await page.locator(".b27-flip").count(),2);
     assert.equal(await page.locator(".b27-flipped").count(),0);
     const sealed=await page.locator(".b27-flips").innerText();
     assert.doesNotMatch(sealed,/other person stays silent|meeting is postponed/i);
     const names=await page.locator(".b27-flip").evaluateAll(els=>
      els.map(x=>x.getAttribute("aria-label")));
     assert.ok(names.every(x=>/face-down/i.test(x)));
     await page.screenshot({path:OUT+"/flip-"+variant+"-sealed-390.png",fullPage:true});
     await branch(page,variant?"delay":"silence");
     await page.locator(".b27-flipped").waitFor();
     assert.equal(await page.locator(".b27-flipped").count(),1);
     assert.equal(await page.locator(".b27-flip-locked").count(),1);
     assert.match(await page.locator(".b27-flip-back strong").allInnerTexts().then(x=>x.join(" ")),
      /silent|postponed/i);
     await page.screenshot({path:OUT+"/flip-"+variant+"-revealed-390.png",fullPage:true});
     await branch(page,"respond");
    }
    const result=await capture(page,spec.family+"-"+variant);
    assert.equal(result.meaning.selectedFamilyId,spec.family);
    assert.equal(result.emotion.noMindReading,true);
    assert.equal(result.meaning.meaning.philosophicalOperation.kind,
     admitted.record.philosophicalOperation.kind);
    if(spec.family==="flip_reveal")
     assert.equal(result.meaning.meaning.choiceAnalysis.development.causedByInitialChoice,false);
    results.push(result);
    assert.deepEqual(errors,[],"Browser script errors: "+errors.join(" "));
    await context.close();
   }
   assert.notEqual(results[0].saveKey,results[1].saveKey);
   assert.notEqual(results[0].compact.sections[1].text,results[1].compact.sections[1].text);
   assert.notEqual(results[0].compact.sections[2].text,results[1].compact.sections[2].text);
   evidence.push({quoteId:spec.id,family:spec.family,author:spec.name,
    before:results[0],after:results[1]});
  }
  writeFileSync(OUT+"/authentic-real-app-three-engine-contrasts.json",
   JSON.stringify({genuineServer:true,backEnd:"server.mjs",
    actualPipeline:"reasonUniversal→emotionUniversal→expressUniversal",
    sourceReview:"provisional-not-scholarly-approved",noProductionWrites:true,
    families:evidence},null,2));
  assert.equal(evidence.length,4);
 }finally{await browser.close();await app.close();}
});
