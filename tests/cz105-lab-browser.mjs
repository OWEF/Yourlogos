/**
 * PR-only Chromium smoke test for the actual self-contained CZ-105 lab.
 * Requires a system Chrome and playwright-core (CI installs it ephemeral).
 * No cloud computer, API key, LLM, staging site or production calls.
 */
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {fileURLToPath, pathToFileURL} from "node:url";
import {resolve, dirname} from "node:path";
import {mkdir} from "node:fs/promises";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = pathToFileURL(resolve(root, "experiments/cz105-reasoning-lab-standalone.html")).href;
const screenshotDir = resolve(root, "test-results/cz105");
await mkdir(screenshotDir, {recursive:true});
const browser = await chromium.launch({
  channel: "chrome",
  headless:true,
  args:["--no-sandbox","--allow-file-access-from-files"],
});
const failures = [];
try {
  for (const width of [320,390,768]) {
    const context = await browser.newContext({
      viewport:{width,height:820},
      isMobile:width < 741,
      hasTouch:width < 741,
      deviceScaleFactor:width < 741 ? 2 : 1,
    });
    const page = await context.newPage();
    const errors = [], unexpectedRequests = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", request => {
      if (/^https?:/.test(request.url())) unexpectedRequests.push(request.url());
    });
    await page.goto(url, {waitUntil:"load"});
    await page.waitForFunction(() => document.getElementById("evaluated-at")?.textContent === "Analysis current",null,{timeout:15000});

    for (const id of ["out-happened","out-follows","out-uncertain","out-why"]) {
      const text = await page.locator("#"+id).innerText();
      assert.ok(text.length > 30, "Missing " + id + " on "+width+"px");
    }
    assert.match(await page.locator("#out-why").innerText(),/Model: seneca-time-tradeoff-v1/);
    assert.match(await page.locator("#out-follows").innerText(),/Necessary within this thought experiment/i);

    await page.getByRole("button",{name:"All duties"}).click();
    await page.getByRole("button",{name:"Run philosophical reasoning"}).click();
    assert.equal(await page.locator("#value-obligations").innerText(),"8h");
    assert.match(await page.locator("#out-happened").innerText(),/Obligations 8h/);
    assert.match(await page.locator("#out-follows").innerText(),/block devoted entirely to obligations/);

    await page.locator("#slider-rest").evaluate(el => {
      el.value = "6";
      el.dispatchEvent(new Event("input",{bubbles:true}));
    });
    const values = await page.locator(".item .val").allInnerTexts();
    const sum = values.reduce((s,n)=>s+Number.parseFloat(n),0);
    assert.equal(sum,8,"Slider should always preserve eight hours");
    assert.equal(await page.locator("#value-rest").innerText(),"3h");
    await page.getByRole("radio",{name:"Recurring"}).check();
    await page.locator("#priority").selectOption("rest");
    await page.getByRole("button",{name:"Run philosophical reasoning"}).click();
    assert.match(await page.locator("#out-follows").innerText(),/repeated regularly/);

    await page.getByRole("button",{name:"Save result A"}).click();
    await page.getByRole("button",{name:"All reflection"}).click();
    await page.getByRole("button",{name:"Save result B"}).click();
    assert.doesNotMatch(await page.locator("#snapshot-a").innerText(),/Not saved yet/);
    assert.doesNotMatch(await page.locator("#snapshot-b").innerText(),/Not saved yet/);
    await page.locator("#snapshot-a button").click();
    assert.equal(await page.locator("#value-rest").innerText(),"3h");

    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2);
    assert.equal(noOverflow, true,"Horizontal overflow at "+width);
    assert.deepEqual(errors,[],"Browser JS errors at "+width);
    assert.deepEqual(unexpectedRequests,[],"Offline lab attempted external requests at "+width);
    await page.screenshot({path:resolve(screenshotDir,"mobile-"+width+".png"),fullPage:true});
    process.stdout.write("PASS CZ-105 mobile offline lab: "+width+"px, all four outputs, slider, context, snapshots, no overflow\n");
    await context.close();
  }
} catch(err) {
  failures.push(err);
} finally {
  await browser.close();
}
if(failures.length) throw failures[0];
