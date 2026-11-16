/** CZ-134 B2.3 — actual six source-connected research browser journeys.
 * Desktop Chrome emulated viewports. NOT physical iPhone, VoiceOver or a
 * genuine human first-time comprehension study.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB23ResearchServer}
 from "../experiments/yl-b23-research-server.mjs";
const routes=[320,390,430,1024];
const source=async(page,key)=>{
 await page.locator('[data-source="'+key+'"]').click();
};
const game=async(page,id)=>{
 await page.locator('[data-game="'+id+'"]').click();
 assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).game,id);
};
const result=async(page,expected)=>{
 assert.equal(await page.locator("#finish").isDisabled(),false,expected);
 await page.locator("#finish").click();
 await page.locator("#result").waitFor({state:"visible"});
 assert.equal(await page.locator(".result-section").count(),3,expected);
 assert.match(await page.locator("#result-status").innerText(),/words · A three-part reflection/);
 const body=await page.locator("#result-sections").innerText();
 assert.ok(body.includes("Back to the Philosopher"),expected);
 assert.ok(body.includes("One Last Thing"),expected);
 const status=await page.locator("#game-status").innerText();
 assert.match(status,/reflection is ready/);
};
const chooseK=async page=>{
 await page.locator('[data-start="change"]').click();
 await page.locator('[data-scene="risk"]').click();
 await page.locator('[data-response="continue"]').click();
};
test("actual source-connected six-peer browser passes source/choice/result flow at 4 viewports",async()=>{
 const server=await createB23ResearchServer();
 mkdirSync("qa-evidence",{recursive:true});
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of routes){
   const context=await browser.newContext({
    viewport:{width,height:850},
    hasTouch:width<=430,isMobile:width<=430,reducedMotion:"reduce"
   });
   const page=await context.newPage(),errors=[],external=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{
    if(!r.url().startsWith(server.url))external.push(r.url());
   });
   await page.goto(server.url+"/",{waitUntil:"networkidle"});
   assert.equal(await page.locator("#sources button").count(),4);
   assert.equal(await page.locator("#peers button").count(),6);
   assert.equal(await page.locator("#experience").isHidden(),true);
   assert.equal(await page.locator("#result").isHidden(),true);

   // Source-bound finite eight-hour *balancing*, unlike the original B0 0..6 beam.
   await source(page,"thoreau_balance");await game(page,"balance_of_values");
   assert.equal(await page.locator("#hours-slider").getAttribute("max"),"8");
   assert.equal(await page.locator("#finish").isDisabled(),true);
   await page.locator("#hours-slider").evaluate(e=>{
    e.value="6";e.dispatchEvent(new Event("input",{bubbles:true}));
   });
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.leftSlots,6);
   await result(page,"balance_of_values");
   assert.match(await page.locator("#result-status").innerText(),/v2.0-compatible source-verified composition/);
   if(width===390)await page.screenshot({path:"qa-evidence/b23-value-balance-connected-390.png",fullPage:true});
   // Revising previous choice does not forge account completion.
   await page.locator("#revise").click();
   assert.equal(await page.locator("#result").isHidden(),true);
   await page.locator("#undo").click();
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.leftSlots,4);

   // Future Reveal asks the reader to VIEW external authored fiction, then make second choice.
   await source(page,"kierkegaard_future");await game(page,"future_reveal");
   assert.equal(await page.locator("#finish").isDisabled(),true);
   await page.locator('[data-start="change"]').click();
   assert.equal(await page.locator("#timeline-scrub").getAttribute("max"),"1");
   await page.locator('[data-scene="risk"]').click();
   assert.equal(await page.locator("#timeline-scrub").getAttribute("max"),"2");
   assert.match(await page.locator(".authored").last().innerText(),/AUTHOR-WRITTEN FICTION|Authored possibility/);
   await page.locator('[data-response="continue"]').click();
   await result(page,"future_reveal");
   assert.match(await page.locator("#result-status").innerText(),/frozen v2.0 expression/);
   if(width===390)await page.screenshot({path:"qa-evidence/b23-future-reveal-connected-390.png",fullPage:true});
   // Changing initial decision clears downstream source events.
   await page.locator("#revise").click();
   await page.getByRole("button",{name:"Change first decision"}).click();
   const after=await page.evaluate(()=>window.__YL_B23_QA.getState());
   assert.equal(after.st.scene,null);assert.equal(after.st.response,null);

   // Original FOUR games execute in same six peer selection, not a second menu.
   await source(page,"dillard");await game(page,"trade_off");
   assert.equal(await page.locator("#game-controls input[type=range]").count(),3);
   await page.locator("#game-controls input[type=range]").first().evaluate(e=>{
    e.value="4";e.dispatchEvent(new Event("change",{bubbles:true}));
   });
   await result(page,"trade_off");
   await game(page,"token_studio");
   assert.equal(await page.locator('[data-token]').count(),6);
   await page.locator('[data-token="0"]').click();
   await result(page,"token_studio");
   await source(page,"kierkegaard_map");await game(page,"decision_map");
   await chooseK(page);await result(page,"decision_map");
   await game(page,"swipe_decision");
   assert.equal(await page.locator("[data-swipe-surface]").count(),1);
   if(width<=430){
    await page.locator("[data-swipe-surface]").evaluate(e=>{
     const mk=x=>new Touch({identifier:1,target:e,clientX:x,clientY:100});
     e.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,
      changedTouches:[mk(240)],touches:[mk(240)]}));
     e.dispatchEvent(new TouchEvent("touchend",{bubbles:true,
      changedTouches:[mk(30)],touches:[]}));
    });
    assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.start,"change");
   }else await page.locator('[data-start="change"]').click();
   await page.locator('[data-scene="risk"]').click();
   assert.equal(await page.locator("[data-swipe-surface]").count(),1);
   await page.locator("[data-swipe-surface]").focus();
   await page.keyboard.press("ArrowLeft");
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.response,"continue");
   await result(page,"swipe_decision");

   const unacceptable=await page.evaluate(async()=>{
    const r=await fetch("/api/run",{method:"POST",
     headers:{"content-type":"application/json"},
     body:JSON.stringify({recordKey:"dillard",gameId:"future_reveal",
      input:{actions:[{type:"choose_start",optionId:"change"}]}})});
    return {status:r.status,payload:await r.json()};
   });
   assert.equal(unacceptable.status,422);
   assert.equal(unacceptable.payload.status,"blocked");
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>
     document.documentElement.clientWidth+1),false);
   const small=await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>
    xs.filter(x=>!x.disabled).filter(x=>{
     const b=x.getBoundingClientRect();return b.width<44||b.height<44;
    }).length);
   assert.equal(small,0,"Every active control minimum 44px");
   assert.deepEqual(errors,[]);
   assert.deepEqual(external,[]);
   console.log("B23_SIX_BROWSER "+JSON.stringify({width,readyJourneys:6,
    publicAllowed:false,physicalDevice:false,externalRequests:0,errors:0}));
   await context.close();
  }
 }finally{await browser.close();await server.close();}
});
