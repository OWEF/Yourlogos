import {test} from "node:test";
import assert from "node:assert/strict";
import {resolvePilot,runPilot} from "../experiments/yl-cz155-pilot.mjs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {initializeB27Game,adjustB27Game,canonicalB27Input,canFinishB27,renderB27Encounter}
 from "../b27-encounter-ui.js";
import {deleteSavedEncounter,saveFinishedEncounter,validatedSavedEncounters}
 from "../b27-saved-encounters.js";
const [quoteText,quoteAuthor,,quoteWork]=B27_APP_QUOTES[47];
const request={quoteId:47,quoteText,quoteAuthor,quoteWork,b27DevelopmentOnly:false,cz155Preview:true};

test("Every projected transition can be replayed by the server and an actual My World record",()=>{
 const {record,quote,sourceVersionHash}=resolvePilot(request);
 const store={saved:[]};
 let serialized=JSON.stringify(store);
 const io={persist:()=>{serialized=JSON.stringify(store)},readback:()=>JSON.parse(serialized)};
 for(const first of record.director.openingChoices){
  for(const second of record.director.followUps[first.id]){
   const sheet={stage:"play",beat:"play",quote,record,game:initializeB27Game(record),history:[]};
   assert.match(renderB27Encounter(sheet),/What will you send/);
   assert.equal(adjustB27Game(sheet,"branch",first.id),true);
   const middle=renderB27Encounter(sheet);
   assert.match(middle,/Message delivered/);
   assert.match(middle,/What am I asking the other person/);
   assert.equal(canFinishB27(sheet),false);
   assert.equal(adjustB27Game(sheet,"branch",first.id),false);
   assert.equal(adjustB27Game(sheet,"branch",second.id),true);
   const canonicalInput=canonicalB27Input(sheet);
   const result=runPilot({...request,sourceVersionHash,canonicalInput});
   assert.equal(result.status,"ready");
   assert.equal(result.provenance.directorTranscript.firstMessage,first.literal);
   assert.equal(result.provenance.directorTranscript.event,sheet.game.observation.text);
   assert.equal(result.provenance.directorTranscript.secondAction,second.literal);
   assert.equal(saveFinishedEncounter(store,result,io).status,"saved");
   const [saved]=validatedSavedEncounters(io.readback().savedEncounters);
   const reread=renderB27Encounter({stage:"result",quote,result:saved,saved:true,record:null});
   assert.match(reread,/What you sent/);
   assert.match(reread,/Go deeper/);
   assert.ok(reread.includes('data-b27="replay"'));
   assert.ok(!reread.includes('data-b27="revise"'));
   assert.equal(deleteSavedEncounter(store,saved.saveKey,io).status,"deleted");
   assert.deepEqual(store.saved,[]);
  }
 }
});
