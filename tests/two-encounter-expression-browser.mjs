import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {resolve,dirname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {mkdir} from "node:fs/promises";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const html=resolve(root,"experiments/two-encounter-insight-lab-v02-standalone.html");
const url=pathToFileURL(html).href;
const shots=resolve(root,"test-results/two-encounter-v02");
await mkdir(shots,{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox","--allow-file-access-from-files"]});
try{
 for(const width of [320,390,768]){
  const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:width<741?2:1,isMobile:width<741,hasTouch:width<741});
  const page=await ctx.newPage(),errors=[],requests=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(url,{waitUntil:"load"});
  await page.getByRole("tab",{name:/Trade-Off/}).waitFor();
  assert.match(await page.locator("#quote").innerText(),/Seneca/i);
  assert.equal(await page.getByRole("tab").count(),2,"Counterexample must remain deferred");
  assert.match(await page.locator("#interactive").innerText(),/three genuinely free hours tonight/);
  // A genuine time constraint, and a continuous iPhone slider interaction
  const slider=page.locator("#range-0");
  await slider.evaluate(el=>{el.value="4";el.dispatchEvent(new Event("input",{bubbles:true}));});
  assert.equal(await slider.evaluate(el=>el.isConnected),true);
  const amounts=await page.locator(".field .number").allInnerTexts();
  assert.equal(amounts.map(Number.parseFloat).reduce((a,b)=>a+b,0),3);
  await page.getByRole("button",{name:/Someone expected it/}).click();
  await page.getByRole("button",{name:"Reveal what this choice means"}).click();
  assert.equal(await page.locator("#result").isVisible(),true);
  let p=await page.evaluate(()=>window.__encounterDebug);
  assert.equal(p.packet.quote.id,49);
  assert.equal(p.expression.quoteId,49);
  assert.equal(p.packet.flags.productionEligible,false);
  assert.equal(p.expression.summary,p.packet.insight.discovery);
  assert.equal(p.expression.sourceLine,p.packet.insight.connection);
  assert.match(await page.locator("#result .headline").innerText(),/expectations/i);
  assert.equal(await page.locator("#result .lead").innerText(),p.packet.insight.discovery);
  assert.equal(await page.locator("#result .open-question").innerText(),p.packet.insight.question);
  // Detailed uncertainty is behind founder QA, not cluttering final user-facing flow
  assert.equal(await page.locator("#result details[open]").count(),0);
  assert.ok(p.packet.trace.rules.length>=3);
  assert.equal(await page.locator("#result .graph").count(),0);
  assert.equal(await page.locator("#result .stack").count(),1);
  await page.getByRole("button",{name:"Try another path"}).click();
  assert.equal(await page.locator("#result").isVisible(),false);
  // Woolf's branch must use identical Insight Packet and Expression Engine.
  await page.getByRole("tab",{name:/Decision Map/}).click();
  assert.match(await page.locator("#quote").innerText(),/Woolf/i);
  await page.getByRole("button",{name:/A room of her own/}).click();
  await page.getByRole("button",{name:/Interruptions and shared space/}).click();
  await page.getByRole("button",{name:/Challenge the barrier/}).click();
  await page.getByRole("button",{name:"Reveal what this choice means"}).click();
  p=await page.evaluate(()=>window.__encounterDebug);
  assert.equal(p.packet.quote.id,28);
  assert.equal(p.expression.quoteId,28);
  assert.equal(p.packet.mechanism,"decision_map");
  assert.match(p.packet.insight.ruleId,/incomplete_improvement/);
  assert.match(p.expression.summary,/fragile/);
  assert.match(p.expression.sourceLine,/Woolf/);
  assert.equal(await page.locator("#result .graph .node").count(),3);
  assert.equal(await page.locator("#result .lead").innerText(),p.expression.summary);
  await page.screenshot({path:resolve(shots,"woolf-"+width+".png"),fullPage:true});
  // A different barrier must yield a substantively different supported insight.
  await page.getByRole("button",{name:"Try another path"}).click();
  await page.getByRole("button",{name:/Institutional exclusion/}).click();
  await page.getByRole("button",{name:"Reveal what this choice means"}).click();
  const changed=await page.evaluate(()=>window.__encounterDebug);
  assert.notEqual(changed.expression.summary,p.expression.summary);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
  assert.equal(overflow,false,"Horizontal overflow "+width);
  assert.deepEqual(errors,[],"JS errors "+width);
  assert.deepEqual(requests,[],"Unexpected external requests "+width);
  process.stdout.write("PASS Insight→Expression iPhone lab "+width+"px: both routes, clear results, packet parity, visuals, no runtime errors\n");
  await ctx.close();
 }
}finally{await browser.close();}
