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
// The shared '.b27-situation' is also rendered while the /start call is LOADING.
// A DOM-visible placeholder therefore never proves a source-validated state.
async function waitForDirector(page,phase){
 await page.waitForFunction(expected=>{
  const state=window.__YL_B27_QA?.getState();
  return state?.stage==="play"&&state?.game?.phase===expected;
 },phase);
 const actual=await state(page);
 assert.equal(actual.stage,"play");
 assert.equal(actual.game.phase,phase);
 return actual;
}
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
  assert.equal(await page.locator(".b27-social").count(),1,
   "Epictetus pilot must use the source-authored conversation presentation");
  const event=await page.locator(".b27-observation").innerText();
  commonEvent??=event;
  assert.equal(event,commonEvent);
  assert.equal(await page.locator(".b27-transcript blockquote").innerText(),literal);
  assert.equal(await page.locator(".b27-social-message").count(),1);
  assert.equal(await page.locator(".b27-social-private").count(),0);
  assert.equal(await page.locator(".b27-social-facts").count(),0,
   "No pre-choice dashboard may label the intended philosophical conclusion");
  assert.match(await page.locator(".b27-social-event").innerText(),
   /AFTER THE FIRST MESSAGE[\\s\\S]*READ STATUS UNKNOWN/);
  assert.equal(await page.locator(".b27-social-reconsider").count(),1);
  assert.doesNotMatch(await page.locator(".b27-social-reconsider").innerText(),
   /acknowledgment (?:sent|not sent)|further repair may|their response|external control/i);
  await capture(page,"M2-"+first+"-"+second+"-reconsider",".b27-play");
  assert.match(await page.locator(".b27-choice-question").innerText(),/What am I asking the other person.s reply to prove/);
  assert.equal(await control(page,"branch").count(),2);
  const optionBackgrounds=await page.locator(".b27-social-options .b27-choice")
   .evaluateAll(options=>options.map(o=>getComputedStyle(o).backgroundImage));
  assert.equal(new Set(optionBackgrounds).size,1,
   "No choice may be highlighted as the philosopher-approved answer");

  if(first==="request"&&second==="name_harm"){
   await capture(page,"03-reconsider",".b27-play");
   assert.equal((await state(page)).savedEncounters,0);
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator("#yl-enter").press("End");
   await discover.click();
   await waitForDirector(page,"reconsider");
   assert.equal((await state(page)).game.firstAction.id,first);
   assert.equal(await page.locator(".b27-transcript blockquote").innerText(),literal);
   assert.equal(await control(page,"branch").count(),2);
   await capture(page,"03b-resumed-after-first",".b27-play");
  }
  const next=page.locator('[data-b27="branch"][data-value="'+second+'"]');
  await next.press("Enter");
  const privateFollowUp=["correct","leave_request","prepare_question"].includes(second);
  assert.equal(await page.locator(".b27-social-private").count(),privateFollowUp?1:0);
  assert.equal(await page.locator(".b27-social-second").count(),privateFollowUp?0:1);
  const eventAfterSecond=await page.locator(".b27-social-event").innerText();
  assert.equal(eventAfterSecond.includes("Message delivered. Later, no reply has arrived."),true,
   "Independent observation must remain attached to the first message only");
  if(privateFollowUp){
   assert.match(await page.locator(".b27-social-private").innerText(),/NOT SENT/);
  }else{
   assert.match(await page.locator(".b27-social-second").innerText(),
    /Delivery and reply not observed for this second message/);
   assert.doesNotMatch(await page.locator(".b27-social-second").innerText(),
    /no reply (yet|has arrived)|delivered/i);
  }
  await capture(page,"M2-"+first+"-"+second+"-action",".b27-play");
  assert.equal((await state(page)).game.phase,"complete");
  if(first==="request"&&second==="name_harm"){
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator("#yl-enter").press("End");
   await discover.click();
   await waitForDirector(page,"complete");
   assert.equal((await state(page)).game.secondAction.id,second);
   await capture(page,"03c-resumed-after-second",".b27-play");
  }
  const resultRequest=page.waitForResponse(response=>response.url().endsWith("/api/b27/run"));
  await control(page,"complete").click();
  const result=await(await resultRequest).json();
  assert.equal(result.status,"ready",JSON.stringify(result));
  assert.equal(result.provenance.directorTranscript.firstMessage,literal);
  await page.locator(".b27-result").waitFor();
  const followupCaption=await page.locator(".b27-result-followup h3").innerText();
  assert.equal(followupCaption,privateFollowUp?
   second==="leave_request"?"PRIVATE DECISION · NOT SENT":"PRIVATE NOTE · NOT SENT":
   "SECOND MESSAGE · SENT",
   "Full and saved result must distinguish a sent message from a private act");
  assert.match(await page.locator(".b27-result-external").innerText(),
   /INDEPENDENT STORY EVENT · AFTER FIRST MESSAGE/);
  const resultSecond=await page.locator(".b27-result-followup").innerText();
  assert.match(resultSecond,privateFollowUp?
   /Private action; not sent to the recipient/:/Second message: sent; delivery and reply not observed/);
  assert.doesNotMatch(resultSecond,/no reply (yet|has arrived)/i);
  await capture(page,"M2-"+first+"-"+second+"-insight",".b27-result");
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
  assert.equal(await page.locator(".b27-result-followup h3").innerText(),
   "SECOND MESSAGE · SENT",
   "A reopened saved encounter must retain second-action media from saved fullMeaning");
  assert.equal(await page.locator(".b27-transcript blockquote").innerText(),literal);
  assert.match(await page.locator(".b27-result-external").innerText(),/AFTER FIRST MESSAGE/);
  assert.match(await page.locator(".b27-result-followup").innerText(),/Second message: sent; delivery and reply not observed/);
  assert.equal(await page.locator(".b27-result-philosophy p").innerText(),result.compact.sections[1].text);
  await capture(page,"06-reopened",".b27-result");
  await control(page,"world").click();
  await control(page,"delete").click();
  assert.equal((await state(page)).savedEncounters,0);
  assert.equal((await state(page)).quoteLikeCount,0);
 }
});

