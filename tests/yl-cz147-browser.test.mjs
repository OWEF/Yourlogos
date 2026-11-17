/**
 * CZ-147: actual app quote→Discover→source-generalized four-family game→
 * three-engine result→Finish & Save→My World, in real Chromium.
 * This is NOT a simulated engine-only unit test or a physical Safari review.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as netServer} from "node:net";
import {mkdirSync} from "node:fs";
mkdirSync("qa-evidence-cz147",{recursive:true});
async function freePort(){
 const server=netServer();
 await new Promise((ok,fail)=>server.once("error",fail).listen(0,"127.0.0.1",ok));
 const port=server.address().port;
 await new Promise((ok,fail)=>server.close(err=>err?fail(err):ok()));
 return port;
}
async function server(enabled=true){
 const port=await freePort(),base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),
   YOURLOGOS_B27_PREVIEW:enabled?"1":"0"},stdio:["ignore","pipe","pipe"]});
 let error="";
 child.stderr.on("data",x=>error+=String(x).slice(0,500));
 for(let i=0;i<120;i++){
  if(child.exitCode!==null)throw Error("Server quit: "+error);
  try{const res=await fetch(base+"/api/health");if(res.ok)return {base,
   close:()=>new Promise(ok=>{child.once("exit",ok);child.kill("SIGTERM");
    setTimeout(ok,1200).unref();})};}catch{}
  await new Promise(ok=>setTimeout(ok,75));
 }
 child.kill();throw Error("No app: "+error);
}
async function seed(page,id){
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
}
async function play(page,v){
 if(v.family==="balance_move"){
  await page.locator(".b27-tuning summary").click();
  const slider=page.locator("#b27-slider");
  await slider.focus();
  await slider.evaluate(el=>{el.value="4";el.dispatchEvent(new Event("change",{bubbles:true}));});
  assert.equal(await page.locator("#b27-slider:focus").count(),1);
 }else if(v.family==="tap_pair"){
  const first=page.locator('[data-b27="pair"][data-value="education"]');
  // Locator.press ensures the intended control still owns focus even after
  // the newly staged Play transition replaces its ancestor DOM.
  await first.press("Enter");
  await page.waitForFunction(()=>window.__YL_B27_QA.getState().game.first==="education");
  assert.match(await page.locator(".b27-pair-guide").innerText(),/Choose the connected idea/);
  const second=page.locator('[data-b27="pair"][data-value="judgment"]');
  await second.press("Space");
  await page.waitForFunction(()=>window.__YL_B27_QA.getState().game.pairs.length===1);
  assert.equal(await page.locator(".b27-shell button:focus").count(),1);
 }else{
  await page.locator('[data-b27="branch"][data-value="'+v.start+'"]').click();
  assert.match(await page.locator(".b27-choice-recap").innerText(),/Your initial choice/);
  if(v.family==="flip_reveal")
   assert.equal(await page.locator(".b27-flip").count(),2);
  await page.locator('[data-b27="branch"][data-value="'+v.scene+'"]').click();
  await page.locator('[data-b27="branch"][data-value="'+v.response+'"]').click();
  assert.match(await page.locator(".b27-game").innerText(),/You responded|When/i);
 }
}
async function verifyLayout(page,width){
 const result=await page.evaluate(()=>{
  const roots=[...document.querySelectorAll(".b27-shell button,.b27-deepen summary,.b27-world button")];
  const hits=roots.filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden")
   .map(el=>({text:el.textContent.trim().slice(0,40),
    w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
  const start=scrollX;window.scrollTo(60,scrollY);
  const x=scrollX;window.scrollTo(start,scrollY);
  const visible=document.documentElement.clientWidth;
  const offenders=[...document.querySelectorAll(".b27-shell *,.b27-world *")]
   .filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden")
   .map(el=>({text:el.textContent?.trim().slice(0,40),
    left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))
   .filter(el=>el.left< -1||el.right>visible+1);
  return {hits,x,visible,scrollWidth:document.documentElement.scrollWidth,offenders};
 });
 for(const h of result.hits)
  assert.ok(h.w>=43.5&&h.h>=43.5,
   "Undersized target "+width+" "+JSON.stringify(h));
 // Chromium reserves a scrollbar gutter (scrollWidth 327 vs 320) without
 // actual offscreen content. Reject real scroll or offending visible nodes.
 assert.ok(result.x<1&&result.offenders.length===0,
  "Real horizontal overflow at "+width+": "+JSON.stringify(result));
}
const variants=[
 {id:49,family:"balance_move",author:"Seneca",scenario:"half-hour"},
 {id:23,family:"tap_pair",author:"Wollstonecraft",scenario:"education"},
 {id:55,family:"decision_cards",author:"Emerson",scenario:"public plan",
  start:"maintain",scene:"details",response:"consider"},
 {id:48,family:"flip_reveal",author:"Epictetus",scenario:"uncomfortable exchange",
  start:"prepare",scene:"silence",response:"respond"}
];
test("Four NEW exact original quotations run through real app at four widths and persist safely",async()=>{
 const app=await server(),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024])for(const v of variants){
   const context=await browser.newContext({
    viewport:{width,height:920},isMobile:width<=430,
    hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],writes=[];
   page.setDefaultTimeout(9000);
   page.on("pageerror",e=>errors.push(String(e)));
   page.on("request",r=>{
    if(!["GET","HEAD"].includes(r.method())&&
     !/\/api\/b27\/(start|run)$/.test(new URL(r.url()).pathname))
     writes.push(r.method()+" "+r.url());
   });
   await seed(page,v.id);
   await page.goto(app.base+"/?b27=1",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
    document.querySelector('[data-action="discover"]'));
   await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
   assert.equal(await page.locator('[data-action="toggle-save"]').count(),1);
   assert.equal(await page.locator('[data-action="discover"]').count(),1);
   const start=page.waitForResponse(r=>r.url().endsWith("/api/b27/start"));
   await page.locator('[data-action="discover"]').click();
   const source=await(await start).json();
   assert.equal(source.status,"ready",JSON.stringify(source).slice(0,350));
   assert.equal(source.quoteId,v.id);
   assert.equal(source.selectedFamilyId,v.family);
   assert.equal(source.record.sourceFingerprint,source.sourceVersionHash);
   assert.equal(source.record.sourceReview,"development_provisional");
   await page.locator(".b27-situation").waitFor();
   assert.match(await page.locator(".b27-scenario").innerText(),new RegExp(v.scenario,"i"));
   await page.locator('[data-b27="begin"]').click();
   await page.locator(".b27-game").waitFor();
   await verifyLayout(page,width);
   await play(page,v);
   if(width===390)await page.screenshot({
    path:"qa-evidence-cz147/"+v.family+"-play-390.png",fullPage:true});
   const done=page.waitForResponse(r=>r.url().endsWith("/api/b27/run"));
   await page.locator('[data-b27="complete"]').click();
   const result=await(await done).json();
   assert.equal(result.status,"ready",JSON.stringify(result).slice(0,900));
   assert.equal(result.selectedFamilyId,v.family);
   assert.equal(result.fullExpression.sections.length,3);
   assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
   assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
   assert.equal(result.emotion.inferredActualEmotion,false);
   assert.equal(result.provenance.unchosenFutureKnown,false);
   assert.equal(result.publicationAllowed,false);
   await page.locator(".b27-result").waitFor();
   assert.equal(await page.locator(".b27-result-section").count(),3);
   await verifyLayout(page,width);
   if(width===390)await page.screenshot({
    path:"qa-evidence-cz147/"+v.family+"-compact-390.png",fullPage:true});
   assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")))).saved.length,0);
   await page.locator('[data-b27="save"]').click();
   assert.equal((await page.evaluate(()=>window.__YL_B27_QA.getState())).saved,true);
   const disk=await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")));
   assert.equal(disk.savedEncounters.length,1);
   assert.equal(disk.savedEncounters[0].saveKey,result.saveKey);
   assert.equal(disk.saved.length,0,"Encounter saving must not create Like");
   await page.locator('[data-b27="world"]').click();
   assert.equal(await page.locator(".b27-world-item").count(),1);
   await page.locator('[data-b27="reopen"]').click();
   assert.equal(await page.locator(".b27-result-section").count(),3);
   await page.locator('button[data-action="close-discover"]').click();
   await page.locator('[data-b27="delete"]').click();
   assert.equal(await page.locator(".b27-world-item").count(),0);
   assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")))).savedEncounters.length,0);
   assert.deepEqual(errors,[]);
   assert.deepEqual(writes,[]);
   await context.close();
  }
 }finally{await browser.close();await app.close();}
});
test("Feature disabled: no generalized source discovery or account writes",async()=>{
 const app=await server(false),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:880}});
  await seed(page,49);
  await page.goto(app.base+"/?b27=1");
  assert.equal(await page.evaluate(()=>window.__YL_B27_PREVIEW_ENABLED__),false);
  assert.equal(await page.evaluate(()=>window.__YL_B27_QA),undefined);
  const route=await fetch(app.base+"/api/b27/start",{
   method:"POST",headers:{"content-type":"application/json"},
   body:JSON.stringify({quoteId:49})});
  assert.equal(route.status,404);
 }finally{await browser.close();await app.close();}
});
