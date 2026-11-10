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
  assert.equal(rules.size,9);
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
  assert.equal(evening([1,1,4],"obligations").rule,"recurring-foothold");
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
