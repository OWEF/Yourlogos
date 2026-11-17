/**
 * R2 PREVIOUSLY DISCLOSED HOLDOUT — regression after engineering correction. Originally revealed after frozen engineering
 * SHA 53819f2a87b1d9a8e7405f1587c0c0baf9a946fd and freeze PR comment.
 * First authored by independent QA, but exposed before a later semantic-correctness fix; regression only. NO shared-engine source/UI edits.
 * Source wording remains development provisional and NOT scholarly certified.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const SHA="53819f2a87b1d9a8e7405f1587c0c0baf9a946fd";
const q=id=>B27_APP_QUOTES[id];
const card=(id,label,detail)=>({id,label,detail});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,warrantIds:["source:central","scenario:fictional"]});
const create=(id,x)=>({
 quoteId:id,recordId:"cz147-r2-final-unseen:"+id,
 version:"qa-post-final-engine-freeze/1",status:"development_provisional",
 developmentOnly:false,publicationAllowed:false,
 source:{text:q(id)[0],author:q(id)[1],work:q(id)[3],
  referenceUrl:x.referenceUrl},
 evidenceIds:["source:central","scenario:fictional","source:boundary"],
 prohibitedInferences:["actual reader feelings","psychological diagnosis",
  "innate intellectual worth","a verified future event","a real-person moral verdict"],
 supportedConclusions:["Only a source-bounded relationship is illustrated"],
 ...x
});
const sources=[
 create(42,{
  familyId:"tap_pair",
  referenceUrl:"https://sourcebooks.fordham.edu/ancient/aristotle-metaphysics.asp",
  title:"The delight of noticing",
  intro:"An imagined museum visitor enjoys looking closely at unfamiliar objects even before deciding whether that observation will be useful.",
  humanTension:"Seeing and wanting to understand something beyond its immediate practical benefit.",
  sourceThesis:"The desire to know appears even in delight in our senses",
  evidenceClaim:"Aristotle treats delight in sensation as evidence of a wish to know",
  epistemicLimits:"An invented encounter cannot measure an individual's actual love of knowledge",
  compactLimit:"A clicked link cannot prove anyone naturally curious",
  counterexample:"Enjoying the senses does not by itself certify completed knowledge",
  readerAgency:"Connect source-warranted relationships between sensory attention inquiry and usefulness",
  reflectionQuestion:"What kind of noticing matters even when it is not immediately useful?",
  philosophicalOperation:{kind:"source_relation",
   focus:"curiosity and perception valued beyond immediate utility",
   contrast:"delight in perception versus practical usefulness",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("delight","Sensory delight","Pleasure in perceiving things"),
   card("utility","Practical usefulness","How perception serves an immediate task"),
   card("desire","Desire to know","The inclination toward understanding"),
   card("sight","Sight","A sense that brings distinctions into view"),
   card("differences","Noticing differences","Recognizing differences between objects")
  ],edges:[
   edge("delight","utility","contrast","Delight beyond use",
    "Sense-perception can be enjoyed even when it serves no immediate practical use"),
   edge("delight","desire","support","Sensing and curiosity",
    "Delight in sensation is one sign of the desire to know"),
   edge("sight","differences","support","Seeing differences",
    "Sight can disclose differences between things and thereby aid knowing"),
   edge("desire","differences","complementarity","Curiosity and distinctions",
    "The desire to know and attention to differences can converge without proving complete understanding")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 create(76,{
  familyId:"tap_pair",
  referenceUrl:"https://ctext.org/zhuangzi/floods-of-autumn",
  title:"Beyond the well's horizon",
  intro:"Imagine people arguing about a distant landscape that none has seen. One of them realizes their familiar surroundings cannot stand for everything.",
  humanTension:"Confidently relying on a narrow standpoint or admitting what lies beyond it.",
  sourceThesis:"A confined standpoint can limit what one is able to understand",
  evidenceClaim:"The well-bound frog lacks the perspective needed to comprehend the sea's scale",
  epistemicLimits:"An invented parable does not measure any actual person's intelligence",
  compactLimit:"A game relation cannot diagnose a real person's narrowness",
  counterexample:"New experience can expand perspective without granting total knowledge",
  readerAgency:"Explore metaphorical links between bounded horizons new encounters and perspective",
  reflectionQuestion:"What encounter could make a familiar viewpoint seem less complete?",
  philosophicalOperation:{kind:"source_relation",
   focus:"limits of understanding from a confined standpoint",
   contrast:"a bounded horizon versus an expanded encounter",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("well","The familiar well","The frog's confined surroundings"),
   card("sea","The distant sea","A much larger reality beyond the well"),
   card("assumption","Fixed assumptions","Ideas shaped by a restricted horizon"),
   card("encounter","Broader encounter","A new perspective that may challenge assumptions")
  ],edges:[
   edge("well","sea","contrast","Small and vast",
    "The well's confines do not reveal the scale of the sea beyond"),
   edge("assumption","encounter","contrast","Assumptions and discovery",
    "A fixed outlook may be challenged by an encounter beyond its old horizon"),
   edge("encounter","sea","support","Meeting the sea",
    "Encountering a larger world can expose limits of the earlier perspective without yielding omniscience"),
   edge("well","assumption","support","A bounded standpoint",
    "The well illustrates how limited surroundings can shape what seems imaginable")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 })
];
const registry=makeUniversalRegistry(sources,B27_APP_QUOTES);
const identification=r=>({quoteId:r.quoteId,quoteText:r.source.text,
 quoteAuthor:r.source.author,quoteWork:r.source.work,b27DevelopmentOnly:false});
const link=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
const possibilities=r=>{
 const es=r.relation.edges;
 return [
  ...es.map(e=>({pairs:[link(e)]})),
  ...es.flatMap((e,i)=>es.slice(i+1).map(f=>({pairs:[link(e),link(f)]})))
 ];
};
function run(r,choice){
 const admitted=registry.resolve(identification(r));
 assert.equal(admitted.status,"ready");
 const output=registry.run({...identification(r),canonicalInput:choice,
  sourceVersionHash:admitted.sourceVersionHash});
 assert.equal(output.status,"ready",JSON.stringify({id:r.quoteId,choice,
  status:output.status,reason:output.reason,code:output.code}).slice(0,900));
 assert.equal(output.fullMeaning.meaning.philosophicalOperation.kind,"source_relation");
 assert.equal(output.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.equal(output.selectedFamilyId,"tap_pair");
 assert.ok(output.fullExpression.wordCount>=80&&output.fullExpression.wordCount<=120);
 assert.ok(output.compact.visibleWordCount>=40&&output.compact.visibleWordCount<=65);
 assert.equal(output.compact.sections.length,3);
 assert.equal(output.fullExpression.sections.length,3);
 assert.ok(output.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(output.compact.sections[1].text.includes(r.compactLimit));
 assert.equal(output.emotion.inferredActualEmotion,false);
 assert.equal(output.provenance.unchosenFutureKnown,false);
 assert.equal(output.publicationAllowed,false);
 return output;
}
test("Genuinely unseen Aristotle and Zhuangzi, immutable quotations, unsupported Locke provenance abstention",()=>{
 assert.deepEqual(sources.map(r=>r.quoteId),[42,76]);
 assert.equal(new Set(sources.map(x=>x.source.author)).size,2);
 for(const r of sources){
  assert.equal(CZ147_SOURCE_RECORDS.some(old=>old.quoteId===r.quoteId),false);
  assert.notEqual(sealUniversalSource(r).status,"blocked");
  assert.equal(r.source.text,q(r.quoteId)[0]);
  assert.equal(r.source.work,q(r.quoteId)[3]);
  assert.equal(resolveQuoteB27(identification(r)).status,"no_fit");
 }
 // The existing immutable catalogue locates Locke #57 in IV.iii,
 // whereas the quotation occurs in II.i.19. It is not QA-admitted.
 const locke=q(57);
 assert.match(locke[3],/IV\.iii/);
 assert.equal(resolveQuoteB27({quoteId:57,quoteText:locke[0],
  quoteAuthor:locke[1],quoteWork:locke[3],b27DevelopmentOnly:false}).status,"no_fit");
});
test("All 20 fresh, source-warranted pairing paths compose complete non-generic three-engine output",()=>{
 const failures=[],counts=[],samples=[];
 for(const r of sources){
  const seen=new Set();
  for(const choice of possibilities(r)){
   const out=run(r,choice);
   assert.ok(!seen.has(out.saveKey));
   seen.add(out.saveKey);
   const labels=new Map(r.relation.cards.map(c=>[c.id,c.label]));
   for(const pair of out.canonical_choice.pairs){
    assert.ok(out.compact.sections[0].text.includes(labels.get(pair.aId)));
    assert.ok(out.compact.sections[0].text.includes(labels.get(pair.bId)));
   }
   const text=out.compact.sections.map(s=>s.text).join(" ");
   assert.doesNotMatch(text,/you are ignorant|you must feel|you are wise|you are naturally curious/i);
   assert.doesNotMatch(out.compact.sections[1].text,
    /The relevant philosophical distinction is/i);
   assert.doesNotMatch(out.compact.sections[2].text,
    /What does this chosen relationship explain/i);
   if(seen.size===1)samples.push({quoteId:r.quoteId,
    author:r.source.author,sourceThesis:r.sourceThesis,
    sourceOperation:r.philosophicalOperation,
    chosen:choice,reasoning:out.fullMeaning,emotion:out.emotion,
    full:out.fullExpression,compact:out.compact});
  }
  counts.push({quoteId:r.quoteId,author:r.source.author,states:seen.size});
  assert.equal(seen.size,10);
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/final-unseen-two-source-20-state.json",
  JSON.stringify({engineeringSha:SHA,method:"novel QA-only source records after final freeze",
   sources:counts,samples,scholarlySignoff:false,appPublished:false,
   sourceReview:"provisional_context_checked_not_external_approval"},null,2));
 assert.equal(counts.reduce((n,x)=>n+x.states,0),20);
});
test("Within-source different edges change warranted interpretation; equivalent orientation does not",()=>{
 const results=[];
 for(const r of sources){
  const [a,b]=possibilities(r);
  const before=run(r,a),after=run(r,b);
  assert.notEqual(before.saveKey,after.saveKey);
  assert.notEqual(before.fullMeaning.meaning.selectedClaim,
   after.fullMeaning.meaning.selectedClaim);
  assert.notEqual(before.compact.sections[1].text,after.compact.sections[1].text);
  assert.notEqual(before.compact.sections[2].text,after.compact.sections[2].text);
  const p=a.pairs[0],reverse={pairs:[{aId:p.bId,bId:p.aId,relationId:p.relationId}]};
  const parity=run(r,reverse);
  assert.equal(parity.saveKey,before.saveKey);
  assert.deepEqual(parity.compact.sections,before.compact.sections);
  results.push({quoteId:r.quoteId,author:r.source.author,
   sourceThesis:r.sourceThesis,operation:r.philosophicalOperation,
   before:{choice:a,reasoning:before.fullMeaning,emotion:before.emotion,
    full:before.fullExpression,compact:before.compact},
   after:{choice:b,reasoning:after.fullMeaning,emotion:after.emotion,
    full:after.fullExpression,compact:after.compact}});
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/final-unseen-contrast.json",
  JSON.stringify({engineeringSha:SHA,comparison:results},null,2));
});
