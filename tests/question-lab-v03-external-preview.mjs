import {chromium} from "playwright-core";
import assert from "node:assert/strict";
const sha=process.env.PR_HEAD_SHA;
if(!/^[0-9a-f]{40}$/.test(sha||""))throw Error("Missing 40-character PR head");
const github="https://github.com/OWEF/Yourlogos/blob/"+sha+"/experiments/two-encounter-question-lab-v03-standalone.html";
const preview="https://htmlpreview.github.io/?"+github;
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(preview,{waitUntil:"domcontentloaded",timeout:25000});
 await page.waitForFunction(()=>document.getElementById("quote")?.textContent?.includes("Seneca"),null,{timeout:30000});
 assert.match(await page.locator("h1").innerText(),/question your choice raises/i);
 await page.getByRole("button",{name:"Discover the question"}).click();
 assert.equal(await page.locator("#result").isVisible(),true);
 assert.deepEqual(errors,[]);
 process.stdout.write("PASS external mobile preview: "+preview+"\n");
}finally{await browser.close();}
