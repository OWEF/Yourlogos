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
   assert.match(renderB27Encounter(sheet),/What would you say/);
   assert.match(renderB27Encounter(sheet),/data-social-beat="choose"/);
   assert.doesNotMatch(renderB27Encounter(sheet),/YOUR TURN.*Decision Cards/);
   assert.equal(adjustB27Game(sheet,"branch",first.id),true);
   // Beat presentations never alter the replayed Director's source facts.
   const send=renderB27Encounter({...sheet,presentationBeat:"send"});
   const waiting=renderB27Encounter({...sheet,presentationBeat:"wait"});
   assert.match(send,/data-social-beat="send"/);
   assert.doesNotMatch(send,/id="b27-observation"/,
    "No independent event is displayed before the send beat completes");
   assert.match(waiting,/data-social-beat="wait"/);
   assert.match(waiting,/Message delivered/);
   assert.doesNotMatch(waiting,/b27-social-reconsider/,
    "Wait and Reconsider are different visible scenes");
   const middle=renderB27Encounter(sheet);
   assert.match(middle,/Message delivered/);
   assert.match(middle,/What am I asking the other person/);
   assert.match(middle,/AFTER THE FIRST MESSAGE/);
   assert.match(middle,/READ STATUS UNKNOWN/);
   assert.doesNotMatch(middle,/b27-social-facts|YOUR NEXT RESPONSIBILITY|FURTHER REPAIR MAY STILL MATTER/i);
   assert.equal(canFinishB27(sheet),false);
   assert.equal(adjustB27Game(sheet,"branch",first.id),false);
   assert.equal(adjustB27Game(sheet,"branch",second.id),true);
   const afterSecond=renderB27Encounter(sheet);
   assert.match(afterSecond,/AFTER THE FIRST MESSAGE/);
   if(second.medium==="message"){
    assert.match(afterSecond,/Delivery and reply not observed for this second message/);
    assert.doesNotMatch(afterSecond,/THEIR RESPONSE.*Unknown · no reply yet/);
   }else{
    assert.match(afterSecond,/PRIVATE (?:NOTE|DECISION) · NOT SENT/);
    assert.doesNotMatch(afterSecond,/Delivery and reply not observed for this second message/);
   }
   const canonicalInput=canonicalB27Input(sheet);
   const result=runPilot({...request,sourceVersionHash,canonicalInput});
   assert.equal(result.status,"ready");
   assert.equal(result.provenance.directorTranscript.firstMessage,first.literal);
   assert.equal(result.provenance.directorTranscript.event,sheet.game.observation.text);
   assert.equal(result.provenance.directorTranscript.secondAction,second.literal);
   assert.equal(saveFinishedEncounter(store,result,io).status,"saved");
   const [saved]=validatedSavedEncounters(io.readback().savedEncounters);
   const reread=renderB27Encounter({stage:"result",quote,result:saved,saved:true,record:null});
   assert.match(reread,/FIRST MESSAGE · SENT/);
   assert.match(reread,/INDEPENDENT STORY EVENT · AFTER FIRST MESSAGE/);
   assert.match(reread,second.medium==="message"?
    /Second message: sent; delivery and reply not observed/:
    /Private action; not sent to the recipient/);
   assert.match(reread,second.medium==="message"?/SECOND MESSAGE · SENT/:
    second.medium==="private_note"?/PRIVATE NOTE · NOT SENT/:/PRIVATE DECISION · NOT SENT/,
    "Saved readback must not treat a private note or decision as a sent message");
   assert.match(reread,/Go deeper/);
   assert.ok(reread.includes('data-b27="replay"'));
   assert.ok(!reread.includes('data-b27="revise"'));
   assert.equal(deleteSavedEncounter(store,saved.saveKey,io).status,"deleted");
   assert.deepEqual(store.saved,[]);
  }
 }
});
