/**
 * CZ-147 R2 PREVIOUSLY DISCLOSED SOURCE REGRESSION.
 * Initially authored after the preceding engineering freeze at
 * 53819f2a87b1d9a8e7405f1587c0c0baf9a946fd. Sources id 78 & 5
 * remain absent from the developer registry, but were disclosed before the latest shared-engine quality correction.
 * All source interpretation remains INTERNAL/PROVISIONAL, not approval to ship.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const FROZEN_SHA="53819f2a87b1d9a8e7405f1587c0c0baf9a946fd";
const q=id=>B27_APP_QUOTES[id];
const c=(id,label,detail)=>({id,label,detail});
const e=(aId,bId,relationId,label,claim)=>({aId,bId,relationId,label,claim,
 warrantIds:["source:central","scenario:fictional"]});
const source=(id,values)=>({
 quoteId:id,recordId:"cz147-r2-postfinal-qa:"+id,version:"post-final-freeze/1",
 status:"development_provisional",developmentOnly:false,publicationAllowed:false,
 source:{text:q(id)[0],author:q(id)[1],work:q(id)[3],referenceUrl:""},
 evidenceIds:["source:central","scenario:fictional","source:boundary"],
 prohibitedInferences:["actual personality","actual reader emotions","mental health",
  "genuine enlightened state","predicted third-party reaction"],
 supportedConclusions:["A concept relation may illustrate a source-bounded philosophical distinction"],
 ...values
});
const fresh=[
 source(78,{
  familyId:"tap_pair",title:"Knowing and admitting limits",
  intro:"You have to discuss an unfamiliar proposal with a colleague. Distinguish claims you can support, unanswered questions and unwarranted confidence.",
  humanTension:"Giving a reasoned answer without pretending that every unknown is already known.",
  sourceThesis:"Knowledge requires recognizing both what one knows and what remains unknown",
  evidenceClaim:"Confident assertion is not the same as recognizing the limits of knowledge",
  epistemicLimits:"An invented concept link cannot determine what any actual person knows",
  compactLimit:"A clicked relationship does not measure your real knowledge",
  counterexample:"Admitting uncertainty does not mean that no claims can be known",
  readerAgency:"Connect two supported epistemic concepts without a right answer hidden in the interface",
  reflectionQuestion:"Where would acknowledging uncertainty improve your understanding rather than stop inquiry?",
  philosophicalOperation:{kind:"source_relation",
   focus:"knowing while acknowledging the limits of knowledge",
   contrast:"warranted understanding versus unsupported confidence",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   c("known","Known claim","A point supported in this fictional discussion"),
   c("unknown","Open question","What this discussion has not established"),
   c("inquiry","Further inquiry","A way of examining unresolved claims"),
   c("confidence","Excess confidence","Certainty exceeding available reasons")
  ],edges:[
   e("known","unknown","contrast","Known and unknown",
    "What is supported must be distinguished from what remains unestablished"),
   e("unknown","inquiry","support","Uncertainty guides inquiry",
    "Acknowledging an open question can guide inquiry without pretending it is solved"),
   e("known","confidence","contrast","Knowing versus confidence",
    "Feeling certain is not the same as possessing supported knowledge"),
   e("inquiry","known","support","Investigating a claim",
    "Careful inquiry can extend knowledge without verifying every belief")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 source(5,{
  familyId:"tap_pair",title:"Outward and inward knowing",
  intro:"Imagine advising a colleague who is good at reading other people's behavior but rarely examines their own decisions. Explore the two forms of understanding.",
  humanTension:"Interpreting others while making room for examination of one's own conduct.",
  sourceThesis:"Knowing other people and understanding oneself are distinct kinds of insight",
  evidenceClaim:"Attention to others does not necessarily supply understanding of one's own conduct",
  epistemicLimits:"An imaginary relationship cannot establish another person's wisdom or self-awareness",
  compactLimit:"A selected link cannot prove anyone truly enlightened",
  counterexample:"Knowing oneself does not make every judgment about others irrelevant",
  readerAgency:"Link source-supported outward and inward concepts without pretending to diagnose self-knowledge",
  reflectionQuestion:"What could examining your own choices add to insight about another person?",
  philosophicalOperation:{kind:"source_relation",
   focus:"self-knowledge alongside knowledge of other people",
   contrast:"outward understanding versus inward discernment",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   c("others","Knowing others","Limited insight into other people's choices"),
   c("self","Knowing oneself","Reflection on one's own reasons and conduct"),
   c("observing","Observing conduct","Attention to visible actions"),
   c("reflection","Self-reflection","Examining one's own decisions")
  ],edges:[
   e("others","self","contrast","Distinct directions",
    "Knowing others and knowing oneself are distinct kinds of understanding"),
   e("observing","others","support","Outward attention",
    "Observing another person's conduct can inform limited understanding of them"),
   e("reflection","self","support","Inward attention",
    "Reflection on one's own decisions can support self-understanding without certifying it"),
   e("observing","reflection","contrast","Outward and inward",
    "Observing another's conduct does not substitute for examining one's own choices")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 })
];
const registry=makeUniversalRegistry(fresh,B27_APP_QUOTES);
const identity=r=>({quoteId:r.quoteId,quoteText:r.source.text,
 quoteAuthor:r.source.author,quoteWork:r.source.work,b27DevelopmentOnly:false});
const single=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
function choices(r){
 const edges=r.relation.edges;
 const result=edges.map(e=>({pairs:[single(e)]}));
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++)
  result.push({pairs:[single(edges[i]),single(edges[j])]});
 return result;
}
function run(r,canonical){
 const allowed=registry.resolve(identity(r));
 assert.equal(allowed.status,"ready");
 const result=registry.run({...identity(r),sourceVersionHash:allowed.sourceVersionHash,
  canonicalInput:canonical});
 assert.equal(result.status,"ready",JSON.stringify({
  id:r.quoteId,canonical,status:result.status,code:result.code,reason:result.reason}).slice(0,850));
 assert.equal(result.selectedFamilyId,r.familyId);
 assert.equal(result.fullMeaning.meaning.philosophicalOperation.kind,
  r.philosophicalOperation.kind);
 assert.equal(result.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.deepEqual(result.compact.sections.map(s=>s.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.equal(result.emotion.inferredActualEmotion,false);
 assert.equal(result.provenance.authoredEventCausedByReader,false);
 assert.equal(result.publicationAllowed,false);
 assert.ok(result.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(result.compact.sections[1].text.includes(r.compactLimit));
 return result;
}
test("POST-FINAL-FREEZE fixtures: two genuinely unimplemented source IDs, no engine-code change",()=>{
 assert.deepEqual(fresh.map(r=>r.quoteId),[78,5]);
 assert.equal(new Set(fresh.map(r=>r.source.author)).size,2);
 for(const r of fresh){
  assert.equal(CZ147_SOURCE_RECORDS.some(x=>x.quoteId===r.quoteId),false);
  assert.notEqual(sealUniversalSource(r).status,"blocked");
  assert.equal(q(r.quoteId)[0],r.source.text);
  assert.equal(q(r.quoteId)[3],r.source.work);
  assert.equal(resolveQuoteB27(identity(r)).status,"no_fit",
   "Unscholarly-reviewed holdout must not be admitted to consumer app");
 }
});
test("20/20 genuinely unseen source-warranted relations retain their own interpretations",()=>{
 const counts=[],samples=[];
 for(const r of fresh){
  const visited=new Set();
  for(const canonical of choices(r)){
   const result=run(r,canonical);
   assert.ok(!visited.has(result.saveKey));
   visited.add(result.saveKey);
   for(const p of result.canonical_choice.pairs){
    const labels=new Map(r.relation.cards.map(c=>[c.id,c.label]));
    assert.ok(result.compact.sections[0].text.includes(labels.get(p.aId)));
    assert.ok(result.compact.sections[0].text.includes(labels.get(p.bId)));
   }
   assert.doesNotMatch(result.compact.sections.slice(1).map(x=>x.text).join(" "),
    /you are wise|you lack knowledge|your ignorance proves|you are enlightened/i);
   if(visited.size===1)samples.push({quoteId:r.quoteId,author:r.source.author,
    sourceThesis:r.sourceThesis,operation:r.philosophicalOperation,
    input:canonical,reasoning:result.fullMeaning,emotion:result.emotion,
    full:result.fullExpression,compact:result.compact});
  }
  counts.push({quoteId:r.quoteId,author:r.source.author,states:visited.size});
  assert.equal(visited.size,10);
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/postfreeze-unseen-source-results.json",
  JSON.stringify({frozenEngineeringSha:FROZEN_SHA,
   authorship:"QA-only source contracts disclosed before latest quality correction; counted as regression",
   scholarlyVerified:false,productionAdmitted:false,
   sourceContext:[{id:78,work:"Analects 2.17",textRevision:"translation varies"},
    {id:5,work:"Dao De Jing 33",textRevision:"translation varies"}],
   counts,samples},null,2));
 assert.equal(counts.reduce((s,x)=>s+x.states,0),20);
});
test("Same mini-game, same reusable operation, genuinely distinct philosophies",()=>{
 const a=run(fresh[0],choices(fresh[0])[0]);
 const b=run(fresh[1],choices(fresh[1])[0]);
 assert.equal(a.selectedFamilyId,b.selectedFamilyId);
 assert.equal(a.fullMeaning.meaning.philosophicalOperation.kind,
  b.fullMeaning.meaning.philosophicalOperation.kind);
 assert.notEqual(a.fullMeaning.meaning.centralClaim,b.fullMeaning.meaning.centralClaim);
 assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
 assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
 assert.match(a.compact.sections.slice(1).map(x=>x.text).join(" "),
  /knowledge|knowing|uncertain|confidence/i);
 assert.match(b.compact.sections.slice(1).map(x=>x.text).join(" "),
  /self|own|others|people/i);
});
test("Fresh within-source choice, pair direction and source identity gates",()=>{
 const comparison=[];
 for(const r of fresh){
  const [left,right]=[run(r,choices(r)[0]),run(r,choices(r)[1])];
  assert.notEqual(left.saveKey,right.saveKey);
  assert.notEqual(left.fullMeaning.meaning.selectedClaim,
   right.fullMeaning.meaning.selectedClaim);
  assert.notEqual(left.compact.sections[1].text,right.compact.sections[1].text);
  assert.notEqual(left.compact.sections[2].text,right.compact.sections[2].text);
  const first=choices(r)[0].pairs[0];
  const reversed={pairs:[{aId:first.bId,bId:first.aId,relationId:first.relationId}]};
  const equivalent=run(r,reversed);
  assert.equal(left.saveKey,equivalent.saveKey);
  assert.deepEqual(left.fullMeaning,equivalent.fullMeaning);
  assert.deepEqual(left.compact.sections,equivalent.compact.sections);
  assert.notEqual(registry.resolve({...identity(r),quoteText:"incorrect wording"}).status,"ready");
  comparison.push({id:r.quoteId,author:r.source.author,
   sourcePremise:r.sourceThesis,
   before:{canonical:choices(r)[0],reasoning:left.fullMeaning,
    emotion:left.emotion,full:left.fullExpression,compact:left.compact},
   after:{canonical:choices(r)[1],reasoning:right.fullMeaning,
    emotion:right.emotion,full:right.fullExpression,compact:right.compact}});
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/postfreeze-contrasts.json",
  JSON.stringify({frozenEngineeringSha:FROZEN_SHA,comparisons:comparison},null,2));
});
