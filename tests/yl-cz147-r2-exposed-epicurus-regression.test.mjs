/**
 * CZ-147 R2 EXPOSED INDEPENDENT SOURCE REGRESSION.
 *
 * These source contracts were disclosed on QA-only PR #228 AFTER
 * engineering PR #227 was frozen at exact SHA
 * d15e934eef4624723bdfcf41029383c08cef43ce (freeze PR comment).
 * #43 Aristotle (Nicomachean Ethics I.7) and #44 Epicurus
 * (Letter to Menoeceus) were not in engineering source fixtures or
 * any prior QA fixture. Same Tap & Pair game, radically different theses.
 *
 * All philosophical editorial warrants are INTERNAL/PROVISIONAL.
 * No external scholarly signoff, user psychological inference or publication.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const ENGINEERING_SHA="d15e934eef4624723bdfcf41029383c08cef43ce";
const quote=id=>B27_APP_QUOTES[id];
const card=(id,label,detail)=>({id,label,detail});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,
 warrantIds:["source:central","scenario:fictional"]});
const define=(id,body)=>({
 quoteId:id,recordId:"qa-r2-final-post-freeze:"+id,
 version:"qa-r2-fresh-after-engine-freeze/1",
 status:"development_provisional",developmentOnly:false,
 publicationAllowed:false,
 source:{text:quote(id)[0],author:quote(id)[1],
  work:quote(id)[3],referenceUrl:body.referenceUrl},
 evidenceIds:["source:central","scenario:fictional","source:boundary"],
 prohibitedInferences:["actual reader moral character","reader personality",
  "real life flourishing score","real fear of death or mental illness",
  "certain outcome in the reader's future"],
 supportedConclusions:["Source-backed conceptual implications in an authored fictional situation only"],
 ...body
});
const fresh=[
 define(43,{
  familyId:"tap_pair",
  referenceUrl:"https://adfonteslibrary.org/work-aristotle-nicomachean-ethics",
  title:"A good life in action",
  intro:"A friend says that intending to be fair is enough; another asks whether the way we actually act matters. Consider the difference without judging anyone's actual character.",
  humanTension:"Admiring excellent qualities while wondering how they become a life of activity.",
  sourceThesis:"For Aristotle happiness is lived activity in accordance with virtue",
  evidenceClaim:"The cited account distinguishes exercising excellence from merely possessing a disposition",
  epistemicLimits:"One invented conversation cannot decide whether a person truly flourishes or acts virtuously",
  compactLimit:"A selected link cannot certify anyone's virtue or happiness",
  counterexample:"One action cannot establish a complete flourishing life without broader context",
  readerAgency:"Choose a source-authorized relation among excellence action disposition and flourishing",
  reflectionQuestion:"How could active exercise of excellence differ from merely claiming to possess it?",
  philosophicalOperation:{kind:"source_relation",
   focus:"happiness as excellent activity rather than passive possession",
   contrast:"active virtue versus passive disposition",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("activity","Lived activity","What someone actually does in a fictional situation"),
   card("virtue","Virtuous excellence","A philosophical account of excellence in conduct"),
   card("disposition","Possessed disposition","A trait someone may have without exercising"),
   card("flourishing","Human flourishing","The philosophical good of an entire human life")
  ],edges:[
   edge("activity","virtue","complementarity","Action and excellence",
    "The cited good life requires activity in accordance with virtue rather than mere possession"),
   edge("disposition","activity","contrast","Possession and exercise",
    "Having an excellent disposition without exercise is not the same as activity expressing it"),
   edge("virtue","flourishing","support","Excellence and living well",
    "Activity according to virtue contributes to Aristotle's account of human flourishing"),
   edge("activity","flourishing","support","Practicing a good life",
    "Flourishing involves sustained activity rather than one isolated pleasant moment")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 define(44,{
  familyId:"tap_pair",
  referenceUrl:"https://classics.mit.edu/Epicurus/menoec.html",
  title:"What death can mean",
  intro:"Two people discuss why anticipation of death troubles the living. They distinguish fearing an event now from undergoing a sensation when awareness has ended.",
  humanTension:"An understandable fear anticipated while alive and a philosophical argument about experience after death.",
  sourceThesis:"For Epicurus death lacks sensation and so is not an experienced harm",
  evidenceClaim:"The cited argument connects felt good and ill with awareness and denies sensation in death",
  epistemicLimits:"A fictional exercise cannot settle a reader's real beliefs grief or emotional response to mortality",
  compactLimit:"A concept link cannot measure a person's actual fear of death",
  counterexample:"The argument does not erase the pain of bereavement experienced by people who remain alive",
  readerAgency:"Connect the text's concepts without treating a philosophical premise as a personal diagnosis",
  reflectionQuestion:"How does fearing death while living differ from sensation after death?",
  philosophicalOperation:{kind:"source_relation",
   focus:"the absence of sensation in the condition of death",
   contrast:"anticipated fear while alive versus absence of experience after death",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("awareness","Conscious experience","Awareness while alive"),
   card("feeling","Felt good or ill","Pleasure and pain dependent on sensation"),
   card("death","Absence of sensation","Death as the lack of awareness in the argument"),
   card("anticipation","Anticipated fear","Distress a living person may anticipate")
  ],edges:[
   edge("awareness","feeling","support","Sensation and value",
    "Epicurus connects experienced good or ill with the presence of sensation"),
   edge("death","awareness","contrast","Death without awareness",
    "Death is described as deprivation of sensation, not as another experienced pain"),
   edge("anticipation","death","contrast","Fear and its object",
    "The experience of anticipating death occurs while alive and differs from the absence of sensation"),
   edge("feeling","death","contrast","Experience and cessation",
    "A felt pleasure or pain differs from the absence of experiencing anything")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 })
];
const registry=makeUniversalRegistry(fresh,B27_APP_QUOTES);
const identity=r=>({quoteId:r.quoteId,quoteText:r.source.text,
 quoteAuthor:r.source.author,quoteWork:r.source.work,
 b27DevelopmentOnly:false});
const link=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
const paths=r=>{
 const es=r.relation.edges;
 return [...es.map(e=>({pairs:[link(e)]})),
  ...es.flatMap((e,i)=>es.slice(i+1).map(f=>({pairs:[link(e),link(f)]})))];
};
function run(r,canonical){
 const allowed=registry.resolve(identity(r));
 assert.equal(allowed.status,"ready");
 const result=registry.run({...identity(r),
  sourceVersionHash:allowed.sourceVersionHash,canonicalInput:canonical});
 assert.equal(result.status,"ready",JSON.stringify({
  id:r.quoteId,canonical,status:result.status,
  code:result.code,reason:result.reason}).slice(0,850));
 assert.equal(result.selectedFamilyId,"tap_pair");
 assert.equal(result.fullMeaning.meaning.philosophicalOperation.kind,"source_relation");
 assert.equal(result.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.equal(result.fullExpression.sections.length,3);
 assert.equal(result.compact.sections.length,3);
 assert.deepEqual(result.compact.sections.map(s=>s.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.ok(result.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(result.compact.sections[1].text.includes(r.compactLimit));
 assert.equal(result.emotion.inferredActualEmotion,false);
 assert.equal(result.provenance.unchosenFutureKnown,false);
 assert.equal(result.publicationAllowed,false);
 assert.doesNotMatch(result.compact.sections.map(x=>x.text).join(" "),
  /you are virtuous|you have no fear|your personality|you must feel|you are happy/i);
 return result;
}
test("EXPOSED source regression Aristotle and Epicurus sources are identity-exact and provisional",()=>{
 assert.deepEqual(fresh.map(x=>x.quoteId),[43,44]);
 assert.equal(new Set(fresh.map(x=>x.source.author)).size,2);
 for(const r of fresh){
  assert.equal(CZ147_SOURCE_RECORDS.some(x=>x.quoteId===r.quoteId),false);
  assert.notEqual(sealUniversalSource(r).status,"blocked",r.recordId);
  assert.equal(r.source.text,quote(r.quoteId)[0]);
  assert.equal(r.source.work,quote(r.quoteId)[3]);
  assert.equal(resolveQuoteB27(identity(r)).status,"no_fit");
  assert.equal(r.publicationAllowed,false);
 }
});
test("All 20 previously disclosed source relation choices retain source thesis and distinct philosophical operation",()=>{
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 const counts=[],examples=[];
 for(const r of fresh){
  const ids=new Set();
  for(const canonical of paths(r)){
   const x=run(r,canonical);
   assert.ok(!ids.has(x.saveKey));
   ids.add(x.saveKey);
   const cards=new Map(r.relation.cards.map(c=>[c.id,c.label]));
   for(const pair of x.canonical_choice.pairs)
    assert.ok(x.compact.sections[0].text.includes(cards.get(pair.aId))&&
     x.compact.sections[0].text.includes(cards.get(pair.bId)));
   assert.doesNotMatch(x.compact.sections[1].text,
    /The relevant philosophical distinction is/i);
   assert.doesNotMatch(x.compact.sections[2].text,
    /What does this chosen relationship explain/i);
   if(ids.size===1)examples.push({
    quoteId:r.quoteId,author:r.source.author,
    canonical,sourcePremises:{thesis:r.sourceThesis,evidence:r.evidenceClaim,
     limits:r.epistemicLimits,counter:r.counterexample},
    sourceOperation:r.philosophicalOperation,meaning:x.fullMeaning,
    rhetoric:x.emotion,full:x.fullExpression,compact:x.compact
   });
  }
  counts.push({quoteId:r.quoteId,author:r.source.author,states:ids.size});
  assert.equal(ids.size,10);
 }
 writeFileSync("qa-evidence-cz147-r2-independent/final-fresh-aristotle-epicurus.json",
  JSON.stringify({previouslyExposedEngineeringSha:ENGINEERING_SHA,
   nowRegressionBecauseEngineeringChanged:true,sourcePublicationAuthorized:false,
   independentScholarlySignoff:false,counts,examples},null,2));
 assert.equal(counts.reduce((n,x)=>n+x.states,0),20);
});
test("Same game and operator do not collapse Aristotle's virtue or Epicurus's non-sensation into generic psychology",()=>{
 const a=run(fresh[0],paths(fresh[0])[0]),
  b=run(fresh[1],paths(fresh[1])[0]);
 assert.equal(a.selectedFamilyId,b.selectedFamilyId);
 assert.equal(a.fullMeaning.meaning.philosophicalOperation.kind,
  b.fullMeaning.meaning.philosophicalOperation.kind);
 assert.notEqual(a.fullMeaning.meaning.centralClaim,b.fullMeaning.meaning.centralClaim);
 assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
 assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
 assert.match(a.compact.sections.slice(1).map(x=>x.text).join(" "),/activity|virtue|excellence/i);
 assert.match(b.compact.sections.slice(1).map(x=>x.text).join(" "),/sensation|awareness|death/i);
 assert.doesNotMatch(a.compact.sections[1].text,/death lacks sensation/i);
 assert.doesNotMatch(b.compact.sections[1].text,/happiness is lived activity/i);
});
test("Novel same-source contrasts alter real reasoning, source-grounded section II and III while preserving semantic equality",()=>{
 const evidence=[];
 for(const r of fresh){
  const first=paths(r)[0],second=paths(r)[1];
  const x=run(r,first),y=run(r,second);
  assert.notEqual(x.saveKey,y.saveKey);
  assert.equal(x.fullMeaning.meaning.centralClaim,y.fullMeaning.meaning.centralClaim);
  assert.notEqual(x.fullMeaning.meaning.selectedClaim,y.fullMeaning.meaning.selectedClaim);
  assert.notEqual(x.compact.sections[1].text,y.compact.sections[1].text);
  assert.notEqual(x.compact.sections[2].text,y.compact.sections[2].text);
  const p=first.pairs[0];
  const reverse={pairs:[{aId:p.bId,bId:p.aId,relationId:p.relationId}]};
  const eq=run(r,reverse);
  assert.equal(eq.saveKey,x.saveKey);
  assert.deepEqual(eq.fullMeaning,x.fullMeaning);
  assert.deepEqual(eq.compact.sections,x.compact.sections);
  evidence.push({quoteId:r.quoteId,author:r.source.author,
   sourceThesis:r.sourceThesis,operation:r.philosophicalOperation,
   before:{canonical:first,meaning:x.fullMeaning,emotion:x.emotion,
    full:x.fullExpression,compact:x.compact},
   after:{canonical:second,meaning:y.fullMeaning,emotion:y.emotion,
    full:y.fullExpression,compact:y.compact}});
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/final-fresh-philosophical-ab.json",
  JSON.stringify({previouslyExposedEngineeringSha:ENGINEERING_SHA,comparisons:evidence},null,2));
});
