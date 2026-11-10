import {test} from "node:test";
import assert from "node:assert/strict";
import {encounterConsequence,expressConsequence} from "../philosophy-engine/encounter/consequence-v1.js";
import {reachableDecisionRoutes} from "../philosophy-engine/encounter/mechanism-transfer-engine-v02.js";

test("all 84 evenings keep conditional evidence and support the displayed reading",()=>{
  const rules=new Set();
  for(let w=0;w<=6;w++) for(let m=0;m+w<=6;m++) {
    for(const motivation of ["planned","interrupted","obligations"]){
      const ticks=[w,m,6-w-m];
      const packet=encounterConsequence("dillard",{ticks,motivation});
      assert.equal(packet.status,"ready");
      assert.deepEqual(packet.evidence.hypotheticalFiveEvenings,ticks.map(n=>2.5*n));
      assert.equal(packet.evidence.declaredInfluence,motivation);
      assert.equal(expressConsequence(packet).discovery,packet.discovery);
      assert.equal(packet.fingerprintEvidence,null);
      assert.ok(packet.sources.length);
      rules.add(packet.rule);
    }
  }
  assert.equal(rules.size,14);
});
test("matching allocations change meaning when the stated influence changes",()=>{
  const read=motivation=>encounterConsequence("dillard",{ticks:[0,4,2],motivation});
  assert.equal(read("interrupted").rule,"requests-without-writing");
  assert.equal(read("planned").rule,"deliberate-pause");
  assert.equal(read("obligations").rule,"exception-repeated");
  assert.doesNotMatch(read("obligations").discovery,/message/i);
  assert.equal(encounterConsequence("dillard",{ticks:[0,0,6],motivation:"interrupted"}).rule,"exception-repeated");
});
test("all eight routes bind initial knowledge, event, and response separately",()=>{
  const discoveries=new Set();
  for(const route of reachableDecisionRoutes("kierkegaard")){
    const packet=encounterConsequence("kierkegaard",route);
    assert.equal(packet.rule,[route.resource,route.barrier,route.action].join("/"));
    assert.equal(packet.evidence.unchosenOutcome,null);
    assert.ok(!packet.evidence.atChoice.includes(packet.evidence.imaginedLater));
    discoveries.add(packet.discovery);
  }
  assert.equal(discoveries.size,8);
});
test("unsupported cases, sparse budgets, unconfirmed motives and incompatible routes decline",()=>{
  for(const [id,input] of [
    ["marx",{}],["dillard",{ticks:[2,2,2]}],["dillard",{ticks:[,4,2],motivation:"planned"}],
    ["dillard",{ticks:[2,2,3],motivation:"planned"}],["kierkegaard",{resource:"stay"}],
    ["kierkegaard",{resource:"stay",barrier:"risk",action:"revisit"}]
  ]){
    const packet=encounterConsequence(id,input);
    assert.equal(packet.status,"declined");
    assert.equal(expressConsequence(packet),null);
  }
});

const evening=(ticks,motivation)=>encounterConsequence("dillard",{ticks,motivation});
const journey=(resource,barrier,action)=>encounterConsequence("kierkegaard",{resource,barrier,action});

test("a further reply distinguishes possible schedules without diagnosing the observed one",()=>{
  const packet=evening([1,4,1],"interrupted");
  const cf=packet.hiddenRelationship.premises.counterfactual;
  assert.equal(packet.hiddenRelationship.kind,"protected-or-remainder");
  assert.deepEqual(cf.protectedWriting,{writing:0.5,messages:2.5,rest:0});
  assert.deepEqual(cf.displacedWriting,{writing:0,messages:2.5,rest:0.5});
  assert.equal(cf.observedOrdering,null);
  assert.equal(evening([1,5,0],"interrupted").hiddenRelationship.premises.counterfactual.protectedWriting,null);
  for(const other of [evening([1,4,1],"planned"), evening([1,3,2],"interrupted"), evening([0,4,2],"interrupted")]){
    assert.notEqual(other.hiddenRelationship.kind,packet.hiddenRelationship.kind);
    assert.equal(other.hiddenRelationship.premises.counterfactual,undefined);
  }
});

