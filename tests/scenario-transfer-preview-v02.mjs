import {chromium} from "playwright-core";
import assert from "node:assert/strict";
const sha=process.env.PR_HEAD_SHA;
if(!/^[0-9a-f]{40}$/.test(sha||""))throw Error("PR_HEAD_SHA must be commit SHA");
const source="https://github.com/OWEF/Yourlogos/blob/"+sha+"/experiments/mechanism-parallel-transfer-lab-v02-standalone.html";
const url="https://htmlpreview.github.io/?"+source;
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto(url,{waitUntil:"domcontentloaded",timeout:20000});
 await page.getByRole("tab",{name:/Trade-Off/}).waitFor({timeout:25000});
 const count=await page.locator("#cases .case").count();
 assert.equal(count,2,"Expected both actual tradeoff cards, not generic preview shell");
 assert.match(await page.locator("h1").innerText(),/One mechanism/);
 assert.deepEqual(errors,[]);
 process.stdout.write("PASS public phone preview: "+url+"\n");
}finally{await browser.close();}
