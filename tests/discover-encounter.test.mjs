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

test("Rejects padded Yes/No/Maybe disguised as three choices (CZ-13)",()=>{
 assert.throws(()=>validateDiscoverTurn({
  reply:"Alex stayed quiet, and the room filled in a motive without asking.",
  followUp:"What would you do with that conclusion?",
  choices:["Yes, definitely","No, not really","Maybe, I guess"]
 },0),/Generic or speculative/);
});
test("Rejects asking users to predict another person's reply (CZ-13)",()=>{
 assert.throws(()=>validateDiscoverTurn({
  reply:"You decided to ask Alex before judging the silence.",
  followUp:"What will Alex say when you ask?",
  choices:["I expect an explanation","I'd ask privately","I'd rather wait"]
 },1),/Generic or speculative/);
});
test("Rejects imagined outcomes even under a neutral question (CZ-13)",()=>{
 assert.throws(()=>validateDiscoverTurn({
  reply:"One comment changed how the whole team saw Alex's silence.",
  followUp:"What part of this situation most concerns you?",
  choices:["They will apologize","I dislike the assumption","I'd ask for context"]
 },0),/Generic or speculative/);
});
test("Accepts distinct, self-directed taps and retains branch context (CZ-13)",()=>{
 const answer=validateDiscoverTurn({
  reply:"Alex was silent, but the explanation attached to that silence is still uncertain.",
  followUp:"What would you do with that conclusion?",
  choices:["Ask Alex before deciding","Say the silence affected the team","Stay out of the judgment"]
 },0);
 assert.equal(answer.choices.length,3);
 const prompt=makeDiscoverPrompt({
  quoteId:31,turn:1,
  quote:{text:"The true is the whole",author:"G. W. F. Hegel",theme:"Knowledge"},
  direction:answer.choices[0],
  history:["What would you do with that conclusion?","Ask Alex before deciding"]
 });
 assert.equal(prompt.context.selectedDirection,"Ask Alex before deciding");
 assert.equal(prompt.context.currentTurn,1);
 assert.ok(prompt.context.recentDialog.some(x=>x.includes("Ask Alex")));
});

test("Grounds Discover in quote-specific philosophical claim and opposing poles (CZ-13)",()=>{
 const prompt=makeDiscoverPrompt({
  quoteId:31,turn:0,
  quote:{text:"The true is the whole.",author:"G. W. F. Hegel",theme:"Meaning"}
 });
 assert.match(prompt.context.philosophicalAnchor.claim,/relations/i);
 assert.equal(prompt.context.philosophicalAnchor.poles.length,2);
 assert.match(prompt.context.philosophicalAnchor.friction,/fact/i);
 assert.match(prompt.system,/editorial grounding/i);
});
test("Rejects wrong quote paired with an otherwise valid quote ID (CZ-13)",()=>{
 assert.throws(()=>makeDiscoverPrompt({
  quoteId:31,turn:0,
  quote:{text:"Man is condemned to be free.",author:"Jean-Paul Sartre",theme:"Freedom"}
 }),/Quote and editorial anchor do not match/);
});
test("Preserves the same source-specific anchor into the last turn (CZ-13)",()=>{
 const quote={text:"The true is the whole.",author:"G. W. F. Hegel",theme:"Meaning"};
 const first=makeDiscoverPrompt({quoteId:31,turn:0,quote});
 const last=makeDiscoverPrompt({quoteId:31,turn:3,quote,direction:"Ask for the missing context"});
 assert.deepEqual(last.context.philosophicalAnchor,first.context.philosophicalAnchor);
 assert.equal(last.context.closing,true);
});

test("Every bundled quote retains matching curated grounding (CZ-13)",async()=>{
 const {getEngineCoverage}=await import("../tension-engine.js");
 const {EXPLORE}=await import("../explore-catalogue.js");
 const source=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const quotes=[...source.matchAll(/^\s*\["((?:[^"\\]|\\.)*)","/gm)].map(m=>[m[1].replace(/\\\"/g,'"')]);
 assert.equal(quotes.length,EXPLORE.length,"Every editorial quote must be traceable by stable ID");
 assert.deepEqual(getEngineCoverage(quotes),{curated:quotes.length,total:quotes.length});
});