test("2026-11-18 ordinary unseeded feed can enter truthful reading-first through a real swipe",async t=>{
 const base=await launchApp(t,false);
 const browser=await chromium.launch(process.env.YL_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.YL_CHROMIUM_EXECUTABLE,args:["--no-sandbox"]}:{channel:"chrome"});
 t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:390,height:844},
  timezoneId:"Asia/Singapore",reducedMotion:"reduce",isMobile:true,
  hasTouch:true,serviceWorkers:"block"});
 await page.clock.setFixedTime(new Date("2026-11-18T10:00:00+08:00"));
 await page.goto(base+"/?b27=1",{waitUntil:"domcontentloaded"});
 await page.getByRole("button",{name:"Get started"}).click();
 await page.getByRole("button",{name:"Skip",exact:true}).click();
 await page.locator("#yl-enter").press("End");
 assert.ok((await page.locator(".today .quote").innerText()).includes(B27_APP_QUOTES[23][0]),
  "The unseeded current-date daily item must remain authentic (ID 23)");
 let encountered=null;
 for(let i=0;i<8;i++){
  const copy=await page.locator(".today .quote").innerText();
  const quoteId=B27_APP_QUOTES.findIndex(q=>copy.includes(q[0]));
  assert.ok(quoteId>=0,"Visible quote came from the actual app ledger");
  const responsePromise=page.waitForResponse(r=>r.url().endsWith("/api/b27/start"));
  await page.locator('[data-action="discover"]').click();
  const result=await(await responsePromise).json();
  assert.equal(result.quoteId,quoteId);
  if(result.status==="no_fit"){
   encountered={date:"2026-11-18",quoteId,quoteText:B27_APP_QUOTES[quoteId][0],
    route:result.status,reading:await page.locator(".b27-reading").innerText(),
    sourceWork:result.quote.work};
   assert.doesNotMatch(encountered.reading,
    /admission|capability gap|unsupported mechanics|unverified|no_fit|source review/i);
   assert.equal((await state(page)).quoteLikeCount,0);
   assert.equal((await state(page)).savedEncounters,0);
   await capture(page,"07-current-date-reading-first",".b27-reading");
   break;
  }
  assert.equal(result.status,"ready");
  await page.locator(".b27-close").click();
  await page.locator("#quote-viewport").press("ArrowDown");
 }
 assert.ok(encountered,"A naturally browsed quotation must yield reading-first");
 if(evidence)await writeFile(evidence+"/07-current-date-route.json",JSON.stringify(encountered,null,2)+"\\n");
});


