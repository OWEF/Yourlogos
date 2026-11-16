/**
 * CZ-144 QA-only four-family responsive/gesture evidence.
 * Exact developer SHA e9d876b400a8bbf0d0363affffbb1993654060a5.
 * Emulated Chrome, NOT actual iPhone Safari/VoiceOver or human reader study.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB26PreviewServer}
 from "../experiments/yl-b26-preview-server.mjs";
mkdirSync("qa-evidence",{recursive:true});
const st=page=>page.evaluate(()=>window.__YL_B26_QA.getState());
const wc=x=>x.trim().split(/\s+/).filter(Boolean).length;
async function pick(page,key,family){
 await page.locator('[data-source="'+key+'"]').click();
 await page.locator("#play-screen").waitFor({state:"visible"});
 assert.equal((await st(page)).family,family);
 assert.equal((await st(page)).stage,"play");
 assert.equal(await page.locator("#qa-panel").isHidden(),true);
}
async function result(page,family){
 const wait=page.waitForResponse(r=>r.url().endsWith("/api/run")&&
  r.request().method()==="POST");
 await page.locator("#discover").click();
 const data=await(await wait).json();
 assert.equal(data.status,"ready",JSON.stringify(data).slice(0,400));
 await page.locator("#discover-screen").waitFor({state:"visible"});
 assert.equal(data.selectedFamilyId,family);
 assert.deepEqual(data.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=data.sections.map(x=>wc(x.text)),total=counts.reduce((a,b)=>a+b,0);
 assert.equal(total,data.wordCount);
 assert.ok(total>=80&&total<=120,JSON.stringify(counts));
 assert.ok(counts.every((x,i)=>x>=[10,18,9][i]&&x<=[48,65,26][i]));
 assert.equal(await page.locator(".result-section").count(),3);
 assert.equal(await page.locator(".result-section.educational").count(),1);
 assert.equal(await page.locator(".teaching-core").evaluate(x=>x.textContent),
  data.sections[1].text);
 assert.equal(await page.locator(".source-quote mark").count(),1);
 assert.ok((await page.locator(".thinker-identity strong").innerText()).length>3);
 assert.equal(data.publicationAllowed,false);
 assert.equal(data.accountSaved,false);
 return data;
}
const home=page=>page.locator("#another").click();
test("Independent visual and interactive mobile acceptance for 4 real tactile families at 320/390/430/1024",async()=>{
 const server=await createB26PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({viewport:{width,height:900},
    isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],outside=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",req=>{
    if(!req.url().startsWith(server.url))outside.push(req.url());
   });
   await page.goto(server.url+"/",{waitUntil:"networkidle"});
   assert.equal(await page.locator(".question-card:enabled").count(),8);
   assert.equal(await page.locator("#qa-panel").isHidden(),true);
   assert.deepEqual((await st(page)).gameFamilies,
    ["balance_move","decision_cards","tap_pair","flip_reveal"]);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-qa-choose-390.png",fullPage:true});

   // R3A Balance: exact budget across 3 real buckets, drag/tap share state.
   await pick(page,"dillard","balance_move");
   assert.equal(await page.locator(".bucket").count(),3);
   assert.equal(await page.locator(".resource-piece").count(),6);
   const initial=(await st(page)).state.amounts;
   await page.locator(".resource-piece").first().focus();
   await page.keyboard.press("Enter");
   assert.notDeepEqual((await st(page)).state.amounts,initial);
   await page.locator("#undo").click();
   assert.deepEqual((await st(page)).state.amounts,initial);
   await page.locator("#resource-slider").evaluate(x=>{
    x.value="4";x.dispatchEvent(new Event("change",{bubbles:true}));
   });
   assert.equal((await st(page)).state.amounts[0],4);
   assert.equal((await st(page)).state.amounts.reduce((a,b)=>a+b,0),6);
   const dillard=await result(page,"balance_move");
   assert.deepEqual(dillard.canonical_choice.amounts,(await st(page)).state.amounts);
   assert.equal(dillard.canonical_choice.repetitions,5);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-qa-balance-390.png",fullPage:true});
   await home(page);

   // R3B Decision: tap-only stages, reversible branch, no logic puzzle.
   await pick(page,"kierkegaard_map","decision_cards");
   await page.locator('[data-choice="stay"]').focus();
   await page.keyboard.press("Enter");
   assert.equal((await st(page)).state.start,"stay");
   await page.locator('[data-choice="missed"]').click();
   await page.locator("#undo").click();
   assert.equal((await st(page)).state.scene,null);
   await page.locator('[data-choice="surprise"]').click();
   await page.locator('[data-choice="continue"]').click();
   const decision=await result(page,"decision_cards");
   assert.deepEqual(decision.canonical_choice.path,["stay","surprise","continue"]);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-qa-decision-390.png",fullPage:true});
   await home(page);

   // R3C Pair: unseen Smith source family with real graph relation and SVG connection.
   await pick(page,"smith_relations","tap_pair");
   assert.equal(await page.locator(".pair-card").count(),4);
   const first=page.locator('[data-card="division"]');
   await first.focus();await page.keyboard.press("Enter");
   await page.locator('[data-card="booklet"]').click();
   assert.equal((await st(page)).state.pairs.length,0,
    "An unadmitted pairing cannot become source-truth");
   assert.match(await page.locator("#feedback").innerText(),/No source-authored link/);
   await page.locator('[data-card="pages"]').click();
   await page.locator('[data-card="binding"]').click();
   assert.equal((await st(page)).state.pairs.length,1);
   await page.waitForFunction(()=>document.querySelectorAll(".relation-lines line").length===1);
   await page.locator("#undo").click();
   assert.equal((await st(page)).state.pairs.length,0);
   assert.equal((await st(page)).state.first,"pages",
    "Undo restores the selected first card, not an invented cleared state");
   await page.locator('[data-card="pages"]').click();
   assert.equal((await st(page)).state.first,null);
   await page.locator('[data-card="pages"]').click();
   await page.locator('[data-card="binding"]').click();
   const related=await result(page,"tap_pair");
   assert.equal(related.meaningKind,"source_warranted_relation");
   assert.match(related.sections[1].text,/Smith/);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-qa-pair-390.png",fullPage:true});
   await home(page);

   // R3D Flip: known authored possibility with ONE user decision before and after,
   // and no knowledge/causation attributed to unflipped alternative.
   await pick(page,"kierkegaard_future","flip_reveal");
   await page.locator('[data-choice="change"]').click();
   assert.equal(await page.locator(".flip-card").count(),2);
   await page.locator('[data-flip="risk"]').focus();
   await page.keyboard.press("Enter");
   assert.equal(await page.locator(".flip-card.flipped").count(),1);
   assert.equal(await page.locator(".flip-card:not(.flipped)").count(),1);
   const unopened=await page.locator(".flip-card:not(.flipped) .flip-back").innerText();
   assert.match(unopened,/Only the chosen fiction may be read/);
   await page.locator('[data-choice="continue"]').click();
   const flip=await result(page,"flip_reveal");
   assert.equal(flip.provenance.authoredEventCausedByReader,false);
   assert.equal(flip.provenance.unchosenFutureKnown,false);
   assert.deepEqual(flip.canonical_choice.path,["change","risk","continue"]);
   if(width===390)await page.screenshot({path:"qa-evidence/b26-qa-flip-390.png",fullPage:true});
   await page.locator("#back-to-play").click();
   await page.locator("#reset").click();
   assert.equal((await st(page)).state.start,null);
   assert.equal(await page.locator("#discover").isDisabled(),true);

   // Accessibility and non-persistence boundaries, simulated Chrome only.
   assert.equal(await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches),true);
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>
    document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false);
   const small=await page.locator("button:visible,input[type=range]:visible,summary:visible")
    .evaluateAll(xs=>xs.filter(x=>!x.disabled).filter(x=>{
     const r=x.getBoundingClientRect();return r.width<44||r.height<44;
    }).length);
   assert.equal(small,0,"Every active control has at least 44px tap target");
   assert.deepEqual(errors,[]);
   assert.deepEqual(outside,[]);
   console.log("CZ144_B26_FOUR "+JSON.stringify({width,
    allFourRealJourneys:true,sourceLinked:true,keyboard:true,
    reducedMotion:true,actualIphoneSafari:false,actualVoiceOver:false,
    readersFive:false,externalRequests:0,javascriptErrors:0}));
   await context.close();
  }
 }finally{await browser.close();await server.close();}
});
test("Explicit local QA mode: only source-authorized families, Hegel no_fit and server refusal of forced choice",async()=>{
 const app=await createB26PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:850}});
  await page.goto(app.url+"/?qa=1",{waitUntil:"networkidle"});
  assert.equal(await page.locator('#questions button').count(),9);
  assert.equal(await page.locator('[data-source="hegel_no_fit"]').isDisabled(),true);
  await page.locator('[data-source="epictetus_relations"]').click();
  assert.equal(await page.locator('#qa-panel').isHidden(),false);
  assert.equal(await page.locator('#qa-families button').count(),4);
  assert.equal(await page.locator('#qa-families [data-family="tap_pair"]').isDisabled(),false);
  assert.equal(await page.locator('#qa-families [data-family="balance_move"]').isDisabled(),true);
  const request=await page.evaluate(async()=>{
   const r=await fetch("/api/run",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({recordKey:"epictetus_relations",familyId:"balance_move",
     input:{amounts:[2,2],budgets:[4],touched:true}})});
   return {status:r.status,data:await r.json()};
  });
  assert.equal(request.status,422);
  assert.equal(request.data.code,"manual_qa_only");
  await page.locator('#qa-families [data-family="tap_pair"]').click();
  await page.locator('[data-card="words"]').click();
  await page.locator('[data-card="reaction"]').click();
  const wait=page.waitForResponse(r=>r.url().includes("/api/run/qa")&&r.request().method()==="POST");
  await page.locator("#discover").click();
  assert.equal((await(await wait).json()).status,"ready");
 }finally{await browser.close();await app.close();}
});
