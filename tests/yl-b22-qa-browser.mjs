import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
mkdirSync("qa-evidence",{recursive:true});
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
try{
 for(const width of [320,390,430,1024]){
  const page=await browser.newPage({viewport:{width,height:850},
   isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
  const errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  await page.goto(new URL("../experiments/yl-milestone-b-lab.html",import.meta.url).href);
  const status=await page.locator(".disclosure").innerText();
  assert.match(status,/SOURCE ELIGIBILITY BLOCKED/);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".slider-row button").first().focus();
  await page.keyboard.press("Enter");
  const state=()=>page.evaluate(()=>window.__YL_B_LAB_QA.getState());
  assert.equal((await state()).balance,4);
  await page.locator("#back").click();
  assert.equal((await state()).balance,3);
  await page.locator("#mode-future").click();
  await page.locator(".pair .option").first().click();
  assert.equal(await page.locator("#future-slider").getAttribute("max"),"1");
  await page.locator(".timeline-tools button").last().click();
  await page.getByRole("button",{name:"Choose a different starting action"}).click();
  assert.equal((await state()).maxSeen,0);
  assert.equal((await state()).route,null);
  const small=await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>
   xs.filter(x=>!x.disabled).map(x=>x.getBoundingClientRect()).filter(r=>
    r.width<44||r.height<44).length);
  assert.equal(small,0);
  const overflow=await page.evaluate(()=>
   document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  assert.equal(overflow,false);
  assert.deepEqual(errors,[]);
  assert.deepEqual(external,[]);
  if(width===390){
   await page.screenshot({path:"qa-evidence/b22-future-source-neutral-390.png",fullPage:true});
   await page.locator("#mode-balance").click();
   await page.screenshot({path:"qa-evidence/b22-balance-source-neutral-390.png",fullPage:true});
  }
  console.log("B22_QA_BROWSER "+JSON.stringify({width,sourceEligible:false,
   uiOnly:true,errors:0,externalRequests:0,physicalDevice:false}));
  await page.close();
 }
}finally{await browser.close();}
