/**
 * CZ-150 focused presenter regression. Run:
 *   node --test experiments/yl-cz150-ui.test.mjs
 * No network, browser automation or source-engine output is mocked as acceptance.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
 initializeB27Game,adjustB27Game,canonicalB27Input,canFinishB27,
 renderB27Encounter
} from "../b27-encounter-ui.js";

const quote={text:"A supplied source thought.",author:"Source Author",work:"Source Work"};
const timeline=[
 {startId:"keep",startLabel:"Keep the plan",sceneId:"new",sceneLabel:"A new letter arrives",
  authoredText:["An unexpected letter arrives from elsewhere."],
  responseId:"review",responseLabel:"Reconsider with reasons"},
 {startId:"revise",startLabel:"Revise the plan",sceneId:"new",sceneLabel:"A new letter arrives",
  authoredText:["An unexpected letter arrives from elsewhere."],
  responseId:"review",responseLabel:"Reconsider with reasons"}
];
const generic={title:"What would you do?",intro:"A promise matters, and new information arrives.",
 narrativeBridge:{version:"cz152-narrative/1",
  bridgeFromSource:"An earlier promise does not always settle what careful judgment requires now.",
  situationHook:"You promised to keep a plan. New facts cast doubt on it, and neighbors expect you to remain consistent.",
  playPrompt:"Choose what you would do as the moment unfolds.",
  sourceWarrantIds:["source:central","scenario:fictional"]},
 humanTension:"Your promise matters, but you learn something new.",
 epistemicLimits:"The event was authored independently; no causal future is established."};
const balance={...generic,familyId:"balance_move",allocation:{
 choices:[{id:"work",label:"Focused work"},{id:"rest",label:"Rest"}],
 resourceCapacity:4,initial:[2,2],resourceType:"fixed",unitName:"hours",
 repetitions:1,lenses:[{id:"time",label:"Across the day"}]
}};
const pair={...generic,familyId:"tap_pair",relation:{
 cards:[{id:"a",label:"Promise",detail:"A prior commitment"},
        {id:"b",label:"Judgment",detail:"Present reasons"},
        {id:"c",label:"Freedom",detail:"Room to act"},
        {id:"d",label:"Limits",detail:"Real constraints"}],
 edges:[{aId:"a",bId:"b",relationId:"r1",label:"A promise requires judgment",
         claim:"A supported source relation connects promises and judgment."}]
}};
const decision={...generic,familyId:"decision_cards",timeline};
const flip={...generic,familyId:"flip_reveal",timeline};
function current(record,beat="play"){
 return {stage:"play",beat,record,quote,game:initializeB27Game(record),
  history:[],message:"",saving:false,saveKey:null};
}
function html(enc){return renderB27Encounter(enc,[quote.text,quote.author])}
function choose(enc,...seq){
 seq.forEach(x=>assert.equal(adjustB27Game(enc,x[0],x[1],x[2]??null),true));
}
test("Situation is one concise screen and gates game controls",()=>{
 const enc=current(decision,"situation"),markup=html(enc);
 assert.match(markup,/FROM THE PHILOSOPHER/);
 assert.match(markup,/IMAGINE THIS/);
 assert.match(markup,/An earlier promise does not always settle/);
 assert.match(markup,/New facts cast doubt on it/);
 assert.match(markup,/Step into the moment/);
 assert.match(markup,/data-b27="begin"/);
 assert.doesNotMatch(markup,/data-b27="branch"/);
 assert.match(markup,/About the idea/);
 assert.match(markup,/The event was authored independently/);
});
test("Balance & Move changes exactly one conserved token",()=>{
 const enc=current(balance),old=canonicalB27Input(enc);
 assert.equal(old,null);
 choose(enc,["move","0",1]);
 assert.deepEqual(canonicalB27Input(enc).amounts,[1,3]);
 assert.equal(canFinishB27(enc),true);
 assert.match(html(enc),/Reveal insight/);
});
test("Tap & Pair selects a supported edge, not a correctness score",()=>{
 const enc=current(pair);
 choose(enc,["pair","a"],["pair","b"]);
 assert.deepEqual(canonicalB27Input(enc).pairs,[{aId:"a",bId:"b",relationId:"r1"}]);
 const markup=html(enc);
 assert.match(markup,/data-b27-link-layer/);
 assert.match(markup,/Why these connect/);
 assert.doesNotMatch(markup,/correct answer|score:/i);
});
test("Decision Cards retain initial, hypothetical and response stages",()=>{
 const enc=current(decision);
 assert.match(html(enc),/data-b27="branch"/);
 choose(enc,["branch","keep"],["branch","new"],["branch","review"]);
 assert.deepEqual(canonicalB27Input(enc),{path:["keep","new","review"]});
 const markup=html(enc);
 assert.match(markup,/Reveal insight/);
 assert.match(markup,/The hypothetical development was authored independently/);
 assert.doesNotMatch(markup,/The fictional development was independently authored\./);
});
test("Flip & Reveal conceals events until a card is chosen",()=>{
 const enc=current(flip);
 choose(enc,["branch","keep"]);
 const sealed=html(enc);
 assert.match(sealed,/Face-down possibility 1/);
 assert.doesNotMatch(sealed,/A new letter arrives/);
 choose(enc,["branch","new"]);
 const revealed=html(enc);
 assert.match(revealed,/A new letter arrives/);
 assert.match(revealed,/b27-flip-pending/);
 choose(enc,["branch","review"]);
 assert.deepEqual(canonicalB27Input(enc).actions.map(x=>x.type),[
  "choose_start","explore_authored","choose_response","read_retrospective"
 ]);
});
test("Result shows exactly three compact sections and keeps source in disclosure",()=>{
 const enc=current(pair);
 enc.stage="result";
 enc.result={compact:{status:"ready",sections:[
  {label:"Your choice",text:"A specific user choice."},
  {label:"The philosopher",text:"Source-grounded interpretation."},
  {label:"Carry forward",text:"A thoughtful open question."}
 ],philosopher:{author:"Source Author",work:"Source Work",highlight:"Original fragment"},
 deepening:{sourceQualification:"A crucial attribution qualification."},fullWordCount:90}};
 const markup=html(enc);
 assert.equal((markup.match(/class="b27-result-section/g)||[]).length,3);
 assert.match(markup,/<summary>Go deeper<\/summary>/);
 assert.match(markup,/Finish &amp; Save/);
 assert.match(markup,/A crucial attribution qualification/);
});
