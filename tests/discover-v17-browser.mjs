import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});
await mkdir('design-review',{recursive:true});
const results=[];
try {
 for(const width of [320,390,430,1024]) for(const id of ['money','workshop','apology','evidence']) {
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(pathToFileURL(resolve('experiments/discover-v17.html')).href+'#encounter='+id);
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${id}/${width}: overflow`);
  await noOverflow();
  await page.locator('[data-like]').click();
  assert.equal(await page.locator('[data-like]').getAttribute('aria-pressed'),'true');
  assert.ok(await page.locator('[data-discover]').isVisible());
  await page.locator('[data-discover]').click();
  assert.equal(await page.locator('.intro-quote').count(),1);
  assert.equal(await page.locator('.intro-scenario').count(),1);
  assert.equal(await page.locator('[data-enter]').count(),1);
  assert.equal(await page.locator('select,pre,.founder-qa,.expression-lab').count(),0);
  assert.ok(await page.locator('.intro-view').evaluate(el=>el===document.activeElement));
  await noOverflow();
  if(width===390)await page.screenshot({path:`design-review/v18-${id}-intro.png`,fullPage:true});
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('[data-discover]').isVisible());
  await page.locator('[data-discover]').click();
  await page.locator('[data-enter]').focus();await page.keyboard.press('Enter');
  if(['money','workshop'].includes(id)) {
   const range=page.locator('[data-k-slider="amounts"]').first();
   const old=await range.inputValue();
   await range.fill('0');await range.dispatchEvent('input');
   if(id==='workshop'){assert.ok(await page.locator('[data-test-allocation]').isEnabled());assert.equal(await page.locator('[data-k-slider="amounts"]').last().inputValue(),'4');}
   await range.fill(old);await range.dispatchEvent('input');
   await page.locator('[data-test-allocation]').click();
   assert.ok(await page.locator('.reconsider').isVisible());
   assert.ok(await page.locator('[data-run]').evaluate(el=>el===document.activeElement));
   assert.ok(await page.locator('.reconsider').innerText().then(x=>x.includes('A new condition in this imagined scenario')));
   if(id==='money'){
    await range.fill('4');await range.dispatchEvent('input');
    const last=page.locator('[data-k-slider="amounts"]').last();const oldLast=await last.inputValue();
    await last.fill('3');await last.dispatchEvent('input');
    assert.ok(await page.locator('[data-run]').isDisabled());
    await range.fill(old);await range.dispatchEvent('input');await last.fill(oldLast);await last.dispatchEvent('input');
   }else{
    // The newly declared press limit makes the first [3,1] assignment invalid.
    assert.ok(await page.locator('[data-run]').isDisabled());
    await range.fill('2');await range.dispatchEvent('input');
    assert.equal(await page.locator('[data-k-slider="amounts"]').last().inputValue(),'2');
    assert.ok(await page.locator('[data-run]').isEnabled());
   }
  } else {
   assert.equal(await page.locator('[data-run]').count(),0);
   await page.locator('[data-k-step="0"]').first().click();
   assert.equal(await page.locator('[data-run]').count(),0);
   await page.locator('[data-k-step="1"]').last().click();
   await page.locator('[data-k-step="0"]').last().click();
   assert.equal(await page.locator('[data-run]').count(),0);
   assert.equal(await page.locator('[data-k-step="1"][aria-pressed="true"]').count(),0);
   await page.locator('[data-k-step="1"]').last().click();
  }
  await noOverflow();
  for(const control of await page.locator('.case-body button,.case-body input').all()){const box=await control.boundingBox();assert.ok(box.height>=44&&box.width>=44);}
  if(width===390)await page.screenshot({path:`design-review/v18-${id}-interaction.png`,fullPage:true});
  await page.locator('[data-run]').click();
  assert.equal(await page.locator('.reading-panel').count(),3);
  assert.equal(await page.locator('select,pre,.founder-qa,.expression-lab,.memory-reference').count(),0);
  assert.ok(await page.locator('.reading-question').innerText());
  assert.equal(await page.locator('.journey-finale').evaluate(el=>el.lastElementChild.classList.contains('reading-question')),true);
  await noOverflow();
  if(width===390)await page.screenshot({path:`design-review/v18-${id}-reading.png`,fullPage:true});
  await page.locator('[data-back="exercise"]').click();
  assert.ok(await page.locator('[data-run]').isVisible());
  await page.locator('[data-back="intro"]').click();await page.locator('[data-back="entry"]').click();
  assert.equal(await page.locator('[data-like]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  results.push({id,width,status:'PASS'});console.log(`PASS consumer ${id} ${width}`);
  await page.close();
 }
 assert.equal(results.length,16);
} finally {await writeFile('design-review/v18-browser-results.json',JSON.stringify(results,null,2));await browser.close();}