test("rest, priority and joint feasibility require distinct positive evidence",()=>{
  assert.equal(evening([1,1,4],"planned").rule,"chosen-rest");
  assert.equal(evening([4,1,1],"planned").rule,"writing-sets-budget");
  assert.equal(evening([2,2,2],"planned").rule,"room-for-both");
  assert.equal(evening([1,1,4],"obligations").rule,"obligations-visible-rest");
  assert.doesNotMatch(evening([1,1,4],"planned").discovery,/makes you more productive|you were exhausted/i);
});

test("reviewing old reasons, responding to new evidence and learning by waiting have distinct warrants",()=>{
  const examples=[
    ["change","surprise","adapt","new-reason-for-action"],
    ["change","surprise","continue","feeling-and-forecast"],
    ["stay","surprise","adapt","continuity-of-place"],
    ["stay","missed","reflect","reasons-and-alternatives"],
    ["change","risk","continue","cost-of-learning"]
  ];
  for(const [first,event,response,kind] of examples){
    const packet=journey(first,event,response);
    assert.equal(packet.hiddenRelationship.kind,kind);
    assert.equal(packet.evidence.originalVerdict,null);
    assert.equal(packet.evidence.unchosenOutcome,null);
    assert.equal(packet.hiddenRelationship.premises.learnedLater,packet.evidence.imaginedLater);
    assert.equal(packet.evidence.retrospectiveInterpretation,packet.hiddenRelationship.warrant);
    assert.doesNotMatch(packet.discovery,/you (chose correctly|made the wrong choice|should have known)|staying would have been better/i);
  }
});

test("each ending carries its own conclusion and cited warrant even when the question is removed",()=>{
  const packets=reachableDecisionRoutes("kierkegaard").map(route=>encounterConsequence("kierkegaard",route));
  for (let w=0;w<=6;w++) for(let m=0;w+m<=6;m++)
    for(const motive of ["interrupted","planned","obligations"]) packets.push(evening([w,m,6-w-m],motive));
  for(const packet of packets){
    const rel=packet.hiddenRelationship;
    assert.equal(rel.concepts.length,2);
    assert.ok(rel.sourceReferences.length && rel.sourceInterpretation && rel.open && rel.warrant);
    assert.ok(packet.trace.includes(rel.kind));
    assert.notEqual(packet.discovery,packet.observation);
    assert.doesNotMatch(packet.discovery,/\?|every decision has consequences|your choices define who you are/i);
    assert.equal(expressConsequence({...packet,question:null}).discovery,packet.discovery);
  }
  assert.ok(packets.some(p=>p.question===null) && packets.some(p=>p.question));
});

import {buildWorldMemory} from "../world-memory.js";

test("each source-specific ending returns to its own quotation in 80–120 words",()=>{
  const packets=reachableDecisionRoutes("kierkegaard").map(input=>encounterConsequence("kierkegaard",input));
  for(let w=0;w<=6;w++) for(let m=0;m+w<=6;m++)
    for(const motive of ["interrupted","planned","obligations"]) packets.push(evening([w,m,6-w-m],motive));
  for(const packet of packets){
    const view=expressConsequence(packet);
    const words=[view.headline,view.experience,view.interpretation,view.proactiveQuestion,...view.visual.items.map(item=>item.text)].join(" ").trim().split(/\s+/).length;
    assert.ok(words>=80 && words<=120,packet.rule+" words="+words);
    assert.equal(view.quote,packet.quote.text);
    assert.match(view.interpretation,packet.caseId==="dillard"?/Dillard/:/Kierkegaard/);
    assert.doesNotMatch(view.headline+view.experience+view.interpretation,/\?/);
    assert.equal((view.proactiveQuestion.match(/\?/g)||[]).length,1);
    assert.equal(view.world,null);
    assert.ok(packet.centralPhilosophicalRelation && packet.hiddenRelationship.warrant);
  }
});

