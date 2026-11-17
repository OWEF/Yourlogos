/**
 * CZ-147 R2 engineering regression: disclosed earlier sources are NOT fresh
 * independent QA holdouts. No author-specific operations are added to engine.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource}
 from "../experiments/yl-cz147-engines.mjs";
const words=s=>s.trim().split(/\s+/).length;
const old=id=>CZ147_SOURCE_RECORDS.find(r=>r.quoteId===id);
const q=id=>B27_APP_QUOTES[id];
const rec=(id,fields)=>({
 quoteId:id,recordId:"cz147-r2-disclosed-regression:"+id,
 version:"cz147-r2-known-source/1",status:"development_provisional",
 developmentOnly:false,publicationAllowed:false,
 source:{text:q(id)[0],author:q(id)[1],work:q(id)[3],referenceUrl:""},
 evidenceIds:["source:central","scenario:fictional","source:boundary"],
 prohibitedInferences:["actual emotions","actual moral worth","guaranteed success"],
 supportedConclusions:["Only provisional source-grounded comparisons in an invented scene"],
 ...fields
});
const timeline=(starts,scenes,responses)=>starts.flatMap(s=>scenes.flatMap(d=>
 responses.map(r=>({startId:s.id,startLabel:s.label,
  sceneId:d.id,sceneLabel:d.label,authoredText:[d.text],
  responseId:r.id,responseLabel:r.label,responseStance:r.stance,
  authoredFutureIsPrediction:false}))));
const pascal=rec(10,{
 familyId:"balance_move",
 philosophicalOperation:{kind:"attention_evasion",focus:"undistracted attention in solitude",
  contrast:"quiet reflection versus escape into distraction",
  sourceWarrantIds:["source:central"],
  activityRoles:[{id:"quiet",role:"quiet_attention"},
   {id:"alerts",role:"possible_distraction"},
   {id:"friends",role:"social_contact"}]},
 title:"Where is a quiet interval?",
 intro:"You have six imagined half-hour slots for quiet attention, messages and friends; no use is automatically virtuous.",
 humanTension:"Choosing quiet contemplation can compete with notifications and meaningful conversation.",
 sourceThesis:"The difficulty of quiet solitude can expose an unsettled relationship to distraction",
 evidenceClaim:"Chosen distractions can displace opportunities for undistracted attention",
 epistemicLimits:"An imaginary allocation does not show whether a reader actually fears being alone",
 compactLimit:"This game cannot diagnose someone's actual fear of solitude",
 counterexample:"Companionship is not a moral failure or inherently an escape",
 readerAgency:"Divide six fictional slots without mind reading",
 reflectionQuestion:"What kind of quiet attention could be worth making room for?",
 affordances:["curious_reflection","tradeoff_attention","choice_awareness"],
 allocation:{resourceCapacity:6,resourceType:"exact",unitName:"half-hour slots",
  choices:[{id:"quiet",label:"quiet attention"},
   {id:"alerts",label:"notifications"},
   {id:"friends",label:"conversation"}],
  initial:[2,2,2],repetitions:null,lenses:[]}
});
const laozi=rec(16,{
 familyId:"decision_cards",
 philosophicalOperation:{kind:"incremental_beginning",focus:"small beginnings without forced results",
  contrast:"small deliberate action versus controlling an outcome",
  sourceWarrantIds:["source:central"],
  startRoles:[{id:"begin",role:"begin_modestly"},
   {id:"plan",role:"prepare_carefully"}]},
 title:"A modest first step",
 intro:"A community project seems difficult to begin. Imagine making a modest start or preparing further before an unrelated complication arrives.",
 humanTension:"A first step can be prudent without a guarantee of future success.",
 sourceThesis:"Large undertakings have small beginnings and need not be forced into completion",
 evidenceClaim:"A first step makes a longer path conceivable without ensuring its outcome",
 epistemicLimits:"The invented scene does not establish that any long project will succeed",
 compactLimit:"A small beginning cannot guarantee the whole journey",
 counterexample:"Hasty interference can undermine the natural development of a task",
 readerAgency:"Choose a start, consider an invented complication, then respond",
 reflectionQuestion:"What modest beginning would allow a task to unfold without trying to grasp its future?",
 affordances:["revisability","choice_awareness","uncertainty_awareness"],
 timeline:timeline([
  {id:"begin",label:"You start a modest first task"},
  {id:"plan",label:"You prepare the first task carefully"}
 ],[
  {id:"requirement",label:"a new requirement appears",
   text:"An imaginary requirement changes the scope of a project but not the observed future"},
  {id:"feedback",label:"someone offers feedback",
   text:"An imaginary colleague gives feedback without promising an eventual result"}
 ],[
  {id:"adjust",label:"You revise the next small task",stance:"reconsider"},
  {id:"continue",label:"You proceed with care",stance:"hold"}
 ])});
const records=[...CZ147_SOURCE_RECORDS,pascal,laozi];
const registry=makeUniversalRegistry(records,B27_APP_QUOTES);
function run(id,canonical){
 const r=records.find(x=>x.quoteId===id);
 const identity={quoteId:id,quoteText:r.source.text,quoteAuthor:r.source.author,
  quoteWork:r.source.work,b27DevelopmentOnly:r.developmentOnly};
 const admission=registry.resolve(identity);
 assert.equal(admission.status,"ready");
 const output=registry.run({...identity,sourceVersionHash:admission.sourceVersionHash,
  canonicalInput:canonical});
 assert.equal(output.status,"ready",JSON.stringify({id,canonical,
  status:output.status,reason:output.reason,code:output.code}).slice(0,900));
 assert.equal(output.fullExpression.sections.length,3);
 assert.equal(output.compact.sections.length,3);
 assert.ok(output.fullExpression.wordCount>=80&&output.fullExpression.wordCount<=120);
 assert.ok(output.compact.visibleWordCount>=40&&output.compact.visibleWordCount<=65);
 assert.equal(output.provenance.unchosenFutureKnown,false);
 assert.equal(output.emotion.inferredActualEmotion,false);
 assert.equal(output.publicationAllowed,false);
 assert.equal(output.fullMeaning.meaning.philosophicalOperation.kind,r.philosophicalOperation.kind);
 return output;
}
const flip=(a,b,c)=>({actions:[{type:"choose_start",optionId:a},
 {type:"explore_authored",sceneId:b},{type:"choose_response",optionId:c},
 {type:"read_retrospective"}]});
const pairs=(aId,bId,relationId)=>({pairs:[{aId,bId,relationId}]});
const samples=[
 {label:"Same Flip: retrospective hindsight",id:94,input:flip("stay","welcome","reflect")},
 {label:"Same Flip: external event and agency",id:48,input:flip("prepare","silence","respond")},
 {label:"Same Decision: consistency and judgment",id:55,input:{path:["maintain","critique","consider"]}},
 {label:"Same Decision: beginnings and non-forcing",id:16,input:{path:["begin","feedback","adjust"]}},
 {label:"Same Balance: deliberate living",id:49,input:{amounts:[3,2,3],budgets:[8],touched:true}},
 {label:"Same Balance: undistracted attention",id:10,input:{amounts:[3,2,1],budgets:[6],touched:true}},
 {label:"Same Pair: coordinated work",id:91,input:pairs("design","friend","complementarity")},
 {label:"Same Pair: self-government",id:23,input:pairs("dominance","agency","contrast")}
];
test("Source authority declares the philosophical operation independently of the presentation family",()=>{
 assert.equal(new Set(records.map(r=>r.philosophicalOperation.kind)).size>=8,true);
 for(const r of records){
  assert.equal(sealUniversalSource(r).status!=="blocked",true,r.recordId);
  assert.ok(r.philosophicalOperation.sourceWarrantIds.every(id=>r.evidenceIds.includes(id)));
 }
 assert.notEqual(sealUniversalSource({...old(48),philosophicalOperation:undefined}).status,"ready");
 assert.equal(sealUniversalSource({...old(48),
  philosophicalOperation:{...old(48).philosophicalOperation,kind:"deliberate_use"}}).status,"blocked");
 assert.equal(registry.resolve({quoteId:31,quoteText:q(31)[0],
  quoteAuthor:q(31)[1],quoteWork:q(31)[3],b27DevelopmentOnly:false}),null);
});
test("Four same-family distinct-argument contrasts carry incompatible philosophical implications",()=>{
 mkdirSync("qa-evidence-cz147-r2",{recursive:true});
 const results=samples.map(x=>({...x,result:run(x.id,x.input)}));
 for(let i=0;i<results.length;i+=2){
  const a=results[i].result,b=results[i+1].result;
  assert.equal(a.selectedFamilyId,b.selectedFamilyId);
  assert.notEqual(a.fullMeaning.meaning.philosophicalOperation.kind,
   b.fullMeaning.meaning.philosophicalOperation.kind);
  assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
  assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
  assert.notEqual(a.emotion.attention.philosophicalOperation,
   b.emotion.attention.philosophicalOperation);
  assert.ok(!/unchosen life|life you did not live|alternative future/i.test(
   b.selectedFamilyId==="flip_reveal"?b.compact.sections.slice(1).map(x=>x.text).join(" "):""));
 }
 const expected=[
  /unchosen life|life you did not live|life not lived/i,
  /response|event|command|control/i,
  /judgment|consistency|past words/i,
  /small|modest|forc|beginnings/i,
  /deliberate|busyness|purpose/i,
  /attention|solitude|distraction/i,
  /work|contributions|coordinat/i,
  /government|domination|agency/i
 ];
 for(let i=0;i<results.length;i++){
  const combined=results[i].result.compact.sections.slice(1).map(x=>x.text).join(" ");
  assert.match(combined,expected[i],results[i].label);
  assert.ok(!/What does .+ still leave unresolved\?/i.test(results[i].result.compact.sections[2].text));
 }
 writeFileSync("qa-evidence-cz147-r2/four-same-family-contrasts.json",
  JSON.stringify(results.map(({label,id,input,result})=>({label,quoteId:id,input,
   operation:result.fullMeaning.meaning.philosophicalOperation,
   reasoning:result.fullMeaning,emotion:result.emotion,
   full:result.fullExpression,compact:result.compact})),null,2));
});
test("Qualitative review: no participial full-sentence fragments, naked source contrast, or tautological attention question",()=>{
 const kyr=run(94,flip("stay","welcome","reflect"));
 const epi=run(48,flip("prepare","silence","respond"));
 const smith=run(91,pairs("design","friend","complementarity"));
 const wool=run(23,pairs("dominance","agency","contrast"));
 const pas=run(10,{amounts:[3,2,1],budgets:[6],touched:true});
 for(const value of [kyr,epi]){
  assert.doesNotMatch(value.fullExpression.sections[0].text,
   /In this fictional situation, (choosing|preparing) .*\./i,
   "Gerund opening may contain a subordinate verb but not a complete main clause");
  assert.match(value.fullExpression.sections[0].text,/The dilemma involves/i);
 }
 for(const value of [smith,wool]){
  assert.doesNotMatch(value.fullExpression.sections[1].text,
   /\. (division of work versus moral endorsement|self-government rather than domination)\./i);
 }
 assert.doesNotMatch(pas.compact.sections[2].text,/quiet attention leave space for quiet attention/i);
 assert.match(pas.compact.sections[2].text,/quiet|reflection|notice/i);
});
test("Epictetus keeps agency separate from events even when initial choice and fictional event change",()=>{
 for(const [a,b,c] of [["prepare","silence","respond"],["listen","delay","try"]]){
  const out=run(48,flip(a,b,c));
  for(const section of out.compact.sections.slice(1)){
   assert.doesNotMatch(section.text,/unchosen life|life you did not live|another lifetime/i);
  }
  assert.match(out.compact.sections[1].text,/response|event|control|occurrence|command/i);
  assert.match(out.compact.sections[2].text,/response|wishes|control|event|yours/i);
  assert.equal(out.fullMeaning.meaning.choiceAnalysis.development.causedByInitialChoice,false);
 }
});
test("Emerson consistency and Seneca deliberate rest do not become generic uncertainty/virtue scoring",()=>{
 for(const path of [["maintain","critique","consider"],["revisit","details","explain"]]){
  const out=run(55,{path});
  assert.match(out.compact.sections[1].text,/independent judgment|consistency|present reasons|past words/i);
  assert.doesNotMatch(out.compact.sections[2].text,/unchosen future/i);
 }
 for(const amounts of [[0,0,8],[3,2,3],[2,4,2]]){
  const out=run(49,{amounts,budgets:[8],touched:true});
  assert.match(out.compact.sections[1].text,/deliberate|busyness|distraction|purpose|recovery/i);
  assert.doesNotMatch(out.compact.sections[1].text,/rest.+morally inferior/i);
 }
});
