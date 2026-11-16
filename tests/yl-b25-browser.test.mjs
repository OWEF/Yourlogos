import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB25PreviewServer} from "../experiments/yl-b25-encounter-server.mjs";
mkdirSync("qa-evidence",{recursive:true});
const wc=s=>s.trim().split(/\s+/).filter(Boolean).length;
async function openSource(page,key,expectedGame){
 await page.locator('[data-source="'+key+'"]').click();
 await page.locator("#experience").waitFor({state:"visible"});
 const state=await page.evaluate(()=>window.__YL_B25_QA.getState());
 assert.equal(state.game,expectedGame,JSON.stringify(state));
 return state;
}
async function reveal(page,game){
 const waiting=page.waitForResponse(r=>r.url().endsWith("/api/run")&&r.request().method()==="POST");
 assert.equal(await page.locator("#finish").isDisabled(),false,game);
 await page.locator("#finish").click();
 const result=await(await waiting).json();
 await page.locator("#result").waitFor({state:"visible"});
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,400));
 assert.equal(result.selected_game_id,game);
 assert.equal(result.sections.length,3);
 assert.equal(await page.locator(".result-section").count(),3);
 assert.equal(await page.locator(".result-section.educational").count(),1);
 assert.equal(await page.locator(".core-insight").count(),1);
 assert.equal(await page.locator(".teaching-identity strong").count(),1);
 const text=await page.locator(".teaching-core").innerText();
 assert.equal(text,result.sections[1].text);
 assert.doesNotMatch(await page.locator("#result-status").innerText(),/source.verified|scholarly.pass/i);
 assert.equal(result.accountSaved,false);
 const counts=result.sections.map(s=>wc(s.text));
 assert.ok(result.wordCount>=80&&result.wordCount<=120);
 assert.equal(counts.reduce((a,b)=>a+b,0),result.wordCount);
 return result;
}
test("Normal consumer experience auto-selects one legitimate source-backed game at all four widths",async()=>{
 const server=await createB25PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({viewport:{width,height:850},
     isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],external=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(!r.url().startsWith(server.url))external.push(r.url());});
   await page.goto(server.url+"/",{waitUntil:"networkidle"});
   assert.equal(await page.locator("#sources button").count(),6);
   assert.equal(await page.locator("#peer-section").isHidden(),true);
   assert.equal(await page.locator("#peers button").count(),0);
   assert.equal(await page.locator("#experience").isHidden(),true);
   if(width===390)await page.screenshot({path:"qa-evidence/b25-start-390.png",fullPage:true});

   await openSource(page,"thoreau_weekend","balance_of_values");
   assert.equal(await page.locator("#peer-section").isHidden(),true);
   assert.equal(await page.locator("#hours-slider").getAttribute("max"),"12");
   assert.equal((await page.evaluate(()=>window.__YL_B25_QA.getState())).st.leftSlots,6);
   assert.equal(await page.locator("#finish").isDisabled(),true);
   await page.getByRole("button",{name:"+ One unit"}).click();
   await page.locator('[data-focus="openness"]').click();
   const weekend=await reveal(page,"balance_of_values");
   assert.equal(weekend.canonical_choice.amounts.reduce((a,b)=>a+b),12);
   assert.equal(weekend.expressionVersion,"evidence-bound-expression/2.5.0");
   assert.match(await page.locator(".teaching-core").innerText(),/Thoreau/i);
   assert.equal(await page.locator(".thinker-avatar svg.yl-thinker-pixel").count(),1);
   if(width===390)await page.screenshot({path:"qa-evidence/b25-thoreau-weekend-390.png",fullPage:true});

   await openSource(page,"dillard_pattern","balance_of_values");
   assert.equal(await page.locator("#hours-slider").getAttribute("max"),"10");
   assert.equal((await page.evaluate(()=>window.__YL_B25_QA.getState())).st.leftSlots,5);
   await page.getByRole("button",{name:"+ One unit"}).click();
   await page.locator('[data-focus="repeated_pattern"]').click();
   const pattern=await reveal(page,"balance_of_values");
   assert.deepEqual(pattern.canonical_choice.amounts,[6,4]);
   assert.equal(pattern.canonical_choice.repetitions,4);
   assert.equal(pattern.meaningKind,"repetition");
   assert.match(await page.locator(".teaching-core").innerText(),/Across 4 imagined evenings/);
   assert.equal(await page.locator(".teaching-identity strong").innerText(),"Annie Dillard");
   assert.equal(await page.locator(".source-depth a").getAttribute("href")!==null,true);
   if(width===390)await page.screenshot({path:"qa-evidence/b25-dillard-pattern-390.png",fullPage:true});

   await openSource(page,"thoreau_balance","balance_of_values");
   await page.getByRole("button",{name:"+ One unit"}).click();
   const original=await reveal(page,"balance_of_values");
   assert.equal(original.expressionVersion,"evidence-bound-expression/2.5.0");
   assert.deepEqual(original.canonical_choice.amounts,[5,3]);

   await openSource(page,"kierkegaard_future","future_reveal");
   await page.locator('[data-start="change"]').click();
   await page.locator('[data-scene="risk"]').click();
   await page.locator('[data-response="continue"]').click();
   const future=await reveal(page,"future_reveal");
   assert.equal(future.provenance.authoredEventCausedByReader,false);
   assert.equal(future.provenance.unchosenFutureKnown,false);

   await openSource(page,"dillard","trade_off");
   await page.locator("#game-controls input[type=range]").first().evaluate(el=>{
    el.value="4";el.dispatchEvent(new Event("change",{bubbles:true}));
   });
   await reveal(page,"trade_off");

   const bad=await page.evaluate(async()=>{
    const r=await fetch("/api/run",{method:"POST",headers:{"content-type":"application/json"},
     body:JSON.stringify({recordKey:"dillard",gameId:"token_studio",
      qaMode:false,input:{amounts:[2,2,2],repetitions:5}})});
    return {status:r.status,data:await r.json()};
   });
   assert.equal(bad.status,422);
   assert.equal(bad.data.code,"qa_only_manual_selection");
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>
    document.documentElement.clientWidth+1),false);
   assert.equal(await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>
    xs.filter(x=>!x.disabled).filter(x=>{const b=x.getBoundingClientRect();
     return b.height<44||b.width<44;}).length),0);
   assert.deepEqual(errors,[]);
   assert.deepEqual(external,[]);
   console.log("B25_CONSUMER "+JSON.stringify({width,automaticSelection:true,
    usableSourceRecords:6,newAuthoredVariants:2,thirdPartyRequests:0,
    browserErrors:0,physicalIphone:false,realNoviceReaders:0}));
   await context.close();
  }
 }finally{await browser.close();await server.close();}
});
test("Explicit ?qa=1 manually exposes all six protected peers without changing normal selection",async()=>{
 const server=await createB25PreviewServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(server.url+"/?qa=1",{waitUntil:"networkidle"});
  assert.equal(await page.locator("#peer-section").isHidden(),false);
  assert.equal(await page.locator("#sources button").count(),6);
  await page.locator('[data-source="dillard"]').click();
  assert.equal(await page.locator("#peers button").count(),6);
  assert.equal(await page.locator('[data-game="token_studio"]').isDisabled(),false);
  await page.locator('[data-game="token_studio"]').click();
  assert.equal(await page.locator('[data-token]').count(),6);
  await page.locator('[data-token="0"]').click();
  await reveal(page,"token_studio");
  await page.locator('[data-source="kierkegaard_map"]').click();
  await page.locator('[data-game="swipe_decision"]').click();
  assert.equal(await page.locator('[data-swipe-surface]').count(),1);
  await page.locator('[data-swipe-surface]').focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal((await page.evaluate(()=>window.__YL_B25_QA.getState())).st.start,"change");
  await page.locator('[data-scene="risk"]').click();
  await page.locator('[data-response="continue"]').click();
  await reveal(page,"swipe_decision");
  await page.locator('[data-source="kierkegaard_map"]').click();
  await page.locator('[data-game="decision_map"]').click();
  await page.locator('[data-start="change"]').click();
  await page.locator('[data-scene="risk"]').click();
  await page.locator('[data-response="continue"]').click();
  await reveal(page,"decision_map");
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 }finally{await browser.close();await server.close();}
});
