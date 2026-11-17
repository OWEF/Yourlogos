/**
 * CZ-147 R2 independently disclosed source challenge: regression after R2 correction.
 * Previously held out IDs #54, #60, #45 were absent from the original developer fixtures;
 * #13 and #7 deliberately remain no-fit/source-review. All sources are
 * development-provisional, not external scholarly certification.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const FROZEN="53819f2a87b1d9a8e7405f1587c0c0baf9a946fd";
const q=id=>B27_APP_QUOTES[id];
const make=(id,fields)=>({
 quoteId:id,recordId:"qa-post-freeze-r2:"+id,version:"qa-r2-sealed/1",
 status:"development_provisional",developmentOnly:false,publicationAllowed:false,
 source:{text:q(id)[0],author:q(id)[1],work:q(id)[3],referenceUrl:""},
 evidenceIds:["source:central","source:boundary","scenario:fictional"],
 prohibitedInferences:["actual reader emotion","real moral character","legal outcome",
  "reader personality","third-party future behavior"],
 supportedConclusions:["Only a source-bounded interpretation of the fictional selected concepts"],
 ...fields
});
const card=(id,label,detail)=>({id,label,detail});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,
 warrantIds:["source:central","scenario:fictional"]});
const routes=(starts,scenes,responses)=>starts.flatMap(s=>scenes.flatMap(d=>
 responses.map(r=>({
 startId:s.id,startLabel:s.label,sceneId:d.id,sceneLabel:d.label,
 authoredText:[d.text],responseId:r.id,responseLabel:r.label,
 responseStance:r.stance,authoredFutureIsPrediction:false
 }))));
const sources=[
 make(54,{
  familyId:"decision_cards",
  philosophicalOperation:{kind:"independent_judgment",
   focus:"trusting present conviction under social pressure",
   contrast:"independent present judgment versus outward conformity",
   sourceWarrantIds:["source:central"],
   startRoles:[{id:"prior",role:"retain_prior"},{id:"review",role:"reexamine_prior"}]},
  title:"When the group remembers your words",
  intro:"At a fictional meeting you once supported a plan. Others now invoke your words, but you must decide whether present reasons still justify them.",
  humanTension:"Maintaining conviction under group pressure or examining a prior position honestly.",
  sourceThesis:"Self-reliance asks for independent judgment rather than automatic conformity to approval",
  evidenceClaim:"A present conviction is not automatically discredited by others' expectations",
  epistemicLimits:"This invented debate cannot determine whether any real conviction is sound",
  compactLimit:"The invented argument cannot certify actual independent judgment",
  counterexample:"Self-trust does not mean immunity to evidence or correction",
  readerAgency:"Decide whether to stand by an earlier view, see an unrelated challenge, and respond",
  reflectionQuestion:"What current reason could support a view without relying on audience approval?",
  affordances:["revisability","choice_awareness","uncertainty_awareness"],
  timeline:routes([
   {id:"prior",label:"You maintain your earlier position"},
   {id:"review",label:"You review your position again"}
  ],[
   {id:"challenge",label:"a colleague presents new evidence",
    text:"An invented colleague offers additional evidence without establishing the correct position"},
   {id:"praise",label:"the audience praises your certainty",
    text:"Imagined praise arrives without proving your earlier position was warranted"}
  ],[
   {id:"weigh",label:"You weigh your present reasons",stance:"reconsider"},
   {id:"speak",label:"You explain your position",stance:"hold"}
  ])
 }),
 make(60,{
  familyId:"tap_pair",
  philosophicalOperation:{kind:"self_governance",
   focus:"individual sovereignty in self-regarding matters",
   contrast:"avoiding harm to others versus enforcing personal approval",
   sourceWarrantIds:["source:central"]},
  title:"Persuasion is not coercion",
  intro:"Imagine a community discussing a person's private decision. Some offer reasons, while others demand force. Separate personal authority from justified limits.",
  humanTension:"Disagreeing with a choice without assuming the right to control another person.",
  sourceThesis:"Self-regarding choices belong to individuals rather than coercive social control",
  evidenceClaim:"Persuasion and coercion are distinct ways of responding to disagreement",
  epistemicLimits:"An invented forum cannot establish applicable law or actual harm to anyone",
  compactLimit:"These links decide no real legal or ethical dispute",
  counterexample:"Preventing harm to others raises a separate issue from mere disapproval",
  readerAgency:"Choose concept links about personal sovereignty, persuasion, harm and compulsion",
  reflectionQuestion:"When does disagreement become coercion rather than justified persuasion?",
  affordances:["boundary_awareness","curious_reflection"],
  relation:{cards:[
   card("choice","Private choice","An imagined self-regarding decision"),
   card("persuasion","Persuasion","An attempt to offer reasons without force"),
   card("coercion","Coercion","Imposed control over another's decision"),
   card("harm","Harm to others","A distinct question of another person's injury")
  ],edges:[
   edge("choice","coercion","contrast","Choice versus force",
    "Personal decisions are not themselves permission to impose control"),
   edge("persuasion","coercion","contrast","Arguing versus forcing",
    "Offering reasons differs from compelling another person's agreement"),
   edge("harm","coercion","agency_boundary","Harm and social intervention",
    "Preventing harm to others raises grounds different from dislike of private choices"),
   edge("choice","persuasion","support","Persuasion respects choice",
    "Respect for personal sovereignty can coexist with disagreement and persuasion")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 make(45,{
  familyId:"tap_pair",
  philosophicalOperation:{kind:"source_relation",
   focus:"tranquility as pleasure beyond sensory excess",
   contrast:"absence of disturbance versus endless stimulation",
   sourceWarrantIds:["source:central"]},
  title:"What counts as pleasure?",
  intro:"Two friends debate an enjoyable evening. One imagines an expensive feast; the other values relief, calm and thoughtful choice. No option diagnoses their real happiness.",
  humanTension:"Pursuing brief excitement while also valuing freedom from pain and disturbance.",
  sourceThesis:"Pleasure includes freedom from bodily pain and mental disturbance",
  evidenceClaim:"Stable ease is not reducible to an endless succession of intense sensations",
  epistemicLimits:"This fictional discussion cannot determine whether any real person feels pleasure",
  compactLimit:"A tapped link cannot reveal a person's actual happiness",
  counterexample:"A simple enjoyable activity need not be morally wrong or valueless",
  readerAgency:"Explore source-authorized links between bodily ease, calm, luxury and judgment",
  reflectionQuestion:"How could pleasure depend on tranquility rather than constant stimulation?",
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   card("bodily","Bodily relief","Freedom from physical pain"),
   card("mental","Mental calm","A mind free of disturbance"),
   card("luxury","Luxury","An intense and potentially fleeting delight"),
   card("prudence","Prudent choice","Reasoned judgment about desires")
  ],edges:[
   edge("bodily","mental","complementarity","Two forms of ease",
    "Bodily ease and mental tranquility are joined in the cited definition of pleasure"),
   edge("luxury","mental","contrast","Excitement and calm",
    "Intense luxury is not identical to the state of freedom from disturbance"),
   edge("prudence","bodily","support","Judgment and relief",
    "Prudent choice can serve bodily ease without guaranteeing comfort"),
   edge("prudence","mental","support","Reasoning and tranquility",
    "Careful evaluation of desire can support a less disturbed mental state")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 })
];
const registry=makeUniversalRegistry(sources,B27_APP_QUOTES);
function input(r,choice){
 return {quoteId:r.quoteId,quoteText:r.source.text,
  quoteAuthor:r.source.author,quoteWork:r.source.work,
  b27DevelopmentOnly:false,canonicalInput:choice};
}
function choices(r){
 if(r.familyId==="decision_cards")
  return r.timeline.map(t=>({path:[t.startId,t.sceneId,t.responseId]}));
 const es=r.relation.edges,one=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
 return [...es.map(e=>({pairs:[one(e)]})),
  ...es.flatMap((e,i)=>es.slice(i+1).map(other=>({pairs:[one(e),one(other)]})))];
}
function run(r,c){
 const accepted=registry.resolve(input(r,null));
 assert.equal(accepted.status,"ready");
 const x=registry.run({...input(r,c),sourceVersionHash:accepted.sourceVersionHash});
 assert.equal(x.status,"ready",JSON.stringify({id:r.quoteId,c,reason:x.reason,code:x.code}).slice(0,950));
 assert.equal(x.fullMeaning.meaning.philosophicalOperation.kind,r.philosophicalOperation.kind);
 assert.equal(x.fullExpression.sections.length,3);
 assert.equal(x.compact.sections.length,3);
 assert.ok(x.fullExpression.wordCount>=80&&x.fullExpression.wordCount<=120);
 assert.ok(x.compact.visibleWordCount>=40&&x.compact.visibleWordCount<=65);
 assert.equal(x.provenance.authoredEventCausedByReader,false);
 assert.equal(x.provenance.unchosenFutureKnown,false);
 assert.equal(x.emotion.inferredActualEmotion,false);
 assert.equal(x.publicationAllowed,false);
 assert.ok(x.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(x.compact.sections[1].text.includes(r.compactLimit));
 return x;
}
test("Post-freeze genuinely unfamiliar catalogue source IDs and honest unsupported admissions",()=>{
 assert.deepEqual(sources.map(x=>x.quoteId),[54,60,45]);
 assert.equal(new Set(sources.map(x=>x.source.author)).size,3);
 for(const r of sources){
  assert.equal(CZ147_SOURCE_RECORDS.some(x=>x.quoteId===r.quoteId),false);
  assert.notEqual(sealUniversalSource(r).status,"blocked");
  assert.equal(r.source.text,q(r.quoteId)[0]);
  assert.equal(r.source.work,q(r.quoteId)[3]);
  assert.equal(resolveQuoteB27(input(r,null)).status,"no_fit",
   "Sealed QA content is not secretly added to the consumer app");
 }
 for(const id of [13,7,31,69]){
  const v=q(id),route=resolveQuoteB27({quoteId:id,
   quoteText:v[0],quoteAuthor:v[1],quoteWork:v[3],
   b27DevelopmentOnly:false});
  assert.equal(route.status,"no_fit",
   "Do not stretch an unsupported operation or unverified wording into a game");
 }
});
test("All newly-authored source pathways retain exact text, limits, and operation fidelity",()=>{
 const counts=[],samples=[];
 for(const r of sources){
  const out=new Set();
  for(const c of choices(r)){
   const v=run(r,c);
   assert.ok(!out.has(v.saveKey));
   out.add(v.saveKey);
   assert.doesNotMatch(v.compact.sections[1].text,
    /unchosen life|another lifetime|anxiety diagnosis|moral worth of the reader/i);
   assert.doesNotMatch(v.compact.sections[2].text,/What remains unresolved\\?/);
   if(r.familyId==="tap_pair")for(const pair of v.canonical_choice.pairs){
    const labels=new Map(r.relation.cards.map(x=>[x.id,x.label]));
    assert.ok(v.compact.sections[0].text.includes(labels.get(pair.aId)));
    assert.ok(v.compact.sections[0].text.includes(labels.get(pair.bId)));
   }
   if(samples.every(x=>x.quoteId!==r.quoteId))samples.push({
    quoteId:r.quoteId,author:r.source.author,operation:r.philosophicalOperation,
    input:c,reasoning:v.fullMeaning,emotion:v.emotion,full:v.fullExpression,
    compact:v.compact,sourceHash:v.sourceVersionHash});
  }
  counts.push({id:r.quoteId,family:r.familyId,count:out.size});
  assert.equal(out.size,choices(r).length);
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/fresh-source-all-states.json",
  JSON.stringify({frozenEngineeringSha:FROZEN,counts,samples,
   externalScholarlyApproval:false},null,2));
 assert.deepEqual(counts.map(x=>x.count),[8,10,10]);
});
test("Same mini-game family: Mill self-sovereignty remains distinct from Epicurus tranquility",()=>{
 const mill=sources[1],epic=sources[2];
 const a=run(mill,{pairs:[{aId:"choice",bId:"coercion",relationId:"contrast"}]});
 const b=run(epic,{pairs:[{aId:"luxury",bId:"mental",relationId:"contrast"}]});
 assert.equal(a.selectedFamilyId,"tap_pair");assert.equal(b.selectedFamilyId,"tap_pair");
 assert.notEqual(a.fullMeaning.meaning.philosophicalOperation.kind,
  b.fullMeaning.meaning.philosophicalOperation.kind);
 assert.match(a.compact.sections.slice(1).map(x=>x.text).join(" "),/self|government|coercion|agency|sovereignty/i);
 assert.match(b.compact.sections.slice(1).map(x=>x.text).join(" "),/pleasure|mental|calm|tranquility/i);
 assert.doesNotMatch(a.compact.sections.slice(1).map(x=>x.text).join(" "),/pleasure.*pain/i);
 assert.doesNotMatch(b.compact.sections.slice(1).map(x=>x.text).join(" "),/legal|coercion/i);
});
test("Fresh same-source decisions produce distinct warranted Section II and question, but preserve source thesis",()=>{
 const comparisons=[
  {id:54,a:{path:["prior","challenge","weigh"]},b:{path:["review","praise","weigh"]}},
  {id:60,a:{pairs:[{aId:"choice",bId:"coercion",relationId:"contrast"}]},
   b:{pairs:[{aId:"harm",bId:"coercion",relationId:"agency_boundary"}]}},
  {id:45,a:{pairs:[{aId:"bodily",bId:"mental",relationId:"complementarity"}]},
   b:{pairs:[{aId:"luxury",bId:"mental",relationId:"contrast"}]}}
 ];
 const results=[];
 for(const c of comparisons){
  const r=sources.find(x=>x.quoteId===c.id),a=run(r,c.a),b=run(r,c.b);
  assert.notEqual(a.saveKey,b.saveKey);
  assert.equal(a.fullMeaning.meaning.centralClaim,b.fullMeaning.meaning.centralClaim);
  assert.notEqual(a.fullMeaning.meaning.selectedClaim,b.fullMeaning.meaning.selectedClaim);
  assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
  assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
  results.push({quoteId:r.quoteId,operation:r.philosophicalOperation,
   a:{canonical:c.a,meaning:a.fullMeaning,emotion:a.emotion,
    full:a.fullExpression,compact:a.compact},
   b:{canonical:c.b,meaning:b.fullMeaning,emotion:b.emotion,
    full:b.fullExpression,compact:b.compact}});
 }
 mkdirSync("qa-evidence-cz147-r2-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r2-independent/fresh-cross-operation-comparisons.json",
  JSON.stringify({frozenEngineeringSha:FROZEN,results},null,2));
});
