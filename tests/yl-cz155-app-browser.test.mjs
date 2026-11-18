import {test} from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {once} from "node:events";
import {createServer} from "node:net";
import {mkdir,writeFile} from "node:fs/promises";
import {chromium} from "playwright-core";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";

async function launchApp(t,enablePilot){
 const socket=createServer();
 socket.listen(0,"127.0.0.1");
 await once(socket,"listening");
 const port=socket.address().port;
 await new Promise(resolve=>socket.close(resolve));
 const child=spawn(process.execPath,["server.mjs"],{env:{...process.env,
  PORT:String(port),YOURLOGOS_B27_PREVIEW:"1",YOURLOGOS_CZ155_PREVIEW:enablePilot?"1":"0"}});
 t.after(async()=>{if(child.exitCode===null&&child.signalCode===null){
  const ended=once(child,"exit");child.kill();await ended;
 }});
 const base="http://127.0.0.1:"+port;
 for(let i=0;i<80;i++){
  try{if((await fetch(base+"/api/health")).ok)return base;}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 throw new Error("Local app did not start");
}

const identity=id=>({quoteId:id,quoteText:B27_APP_QUOTES[id][0],quoteAuthor:B27_APP_QUOTES[id][1],
 quoteWork:B27_APP_QUOTES[id][3],b27DevelopmentOnly:id>=91});
const start=async(base,body)=>(await fetch(base+"/api/b27/start",{method:"POST",
 headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})).json();
const control=(page,action)=>page.locator('[data-b27="'+action+'"]');
const state=page=>page.evaluate(()=>window.__YL_B27_QA.getState());
const evidence=process.env.YL_CZ155_BROWSER_EVIDENCE;
async function capture(page,name,selector){
 if(!evidence)return;
 await mkdir(evidence,{recursive:true});
 await page.screenshot({path:evidence+"/"+name+".png"});
 await writeFile(evidence+"/"+name+".txt",await page.locator(selector).innerText());
}

test("Both preview gates and exact edition are required for the Long pilot",async t=>{
 const ordinary=await launchApp(t,false);
 assert.equal((await start(ordinary,{...identity(47),cz155Preview:true})).status,"no_fit");
 const preview=await launchApp(t,true);
 const reading=await start(preview,identity(47));
 assert.equal(reading.status,"no_fit");
 assert.match(reading.reading.url,/perseus-eng3:1/);
 const carter=await start(preview,{...identity(92),cz155Preview:true});
 assert.equal(carter.selectedFamilyId,"tap_pair");
 assert.equal(carter.record.director,undefined);
 assert.equal((await start(preview,{...identity(47),quoteText:identity(92).quoteText,cz155Preview:true})).status,"blocked");
});

test("Long card opens from an unseeded daily deck; six distinct paths, Deepen and My World",async t=>{
 const base=await launchApp(t,true);
 const browser=await chromium.launch(process.env.YL_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.YL_CHROMIUM_EXECUTABLE,args:["--no-sandbox"]}:{channel:"chrome"});
 t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:390,height:844},timezoneId:"UTC",
  reducedMotion:"reduce",isMobile:true,hasTouch:true,serviceWorkers:"block"});
 // January 7 is ID 47 in the original daily deck. Never prepopulate storage or bypass Discover.
 await page.clock.setFixedTime(new Date("2027-01-07T12:00:00Z"));
 await page.goto(base+"/?b27=1",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:"Get started"}).click();
 await page.getByRole("button",{name:"Skip",exact:true}).click();
 await page.locator("#yl-enter").press("End");
 const quote=page.locator(".today .quote");
 await quote.waitFor();
 assert.match(await quote.innerText(),/Of things some are in our power/);
 const discover=page.locator('[data-action="discover"]');
 await discover.click();
 const readingCopy=await page.locator(".b27-reading").innerText();
 assert.match(readingCopy,/George Long/);
 assert.doesNotMatch(readingCopy,/admission|capability|unverified|surrogate|mini-game/i);
 assert.match(await page.getByRole("link",{name:"Read the passage"}).getAttribute("href"),/perseus-eng3:1/);
 await capture(page,"01-reading",".b27-reading");
 await page.locator(".b27-close").click();
 await page.goto(base+"/?b27=1&cz155=1",{waitUntil:"domcontentloaded"});
 await page.locator("#yl-enter").press("End");
 await capture(page,"02-card",".today");
 await discover.click();
 await control(page,"begin").click();
 let commonEvent;
 for(const [first,second] of [["acknowledge","invite"],["acknowledge","correct"],["explain","unqualified"],
  ["explain","prepare_question"],["request","leave_request"],["request","name_harm"]]){
  const firstButton=control(page,"branch").filter({has:page.locator("strong")});
  assert.equal(await firstButton.count(),3);
  const chosen=page.locator('[data-b27="branch"][data-value="'+first+'"]');
  const literal=await chosen.locator("span").innerText();
  await chosen.press("Enter");
  const event=await page.locator(".b27-observation").innerText();
  commonEvent??=event;
  assert.equal(event,commonEvent);
  assert.equal(await page.locator(".b27-transcript blockquote").innerText(),literal);
  assert.match(await page.locator(".b27-choice-question").innerText(),/What am I asking the other person.s reply to prove/);
  assert.equal(await control(page,"branch").count(),2);
  if(first==="request"&&second==="name_harm")await capture(page,"03-reconsider",".b27-play");
  const next=page.locator('[data-b27="branch"][data-value="'+second+'"]');
  await next.press("Enter");
  assert.equal((await state(page)).game.phase,"complete");
  const resultRequest=page.waitForResponse(response=>response.url().endsWith("/api/b27/run"));
  await control(page,"complete").click();
  const result=await(await resultRequest).json();
  assert.equal(result.status,"ready",JSON.stringify(result));
  assert.equal(result.provenance.directorTranscript.firstMessage,literal);
  await page.locator(".b27-result").waitFor();
  assert.equal(await page.locator(".b27-transcript blockquote").innerText(),literal);
  assert.equal((await state(page)).quoteLikeCount,0);
  assert.equal((await state(page)).savedEncounters,0);
  if(first!=="request"||second!=="name_harm"){
   await control(page,"replay").click();
   await control(page,"begin").click();
   continue;
  }
  await capture(page,"04-ending",".b27-result");
  await page.locator(".b27-deepen summary").click();
  assert.ok((await page.locator(".b27-deepen").innerText()).includes(result.fullExpression.sections[1].text));
  await capture(page,"05-deeper",".b27-deepen");
  await control(page,"save").click();
  assert.equal((await state(page)).savedEncounters,1);
  await control(page,"world").click();
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#yl-enter").press("End");
  await page.locator('[data-view="profile"]').last().click();
  await control(page,"reopen").click();
  assert.equal(await page.locator(".b27-transcript blockquote").innerText(),literal);
  assert.equal(await page.locator(".b27-result-philosophy p").innerText(),result.compact.sections[1].text);
  await capture(page,"06-reopened",".b27-result");
  await control(page,"world").click();
  await control(page,"delete").click();
  assert.equal((await state(page)).savedEncounters,0);
  assert.equal((await state(page)).quoteLikeCount,0);
 }
});
