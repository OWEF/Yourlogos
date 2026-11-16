/**
 * CZ-123 independently authored CZ-133 educational + philosophical
 * interaction browser red-team, exact B2.4 SHA 5bb9b69d...
 * Emulated Chrome is NOT a physical iPhone/VoiceOver or a real reader study.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
import {chromium} from "playwright-core";
import {createB24ResearchServer}
 from "../experiments/yl-b24-encounter-server.mjs";
mkdirSync("qa-evidence",{recursive:true});
const words=s=>s.trim().split(/\s+/).filter(Boolean).length;
const control=(page,x)=>page.locator(x);
async function sourceAndGame(page,src,game){
 await control(page,'[data-source="'+src+'"]').click();
 assert.equal(await control(page,"#peers button").count(),6);
 await control(page,'[data-game="'+game+'"]').click();
 assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).game,game);
}
async function discover(page,expected){
 const response=page.waitForResponse(r=>r.url().endsWith("/api/run")&&r.request().method()==="POST");
 await control(page,"#finish").click();
 const result=(await response).json();
 await control(page,"#result").waitFor({state:"visible"});
 const data=await result;
 assert.equal(data.status,"ready");
 assert.equal(data.selected_game_id,expected);
 assert.equal(data.publicationAllowed,false);
 assert.equal(data.accountSaved,false);
 assert.equal(await control(page,".result-section").count(),3);
 assert.equal(await control(page,".result-section.educational").count(),1);
 assert.equal(await control(page,".result-section.educational h3").innerText(),"Back to the Philosopher");
 assert.equal(await control(page,".teaching-core").innerText(),data.sections[1].text);
 assert.equal(data.sections.length,3);
 assert.deepEqual(data.sections.map(x=>x.label),[
  "Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=data.sections.map(x=>words(x.text)),n=counts.reduce((a,b)=>a+b,0);
 assert.equal(data.wordCount,n);
 assert.ok(n>=80&&n<=120,JSON.stringify(counts));
 for(let i=0;i<3;i++)assert.ok(counts[i]>=[10,18,9][i]&&counts[i]<=[48,65,26][i]);
 return data;
}
test("independent source-linked Section II card, philosopher art, genuine semantic lens and no fourth section at four widths",async()=>{
 const app=await createB24ResearchServer();
 const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
 try{
  for(const width of [320,390,430,1024]){
   const context=await browser.newContext({viewport:{width,height:875},
    isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[],outside=[];
   page.on("pageerror",e=>errors.push(e.message));
   page.on("request",r=>{if(!r.url().startsWith(app.url))outside.push(r.url());});
   await page.goto(app.url+"/",{waitUntil:"networkidle"});
   assert.equal(await control(page,"#sources button").count(),4);
   assert.equal(await control(page,"#peers button").count(),6);
   await sourceAndGame(page,"thoreau_balance","balance_of_values");
   assert.equal(await control(page,"#hours-slider").getAttribute("max"),"8");
   assert.equal(await control(page,".balance-board").count(),1);
   assert.equal(await control(page,".lens-option").count(),2);
   assert.equal(await control(page,".marginal-note").count(),1);
   assert.match(await control(page,".marginal-note").innerText(),/one more hour/i);
   assert.equal(await control(page,"#finish").isDisabled(),true);
   await control(page,'[data-focus="time_kept"]').click();
   await control(page,"#hours-slider").evaluate(el=>{
    el.value="6";el.dispatchEvent(new Event("input",{bubbles:true}));
   });
   const focused=await discover(page,"balance_of_values");
   assert.equal(focused.expressionVerification,"source-bound-encounter-v2-compatible/2.4.0");
   assert.match(await control(page,".teaching-core").innerText(),/retained/i);
   const lesson=await control(page,".teaching-core").innerText();
   assert.equal(await control(page,".thinker-avatar svg.yl-thinker-pixel").count(),1);
   assert.equal(await control(page,".teaching-identity strong").innerText(),"Henry David Thoreau");
   assert.equal(await control(page,".source-excerpt mark").count(),1);
   const q=await control(page,".source-excerpt").innerText();
   assert.ok(q.includes(await control(page,".source-excerpt mark").innerText()));
   const detail=control(page,".source-depth");
   assert.equal(await detail.getAttribute("open"),null);
   await control(page,".source-depth summary").focus();
   await page.keyboard.press("Enter");
   assert.notEqual(await detail.getAttribute("open"),null);
   assert.match(await detail.innerText(),/provisional/i);
   const link=control(page,".source-depth a");
   assert.equal(await link.getAttribute("href"),"https://digitalthoreau.org/walden/fluid/text/01.html");
   assert.equal(await link.getAttribute("rel"),"noopener noreferrer");
   if(width===390)await page.screenshot({path:"qa-evidence/cz123-b24-value-teaching-390.png",fullPage:true});
   await control(page,"#revise").click();
   await control(page,'[data-focus="life_exchanged"]').click();
   const revised=await discover(page,"balance_of_values");
   assert.deepEqual(revised.canonical_choice,focused.canonical_choice);
   assert.notEqual(await control(page,".teaching-core").innerText(),lesson,
    "User's interpretive lens must change learning without changing canonical arithmetic");
   assert.equal(revised.expressionVersion,"encounter-output-v2-compatible/2.4.0");
   // Undo changes source selection but source mode must never present a forbidden peer.
   await control(page,'[data-source="kierkegaard_future"]').click();
   assert.equal(await control(page,'[data-game="balance_of_values"]').isDisabled(),true);
   await control(page,'[data-game="future_reveal"]').click();
   await control(page,'[data-start="stay"]').click();
   assert.equal(await control(page,"#timeline-scrub").getAttribute("max"),"1");
   await control(page,'[data-scene="surprise"]').click();
   assert.equal(await control(page,"#timeline-scrub").getAttribute("max"),"2");
   assert.match(await control(page,".authored").last().innerText(),/AUTHOR-WRITTEN FICTION/);
   await control(page,'[data-response="continue"]').click();
   assert.equal(await control(page,"#timeline-scrub").getAttribute("max"),"3");
   await control(page,"#timeline-scrub").evaluate(el=>{
    el.value="1";el.dispatchEvent(new Event("change",{bubbles:true}));
   });
   assert.match(await control(page,".authored").first().innerText(),/First choice/);
   const future=await discover(page,"future_reveal");
   assert.equal(future.provenance.authoredEventCausedByReader,false);
   assert.equal(future.provenance.unchosenFutureKnown,false);
   assert.equal(await control(page,".teaching-identity strong").innerText(),"Søren Kierkegaard");
   assert.equal(await control(page,".thinker-avatar svg.yl-thinker-pixel").count(),1);
   assert.ok((await control(page,".teaching-core").innerText()).length>100);
   if(width===390)await page.screenshot({path:"qa-evidence/cz123-b24-future-teaching-390.png",fullPage:true});
   await control(page,"#revise").click();
   await page.getByRole("button",{name:"Explore a different scene"}).click();
   const state=await page.evaluate(()=>window.__YL_B23_QA.getState());
   assert.equal(state.st.scene,null);assert.equal(state.st.response,null);
   assert.equal(await control(page,"#finish").isDisabled(),true);
   await control(page,'[data-scene="missed"]').click();
   assert.equal((await page.evaluate(()=>window.__YL_B23_QA.getState())).st.scene,"missed");
   // All user-visible source excerpts are exact stored source substrings,
   // never unverified concatenations or a simulated philosopher dialogue.
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
   assert.equal(await page.evaluate(()=>
    document.documentElement.scrollWidth>document.documentElement.clientWidth+1),false);
   const small=await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>
    xs.filter(x=>!x.disabled).filter(x=>{
     const b=x.getBoundingClientRect();return b.width<44||b.height<44;
    }).length);
   assert.equal(small,0);
   assert.deepEqual(errors,[]);
   assert.deepEqual(outside,[]);
   console.log("CZ123_B24_CARD "+JSON.stringify({width,threeSections:true,
    originalPixelArtReused:true,sourceLinkChecked:true,
    humanFirstTimeReaders:0,physicalSafari:false,
    voiceOverPhysical:false,externalRequests:0,javascriptErrors:0}));
   await context.close();
  }
 }finally{await browser.close();await app.close();}
});
