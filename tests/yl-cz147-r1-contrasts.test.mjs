/**
 * CZ-147 R1 comparative acceptance. "Before/after" means two different
 * actual reader choices under the SAME signed source, not fake human data.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {makeUniversalRegistry,emotionUniversal,expressUniversal}
 from "../experiments/yl-cz147-engines.mjs";
const registry=makeUniversalRegistry(CZ147_SOURCE_RECORDS,B27_APP_QUOTES);
const src=id=>CZ147_SOURCE_RECORDS.find(x=>x.quoteId===id);
const run=(id,choice)=>{
 const r=src(id);
 const request={quoteId:id,quoteText:r.source.text,
  quoteAuthor:r.source.author,quoteWork:r.source.work,
  b27DevelopmentOnly:r.developmentOnly};
 const allowed=registry.resolve(request);
 const value=registry.run({...request,canonicalInput:choice,
  sourceVersionHash:allowed.sourceVersionHash});
 assert.equal(value.status,"ready",JSON.stringify({id,choice,status:value.status,
  reason:value.reason,code:value.code}).slice(0,850));
 assert.ok(value.fullExpression.wordCount>=80&&value.fullExpression.wordCount<=120);
 assert.ok(value.compact.visibleWordCount>=40&&value.compact.visibleWordCount<=65);
 assert.deepEqual(value.fullExpression.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.deepEqual(value.compact.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.ok(value.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(value.compact.sections[1].text.includes(r.compactLimit));
 assert.equal(value.emotion.inferredActualEmotion,false);
 assert.equal(value.emotion.inferredMoralRank,false);
 assert.equal(value.publicationAllowed,false);
 return value;
};
const flip=(start,scene,response)=>({actions:[
 {type:"choose_start",optionId:start},
 {type:"explore_authored",sceneId:scene},
 {type:"choose_response",optionId:response},
 {type:"read_retrospective"}]});
const pairs=(aId,bId,relationId)=>({pairs:[{aId,bId,relationId}]});
const comparisons=[
 {key:"A",id:49,family:"balance_move",
  before:{amounts:[4,2,2],budgets:[8],touched:true},
  after:{amounts:[2,4,2],budgets:[8],touched:true},
  semantic:"same three used categories, different leading use and foregone alternative"},
 {key:"B",id:55,family:"decision_cards",
  before:{path:["maintain","details","consider"]},
  after:{path:["revisit","critique","consider"]},
  semantic:"same final reconsider stance, different opening commitment and invented development"},
 {key:"C",id:23,family:"tap_pair",
  before:pairs("education","judgment","support"),
  after:pairs("dominance","agency","contrast"),
  semantic:"different authenticated relation warrant: support versus conceptual contrast"},
 {key:"D",id:48,family:"flip_reveal",
  before:flip("prepare","silence","respond"),
  after:flip("listen","delay","respond"),
  semantic:"same reflective stance, different initial act and independently authored fictional event"}
];
test("Four same-source counterfactual comparisons change warranted reasoning, not only amounts or labels",()=>{
 mkdirSync("qa-evidence-cz147-r1",{recursive:true});
 const evidence=[];
 for(const c of comparisons){
  const r=src(c.id),a=run(c.id,c.before),b=run(c.id,c.after);
  assert.equal(a.selectedFamilyId,c.family);
  assert.equal(b.selectedFamilyId,c.family);
  assert.equal(a.sourceVersionHash,b.sourceVersionHash);
  assert.notEqual(a.saveKey,b.saveKey);
  assert.notEqual(a.fullMeaning.meaning.selectedClaim,b.fullMeaning.meaning.selectedClaim,
   c.key+": genuine choice must change the source-bounded reasoning consequence");
  assert.notDeepEqual(a.fullMeaning.meaning.choiceAnalysis,b.fullMeaning.meaning.choiceAnalysis);
  assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text,
   c.key+": source-specific choice consequence must appear in section II");
  assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text,
   c.key+": closing reflection must respond to the chosen path");
  assert.notEqual(a.fullExpression.sections[1].text,b.fullExpression.sections[1].text);
  assert.notEqual(a.fullExpression.sections[2].text,b.fullExpression.sections[2].text);
  assert.equal(a.fullMeaning.meaning.centralClaim,b.fullMeaning.meaning.centralClaim);
  assert.equal(a.fullMeaning.meaning.centralClaim,r.sourceThesis);
  for(const value of [a,b]){
   assert.ok(!/You chose You\b/i.test(JSON.stringify(value.compact)));
   assert.ok(!/you must feel|you are virtuous|you caused their response/i.test(
    value.compact.sections.map(x=>x.text).join(" ")));
  }
  if(c.key==="A"){
   assert.equal(c.before.amounts.filter(n=>n>0).length,
    c.after.amounts.filter(n=>n>0).length);
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.primary[0].id,
    b.fullMeaning.meaning.choiceAnalysis.primary[0].id);
   assert.equal(a.fullMeaning.choiceFeature,b.fullMeaning.choiceFeature);
  }
  if(c.key==="B"||c.key==="D"){
   assert.equal(a.fullMeaning.meaning.choiceAnalysis.response.stance,
    b.fullMeaning.meaning.choiceAnalysis.response.stance);
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.initial.id,
    b.fullMeaning.meaning.choiceAnalysis.initial.id);
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.development.id,
    b.fullMeaning.meaning.choiceAnalysis.development.id);
   assert.equal(a.provenance.authoredEventCausedByReader,false);
   assert.equal(b.provenance.unchosenFutureKnown,false);
  }
  if(c.key==="C"){
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.links[0].claim,
    b.fullMeaning.meaning.choiceAnalysis.links[0].claim);
   assert.notEqual(a.emotion.move,b.emotion.move);
  }
  evidence.push({operation:c.family,comparison:c.key,
   semanticBasis:c.semantic,author:r.source.author,
   quotation:r.source.text,sourceThesis:r.sourceThesis,
   sourceOwnedPremises:{
    thesis:r.sourceThesis,humanTension:r.humanTension,
    sourceClaim:r.evidenceClaim,limits:r.epistemicLimits,
    counterexample:r.counterexample},
   before:{canonicalChoice:c.before,reasoning:a.fullMeaning,
    emotion:a.emotion,full:a.fullExpression,compact:a.compact},
   after:{canonicalChoice:c.after,reasoning:b.fullMeaning,
    emotion:b.emotion,full:b.fullExpression,compact:b.compact}});
 }
 writeFileSync("qa-evidence-cz147-r1/four-choice-comparisons.json",
  JSON.stringify(evidence,null,2));
 assert.equal(evidence.length,4);
});
test("Rhetorical adaptation presents an actual choice-grounded tension rather than changing a headline",()=>{
 const all=run(49,{amounts:[0,0,8],budgets:[8],touched:true});
 const divided=run(49,{amounts:[2,2,4],budgets:[8],touched:true});
 assert.equal(all.emotion.strategy,"choice_awareness");
 assert.equal(divided.emotion.strategy,"tradeoff_attention");
 assert.equal(all.emotion.move,"examine_chosen_priority");
 assert.equal(divided.emotion.move,"surface_opportunity_cost");
 assert.notEqual(all.compact.sections[1].text,divided.compact.sections[1].text);
 assert.match(all.compact.sections[1].text,/Giving every slot to rest excludes/i);
 assert.match(divided.compact.sections[1].text,/Prioritizing rest limits time/i);
 const r=src(49),reference=registry.resolve({
  quoteId:49,quoteText:r.source.text,quoteAuthor:r.source.author,
  quoteWork:r.source.work,b27DevelopmentOnly:false
 });
 const packet=registry.run({quoteId:49,quoteText:r.source.text,
  quoteAuthor:r.source.author,quoteWork:r.source.work,
  b27DevelopmentOnly:false,sourceVersionHash:reference.sourceVersionHash,
  canonicalInput:{amounts:[0,0,8],budgets:[8],touched:true}}).fullMeaning;
 const sealed=awaitableSource();
 function awaitableSource(){return {...r,sourceFingerprint:reference.sourceVersionHash};}
 const neutral=emotionUniversal(packet,{...sealed,affordances:[]});
 assert.equal(neutral.strategy,"neutral_reflection");
 assert.equal(neutral.inferredActualEmotion,false);
 const text=expressUniversal(packet,neutral,sealed);
 assert.equal(text.status,"ready");
 assert.notEqual(text.compact.sections[1].text,all.compact.sections[1].text);
});
test("Equivalent user actions canonicalize identically, including null repetition and relation direction",()=>{
 const r=src(49);
 const a=run(49,{amounts:[3,2,3],budgets:[8],touched:true});
 const b=run(49,{amounts:[3,2,3],budgets:[8],touched:true,repetitions:null});
 assert.equal(a.saveKey,b.saveKey);
 assert.deepEqual(a.fullMeaning,b.fullMeaning);
 assert.deepEqual(a.compact.sections,b.compact.sections);
 const one=run(23,pairs("education","judgment","support"));
 const two=run(23,pairs("judgment","education","support"));
 assert.equal(one.saveKey,two.saveKey);
 assert.deepEqual(one.fullMeaning,two.fullMeaning);
 assert.deepEqual(one.compact.sections,two.compact.sections);
});
