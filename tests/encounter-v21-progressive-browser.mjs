import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {mkdirSync} from "node:fs";
const browser=await chromium.launch({channel:"chrome",args:["--no-sandbox"]});
const file=new URL("../experiments/encounter-v21-progressive.html",import.meta.url).href;
const screenshotDir=new URL("../artifacts/",import.meta.url);
mkdirSync(screenshotDir,{recursive:true});
const start=async page=>{await page.goto(file);assert.match(await page.locator("#dilemma-situation").innerText(),/three free hours/i);assert.match(await page.locator("#dilemma-decision").innerText(),/each token means 30 minutes/i);assert.match(await page.locator("#dilemma-discovery").innerText(),/Dillard/i);};
async function assessStage(page,visible){
 for(const [i,id] of ["choice-card","teaching-card","last-card"].entries())
  assert.equal(await page.locator("#"+id).isVisible(),i<=visible,id+" expected reveal "+visible);
}
async function swipeChoice(page,index){
 const b=page.locator('#swipe-choices [data-choice="'+index+'"]');
 assert.equal(await b.isVisible(),true,"Expected personal decision "+index);
 await b.click();
}
async function exploreDevelopment(page,index){
 const b=page.locator('#development-options [data-development="'+index+'"]');
 assert.equal(await b.isVisible(),true,"Expected authored scenario to explore "+index);
 await b.click();
}
try{
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const pageErrors=[],network=[];
  page.on("pageerror",e=>pageErrors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  await start(page);
  assert.equal(await page.locator("#start-label").innerText(),"Allocate your three hours");
  await page.locator(".capability-note summary").click();
  assert.match(await page.locator(".capability-note").innerText(),/no-fit for this pilot/);
  await page.locator(".capability-note summary").click();
  // Preserve functioning Token Studio and render canonical, non-psychometric bars.
  await page.locator("#start").click();
  for(const [i,n] of [[0,3],[1,1],[2,2]])
   for(let j=0;j<n;j++)await page.locator('[data-add="'+i+'"]').click();
  assert.equal(await page.locator("#remaining-value").innerText(),"0 hours");
  await page.locator("#submit").click();
  await assessStage(page,0);
  assert.match(await page.locator("#choice-dashboard").innerText(),/1.5 hours/);
  assert.match(await page.locator("#choice-dashboard").innerText(),/0.5 hours/);
  assert.match(await page.locator("#choice-dashboard").innerText(),/1 hour/);
  assert.equal(await page.locator("#reveal-next").innerText(),"Continue to the philosopher →");
  await page.locator("#reveal-next").click();await assessStage(page,1);
  assert.match(await page.locator("#teaching-text").innerText(),/Dillard/);
  await page.locator("#reveal-back").click();await assessStage(page,0);
  await page.locator("#reveal-next").click();
  await page.locator("#reveal-next").click();await assessStage(page,2);
  await page.locator("#reveal-all").click();await assessStage(page,2);
  assert.match(await page.locator("#reveal-status").innerText(),/All three/);
  if(width===390)await page.screenshot({path:new URL("cz140-token-manuscript-390.png",screenshotDir).pathname,fullPage:true});
  await page.locator("#edit").click();assert.equal(await page.locator("#result").isVisible(),false);
  assert.equal((await page.evaluate(()=>window.__YL_V21_TEST.getState())).resultStatus,null);
  await page.locator("#reset").click();
  await page.locator('[data-add="2"]').click();
  assert.equal(await page.locator("#submit").isDisabled(),true);
  // Navigate to separate, manually chosen Kierkegaard mini-game.
  await page.locator("#to-intro").click();
  await page.locator("#choose-swipe").click();
  assert.match(await page.locator("#intro-quote").innerText(),/Life can only be understood backwards/);
  assert.match(await page.locator("#quote-rendering-note").innerText(),/shortened English paraphrase/i);
  assert.match(await page.locator("#dilemma-decision").innerText(),/Stay or take the new job/);
  assert.match(await page.locator("#dilemma-discovery").innerText(),/Kierkegaard/);
  assert.equal(await page.locator("#start-label").innerText(),"Make your first decision");
  await page.locator("#start").click();
  assert.equal(await page.locator("#swipe-card").isVisible(),true);
  assert.equal(await page.locator("#swipe-choices button").count(),2);
  const first=await page.locator("#swipe-choices").innerText();
  assert.match(first,/new job/);assert.match(first,/current job/);
  await swipeChoice(page,0); // change
  assert.equal(await page.locator("#swipe-card").isVisible(),false,"An external event must not masquerade as a swipeable decision");
  assert.equal(await page.locator("#development-explorer").isVisible(),true);
  assert.match(await page.locator("#swipe-stage-label").innerText(),/SOMETHING HAPPENS/);
  assert.match(await page.locator("#agency-step-explainer").innerText(),/not something you choose/i);
  const second=await page.locator("#development-options").innerText();
  assert.match(second,/harder/);assert.doesNotMatch(second,/wondering about the offer/);
  assert.match(second,/NOT YOUR ACTION/);
  const spoofed=await page.evaluate(()=>window.__YL_CZ140_TEST.tryAgencySpoof());
  assert.equal(spoofed,false,"A decision-channel submission must be rejected at an authored development");
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["change"]);
  assert.equal((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path.join("/"),"change");
  await page.locator("#theme-b").click();
  assert.equal((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path.join("/"),"change");
  assert.equal(await page.locator("body").getAttribute("data-theme"),"observatory");
  await exploreDevelopment(page,0); // explore authored risk; not a personal action
  assert.match(await page.locator("#swipe-event").innerText(),/hypothetical|prediction/);
  const third=await page.locator("#swipe-choices").innerText();assert.match(third,/more time/);
  // Clicking an earlier step drops all later nodes rather than retaining stale history.
  await page.locator('[data-rewind="0"]').click();
  const afterRewind=await page.evaluate(()=>window.__YL_CZ140_TEST.getState());
  assert.deepEqual(afterRewind.path,[]);assert.equal(afterRewind.lastResultStatus,null);
  // Rebuild a second valid independent route: stay, missed, reflect.
  await swipeChoice(page,1);
  const staySecond=await page.locator("#development-options").innerText();
  assert.match(staySecond,/wondering about the offer/);
  assert.doesNotMatch(staySecond,/harder than/);
  await exploreDevelopment(page,0);await swipeChoice(page,0);
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["stay","missed","reflect"]);
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState().audit.trail.map(x=>x.role))),
   ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
  assert.equal(await page.locator("#swipe-finish").isVisible(),true);
  assert.equal(await page.evaluate(()=>document.activeElement?.id),"swipe-finish","Completed swipe path should focus the submit control");
  await page.locator("#swipe-finish").click();
  assert.equal((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).lastResultStatus,"ready");
  assert.match(await page.locator("#choice-dashboard").innerText(),/stay in your current job/i);
  assert.match(await page.locator("#choice-dashboard").innerText(),/AUTHORED EVENT/);
  assert.match(await page.locator("#choice-dashboard").innerText(),/RETROSPECTIVE UNDERSTANDING/);
  assert.equal(await page.locator('#choice-dashboard [data-agency-role="AUTHORED_DEVELOPMENT"]').count(),1);
  assert.equal(await page.locator('#choice-dashboard [data-agency-role="RETROSPECTIVE_INTERPRETATION"]').count(),1);
  assert.match(await page.locator("#choice-text").innerText(),/stay in your current job/i);
  assert.match(await page.locator("#source-detail").textContent(),/Journal JJ:167/);
  await assessStage(page,0);
  await page.locator("#reveal-next").click();await assessStage(page,1);
  assert.match(await page.locator("#teaching-text").innerText(),/Kierkegaard/);
  assert.match(await page.locator("#result-quote-note").innerText(),/not a verbatim/i);
  await page.locator("#reveal-next").click();await assessStage(page,2);
  assert.match(await page.locator("#ending-text").innerText(),/future|job|Mondays/i);
  if(width===390)await page.screenshot({path:new URL("cz140-swipe-observatory-390.png",screenshotDir).pathname,fullPage:true});
  const endingStay=await page.locator("#ending-text").innerText();
  await page.locator("#edit").click();
  await page.locator("#swipe-back").click();
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["stay","missed"]);
  await page.locator("#swipe-reset").click();
  // Real pointer gesture: left swipe selects first card.
  const card=page.locator("#swipe-card"),rect=await card.boundingBox();
  assert.ok(rect);
  await page.mouse.move(rect.x+rect.width*.72,rect.y+rect.height*.54);
  await page.mouse.down();await page.mouse.move(rect.x+rect.width*.27,rect.y+rect.height*.54,{steps:10});await page.mouse.up();
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["change"]);
  // A scenario event is explored with buttons, not a second swipe.
  assert.equal(await page.locator("#swipe-card").isVisible(),false);
  await exploreDevelopment(page,1);
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["change","surprise"]);
  await page.locator("#swipe-card").focus();await page.keyboard.press("ArrowLeft"); // genuine response decision
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["change","surprise","adapt"]);
  await page.locator("#swipe-back").click();await page.locator("#swipe-back").click();
  assert.deepEqual((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).path,["change"]);
  await exploreDevelopment(page,0);await swipeChoice(page,0); // risk, continue
  await page.locator("#swipe-finish").click();
  assert.equal((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).lastResultStatus,"ready");
  assert.match(await page.locator("#choice-text").innerText(),/take the new job/i);
  assert.match(await page.locator("#choice-text").innerText(),/harder/i);
  assert.notEqual(await page.locator("#ending-text").innerText(),endingStay,"different paths must have different source-grounded endings");
  assert.match(await page.locator("#research-notice").innerText(),/provisional/i);
  // Switching back to Token Studio cannot leave a Kierkegaard source label or an old result.
  await page.locator("#edit").click();
  await page.locator("#to-intro").click();
  await page.locator("#choose-token").click();
  assert.match(await page.locator("#result-quote").innerText(),/How we spend our days/);
  assert.match(await page.locator("#research-notice").innerText(),/Dillard/);
  assert.equal(await page.locator("#thinker-name").innerText(),"Annie Dillard");
  assert.equal((await page.evaluate(()=>window.__YL_CZ140_TEST.getState())).mode,"token");
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)),"Horizontal overflow "+width);
  assert.equal(network.length,0,"Unexpected network "+network.join(", "));
  assert.equal(pageErrors.length,0,"Page errors "+pageErrors.join("; "));
  await page.close();
 }
 // Independent engine-path review: enumerate every authored 3-choice route.
 const page=await browser.newPage();
 await page.goto(file);
 const audit=await page.evaluate(()=>{
  const E=window.YL_ENCOUNTER_ENGINE,m=E.semanticCases.kierkegaard.model;
  const routes=[];function walk(key,path){if(key===null){routes.push(path);return;}
   const node=m.nodes[key];if(!node)throw Error("Broken authored dependency: "+key);
   for(const o of node.options)walk(o.next,[...path,o.id]);
  }walk(m.start,[]);
  return routes.map(path=>{
   const packet=E.reasonSemantically(E.semanticCases.kierkegaard,{path});
   const result=packet.status==="ready"?E.renderEncounterV20(packet):{status:packet.status,reason:packet.reason};
   return {path,status:result.status,reason:result.reason??null,words:result.wordCount??null,source:result.source_review??null};
  });
 });
 console.log("CZ140-AUTHORED-PATHS "+JSON.stringify(audit));
 assert.equal(audit.length,8,"Two meaningful branches at three successive steps");
 assert.ok(audit.every(x=>x.status==="ready"),"Every authored path should render READY: "+JSON.stringify(audit.filter(x=>x.status!=="ready")));
 const incompatible=await page.evaluate(()=>{
  const E=window.YL_ENCOUNTER_ENGINE;
  const invalid=E.reasonSemantically(E.semanticCases.kierkegaard,{path:["change","missed","reflect"]});
  return invalid.status;
 });
 assert.notEqual(incompatible,"ready","Wrong-dependent route cannot reach interpretation");
 await page.close();
}finally{await browser.close();}
console.log("CZ140-BROWSER: 3 mobile viewports, agency-specific authored event explorer, forbidden spoof channel, pointer swipe on actual decisions, keyboard response, rewind, three-role retrospective dashboard, progressive results, 8 authored routes, zero network PASS. Chromium only, not physical Safari.");
