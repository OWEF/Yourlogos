import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
fs.mkdirSync("qa-evidence",{recursive:true});
try{
 for(const width of [320,390,430,1024]){
  const page=await browser.newPage({viewport:{width,height:850},
   isMobile:width<=430,hasTouch:width<=430,reducedMotion:"reduce"});
  const errors=[],remote=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
  await page.goto(new URL("../experiments/yl-milestone-b-lab.html",import.meta.url).href);
  const qa=()=>page.evaluate(()=>window.__YL_B_LAB_QA.getState());
  assert.match(await page.locator(".disclosure").innerText(),/SOURCE ELIGIBILITY BLOCKED/);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  await page.locator(".slider-row button").first().focus();
  await page.keyboard.press("Enter");
  assert.equal((await qa()).balance,4,"Keyboard balance control must agree with direction");
  await page.locator("#back").click();
  assert.equal((await qa()).balance,3);
  await page.locator("#mode-future").click();
  await page.locator(".pair .option").first().click();
  assert.equal(await page.locator("#future-slider").getAttribute("max"),"1");
  await page.locator(".timeline-tools button").last().click();
  assert.equal((await qa()).step,1);
  await page.locator(".timeline-tools button").first().click();
  assert.equal((await qa()).step,0);
  await page.getByRole("button",{name:"Choose a different starting action"}).click();
  assert.equal((await qa()).maxSeen,0,"Revision must lock later scenes");
  assert.equal((await qa()).route,null);
  await page.locator(".pair .option").last().click();
  assert.equal((await qa()).route,"wait");
  assert.equal((await qa()).maxSeen,0);
  assert.equal(await page.locator("#continue").isDisabled(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>
   document.documentElement.clientWidth+1),false);
  const small=await page.locator("button:visible,input[type=range]:visible").evaluateAll(xs=>xs
   .filter(x=>!x.disabled).map(x=>x.getBoundingClientRect())
   .filter(r=>r.width<44||r.height<44).length);
  assert.equal(small,0,"Controls smaller than 44px");
  assert.deepEqual(errors,[]);
  assert.deepEqual(remote,[]);
  if(width===390){
   await page.screenshot({path:"qa-evidence/b1-390-future-source-neutral.png",fullPage:true});
   await page.locator("#mode-balance").click();
   await page.screenshot({path:"qa-evidence/b1-390-balance-source-neutral.png",fullPage:true});
  }
  console.log(JSON.stringify({width,existingB0UI:"pass",sourceAdmitted:false,
   engineConnected:false,errors:0,network:0,physicalSafariVerified:false}));
  await page.close();
 }
}finally{await browser.close();}
