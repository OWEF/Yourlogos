import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {aiConversationHtml} from "../discover-ai-client.js";
import {philosopherPortrait} from "../philosopher-portraits.js";
import {makeDiscoverPrompt,validateDiscoverTurn} from "../discover-ai-server.mjs";
const quote=["A question worth asking","Søren Kierkegaard","Freedom"];
const first={quoteId:1,consent:true,messages:[{role:"assistant",text:"The question changes when another person is involved.",followUp:"What would you say to the newcomer?",choices:["Be fully candid","Protect their first day","Ask what concerns them"]}]};
test("Discover opens with distinct philosopher identity and a strong first question",()=>{
 const html=aiConversationHtml({quote,conversation:first,available:true,authenticated:true});
 assert.match(html,/yl-thinker-pixel/);
 assert.match(html,/Søren Kierkegaard/);
 assert.match(html,/THE ENCOUNTER/);
 assert.match(html,/What would you say to the newcomer/);
 assert.equal((html.match(/data-ai-choice="/g)||[]).length,3);
});
test("An answer yields a separate, dismissible LilLogo moment",()=>{
 const html=aiConversationHtml({quote,conversation:{...first,interlude:true,interludeChoice:2,interludePhase:"reaction"},available:true,authenticated:true});
 assert.match(html,/yl-logo-interlude-phase-reaction/);
 assert.match(html,/data-action="close-discover"/);
 assert.doesNotMatch(html,/data-ai-choice=/);
 assert.doesNotMatch(html,/yl-thinker-intro/);
});
test("Slow response visibly changes to a thinking moment",()=>{
 const html=aiConversationHtml({quote,conversation:{...first,interlude:true,interludePhase:"thinking"},available:true,authenticated:true});
 assert.match(html,/yl-logo-interlude-phase-thinking/);
 assert.match(html,/following that thought/i);
 assert.match(html,/data-action="close-discover"/);
});
test("Subsequent choices advance the conversational act",()=>{
 const c={...first,messages:[...first.messages,{role:"user",text:"Be fully candid"},{role:"assistant",text:"Honesty can shift the burden.",followUp:"What still troubles you?",choices:["The timing","Their agency","My own reasons"]}]};
 const html=aiConversationHtml({quote,conversation:c,available:true,authenticated:true});
 assert.match(html,/THE ASSUMPTION/);
});
test("Historical portraits remain local and quotes remain escaped",()=>{
 assert.match(philosopherPortrait("Søren Kierkegaard"),/svg/);
 const html=aiConversationHtml({quote:['<script>alert(1)</script>','Kierkegaard','Freedom'],conversation:first,available:true,authenticated:true});
 assert.doesNotMatch(html,/<script>/);
});
test("Philosophical prompt preserves meaningful choices and limits false personality claims",()=>{
 const prompt=makeDiscoverPrompt({quoteId:0,turn:0,quote:{text:"He who has a why to live can bear almost any how.",author:"Friedrich Nietzsche",theme:"Meaning"}});
 assert.match(prompt.system,/defensible values/);
 assert.match(prompt.system,/not a lifelong character trait/i);
 assert.throws(()=>validateDiscoverTurn({reply:"A very ordinary choice can feel larger than it is.",followUp:"What might you do?",choices:["Yes","No","Maybe"]},0));
});
test("Main UI preserves the three-tab architecture and private memory boundaries",()=>{
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 assert.match(app,/const navs=/);
 assert.match(app,/discoverOpen/);
 assert.match(app,/interludePhase="thinking"/);
 assert.match(html,/little-logo-presence/);
});
