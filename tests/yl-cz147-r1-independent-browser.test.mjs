/**
 * CZ-147 R1 INDEPENDENT consumer A/B: not engine-only.
 * Actual Discover quote card, four original-app game families, two distinct
 * canonical decisions per quote, visible three-part expression and My World.
 * Chromium is not physical Safari, VoiceOver or a blind human reader study.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {createServer as netServer} from "node:net";
import {mkdirSync,writeFileSync} from "node:fs";
const OUT="qa-evidence-cz147-r1-independent";
mkdirSync(OUT,{recursive:true});
async function startApp(){
 const listener=netServer();
 await new Promise((yes,no)=>listener.once("error",no).listen(0,"127.0.0.1",yes));
 const port=listener.address().port;
 await new Promise((yes,no)=>listener.close(e=>e?no(e):yes()));
 const base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.mjs"],{
  cwd:process.cwd(),env:{...process.env,PORT:String(port),
   YOURLOGOS_B27_PREVIEW:"1"},stdio:["ignore","pipe","pipe"]});
 let log="";child.stderr.on("data",s=>log+=String(s).slice(0,200));
 for(let i=0;i<150;i++){
  if(child.exitCode!==null)throw Error("App exited: "+log);
  try{const r=await fetch(base+"/api/health");if(r.ok)return {
   base,close:()=>new Promise(resolve=>{
    child.once("exit",resolve);child.kill("SIGTERM");
    setTimeout(resolve,1800).unref();
   })};}catch{}
  await new Promise(ok=>setTimeout(ok,80));
 }
 child.kill();throw Error("App not ready: "+log);
}
async function seed(page,id){
 await page.addInitScript(({quoteId})=>{
  const now=new Date(),date=[now.getFullYear(),
   String(now.getMonth()+1).padStart(2,"0"),
   String(now.getDate()).padStart(2,"0")].join("-");
  localStorage.setItem("yourlogos_web_v1",JSON.stringify({
   saved:[],practice:{[date]:{quoteId}},started:true,
   personalization:{status:"skipped",answers:{concerns:[]}},
   savedEncounters:[],arrivals:[],themes:[]
  }));
  localStorage.setItem("yourlogos-introduction-v1","done");
  localStorage.setItem("yourlogos-developer-preview-v1","on");
 },{quoteId:id});
}
const cases=[
 {family:"balance_move",quoteId:49,author:"Seneca",steps:[
  {slider:4},{slider:1}
 ]},
 {family:"tap_pair",quoteId:23,author:"Wollstonecraft",steps:[
  {pair:["education","judgment"]},{pair:["dominance","agency"]}
 ]},
 {family:"decision_cards",quoteId:55,author:"Emerson",steps:[
  {path:["maintain","details","consider"]},
  {path:["revisit","critique","consider"]}
 ]},
 {family:"flip_reveal",quoteId:48,author:"Epictetus",steps:[
  {path:["prepare","silence","respond"]},
  {path:["listen","delay","respond"]}
 ]}
];
async function choose(page,spec){
 if(typeof spec.slider==="number"){
  const slider=page.locator("#b27-slider");
  await slider.focus();
  await slider.evaluate((el,num)=>{
   el.value=String(num);el.dispatchEvent(new Event("change",{bubbles:true}));
  },spec.slider);
  assert.equal(await page.locator("#b27-slider:focus").count(),1);
 }else if(Array.isArray(spec.pair)){
  await page.locator('[data-b27="pair"][data-value="'+spec.pair[0]+'"]').focus();
  await page.keyboard.press("Enter");
  await page.locator('[data-b27="pair"][data-value="'+spec.pair[1]+'"]').focus();
  await page.keyboard.press("Space");
  assert.equal(await page.locator(".b27-shell button:focus").count(),1);
 }else{
  for(const x of spec.path)
   await page.locator('[data-b27="branch"][data-value="'+x+'"]').click();
  assert.match(await page.locator(".b27-game").innerText(),/Your response:/);
 }
}
async function visibleTargets(page){
 const ui=await page.evaluate(()=>{
  const hit=[...document.querySelectorAll(".b27-shell button")]
   .filter(x=>x.getClientRects().length)
   .map(x=>({w:x.getBoundingClientRect().width,
    h:x.getBoundingClientRect().height}));
  const saved=scrollX;scrollTo(65,scrollY);
  const x=scrollX;scrollTo(saved,scrollY);
  return {hit,x};
 });
 assert.ok(ui.x<1,"No horizontal physical scrolling");
 for(const x of ui.hit)assert.ok(x.w>=43.5&&x.h>=43.5,
  "Interactive target under 44px: "+JSON.stringify(x));
}
test("Independent 8 real consumer A/B paths prove personalized philosophical Section II and III",async()=>{
 const app=await startApp(),browser=await chromium.launch({
  channel:"chrome",args:["--no-sandbox"]});
 try{
  const evidence=[];
  for(const c of cases){
   const results=[];
   for(let variant=0;variant<2;variant++){
    const context=await browser.newContext({viewport:{width:390,height:890},
     isMobile:true,hasTouch:true,reducedMotion:"reduce"});
    const page=await context.newPage(),errors=[],writes=[];
    page.setDefaultTimeout(9000);
    page.on("pageerror",e=>errors.push(String(e)));
    page.on("request",r=>{
     if(!["GET","HEAD"].includes(r.method())&&
       !/\/api\/b27\/(start|run)$/.test(new URL(r.url()).pathname))
      writes.push(r.method()+" "+r.url());
    });
    await seed(page,c.quoteId);
    await page.goto(app.base+"/?b27=1",{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>window.__YL_B27_QA?.getState&&
     document.querySelector('[data-action="discover"]'));
    await page.evaluate(()=>window.dispatchEvent(new Event("yourlogos:skip-entrance")));
    assert.match(await page.locator(".today .author").innerText(),new RegExp(c.author,"i"));
    assert.equal(await page.locator('[data-action="toggle-save"]').count(),1);
    const started=page.waitForResponse(x=>x.url().endsWith("/api/b27/start"));
    await page.locator('[data-action="discover"]').click();
    const accepted=await(await started).json();
    assert.equal(accepted.status,"ready",JSON.stringify(accepted));
    assert.equal(accepted.selectedFamilyId,c.family);
    await page.locator(".b27-game").waitFor();
    await visibleTargets(page);
    await choose(page,c.steps[variant]);
    const api=page.waitForResponse(x=>x.url().endsWith("/api/b27/run"));
    await page.locator('[data-b27="complete"]').click();
    const output=await(await api).json();
    assert.equal(output.status,"ready",JSON.stringify(output).slice(0,500));
    await page.locator(".b27-result").waitFor();
    assert.equal(output.fullExpression.sections.length,3);
    assert.equal(output.compact.sections.length,3);
    assert.equal(output.fullExpression.wordCount>=80&&output.fullExpression.wordCount<=120,true);
    assert.equal(output.compact.visibleWordCount>=40&&output.compact.visibleWordCount<=65,true);
    assert.equal(output.emotion.inferredActualEmotion,false);
    const rendered=await page.locator(".b27-result-section > p").allInnerTexts();
    assert.deepEqual(rendered,output.compact.sections.map(x=>x.text),
     "Actual rendered expression must equal authenticated engine output");
    await visibleTargets(page);
    await page.screenshot({path:OUT+"/app-"+c.family+"-"+(variant?"after":"before")+
     "-390.png",fullPage:true});
    await page.locator('[data-b27="save"]').click();
    assert.equal((await page.evaluate(()=>window.__YL_B27_QA.getState())).saved,true);
    assert.equal((await page.evaluate(()=>JSON.parse(
     localStorage.getItem("yourlogos_web_v1")).savedEncounters)).length,1);
    await page.locator('[data-b27="world"]').click();
    assert.equal(await page.locator(".b27-world-item").count(),1);
    await page.locator('[data-b27="reopen"]').click();
    assert.equal(await page.locator(".b27-result-section").count(),3);
    await page.locator('button[data-action="close-discover"]').click();
    await page.locator('[data-b27="delete"]').click();
    assert.equal(await page.locator(".b27-world-item").count(),0);
    assert.equal((await page.evaluate(()=>JSON.parse(
     localStorage.getItem("yourlogos_web_v1")).saved.length)),0);
    assert.deepEqual(errors,[]);
    assert.deepEqual(writes,[]);
    results.push({canonicalChoice:output.canonical_choice,
     reasoning:output.fullMeaning,emotion:output.emotion,
     full:output.fullExpression,compact:output.compact,
     saveKey:output.saveKey});
    await context.close();
   }
   const [before,after]=results;
   assert.notEqual(before.saveKey,after.saveKey);
   assert.equal(before.reasoning.meaning.centralClaim,
    after.reasoning.meaning.centralClaim);
   assert.notEqual(before.reasoning.meaning.selectedClaim,
    after.reasoning.meaning.selectedClaim);
   assert.notEqual(before.compact.sections[1].text,
    after.compact.sections[1].text);
   assert.notEqual(before.compact.sections[2].text,
    after.compact.sections[2].text);
   evidence.push({quoteId:c.quoteId,family:c.family,before,after});
  }
  writeFileSync(OUT+"/consumer-rendered-a-b.json",JSON.stringify({
   engineeringSha:"989ebacd37879dc2edc2ac0c76f55fe807357bc8",
   qaMode:"independent_browser_no_engine_changes",
   chromeEmulationNotPhysicalSafari:true,realProductionWrites:false,
   comparisons:evidence},null,2));
  assert.equal(evidence.length,4);
 }finally{await browser.close();await app.close();}
});