test("R2: invalid drafts fail closed, valid drafts resume, and source versions reset in 9 clean browser sessions",async t=>{
 const base=await launchApp(t,true);
 const browser=await chromium.launch(process.env.YL_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.YL_CHROMIUM_EXECUTABLE,args:["--no-sandbox"]}:{channel:"chrome"});
 t.after(()=>browser.close());
 const cases=["forged-observation","source-version","valid"];
 const outcomes=[];
 for(let i=0;i<9;i++){
  const kind=cases[i%cases.length];
  // Each new browser context has independent localStorage, sessionStorage,
  // cookies, script state, and an unseeded current-date daily deck.
  const context=await browser.newContext({viewport:{width:390,height:844},
   timezoneId:"UTC",reducedMotion:"reduce",isMobile:true,
   hasTouch:true,serviceWorkers:"block"});
  const page=await context.newPage();
  try{
   await page.clock.setFixedTime(new Date("2027-01-07T12:00:00Z"));
   await page.goto(base+"/?b27=1&cz155=1",{waitUntil:"domcontentloaded"});
   await page.getByRole("button",{name:"Get started"}).click();
   await page.getByRole("button",{name:"Skip",exact:true}).click();
   await page.locator("#yl-enter").press("End");
   await page.locator('[data-action="discover"]').click();
   await waitForDirector(page,"opening");
   await control(page,"begin").click();
   await page.locator('[data-b27="branch"][data-value="request"]').click();
   await waitForDirector(page,"reconsider");
   const draft=await page.evaluate(()=>{
    const raw=sessionStorage.getItem("yourlogos-b27-director-draft/1");
    return JSON.parse(raw);
   });
   assert.equal(draft.history.events[0].id,"request");
   assert.equal(draft.history.events[1].origin,"independent_fiction");
   if(kind!=="valid")await page.evaluate(kind=>{
    const key="yourlogos-b27-director-draft/1";
    const draft=JSON.parse(sessionStorage.getItem(key));
    if(kind==="forged-observation")
     draft.history.events[1].observed.push("Friend read the message and forgave you.");
    if(kind==="source-version")draft.sourceVersionHash="stale-forbidden-source/999";
    sessionStorage.setItem(key,JSON.stringify(draft));
   },kind);
   const responsePromise=page.waitForResponse(response=>
    response.url().endsWith("/api/b27/start"));
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator("#yl-enter").press("End");
   await page.locator('[data-action="discover"]').click();
   const response=await(await responsePromise).json();
   assert.equal(response.status,"ready","source failed to load on recovery");
   await waitForDirector(page,kind==="valid"?"reconsider":"opening");
   const recovered=await state(page);
   assert.equal(recovered.savedEncounters,0);
   const persisted=await page.evaluate(()=>
    sessionStorage.getItem("yourlogos-b27-director-draft/1"));
   if(kind==="valid"){
    assert.equal(recovered.game.firstAction.id,"request");
    assert.equal(recovered.game.observation.text,"Message delivered. Later, no reply has arrived.");
    assert.ok(persisted,"valid draft should still be resumable");
   }else{
    assert.equal(recovered.beat,"situation");
    assert.equal(persisted,null,"invalid or stale draft must be cleared");
    assert.equal(recovered.game.firstAction,null);
    assert.equal(recovered.game.observation,null);
   }
   outcomes.push({session:i+1,kind,result:"pass"});
  }finally{await context.close();}
 }
 assert.equal(outcomes.length,9);
 if(evidence)await writeFile(evidence+"/08-draft-recovery-repetitions.json",
  JSON.stringify(outcomes,null,2)+"\\n");
});


test("M1: Encounter close wins pointer and keyboard over the persistent profile launcher at 320/390/430px",async t=>{
 const base=await launchApp(t,true);
 const browser=await chromium.launch(process.env.YL_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.YL_CHROMIUM_EXECUTABLE,args:["--no-sandbox"]}:{channel:"chrome"});
 t.after(()=>browser.close());
 for(const width of [320,390,430,1024]){
  const context=await browser.newContext({viewport:{width,height:844},
   timezoneId:"UTC",reducedMotion:"reduce",isMobile:true,
   hasTouch:true,serviceWorkers:"block"});
  const page=await context.newPage();
  try{
   await page.clock.setFixedTime(new Date("2027-01-07T12:00:00Z"));
   await page.goto(base+"/?b27=1&cz155=1",{waitUntil:"domcontentloaded"});
   await page.getByRole("button",{name:"Get started"}).click();
   await page.getByRole("button",{name:"Skip",exact:true}).click();
   await page.locator("#yl-enter").press("End");
   const discover=page.locator('[data-action="discover"]');
   const profile=page.locator("body > .settings-launch");
   assert.equal(await profile.count(),1,"Persistent profile launcher is present");
   await discover.click();
   await waitForDirector(page,"opening");
   assert.equal(await profile.isVisible(),false,
    width+"px profile launcher must not appear through or overlap Encounter");
   const close=page.getByRole("button",{name:"Close Encounter"});
   const geometry=await page.evaluate(()=>{
    const element=document.querySelector(".b27-close");
    const box=element.getBoundingClientRect();
    const at=(x,y)=>{const top=document.elementFromPoint(x,y);
     return top===element||element.contains(top);};
    return {left:box.left,right:box.right,top:box.top,
     width:box.width,height:box.height,
     centerIsClose:at(box.left+box.width/2,box.top+box.height/2),
     innerCornerIsClose:at(box.right-8,box.top+8)};
   });
   assert.ok(geometry.left>=0&&geometry.right<=width,
    width+"px close must be fully in the viewport: "+JSON.stringify(geometry));
   assert.ok(geometry.width>=44&&geometry.height>=44,
    width+"px close touch target below 44px: "+JSON.stringify(geometry));
   assert.ok(geometry.centerIsClose&&geometry.innerCornerIsClose,
    width+"px close is obscured: "+JSON.stringify(geometry));
   await capture(page,"M1-"+width+"-close-visible",".b27-shell");
   if(width===320)await page.touchscreen.tap(
     geometry.left+geometry.width/2,geometry.top+geometry.height/2);
   else await page.mouse.click(
     geometry.left+geometry.width/2,geometry.top+geometry.height/2);
   assert.equal(await page.locator(".b27-shell").count(),0,
    width+"px actual pointer action failed to dismiss Encounter");
   assert.equal(await profile.isVisible(),true,
    width+"px profile launcher did not return after dismiss");
   await discover.click();
   await waitForDirector(page,"opening");
   await close.focus();
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute("aria-label")),
    "Close Encounter","Accessible close control was not keyboard-focusable");
   await page.keyboard.press("Enter");
   assert.equal(await page.locator(".b27-shell").count(),0,
    width+"px keyboard Enter failed to dismiss Encounter");
  }finally{await context.close();}
 }
});