test("material changes in premises select different explanations and questions",()=>{
  const groups=[
    [[evening([1,4,1],"interrupted"),/reserved/,/requests/],[evening([1,1,4],"planned"),/rest/,/rest/],
      [evening([0,3,3],"planned"),/no writing/,/pause/],[evening([4,1,1],"planned"),/most/,/boundary/]],
    [[journey("change","surprise","continue"),/friends/,/continue/],[journey("stay","surprise","adapt"),/team/,/plan/],
      [journey("stay","missed","reflect"),/turned it down/,/alternative|imagine/],[journey("change","risk","continue"),/hours/,/experience/]]
  ];
  for(const paths of groups){
    const questions=new Set();
    for(const [p,observed,grounded] of paths){
      assert.match(p.experience,observed);assert.match(p.sourceGroundedInterpretation,grounded);
      questions.add(p.proactiveQuestion);
    }
    assert.equal(questions.size,4);
  }
});

test("exact saved catalogue evidence is read-only; weak or stale matches produce no section",()=>{
  const input={ticks:[1,4,1],motivation:"interrupted"};
  const quote=evening(input.ticks,input.motivation).quote;
  const catalogue=Array.from({length:14},()=>["Another passage","Other author","Time"]);
  catalogue[quote.id]=[quote.text,quote.author,"Time"];
  const saved=Object.freeze({saved:Object.freeze([quote.id,13])});
  const memory=buildWorldMemory(saved,catalogue);
  const run=m=>encounterConsequence("dillard",input,m);
  const actual=run(memory);
  assert.equal(actual.optionalWorldConnection,null);
  assert.equal(actual.proactiveQuestion,run(null).proactiveQuestion);
  for(const weak of [null,buildWorldMemory({},catalogue),buildWorldMemory({saved:[13]},catalogue),
    {savedThemes:["Time"]},{savedQuoteReferences:[{source:"saved",quoteId:quote.id,text:"Different passage",author:quote.author}]}]){
    assert.equal(run(weak).optionalWorldConnection,null);
  }
  assert.equal(run({...memory,fixture:true}).optionalWorldConnection,null);
  assert.deepEqual(saved.saved,[quote.id,13]);
});

test("eight contrast readings reproduce their selected concept and quote-specific question",()=>{
  for(const [packet,label,claim,question] of [
    [evening([1,4,1],"interrupted"),"Allocated",/30 minutes/,/one more message/],
    [evening([4,1,1],"planned"),"Time set aside",/most/,/boundary/],
    [evening([1,1,4],"planned"),"Tonight",/rest/i,/repeat/],
    [evening([0,3,3],"planned"),"Tonight",/wait/,/pause/],
    [journey("change","surprise","continue"),"Then",/imagine/,/first experience/],
    [journey("stay","surprise","continue"),"First decision",/familiar team/,/which decision/i],
    [journey("stay","missed","reflect"),"Within reach",/reasons/,/one of its possible futures/],
    [journey("change","risk","continue"),"To learn",/hours/,/waiting/]
  ]){
    const visual=expressConsequence(packet).visual;
    assert.equal(visual.kind,packet.hiddenRelationship.kind);
    assert.equal(visual.items[0].label,label);
    assert.match(visual.items[0].text,claim);
    assert.match(packet.proactiveQuestion,question);
    if(packet.caseId==="kierkegaard") assert.equal(packet.evidence.atNextChoice.outcome,null);
  }
  assert.match(evening([2,4,0],"interrupted").visualDistinction.items[0].text,/60 minutes/);
});

