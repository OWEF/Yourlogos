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
 const screenshot=await send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
 const bytes=Buffer.from(screenshot.data,"base64");
 assert.ok(bytes.length>4000,"Screenshot unexpectedly small");
 await writeFile(path.join(artifact,"cz80-cz81-mobile-live.png"),bytes);
 process.stdout.write("CZ80/81 real-app local choice, UI feedback and rig event PASS; no AI, save or model usage\n");
}finally{
 try{ws?.close()}catch{}
 server.kill("SIGTERM");
 chrome.kill("SIGTERM");
}
