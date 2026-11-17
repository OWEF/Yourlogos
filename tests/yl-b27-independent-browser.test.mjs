/**
 * CZ-145 QA-only adversarial real-app checks on the corrected engineering SHA.
 * Chromium emulation only: NOT physical Safari, VoiceOver or real-user research.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as netServer} from "node:net";
import {mkdirSync} from "node:fs";
const ARTIFACT_DIR="qa-evidence-independent";
mkdirSync(ARTIFACT_DIR,{recursive:true});
async function freePort(){
 const sock=netServer();
 await new Promise((resolve,reject)=>sock.once("error",reject).listen(0,"127.0.0.1",resolve));
 const port=sock.address().port;
 await new Promise((resolve,reject)=>sock.close(err=>err?reject(err):resolve()));
 return port;
}
async function appServer(enabled){
 const port=await freePort(),base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),YOURLOGOS_B27_PREVIEW:enabled?"1":"0"},
  stdio:["ignore","pipe","pipe"]
 });
 let error="";
 child.stderr.on("data",x=>{error+=String(x).slice(0,1000)});
 for(let i=0;i<120;i++){
  if(child.exitCode!==null)throw Error("Local server exited: "+error);
  try{const response=await fetch(base+"/api/health");if(response.ok)return {
   base,close:()=>new Promise(resolve=>{
    child.once("exit",resolve);child.kill("SIGTERM");
    setTimeout(resolve,1500).unref();
   })
  }}catch{}
  await new Promise(resolve=>setTimeout(resolve,75));
 }
 child.kill();throw Error("No healthy local app "+error);
}
async function seed(page,id){
 await page.addInitScript(({quoteId})=>{
  const d=new Date(),date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),
   String(d.getDate()).padStart(2,"0")].join("-");
  if(!localStorage.getItem("qa-once")){
   localStorage.setItem("yourlogos_web_v1",JSON.stringify({
    saved:[],practice:{[date]:{quoteId}},started:true,
    personalization:{status:"skipped",answers:{concerns:[]}},
    savedEncounters:[],arrivals:[],themes:[]
   }));
   localStorage.setItem("qa-once","1");
  }
  localStorage.setItem("yourlogos-introduction-v1","done");
  localStorage.setItem("yourlogos-developer-preview-v1","on");
 },{quoteId:id});
}
const state=page=>page.evaluate(()=>window.__YL_B27_QA?.getState());
async function readyQuote(page,base,id){
 await page.goto(base+"/?b27=1",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
  document.querySelector('[data-action="discover"]'));
 await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
 const response=page.waitForResponse(x=>x.url().endsWith("/api/b27/start"));
 await page.locator('[data-action="discover"]').click();
 const selected=await(await response).json();
 assert.equal(selected.quoteId,id);
 assert.equal((await state(page)).quoteId,id);
 assert.equal(await page.locator('[data-action="toggle-save"]').count(),1);
 assert.equal(await page.locator("#questions,#qa-panel,[data-game]").count(),0);
 if(selected.status==="ready"){
  await page.locator(".b27-game").waitFor();
  assert.equal(selected.record.sourceFingerprint,selected.sourceVersionHash);
 }else assert.equal(selected.status,"no_fit");
 return selected;
}
async function complete(page,expectedFamily){
 const response=page.waitForResponse(x=>x.url().endsWith("/api/b27/run"));
 await page.locator('[data-b27="complete"]').click();
 const record=await(await response).json();
 assert.equal(record.status,"ready",JSON.stringify(record).slice(0,700));
 assert.equal(record.selectedFamilyId,expectedFamily);
 await page.locator(".b27-result").waitFor();
 assert.equal(await page.locator(".b27-result-section").count(),3);
 assert.ok(record.fullExpression.wordCount>=80&&record.fullExpression.wordCount<=120);
 assert.ok(record.compact.visibleWordCount>=40&&record.compact.visibleWordCount<=65);
 assert.equal(record.compact.fullWordCount,record.fullExpression.wordCount);
 assert.notEqual(record.emotion?.inferredActualEmotion,true);
 return record;
}
async function assertTouchAndFlow(page,width){
 const box=await page.evaluate(()=>{
  const candidates=[...document.querySelectorAll(".b27-shell button,.b27-world button,.b27-deepen summary")];
  return candidates.filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=="hidden")
   .map(el=>({label:el.getAttribute("aria-label")||el.textContent.trim().slice(0,40),
    w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
 });
 for(const hit of box){
  assert.ok(hit.w>=43.5&&hit.h>=43.5,
   "Hit target <44px at "+width+"px: "+JSON.stringify(hit));
 }
 const overflow=await page.evaluate(()=>({
  scroll:document.documentElement.scrollWidth,
  visible:document.documentElement.clientWidth
 }));
 const diagnostics=overflow.scroll>overflow.visible+1?await page.evaluate(()=>({
  innerWidth:window.innerWidth,visualWidth:window.visualViewport?.width,
  bodyClientWidth:document.body.clientWidth,htmlClientWidth:document.documentElement.clientWidth,
  bodyScrollWidth:document.body.scrollWidth,devicePixelRatio:devicePixelRatio,
  htmlBox:document.documentElement.getBoundingClientRect().toJSON(),
  bodyBox:document.body.getBoundingClientRect().toJSON()
 })):null;
 const culprits=overflow.scroll>overflow.visible+1?await page.evaluate(()=>
  [...document.querySelectorAll("body *")].map(el=>{
   const r=el.getBoundingClientRect();
   return {tag:el.tagName,cls:String(el.className||"").slice(0,100),left:r.left,right:r.right,width:r.width}
  }).filter(x=>x.right>document.documentElement.clientWidth+1||x.left< -1)
    .sort((a,b)=>b.right-a.right).slice(0,12)):null;
 const horizontalScroll=await page.evaluate(()=>{
  const x=window.scrollX,y=window.scrollY;
  window.scrollTo(80,y);
  const observed=window.scrollX;
  window.scrollTo(x,y);
  return observed;
 });
 assert.ok(horizontalScroll<1&&(!culprits||culprits.length===0),
  "Real horizontal scroll or out-of-viewport content at "+width+"px: "+
  JSON.stringify({overflow,horizontalScroll,diagnostics,culprits}));
}
async function screenshot(page,name){
 await page.screenshot({path:ARTIFACT_DIR+"/"+name,fullPage:true});
}
test("Separate preview flags: query alone never enables unfinished feature or API",async()=>{
 const app=await appServer(false),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:840}});
  await seed(page,12);
  await page.goto(app.base+"/?b27=1",{waitUntil:"domcontentloaded"});
  assert.equal(await page.evaluate(()=>window.__YL_B27_PREVIEW_ENABLED__),false);
  assert.equal(await page.evaluate(()=>window.__YL_B27_QA),undefined);
  const response=await fetch(app.base+"/api/b27/start",{
   method:"POST",headers:{"content-type":"application/json"},
   body:JSON.stringify({quoteId:12})
  });
  assert.equal(response.status,404);
  await page.close();
 }finally{await browser.close();await app.close();}
});
test("Independent touchscreen, keyboard, four actual games and My World across 320/390/430/1024",async()=>{
 const app=await appServer(true),browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({
    viewport:{width,height:900},hasTouch:width<=430,isMobile:width<=430,
    reducedMotion:"reduce",acceptDownloads:true
   });
   const page=await context.newPage(),errors=[],writes=[];
   page.setDefaultTimeout(8000);
   page.on("pageerror",x=>errors.push(String(x.message)));
   page.on("request",request=>{
    if(!["GET","HEAD"].includes(request.method())&&
      !/\/api\/b27\/(start|run)$/.test(new URL(request.url()).pathname))
     writes.push(request.method()+" "+request.url());
   });
   await seed(page,91);
   const source=await readyQuote(page,app.base,91);
   assert.equal(source.status,"ready");
   assert.equal(source.selectedFamilyId,"tap_pair");
   assert.match(await page.locator(".b27-scenario").innerText(),/gift|friend/i);
   await assertTouchAndFlow(page,width);
   if(width===390)await screenshot(page,"tap-pair-390.png");
   const first=page.locator('[data-b27="pair"][data-value="sketch"]');
   await first.focus();await page.keyboard.press("Enter");
   assert.equal((await state(page)).game.first,"sketch");
   assert.match(await page.locator(".b27-pair-guide").innerText(),/Friend's handiwork/);
   assert.match(await page.locator(".b27-pair-guide").innerText(),/The finished gift/);
   assert.equal(await page.locator('[data-b27="pair"][data-value="assemble"]:disabled').count(),1,
    "An unsupported edge must be visibly unavailable, not a secret wrong answer");
   await page.locator('[data-b27="pair"][data-value="friend"]').focus();
   await page.keyboard.press("Space");
   assert.equal((await state(page)).game.pairs.length,1);
   assert.equal(await page.locator(".b27-shell button:focus").count(),1,
    "Keyboard rerender must not discard focus");
   const result=await complete(page,"tap_pair");
   await assertTouchAndFlow(page,width);
   assert.equal((await state(page)).saved,false);
   assert.equal((await state(page)).quoteLikeCount,0);
   await page.locator('[data-b27="save"]').click();
   assert.equal((await state(page)).saved,true);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("yourlogos_web_v1")));
   assert.equal(saved.saved.length,0);
   assert.equal(saved.savedEncounters.length,1);
   assert.equal(saved.savedEncounters[0].saveKey,result.saveKey);
   await page.locator('[data-b27="world"]').click();
   await page.locator(".b27-world-item").waitFor();
   await assertTouchAndFlow(page,width);
   await page.reload({waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.__YL_B27_QA?.getState);
   await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
   // Reload begins on the daily Encounter tab by design. A real user must
   // revisit My World, not expect a modal/card to reopen spontaneously.
   await page.locator('[data-view="profile"]:visible').first().click();
   await page.locator(".b27-world-item").waitFor();
   assert.equal(await page.locator(".b27-world-item").count(),1,
    "Saved Encounter must survive full reload");
   await page.locator('[data-b27="reopen"]').click();
   await page.locator(".b27-result").waitFor();
   assert.equal((await state(page)).saved,true);
   await page.locator('button[data-action="close-discover"]').click();
   await page.locator('[data-b27="delete"]').click();
   assert.equal(await page.locator(".b27-world-item").count(),0);
   assert.equal((await page.evaluate(()=>
    JSON.parse(localStorage.getItem("yourlogos_web_v1")).savedEncounters.length)),0);
   await assertTouchAndFlow(page,width);
   assert.deepEqual(errors,[],"No Chromium JS errors");
   assert.deepEqual(writes,[],"No account or unrelated network writes");
   await context.close();
  }
  for(const width of [320,390,430,1024])for(const variant of [
   {id:12,family:"balance_move",name:"balance-move-390.png"},
   {id:34,family:"decision_cards",name:"decision-cards-390.png"},
   {id:94,family:"flip_reveal",name:"flip-reveal-390.png"}
  ]){
   const context=await browser.newContext({viewport:{width,height:900},
    isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[];
   page.setDefaultTimeout(8000);
   page.on("pageerror",e=>errors.push(e.message));
   await seed(page,variant.id);
   const source=await readyQuote(page,app.base,variant.id);
   assert.equal(source.selectedFamilyId,variant.family);
   await assertTouchAndFlow(page,width);
   if(variant.family==="balance_move"){
    if(width===390)await screenshot(page,variant.name);
    const slider=page.locator("#b27-slider");
    await slider.focus();
    await slider.evaluate(el=>{
     el.value="4";el.dispatchEvent(new Event("change",{bubbles:true}));
    });
    assert.equal((await state(page)).game.owners.filter(x=>x===0).length,4);
    assert.equal(await page.locator("#b27-slider:focus").count(),1);
    await page.locator('[data-b27="undo"]').click();
    assert.equal((await state(page)).game.owners.filter(x=>x===0).length,2);
    await page.locator('[data-b27="move"]').first().click();
    assert.equal((await state(page)).game.touched,true);
   }else{
    await page.locator('[data-b27="branch"][data-value="change"]').focus();
    await page.keyboard.press("Space");
    assert.ok((await page.locator(".b27-choice-recap").innerText()).length>25,
     "Do not hide the reader\'s initial choice while exploring an invented future");
    assert.equal(await page.locator(".b27-shell button:focus").count(),1);
    if(variant.family==="flip_reveal"){
     assert.equal(await page.locator(".b27-flip").count(),2);
     if(width===390)await screenshot(page,variant.name);
    }else if(width===390)await screenshot(page,variant.name);
    await page.locator('[data-b27="branch"][data-value="risk"]').click();
    await page.locator('[data-b27="branch"][data-value="continue"]').click();
    assert.match(await page.locator(".b27-game").innerText(),/Your response:/,
     "Chosen response must remain visible before Discover");
    if(variant.family==="decision_cards")assert.match(
     await page.locator(".b27-game").innerText(),/Imagined development:/,
     "Invented event must remain visible beside the resulting choice");
   }
   const result=await complete(page,variant.family);
   assert.equal(result.quoteId,variant.id);
   await assertTouchAndFlow(page,width);
   assert.deepEqual(errors,[]);
   await context.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:900}});
  await seed(page,31);
  const rejected=await readyQuote(page,app.base,31);
  assert.equal(rejected.status,"no_fit");
  assert.equal(await page.locator(".b27-game").count(),0);
  assert.equal(await page.locator(".b27-source-note").count(),1);
  await page.close();
 }finally{await browser.close();await app.close();}
});
