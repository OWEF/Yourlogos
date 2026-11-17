import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {B27_EDITORIAL_RECORDS,reportB27Coverage} from "../experiments/yl-b27-editorial-ledger.mjs";
import {resolveQuoteB27,runQuoteEncounterB27} from "../experiments/yl-b27-route.mjs";
import {saveFinishedEncounter,deleteSavedEncounter} from "../b27-saved-encounters.js";
const q=(id,changes={})=>({...{
 quoteId:id,quoteText:B27_APP_QUOTES[id]?.[0],
 quoteAuthor:B27_APP_QUOTES[id]?.[1],quoteWork:B27_APP_QUOTES[id]?.[3],
 b27DevelopmentOnly:id>=91
},...changes});
const accepted=(id,choice)=>{
 const admitted=resolveQuoteB27(q(id));
 assert.equal(admitted.status,"ready",JSON.stringify(admitted).slice(0,400));
 const result=runQuoteEncounterB27({...q(id),
  sourceVersionHash:admitted.sourceVersionHash,canonicalInput:choice});
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,400));
 return {admitted,result};
};
const smithChoice={pairs:[{aId:"sketch",bId:"friend",relationId:"complementarity"}]};
test("Independent audit: original 91 records remain byte-equivalent to versioned ledger",()=>{
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const qblock=app.slice(app.indexOf("const QUOTES=["),app.indexOf("];\n// Daily first"));
 const parsed=qblock.split("\n").filter(x=>x.trim().startsWith("["))
  .map(x=>JSON.parse(x.trim().replace(/,$/,"")));
 assert.equal(parsed.length,91);
 assert.deepEqual(parsed,B27_APP_QUOTES.slice(0,91));
 assert.equal([...app.matchAll(/^\s*\["((?:[^"\\]|\\.)*)","/gm)].length,91,
  "Historical Discover line scanner must still see only the 91 canonical rows");
});
test("Independent audit: source diversity is editorial, not author-routed or automatic approval",()=>{
 const report=reportB27Coverage(),s=report.counts;
 assert.equal(report.total,95);
 assert.deepEqual(s,{playable:6,reading_first:74,awaiting_source_review:8,
  awaiting_reasoning_capability:5,no_fit:2});
 assert.equal(report.rows.filter(x=>x.quoteId<91&&x.status==="playable").length,2);
 assert.equal(B27_EDITORIAL_RECORDS.length,21);
 const statuses=new Set(B27_EDITORIAL_RECORDS.map(x=>x.status));
 assert.deepEqual(statuses,new Set(["playable","awaiting_reasoning_capability","awaiting_source_review","no_fit"]));
 for(const entry of B27_EDITORIAL_RECORDS){
  assert.equal(entry.quoteText,B27_APP_QUOTES[entry.quoteId][0]);
  assert.equal(entry.author,B27_APP_QUOTES[entry.quoteId][1]);
  assert.equal(entry.work,B27_APP_QUOTES[entry.quoteId][3]);
  assert.equal(entry.publicationAllowed,false);
  if(entry.status!=="playable"){
   assert.equal(entry.consideredAdaptations?.length,2);
   assert.equal(entry.consideredAdaptations[1].verdict,"REJECTED");
  }
 }
 for(const id of [20,21,28,31,47,53,56,63,69,70,71,76,77,88,90]){
  assert.equal(resolveQuoteB27(q(id)).status,"no_fit");
 }
 assert.equal(resolveQuoteB27(q(31)).capabilityGap,"mediation_across_the_whole");
 assert.equal(resolveQuoteB27(q(69)).capabilityGap,"logical_propositions_and_facts");
 assert.equal(resolveQuoteB27(q(47)).editorialCoverageStatus,"awaiting_source_review");
 assert.equal(resolveQuoteB27(q(71)).editorialCoverageStatus,"awaiting_reasoning_capability");
});
test("Independent audit: edited source content, stale versions, unknown operation and forged choice fail closed",()=>{
 const valid=resolveQuoteB27(q(91));
 for(const forged of [
  q(91,{quoteText:q(91).quoteText+"!"}),
  q(91,{quoteAuthor:"Another writer"}),
  q(91,{quoteWork:"Fabricated edition"}),
  q(91,{b27DevelopmentOnly:false}),
  q(191)
 ])assert.notEqual(resolveQuoteB27(forged).status,"ready");
 assert.equal(runQuoteEncounterB27({...q(91),
  sourceVersionHash:"sha256:old",canonicalInput:smithChoice}).code,"stale_source");
 for(const canonicalInput of [
  {pairs:[]},
  {pairs:[{aId:"sketch",bId:"friend",relationId:"secret_score"}]},
  {pairs:[{aId:"sketch",bId:"deadline",relationId:"dependence"}]},
  {pairs:[{aId:"sketch",bId:"friend",relationId:"complementarity"}],score:100}
 ])assert.notEqual(runQuoteEncounterB27({...q(91),
  sourceVersionHash:valid.sourceVersionHash,canonicalInput}).status,"ready");
});
test("Independent audit: each four-family source produces replayed 80-120 full, three compact sections and distinct path",()=>{
 const examples=[
  [12,{amounts:[2,2,2],budgets:[6],repetitions:5,touched:true},"balance_move"],
  [34,{path:["change","risk","continue"]},"decision_cards"],
  [91,smithChoice,"tap_pair"],
  [94,{actions:[
    {type:"choose_start",optionId:"stay"},
    {type:"explore_authored",sceneId:"surprise"},
    {type:"choose_response",optionId:"continue"},
    {type:"read_retrospective"}
   ]},"flip_reveal"]
 ];
 const compact=[];
 for(const [id,choice,family] of examples){
  const {result,admitted}=accepted(id,choice);
  assert.equal(result.selectedFamilyId,family);
  assert.equal(result.sourceVersionHash,admitted.sourceVersionHash);
  assert.equal(result.fullExpression.sections.length,3);
  assert.deepEqual(result.fullExpression.sections.map(x=>x.label),
   ["Your Choice","Back to the Philosopher","One Last Thing…"]);
  assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
  const actualCounts=result.fullExpression.sections.map(x=>x.text.trim().split(/\s+/).length);
  assert.deepEqual(result.fullExpression.sectionWordCounts,actualCounts);
  for(let i=0;i<3;i++)assert.ok(actualCounts[i]>=[10,18,9][i]&&actualCounts[i]<=[48,65,26][i]);
  assert.equal(result.compact.sections.length,3);
  assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
  assert.equal(result.compact.fullWordCount,result.fullExpression.wordCount);
  assert.equal(result.compact.unchangedFullExpression,true);
  assert.notEqual(result.emotion?.inferredActualEmotion,true);
  assert.notEqual(result.emotion?.inferredMoralRank,true);
  assert.equal(result.publicationAllowed,false);
  assert.equal(result.accountSaved,false);
  assert.equal(result.canonical_choice!=null,true);
  compact.push(result.compact.sections.map(s=>s.text).join(" "));
 }
 assert.equal(new Set(compact).size,4,"Distinct sources should not collapse into the same expression");
 const first=accepted(12,{amounts:[2,2,2],budgets:[6],repetitions:5,touched:true}).result;
 const revised=accepted(12,{amounts:[3,1,2],budgets:[6],repetitions:5,touched:true}).result;
 assert.notEqual(first.saveKey,revised.saveKey);
 assert.notEqual(first.compact.sections[0].text,revised.compact.sections[0].text);
});
test("Adversarial reachable-state audit: all source-authorized Tap & Pair combinations must finish honestly",()=>{
 for(const id of [91,92]){
  const route=resolveQuoteB27(q(id));
  assert.equal(route.status,"ready");
  const edges=route.record.relation.edges;
  assert.ok(edges.length>=4);
  const choices=[...edges.map(e=>[e])];
  for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++)
   choices.push([edges[i],edges[j]]);
  for(const pair of choices){
   const canonicalInput={pairs:pair.map(({aId,bId,relationId})=>({aId,bId,relationId}))};
   const result=runQuoteEncounterB27({...q(id),sourceVersionHash:route.sourceVersionHash,
    canonicalInput});
   assert.equal(result.status,"ready",
    "Every UI-authorized source edge should finish: "+JSON.stringify({
      quoteId:id,pairs:canonicalInput.pairs,status:result.status,
      reason:result.reason,counts:result.counts,total:result.total}).slice(0,650));
   assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
   const visible=result.compact.sections.map(s=>s.text).join(" ");
   for(const selected of pair){
    const a=route.record.relation.cards.find(x=>x.id===selected.aId).label;
    const b=route.record.relation.cards.find(x=>x.id===selected.bId).label;
    assert.ok(visible.includes(a)&&visible.includes(b),
     "Every chosen relationship must retain both labels in visible result");
   }
  }
 }
});
test("Independent qualitative gate: natural choices and all allocated activities change visible meaning",()=>{
 const uncertain=accepted(34,{path:["change","risk","continue"]}).result;
 const hindsight=accepted(94,{actions:[
  {type:"choose_start",optionId:"stay"},
  {type:"explore_authored",sceneId:"surprise"},
  {type:"choose_response",optionId:"continue"},
  {type:"read_retrospective"}
 ]}).result;
 for(const example of [uncertain,hindsight]){
  const choice=example.compact.sections[0].text;
  assert.match(choice,/^You chose to /);
  assert.match(choice,/In the fictional scene,/);
  assert.match(choice,/You then chose to /);
  assert.doesNotMatch(choice,/\\bchose You\\b/i);
  assert.ok(example.compact.visibleWordCount>=40&&example.compact.visibleWordCount<=65);
 }
 const input=amounts=>({amounts,budgets:[6],repetitions:5,touched:true});
 const messages=accepted(12,input([2,3,1])).result;
 const resting=accepted(12,input([2,1,3])).result;
 assert.notEqual(messages.saveKey,resting.saveKey);
 assert.notEqual(messages.compact.sections[0].text,resting.compact.sections[0].text,
  "Equal first allocation must not conceal differing second and third choices");
 assert.match(messages.compact.sections[0].text,/3 to “Answer messages”/);
 assert.match(messages.compact.sections[0].text,/1 to “Rest and recharge”/);
 assert.match(resting.compact.sections[0].text,/1 to “Answer messages”/);
 assert.match(resting.compact.sections[0].text,/3 to “Rest and recharge”/);
 for(const x of [messages,resting])assert.ok(x.compact.visibleWordCount>=40&&x.compact.visibleWordCount<=65);
 const smith=accepted(91,smithChoice).result;
 assert.match(smith.compact.sections[1].text,/productivity from divided, coordinated work/);
 assert.match(smith.compact.sections[1].text,/fictional, not moral proof/);
});
test("Independent audit: persistence must prove actual readback, including failed deletion and repeated-save identity",()=>{
 const {result}=accepted(91,smithChoice);
 const state={saved:[],savedEncounters:[]};
 let disk=JSON.stringify(state);
 const hooks={persist:()=>{disk=JSON.stringify(state);},
   readback:()=>JSON.parse(disk),clock:()=> "2026-11-17T00:00:00.000Z"};
 assert.equal(saveFinishedEncounter(state,result,hooks).status,"saved");
 assert.equal(state.savedEncounters.length,1);
 assert.equal(state.saved.length,0);
 assert.equal(saveFinishedEncounter(state,result,hooks).alreadyExisted,true);
 assert.equal(state.savedEncounters.length,1);
 const broken={persist:hooks.persist,readback:()=>({})};
 const denied=deleteSavedEncounter(state,result.saveKey,broken);
 assert.equal(denied.status,"not_saved");
 assert.equal(state.savedEncounters.length,1,"Failed delete must rollback memory");
 assert.equal(JSON.parse(disk).savedEncounters.length,1,"Failed delete must rollback disk");
 assert.equal(deleteSavedEncounter(state,result.saveKey,hooks).status,"deleted");
 assert.equal(JSON.parse(disk).savedEncounters.length,0);
 const another={saved:[],savedEncounters:[]};
 let failedDisk=JSON.stringify(another);
 const falseReadback={
   persist:()=>{failedDisk=JSON.stringify(another);},
   readback:()=>({savedEncounters:[]})};
 const deniedSave=saveFinishedEncounter(another,result,falseReadback);
 assert.equal(deniedSave.status,"not_saved");
 assert.equal(another.savedEncounters.length,0);
 assert.equal(JSON.parse(failedDisk).savedEncounters.length,0);
});

