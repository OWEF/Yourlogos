import {chromium} from "playwright-core";
import assert from "node:assert/strict";
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const file=new URL("../experiments/encounter-v20-proof.html",import.meta.url).href;
try {
 for(const width of [320,390,430,1024]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width<500,hasTouch:width<500});
  const errors=[],network=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(file);
  const tabs=page.locator("#menu button");
  assert.equal(await tabs.count(),7);
  assert.equal(await page.locator("#content .column").count(),2);
  assert.equal(await page.locator("#content .section").count(),6);
  for(let i=0;i<7;i++){
   await tabs.nth(i).click();
   assert.equal(await tabs.nth(i).getAttribute("aria-pressed"),"true");
   assert.equal(await page.locator("#content .section").count(),6);
   const texts=await page.locator("#content .section p").allTextContents();
   assert.notEqual(texts[2],texts[5],"v2 closing must differ from legacy");
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"horizontal overflow "+width);
  }
  await page.keyboard.press("Tab");
  assert.equal(errors.length,0,errors.join(";"));
  assert.equal(network.length,0,"Unexpected network calls");
  await page.close();
 }
} finally {await browser.close()}
process.stdout.write("CZ127-BROWSER 28/28 path×viewport screenshot-free interaction/parity journeys passed (simulated Chromium, NOT iPhone Safari).\n");
