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
  assert.equal(rules.size,7);
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
