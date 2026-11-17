/**
 * CZ-147 R2.1 disclosed Pascal/Hume regression: TWO PREVIOUSLY DISCLOSED source
 * records originally disclosed after R2 engineering freeze at
 * 7f6cc8c09309ad08ced6b65928007bc3c2b53c1c.
 *
 * NOT independent scholarly signoff: provisional, source-contingent human
 * analogies. Distinct authentic excerpts, same Tap & Pair presentation and
 * same authenticated source_relation operation. These sources and edges are
 * absent from the development registry and any earlier QA fixtures.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const FREEZE="7f6cc8c09309ad08ced6b65928007bc3c2b53c1c";
const get=id=>B27_APP_QUOTES[id];
const card=(id,label,detail)=>({id,label,detail});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,
 warrantIds:["source:central","scenario:fictional"]});
function record(id,body){
 return {quoteId:id,recordId:"r2-qa-fresh-"+id,
  version:"r2-after-correction-freeze/1",
  developmentOnly:false,status:"development_provisional",
  publicationAllowed:false,
  source:{text:get(id)[0],author:get(id)[1],work:get(id)[3],
   referenceUrl:body.referenceUrl},
  evidenceIds:["source:central","scenario:fictional","source:boundary"],
  prohibitedInferences:["reader emotion","diagnosis","moral character",
   "guaranteed success","true identity or personality"],
  supportedConclusions:["A source-bounded conceptual relationship in a fictional situation"],
  ...body};
}
const fresh=[
 record(25,{
  familyId:"tap_pair",title:"When reasoning does not explain everything",
  referenceUrl:"https://www.gutenberg.org/ebooks/18269",
  intro:"A friend feels committed to helping someone, although the precise basis of the attachment is difficult to formalize. Examine reasons, attachment and proof without declaring any person's conviction correct.",
  humanTension:"A meaningful attachment may exceed what a formal demonstration can explain.",
  sourceThesis:"Pascal distinguishes the heart's reasons from what discursive reasoning knows",
  evidenceClaim:"A personally compelling reason is not identical with a demonstrative proof",
  epistemicLimits:"This fictional discussion cannot establish anyone's sincerity truth or virtue",
  compactLimit:"A connection does not certify someone's actual inner convictions",
  counterexample:"An intensely felt conviction can still be mistaken and should not automatically override evidence",
  readerAgency:"Select a warranted connection without claiming that feelings prove the truth",
  reflectionQuestion:"Where could lived attachment differ from proof without becoming automatically correct?",
  philosophicalOperation:{kind:"source_relation",
   focus:"the contrast between reasons of the heart and discursive understanding",
   contrast:"the heart's reasons versus what reasoning can demonstrate",
   sourceWarrantIds:["source:central"]},
  affordances:["boundary_awareness","curious_reflection"],
  relation:{cards:[
   card("attachment","Lived attachment","A personally meaningful fictional commitment"),
   card("proof","Formal demonstration","A publicly articulable argument"),
   card("care","Concern for someone","An imagined form of affection or care"),
   card("explanation","Discursive explanation","Reasons that can be explicitly stated")
  ],edges:[
   edge("attachment","proof","contrast","Attachment and proof",
    "A commitment experienced as meaningful is not itself the same as a formal proof"),
   edge("care","attachment","support","Care and attachment",
    "Concern for another person may contribute to a commitment without guaranteeing it is true"),
   edge("proof","explanation","support","Proof and explanation",
    "A formal demonstration can provide an articulable account yet not exhaust every lived reason"),
   edge("care","explanation","contrast","Care and discourse",
    "The experience of concern may exceed an explanation without thereby proving a proposition")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 record(26,{
  familyId:"tap_pair",title:"What moves a practical choice",
  referenceUrl:"https://www.gutenberg.org/ebooks/4705",
  intro:"A volunteer can calculate an efficient route, yet must still decide which concern makes the work worth doing. Explore practical ends and reasoning without treating feelings as evidence.",
  humanTension:"Reason may find effective means while desire supplies motivation for pursuing an end.",
  sourceThesis:"Hume presents reason as subordinate to passions in motivating human action",
  evidenceClaim:"Reasoning about facts and means does not by itself supply the desire to act",
  epistemicLimits:"An invented choice cannot determine any real person's motives desires or virtues",
  compactLimit:"These connections do not diagnose anyone's actual motives",
  counterexample:"A desire does not establish factual accuracy or remove the need for careful reasoning",
  readerAgency:"Explore source-authorized conceptual links without inferring actual feelings",
  reflectionQuestion:"What could reasoning clarify without deciding which end should motivate action?",
  philosophicalOperation:{kind:"source_relation",
   focus:"passions as motivating ends and reason as an instrument of understanding",
   contrast:"practical motivation versus discovering effective means",
   sourceWarrantIds:["source:central"]},
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("desire","Practical desire","An imagined motivating concern"),
   card("reason","Instrumental reasoning","Thinking through practical means"),
   card("end","Chosen practical end","A purpose pursued in a fictional plan"),
   card("evidence","Available evidence","Relevant information for factual judgment")
  ],edges:[
   edge("desire","end","dependence","Desire and ends",
    "The imagined practical end becomes motivating through a concern or desire"),
   edge("reason","evidence","support","Reason and evidence",
    "Reasoning can assess available evidence about how a practical plan might work"),
   edge("reason","desire","contrast","Reason and motivation",
    "Reasoning about facts is not identical with the passion that motivates action"),
   edge("end","evidence","contrast","Purpose and facts",
    "Choosing a practical end does not establish the factual evidence needed to achieve it")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 })
];
const registry=makeUniversalRegistry(fresh,B27_APP_QUOTES);
const id=r=>({quoteId:r.quoteId,quoteText:r.source.text,quoteAuthor:r.source.author,
 quoteWork:r.source.work,b27DevelopmentOnly:false});
const paths=r=>{
 const es=r.relation.edges;
 const p=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
 return [...es.map(e=>({pairs:[p(e)]})),
 ...es.flatMap((e,i)=>es.slice(i+1).map(f=>({pairs:[p(e),p(f)]})))];
};
function run(r,canonical){
 const admitted=registry.resolve(id(r));
 assert.equal(admitted.status,"ready");
 const o=registry.run({...id(r),sourceVersionHash:admitted.sourceVersionHash,
  canonicalInput:canonical});
 assert.equal(o.status,"ready",JSON.stringify({author:r.source.author,
  canonical,status:o.status,code:o.code,reason:o.reason}).slice(0,900));
 assert.equal(o.fullMeaning.meaning.philosophicalOperation.kind,"source_relation");
 assert.equal(o.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.ok(o.fullExpression.wordCount>=80&&o.fullExpression.wordCount<=120);
 assert.ok(o.compact.visibleWordCount>=40&&o.compact.visibleWordCount<=65);
 assert.equal(o.compact.sections.length,3);
 assert.ok(o.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(o.compact.sections[1].text.includes(r.compactLimit));
 assert.equal(o.emotion.inferredActualEmotion,false);
 assert.equal(o.provenance.unchosenFutureKnown,false);
 assert.equal(o.publicationAllowed,false);
 assert.doesNotMatch(o.compact.sections.map(s=>s.text).join(" "),
  /you must feel|your personality|you are virtuous|your anxiety|you are mentally/i);
 return o;
}
test("REGRESSION originally disclosed after R2 engineering freeze: Pascal and Hume are exact and provisional",()=>{
 assert.deepEqual(fresh.map(r=>r.quoteId),[25,26]);
 assert.notEqual(fresh[0].source.author,fresh[1].source.author);
 for(const r of fresh){
  assert.ok(!CZ147_SOURCE_RECORDS.some(x=>x.quoteId===r.quoteId));
  assert.notEqual(sealUniversalSource(r).status,"blocked",r.recordId);
  assert.equal(r.source.text,get(r.quoteId)[0]);
  assert.equal(r.source.work,get(r.quoteId)[3]);
  assert.equal(resolveQuoteB27(id(r)).status,"no_fit",
   "New QA sources are not silently admitted to consumer app");
  assert.equal(r.publicationAllowed,false);
 }
});
test("20 disclosed Pascal/Hume choices preserve distinct source operations and compact word policy",()=>{
 mkdirSync("qa-evidence-cz147-r2-fresh",{recursive:true});
 const samples=[],totals=[];
 for(const r of fresh){
  const seen=new Set();
  for(const p of paths(r)){
   const out=run(r,p);
   assert.ok(!seen.has(out.saveKey));
   seen.add(out.saveKey);
   const cards=new Map(r.relation.cards.map(c=>[c.id,c.label]));
   for(const pair of out.canonical_choice.pairs)
    assert.ok(out.compact.sections[0].text.includes(cards.get(pair.aId))&&
     out.compact.sections[0].text.includes(cards.get(pair.bId)));
   assert.doesNotMatch(out.compact.sections[1].text,
    /The relevant philosophical distinction is/i);
   if(seen.size===1)samples.push({author:r.source.author,
    quote:r.source.text,operation:r.philosophicalOperation,
    canonical:p,reasoning:out.fullMeaning,emotion:out.emotion,
    full:out.fullExpression,compact:out.compact});
  }
  totals.push({quoteId:r.quoteId,states:seen.size});
  assert.equal(seen.size,10);
 }
 writeFileSync("qa-evidence-cz147-r2-fresh/fresh-pascal-hume.json",
  JSON.stringify({disclosedEngineeringSha:FREEZE,
   newSourceProvisional:true,scholarlyApproval:false,
   totals,examples:samples},null,2));
 assert.equal(totals.reduce((n,x)=>n+x.states,0),20);
});
test("Same game and shared operation do not confuse Pascal's heart with Hume's passions",()=>{
 const p=run(fresh[0],paths(fresh[0])[0]),h=run(fresh[1],paths(fresh[1])[0]);
 assert.equal(p.selectedFamilyId,h.selectedFamilyId);
 assert.equal(p.fullMeaning.meaning.philosophicalOperation.kind,
  h.fullMeaning.meaning.philosophicalOperation.kind);
 assert.notEqual(p.fullMeaning.meaning.centralClaim,
  h.fullMeaning.meaning.centralClaim);
 assert.notEqual(p.compact.sections[1].text,h.compact.sections[1].text);
 assert.match(p.compact.sections.slice(1).map(s=>s.text).join(" "),
  /heart|reason|proof|attachment/i);
 assert.match(h.compact.sections.slice(1).map(s=>s.text).join(" "),
  /passion|reason|desire|motivat/i);
 assert.doesNotMatch(p.compact.sections[1].text,/subordinate to passions/i);
 assert.doesNotMatch(h.compact.sections[1].text,/heart's reasons/i);
});
test("Fresh relations change sections II and III, equivalent reverse relations replay same meaning",()=>{
 const comparisons=[];
 for(const r of fresh){
  const es=r.relation.edges,p=e=>({pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId}]});
  const a=run(r,p(es[0])),b=run(r,p(es[1]));
  assert.notEqual(a.saveKey,b.saveKey);
  assert.notEqual(a.fullMeaning.meaning.selectedClaim,b.fullMeaning.meaning.selectedClaim);
  assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
  assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
  const reverse=run(r,{pairs:[{aId:es[0].bId,bId:es[0].aId,relationId:es[0].relationId}]});
  assert.equal(reverse.saveKey,a.saveKey);
  assert.deepEqual(reverse.fullMeaning,a.fullMeaning);
  assert.deepEqual(reverse.compact.sections,a.compact.sections);
  comparisons.push({source:r.source.author,sourceThesis:r.sourceThesis,
   operation:r.philosophicalOperation,
   before:{choice:p(es[0]),meaning:a.fullMeaning,emotion:a.emotion,
    full:a.fullExpression,compact:a.compact},
   after:{choice:p(es[1]),meaning:b.fullMeaning,emotion:b.emotion,
    full:b.fullExpression,compact:b.compact}});
 }
 mkdirSync("qa-evidence-cz147-r2-fresh",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-fresh/fresh-source-comparisons.json",
  JSON.stringify({disclosedEngineeringSha:FREEZE,comparisons},null,2));
});

test("R2.1: Hume assessing evidence is never rewritten as reasoning supporting or causing evidence",()=>{
 const h=fresh.find(x=>x.quoteId===26);
 const e=h.relation.edges.find(x=>x.aId==="reason"&&x.bId==="evidence");
 assert.ok(e);
 assert.match(e.claim,/assess available evidence/);
 const a=run(h,{pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId}]});
 const b=run(h,{pairs:[{aId:e.bId,bId:e.aId,relationId:e.relationId}]});
 assert.deepEqual(a.compact.sections,b.compact.sections);
 assert.equal(a.saveKey,b.saveKey);
 for(const out of [a,b]){
  const argument=out.compact.sections[1].text;
  const question=out.compact.sections[2].text;
  assert.match(argument,/reasoning can assess available evidence/i);
  assert.doesNotMatch(question,/reasoning (?:to |can )?(?:support|cause|produce)(?:s|ing)? available evidence/i);
  assert.match(question,/assess available evidence|reason and evidence|selected/i);
  assert.doesNotMatch(argument,/David Hume: Hume presents/i);
  assert.doesNotMatch(out.fullExpression.sections[1].text,/David Hume: Hume presents/i);
  assert.equal(out.fullMeaning.meaning.choiceAnalysis.links[0].claim,e.claim);
 }
});
test("R2.1: Pascal's authored contributions do not become categorical causal support",()=>{
 const p=fresh.find(x=>x.quoteId===25);
 const e=p.relation.edges.find(x=>x.aId==="care"&&x.bId==="attachment");
 const a=run(p,{pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId}]});
 const b=run(p,{pairs:[{aId:e.bId,bId:e.aId,relationId:e.relationId}]});
 assert.deepEqual(a.compact.sections,b.compact.sections);
 assert.match(a.compact.sections[1].text,/may contribute to a commitment/i);
 assert.doesNotMatch(a.compact.sections[2].text,/care (?:to )?support(?:s|ing)? lived attachment/i);
 assert.doesNotMatch(a.compact.sections[1].text,/Blaise Pascal: Pascal distinguishes/i);
 assert.doesNotMatch(a.fullExpression.sections[1].text,/Blaise Pascal: Pascal distinguishes/i);
});
test("R2.1: Smith dependencies and Wollstonecraft's self-government use selected edge claims with canonical direction equality",()=>{
 const trusted=CZ147_SOURCE_RECORDS.filter(x=>[23,91].includes(x.quoteId));
 const catalog=makeUniversalRegistry(trusted,B27_APP_QUOTES);
 for(const r of trusted){
  const ident={quoteId:r.quoteId,quoteText:r.source.text,quoteAuthor:r.source.author,
   quoteWork:r.source.work,b27DevelopmentOnly:r.developmentOnly};
  const source=catalog.resolve(ident);
  assert.equal(source.status,"ready");
  for(const e of r.relation.edges){
   const input={pairs:[{aId:e.aId,bId:e.bId,relationId:e.relationId}]};
   const reverse={pairs:[{aId:e.bId,bId:e.aId,relationId:e.relationId}]};
   const a=catalog.run({...ident,sourceVersionHash:source.sourceVersionHash,canonicalInput:input});
   const b=catalog.run({...ident,sourceVersionHash:source.sourceVersionHash,canonicalInput:reverse});
   assert.equal(a.status,"ready",JSON.stringify({id:r.quoteId,edge:e.label,status:a.status,reason:a.reason}));
   assert.equal(b.status,"ready");
   assert.equal(a.saveKey,b.saveKey);
   assert.deepEqual(a.compact.sections,b.compact.sections);
   assert.equal(a.fullMeaning.meaning.choiceAnalysis.links[0].claim,e.claim);
   assert.equal(a.compact.sections.length,3);
   assert.match(a.compact.sections[1].text,new RegExp(r.sourceThesis.replace(/[.*+?^\\${}()|[\\]\\\\]/g,"\\\\$&"),"i"));
   assert.ok(a.compact.sections[2].text.includes(e.label)||
    a.compact.sections[2].text.includes(e.claim.slice(0,18).toLowerCase())||
    a.compact.sections[2].text.toLowerCase().includes("connection"),
    "Question must tie to the selected relation rather than assert an unsupported arrow");
   assert.doesNotMatch(a.compact.sections[2].text,/\b(?:automatically causes|necessarily creates|proves that)\b/i);
  }
 }
});
test("R2.1: adversarial SUPPORT label is not converted into a directional source claim",()=>{
 const h=fresh.find(x=>x.quoteId===26);
 const relation=structuredClone(h.relation);
 const i=relation.edges.findIndex(e=>e.aId==="reason"&&e.bId==="evidence");
 relation.edges[i].claim="Available evidence can be assessed to test a proposed account; reasoning does not cause the facts";
 const altered={...h,recordId:h.recordId+":adversarial-direction",version:"qa-known-direction-v2",relation};
 const testRegistry=makeUniversalRegistry([altered],B27_APP_QUOTES);
 const identity={quoteId:altered.quoteId,quoteText:altered.source.text,
  quoteAuthor:altered.source.author,quoteWork:altered.source.work,b27DevelopmentOnly:false};
 const admitted=testRegistry.resolve(identity);
 const canonical={pairs:[{aId:"reason",bId:"evidence",relationId:"support"}]};
 const out=testRegistry.run({...identity,sourceVersionHash:admitted.sourceVersionHash,
  canonicalInput:canonical});
 assert.equal(out.status,"ready",JSON.stringify(out).slice(0,1200));
 assert.match(out.fullMeaning.meaning.selectedClaim,/reasoning does not cause the facts/);
 assert.doesNotMatch(out.compact.sections[2].text,/reasoning supports available evidence|reasoning causes available evidence/i);
 assert.ok(out.compact.sections[2].text.includes("Reason and evidence")||
  /Available evidence can be assessed/i.test(out.compact.sections[2].text));
});