test("M2: 320/390/430/1024px reconsideration, motion and resumed focus preserve clearance",async t=>{
 const base=await launchApp(t,true);
 const browser=await chromium.launch(process.env.YL_CHROMIUM_EXECUTABLE?
  {executablePath:process.env.YL_CHROMIUM_EXECUTABLE,args:["--no-sandbox"]}:{channel:"chrome"});
 t.after(()=>browser.close());
 for(const width of [320,390,430]){
  for(const reducedMotion of ["reduce","no-preference"]){
   const context=await browser.newContext({viewport:{width,height:844},
    timezoneId:"UTC",reducedMotion,isMobile:true,hasTouch:true,serviceWorkers:"block"});
   const page=await context.newPage();
   const check=async label=>{
    // Focus the question, then navigate by keyboard into the first card so
    // its actual :focus-visible outline and -2px raised position are measured.
    await page.locator(".b27-choice-question").focus();
    await page.keyboard.press("Tab");
    const details=await page.evaluate(()=>{
     const title=document.querySelector(".b27-choice-question");
     const card=document.querySelector(".b27-message-choices .b27-choice");
     const a=title.getBoundingClientRect(),b=card.getBoundingClientRect();
     return {gap:b.top-a.bottom,width:document.documentElement.clientWidth,
      cardHeight:b.height,questionHeight:a.height,
      focused:document.activeElement===card,
      outline:getComputedStyle(card).outlineStyle,
      focusVisible:card.matches(":focus-visible"),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      offenders:[...document.querySelectorAll(".b27-shell *")].filter(el=>{
       const r=el.getBoundingClientRect();
       return r.width>0&&(r.right>document.documentElement.clientWidth+2||r.left< -2);
      }).slice(0,5).map(el=>({tag:el.tagName,className:String(el.className).slice(0,65),
       rect:Math.round(el.getBoundingClientRect().right)}))};
    });
    await capture(page,"09-"+width+"-"+reducedMotion+"-"+label,".b27-play");
    assert.ok(details.focused&&details.focusVisible,
     label+" keyboard focus not visible: "+JSON.stringify(details));
    assert.notEqual(details.outline,"none");
    assert.ok(details.gap>=7,
     label+" focus ring overlaps question: "+JSON.stringify(details));
    assert.ok(details.cardHeight>=44,
     label+" touch target below 44px: "+JSON.stringify(details));
    // The existing global dock may contribute page scrollWidth at 320px;
    // this CZ-155 fix owns only the Director text/card subtree. Its actual
    // bounding boxes must remain inside the mobile viewport.
    assert.deepEqual(details.offenders,[],
     label+" Director children extend outside viewport: "+JSON.stringify(details));
   };
   try{
    await page.clock.setFixedTime(new Date("2027-01-07T12:00:00Z"));
    await page.goto(base+"/?b27=1&cz155=1",{waitUntil:"domcontentloaded"});
    await page.getByRole("button",{name:"Get started"}).click();
    await page.getByRole("button",{name:"Skip",exact:true}).click();
    await page.locator("#yl-enter").press("End");
    await page.locator('[data-action="discover"]').click();
    await waitForDirector(page,"opening");
    await control(page,"begin").click();
    await page.locator('[data-b27="branch"][data-value="request"]').click();
    await waitForDirector(page,"reconsider");
    await check("before-refresh");
    await page.reload({waitUntil:"domcontentloaded"});
    await page.locator("#yl-enter").press("End");
    await page.locator('[data-action="discover"]').click();
    await waitForDirector(page,"reconsider");
    await check("after-resume");
   }finally{await context.close();}
  }
 }
});
