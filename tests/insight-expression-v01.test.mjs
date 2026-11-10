import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reasonSeneca,reasonWoolf,runEncounter,reallocateEvening} from "../philosophy-engine/encounter/experience-reasoners-v01.js";
import {validateInsightPacket,MAX_COPY} from "../philosophy-engine/encounter/insight-packet-v01.js";
import {expressInsight} from "../philosophy-engine/encounter/expression-engine-v01.js";
import {buildTwoEncounterStandalone} from "../scripts/build-two-encounter-lab.mjs";
import {ATLAS_PILOT_V01} from "../philosophy-engine/context-atlas/pilot-records-v01.js";

const allAllocations=[];
for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++)allAllocations.push([a,b,6-a-b]);
const choices=["chosen","expected","necessary"];
const packets=[];

test("all 28 time distributions, all three motivations satisfy exact shared Insight Packet contract",()=>{
 for(const ticks of allAllocations)for(const motivation of choices){
  const p=reasonSeneca({ticks,motivation});
  packets.push(p);
  assert.deepEqual(validateInsightPacket(p),[],JSON.stringify({ticks,motivation}));
  assert.equal(p.mechanism,"tradeoff");
  assert.equal(p.quote.id,49);
  assert.equal(p.visual.values.reduce((a,b)=>a+b,0),3);
  assert.ok(p.trace.rules.includes("bounded-budget:180-minutes"));
  assert.equal(p.flags.productionEligible,false);
  assert.equal(p.flags.truthVerdict,false);
  assert.ok(p.insight.discovery.length<=MAX_COPY.discovery);
  const e=expressInsight(p);
  assert.equal(e.summary,p.insight.discovery);
  assert.equal(e.sourceLine,p.insight.connection);
  assert.equal(e.title,p.insight.headline);
  assert.equal(e.question,p.insight.question);
 }
 assert.equal(packets.length,84);
});
test("every slider mutation preserves three hours and exact requested slider",()=>{
 for(const ticks of allAllocations)for(let idx=0;idx<3;idx++)for(let value=0;value<=6;value++){
  const next=reallocateEvening(ticks,idx,value);
  assert.equal(next[idx],value);
  assert.equal(next.reduce((a,b)=>a+b,0),6);
  assert.ok(next.every(Number.isInteger));
 }
});
test("Seneca gives different supported insights for distinct motivations and extreme choices",()=>{
 const chosen=reasonSeneca({ticks:[6,0,0],motivation:"chosen"});
 const expected=reasonSeneca({ticks:[6,0,0],motivation:"expected"});
 const necessary=reasonSeneca({ticks:[6,0,0],motivation:"necessary"});
 assert.notEqual(chosen.insight.discovery,expected.insight.discovery);
 assert.notEqual(necessary.insight.question,expected.insight.question);
 const reflection=reasonSeneca({ticks:[0,0,6],motivation:"chosen"});
 assert.notEqual(reflection.insight.discovery,chosen.insight.discovery);
 assert.match(reflection.insight.discovery,/quiet reflection/);
 assert.doesNotMatch(reflection.insight.discovery,/lazy|good person|bad person|sleep deprived|true meaning/);
});
test("all 27 Woolf enabling-condition paths produce valid and constrained insights",()=>{
 const fields=["income","space","access"],actions=["write","protect","challenge"];
 for(const resource of fields)for(const barrier of fields)for(const action of actions){
  const p=reasonWoolf({resource,barrier,action});
  assert.deepEqual(validateInsightPacket(p),[]);
  assert.equal(p.quote.id,28);
  assert.equal(p.mechanism,"decision_map");
  assert.equal(p.visual.nodes.length,3);
  assert.match(p.insight.connection,/Woolf/);
  assert.match(p.insight.limit,/Historical gender/);
  assert.match(p.trace.rules.join("|"),/non-determinism:no-achievement-prediction/);
  assert.equal(p.flags.truthVerdict,false);
  const e=expressInsight(p);
  assert.ok(e.summary.length<=MAX_COPY.discovery);
  assert.equal(e.visual.type,"path");
 }
});
test("same resource with another barrier or response generates meaningfully different Woolf findings",()=>{
 const base=reasonWoolf({resource:"space",barrier:"space",action:"write"});
 const otherBarrier=reasonWoolf({resource:"space",barrier:"access",action:"write"});
 const otherAction=reasonWoolf({resource:"space",barrier:"access",action:"challenge"});
 assert.notEqual(base.insight.discovery,otherBarrier.insight.discovery);
 assert.notEqual(otherAction.insight.discovery,otherBarrier.insight.discovery);
 assert.notEqual(base.insight.ruleId,otherBarrier.insight.ruleId);
});
test("one shared expression engine preserves philosophical meaning and rejects unsupported tones",()=>{
 const seneca=reasonSeneca({ticks:[4,1,1],motivation:"expected"});
 const woolf=reasonWoolf({resource:"income",barrier:"access",action:"challenge"});
 for(const p of [seneca,woolf]){
  const expressed=expressInsight(p);
  assert.equal(expressed.quoteId,p.quote.id);
  assert.equal(expressed.summary,p.insight.discovery);
  assert.equal(expressed.sourceLine,p.insight.connection);
  assert.ok(!("uncertainty" in expressed));
  assert.equal(expressed.debug.philosophicalLimit,p.insight.limit);
  assert.ok(expressed.debug.sourceReferences.length>=1);
  assert.throws(()=>expressInsight(p,{tone:"playful"}),/Only source-faithful reflective/);
 }
});
test("non-approved Context Atlas examples cannot silently become truth or production eligible",()=>{
 const packet=reasonSeneca({ticks:[2,2,2],motivation:"chosen"});
 assert.equal(packet.flags.editorialStatus,"draft");
 assert.equal(packet.flags.productionEligible,false);
 assert.ok(ATLAS_PILOT_V01.find(r=>r.id===49).review.publisherApproved===false);
 const tampered=structuredClone(packet);
 tampered.flags.productionEligible=true;
 assert.ok(validateInsightPacket(tampered).length);
 assert.throws(()=>expressInsight(tampered),/Invalid Insight Packet/);
});
test("guardrails reject wrong budget, unknown quote mechanism, or malformed input",()=>{
 assert.throws(()=>reasonSeneca({ticks:[4,2,1],motivation:"chosen"}),/Three-hour/);
 assert.throws(()=>reasonSeneca({ticks:[4,2,0],motivation:"angry"}),/valid motivation/);
 assert.throws(()=>reasonWoolf({resource:"income",barrier:"no_barrier",action:"write"}),/Invalid Woolf path/);
 assert.throws(()=>runEncounter("aristotle",{}),/Only founder-approved/);
});
test("self-contained single-file HTML is reproducibly built from exact source",()=>{
 const s=readFileSync(new URL("../experiments/two-encounter-insight-lab-v02-standalone.html",import.meta.url),"utf8");
 assert.equal(s,buildTwoEncounterStandalone());
 assert.match(s,/function reasonSeneca/);
 assert.match(s,/function reasonWoolf/);
 assert.match(s,/function expressInsight/);
 assert.match(s,/const ATLAS_PILOT_V01/);
 assert.doesNotMatch(s,/^import\s/m);
 assert.doesNotMatch(s,/<script[^>]+src=/);
 assert.doesNotMatch(s,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
});
