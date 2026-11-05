// CZ-80/81: local-first browser acceptance smoke with genuine app state.
// Uses only Node, the repository HTTP server, and Chrome DevTools (no AI calls).
import assert from "node:assert/strict";
import {spawn,execFileSync} from "node:child_process";
import {mkdtemp,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";

const port=33917,debugPort=33918,origin="http://127.0.0.1:"+port;
const artifact=process.env.CZ81_ARTIFACT_DIR||path.join(tmpdir(),"cz81-smoke-artifact");
const chromePath=["google-chrome","chromium","chromium-browser"].find(cmd=>{
 try{execFileSync("which",[cmd],{stdio:"ignore"});return true;}catch{return false}
});
assert.ok(chromePath,"Chrome/Chromium is required; do not pretend QA passed without browser");

const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
async function until(fn,label,tries=65){
 for(let i=0;i<tries;i++){
  try{const value=await fn();if(value)return value}catch{}
  await pause(250);
 }
 throw new Error("CZ81 browser smoke timeout: "+label);
}
function client(socket){
 let seq=1;
 const wait=new Map();
 socket.addEventListener("message",ev=>{
  const msg=JSON.parse(ev.data);
  if(msg.id&&wait.has(msg.id)){
    const {yes,no}=wait.get(msg.id);
    wait.delete(msg.id);
    if(msg.error)no(new Error(msg.error.message));else yes(msg.result);
  }
 });
 return (method,params={})=>{
  const id=seq++;
  return new Promise((yes,no)=>{
   wait.set(id,{yes,no});
   socket.send(JSON.stringify({id,method,params}));
  });
 };
}
const {mkdir}=await import("node:fs/promises");
await mkdir(artifact,{recursive:true});
const server=spawn(process.execPath,["server.mjs"],{env:{...process.env,PORT:String(port),YOURLOGOS_DISCOVER_AI_ENABLED:"false"},stdio:"ignore"});
const chrome=spawn(chromePath,[
 "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--no-first-run","--disable-extensions","--remote-debugging-port="+debugPort,
 "--user-data-dir="+await mkdtemp(path.join(tmpdir(),"yl-cz81-browser-")),
 "about:blank"
],{stdio:"ignore"});
let ws;
try{
 await until(async()=>{
  const r=await fetch(origin+"/api/health");return r.ok;
 },"local server startup");
 const page=await until(async()=>{
  const r=await fetch("http://127.0.0.1:"+debugPort+"/json/new?"+encodeURIComponent(origin+"/?cz80=preview&cz81=preview"),{method:"PUT"});
  return r.ok?await r.json():null;
 },"Chrome CDP target");
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await until(()=>ws.readyState===WebSocket.OPEN,"CDP WebSocket");
 const send=client(ws);
 await send("Runtime.enable");
 await send("Page.enable");
 await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const evalJS=async expression=>{
  const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails)throw new Error("Browser JS error: "+r.exceptionDetails.text);
  return r.result.value;
 };
 await until(()=>evalJS('Boolean(document.querySelector(\'[data-action="discover"]\'))'),"landing Encounter button");
 // First-run onboarding and the daily welcome overlay must be dismissed via
 // their actual UI. Otherwise headless Chrome can click invisible app controls.
 const introVisible=await evalJS("document.getElementById('yl-onboarding')?.hidden===false");
 if(introVisible){
  await evalJS("document.querySelector('[data-intro=back]').click();true");
  await until(()=>evalJS("document.getElementById('yl-onboarding')?.hidden===true"),"onboarding dismissed");
 }
 const entranceVisible=await evalJS("document.getElementById('yl-entrance')?.hidden===false");
 if(entranceVisible){
  await until(()=>evalJS("document.getElementById('yl-enter')?.disabled===false"),"welcome slider ready");
  await evalJS("document.getElementById('yl-enter').dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));true");
  await until(()=>evalJS("document.getElementById('yl-entrance')?.hidden===true"),"welcome slider completed");
 }
 assert.equal(await evalJS("document.getElementById('yl-onboarding')?.hidden"),true);
 assert.equal(await evalJS("document.getElementById('yl-entrance')?.hidden"),true);

 assert.equal(await evalJS('document.documentElement.dataset.cz80Preview'),"on");
 assert.equal(await evalJS('document.documentElement.dataset.cz81Preview'),"on");
 await evalJS('document.querySelector(\'[data-action="discover"]\').click();true');
 await until(()=>evalJS('Boolean(document.querySelector(".yl-living-companion .yl-logo-v3-rig"))'),"local LilLogo in real Encounter");
 await until(()=>evalJS('Boolean(document.querySelector(".yl-logo-v3-rig").contentDocument?.documentElement?.id==="lillogoLayeredRig")'),"original-art SVG loaded");
 await evalJS('document.querySelector(\'[data-action="thread-explore"]\').click();true');
 await until(()=>evalJS('Boolean(document.querySelector(\'[data-living^="focus:"]\'))'),"existing state-driven focus options");
 await evalJS('document.querySelector(\'[data-living^="focus:"]\').click();true');
 await until(()=>evalJS('document.querySelector(".discover-sheet")?.dataset.cz80Beat==="choice"'),"CZ80 genuine lens choice event");
 await until(()=>evalJS('document.querySelector(".yl-logo-v3-rig")?.contentDocument?.documentElement?.classList.contains("state-curious")'),"CZ81 rig consumes event");
 assert.equal(await evalJS('document.querySelector(".yl-living")?.dataset.livingPhase'),"mirror");
 assert.equal(await evalJS("document.getElementById('yl-onboarding')?.hidden && document.getElementById('yl-entrance')?.hidden"),true,"no intro overlays may hide the real Encounter");
 const screenshot=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
 const bytes=Buffer.from(screenshot.data,"base64");
 assert.ok(bytes.length>4000,"Screenshot unexpectedly small");
 await writeFile(path.join(artifact,"cz80-cz81-mobile-live.png"),bytes);
 // A separate, fully mocked consented AI path: no external DeepSeek requests,
 // but the real app state machine, consent choice and My World save are exercised.
 const mockSource="(()=>{\n const original=window.fetch.bind(window);\n window.fetch=(input,options={})=>{\n  const url=String(typeof input==='string'?input:input?.url||'');\n  if(url.includes('/api/discover-ai-config'))return Promise.resolve(new Response(JSON.stringify({enabled:true}),{status:200,headers:{'Content-Type':'application/json'}}));\n  if(url.endsWith('/api/discover-ai')){\n   const payload=JSON.parse(options?.body||'{}');\n   const response=payload.turn===0?\n    {reply:'The question can change how we understand our choices.',followUp:'Which direction would you explore?',choices:['Look at everyday experience','Question its assumption','Consider another viewpoint'],complete:false}:\n    {reply:'Your chosen direction offers one possible connection, not a judgment about you.',followUp:'What question might you carry?',choices:[],complete:true};\n   return Promise.resolve(new Response(JSON.stringify(response),{status:200,headers:{'Content-Type':'application/json'}}));\n  }\n  return original(input,options);\n };\n})();";
 await send("Page.addScriptToEvaluateOnNewDocument",{source:mockSource});
 await send("Page.navigate",{url:origin+"/?cz80=preview&cz81=preview"});
 await until(()=>evalJS("Boolean(document.querySelector('[data-action=discover]'))"),"AI fixture landing");
 if(await evalJS("document.getElementById('yl-onboarding')?.hidden===false")){
  await evalJS("document.querySelector('[data-intro=back]').click();true");
  await until(()=>evalJS("document.getElementById('yl-onboarding')?.hidden===true"),"fixture onboarding");
 }
 if(await evalJS("document.getElementById('yl-entrance')?.hidden===false")){
  await until(()=>evalJS("document.getElementById('yl-enter')?.disabled===false"),"fixture welcome ready");
  await evalJS("document.getElementById('yl-enter').dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));true");
  await until(()=>evalJS("document.getElementById('yl-entrance')?.hidden===true"),"fixture welcome dismissed");
 }
 await evalJS("document.querySelector('[data-action=discover]').click();true");
 await until(()=>evalJS("Boolean(document.querySelector('[data-ai=agree]'))"),"consented AI opening");
 await evalJS("document.querySelector('[data-ai=agree]').click();true");
 await until(()=>evalJS("Boolean(document.querySelector('[data-ai-choice]'))"),"mock initial AI insight and three choices");
 assert.equal(await evalJS("document.querySelectorAll('[data-ai-choice]').length"),3);
 await evalJS("document.querySelector('[data-ai-choice]').click();true");
 await until(()=>evalJS("Boolean(document.querySelector('.yl-logo-finale'))"),"mock completed AI insight");
 assert.equal(await evalJS("document.querySelector('.discover-sheet')?.dataset.cz80Beat"),"insight");
 await until(()=>evalJS("Boolean(document.querySelector('object.yl-logo-v3-rig')?.contentDocument?.documentElement?.classList.contains('state-reflective'))"),"AI insight triggered subtle rig pose");
 // The AI panel specifically must use the review-only alpha matte. Local flow
 // retains its compact original masking and normal URLs remain unchanged.
 assert.equal(await evalJS("getComputedStyle(document.querySelector('.yl-ai-experiment .yl-logo-pet-layered .yl-logo-v3-rig')).mixBlendMode"),"normal","source colors must not be washed out by blend mode");
 assert.match(await evalJS("getComputedStyle(document.querySelector('.yl-ai-experiment .yl-logo-pet-layered .yl-logo-v3-rig')).maskImage"),/lillogo-v3-ai-matte\.svg/,"AI portrait-derived matte is not applied");
 // A completed insight is NOT automatically a saved My World record.
 assert.equal(await evalJS("JSON.parse(localStorage.getItem('yourlogos_web_v1')||'{}').aiDiscoverThreads?.length||0"),0);
 const screenshotAI=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
 await writeFile(path.join(artifact,"cz80-cz81-ai-mocked-final.png"),Buffer.from(screenshotAI.data,"base64"));
 await evalJS("document.querySelector('[data-ai=save]').click();true");
 await until(()=>evalJS("Boolean(JSON.parse(localStorage.getItem('yourlogos_web_v1')||'{}').aiDiscoverThreads?.length)"),"explicit My World AI save");
 assert.equal(await evalJS("Boolean(document.querySelector('.discover-sheet'))"),false,"saved journey leaves Encounter");
 await until(()=>evalJS("document.querySelector('.stage')?.dataset.cz80Beat==='finish'"),"My World receives real saved-completion beat");

 process.stdout.write("CZ80/81 local flow + mocked consented AI completion and explicit save PASS; no provider AI usage\\n");
}finally{
 try{ws?.close()}catch{}
 server.kill("SIGTERM");
 chrome.kill("SIGTERM");
}
