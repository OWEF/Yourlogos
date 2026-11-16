import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chromium} from "playwright-core";
const root=new URL("../",import.meta.url);
const load=path=>readFileSync(new URL(path,root),"utf8");
const url=new URL("experiments/yl-milestone-b-lab.html",root).href;

test("B0 cannot masquerade as approved philosophical mini-games",()=>{
 const cap=load("philosophy-engine/content/content-capabilities-v211.js"),
       js=load("experiments/yl-milestone-b-lab.js"),
       html=load("experiments/yl-milestone-b-lab.html");
 assert.match(cap,/balance_of_values:false/);
 assert.match(cap,/future_reveal:false/);
 assert.match(js,/sourceEligible:false/);
 assert.match(js,/selectionAllowed:false/);
 assert.match(js,/publicationAllowed:false/);
 assert.match(js,/persistenceEnabled:false/);
 assert.match(html,/SYNTHETIC UI|FICTIONAL DESIGN EXAMPLE|SOURCE ELIGIBILITY BLOCKED/i);
 assert.doesNotMatch(js,/(?:fetch\s*\(|localStorage|indexedDB|sendBeacon|navigator\.sendBeacon)/);
 assert.doesNotMatch(html,/<script[^>]+src=["']https?:/i);
});

test("B0 accessible balance direction, locked stages, no false My World success",async()=>{
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,1024]){
   const page=await browser.newPage({viewport:{width,height:850},isMobile:width<=390,
    hasTouch:width<=390,reducedMotion:"reduce"});
   const errors=[],external=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",req=>{if(/^https?:/.test(req.url()))external.push(req.url());});
   await page.goto(url);
   const get=()=>page.evaluate(()=>window.__YL_B_LAB_QA.getState());
   assert.equal((await get()).balanceTouched,false);
   assert.equal(await page.locator("#continue").isDisabled(),true);
   await page.getByRole("button",{name:"Move toward Clarity"}).click();
   assert.equal((await get()).balance,4,"Left arrow must move toward left label.");
   await page.getByRole("button",{name:"Move toward Experimentation"}).click();
   assert.equal((await get()).balance,3,"Right arrow must move toward right label.");
   assert.equal((await get()).balanceTouched,true);
   await page.locator("#mode-future").click();
   assert.equal(await page.locator("#continue").isDisabled(),true);
   await page.getByRole("button",{name:/Explore fictional decision: Join the project/}).click();
   assert.equal((await get()).maxSeen,0);
   // Maliciously jump over locked scene; UI must reject before progressing.
   await page.locator("#future-slider").evaluate(el=>{
    el.max="3";el.value="3";el.dispatchEvent(new Event("change",{bubbles:true}));
   });
   assert.equal((await get()).step,0);
   assert.equal((await get()).maxSeen,0);
   assert.equal(await page.locator("#continue").isDisabled(),true);
   for(let i=1;i<=3;i++){
    await page.getByRole("button",{name:"Reveal next authored hypothetical stage"}).click();
    assert.equal((await get()).step,i);
   }
   assert.equal(await page.locator("#continue").isEnabled(),true);
   await page.getByRole("button",{name:"View earlier fictional stage"}).click();
   assert.equal((await get()).route,"join");
   assert.equal((await get()).step,2);
   assert.equal(await page.locator("#continue").isDisabled(),true);
   await page.getByRole("button",{name:"Reveal next authored hypothetical stage"}).click();
   await page.locator("#continue").click();
   assert.equal((await get()).finished,true);
   assert.match(await page.locator("#preview-complete").innerText(),/nothing was saved|nothing was saved/i);
   assert.equal((await page.evaluate(()=>window.__YL_B_LAB_QA.capabilities)).persistenceEnabled,false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),true);
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   console.log("CZ123-B0 "+JSON.stringify({width,sourceAdmitted:false,
    lockedFutureSkipped:false,directionsCorrect:true,externalCalls:0,errors:0}));
   await page.close();
  }
 }finally{await browser.close();}
});