test("match archived volunteered words through the real World adapter, never system prompts or keywords",()=>{
  const catalogue=[["Another passage","An author","Time"]];
  const words="I wonder whether careful reasoning can eliminate uncertainty before I decide.";
  const record={id:"history-item",quoteId:0,focus:"uncertainty",date:"2026-10-20",question:"Suggested prompt",note:words};
  const state=Object.freeze({livingThreads:{history:[Object.freeze(record)]}});
  const route={resource:"change",barrier:"surprise",action:"continue"};
  const read=memory=>encounterConsequence("kierkegaard",route,memory).optionalWorldConnection;
  const memory=buildWorldMemory(state,catalogue);
  const connection=read(memory);
  assert.match(encounterConsequence("kierkegaard",route,memory).proactiveQuestion,/reflection settle/);
  assert.equal(connection.excerpt,words);
  assert.equal(connection.field,"note");
  assert.equal(connection.source,"livingThreads.history");
  assert.equal(connection.recordId,record.id);
  assert.equal(connection.date,record.date);
  assert.equal(connection.fixture,false);
  assert.match(connection.text,/previously wrote/);
  assert.match(read({...memory,fixture:true}).text,/sample reflection/);
  for(const note of ["Uncertainty about my holiday budget.","I do not wonder whether careful reasoning can eliminate uncertainty.","My friend asked: "+words,""]){
    assert.equal(read(buildWorldMemory({livingThreads:{history:[{...record,question:words,note}]}},catalogue)),null);
  }
  assert.equal(read({threads:[{...memory.threads[0],type:"ai"}]}),null);
  const prior={...record,note:"",opening:"How do our daily habits shape our priorities?"};
  const dillard=encounterConsequence("dillard",{ticks:[4,1,1],motivation:"planned"},
    buildWorldMemory({livingThreads:{history:[prior]}},catalogue));
  // The curated grammar accepts can/do + my/our + habits/routines.
  assert.equal(dillard.optionalWorldConnection.field,"opening");
  assert.equal(read(buildWorldMemory({livingThreads:{history:[prior]}},catalogue)),null);
});


test("Dillard's former generic fallback now distinguishes materially different paths",()=>{
  const examples=[
    [[1,4,1],"planned","planned-replies-majority"],
    [[1,4,1],"obligations","obligations-visible-replies"],
    [[1,1,4],"obligations","obligations-visible-rest"],
    [[4,1,1],"obligations","obligations-visible-writing"],
    [[2,0,4],"interrupted","interrupted-without-replies"]
  ];
  for(const [ticks,motive,kind] of examples){
    const packet=evening(ticks,motive);
    assert.equal(packet.hiddenRelationship.kind,kind);
    assert.ok(packet.visualDistinction?.items?.length===2);
    assert.ok(packet.proactiveQuestion.includes("?"));
  }
  const all=[];
  for(let w=0;w<=6;w++)for(let m=0;m+w<=6;m++)
    for(const motivation of ["planned","interrupted","obligations"])
      all.push(evening([w,m,6-w-m],motivation));
  assert.ok(all.filter(p=>p.hiddenRelationship.kind==="recurring-foothold").length<=14);
});

test("historical matching accepts varied volunteered inquiries but rejects secondhand or topical fragments",()=>{
  const input={resource:"change",barrier:"surprise",action:"continue"};
  const memory=note=>({threads:[{type:"thread",id:"refl-1",quoteId:0,field:"note",note,date:"2026-10-21"}]});
  for(const note of [
    "Can careful reasoning ever eliminate all uncertainty before I act?",
    "I'm scared of regretting my decisions before I make them.",
    "How can I tell whether to keep going when the future is uncertain?"
  ]){
    const result=encounterConsequence("kierkegaard",input,memory(note));
    assert.equal(result.optionalWorldConnection?.excerpt,note);
    assert.equal(result.optionalWorldConnection.source,"livingThreads.history");
  }
  for(const note of [
    "My friend asked: Can careful reasoning ever eliminate all uncertainty before I act?",
    "Uncertainty about my holiday budget.",
    "I do not wonder whether careful reasoning can eliminate uncertainty before I decide."
  ]) assert.equal(encounterConsequence("kierkegaard",input,memory(note)).optionalWorldConnection,null);
  for(const note of [
    "I keep postponing writing because I end up answering messages.",
    "It feels like I can never make enough time to write."
  ]) assert.equal(encounterConsequence("dillard",{ticks:[1,4,1],motivation:"interrupted"},memory(note)).optionalWorldConnection?.excerpt,note);
});
