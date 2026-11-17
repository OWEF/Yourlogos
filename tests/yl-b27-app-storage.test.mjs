import {test} from "node:test";
import assert from "node:assert/strict";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {resolveQuoteB27,runQuoteEncounterB27}
 from "../experiments/yl-b27-route.mjs";
import {saveFinishedEncounter,deleteSavedEncounter,validatedSavedEncounters}
 from "../b27-saved-encounters.js";
import {initializeB27Game,adjustB27Game,canonicalB27Input,
 renderB27Encounter,savedB27WorldHtml,canFinishB27}
 from "../b27-encounter-ui.js";
const q=id=>({quoteId:id,quoteText:B27_APP_QUOTES[id][0],
 quoteAuthor:B27_APP_QUOTES[id][1],quoteWork:B27_APP_QUOTES[id][3],
 b27DevelopmentOnly:id>=91});
const ready=(id,input)=>{
 const selection=resolveQuoteB27(q(id));
 assert.equal(selection.status,"ready");
 const result=runQuoteEncounterB27({...q(id),sourceVersionHash:selection.sourceVersionHash,
  canonicalInput:input});
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,600));
 assert.match(result.saveKey,/^sha256:[a-f0-9]{64}$/);
 return {selection,result};
};
test("Exactly one readback-confirmed app-state saved Encounter, repeated submit idempotent and separate Like",()=>{
 const {result}=ready(12,{amounts:[2,2,2],budgets:[6],repetitions:5,touched:true});
 let stored=JSON.stringify({savedEncounters:[],saved:[1,3]});
 const data=JSON.parse(stored);
 const hooks={persist:()=>{stored=JSON.stringify(data)},
  readback:()=>JSON.parse(stored),clock:()=> "2026-11-17T00:00:00.000Z"};
 let out=saveFinishedEncounter(data,result,hooks);
 assert.equal(out.status,"saved");
 assert.equal(out.alreadyExisted,false);
 assert.equal(data.saved.length,2);
 assert.equal(data.savedEncounters.length,1);
 assert.equal(data.savedEncounters[0].quoteId,12);
 assert.deepEqual(data.savedEncounters[0].canonicalChoice,result.canonical_choice);
 assert.deepEqual(data.savedEncounters[0].fullExpression,result.fullExpression);
 assert.equal(data.savedEncounters[0].locallySaved,true);
 assert.equal(data.savedEncounters[0].cloudSynchronized,false);
 out=saveFinishedEncounter(data,result,hooks);
 assert.equal(out.status,"saved");assert.equal(out.alreadyExisted,true);
 assert.equal(data.savedEncounters.length,1,"Finish & Save may be retried without duplicate");
 assert.equal(validatedSavedEncounters(JSON.parse(stored).savedEncounters).length,1);
 const revised=ready(12,{amounts:[3,1,2],budgets:[6],repetitions:5,touched:true}).result;
 assert.notEqual(revised.saveKey,result.saveKey);
 assert.equal(saveFinishedEncounter(data,revised,hooks).status,"saved");
 assert.equal(data.savedEncounters.length,2,"A revised canonical choice may be separately saved");
 assert.equal(data.saved.length,2,"Quote Likes have never been auto-created");
 assert.match(savedB27WorldHtml(JSON.parse(stored).savedEncounters),/Revisit/);
 assert.equal(deleteSavedEncounter(data,result.saveKey,hooks).status,"deleted");
 assert.equal(data.savedEncounters.length,1);
 assert.equal(JSON.parse(stored).savedEncounters.length,1);
});
test("Failed app-owned persist, failed readback and stale forged inputs never claim save",()=>{
 const {result}=ready(91,{pairs:[{aId:"sketch",bId:"friend",relationId:"complementarity"}]});
 const state={savedEncounters:[],saved:[]};
 let writes=0;
 const fail={persist:()=>{writes++;throw Error("Disk unavailable")},readback:()=>state};
 assert.equal(saveFinishedEncounter(state,result,fail).status,"not_saved");
 assert.equal(state.savedEncounters.length,0);
 let disk=JSON.stringify({savedEncounters:[]});
 const absent={persist:()=>{},readback:()=>JSON.parse(disk)};
 assert.equal(saveFinishedEncounter(state,result,absent).code,"readback_failed");
 assert.equal(state.savedEncounters.length,0);
 assert.equal(saveFinishedEncounter(state,{...result,saveKey:null},
  {persist:()=>{},readback:()=>({})}).status,"not_saved");
 assert.equal(validatedSavedEncounters([{saveKey:"fake"},{foo:1}]).length,0);
});
test("B2.7 app renderer uses the source-selected game's canonical state, no second catalogue",()=>{
 const selection=resolveQuoteB27(q(12)),initial=initializeB27Game(selection.record);
 const enc={stage:"play",record:selection.record,game:initial,history:[],message:"",
  quote:selection.quote};
 assert.equal(canFinishB27(enc),false);
 const markup=renderB27Encounter(enc,B27_APP_QUOTES[12]);
 assert.match(markup,/data-b27-family="balance_move"/);
 assert.doesNotMatch(markup,/id="questions"|qa-panel|Choose from eight/i);
 const qty=initial.owners.length;
 assert.equal(qty,6);
 assert.equal(adjustB27Game(enc,"slider","4"),true);
 assert.equal(canFinishB27(enc),true);
 assert.deepEqual(canonicalB27Input(enc),{amounts:[4,2,0],
  budgets:[6],touched:true,repetitions:5});
 const pairSel=resolveQuoteB27(q(91));
 const pair={stage:"play",record:pairSel.record,
  game:initializeB27Game(pairSel.record),history:[]};
 assert.equal(adjustB27Game(pair,"pair","sketch"),true);
 assert.equal(adjustB27Game(pair,"pair","sketch"),false,
  "Repeated Enter activation must be idempotent");
 assert.equal(pair.game.first,"sketch");
 assert.equal(adjustB27Game(pair,"pair","friend"),true);
 assert.deepEqual(canonicalB27Input(pair),{pairs:[{
  aId:"sketch",bId:"friend",relationId:"complementarity"}]});
});
