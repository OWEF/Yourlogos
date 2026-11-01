import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {aiConversationHtml,LOGO_DECISIONS} from "../discover-ai-client.js";
import {conceptVisualHtml,VISUAL_KINDS,VISUAL_BY_QUOTE} from "../discover-concept-grammar.js";
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
test("One choice yields a small conceptual map and optional question",()=>{
 const q=["He who has a why to live can bear almost any how.","Friedrich Nietzsche","Meaning"];
 const c={quoteId:0,consent:true,complete:true,messages:[
  {role:"assistant",text:"Nietzsche asks why we endure. Picture this:",followUp:"A friend asks why you stay at a hard job. What do you say?",choices:["It pays the bills","I hope it improves","I am no longer sure"]},
  {role:"user",text:"It pays the bills",lensIndex:0},
  {role:"assistant",text:"A practical reason can sustain endurance without turning difficulty into fulfillment.",followUp:"When does necessity become purpose?",choices:[],complete:true}
 ]};
 const html=aiConversationHtml({quote:q,conversation:c,available:true,authenticated:true});
 assert.equal(LOGO_DECISIONS,1);
 assert.match(html,/WHAT THIS SHOWS/);
 assert.match(html,/yl-concept-visual/);
 assert.match(html,/When does necessity become purpose/);
 assert.doesNotMatch(html,/data-ai-choice=/);
 assert.match(html,/yl-logo-source-visible/);
});
test("Historical portraits remain local and quotes remain escaped",()=>{
 assert.match(philosopherPortrait("Søren Kierkegaard"),/svg/);
 const html=aiConversationHtml({quote:['<script>alert(1)</script>','Kierkegaard','Freedom'],conversation:first,available:true,authenticated:true});
 assert.doesNotMatch(html,/<script>/);
});
test("Philosophical prompt preserves meaningful choices and limits false personality claims",()=>{
 const prompt=makeDiscoverPrompt({quoteId:0,turn:0,quote:{text:"He who has a why to live can bear almost any how.",author:"Friedrich Nietzsche",theme:"Meaning"}});
 assert.match(prompt.system,/3 distinct plausible/);
 assert.match(prompt.system,/not durable beliefs/i);
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
 },0),/Generic or speculative/);
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
 assert.match(prompt.system,/editorial interpretations/i);
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
 const last=makeDiscoverPrompt({quoteId:31,turn:1,quote,direction:"Ask for the missing context"});
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

test("Opening bridge is brief and journey ends after one choice",()=>{
 assert.throws(()=>makeDiscoverPrompt({quoteId:0,turn:2,quote:{text:"He who has a why to live can bear almost any how.",author:"Friedrich Nietzsche",theme:"Meaning"}}),/Invalid journey step/);
 const beginning=validateDiscoverTurn({reply:"Nietzsche asks why we endure. Picture this:",followUp:"A friend asks why you stay at a difficult job. What do you say?",choices:["The bills need paying","I still hope for change","I'm not sure anymore"]},0);
 assert.equal(beginning.complete,false);
 const ending=validateDiscoverTurn({reply:"A necessary reason can help us endure even when it offers little satisfaction.",followUp:"When does staying still make sense to you?",choices:[]},1);
 assert.equal(ending.complete,true);
 assert.equal(ending.choices.length,0);
 assert.match(ending.followUp,/staying/);
 assert.throws(()=>validateDiscoverTurn({reply:"A ".repeat(60),followUp:beginning.followUp,choices:beginning.choices},0),/concise/);
});
test("Free-text is hidden and not a fourth main choice",()=>{
 const html=aiConversationHtml({quote,conversation:first,available:true,authenticated:true});
 assert.equal((html.match(/data-ai-choice="/g)||[]).length,3);
 assert.match(html,/<details class="yl-logo-other">/);
 assert.match(html,/data-ai="own-answer"/);
});
test("All 91 quotes map to local editorial visual templates",()=>{
 const ids=Object.keys(VISUAL_BY_QUOTE).map(Number);
 assert.equal(ids.length,91);
 assert.deepEqual(ids.sort((a,b)=>a-b),Array.from({length:91},(_,i)=>i));
 assert.ok(Object.values(VISUAL_BY_QUOTE).every(kind=>VISUAL_KINDS.includes(kind)));
 const pilots=[
  [0,"He who has a why to live can bear almost any how.",0,"It pays the bills.","Bills to pay"],
  [31,"The true is the whole.",0,"We need more context.","Earlier events"],
  [70,"Sapere aude! Have courage to use your own understanding!",1,"I'd check it myself.","Evidence"]
 ];
 for(const [id,quoteText,index,choice,expected] of pilots){
  const html=conceptVisualHtml([quoteText],id,choice,index);
  assert.match(html,/yl-concept-example/);
  assert.match(html,/SEE IT IN THE EXAMPLE/);
  assert.match(html,/BACK TO THE QUOTE/);
  assert.ok(html.includes(expected));
 }
 assert.equal(conceptVisualHtml(["Two things fill the mind with ever-increasing wonder: the starry sky above me and the moral law within me."],11,"A choice"),"","Unreviewed visual is hidden");
 assert.equal(conceptVisualHtml(["Unrelated quote"],31,"We need more context.",0),"");
 assert.equal(conceptVisualHtml(["The true is the whole."],31,"Unmapped own words"),"","Don't force custom text into a preset visual");
 assert.doesNotMatch(conceptVisualHtml(["The true is the whole."],31,"<script>",0),/<script>/);
});
