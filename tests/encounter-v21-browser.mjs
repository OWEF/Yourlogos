import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const file=new URL("../experiments/encounter-v21-playable.html",import.meta.url).href;
mkdirSync(new URL("../artifacts",import.meta.url),{recursive:true});
const patterns=[
 {name:"shared",amounts:[3,1,2]},
 {name:"writing",amounts:[6,0,0]},
 {name:"rest",amounts:[0,0,6]},
 {name:"messages",amounts:[0,6,0]},
 {name:"mixed",amounts:[2,2,2]}
];
try{
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const errors=[],network=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(file);
  await page.locator("#start").click();
  assert.equal(await page.locator("#remaining-value").innerText(),"3 hours");
  assert.equal(await page.locator("#submit").isDisabled(),true);
  await page.locator("#theme-b").click();
  assert.equal(await page.locator("#theme-b").getAttribute("aria-pressed"),"true");
  assert.equal(await page.locator("body").getAttribute("data-theme"),"observatory");
  await page.locator("#theme-a").click();
  assert.equal(await page.locator("body").getAttribute("data-theme"),"manuscript");
  // tap alternative
  await page.locator('#bank [data-token="0"]').click();
  await page.locator('[data-zone="1"]').click();
  assert.equal(await page.locator("#remaining-value").innerText(),"2.5 hours");
  await page.locator("#undo").click();
  assert.equal(await page.locator("#remaining-value").innerText(),"3 hours");
  // test real HTML5 drag or Pointer Events, not a fabricated result fixture
  await page.locator('#bank [data-token="0"]').dragTo(page.locator('[data-zone="0"]'),{force:true});
  assert.equal(await page.locator("#remaining-value").innerText(),"2.5 hours");
  await page.locator("#reset").click();
  assert.equal(await page.locator("#remaining-value").innerText(),"3 hours");
  const endings=[],teachings=[],snapshots=[];
  for(const {name,amounts} of patterns){
   await page.locator("#reset").click();
   for(let i=0;i<3;i++)for(let j=0;j<amounts[i];j++)
    await page.locator('[data-add="'+i+'"]').click();
   assert.equal(await page.locator("#remaining-value").innerText(),"0 hours");
   assert.equal(await page.locator("#submit").isEnabled(),true);
   const actual=await page.evaluate(()=>window.__YL_V21_TEST.getState().cells);
   assert.deepEqual([0,1,2].map(i=>actual.filter(x=>x===i).length),amounts);
   await page.locator("#submit").click();
   const state=await page.evaluate(()=>window.__YL_V21_TEST.getState());
   assert.equal(state.resultStatus,"ready",name+" "+JSON.stringify(state));
   assert.deepEqual(JSON.parse(state.resultInput),{amounts,budgets:[6],repetitions:5});
   assert.equal(state.sections.length,3);
   assert.equal(state.sections.join(" ").split(/\s+/).length>=80,true);
   assert.equal(state.sections.join(" ").split(/\s+/).length<=120,true);
   assert.equal(await page.locator("#philosopher-portrait svg").count(),1);
   assert.match(await page.locator("#teaching-text").innerText(),/Dillard/);
   assert.match(await page.locator("#source-detail").innerText(),/http/);
   teachings.push(state.sections[1]);endings.push(state.sections[2]);snapshots.push(state.sections[0]);
   if(width===390&&(name==="shared"||name==="rest")){
    await page.locator(name==="shared"?"#theme-a":"#theme-b").click();
    await page.screenshot({path:new URL("../artifacts/cz138-"+name+"-"+(name==="shared"?"manuscript":"observatory")+".png",import.meta.url).pathname,fullPage:true});
   }
   await page.locator("#edit").click();
   assert.equal(await page.locator("#result").isVisible(),false);
   assert.equal((await page.evaluate(()=>window.__YL_V21_TEST.getState())).resultStatus,null);
  }
  assert.ok(new Set(snapshots).size>=4,"Expected four distinct choice-dependent outputs");
  assert.ok(new Set(endings).size>=3,"Expected distinct emotion strategy endings");
  await page.locator("#reset").click();
  await page.locator('[data-add="0"]').click();
  assert.equal(await page.locator("#submit").isDisabled(),true);
  const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth}));
  assert.ok(dimensions.scrollWidth<=dimensions.innerWidth,JSON.stringify({width,dimensions}));
  assert.equal(errors.length,0,"Page errors: "+errors.join(";"));
  assert.equal(network.length,0,"Unexpected network: "+network.join(";"));
  await page.close();
 }
 const page=await browser.newPage();
 await page.goto(file);
 const all=await page.evaluate(()=>{
  const E=window.YL_ENCOUNTER_ENGINE,result={total:0,ready:0,failures:[]};
  for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++){
   const c=6-a-b,input={amounts:[a,b,c],budgets:[6],repetitions:5};
   const p=E.reasonSemantically(E.semanticCases.dillard,input);
   const x=p.status==="ready"?E.renderEncounterV20(p):{status:p.status,reason:p.reason};
   result.total++;
   if(x.status==="ready")result.ready++;else result.failures.push({amounts:input.amounts,status:x.status,reason:x.reason});
  }return result;
 });
 console.log("CZ138-ALL-ALLOCATIONS "+JSON.stringify(all));
 assert.equal(all.total,28);
 assert.equal(all.ready,28,"Every mathematically valid allocation needs a READY source-grounded result; failures: "+JSON.stringify(all.failures));
}finally{await browser.close();}
console.log("CZ138-BROWSER: 320/390/430 mobile journeys, real drag/tap/undo/reset, 5 outcomes, 28/28 engine allocations, zero network + screenshots PASS (Chromium simulation, not physical Safari)");
