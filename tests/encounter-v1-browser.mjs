import assert from "node:assert/strict";
import {chromium} from "playwright-core";
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const url=process.argv[2] || new URL("../experiments/encounter-v1-standalone.html",import.meta.url).href;
try {
  for (const width of [320,390,1024]){
    const page=await browser.newPage({viewport:{width,height:844},isMobile:width<500,hasTouch:width<500});
    const errors=[],network=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("request",r=>{if (/^https?:/.test(r.url())) network.push(r.url());});
    await page.goto(url);
    const run=page.locator("[data-run]");
    assert.equal(await run.count(),0);
    await page.locator('[data-like="dillard"]').click();
    assert.equal(await page.locator('[data-like="dillard"]').getAttribute("aria-pressed"),"true");
    assert.equal(await run.count(),0);
    await page.locator('[data-discover="dillard"]').click();
    assert.equal(await run.isDisabled(),true);
    await page.locator("[data-range]").first().focus();
    await page.keyboard.press("Home");
    await page.locator('[data-motive][data-value="planned"]').click();
    await run.click();
    assert.match(await page.locator(".result h3").innerText(),/another evening/);
    assert.equal(await page.locator(".result .reflection").count(),1);
    await page.locator('[data-motive][data-value="interrupted"]').click();
    assert.equal(await page.locator(".result").count(),0);
    await run.click();
    assert.match(await page.locator(".result h3").innerText(),/message/);
    await page.locator("[data-range]").first().focus();
    await page.keyboard.press("End");
    assert.equal(await page.locator(".result").count(),0);
    const sliders=page.locator("[data-range]");
    await sliders.nth(1).press("End");
    await sliders.nth(2).press("ArrowRight");
    await sliders.nth(0).press("ArrowRight");
    await run.click();
    assert.match(await page.locator(".result h3").innerText(),/whether that time was protected/);
    assert.equal(await page.locator(".result .reflection").count(),1);
    async function verifyEnding(){
      const result=page.locator(".result");
      assert.deepEqual(await result.locator(".section-label").allTextContents(),[
        "Your Encounter with "+await page.locator(".case-top h2").innerText(),"Return to the quotation","A question to carry forward"]);
      assert.equal(await result.locator("blockquote").innerText(),(await page.locator(".case-top .quote").innerText()).slice(1,-1));
      assert.equal(await result.locator("details").count(),0);
      assert.equal(await result.locator(".memory-reference").count(),0);
      assert.equal(await result.locator(":scope > :last-child").getAttribute("class"),"reflection");
      assert.equal(await result.evaluate(el=>el===document.activeElement),true);
      const contrast=result.getByRole("definition");
      assert.equal(await contrast.count(),2);
      assert.equal(await result.locator("dl").getAttribute("aria-label"),"The philosophical distinction");
      assert.ok(await contrast.first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14));
      const bounds=await result.boundingBox();
      assert.ok(bounds.height<=844, width+"px ending height "+bounds.height);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await verifyEnding();
    await page.locator('[data-mode="kierkegaard"]').click();
    assert.equal(await page.locator("[data-start]").count(),0);
    await page.locator('[data-discover="kierkegaard"]').click();
    await page.locator("[data-start]").click();
    const pick=async(stage,value)=>page.locator(`[data-fork-choice="${stage}"][data-value="${value}"]`).click();
    for(const [first,word] of [["change",/friends/],["stay",/familiar job/]]){
      await pick("resource",first);
      assert.equal(await page.locator('[data-fork-choice="action"]').count(),0);
      assert.equal(await page.locator(".result").count(),0);
      await pick("barrier","surprise");
      await pick("action","adapt");
      await run.click();
      assert.match(await page.locator(".result h3").innerText(),word);
      await verifyEnding();
      assert.equal(await page.locator("details").count(),0);
      // Evidence exists in the packet and is inspected in independent Node tests.
      // The consumer experience must end at its reflective question.
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.locator("[data-reset]").click();
    assert.equal(await page.locator(".result, [data-fork-choice]").count(),0);
    await page.goto(url.split("#")[0]+"#qa-reflection");
    await page.locator('[data-mode="dillard"]').click();
    await page.locator('[data-discover="dillard"]').click();
    await page.locator('[data-motive][data-value="planned"]').click();
    await run.click();
    assert.match(await page.locator(".result").innerText(),/sample reflection/i);
    assert.equal(await page.locator(".memory-reference").count(),1);
    assert.equal(await page.locator(".section-label").count(),3);
    assert.equal(await page.locator(".result details").count(),1);
    assert.ok((await page.locator(".result").boundingBox()).height<=844);
    assert.deepEqual(errors,[]);
    if(url.startsWith("file:")) assert.deepEqual(network,[]);
    console.log(width+"px: both journeys, edits, reset, evidence, and viewport passed");
    await page.close();
  }
} finally {await browser.close();}
