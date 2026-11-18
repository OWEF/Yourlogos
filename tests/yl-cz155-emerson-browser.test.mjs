import {test} from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {createServer} from "node:net";
import {once} from "node:events";
import {mkdir,writeFile} from "node:fs/promises";
import {chromium} from "playwright-core";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";

const evidence=process.env.YL_CZ155_BROWSER_EVIDENCE;
const button=(page,value)=>page.locator('[data-b27="branch"][data-value="'+value+'"]');
const control=(page,name)=>page.locator('[data-b27="'+name+'"]');
async function startServer(t){
 const socket=createServer();
 socket.listen(0,"127.0.0.1");await once(socket,"listening");
 const port=socket.address().port;
 await new Promise(resolve=>socket.close(resolve));
 const child=spawn(process.execPath,["server.mjs"],{env:{...process.env,
  PORT:String(port),YOURLOGOS_B27_PREVIEW:"1",YOURLOGOS_CZ155_PREVIEW:"1"}});
 t.after(async()=>{if(child.exitCode===null&&child.signalCode===null){
  const ended=once(child,"exit");child.kill();await ended;
 }});
 const url="http://127.0.0.1:"+port;
 for(let i=0;i<80;i++){
  try{if((await fetch(url+"/api/health")).ok)return url;}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 throw Error("Isolated local preview did not start");
}
async function expectStage(page,phase){
 await page.waitForFunction(expected=>{
  const state=window.__YL_B27_QA?.getState();
  return state?.stage==="play"&&state?.game?.phase===expected;
 },phase);
}
async function capture(page,name){
 if(!evidence)return;
 await mkdir(evidence,{recursive:true});
 await page.screenshot({path:evidence+"/"+name+".png"});
 const selector=(await page.locator(".b27-shell").count())?".b27-shell":".today";
 await writeFile(evidence+"/"+name+".txt",await page.locator(selector).innerText());
}
test("A first-time reader can browse the real app to Emerson and see reason-sensitive endings",async t=>{
 const base=await startServer(t);
 const browser=await chromium.launch(process.env.YL_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.YL_CHROMIUM_EXECUTABLE,args:["--no-sandbox"]}:{channel:"chrome"});
 t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:390,height:844},
  timezoneId:"Asia/Singapore",reducedMotion:"reduce",
  isMobile:true,hasTouch:true,serviceWorkers:"block"});
 await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+08:00"));
 await page.goto(base+"/?b27=1&cz155=1",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:"Get started"}).click();
 await page.getByRole("button",{name:"Skip",exact:true}).click();
 await page.locator("#yl-enter").press("End");
 let found=-1;
 for(let i=0;i<B27_APP_QUOTES.length;i++){
  const copy=await page.locator(".today .quote").innerText();
  if(copy.includes(B27_APP_QUOTES[55][0])){found=i;break;}
  await page.locator("#quote-viewport").press("ArrowDown");
 }
 assert.ok(found>=0,"Emerson is reachable in the ordinary unseeded quote deck");
 await capture(page,"10-emerson-real-feed");
 const startReq=page.waitForResponse(r=>r.url().endsWith("/api/b27/start"));
 await page.locator('[data-action="discover"]').click();
 const opening=await(await startReq).json();
 assert.equal(opening.status,"ready");
 assert.equal(opening.record.recordId,"last-bus-present-judgment");
 await expectStage(page,"opening");
 await capture(page,"11-emerson-opening");
 await control(page,"begin").click();
 assert.equal(await control(page,"branch").count(),1);
 await button(page,"publish_initial_support").click();
 await expectStage(page,"reconsider");
 assert.equal(await control(page,"branch").count(),2);
 assert.match(await page.locator(".b27-observation").innerText(),/thirteen late-shift workers/);
 assert.match(await page.locator(".b27-observation").innerText(),/has not been tested/);
 const statement1=await button(page,"maintain_merits").locator("span").innerText();
 const statement2=await button(page,"maintain_image").locator("span").innerText();
 assert.equal(statement1,statement2);
 await capture(page,"12-emerson-same-public-action");
 const results=[];
 for(const which of ["maintain_merits","maintain_image"]){
  await button(page,which).click();
  await expectStage(page,"complete");
  const resultResponse=page.waitForResponse(r=>r.url().endsWith("/api/b27/run"));
  await control(page,"complete").click();
  const result=await(await resultResponse).json();
  assert.equal(result.status,"ready",JSON.stringify(result));
  await page.locator(".b27-result").waitFor();
  assert.equal(result.provenance.directorTranscript.secondAction,statement1);
  assert.equal(result.publicationAllowed,false);
  const visible=await page.locator(".b27-result-philosophy").innerText();
  assert.ok(visible.includes(result.compact.sections[1].text));
  results.push(result);
  await capture(page,"13-emerson-"+which);
  if(which==="maintain_merits"){
   await control(page,"replay").click();
   await expectStage(page,"opening");
   await control(page,"begin").click();
   await button(page,"publish_initial_support").click();
   await expectStage(page,"reconsider");
  }
 }
 assert.notEqual(results[0].fullMeaning.meaning.selectedClaim,
  results[1].fullMeaning.meaning.selectedClaim);
 assert.notEqual(results[0].compact.sections[2].text,
  results[1].compact.sections[2].text);
 assert.equal(await page.evaluate(()=>window.__YL_B27_QA.getState().savedEncounters),0);
 assert.equal(await page.evaluate(()=>window.__YL_B27_QA.getState().quoteLikeCount),0);
 if(evidence)await writeFile(evidence+"/14-emerson-app-route.json",
  JSON.stringify({date:"2026-11-18",quoteId:55,browseSteps:found,
   samePublicStatement:statement1,
   results:results.map(x=>({claim:x.fullMeaning.meaning.selectedClaim,
    strategy:x.emotion.strategy,question:x.compact.sections[2].text}))},null,2)+"\n");
});
