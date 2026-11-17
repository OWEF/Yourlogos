/**
 * CZ-147 INDEPENDENT QA / SEALED-SOURCE HOLDOUT.
 * Previously disclosed authentic catalogue quote identities, now regression, and their human
 * scenarios were introduced only AFTER engineering freeze at the exact SHA
 * below. No shared engine or application implementation code is modified.
 *
 * Qualitative correctness is independently evaluated, not inferred solely
 * from a READY status. Editorial passages remain DEVELOPMENT PROVISIONAL.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource}
 from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
const ENGINEERING_SHA="2eafd7c4edb4bf454a7d301eb51817a3bbfde9ed";
const EVIDENCE=["source:central","scenario:fictional","source:boundary"];
const source=(id,values)=>({
 recordId:"qa-sealed:cz147:"+id,quoteId:id,version:"qa-sealed-source/1",
 status:"development_provisional",developmentOnly:false,
 source:{text:B27_APP_QUOTES[id][0],author:B27_APP_QUOTES[id][1],
  work:B27_APP_QUOTES[id][3],referenceUrl:""},
 publicationAllowed:false,
 evidenceIds:[...EVIDENCE],prohibitedInferences:[
  "real person's moral status","diagnosed feelings","guaranteed outcome","predicted history"],
 supportedConclusions:["A hypothetical dilemma may illustrate a source-bounded distinction"],
 ...values
});
const t=(starts,scenes,responses)=>starts.flatMap(s=>scenes.flatMap(f=>
 responses.map(r=>({startId:s.id,startLabel:s.label,
  sceneId:f.id,sceneLabel:f.label,authoredText:[f.text],
  responseId:r.id,responseLabel:r.label,
  responseStance:r.stance,authoredFutureIsPrediction:false}))));
const c=(id,label,detail)=>({id,label,detail});
const e=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,warrantIds:["source:central","scenario:fictional"]});
const holdouts=[
 source(50,{
  philosophicalOperation:{"kind":"deliberate_use","focus":"deliberate time before postponement","contrast":"starting now versus habitual delay","activityRoles":[{"id":"start","role":"deliberate_practice"},{"id":"delay","role":"possible_distraction"}],"sourceWarrantIds":["source:central"]},
  familyId:"balance_move",title:"An evening that keeps moving",
  intro:"You have six invented half-hour slots before bed. One project has been waiting while small delays have accumulated; rest is also a real need.",
  humanTension:"Starting a meaningful task now or continuing to postpone without pretending rest is wrong.",
  sourceThesis:"Postponing life can consume time that cannot later be reclaimed",
  evidenceClaim:"A delay occupies time even when no decisive action occurs",
  epistemicLimits:"This exercise cannot determine which real commitments a person ought to prioritize",
  compactLimit:"This imagined evening cannot diagnose your actual habits",
  counterexample:"Resting deliberately is not necessarily the evasive postponement criticized in the passage",
  readerAgency:"Divide an invented evening between a waiting task and delay",
  reflectionQuestion:"Which delay might you recognize without assuming every pause is wasted?",
  affordances:["tradeoff_attention","choice_awareness","curious_reflection"],
  allocation:{resourceCapacity:6,resourceType:"exact",unitName:"half-hour slots",
   choices:[{id:"start",label:"starting a waiting task"},
    {id:"delay",label:"putting it off again"}],
   initial:[3,3],repetitions:null,lenses:[]}
 }),
 source(72,{
  philosophicalOperation:{"kind":"source_relation","focus":"love guided by practical understanding","contrast":"careful knowledge versus unexamined affection","sourceWarrantIds":["source:central"]},
  familyId:"tap_pair",title:"Care needs more than an impulse",
  intro:"A friend asks for help understanding an unfamiliar choice. You want to help, but affection alone cannot replace learning the facts before offering advice.",
  humanTension:"Caring enough to help while recognizing that reliable knowledge must guide what you do.",
  sourceThesis:"Love may inspire a good life while knowledge is needed to guide it",
  evidenceClaim:"A caring impulse without understanding may still misdirect a practical choice",
  epistemicLimits:"This invented friendship does not establish anyone's love, wisdom or actual moral character",
  compactLimit:"A clicked relation does not certify real love or wisdom",
  counterexample:"Neither caring sentiment alone nor bare information alone exhausts the cited ideal",
  readerAgency:"Explore honest concept relationships without a secret correctness score",
  reflectionQuestion:"What would you want to learn before turning concern into practical help?",
  affordances:["curious_reflection","boundary_awareness"],
  relation:{cards:[
   c("care","Caring attention","An imagined impulse to help someone"),
   c("knowledge","Reliable knowledge","Relevant information checked before advising"),
   c("action","Practical assistance","A specific imaginable form of help"),
   c("certainty","Unexamined confidence","A belief that may exceed available knowledge")
  ],edges:[
   e("care","knowledge","complementarity","Care and understanding",
    "Care may motivate help while sound understanding shapes its direction"),
   e("knowledge","action","support","Guidance for action",
    "Reliable knowledge can inform a practical response rather than determine its success"),
   e("certainty","knowledge","contrast","Confidence and evidence",
    "Unsupported confidence is distinct from the knowledge needed for careful guidance"),
   e("care","action","support","Love and assistance",
    "Caring concern may inspire practical help without proving it will work")
  ],minimumPairs:1,maximumPairs:2,noCorrectMatch:true}
 }),
 source(9,{
  philosophicalOperation:{"kind":"practical_commitment","focus":"good conduct rather than empty discussion","contrast":"discussing virtue versus putting it into practice","sourceWarrantIds":["source:central"]},
  familyId:"decision_cards",title:"From argument to practice",
  intro:"You have been debating what fairness means in a volunteer group. A modest task now needs attention; you can keep talking or test your understanding through an action.",
  humanTension:"Continuing the abstract debate or acting responsibly without claiming instant virtue.",
  sourceThesis:"Discussing a good life is not a substitute for living through responsible action",
  evidenceClaim:"A moral discussion alone does not demonstrate how a person actually acts",
  epistemicLimits:"Neither invented option proves that the reader is morally good or bad",
  compactLimit:"One game choice cannot measure actual virtue",
  counterexample:"Action without reflection can also be mistaken or self-serving",
  readerAgency:"Choose an action then consider an independently invented later complication",
  reflectionQuestion:"Which practice might test your ideals without declaring you virtuous?",
  affordances:["revisability","choice_awareness","uncertainty_awareness"],
  timeline:t([
   {id:"debate",label:"You continue the group debate"},
   {id:"help",label:"You volunteer for the task"}
  ],[
   {id:"change",label:"the schedule unexpectedly changes",
    text:"An invented schedule change challenges every available response"},
   {id:"question",label:"someone questions the task",
    text:"An imaginary person asks whether the activity serves the intended goal"}
  ],[
   {id:"reflect",label:"You reconsider what matters",stance:"reconsider"},
   {id:"act",label:"You explain your chosen action",stance:"hold"}
  ])
 }),
 source(75,{
  philosophicalOperation:{"kind":"non_retaliation","focus":"interrupting retaliatory cycles of hostility","contrast":"responding without hatred versus repeating hostility","startRoles":[{"id":"retaliate","role":"retaliate"},{"id":"decline","role":"deescalate"}],"sourceWarrantIds":["source:central"]},
  familyId:"flip_reveal",title:"After a hurtful exchange",
  intro:"Someone speaks sharply during an imagined discussion. You can choose to retaliate or decline to escalate, then see one fictional development not caused by your tap.",
  humanTension:"The temptation to return hostility or hold back without claiming that peace is guaranteed.",
  sourceThesis:"Returning hatred with hatred does not itself resolve the cycle of hostility",
  evidenceClaim:"A refusal to retaliate is distinct from predicting how another person will respond",
  epistemicLimits:"An imagined event cannot prove reconciliation, safety or another person's inner state",
  compactLimit:"A different response cannot guarantee the conflict will end",
  counterexample:"Avoiding retaliation need not mean accepting mistreatment or surrendering protection",
  readerAgency:"Choose one response, reveal an independent fictional scene, and respond again",
  reflectionQuestion:"What could interrupt an exchange without promising that the other person will change?",
  affordances:["uncertainty_awareness","revisability","choice_awareness"],
  timeline:t([
   {id:"retaliate",label:"You answer with a sharp insult"},
   {id:"decline",label:"You decide not to retaliate"}
  ],[
   {id:"silence",label:"the other person says nothing",
    text:"An invented silence occurs without establishing what the person thinks"},
   {id:"return",label:"an onlooker asks for context",
    text:"A fictional bystander asks questions about the disagreement afterward"}
  ],[
   {id:"review",label:"You reconsider what to say",stance:"reconsider"},
   {id:"protect",label:"You protect your own boundary",stance:"hold"}
  ])
 })
];
const registry=makeUniversalRegistry(holdouts,B27_APP_QUOTES);
const req=(r,choice)=>({quoteId:r.quoteId,quoteText:r.source.text,
 quoteAuthor:r.source.author,quoteWork:r.source.work,
 b27DevelopmentOnly:false,canonicalInput:choice});
function choices(r){
 if(r.familyId==="balance_move"){
  const max=r.allocation.resourceCapacity;
  return Array.from({length:max+1},(_,n)=>({
   amounts:[n,max-n],budgets:[max],touched:true,repetitions:null}));
 }
 if(r.familyId==="tap_pair"){
  const edges=r.relation.edges,link=x=>({aId:x.aId,bId:x.bId,relationId:x.relationId});
  const one=edges.map(x=>({pairs:[link(x)]}));
  const two=[];
  for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++)
   two.push({pairs:[link(edges[i]),link(edges[j])]});
  return [...one,...two];
 }
 return r.timeline.map(x=>r.familyId==="decision_cards"?
  {path:[x.startId,x.sceneId,x.responseId]}:
  {actions:[{type:"choose_start",optionId:x.startId},
   {type:"explore_authored",sceneId:x.sceneId},
   {type:"choose_response",optionId:x.responseId},
   {type:"read_retrospective"}]});
}
test("SEALED after freeze: no engineering source registry has ever admitted these four quotes",()=>{
 assert.equal(new Set(holdouts.map(x=>x.quoteId)).size,4);
 assert.deepEqual(holdouts.map(x=>x.quoteId),[50,72,9,75]);
 assert.equal(CZ147_SOURCE_RECORDS.every(r=>!holdouts.some(h=>h.quoteId===r.quoteId)),true);
 assert.equal(new Set(holdouts.map(x=>x.source.author)).size,4);
 assert.equal(new Set(holdouts.map(x=>x.familyId)).size,4);
 const impl=readFileSync(new URL("../experiments/yl-cz147-engines.mjs",import.meta.url),"utf8");
 for(const id of [50,72,9,75])assert.doesNotMatch(impl,new RegExp("quoteId\\s*:\\s*"+id+"\\b"));
 for(const r of holdouts){
  assert.notEqual(sealUniversalSource(r).status,"blocked",r.recordId);
  assert.equal(r.source.text,B27_APP_QUOTES[r.quoteId][0]);
  assert.equal(r.source.work,B27_APP_QUOTES[r.quoteId][3]);
  assert.equal(r.publicationAllowed,false);
 }
});
test("Every unfamiliar source passes all reachable choices without source-specific implementation changes",()=>{
 const examples=[],counts=[];
 for(const r of holdouts){
  const resolved=registry.resolve(req(r,null));
  assert.equal(resolved.status,"ready",r.recordId);
  const states=choices(r),seen=new Set();
  for(const choice of states){
   const result=registry.run({...req(r,choice),sourceVersionHash:resolved.sourceVersionHash});
   assert.equal(result.status,"ready",JSON.stringify({quoteId:r.quoteId,choice,
    status:result.status,reason:result.reason,code:result.code}).slice(0,950));
   assert.equal(result.fullMeaning.meaning.centralClaim,r.sourceThesis);
   assert.equal(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120,true);
   assert.equal(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65,true);
   assert.equal(result.compact.sections.length,3);
   assert.equal(result.emotion.inferredActualEmotion,false);
   assert.equal(result.emotion.inferredMoralRank,false);
   assert.equal(result.provenance.unchosenFutureKnown,false);
   assert.ok(result.compact.sections[1].text.includes(r.sourceThesis));
   assert.ok(result.compact.sections[1].text.includes(r.compactLimit));
   assert.ok(!/chose You\b/.test(result.compact.sections[0].text));
   assert.ok(!seen.has(result.saveKey));
   seen.add(result.saveKey);
   if(r.familyId==="tap_pair")for(const link of result.canonical_choice.pairs){
    const labels=new Map(r.relation.cards.map(c=>[c.id,c.label]));
    assert.ok(result.compact.sections[0].text.includes(labels.get(link.aId)));
    assert.ok(result.compact.sections[0].text.includes(labels.get(link.bId)));
   }
   if(r.familyId==="balance_move")for(const item of r.allocation.choices)
    assert.ok(result.compact.sections[0].text.includes(item.label));
   if(seen.size===1)examples.push({id:r.quoteId,author:r.source.author,
    family:r.familyId,quote:r.source.text,choice,
    reasoning:result.fullMeaning,emotion:result.emotion,
    full:result.fullExpression,compact:result.compact,
    sourceVersionHash:result.sourceVersionHash});
  }
  counts.push({quoteId:r.quoteId,family:r.familyId,states:seen.size});
  assert.equal(seen.size,states.length);
 }
 mkdirSync("qa-evidence-cz147-independent",{recursive:true});
 writeFileSync("qa-evidence-cz147-independent/sealed-unseen-results.json",
  JSON.stringify({frozenEngineeringSha:ENGINEERING_SHA,
   methodology:"All four source contracts introduced on QA-only branch after engineering freeze; engine code unchanged",
   counts,examples,publicationAllowed:false,scholarlyApprovalClaimed:false},null,2));
 assert.equal(examples.length,4);
});
test("Unseen equivalent relations replay exactly; distinct relations change meaning, not personality",()=>{
 const r=holdouts.find(x=>x.quoteId===72),src=registry.resolve(req(r,null));
 const e=r.relation.edges;
 const a={pairs:[{aId:e[0].aId,bId:e[0].bId,relationId:e[0].relationId}]};
 const b={pairs:[{aId:e[0].bId,bId:e[0].aId,relationId:e[0].relationId}]};
 const c={pairs:[{aId:e[2].aId,bId:e[2].bId,relationId:e[2].relationId}]};
 const run=input=>registry.run({...req(r,input),sourceVersionHash:src.sourceVersionHash});
 const x=run(a),y=run(b),z=run(c);
 assert.equal(x.status,"ready");assert.equal(y.status,"ready");assert.equal(z.status,"ready");
 assert.equal(x.saveKey,y.saveKey);
 assert.deepEqual(x.compact.sections,y.compact.sections);
 assert.notEqual(x.saveKey,z.saveKey);
 assert.notEqual(x.compact.sections[0].text,z.compact.sections[0].text);
 assert.equal(x.fullMeaning.meaning.centralClaim,z.fullMeaning.meaning.centralClaim);
 assert.equal(x.emotion.inferredActualEmotion,false);
 assert.equal(z.emotion.inferredActualEmotion,false);
});
test("Previously unseen claims do not bypass source identity, unsupported abstract texts read first",()=>{
 for(const r of holdouts){
  const src=registry.resolve(req(r,null));
  assert.notEqual(registry.resolve({...req(r,null),quoteAuthor:"Fake author"}).status,"ready");
  assert.notEqual(registry.run({...req(r,choices(r)[0]),
   sourceVersionHash:"stale"}).status,"ready");
  assert.equal(src.sourceVersionHash,sealUniversalSource(r).sourceFingerprint);
 }
 for(const id of [31,69,73]){
  const q=B27_APP_QUOTES[id],request={quoteId:id,quoteText:q[0],
   quoteAuthor:q[1],quoteWork:q[3],b27DevelopmentOnly:false};
  assert.equal(registry.resolve(request),null);
  const normal=resolveQuoteB27(request);
  assert.equal(normal.status,"no_fit");
  assert.equal(normal.readingFirst,true);
 }
});

test("R2 diagnostic: enumerate ALL historical four-source states, not only first failed case",()=>{
 const failures=[];
 for(const r of holdouts){
  const admitted=registry.resolve(req(r,null));
  for(const canonical of choices(r)){
   const out=registry.run({...req(r,canonical),
    sourceVersionHash:admitted.sourceVersionHash});
   if(out.status!=="ready")failures.push({
    id:r.quoteId,family:r.familyId,canonical,status:out.status,reason:out.reason,code:out.code
   });
  }
 }
 console.log("R2_OLD_33_FULL_FAIL_LIST "+JSON.stringify(failures));
 assert.deepEqual(failures,[]);
});