test("Evidence package: exact authentic catalogue coverage and four source-bound before/after expressions",()=>{
 const cases=[
  {title:"Dillard balanced evening",id:12,input:{amounts:[2,2,2],budgets:[6],repetitions:5,touched:true}},
  {title:"Dillard revised evening",id:12,input:{amounts:[3,1,2],budgets:[6],repetitions:5,touched:true}},
  {title:"Kierkegaard uncertain decision",id:34,input:{path:["change","risk","continue"]}},
  {title:"Smith shared gift",id:91,input:smithChoice},
  {title:"Kierkegaard authored hindsight",id:94,input:{actions:[
   {type:"choose_start",optionId:"stay"},
   {type:"explore_authored",sceneId:"surprise"},
   {type:"choose_response",optionId:"continue"},
   {type:"read_retrospective"}
  ]}}
 ];
 const evidence=cases.map(({title,id,input})=>{
  const {admitted,result}=accepted(id,input);
  return {title,quoteId:id,sourceQuote:admitted.quote,
   family:admitted.selectedFamilyId,authenticatedQuoteFingerprint:result.quoteFingerprint,
   authenticatedSourceVersionHash:result.sourceVersionHash,
   sourceReview:result.sourceReview,canonicalChoice:result.canonical_choice,
   beforeFull:{wordCount:result.fullExpression.wordCount,sections:result.fullExpression.sections},
   afterCompact:{wordCount:result.compact.visibleWordCount,sections:result.compact.sections},
   uncertainty:result.uncertainty,
   noPsychologicalInference:result.emotion?.inferredActualEmotion===false,
   published:false};
 });
 mkdirSync("qa-evidence-independent",{recursive:true});
 writeFileSync("qa-evidence-independent/expression-comparisons.json",
  JSON.stringify({engineeringSha:"670c68d326c9fa7da66e6d4833d4359edd286def",
   analysis:"Full three-section 80-120 expression remains unchanged; 40-65-word compact view is another rendering of the authenticated result, not a revised historical engine.",
   examples:evidence},null,2));
 writeFileSync("qa-evidence-independent/editorial-catalogue-coverage.json",
  JSON.stringify(reportB27Coverage(),null,2));
 assert.equal(evidence.length,5);
 assert.ok(evidence.every(x=>x.beforeFull.wordCount>x.afterCompact.wordCount));
});
