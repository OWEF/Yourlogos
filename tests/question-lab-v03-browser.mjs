import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {resolve,dirname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {mkdir} from "node:fs/promises";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const url=pathToFileURL(resolve(root,"experiments/two-encounter-question-lab-v03-standalone.html")).href;
const screenshots=resolve(root,"test-results/cz112-v03");
await mkdir(screenshots,{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox","--allow-file-access-from-files"]});
try{
 for(const width of [320,390,768]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:width<741?2:1,isMobile:width<741,hasTouch:width<741});
  const page=await context.newPage();
  const runtimeErrors=[],externalRequests=[];
  page.on("pageerror",e=>runtimeErrors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))externalRequests.push(r.url());});
  await page.goto(url,{waitUntil:"load"});
  await page.getByRole("tab",{name:/Trade-Off/}).waitFor();
  assert.equal(await page.getByRole("tab").count(),2);
  assert.match(await page.locator("#quote").innerText(),/Seneca/i);
  assert.match(await page.locator("#interactive").innerText(),/three genuinely free hours tonight/);
  const first=page.locator("#range-0");
  await first.evaluate(el=>{el.value="6";el.dispatchEvent(new Event("input",{bubbles:true}));});
  assert.equal(await first.evaluate(el=>el.isConnected),true);
  assert.equal((await page.locator(".field .number").allInnerTexts()).map(Number.parseFloat).reduce((a,b)=>a+b,0),3);
  await page.getByRole("button",{name:/I considered it necessary/}).click();
  await page.getByRole("button",{name:"Discover the question"}).click();
  assert.equal(await page.locator("#result").isVisible(),true);
  assert.equal(await page.locator("#result .headline").innerText(),"When did optional become necessary?");
  let r=await page.evaluate(()=>window.__encounterDebug);
  assert.equal(r.packet.quote.id,49);
  assert.equal(r.expression.quoteId,49);
  assert.equal(r.expression.questionMode,"offer_question");
  assert.equal(r.expression.debug.fiveLayers.philosophicalTension.kind,"optional_necessary_tension");
  assert.equal(r.expression.debug.fiveLayers.personalRelevance.emotionalState,"not_inferred");
  assert.equal(await page.locator("#result .stack>span").count(),3);
  assert.equal(await page.locator("#result details[open]").count(),0);
  await page.screenshot({path:resolve(screenshots,"seneca-question-"+width+".png"),fullPage:true});
  await page.getByRole("button",{name:"I'm curious"}).click();
  r=await page.evaluate(()=>window.__encounterDebug);
  assert.match(r.expression.title,/consequences|commitments|expectations/i);
  await page.getByRole("button",{name:"This feels right"}).click();
  r=await page.evaluate(()=>window.__encounterDebug);
  assert.equal(r.expression.questionMode,"close");
  assert.equal(r.expression.selectedQuestion,null);
  assert.ok(r.expression.closingNote);
  assert.match(await page.locator("#result").innerText(),/leave the question here/i);

  await page.getByRole("tab",{name:/Decision Map/}).click();
  assert.match(await page.locator("#quote").innerText(),/Woolf/i);
  assert.match(await page.locator("#interactive").innerText(),/She earns her own money/);
  assert.doesNotMatch(await page.locator("#interactive").innerText(),/Institutional exclusion|Financial insecurity|Material independence/);
  await page.getByRole("button",{name:/She earns her own money/}).click();
  await page.getByRole("button",{name:/People keep interrupting her/}).click();
  await page.getByRole("button",{name:/She challenges the rules/}).click();
  await page.getByRole("button",{name:"Discover the question"}).click();
  r=await page.evaluate(()=>window.__encounterDebug);
  assert.equal(r.packet.quote.id,28);
  assert.equal(r.expression.visual.type,"mindmap");
  assert.equal(await page.locator(".mindmap .map-node").count(),6);
  assert.equal(await page.locator(".mindmap svg .map-edge").count(),3); // each curved path draws two meaningful connections
  assert.equal(await page.locator(".mindmap button[data-map-node=barrier]").getAttribute("aria-pressed"),"true");
  await page.locator(".mindmap button[data-map-node=possibility]").click();
  assert.equal(await page.locator(".mindmap button[data-map-node=possibility]").getAttribute("aria-pressed"),"true");
  assert.match(await page.locator("#map-explanation").innerText(),/not a prediction/);
  await page.screenshot({path:resolve(screenshots,"woolf-map-"+width+".png"),fullPage:true});
  await page.getByRole("button",{name:"Try another path"}).click();
  await page.getByRole("button",{name:/She finally gets a quiet room/}).click();
  await page.getByRole("button",{name:/She still cannot pay her bills/}).click();
  await page.getByRole("button",{name:"Discover the question"}).click();
  const alternate=await page.evaluate(()=>window.__encounterDebug);
  assert.notEqual(alternate.expression.title,r.expression.title);
  assert.equal(alternate.expression.visual.nodes.find(n=>n.id==="gain").label,"She gets a room to write");
  await page.getByRole("button",{name:"Something feels unresolved"}).click();
  const uneasy=await page.evaluate(()=>window.__encounterDebug);
  assert.equal(uneasy.expression.reaction,"unsettled");
  assert.equal(uneasy.expression.debug.fiveLayers.personalRelevance.reactionSource,"explicit_user_feedback");
  assert.notEqual(uneasy.expression.title,alternate.expression.title);

  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2),false,
    "Horizontal overflow at "+width+" px");
  assert.deepEqual(runtimeErrors,[],"Browser errors at "+width);
  assert.deepEqual(externalRequests,[],"Unexpected network calls at "+width);
  process.stdout.write("PASS CZ-112 "+width+"px: conditional question, positive close, mindmap nodes, new language, no overflow/errors\n");
  await context.close();
 }
}finally{await browser.close();}
