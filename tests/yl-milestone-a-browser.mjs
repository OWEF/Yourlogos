/** Actual Chromium checks at phone sizes; NOT physical Safari/VoiceOver (CZ-126). */
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {createMilestoneAServer} from "../experiments/yl-milestone-a-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const app=await createMilestoneAServer();
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const folder=new URL("../artifacts/cz128/milestone-a/",import.meta.url);
mkdirSync(folder,{recursive:true});
async function state(page){return page.evaluate(()=>window.__YL_CZ128_MILESTONE_A.getState());}
async function select(page,id,game){
 await page.locator("#source").selectOption(id);
 await page.locator("#preferred").selectOption(game);
 await page.waitForFunction(g=>window.__YL_CZ128_MILESTONE_A?.getState().selectedGameId===g,game);
}
async function ready(page){
 await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().resultStatus==="ready");
 assert.equal(await page.locator("#section-title").textContent(),"Your Choice.");
 assert.equal((await state(page)).wordCount>=80,true);
 assert.equal((await state(page)).wordCount<=120,true);
 await page.locator("#result-next").click();
 assert.equal(await page.locator("#section-title").textContent(),"Back to the Philosopher.");
 await page.locator("#result-next").click();
 assert.equal(await page.locator("#section-title").textContent(),"One Last Thing.");
 assert.equal(await page.locator("#result-next").isDisabled(),true);
 assert.equal(await page.locator("#save-notice").isVisible(),true);
}
try{
 for(const width of [320,390,430,1024]){
  const page=await browser.newPage({
   viewport:{width,height:850},isMobile:width<=430,hasTouch:width<=430,
   reducedMotion:"reduce"
  });
  const errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",req=>{
   if(/^https?:/.test(req.url())&&!req.url().startsWith(app.url))external.push(req.url());
  });
  await page.goto(app.url);
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().recordId);
  await page.locator("#qa-controls summary").click(); // research preference is intentionally behind a disclosure
  const expected=["trade_off","decision_map","token_studio","swipe_decision"];
  assert.equal(await page.locator("#trace .trace-item").count(),6);
  for(const game of expected){
   const source=game==="trade_off"||game==="token_studio"?DILLARD_V21:KIERKEGAARD_V21;
   await select(page,source.id,game);
   assert.equal((await state(page)).selectedGameId,game);
   assert.equal(await page.locator("#start").isEnabled(),true);
   await page.locator("#start").click();
   assert.equal(await page.locator("#play").isVisible(),true);
   if(game==="trade_off"){
    for(const [i,n] of [[0,3],[1,1],[2,2]]){
     for(let j=0;j<n;j++)await page.locator(".distribution .activity").nth(i).locator("button").nth(1).click();
    }
    assert.equal(await page.locator("#play-next").isEnabled(),true);
   }else if(game==="token_studio"){
    // Regression: initial tokens must be UNASSIGNED, not silently counted as Writing.
    assert.equal(await page.locator("#play-next").isDisabled(),true,
     "Do not allow a philosophical result before the reader makes an allocation.");
    assert.equal(await page.locator(".slot").count(),6);
    assert.equal(await page.locator(".slot").filter({hasText:"Unassigned"}).count(),6);
    assert.equal(await page.locator(".slot").filter({hasText:"30 min"}).count(),6);
    assert.equal((await state(page)).canonicalChoice,null);
    const labels=page.locator(".tokens-legend button");
    await labels.nth(1).click(); // Answering messages chosen as explicit destination
    await page.locator(".slot").nth(0).click();
    await page.locator(".slot").nth(1).click();
    assert.equal(await page.locator("#play-next").isDisabled(),true);
    assert.equal((await state(page)).allocationPreview[1],2);
    await page.locator("#undo").click();
    assert.equal((await state(page)).allocationPreview[1],1);
    await page.locator(".slot").nth(1).click();
    await labels.nth(0).click();
    for(let i=2;i<6;i++)await page.locator(".slot").nth(i).click();
    assert.equal(await page.locator("#play-next").isEnabled(),true);
    assert.deepEqual((await state(page)).canonicalChoice.amounts,[4,2,0]);
    // Removing one allocation invalidates the result until the budget is complete.
    await page.locator(".distribution .activity").nth(0).locator("button").nth(0).click();
    assert.equal(await page.locator("#play-next").isDisabled(),true);
    await page.locator("#undo").click();
    assert.equal(await page.locator("#play-next").isEnabled(),true);
   }else{
    for(let stage=0;stage<3;stage++){
     const before=(await state(page)).gameStage;
     if(game==="swipe_decision"){
      assert.equal(await page.locator(".question-square").isVisible(),true);
      assert.equal(await page.locator(".option-pair .option-card").count(),2);
      await page.locator(".option-pair .option-card").nth(stage===1?1:0).click();
     }else{
      assert.equal(await page.locator(".branch-choices .option-card").count(),2);
      await page.locator(".branch-choices .option-card").nth(stage===1?1:0).click();
     }
     assert.equal((await state(page)).gameStage,before+1);
    }
    assert.equal(await page.locator("#play-next").isEnabled(),true);
    if(game==="decision_map"){
     await page.locator(".map-node").first().click();
     assert.equal((await state(page)).gameStage,0,"Revising first action invalidates downstream state.");
     for(let stage=0;stage<3;stage++)
      await page.locator(".branch-choices .option-card").nth(stage===1?1:0).click();
    }
   }
   await page.locator("#play-next").click();
   await ready(page);
   assert.equal((await state(page)).publicationAllowed,false);
   if(width===390){
    await page.screenshot({path:new URL(game+"-390.png",folder).pathname,fullPage:true});
   }
   await page.locator("#result-back").click();
   assert.equal(await page.locator("#section-title").textContent(),"Back to the Philosopher.");
   await page.locator("#result-back").click();
   await page.locator("#result-back").click();
   assert.equal(await page.locator("#play").isVisible(),true);
   // Returning to source selection must unwind dependent hypothetical steps.
   for(let back=0;back<5&&(await state(page)).view!=="intro";back++)
    await page.locator("#play-back").click();
   assert.equal((await state(page)).view,"intro");
  }
  await page.locator("#source").selectOption(HEGEL_NO_FIT_V21.id);
  await page.locator("#preferred").selectOption("");
  await page.waitForFunction(()=>window.__YL_CZ128_MILESTONE_A?.getState().selectedGameId===null);
  assert.equal(await page.locator("#start").isDisabled(),true);
  assert.equal(await page.locator("#refusal").isVisible(),true);
  assert.equal(await page.locator("#refusal").textContent()!==null,true);
  const overflow=await page.evaluate(()=>
   document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  assert.equal(overflow,false,"No horizontal clipping at "+width);
  const tiny=await page.locator("button:visible").evaluateAll(btns=>
   btns.filter(b=>!b.disabled).map(b=>({text:b.textContent,rect:b.getBoundingClientRect()}))
    .filter(x=>x.rect.width<44||x.rect.height<44));
  assert.deepEqual(tiny,[],"Touch targets below 44 px: "+JSON.stringify(tiny));
  assert.deepEqual(errors,[],"No JS errors at "+width);
  assert.deepEqual(external,[],"No external network at "+width);
  console.log("CZ-128 MILESTONE A "+JSON.stringify({width,
   games:expected,sourceNoFit:true,overflow:false,touchTarget:true,errors,external}));
  await page.close();
 }
}finally{await browser.close();await app.close();}