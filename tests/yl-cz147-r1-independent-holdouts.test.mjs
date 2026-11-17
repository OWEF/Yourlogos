/**
 * CZ-147 R1 independent FRESH challenge.
 * Authored ONLY on QA branch AFTER R1 implementation SHA freeze.
 * This is neither a second engine nor a scholarly source certification.
 * Source operations follow the real immutable 91-quote catalogue.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const FROZEN="989ebacd37879dc2edc2ac0c76f55fe807357bc8";
const evidence=["source:central","scenario:fictional","source:boundary"];
const quote=id=>B27_APP_QUOTES[id];
function contract(id,fields){
 return {recordId:"cz147-r1-qa-new:"+id,version:"cz147-r1-qa-unseen/1",
  quoteId:id,status:"development_provisional",developmentOnly:false,
  source:{text:quote(id)[0],author:quote(id)[1],work:quote(id)[3],referenceUrl:""},
  evidenceIds:[...evidence],publicationAllowed:false,
  prohibitedInferences:["actual reader emotion","real moral character",
   "predicted third-party reaction","verified future consequence"],
  supportedConclusions:["Only the witnessed hypothetical choice and source-bounded argument"],
  ...fields};
}
const card=(id,label,detail)=>({id,label,detail});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,
 warrantIds:["source:central","scenario:fictional"]});
const authored=(starts,scenes,responses)=>starts.flatMap(s=>scenes.flatMap(v=>
 responses.map(r=>({startId:s.id,startLabel:s.label,
  sceneId:v.id,sceneLabel:v.label,authoredText:[v.text],
  responseId:r.id,responseLabel:r.label,responseStance:r.stance,
  authoredFutureIsPrediction:false}))));
const FRESH=[
 contract(10,{
  philosophicalOperation:{"kind":"attention_evasion","focus":"undistracted attention in solitude","contrast":"quiet reflection versus avoiding oneself","activityRoles":[{"id":"quiet","role":"quiet_attention"},{"id":"alerts","role":"possible_distraction"},{"id":"friends","role":"social_contact"}],"sourceWarrantIds":["source:central"]},
  familyId:"balance_move",title:"An evening without constant distraction",
  intro:"Imagine six half-hour slots tonight. You can choose quiet attention, check notifications or talk with friends; each use draws on the same limited evening.",
  humanTension:"A quieter period may compete with convenient distraction and valuable companionship.",
  sourceThesis:"Avoiding undistracted attention can prevent an encounter with one's own life",
  evidenceClaim:"Spending a finite interval on distractions reduces the time available for quiet attention",
  epistemicLimits:"This scenario cannot prove that real people fear solitude or that silence is always better",
  compactLimit:"An invented evening cannot diagnose a real person",
  counterexample:"Companionship and necessary rest are not failures of solitary reflection",
  readerAgency:"Divide six fictional half-hours among quiet, notifications and conversation",
  reflectionQuestion:"When might a quieter interval illuminate a choice without proving solitude superior?",
  affordances:["tradeoff_attention","choice_awareness","curious_reflection"],
  allocation:{resourceCapacity:6,resourceType:"exact",unitName:"half-hour slots",
   choices:[{id:"quiet",label:"quiet attention"},
    {id:"alerts",label:"notifications"},{id:"friends",label:"conversation"}],
   initial:[2,2,2],repetitions:null,lenses:[]}
 }),
 contract(40,{
  philosophicalOperation:{"kind":"source_relation","focus":"liberty to voice unwelcome criticism","contrast":"free speech versus demanded approval","sourceWarrantIds":["source:central"]},
  familyId:"tap_pair",title:"Freedom without forced agreement",
  intro:"A member of a fictional neighborhood forum voices a disputed opinion. Others are uncomfortable. Explore speech, disagreement and the pressure to silence, without deciding whether a claim is true.",
  humanTension:"Allowing an unwelcome criticism without demanding anyone's agreement or acceptance.",
  sourceThesis:"Liberty includes permission to voice criticism others find unwelcome",
  evidenceClaim:"Freedom to speak differs from an entitlement to approval",
  epistemicLimits:"This imagined exchange cannot decide real free speech law, safety or accuracy",
  compactLimit:"These links do not judge a real speech dispute",
  counterexample:"Allowing criticism does not make its content automatically correct or harmless",
  readerAgency:"Connect source-authorized relations between criticism, liberty and disagreement",
  reflectionQuestion:"Where does protecting speech end and the separate question of its truth begin?",
  affordances:["boundary_awareness","curious_reflection"],
  relation:{cards:[
    card("voice","Freedom to speak","An imagined right to express criticism"),
    card("dissent","Unwelcome criticism","A statement the audience may dislike"),
    card("agreement","Audience agreement","Approval no speaker can demand"),
    card("silence","Pressure to silence","Disagreement turned into an attempt to suppress")
   ],edges:[
    edge("voice","dissent","support","Room for dissent",
     "A freedom that disappears whenever speech displeases others leaves unwelcome criticism unprotected"),
    edge("voice","agreement","contrast","Speaking and approval",
     "The permission to voice a criticism is not the same as requiring the audience to agree"),
    edge("dissent","agreement","contrast","Disagreement is possible",
     "Unwelcome criticism can be heard without its content becoming accepted"),
    edge("voice","silence","agency_boundary","The limits of suppression",
     "Silencing a view merely because it is unwelcome conflicts with the cited defense of dissent")
   ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 contract(16,{
  philosophicalOperation:{"kind":"incremental_beginning","focus":"small beginnings without forced outcomes","contrast":"making a start versus grasping success","startRoles":[{"id":"start","role":"begin_modestly"},{"id":"plan","role":"prepare_carefully"}],"sourceWarrantIds":["source:central"]},
  familyId:"decision_cards",title:"The first small action",
  intro:"A neighborhood project seems too large to begin. Imagine either taking a small first step or continuing to plan; later fictional developments can alter what seems worth trying next.",
  humanTension:"Beginning something modestly while uncertainty remains, or delaying action for more preparation.",
  sourceThesis:"A long undertaking begins with a bounded first step rather than a guaranteed ending",
  evidenceClaim:"An initial step makes a large goal actionable without guaranteeing its completion",
  epistemicLimits:"The invented episode does not establish whether any long project will succeed",
  compactLimit:"A first step cannot guarantee the entire journey",
  counterexample:"Thoughtful preparation can be necessary, and an impulsive start may misfire",
  readerAgency:"Choose a beginning, consider a made-up complication, then respond",
  reflectionQuestion:"Which modest start would allow learning while keeping uncertainty visible?",
  affordances:["revisability","choice_awareness","uncertainty_awareness"],
  timeline:authored([
   {id:"start",label:"You take a small first step"},
   {id:"plan",label:"You keep planning for now"}
  ],[
   {id:"requirement",label:"a new requirement appears",
    text:"An independently invented requirement changes what the next task could involve"},
   {id:"feedback",label:"someone offers unexpected feedback",
    text:"An imaginary volunteer adds information without promising the plan's success"}
  ],[
   {id:"adjust",label:"You revise your next small step",stance:"reconsider"},
   {id:"continue",label:"You continue deliberately",stance:"hold"}
  ])
 }),
 contract(3,{
  philosophicalOperation:{"kind":"anticipated_vs_actual","focus":"anticipated distress versus observed events","contrast":"imagined fear versus evidence of what occurs","sourceWarrantIds":["source:central"]},
  familyId:"flip_reveal",title:"The imagined trouble and what follows",
  intro:"Before an uncomfortable conversation you may imagine disaster or prepare cautiously. Flip a fictional scene, then choose a response without treating the card as a prediction.",
  humanTension:"Feared outcomes can feel substantial even before an event has happened.",
  sourceThesis:"Anticipated trouble need not match any later event",
  evidenceClaim:"The imagined event does not establish the future consequence of a worried forecast",
  epistemicLimits:"No invented outcome diagnoses the reader's fears or predicts any real future",
  compactLimit:"An invented scene proves no real future",
  counterexample:"Some risks are real and reasonable anticipation is not always exaggerated",
  readerAgency:"Choose an initial attitude, reveal one imagined event, and respond",
  reflectionQuestion:"What could be learned from a feared possibility without treating it as evidence?",
  affordances:["uncertainty_awareness","revisability","choice_awareness"],
  timeline:authored([
   {id:"worry",label:"You imagine the worst"},
   {id:"prepare",label:"You prepare a modest plan"}
  ],[
   {id:"ordinary",label:"an ordinary reply arrives",
    text:"A fictional ordinary reply appears without predicting any real conversation"},
   {id:"delay",label:"the conversation is postponed",
    text:"An imagined postponement offers no knowledge of the other person's motives"}
  ],[
   {id:"revise",label:"You reconsider the forecast",stance:"reconsider"},
   {id:"observe",label:"You wait for more evidence",stance:"observe"}
  ])
 })
];
const registry=makeUniversalRegistry(FRESH,B27_APP_QUOTES);
const input=(r,canonical)=>({quoteId:r.quoteId,
 quoteText:r.source.text,quoteAuthor:r.source.author,
 quoteWork:r.source.work,b27DevelopmentOnly:false,canonicalInput:canonical});
const possible=r=>{
 if(r.familyId==="balance_move"){
  const n=r.allocation.resourceCapacity,out=[];
  for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++)
   out.push({amounts:[i,j,n-i-j],budgets:[n],touched:true,repetitions:null});
  return out;
 }
 if(r.familyId==="tap_pair"){
  const es=r.relation.edges,p=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
  const values=es.map(e=>({pairs:[p(e)]}));
  for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++)
   values.push({pairs:[p(es[i]),p(es[j])]});
  return values;
 }
 return r.timeline.map(t=>r.familyId==="decision_cards"?
  {path:[t.startId,t.sceneId,t.responseId]}:
  {actions:[{type:"choose_start",optionId:t.startId},
   {type:"explore_authored",sceneId:t.sceneId},
   {type:"choose_response",optionId:t.responseId},
   {type:"read_retrospective"}]});
};
const run=(r,choice)=>{
 const selected=registry.resolve(input(r,null));
 assert.equal(selected.status,"ready");
 const out=registry.run({...input(r,choice),sourceVersionHash:selected.sourceVersionHash});
 assert.equal(out.status,"ready",JSON.stringify({id:r.quoteId,choice,
  code:out.code,reason:out.reason,status:out.status}).slice(0,900));
 assert.equal(out.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.equal(out.fullExpression.wordCount>=80&&out.fullExpression.wordCount<=120,true);
 assert.equal(out.compact.visibleWordCount>=40&&out.compact.visibleWordCount<=65,true);
 assert.deepEqual(out.fullExpression.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.deepEqual(out.compact.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.ok(out.compact.sections[1].text.includes(r.sourceThesis));
 assert.ok(out.compact.sections[1].text.includes(r.compactLimit));
 assert.equal(out.emotion.inferredActualEmotion,false);
 assert.equal(out.emotion.inferredMoralRank,false);
 assert.equal(out.provenance.unchosenFutureKnown,false);
 assert.equal(out.publicationAllowed,false);
 assert.ok(!/chose You\b|you are morally|you must feel/i.test(
  out.compact.sections.map(x=>x.text).join(" ")));
 return out;
};
const reveal=(start,scene,response)=>({actions:[
 {type:"choose_start",optionId:start},{type:"explore_authored",sceneId:scene},
 {type:"choose_response",optionId:response},{type:"read_retrospective"}]});
const comparisons=[
 {id:10,before:{amounts:[3,2,1],budgets:[6],touched:true},
  after:{amounts:[1,3,2],budgets:[6],touched:true}},
 {id:40,before:{pairs:[{aId:"voice",bId:"dissent",relationId:"support"}]},
  after:{pairs:[{aId:"voice",bId:"agreement",relationId:"contrast"}]}},
 {id:16,before:{path:["start","requirement","adjust"]},
  after:{path:["plan","feedback","adjust"]}},
 {id:3,before:reveal("worry","ordinary","revise"),
  after:reveal("prepare","delay","revise")}
];
test("Truly fresh four-authors/four-operations source identities were unseen by the frozen engineering implementation",()=>{
 assert.deepEqual(FRESH.map(r=>r.quoteId),[10,40,16,3]);
 assert.equal(new Set(FRESH.map(r=>r.source.author)).size,4);
 assert.equal(new Set(FRESH.map(r=>r.familyId)).size,4);
 for(const r of FRESH){
  assert.ok(!CZ147_SOURCE_RECORDS.some(old=>old.quoteId===r.quoteId));
  assert.equal(r.source.text,quote(r.quoteId)[0]);
  assert.equal(r.source.work,quote(r.quoteId)[3]);
  assert.notEqual(sealUniversalSource(r).status,"blocked");
  assert.equal(r.publicationAllowed,false);
  assert.equal(r.status,"development_provisional");
  // Unreviewed QA sources are NOT secretly admitted into the consumer app.
  const admission=resolveQuoteB27(input(r,null));
  assert.equal(admission.status,"no_fit");
 }
});
test("54 unfamiliar source-authorized choice states remain bounded, grammatical and source-specific",()=>{
 const records=[],counts=[];
 for(const r of FRESH){
  const seen=new Set(),choices=possible(r);
  for(const chosen of choices){
   const x=run(r,chosen);
   assert.ok(!seen.has(x.saveKey));
   seen.add(x.saveKey);
   if(r.familyId==="balance_move"){
    assert.deepEqual(x.fullMeaning.meaning.choiceAnalysis.shares.map(x=>x.amount),chosen.amounts);
    for(const c of r.allocation.choices)
     assert.ok(x.compact.sections[0].text.includes(c.label));
   }
   if(r.familyId==="tap_pair")for(const c of x.canonical_choice.pairs){
    const label=new Map(r.relation.cards.map(x=>[x.id,x.label]));
    assert.ok(x.compact.sections[0].text.includes(label.get(c.aId)));
    assert.ok(x.compact.sections[0].text.includes(label.get(c.bId)));
   }
   if(r.familyId==="decision_cards"||r.familyId==="flip_reveal"){
    assert.equal(x.fullMeaning.meaning.choiceAnalysis.development.fictional,true);
    assert.equal(x.fullMeaning.meaning.choiceAnalysis.development.causedByInitialChoice,false);
   }
  }
  counts.push({id:r.quoteId,operation:r.familyId,states:seen.size});
  assert.equal(seen.size,choices.length);
 }
 mkdirSync("qa-evidence-cz147-r1-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r1-independent/fresh-state-matrix.json",
  JSON.stringify({frozenEngineeringSha:FROZEN,counts,
   allSources:"provisional_internal_not_scholarly_approved",
   addedAuthorSpecificEngineCode:false},null,2));
 assert.equal(counts.reduce((s,x)=>s+x.states,0),54);
});
test("Fresh same-source contrasts meaningfully alter SECTION II and final question, without confusing source and inference",()=>{
 const out=[];
 for(const c of comparisons){
  const r=FRESH.find(x=>x.quoteId===c.id);
  const a=run(r,c.before),b=run(r,c.after);
  assert.equal(a.fullMeaning.meaning.centralClaim,b.fullMeaning.meaning.centralClaim);
  assert.notEqual(a.saveKey,b.saveKey);
  assert.notDeepEqual(a.fullMeaning.meaning.choiceAnalysis,b.fullMeaning.meaning.choiceAnalysis);
  assert.notEqual(a.fullMeaning.meaning.selectedClaim,b.fullMeaning.meaning.selectedClaim);
  assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
  assert.notEqual(a.compact.sections[2].text,b.compact.sections[2].text);
  assert.notEqual(a.fullExpression.sections[1].text,b.fullExpression.sections[1].text);
  assert.notEqual(a.fullExpression.sections[2].text,b.fullExpression.sections[2].text);
  if(r.familyId==="balance_move"){
   assert.equal(c.before.amounts.filter(x=>x>0).length,c.after.amounts.filter(x=>x>0).length);
   assert.equal(a.fullMeaning.choiceFeature,b.fullMeaning.choiceFeature);
  }
  if(r.familyId==="decision_cards"||r.familyId==="flip_reveal"){
   assert.equal(a.fullMeaning.meaning.choiceAnalysis.response.stance,
    b.fullMeaning.meaning.choiceAnalysis.response.stance);
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.initial.id,
    b.fullMeaning.meaning.choiceAnalysis.initial.id);
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.development.id,
    b.fullMeaning.meaning.choiceAnalysis.development.id);
  }
  if(r.familyId==="tap_pair"){
   assert.notEqual(a.fullMeaning.meaning.choiceAnalysis.links[0].claim,
    b.fullMeaning.meaning.choiceAnalysis.links[0].claim);
  }
  out.push({quoteId:r.quoteId,author:r.source.author,
   family:r.familyId,sourcePremise:r.sourceThesis,
   assertedWarrants:r.evidenceIds,sourceLimits:r.epistemicLimits,
   before:{canonicalChoice:c.before,reasoning:a.fullMeaning,
    emotion:a.emotion,full:a.fullExpression,compact:a.compact},
   after:{canonicalChoice:c.after,reasoning:b.fullMeaning,
    emotion:b.emotion,full:b.fullExpression,compact:b.compact}});
 }
 mkdirSync("qa-evidence-cz147-r1-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-r1-independent/fresh-a-b-philosophical-comparisons.json",
  JSON.stringify({frozenEngineeringSha:FROZEN,
   note:"Authored premises and fictional events are not discoveries; differentiated attention and opportunity costs are choice-derived implications, bounded by those premises.",
   cases:out},null,2));
 assert.equal(out.length,4);
});
test("Equivalent edge direction and reordering yield semantically identical source results",()=>{
 const r=FRESH.find(r=>r.quoteId===40);
 const a=run(r,{pairs:[{aId:"voice",bId:"dissent",relationId:"support"},
  {aId:"voice",bId:"agreement",relationId:"contrast"}]});
 const b=run(r,{pairs:[{aId:"agreement",bId:"voice",relationId:"contrast"},
  {aId:"dissent",bId:"voice",relationId:"support"}]});
 assert.equal(a.saveKey,b.saveKey);
 assert.deepEqual(a.fullMeaning,b.fullMeaning);
 assert.deepEqual(a.compact.sections,b.compact.sections);
 for(const id of [31,69,71]){
  const q=quote(id),res=resolveQuoteB27({quoteId:id,quoteText:q[0],
   quoteAuthor:q[1],quoteWork:q[3],b27DevelopmentOnly:false});
  assert.equal(res.status,"no_fit");
  assert.equal(res.readingFirst,true);
 }
});

test("R2 diagnostic: enumerate ALL R1 disclosed source states beyond the first error",()=>{
 const failures=[];
 for(const r of FRESH){
  const admitted=registry.resolve(input(r,null));
  for(const canonical of possible(r)){
   const out=registry.run({...input(r,canonical),
    sourceVersionHash:admitted.sourceVersionHash});
   if(out.status!=="ready")failures.push({
    id:r.quoteId,family:r.familyId,canonical,status:out.status,reason:out.reason,code:out.code
   });
  }
 }
 console.log("R2_OLD_54_FULL_FAIL_LIST "+JSON.stringify(failures));
 assert.deepEqual(failures,[]);
});
