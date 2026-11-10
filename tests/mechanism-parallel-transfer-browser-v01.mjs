import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {resolve,dirname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {mkdir} from "node:fs/promises";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const pageUrl=pathToFileURL(resolve(root,"experiments/mechanism-parallel-transfer-lab-v01-standalone.html")).href;
const shots=resolve(root,"test-results/cz116-transfer");
await mkdir(shots,{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox","--allow-file-access-from-files"]});
try{
 for(const width of [320,390,768,1024]){
  const ctx=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:width<600?2:1,isMobile:width<600,hasTouch:width<600});
  const page=await ctx.newPage(),errors=[],remote=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
  await page.goto(pageUrl,{waitUntil:"load"});
  await page.getByRole("tab",{name:/Trade-Off/}).waitFor();
  assert.equal(await page.locator("#cases .case").count(),2);
  assert.match(await page.locator('[data-id="dillard"] .quote').innerText(),/How we spend our days/);
  assert.match(await page.locator("#matrix").innerText(),/rejected_false_dilemma/);
  assert.equal(await page.locator("#cases [data-range]").count(),6);
  assert.equal(await page.locator("#cases [data-fork-choice]").count(),0);
  // Both panels must share a genuine state-preserving slider kernel.
  const dragged=page.locator("#seneca-range-0");
  await dragged.evaluate(el=>{el.value="4";el.dispatchEvent(new Event("input",{bubbles:true}));});
  assert.equal(await dragged.evaluate(el=>el.isConnected),true,"Slider must remain mounted for finger-drag");
  assert.equal(await page.locator("#seneca-hour-0").innerText(),"2h");
  await page.locator('[data-motive="seneca"][data-value="necessary"]').click();
  await page.locator('[data-sync="dillard"]').click();
  assert.equal(await page.locator("#dillard-hour-0").innerText(),"2h");
  const same=await page.evaluate(()=>window.__transferLab.active.cases);
  assert.deepEqual(same.seneca.ticks,same.dillard.ticks);
  assert.equal(same.seneca.motivation,same.dillard.motivation);
  await page.locator('[data-run="seneca"]').click();
  await page.locator('[data-run="dillard"]').click();
  const result=await page.evaluate(()=>window.__transferLab.active.cases);
  assert.equal(result.seneca.result.quote.id,49);
  assert.equal(result.dillard.result.quote.id,12);
  assert.deepEqual(result.seneca.result.fields.hours,result.dillard.result.fields.hours);
  assert.notEqual(result.seneca.result.interpretation,result.dillard.result.interpretation);
  assert.equal(result.dillard.result.fields.conditionalFiveWeekdays.reduce((a,b)=>a+b,0),15);
  assert.equal(await page.locator('[data-id="dillard"] .result').count(),1);
  await page.screenshot({path:resolve(shots,"tradeoff-"+width+".png"),fullPage:true});
  // Existing Woolf, new Wollstonecraft, and boundary stress Kierkegaard use same branching UI.
  await page.getByRole("tab",{name:/Decision Map/}).click();
  assert.equal(await page.locator("#cases .case").count(),3);
  for(const id of ["woolf","wollstonecraft","kierkegaard"]){
   assert.equal(await page.locator('[data-id="'+id+'"] [data-fork-choice]').count(),0);
   assert.equal(await page.locator('[data-id="'+id+'"] [data-run]').count(),0);
   await page.locator('[data-start="'+id+'"]').click();
   assert.equal(await page.locator('[data-id="'+id+'"] [data-fork-choice]').count(),2);
   const first=id==="woolf"?"income":id==="wollstonecraft"?"education":"change";
   const second=id==="woolf"?"space":id==="wollstonecraft"?"exclusion":"surprise";
   const third=id==="woolf"?"protect":id==="wollstonecraft"?"challenge":"adapt";
   await page.locator('[data-case="'+id+'"][data-fork-choice="resource"][data-value="'+first+'"]').click();
   assert.equal(await page.locator('[data-id="'+id+'"] [data-fork-choice]').count(),4);
   await page.locator('[data-case="'+id+'"][data-fork-choice="barrier"][data-value="'+second+'"]').click();
   assert.equal(await page.locator('[data-id="'+id+'"] [data-fork-choice]').count(),6);
   assert.equal(await page.locator('[data-id="'+id+'"] [data-run]').count(),0);
   await page.locator('[data-case="'+id+'"][data-fork-choice="action"][data-value="'+third+'"]').click();
   assert.equal(await page.locator('[data-id="'+id+'"] [data-run]').count(),1);
   assert.equal(await page.locator('[data-id="'+id+'"] [aria-pressed="true"].branch').count(),3);
   await page.locator('[data-run="'+id+'"]').click();
   const r=await page.evaluate(id=>window.__transferLab.active.cases[id].result,id);
   assert.equal(r.selected.length,3);
   assert.equal(r.productionEligible,false);
   assert.equal(r.outcomePredicted,false);
   if(id==="woolf")assert.ok(r.referenceInsight);
   if(id==="wollstonecraft")assert.match(r.semanticTransfer,/conditional_enabling_condition/);
   if(id==="kierkegaard")assert.equal(r.semanticTransfer,"UI_only_temporal_asymmetry_needs_new_kernel");
  }
  await page.screenshot({path:resolve(shots,"decisionmap-"+width+".png"),fullPage:true});
  // Mutating an earlier fork invalidates all dependent paths.
  await page.locator('[data-case="wollstonecraft"][data-fork-choice="resource"][data-value="voice"]').click();
  const changed=await page.evaluate(()=>window.__transferLab.active.cases.wollstonecraft);
  assert.equal(changed.resource,"voice");
  assert.equal(changed.barrier,null);
  assert.equal(changed.action,null);
  assert.equal(changed.stage,2);
  assert.equal(changed.result,null);
  assert.equal(await page.locator('[data-id="wollstonecraft"] .result').count(),0);
  await page.locator('[data-reset="kierkegaard"]').click();
  assert.equal(await page.locator('[data-id="kierkegaard"] [data-fork-choice]').count(),0);
  assert.equal(await page.locator('[data-id="kierkegaard"] .result').count(),0);
  assert.deepEqual(errors,[],"JS errors "+width);
  assert.deepEqual(remote,[],"No network requests allowed in offline prototype");
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2),false,"Horizontal scroll "+width);
  process.stdout.write("PASS CZ-116 "+width+"px: matched sliders, separate source meaning, all three staged maps, no-fit control, dependency reset\n");
  await ctx.close();
 }
}finally{await browser.close();}
