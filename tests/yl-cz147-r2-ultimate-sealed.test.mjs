/**
 * CZ-147 R2 previously revealed source regression, after later wording correction.
 * Created ONLY after engineering PR #227 was frozen at
 * 53819f2a87b1d9a8e7405f1587c0c0baf9a946fd and recorded freeze comment.
 * New untouched quotes: Montaigne #82, Socrates #2; all previously disclosed
 * #50/#72/#9/#75, #10/#40/#16/#3, #54/#60/#45, #78/#5, #42/#76 are
 * regression ONLY. These are provisional and NOT source-publication approval.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27,runQuoteEncounterB27} from "../experiments/yl-b27-route.mjs";
const FINAL_SHA="53819f2a87b1d9a8e7405f1587c0c0baf9a946fd";
const quote=id=>B27_APP_QUOTES[id];
const card=(id,label,detail)=>({id,label,detail});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,
 warrantIds:["source:central","scenario:fictional"]});
const newSource=(id,fields)=>({
 quoteId:id,recordId:"cz147-r2-ultimate-sealed:"+id,
 version:"after-final-truthful-engine-freeze/1",
 status:"development_provisional",developmentOnly:false,
 publicationAllowed:false,
 source:{text:quote(id)[0],author:quote(id)[1],
  work:quote(id)[3],referenceUrl:fields.referenceUrl},
 evidenceIds:["source:central","scenario:fictional","source:boundary"],
 prohibitedInferences:["real reader virtue","actual emotional experience",
  "moral worth of a real life","actual writing honesty","verified private intentions"],
 supportedConclusions:["The selected source-owned philosophical relationship is a hypothetical illustration only"],
 ...fields
});
const unseen=[
 newSource(82,{
  familyId:"tap_pair",
  referenceUrl:"https://en.wikisource.org/wiki/Ives_The_Essays_of_Montaigne/Volume_1/To_the_Reader",
  title:"An honest portrait",
  intro:"Imagine writing a personal reflection for friends. You can describe ordinary experiences plainly, but are tempted to impress unknown readers instead.",
  humanTension:"Presenting one's ordinary experience candidly while feeling pressure to please an audience.",
  sourceThesis:"The writer makes his ordinary self the subject of his own writing",
  evidenceClaim:"A candid self-portrait need not be decorated to earn public admiration",
  epistemicLimits:"An invented writing choice cannot establish anyone's actual motives or honesty",
  compactLimit:"This game cannot verify how candidly anyone really writes",
  counterexample:"Candid self-expression does not require disclosing every private detail",
  readerAgency:"Connect authored concepts in the fictional writing situation without diagnosing sincerity",
  reflectionQuestion:"What could an honest self-portrait say without being shaped by applause?",
  philosophicalOperation:{kind:"source_relation",
   focus:"self-portrait through ordinary experience rather than public performance",
   contrast:"candid self-description versus flattering public embellishment",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("experience","Lived experience","Ordinary moments recalled in one's writing"),
   card("portrait","Candid portrait","A plain self-description without borrowed grandeur"),
   card("applause","Public applause","Praise or approval from an imagined audience"),
   card("image","Decorated image","An adorned self-presentation intended to impress")
  ],edges:[
   edge("experience","portrait","support","Experience as subject",
    "Ordinary personal experience can provide the matter of a candid self-portrait"),
   edge("applause","image","support","Appeasing the audience",
    "Seeking public favor may encourage embellished presentation instead of a candid portrait"),
   edge("portrait","image","contrast","Plain versus adorned",
    "A self-portrait in an ordinary form differs from a studied public image"),
   edge("applause","portrait","contrast","Praise versus sincerity",
    "Public acclaim is not the declared purpose of this personal portrayal")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 newSource(2,{
  familyId:"tap_pair",
  referenceUrl:"https://chs.harvard.edu/primary-source/plato-the-apology-of-socrates-sb/",
  title:"Questioning what is accepted",
  intro:"A fictional group repeats a familiar belief about fairness. One participant asks why that belief should be accepted rather than merely inherited.",
  humanTension:"Accepting familiar opinions for convenience or testing the reasons behind them.",
  sourceThesis:"Examination of beliefs is central to a life worth living",
  evidenceClaim:"Socrates places the repeated examination of oneself and others within a valuable life",
  epistemicLimits:"A selected card cannot determine the moral worth of a real person's life",
  compactLimit:"A game relation cannot judge anyone's actual moral worth",
  counterexample:"Asking one good question does not complete a life of examination",
  readerAgency:"Choose supported conceptual links about examining assumptions and giving reasons",
  reflectionQuestion:"What would asking for reasons contribute beyond repeating a familiar belief?",
  philosophicalOperation:{kind:"source_relation",
   focus:"reflective examination of beliefs through ongoing dialogue",
   contrast:"untested convention versus reasons open to examination",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("habit","Inherited belief","A familiar claim accepted without examination"),
   card("question","Reflective question","A request for reasons supporting that claim"),
   card("conversation","Reasoned dialogue","Conversation that tests ideas and commitments"),
   card("reasons","Examined reasons","Arguments considered in response to inquiry")
  ],edges:[
   edge("habit","question","contrast","Habit versus inquiry",
    "Repeating an accepted opinion is distinct from examining the reasons behind it"),
   edge("question","reasons","support","Reasons under examination",
    "Asking a genuine question can invite arguments to be examined"),
   edge("conversation","question","support","Dialogue and inquiry",
    "Conversation can create opportunities for sustained examination of beliefs"),
   edge("habit","reasons","contrast","Opinion versus examination",
    "An inherited opinion is not yet an account of the reasons that warrant it")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 })
];
const registry=makeUniversalRegistry(unseen,B27_APP_QUOTES);
const identity=r=>({quoteId:r.quoteId,quoteText:r.source.text,
 quoteAuthor:r.source.author,quoteWork:r.source.work,
 b27DevelopmentOnly:false});
const link=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
function choices(r){
 const es=r.relation.edges;
 return [...es.map(e=>({pairs:[link(e)]})),
  ...es.flatMap((e,i)=>es.slice(i+1).map(f=>({pairs:[link(e),link(f)]})))];
}
function run(r,canonical){
 const entry=registry.resolve(identity(r));
 assert.equal(entry.status,"ready");
 const x=registry.run({...identity(r),
  sourceVersionHash:entry.sourceVersionHash,
  canonicalInput:canonical});
 assert.equal(x.status,"ready",JSON.stringify({
  quote:r.quoteId,canonical,status:x.status,reason:x.reason,code:x.code}).slice(0,950));
 assert.equal(x.selectedFamilyId,r.familyId);
 assert.equal(x.fullMeaning.meaning.philosophicalOperation.kind,"source_relation");
 assert.equal(x.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.ok(x.fullExpression.wordCount>=80&&x.fullExpression.wordCount<=120);
 assert.ok(x.compact.visibleWordCount>=40&&x.compact.visibleWordCount<=65);
 assert.deepEqual(x.compact.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.deepEqual(x.fullExpression.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.equal(x.emotion.inferredActualEmotion,false);
 assert.equal(x.provenance.authoredEventCausedByReader,false);
 assert.equal(x.provenance.unchosenFutureKnown,false);
 assert.equal(x.publicationAllowed,false);
 assert.ok(x.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(x.compact.sections[1].text.includes(r.compactLimit));
 const visible=x.compact.sections.map(x=>x.text).join(" ");
 assert.doesNotMatch(visible,/you are virtuous|you are a good person|you are wise|you are dishonest/i);
 assert.doesNotMatch(x.compact.sections[1].text,/The relevant philosophical distinction is/i);
 return x;
}
test("Previously disclosed two source-authored philosophers remain provisional and unadmitted",()=>{
 assert.deepEqual(unseen.map(x=>x.quoteId),[82,2]);
 assert.equal(new Set(unseen.map(x=>x.source.author)).size,2);
 for(const r of unseen){
  assert.equal(CZ147_SOURCE_RECORDS.some(x=>x.quoteId===r.quoteId),false);
  assert.notEqual(sealUniversalSource(r).status,"blocked");
  assert.equal(r.source.text,quote(r.quoteId)[0]);
  assert.equal(r.source.work,quote(r.quoteId)[3]);
  assert.equal(resolveQuoteB27(identity(r)).status,"no_fit");
 }
});
test("All 20 new source-authorized concept paths return complete grounded interpretation",()=>{
 const counts=[],samples=[];
 for(const r of unseen){
  const unique=new Set();
  for(const choice of choices(r)){
   const v=run(r,choice);
   assert.ok(!unique.has(v.saveKey));
   unique.add(v.saveKey);
   const names=new Map(r.relation.cards.map(x=>[x.id,x.label]));
   for(const p of v.canonical_choice.pairs){
    assert.ok(v.compact.sections[0].text.includes(names.get(p.aId)));
    assert.ok(v.compact.sections[0].text.includes(names.get(p.bId)));
   }
   if(unique.size===1)samples.push({
    quoteId:r.quoteId,author:r.source.author,work:r.source.work,
    thesis:r.sourceThesis,operation:r.philosophicalOperation,
    choice,reasoning:v.fullMeaning,emotion:v.emotion,
    full:v.fullExpression,compact:v.compact});
  }
  counts.push({id:r.quoteId,author:r.source.author,states:unique.size});
  assert.equal(unique.size,10);
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/final-post-truthfulness-source-challenge.json",
  JSON.stringify({finalEngineeringSha:FINAL_SHA,authoredAfterFinalFreeze:true,
   scholarlyVerification:false,publicationApproved:false,
   counts,samples},null,2));
 assert.equal(counts.reduce((s,x)=>s+x.states,0),20);
});
test("Different source relations must alter both reasoning and philosophical question without invented reader properties",()=>{
 const comparisons=[];
 for(const r of unseen){
  const first=choices(r)[0],second=choices(r)[1];
  const a=run(r,first),b=run(r,second);
  assert.notEqual(a.saveKey,b.saveKey);
  assert.notEqual(a.fullMeaning.meaning.selectedClaim,
   b.fullMeaning.meaning.selectedClaim);
  assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
  assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
  const p=first.pairs[0],reverse={pairs:[{
   aId:p.bId,bId:p.aId,relationId:p.relationId}]};
  const equivalent=run(r,reverse);
  assert.equal(a.saveKey,equivalent.saveKey);
  assert.deepEqual(a.compact.sections,equivalent.compact.sections);
  comparisons.push({id:r.quoteId,author:r.source.author,
   sourceThesis:r.sourceThesis,
   before:{canonical:first,meaning:a.fullMeaning,emotion:a.emotion,
    compact:a.compact,full:a.fullExpression},
   after:{canonical:second,meaning:b.fullMeaning,emotion:b.emotion,
    compact:b.compact,full:b.fullExpression}});
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/final-post-truthfulness-a-b.json",
  JSON.stringify({finalEngineeringSha:FINAL_SHA,comparisons},null,2));
});
test("Independent consumer source: never falsely claim all slots or dominance for mixed/equal time",()=>{
 const seneca=resolveQuoteB27({quoteId:49,
  quoteText:quote(49)[0],quoteAuthor:quote(49)[1],
  quoteWork:quote(49)[3],b27DevelopmentOnly:false});
 assert.equal(seneca.status,"ready");
 for(const amounts of [[4,2,2],[0,1,7],[3,3,2],[2,3,3],[2,2,4],[0,0,8]]){
  const out=runQuoteEncounterB27({quoteId:49,
   quoteText:quote(49)[0],quoteAuthor:quote(49)[1],
   quoteWork:quote(49)[3],b27DevelopmentOnly:false,
   sourceVersionHash:seneca.sourceVersionHash,
   canonicalInput:{amounts,budgets:[8],touched:true}});
  assert.equal(out.status,"ready",JSON.stringify({amounts,out}).slice(0,850));
  const copy=out.compact.sections[1].text+" "+out.fullExpression.sections[1].text;
  if(amounts.filter(n=>n>0).length>1)
   assert.doesNotMatch(copy,/giving every slot|all slots to|reserved all/i,
    "False exclusivity on "+JSON.stringify(amounts));
  if(amounts.every(n=>n===amounts[0]))
   assert.doesNotMatch(copy,/largest share|most time to/i);
 }
});
