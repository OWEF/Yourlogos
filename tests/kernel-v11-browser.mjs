import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const url=pathToFileURL(resolve("experiments/encounter-v1-standalone.html")).href;
await mkdir("design-review",{recursive:true});
try{
 for(const width of [320,390,1024]){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:width<600,reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  if(width===390){
   for(const [edition,location] of [["before",pathToFileURL(resolve("baseline/experiments/encounter-v1-standalone.html")).href],["after",url]]){
    await page.goto(location);
    await page.locator("[data-discover]").click();
    await page.screenshot({path:"design-review/"+edition+"-01-quote.png"});
    await page.locator("[data-enter]").click();
    await page.locator('[data-motive][data-value="planned"]').click();
    await page.screenshot({path:"design-review/"+edition+"-02-scenario.png"});
    await page.locator("[data-run]").click();
    await page.screenshot({path:"design-review/"+edition+"-03-reading.png",fullPage:true});
   }
  }
  await page.goto(url);
  for(const id of ["thoreau","smith","epictetus","descartes"]){
   await page.locator("#more-passages").selectOption(id);
   await page.locator("[data-discover]").click();await page.locator("[data-enter]").click();
   if(id==="thoreau"){
    await page.locator('[data-k-slider="amounts"]').last().fill("3");
    assert.ok(await page.locator("[data-run]").isDisabled());
    await page.locator('[data-k-slider="budgets"]').fill("12");
   }else if(id==="smith"){
    await page.locator('[data-k-slider="amounts"]').first().fill("2");
    assert.equal(await page.locator('[data-k-slider="amounts"]').last().inputValue(),"2");
   }else{
    const ids=id==="epictetus"?["revise","edit","prepare"]:["seek","qualify","amend"];
    for(const [i,v] of ids.entries())await page.locator('[data-k-step="'+i+'"][data-value="'+v+'"]').click();
   }
   await page.locator("[data-run]").click();
   assert.equal(await page.locator(".reading-panel").count(),3);
   assert.ok(await page.locator(".result").evaluate(el=>document.activeElement===el));
   assert.match(await page.locator(".reading-question").innerText(),/\?/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(id==="descartes"){
    await page.locator('[data-back="exercise"]').click();
    await page.locator('[data-k-step="0"][data-value="hold"]').click();
    assert.equal(await page.locator('[data-k-step="1"]').count(),0);
    await page.locator("[data-run]").click();
    assert.doesNotMatch(await page.locator(".reading-self").innerText(),/signed minutes arrive/i);
   }
  }
  assert.deepEqual(errors,[]);await page.close();console.log(width+"px: four transfer cases passed");
 }
}finally{await browser.close();}
