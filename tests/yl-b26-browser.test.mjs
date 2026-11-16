import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB26PreviewServer}
 from "../experiments/yl-b26-preview-server.mjs";
mkdirSync("qa-evidence",{recursive:true});
const state=page=>page.evaluate(()=>window.__YL_B26_QA.getState());
const count=x=>x.trim().split(/\s+/).filter(Boolean).length;
async function source(page,key,family){
 await page.locator('[data-source="'+key+'"]').click();
 await page.locator("#play-screen").waitFor({state:"visible"});
 const current=await state(page);
 assert.equal(current.family,family,key);
 assert.equal(current.stage,"play");
 return current;
}
async function discover(page,family){
 const data=page.waitForResponse(r=>
  r.url().includes("/api/run")&&r.request().method()==="POST");
 assert.equal(await page.locator("#discover").isDisabled(),false);
 await page.locator("#discover").click();
 const payload=await(await data).json();
 assert.equal(payload.status,"ready",JSON.stringify(payload).slice(0,450));
 assert.equal(payload.selectedFamilyId,family);
 await page.locator("#discover-screen").waitFor({state:"visible"});
 assert.equal(await page.locator(".result-section").count(),3);
 assert.equal(await page.locator(".result-section.educational").count(),1);
 const n=payload.sections.map(s=>count(s.text));
 assert.equal(n.reduce((a,b)=>a+b,0),payload.wordCount);
 assert.ok(payload.wordCount>=80&&payload.wordCount<=120);
 for(let i=0;i<3;i++)assert.ok(n[i]>=[10,18,9][i]&&n[i]<=[48,65,26][i]);
 assert.equal(await page.locator(".thinker-identity strong").count(),1);
 assert.equal(await page.locator(".source-quote mark").count(),1);
 assert.equal(await page.locator(".teaching-core").evaluate(el=>el.textContent),payload.sections[1].text);
 assert.equal(payload.accountSaved,false);
 assert.equal(payload.publicationAllowed,false);
 return payload;
}
async function goHome(page){
 await page.locator("#another").click();
 await page.locator("#choose-screen").waitFor({state:"visible"});
}
test("All FOUR are working sources→tactile choice→Reasoning/Emotion/Expression at 4 responsive widths",async()=>{
 const app=await createB26PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({viewport:{width,height:860},
    isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],foreign=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(!r.url().startsWith(app.url))foreign.push(r.url());});
   await page.goto(app.url+"/",{waitUntil:"networkidle"});
   assert.equal(await page.locator("#questions button:enabled").count(),8);
   assert.equal(await page.locator("#qa-panel").isHidden(),true);
   assert.equal((await state(page)).gameFamilies.length,4);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-choose-390.png",fullPage:true});

   // Balance & Move: same resource state powers slider, tangible pieces,
   // undo and validated resulting philosophical meaning.
   await source(page,"thoreau_weekend","balance_move");
   assert.equal(await page.locator(".resource-piece").count(),12);
   assert.equal(await page.locator("#resource-slider").getAttribute("max"),"12");
   assert.equal(await page.locator("#discover").isDisabled(),true);
   const initial=(await state(page)).state.amounts;
   const firstPiece=await page.locator(".resource-piece").first().getAttribute("data-piece");
   await page.locator('[data-piece="'+firstPiece+'"]').click();
   assert.notDeepEqual((await state(page)).state.amounts,initial);
   await page.locator("#undo").click();
   assert.deepEqual((await state(page)).state.amounts,initial);
   await page.locator("#resource-slider").evaluate(e=>{
    e.value="8";e.dispatchEvent(new Event("change",{bubbles:true}));
   });
   const afterSlider=(await state(page)).state;
   assert.equal(afterSlider.amounts[0],8);
   assert.equal(afterSlider.amounts.reduce((a,b)=>a+b,0),12);
   const bal=await discover(page,"balance_move");
   assert.deepEqual(bal.canonical_choice.amounts,afterSlider.amounts);
   assert.equal(bal.expressionVersion,"evidence-bound-expression/2.5.0");
   if(width===390)await page.screenshot({path:"qa-evidence/b26-balance-390.png",fullPage:true});
   await goHome(page);

   // Decision Cards: simple staged source-authored branch, tap only.
   await source(page,"kierkegaard_map","decision_cards");
   await page.locator('[data-choice="change"]').click();
   await page.locator('[data-choice="risk"]').click();
   await page.locator('[data-choice="continue"]').click();
   const dec=await discover(page,"decision_cards");
   assert.deepEqual(dec.canonical_choice.path,["change","risk","continue"]);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-decision-390.png",fullPage:true});
   await goHome(page);

   // Tap & Pair: genuine new source-warranted relational reasoning
   await source(page,"epictetus_relations","tap_pair");
   assert.equal(await page.locator(".pair-card").count(),4);
   assert.equal(await page.locator(".pair-art svg").count(),4);
   await page.locator('[data-card="apology"]').click();
   assert.equal((await state(page)).state.first,"apology");
   await page.locator('[data-card="forgiveness"]').click();
   assert.equal((await state(page)).state.pairs.length,1);
   await page.waitForFunction(()=>document.querySelectorAll(".relation-lines line").length===1);
   await page.locator("#undo").click();
   assert.equal((await state(page)).state.pairs.length,0);
   await page.locator('[data-card="words"]').click();
   await page.locator('[data-card="reaction"]').click();
   assert.equal((await state(page)).state.pairs.length,1);
   const linked=await discover(page,"tap_pair");
   assert.equal(linked.meaningKind,"source_warranted_relation");
   assert.equal(linked.canonical_choice.pairs[0].relationId,"agency_boundary");
   assert.match(linked.sections[1].text,/Epictetus/);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-tap-pair-390.png",fullPage:true});
   await goHome(page);
   await source(page,"smith_relations","tap_pair");
   await page.locator('[data-card="pages"]').click();
   await page.locator('[data-card="binding"]').click();
   const smith=await discover(page,"tap_pair");
   assert.match(smith.sections[1].text,/Smith/);
   assert.notEqual(linked.sections[1].text,smith.sections[1].text);
   await goHome(page);

   // Flip & Reveal: two face-down possibilities, one explored, one remains
   // unopened and unknown. The user chooses a later response separately.
   await source(page,"kierkegaard_future","flip_reveal");
   await page.locator('[data-choice="stay"]').click();
   assert.equal(await page.locator(".flip-card").count(),2);
   assert.equal(await page.locator(".flip-card.flipped").count(),0);
   await page.locator('[data-flip="surprise"]').click();
   assert.equal(await page.locator(".flip-card.flipped").count(),1);
   assert.equal(await page.locator(".flip-card:not(.flipped)").count(),1);
   await page.locator('[data-choice="continue"]').click();
   const flip=await discover(page,"flip_reveal");
   assert.deepEqual(flip.canonical_choice.path,["stay","surprise","continue"]);
   assert.equal(flip.provenance.authoredEventCausedByReader,false);
   assert.equal(flip.provenance.unchosenFutureKnown,false);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-flip-390.png",fullPage:true});

   assert.deepEqual(errors,[],"No browser errors");
   assert.deepEqual(foreign,[],"No external asset/API requests");
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>
    document.documentElement.clientWidth+1),false);
   const tiny=await page.locator("button:visible,input[type=range]:visible,summary:visible")
    .evaluateAll(xs=>xs.filter(x=>!x.disabled).filter(x=>{
      const rect=x.getBoundingClientRect();return rect.width<44||rect.height<44;
    }).length);
   assert.equal(tiny,0,"All available controls should be at least 44px");
   console.log("B26_FOUR_BROWSER "+JSON.stringify({width,
    families:4,sourceCases:5,qaOnlyManual:true,
    physicalSafari:false,realHumanReaders:0,externalRequests:0,errors:0}));
   await context.close();
  }
 }finally{await browser.close();await app.close();}
});
test("Explicit isolated QA exposes exactly four, honest no-fit and source-eligibility vetoes",async()=>{
 const app=await createB26PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:850}});
  await page.goto(app.url+"/?qa=1",{waitUntil:"networkidle"});
  assert.equal(await page.locator('#questions button').count(),9);
  assert.equal(await page.locator('[data-source="hegel_no_fit"]').isDisabled(),true);
  await page.locator('[data-source="smith_relations"]').click();
  assert.equal(await page.locator("#qa-panel").isHidden(),false);
  assert.equal(await page.locator("#qa-families button").count(),4);
  assert.equal(await page.locator('#qa-families [data-family="tap_pair"]').isDisabled(),false);
  assert.equal(await page.locator('#qa-families [data-family="balance_move"]').isDisabled(),true);
  await page.locator('#qa-families [data-family="tap_pair"]').click();
  await page.locator('[data-card="pages"]').click();
  await page.locator('[data-card="binding"]').click();
  await discover(page,"tap_pair");
  const invalid=await page.evaluate(async()=>{
   const r=await fetch("/api/run",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({recordKey:"kierkegaard_map",familyId:"flip_reveal",
     input:{actions:[]}})});
   return {status:r.status,data:await r.json()};
  });
  assert.equal(invalid.status,422);
  assert.equal(invalid.data.code,"manual_qa_only");
 }finally{await browser.close();await app.close();}
});
