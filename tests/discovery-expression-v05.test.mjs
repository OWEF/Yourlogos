import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reasonSeneca,reasonWoolf} from "../philosophy-engine/encounter/experience-reasoners-v01.js";
import {SENECA_DETAILS,synthesizeDiscovery} from "../philosophy-engine/encounter/discovery-synthesis-v01.js";
import {expressDiscovery} from "../philosophy-engine/encounter/expression-engine-v03.js";
import {adaptYourLogosFingerprint} from "../philosophy-engine/encounter/fingerprint-evidence-bridge-v01.js";
import {buildDiscoveryExpressionStandalone} from "../scripts/build-discovery-expression-lab-v05.mjs";

const validAllocations=[];
for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++)validAllocations.push([a,b,6-a-b]);
test("all 84 valid Seneca allocations and declared motives produce supported observations and nontrivial distinctions",()=>{
 let count=0;
 for(const ticks of validAllocations)for(const motivation of ["chosen","expected","necessary"]){
  const p=reasonSeneca({ticks,motivation});
  const r=expressDiscovery(p);
  assert.equal(r.mechanism,"tradeoff");
  assert.ok(r.discovery.length>60);
  assert.ok(r.tension.length>45);
  assert.ok(r.connection.includes("Seneca"));
  assert.equal(r.debug.supportingFacts.includes("chosen allocation"),true);
  assert.equal(r.debug.noTruthVerdict,true);
  assert.equal(r.fingerprintLink,null);
  assert.equal(r.fingerprintEvidence,null);
  count++;
 }
 assert.equal(count,84);
});
test("3 explicit reason choices for each motivation are validated and generate materially different discoveries",()=>{
 for(const motivation of ["chosen","expected","necessary"]){
  const packet=reasonSeneca({ticks:[6,0,0],motivation});
  const variants=SENECA_DETAILS[motivation].map(x=>expressDiscovery(packet,{reasonDetail:x.id}));
  assert.equal(variants.length,3);
  assert.equal(new Set(variants.map(x=>x.discovery)).size,3);
  assert.ok(variants.every(x=>x.debug.supportingFacts.length===4));
  assert.equal(variants[0].stages.personalRelevance!==null,true);
 }
});
test("optional work / necessary distinction is real but not inferred if zero work",()=>{
 const full=expressDiscovery(reasonSeneca({ticks:[6,0,0],motivation:"necessary"}));
 assert.match(full.title,/optional become necessary/i);
 assert.match(full.discovery,/external rule|possible consequence|commitment/);
 const none=expressDiscovery(reasonSeneca({ticks:[0,3,3],motivation:"necessary"}));
 assert.doesNotMatch(none.title,/optional become necessary/i);
 assert.doesNotMatch(none.discovery,/optional work was necessary/i);
 assert.match(none.discovery,/obligation may lie|allocation cannot/);
});
test("no extra question is imposed when explicit personal reasons already resolve the relevant tension",()=>{
 const chosen=expressDiscovery(reasonSeneca({ticks:[6,0,0],motivation:"chosen"}),{reasonDetail:"intrinsic"});
 assert.equal(chosen.question,null);
 const expected=expressDiscovery(reasonSeneca({ticks:[6,0,0],motivation:"expected"}),{reasonDetail:"also_wanted"});
 assert.equal(expected.question,null);
 assert.match(expected.discovery,/not the same as coercion/);
});
test("all eight UI-reachable Woolf routes produce distinct opportunity/barrier/action discoveries",()=>{
 let count=0;
 const pathways={
  income:{space:["write","protect"],access:["write","challenge"]},
  space:{income:["write","challenge"],access:["write","challenge"]}
 };
 for(const [resource,barriers] of Object.entries(pathways))
  for(const [barrier,actions] of Object.entries(barriers))
   for(const action of actions){
    const p=reasonWoolf({resource,barrier,action});
    const r=expressDiscovery(p);
    assert.equal(r.mechanism,"decision_map");
    assert.equal(r.quoteId,28);
    assert.match(r.discovery,/different|separate|same freedom/);
    assert.equal(r.visual.nodes.length,3);
    assert.equal(r.debug.supportingFacts.length,3);
    assert.match(r.connection,/Woolf/);
    count++;
   }
 assert.equal(count,8);
 const privateAndPublic=expressDiscovery(reasonWoolf({resource:"space",barrier:"access",action:"challenge"}));
 assert.match(privateAndPublic.discovery,/Creating privately and being heard publicly/);
 assert.match(privateAndPublic.discovery,/institutions|rules|conditions/);
});
test("non-reachable same-condition Woolf paths fail closed rather than pretending to be generalized",()=>{
 const p=reasonWoolf({resource:"space",barrier:"space",action:"write"});
 assert.throws(()=>synthesizeDiscovery(p),/only distinct enabling conditions/);
});
test("fingerprint bridge uses existing saved quotes and event shapes but never assigns beliefs",()=>{
 const quotes=[["x","Author","Time"],["y","Author","Time"],["z","Author","Freedom"],["a","Author","Freedom"]];
 const data={saved:[0,1],encounterEvents:[{source:"encounter",quoteId:2,theme:"Freedom"},{source:"encounter",quoteId:3,theme:"Freedom"},{source:"encounter",quoteId:0,theme:"Faked"}]};
 const history=adaptYourLogosFingerprint(data,quotes);
 assert.equal(history.events.length,4);
 assert.deepEqual(history.events.map(x=>x.theme),["Time","Time","Freedom","Freedom"]);
 const p=reasonSeneca({ticks:[6,0,0],motivation:"necessary"});
 const d=expressDiscovery(p,{fingerprintEvidence:history});
 assert.match(d.fingerprintLink,/explored time in 2 earlier/);
 assert.match(d.fingerprintLink,/not a claim about what you believe/);
 assert.equal(d.fingerprintEvidence.certainty,"observed_activity_only");
 assert.equal(d.debug.noTruthVerdict,true);
 const empty=expressDiscovery(p,{fingerprintEvidence:{events:[]}});
 assert.equal(empty.fingerprintLink,null);
});
test("fingerprint bridge never pulls or persists browser data and validates evidence",()=>{
 const p=reasonSeneca({ticks:[6,0,0],motivation:"necessary"});
 assert.throws(()=>synthesizeDiscovery(p,{fingerprintEvidence:{events:"made-up"}}),/verified event summary/);
 assert.throws(()=>synthesizeDiscovery(p,{reasonDetail:"anger"}),/not a valid reason/);
 assert.throws(()=>synthesizeDiscovery(reasonWoolf({resource:"space",barrier:"access",action:"write"}),{reasonDetail:"anger"}),/already supplies enough/);
 const corrupted=structuredClone(p);corrupted.flags.productionEligible=true;
 assert.throws(()=>synthesizeDiscovery(corrupted),/Unverified Insight Packet/);
});
test("standalone phone artifact exactly matches unchanged philosophical sources",()=>{
 const actual=readFileSync(new URL("../experiments/two-encounter-discovery-expression-lab-v05-standalone.html",import.meta.url),"utf8");
 assert.equal(actual,buildDiscoveryExpressionStandalone());
 assert.match(actual,/function synthesizeDiscovery/);
 assert.match(actual,/function expressDiscovery/);
 assert.match(actual,/function adaptYourLogosFingerprint/);
 assert.doesNotMatch(actual,/^import\s/m);
 assert.doesNotMatch(actual,/XMLHttpRequest|localStorage|sessionStorage|fetch\s*\(/);
});
