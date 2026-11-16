/**
 * CZ-123 B2.5 independent mobile/consumer acceptance at exact developer SHA.
 * Chromium responsive is NOT physical iPhone/VoiceOver or five real readers.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB25PreviewServer} from "../experiments/yl-b25-encounter-server.mjs";
mkdirSync("qa-evidence",{recursive:true});
const getState=page=>page.evaluate(()=>window.__YL_B25_QA.getState());
const total=s=>s.trim().split(/\s+/).filter(Boolean).length;
async function pick(page,key,game){
 const before=await page.locator("#experience").isHidden();
 await page.locator('[data-source="'+key+'"]').click();
 await page.locator("#experience").waitFor({state:"visible"});
 assert.equal((await getState(page)).game,game);
 assert.equal(await page.locator("#peer-section").isHidden(),true);
 assert.equal(await page.locator("#peers button").count(),0);
 return before;
}
async function result(page,expectedGame){
 const r=page.waitForResponse(x=>x.url().endsWith("/api/run")&&x.request().method()==="POST");
 await page.locator("#finish").click();
 const data=await(await r).json();
 await page.locator("#result").waitFor({state:"visible"});
 assert.equal(data.status,"ready",JSON.stringify(data).slice(0,450));
 assert.equal(data.selected_game_id,expectedGame);
 assert.deepEqual(data.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=data.sections.map(x=>total(x.text)),sum=counts.reduce((a,b)=>a+b,0);
 assert.equal(sum,data.wordCount);
 assert.ok(sum>=80&&sum<=120);
 assert.ok(counts.every((n,i)=>n>=[10,18,9][i]&&n<=[48,65,26][i]));
 assert.equal(await page.locator(".result-section").count(),3);
 assert.equal(await page.locator(".teaching-core .core-insight").count(),1);
 assert.equal(await page.locator(".teaching-core").innerText(),data.sections[1].text);
 assert.equal(await page.locator(".thinker-avatar svg.yl-thinker-pixel").count(),1);
 assert.equal(data.publicationAllowed,false);
 assert.equal(data.accountSaved,false);
 assert.doesNotMatch(await page.locator("#result-status").innerText(),/source verified|scholarly pass/i);
 return data;
}
test("R3 first-click consumer Play, source-grounded learning, compact two-variant mobile journey at four viewports",async()=>{
 const server=await createB25PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({viewport:{width,height:890},
    isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],outside=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(!r.url().startsWith(server.url))outside.push(r.url());});
   await page.goto(server.url+"/",{waitUntil:"networkidle"});
   assert.equal(await page.locator("#sources button").count(),6);
   assert.equal(await page.locator("#peer-section").isHidden(),true);
   assert.equal(await page.locator("#game-controls").isHidden(),true);
   assert.equal((await getState(page)).qaMode,false);
   if(width===390)await page.screenshot({path:"qa-evidence/b25-independent-start-390.png",fullPage:true});
   assert.equal(await pick(page,"thoreau_weekend","balance_of_values"),true);
   assert.equal(await page.locator("#hours-slider").getAttribute("max"),"12");
   assert.equal(await page.locator("#finish").isDisabled(),true);
   await page.locator("#hours-slider").evaluate(input=>{
    input.value="11";input.dispatchEvent(new Event("input",{bubbles:true}));
   });
   await page.locator('[data-focus="openness"]').click();
   const weekend=await result(page,"balance_of_values");
   assert.deepEqual(weekend.canonical_choice.amounts,[11,1]);
   assert.equal(weekend.expressionVersion,"evidence-bound-expression/2.5.0");
   assert.equal(weekend.meaningKind,"conversion");
   assert.match(await page.locator(".teaching-core").innerText(),/life exchanged|Thoreau/i);
   assert.equal(await page.locator(".teaching-identity strong").innerText(),"Henry David Thoreau");
   assert.equal(await page.locator(".source-excerpt mark").count(),1);
   if(width===390)await page.screenshot({path:"qa-evidence/b25-independent-thoreau-390.png",fullPage:true});
   await page.locator("#revise").click();
   await page.locator('[data-focus="exchange"]').click();
   const revised=await result(page,"balance_of_values");
   assert.deepEqual(revised.canonical_choice,weekend.canonical_choice);
   assert.notEqual(revised.sections[1].text,weekend.sections[1].text);
   await pick(page,"dillard_pattern","balance_of_values");
   assert.equal(await page.locator("#hours-slider").getAttribute("max"),"10");
   await page.getByRole("button",{name:"− One unit"}).click();
   await page.locator('[data-focus="repeated_pattern"]').click();
   const dillard=await result(page,"balance_of_values");
   assert.deepEqual(dillard.canonical_choice.amounts,[4,6]);
   assert.equal(dillard.canonical_choice.repetitions,4);
   assert.equal(dillard.meaningKind,"repetition");
   assert.equal(await page.locator(".teaching-identity strong").innerText(),"Annie Dillard");
   assert.match(await page.locator(".teaching-core").innerText(),/Across 4 imagined evenings/);
   assert.doesNotMatch(await page.locator(".teaching-core").innerText(),/Thoreau|pay rate/i);
   const sourceLink=page.locator(".source-depth a");
   assert.ok((await sourceLink.getAttribute("href")).startsWith("https://"));
   await page.locator(".source-depth summary").focus();
   await page.keyboard.press("Enter");
   assert.notEqual(await page.locator(".source-depth").getAttribute("open"),null);
   assert.match(await page.locator(".source-caveat").innerText(),/provisional/i);
   if(width===390)await page.screenshot({path:"qa-evidence/b25-independent-dillard-390.png",fullPage:true});
   await pick(page,"kierkegaard_future","future_reveal");
   await page.locator('[data-start="stay"]').click();
   await page.locator('[data-scene="surprise"]').click();
   await page.locator('[data-response="continue"]').click();
   const future=await result(page,"future_reveal");
   assert.equal(future.provenance.authoredEventCausedByReader,false);
   assert.equal(future.provenance.unchosenFutureKnown,false);
   const bad=await page.evaluate(async()=>{
    const r=await fetch("/api/run",{method:"POST",headers:{"content-type":"application/json"},
     body:JSON.stringify({recordKey:"dillard",gameId:"token_studio",qaMode:false,
      input:{amounts:[2,2,2],repetitions:5}})});
    return {status:r.status,data:await r.json()};
   });
   assert.equal(bad.status,422);
   assert.equal(bad.data.code,"qa_only_manual_selection");
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>
    document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false);
   const undersize=await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>
    xs.filter(x=>!x.disabled).filter(x=>{
     const r=x.getBoundingClientRect();return r.width<44||r.height<44;
    }).length);
   assert.equal(undersize,0);
   assert.deepEqual(errors,[]);
   assert.deepEqual(outside,[]);
   console.log("CZ123_B25_CONSUMER "+JSON.stringify({width,oneClickToPlay:true,
    authorNeutralSourceBridge:true,qaOnlyManual:true,coreInsightVisible:true,
    physicalSafariVerified:false,realFirstTimeReaders:0,errors:0,outsideRequests:0}));
   await context.close();
  }
 }finally{await browser.close();await server.close();}
});
test("QA mode remains a distinct inspection surface with all six source-eligible protected peers",async()=>{
 const app=await createB25PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:840}});
  await page.goto(app.url+"/?qa=1",{waitUntil:"networkidle"});
  assert.equal((await getState(page)).qaMode,true);
  assert.equal(await page.locator("#peer-section").isHidden(),false);
  await page.locator('[data-source="dillard"]').click();
  assert.equal(await page.locator("#peers button").count(),6);
  assert.equal(await page.locator('[data-game="balance_of_values"]').isDisabled(),true);
  assert.equal(await page.locator('[data-game="token_studio"]').isDisabled(),false);
  await page.locator('[data-game="token_studio"]').click();
  await page.locator('[data-token="0"]').click();
  await result(page,"token_studio");
  await page.locator('[data-source="kierkegaard_map"]').click();
  await page.locator('[data-game="swipe_decision"]').click();
  assert.equal(await page.locator('[data-swipe-surface]').count(),1);
  await page.locator('[data-swipe-surface]').focus();
  await page.keyboard.press("ArrowLeft");
  await page.locator('[data-scene="risk"]').click();
  await page.locator('[data-response="continue"]').click();
  await result(page,"swipe_decision");
  await page.locator('[data-source="thoreau_balance"]').click();
  assert.equal(await page.locator('[data-game="balance_of_values"]').isDisabled(),false);
  assert.equal(await page.locator('[data-game="decision_map"]').isDisabled(),true);
 }finally{await browser.close();await app.close();}
});
