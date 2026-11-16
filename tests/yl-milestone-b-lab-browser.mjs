import {chromium} from "playwright-core";
import assert from "node:assert/strict";
const url=new URL("../experiments/yl-milestone-b-lab.html",import.meta.url).href;
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
try{
 for(const width of [320,390,430,1024]){
  const page=await browser.newPage({viewport:{width,height:850},
   isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
  const errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  await page.goto(url);
  const state=()=>page.evaluate(()=>window.__YL_B_LAB_QA.getState());
  const caps=await page.evaluate(()=>window.__YL_B_LAB_QA.capabilities);
  assert.deepEqual(caps,{sourceEligible:false,philosophicalInference:false,
   selectionAllowed:false,persistenceEnabled:false,publicationAllowed:false});
  assert.equal((await state()).mode,"balance");
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".slider-row button").first().click();
  assert.equal((await state()).balance,4);
  assert.match(await page.locator(".slider-row button").first().getAttribute("aria-label"),/Clarity/);
  assert.equal((await state()).balanceTouched,true);
  assert.equal(await page.locator("#continue").isEnabled(),true);
  await page.locator("#back").click();
  assert.equal((await state()).balance,3);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".slider-row button").last().click();
  assert.equal((await state()).balance,2);
  await page.locator("#continue").click();
  assert.equal((await state()).finished,true);
  assert.equal(await page.locator("#preview-complete").isVisible(),true);
  assert.match(await page.locator("#preview-complete").innerText(),/no philosophical insight/i);
  await page.locator("#mode-future").click();
  assert.equal((await state()).mode,"future");
  assert.equal(await page.locator(".pair .option").count(),2);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".pair .option").first().click();
  assert.equal((await state()).route,"join");
  assert.equal((await state()).step,0);
  assert.equal(await page.locator("#future-slider").getAttribute("max"),"1");
  for(let step=1;step<=3;step++){
   await page.locator(".timeline-tools button").last().click();
   assert.equal((await state()).step,step);
  }
  assert.equal((await state()).maxSeen,3);
  assert.equal(await page.locator("#continue").isEnabled(),true);
  await page.locator(".timeline-tools button").first().click();
  assert.equal((await state()).step,2);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".timeline-tools button").last().click();
  await page.locator("#continue").click();
  assert.equal((await state()).finished,true);
  await page.locator("#back").click();
  assert.equal((await state()).finished,false);
  await page.getByRole("button",{name:"Choose a different starting action"}).click();
  assert.equal((await state()).route,null);
  assert.equal((await state()).step,0);
  assert.equal((await state()).maxSeen,0);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".pair .option").last().click();
  assert.equal((await state()).route,"wait");
  assert.equal((await state()).maxSeen,0);
  const overflow=await page.evaluate(()=>
   document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  assert.equal(overflow,false,"Overflow at "+width);
  const tiny=await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>xs
   .filter(x=>!x.disabled).map(x=>({name:x.textContent?.trim().slice(0,35),r:x.getBoundingClientRect()}))
   .filter(x=>x.r.width<44||x.r.height<44));
  assert.deepEqual(tiny,[],"Undersized hit targets: "+JSON.stringify(tiny));
  assert.deepEqual(errors,[],"Browser JS errors at "+width);
  assert.deepEqual(external,[],"External network calls at "+width);
  console.log("CZ134-B0-UI "+JSON.stringify({width,balance:true,future:true,
   changedRouteResets:true,scrubReversible:true,sourceAdmitted:false,external:0,errors:0}));
  await page.close();
 }
}finally{await browser.close();}