/**
 * CZ-110 three-encounter lab: mobile Chrome E2E smoke tests.
 * No app production, database, account, AI or external service used.
 */
import {chromium} from "playwright-core";
import {resolve,dirname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {mkdir} from "node:fs/promises";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const url=pathToFileURL(resolve(root,"experiments/three-encounter-lab-v01.html")).href;
await mkdir(resolve(root,"test-results/three-encounter"),{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox","--allow-file-access-from-files"]});
try{
 for(const width of [320,390,768]){
  const context=await browser.newContext({viewport:{width,height:800},isMobile:width<741,hasTouch:width<741,deviceScaleFactor:1});
  const page=await context.newPage();
  const jsErrors=[],requests=[];
  page.on("pageerror",err=>jsErrors.push(err.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(url,{waitUntil:"load"});
  await page.getByRole("tab",{name:/Trade-Off/}).waitFor();
  assert.match(await page.locator("#quote").innerText(),/Seneca/,"Page errors: "+JSON.stringify(jsErrors));
  assert.equal(await page.locator(".field .number").count(),3);
  let input=await page.locator("#interactive").innerText();
  assert.match(input,/three genuinely free hours tonight/);
  // Change a live slider repeatedly without replacing the captured DOM node.
  const first=page.locator("#range-0");
  const before=await first.evaluate(el=>el);
  await first.evaluate(el=>{el.value="6";el.dispatchEvent(new Event("input",{bubbles:true}));});
  assert.equal(await page.locator("#time-0").innerText(),"3h");
  assert.equal(await page.locator("#time-1").innerText(),"0h");
  assert.equal(await page.locator("#time-2").innerText(),"0h");
  assert.equal(await first.evaluate(el=>el.isConnected),true);
  await first.evaluate(el=>{el.value="4";el.dispatchEvent(new Event("input",{bubbles:true}));});
  assert.equal(await first.evaluate(el=>el.isConnected),true);
  assert.equal(await page.locator("#time-0").innerText(),"2h");
  const sum=await page.locator(".number").allInnerTexts();
  assert.equal(sum.map(v=>Number.parseFloat(v)).reduce((a,b)=>a+b,0),3);
  await page.getByRole("button",{name:/Someone expects it of me/}).click();
  await page.getByRole("button",{name:"Reveal my discovery"}).click();
  assert.equal(await page.locator("#result").isVisible(),true);
  assert.match(await page.locator("#result").innerText(),/philosophical connection/i);
  let packet=await page.evaluate(()=>window.__lastInsightPacket);
  assert.equal(packet.quoteId,49);
  assert.equal(packet.mechanic,"seneca");
  assert.equal(packet.expressionEligible,"prototype_only");
  assert.equal(packet.notTruthScore,true);
  assert.ok(packet.centralDiscovery.length>80);
  assert.ok(packet.uncertaintyLimit.length>50);
  await page.locator("#result summary").click();
  assert.match(await page.locator("#result pre").innerText(),/quoteId/);
  // Woolf: same barrier as improved resource tests partial, not magical fix.
  await page.getByRole("tab",{name:/Decision Map/}).click();
  assert.match(await page.locator("#quote").innerText(),/Virginia Woolf/);
  await page.getByRole("button",{name:/A room of her own/}).click();
  await page.getByRole("button",{name:/Interruptions and shared space/}).click();
  await page.getByRole("button",{name:/Challenge a structural barrier/}).click();
  await page.getByRole("button",{name:"Reveal my discovery"}).click();
  assert.match(await page.locator("#result").innerText(),/One improvement isn't the same as removing a barrier/);
  packet=await page.evaluate(()=>window.__lastInsightPacket);
  assert.equal(packet.quoteId,28);
  assert.match(packet.centralDiscovery,/fragile/);
  assert.match(packet.philosophicalJustification,/Woolf/);
  // Aristotle: scope changes the inference with the SAME case.
  await page.getByRole("tab",{name:/Counterexample/}).click();
  assert.match(await page.locator("#quote").innerText(),/Aristotle/);
  await page.getByRole("button",{name:/Every person, at every moment/}).click();
  await page.getByRole("button",{name:/Someone loses interest in a lesson/}).click();
  await page.getByRole("button",{name:"Reveal my discovery"}).click();
  packet=await page.evaluate(()=>window.__lastInsightPacket);
  assert.equal(packet.derivedCategory,"conditional-refutation");
  assert.match(packet.centralDiscovery,/artificially strengthened/);
  await page.getByRole("button",{name:"Try another path"}).click();
  await page.getByRole("button",{name:/By nature, humans tend to seek knowledge/}).click();
  await page.getByRole("button",{name:"Reveal my discovery"}).click();
  packet=await page.evaluate(()=>window.__lastInsightPacket);
  assert.equal(packet.derivedCategory,"not-a-dispositional-refutation");
  assert.match(packet.centralDiscovery,/not remove a general human capacity/);
  // No scroll overflow or runtime/network errors anywhere in the lab.
  const hasOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
  assert.equal(hasOverflow,false,"Horizontal overflow at "+width+"px");
  assert.deepEqual(jsErrors,[],"Script errors at "+width+"px");
  assert.deepEqual(requests,[],"External requests at "+width+"px");
  await page.screenshot({path:resolve(root,"test-results/three-encounter/screen-"+width+".png"),fullPage:true});
  process.stdout.write("PASS three encounters "+width+"px: Seneca, Woolf, Aristotle; distinct reasoning; no overflow/network/errors\n");
  await context.close();
 }
}finally{await browser.close();}
