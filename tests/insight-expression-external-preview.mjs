import {chromium} from "playwright-core";
import {resolve} from "node:path";
const sha=process.env.PR_HEAD_SHA;
if(!/^[0-9a-f]{40}$/.test(sha||""))throw Error("PR_HEAD_SHA is required");
const github="https://github.com/OWEF/Yourlogos/blob/"+sha+"/experiments/two-encounter-insight-lab-v02-standalone.html";
const preview="https://htmlpreview.github.io/?"+github;
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 page.on("pageerror",e=>process.stderr.write("PAGE: "+e.message+"\n"));
 await page.goto(preview,{waitUntil:"domcontentloaded",timeout:20000});
 await page.waitForFunction(()=>document.getElementById("quote")?.textContent?.includes("Seneca"),null,{timeout:25000});
 const title=await page.locator("h1").innerText();
 if(!title.includes("A small choice."))throw Error("Wrong preview content: "+title);
 process.stdout.write("PASS external iPhone HTML preview: "+preview+"\n");
}finally{await browser.close();}
