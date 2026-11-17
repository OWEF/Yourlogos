/**
 * CZ-151 R1 independent review lane.
 * Authenticated REAL app + /api/b27/start + /api/b27/run, never fake meaning().
 * All screenshots are browser-generated and include observed sampling offsets.
 * Chromium mobile emulation is NOT physical iPhone Safari or a human time study.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as tcpServer} from "node:net";
import {mkdirSync,writeFileSync} from "node:fs";

const OUT="qa-evidence-cz151-r1";
mkdirSync(OUT,{recursive:true});
const RECORD={engineeringSha:"2c5bb252b2b1b45f6143dfd3dbad0bad8eee7c5e",
 renderer:"actual index.html + b27-app-runtime.js",physicalSafari:false,
 humanTimedTrial:false,notes:[],cases:[],frames:[]};
const quoteCases=[
 {id:49,name:"balance",family:"balance_move"},
 {id:23,name:"pair",family:"tap_pair"},
 {id:55,name:"decision",family:"decision_cards"},
 {id:48,name:"flip",family:"flip_reveal"}
];
const widths=[320,390,430];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function server(){
 const s=tcpServer();
 await new Promise((ok,no)=>s.once("error",no).listen(0,"127.0.0.1",ok));
 const port=s.address().port;await new Promise(ok=>s.close(ok));
 const base="http://127.0.0.1:"+port,child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),YOURLOGOS_B27_PREVIEW:"1"},
  stdio:["ignore","pipe","pipe"]});
 let err="";child.stderr.on("data",b=>err+=String(b).slice(0,500));
 for(let i=0;i<150;i++){
  if(child.exitCode!==null)throw Error("Server exited "+err);
  try{if((await fetch(base+"/api/health")).ok)return {
   base,close:()=>new Promise(ok=>{child.once("exit",ok);child.kill("SIGTERM");setTimeout(ok,1400).unref()})
  };}catch{}
  await sleep(80);
 }
 child.kill();throw Error("Server failed to start: "+err);
}
async function seed(page,id){
 await page.addInitScript(({quoteId})=>{
  const d=new Date(),day=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),
   String(d.getDate()).padStart(2,"0")].join("-");
  localStorage.setItem("yourlogos_web_v1",JSON.stringify({
   saved:[],practice:{[day]:{quoteId}},started:true,
   personalization:{status:"skipped",answers:{concerns:[]}},
   savedEncounters:[],arrivals:[],themes:[]}));
  localStorage.setItem("yourlogos-introduction-v1","done");
  localStorage.setItem("yourlogos-developer-preview-v1","on");
 },{quoteId:id});
}
async function surface(page){
 return page.evaluate(()=>{
  const shell=document.querySelector(".b27-shell");
  const cover=document.querySelector(".discover-cover");
  if(!shell)return {present:false};
  const css=getComputedStyle(shell),back=cover&&getComputedStyle(cover);
  const box=shell.getBoundingClientRect(),game=document.querySelector(".b27-game");
  const gb=game?.getBoundingClientRect();
  const center=game&&gb&&gb.top<innerHeight?
    document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,gb.left+gb.width/2)),
      Math.max(0,Math.min(innerHeight-1,gb.top+Math.min(35,gb.height/2)))):null;
  return {
   present:true,opacity:Number(css.opacity),animation:css.animationName,
   coverOpacity:back?Number(back.opacity):null,coverAnimation:back?.animationName,
   dialogZ:css.zIndex,top:box.top,right:box.right,left:box.left,
   gameTop:gb?.top??null,gameHit:game?Boolean(center?.closest(".b27-shell")):null,
   scrollWidth:document.documentElement.scrollWidth,
   clientWidth:document.documentElement.clientWidth,
   actualScrollX:(()=>{
    const original=window.scrollX;window.scrollTo(60,window.scrollY);
    const moved=window.scrollX;window.scrollTo(original,window.scrollY);return moved;
   })(),
   visibleOffenders:[...document.querySelectorAll(".b27-shell *")]
    .filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden")
    .map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,
      text:el.textContent?.trim().slice(0,25)}))
    .filter(el=>el.left< -1||el.right>document.documentElement.clientWidth+1).slice(0,5),
   stage:document.querySelector(".b27-kicker")?.innerText?.slice(0,60)??"",
   exposedHome:game?Boolean(center?.closest(".today,.mobile-tabs,.quote-motion,.dock-glass")):false
  };
 });
}
function checkSurface(s,width,label){
 assert.equal(s.present,true,label+": shell absent");
 assert.equal(s.opacity,1,label+": Encounter shell faded");
 assert.equal(s.animation,"none",label+": shell entrance animation restarted");
 assert.equal(s.coverOpacity,1,label+": cover faded");
 assert.equal(s.coverAnimation,"none",label+": cover animation restarted");
 // A 7px Chromium scrollbar gutter may affect scrollWidth without exposing
 // any horizontally scrollable or clipped content (CZ-149 known verifier quirk).
 assert.ok(s.actualScrollX<1&&s.visibleOffenders.length===0,
  label+": actual horizontal overflow "+JSON.stringify(s));
 assert.ok(s.left>=-2&&s.right<=width+2,label+": clipped dialog "+JSON.stringify(s));
 assert.equal(s.exposedHome,false,label+": home element overlays game");
 if(s.gameTop!==null&&s.gameTop<780)assert.equal(s.gameHit,true,label+": active game obscured "+JSON.stringify(s));
}
async function snap(page,file){
 await page.screenshot({path:OUT+"/"+file+".jpg",type:"jpeg",quality:80,fullPage:false,
  animations:"allow"});
}
async function stageshot(page,which,name,width){
 const key=name+"-"+width+"-"+which;
 const s=await surface(page);checkSurface(s,width,key);
 const targets=await page.locator(".b27-shell button:visible").evaluateAll(els=>els.filter(el=>!el.disabled).map(el=>{
  const r=el.getBoundingClientRect();return {action:el.dataset.b27||"close",width:r.width,height:r.height};
 }));
 for(const t of targets)assert.ok(t.width>=43.5&&t.height>=43.5,
  key+": inaccessible button size "+JSON.stringify(t));
 await snap(page,key);
 RECORD.frames.push({key,kind:"stage",surface:s,targets});
}
// The "0" image is captured immediately after the browser action completes
// and the new DOM exists; screenshots include real observed offsets in JSON.
async function timed(page,name,width,action,doAction){
 if(width!==390){await doAction();return;}
 const label=name+"-"+action,started=Date.now();
 await doAction();
 const epoch=Date.now();
 const captures=[];
 for(const target of [0,50,100,250]){
  await sleep(Math.max(0,target-(Date.now()-epoch)));
  const observed=Date.now()-epoch;
  const s=await surface(page);checkSurface(s,width,label+"-"+target);
  await snap(page,label+"-"+target+"ms");
  captures.push({targetMs:target,observedStartMs:observed,surface:s});
 }
 RECORD.frames.push({key:label,kind:"timed",actionElapsedMs:epoch-started,samples:captures,
  timingNote:"0ms = first available screenshot after DOM update; measured offsets provided, not hardware frame timestamps"});
}
const branch=(page,id)=>page.locator('[data-b27="branch"][data-value="'+id+'"]').click();
async function play(page,v,width){
 const t=async(label,fn)=>timed(page,v.name,width,label,fn);
 if(v.family==="balance_move"){
  const src=()=>page.locator('[data-b27-bucket="0"] .b27-piece').first();
  const dest=()=>page.locator('[data-b27-bucket="1"]');
  const before=await page.locator(".b27-bucket-heading strong").allInnerTexts();
  await t("choose",()=>src().dragTo(dest()));
  assert.equal(await page.locator('[data-b27="complete"]').count(),1);
  assert.notDeepEqual(await page.locator(".b27-bucket-heading strong").allInnerTexts(),before);
  if(width===390){
   await t("undo",()=>page.locator('[data-b27="undo"]').click());
   assert.deepEqual(await page.locator(".b27-bucket-heading strong").allInnerTexts(),before);
   await t("rechoose",()=>src().dragTo(dest()));
  }
 } else if(v.family==="tap_pair"){
  await t("select",async()=>{
   await page.locator('[data-b27="pair"][data-value="education"]').click();
   await page.waitForFunction(()=>window.__YL_B27_QA.getState().game.first==="education");
  });
  assert.equal(await page.locator(".b27-concept.active").count(),1);
  await t("connect",async()=>{
   await page.locator('[data-b27="pair"][data-value="judgment"]').click();
   await page.waitForFunction(()=>document.querySelectorAll(".b27-link-lines path").length===1);
  });
  assert.equal(await page.locator(".b27-link-lines path").count(),1);
  if(width===390){
   await t("undo",async()=>{
    await page.locator('[data-b27="undo"]').click();
    await page.waitForFunction(()=>window.__YL_B27_QA.getState().game.pairs.length===0);
   });
   assert.equal(await page.locator(".b27-link-lines path").count(),0);
   await t("reconnect",async()=>{
    await page.locator('[data-b27="pair"][data-value="judgment"]').click();
    await page.waitForFunction(()=>document.querySelectorAll(".b27-link-lines path").length===1);
   });
  }
 } else if(v.family==="decision_cards"){
  await t("choose",()=>branch(page,"maintain"));
  await t("external-development",()=>branch(page,"details"));
  await t("response",()=>branch(page,"consider"));
  if(width===390){
   await t("undo",()=>page.locator('[data-b27="undo"]').click());
   await t("rechoose-response",()=>branch(page,"consider"));
  }
 } else {
  await t("choose",()=>branch(page,"prepare"));
  assert.equal(await page.locator(".b27-flip").count(),2);
  assert.equal(await page.locator(".b27-flipped").count(),0);
  await snap(page,v.name+"-"+width+"-sealed");
  await t("flip-card",async()=>{
   await branch(page,"silence");
   await page.locator(".b27-flipped").waitFor({state:"visible"});
  });
  assert.equal(await page.locator(".b27-flipped").count(),1);
  await t("response",()=>branch(page,"respond"));
  if(width===390){
   await t("undo",()=>page.locator('[data-b27="undo"]').click());
   await t("rechoose-response",()=>branch(page,"respond"));
  }
 }
 assert.equal(await page.locator('[data-b27="complete"]').count(),1,
  v.name+": valid canonical decision does not permit actual result");
}
test("CZ-151 R1 frozen production-code, real browser, 3 widths and four games",async()=>{
 const app=await server();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of widths)for(const v of quoteCases){
   const context=await browser.newContext({viewport:{width,height:890},
    isMobile:true,hasTouch:true,reducedMotion:"no-preference"});
   const page=await context.newPage(),errors=[];
   page.setDefaultTimeout(14000);
   page.on("pageerror",err=>errors.push(String(err)));
   await seed(page,v.id);
   await page.goto(app.base+"/?b27=1",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
    document.querySelector('[data-action="discover"]'));
   await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
   if(v.name==="balance")await snap(page,"waterline-home-"+width);
   const admissionPromise=page.waitForResponse(x=>x.url().endsWith("/api/b27/start"));
   await timed(page,v.name,width,"initial-open",()=>
    page.locator('[data-action="discover"]').click().then(()=>
     page.locator(".b27-shell").waitFor()));
   const admission=await(await admissionPromise).json();
   assert.equal(admission.status,"ready",v.name+" source admission: "+JSON.stringify(admission).slice(0,450));
   assert.equal(admission.selectedFamilyId,v.family);
   await page.locator(".b27-situation").waitFor();
   assert.ok((await page.locator(".b27-scenario").innerText()).length<=190);
   await stageshot(page,"situation",v.name,width);
   await timed(page,v.name,width,"begin",()=>page.locator('[data-b27="begin"]').click());
   await page.locator(".b27-game").waitFor();
   await stageshot(page,"play-initial",v.name,width);
   const userStart=Date.now();
   await play(page,v,width);
   await stageshot(page,"play-complete",v.name,width);
   const resultPromise=page.waitForResponse(x=>x.url().endsWith("/api/b27/run"));
   await timed(page,v.name,width,"reveal-insight",()=>
    page.locator('[data-b27="complete"]').click().then(()=>
     page.locator(".b27-result").waitFor()));
   const result=await(await resultPromise).json();
   assert.equal(result.status,"ready",v.name+" server interpretation "+JSON.stringify(result).slice(0,450));
   assert.equal(result.selectedFamilyId,v.family);
   assert.equal(result.fullExpression.status,"ready");
   assert.equal(result.emotion.status,"ready");
   assert.equal(result.compact.status,"ready");
   assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
   assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
   assert.equal(result.compact.sections.length,3);
   assert.equal(result.emotion.inferredActualEmotion,false);
   assert.equal(result.emotion.inferredMoralRank,false);
   assert.equal(result.provenance.unchosenFutureKnown,false);
   assert.deepEqual(await page.locator(".b27-result-section > p").allInnerTexts(),
    result.compact.sections.map(s=>s.text));
   await stageshot(page,"discover",v.name,width);
   const resultScroll=await page.locator(".b27-shell").evaluate(el=>{
    el.scrollTop=el.scrollHeight;return {scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
   });
   await snap(page,v.name+"-"+width+"-discover-bottom");
   assert.equal(await page.locator('[data-b27="save"]').count(),1);
   if(width===390){
    await page.locator('[data-b27="save"]').click();
    assert.equal((await page.evaluate(()=>window.__YL_B27_QA.getState())).saved,true);
    await page.locator('[data-b27="world"]').click();
    assert.equal(await page.locator(".b27-world-item").count(),1);
   }
   assert.deepEqual(errors,[],v.name+" browser exceptions");
   RECORD.cases.push({name:v.name,width,status:"automated_pass",quoteId:v.id,
    game:v.family,sourceVersionHash:result.sourceVersionHash,
    fullWords:result.fullExpression.wordCount,compactWords:result.compact.visibleWordCount,
    sections:result.compact.sections,canonical:result.canonical_choice,
    sourceQualification:result.compact?.deepening?.sourceQualification??null,
    resultScroll,userInputToResultMs:Date.now()-userStart});
   await context.close();
  }
 }finally{
  writeFileSync(OUT+"/qa-run-summary.json",JSON.stringify(RECORD,null,2));
  await browser.close();await app.close();
 }
});
