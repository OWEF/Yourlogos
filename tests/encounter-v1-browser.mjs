import assert from "node:assert/strict";
import {chromium} from "playwright-core";

const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const url=process.argv[2] || new URL("../experiments/encounter-v1-standalone.html",import.meta.url).href;

try {
 for (const width of [320,390,1024]) {
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width<500,hasTouch:width<500});
  const errors=[],network=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if (/^https?:/.test(r.url()))network.push(r.url());});
  await page.goto(url);

  const run=page.locator("[data-run]");
  assert.equal(await page.locator("main").getAttribute("data-screen"),"entry");
  assert.equal(await page.locator(".entry-quote").count(),1);
  assert.equal(await page.locator(".intro-scenario,.case-body,.result").count(),0);
  await page.locator('[data-like="dillard"]').click();
  assert.equal(await page.locator('[data-like="dillard"]').getAttribute("aria-pressed"),"true");
  assert.equal(await run.count(),0);

  // Discover first reveals an immersive, readable quote/scenario, not controls.
  await page.locator('[data-discover="dillard"]').click();
  assert.equal(await page.locator("main").getAttribute("data-screen"),"intro");
  assert.equal(await page.locator(".intro-quote,.intro-scenario").count(),2);
  assert.equal(await page.locator(".case-body,.result").count(),0);
  assert.equal(await page.locator(".intro-cta").innerText(),"Shape this evening");
  const sizes=await page.evaluate(()=>({
   quote:parseFloat(getComputedStyle(document.querySelector(".intro-quote")).fontSize),
   scenario:parseFloat(getComputedStyle(document.querySelector(".intro-scenario")).fontSize)
  }));
  assert.ok(Math.abs(sizes.quote-sizes.scenario)<=6,"quote/scenario should have comparable type");

  await page.locator("[data-enter]").click();
  assert.equal(await page.locator("main").getAttribute("data-screen"),"exercise");
  assert.equal(await page.locator(".exercise-context").count(),1);
  assert.equal(await page.locator(".intro-scenario,.result").count(),0);
  assert.equal(await run.isDisabled(),true);
  await page.locator("[data-range]").first().focus();
  await page.keyboard.press("Home");
  await page.locator('[data-motive][data-value="planned"]').click();
  await run.click();
  assert.match(await page.locator(".reading-self h2").innerText(),/next sitting/);

  async function verifyEnding(author,qa=false) {
   const result=page.locator(".result");
   assert.equal(await page.locator("main").getAttribute("data-screen"),"result");
   assert.equal(await result.locator(".reading-panel").count(),3);
   assert.equal(await page.locator(".voice-grid").count(),qa?1:0);
   if (!qa) assert.equal(await result.locator(":scope > :last-child").getAttribute("class"),"reading-panel reading-question");
   assert.deepEqual(await result.locator(".section-label").allTextContents(),[
    "Your Choices","Return to the philosopher","A question to carry forward"]);
   assert.equal(await result.locator(".reading-source blockquote").count(),1);
   assert.equal(await result.locator(".reading-question .reflection").count(),1);
   assert.equal(await result.locator(".memory-reference").count(),qa?1:0);
   assert.equal(await result.locator(".founder-qa").count(),qa?1:0);
   assert.equal(await result.evaluate(el=>el===document.activeElement),true);
   assert.equal(await result.locator("dl").getAttribute("aria-label"),"The philosophical distinction");
   assert.equal(await result.getByRole("definition").count(),2);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await verifyEnding("Annie Dillard");

  // Revisiting the choices preserves earlier input but permits new consequences.
  await page.locator('[data-back="exercise"]').click();
  assert.equal(await page.locator("main").getAttribute("data-screen"),"exercise");
  assert.equal(await page.locator('[data-motive][data-value="planned"]').getAttribute("aria-pressed"),"true");
  await page.locator('[data-motive][data-value="interrupted"]').click();
  await run.click();
  assert.match(await page.locator(".reading-self h2").innerText(),/Every hour/);
  await verifyEnding("Annie Dillard");

  await page.locator('[data-mode="kierkegaard"]').click();
  assert.equal(await page.locator("main").getAttribute("data-screen"),"entry");
  await page.locator('[data-discover="kierkegaard"]').click();
  assert.equal(await page.locator(".intro-cta").innerText(),"Explore this decision");
  assert.equal(await page.locator("[data-start]").count(),0);
  await page.locator("[data-enter]").click();
  await page.locator("[data-start]").click();
  const pick=async(stage,value)=>page.locator('[data-fork-choice="'+stage+'"][data-value="'+value+'"]').click();
  await pick("resource","change");
  assert.equal(await page.locator('[data-fork-choice="action"]').count(),0);
  await pick("barrier","surprise");
  await pick("action","adapt");
  await run.click();
  assert.match(await page.locator(".reading-self h2").innerText(),/friends/);
  await verifyEnding("Søren Kierkegaard");

  await page.locator('[data-back="exercise"]').click();
  await page.locator("[data-reset]").click();
  assert.equal(await page.locator('[data-fork-choice]').count(),0);
  await page.locator("[data-start]").click();
  await pick("resource","stay");
  await pick("barrier","surprise");
  await pick("action","adapt");
  await run.click();
  assert.match(await page.locator(".reading-self h2").innerText(),/familiar job/);
  await verifyEnding("Søren Kierkegaard");

  await page.goto(new URL("encounter-expression-qa.html",url).href+"#qa-reflection");
  await page.reload(); // Fragment navigation alone preserves the prior in-memory Encounter state.
  assert.equal(await page.locator("main").getAttribute("data-screen"),"entry");
  await page.locator('[data-discover="dillard"]').click();
  await page.locator("[data-enter]").click();
  await page.locator('[data-motive][data-value="planned"]').click();
  await run.click();
  await verifyEnding("Annie Dillard",true);
  assert.match(await page.locator(".memory-reference").innerText(),/sample reflection/i);
  assert.ok((await page.locator(".founder-qa").getAttribute("open"))===null);

  await page.emulateMedia({reducedMotion:"reduce"});
  await page.locator('[data-back="exercise"]').click();
  await page.locator('[data-back="intro"]').click();
  assert.equal(await page.locator(".intro-scenario").evaluate(el=>getComputedStyle(el).animationName),"none");

  await page.goto(new URL("encounter-expression-qa.html",url).href);
  await page.locator('[data-discover="dillard"]').click();
  await page.locator("[data-enter]").click();
  await page.locator('[data-motive][data-value="interrupted"]').click();
  await run.click();
  assert.deepEqual(await page.locator(".voice-grid article small").allTextContents(),["reflective","surprising","playful","challenging"]);
  assert.equal(await page.locator(".expression-lab details").count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  if(url.startsWith("file:"))assert.deepEqual(network,[]);
  console.log(width+"px: immersive intro, mechanism, three-panel reading, history and controls passed");
  await page.close();
 }
} finally {await browser.close();}
