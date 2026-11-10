import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reasonSeneca,reasonWoolf} from "../philosophy-engine/encounter/experience-reasoners-v01.js";
import {ALLOWED_STANCES,selectDiscovery} from "../philosophy-engine/encounter/personal-question-engine-v02.js";
import {expressPersonalInsight} from "../philosophy-engine/encounter/expression-engine-v02.js";
import {buildPersonalDiscoveryStandalone} from "../scripts/build-personal-discovery-lab-v03.mjs";

const cases=[];
for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++)cases.push([a,b,6-a-b]);
test("same 111 pilot pathways × 4 optional stances yield a valid conditional discovery",()=>{
 let count=0;
 for(const ticks of cases)for(const motivation of ["chosen","expected","necessary"]){
   const packet=reasonSeneca({ticks,motivation});
   for(const stance of ALLOWED_STANCES){
     const d=selectDiscovery(packet,stance);
     const e=expressPersonalInsight(packet,{stance});
     assert.equal(d.quoteId,49);
     assert.equal(d.mechanism,"tradeoff");
     assert.equal(d.expression.title,e.title);
     assert.equal(d.questionSelection.prompt,e.question);
     assert.equal(d.relevance.category,stance);
     assert.equal(e.summary,d.tension);
     assert.equal(e.visual.type,"segments");
     assert.equal(e.debug.fiveStages.observation,packet.observation.text);
     assert.equal(e.debug.uncertainty,packet.insight.limit);
     assert.equal(e.debug.sourceReferences.length>=1,true);
     assert.equal(e.complete,stance==="positive");
     assert.equal(e.question===null,stance==="positive");
     assert.equal(e.question!==null,stance!=="positive");
     count++;
   }
 }
 for(const resource of ["income","space","access"])for(const barrier of ["income","space","access"])
  for(const action of ["write","protect","challenge"]){
   const packet=reasonWoolf({resource,barrier,action});
   for(const stance of ALLOWED_STANCES){
     const d=selectDiscovery(packet,stance);
     const e=expressPersonalInsight(packet,{stance});
     assert.equal(d.quoteId,28);
     assert.equal(e.visual.type,"path");
     assert.equal(e.question===null,stance==="positive");
     assert.equal(e.question!==null,stance!=="positive");
     assert.equal(e.debug.sourceReferences.length>=1,true);
     assert.match(e.debug.uncertainty,/gender/i);
     count++;
   }
  }
 assert.equal(count,444);
});
test("optional work + necessary unlocks the challenging 'optional versus necessary' tension",()=>{
 const packet=reasonSeneca({ticks:[6,0,0],motivation:"necessary"});
 const e=expressPersonalInsight(packet,{stance:"mixed"});
 assert.match(e.title,/When did optional become necessary/);
 assert.match(e.question,/What made saying no difficult/);
 assert.match(e.summary,/optional request/);
 assert.equal(e.complete,false);
 assert.match(e.sourceLine,/not a judgment against work/);
});
test("a strong positive answer gracefully finishes without inventing emotional tension",()=>{
 const p=reasonSeneca({ticks:[6,0,0],motivation:"chosen"});
 const e=expressPersonalInsight(p,{stance:"positive"});
 assert.equal(e.complete,true);
 assert.equal(e.question,null);
 assert.match(e.title,/choice you can stand behind/);
 assert.doesNotMatch(e.summary,/trapped|unhappy|pressured|afraid|anxious/i);
 assert.equal(e.debug.fiveStages.personalRelevance.source,"optional_user_input");
});
test("same time allocation gives relevant, different questions depending on self-reported motive",()=>{
 const all=["chosen","expected","necessary"].map(motivation=>
   expressPersonalInsight(reasonSeneca({ticks:[4,1,1],motivation}),{stance:"mixed"}));
 assert.equal(new Set(all.map(x=>x.question)).size,3);
 assert.equal(new Set(all.map(x=>x.title)).size,3);
});
test("when no emotional context was given, the engine does not claim to read feelings",()=>{
 for(const mechanism of ["tradeoff","decision_map"]){
   const packet=mechanism==="tradeoff"?
     reasonSeneca({ticks:[2,2,2],motivation:"chosen"}):
     reasonWoolf({resource:"income",barrier:"space",action:"write"});
   const e=expressPersonalInsight(packet);
   assert.equal(e.complete,false);
   assert.equal(e.debug.fiveStages.personalRelevance.category,"unstated");
   assert.match(e.debug.fiveStages.personalRelevance.reason,/was not provided/);
   assert.doesNotMatch(e.title,/you are unhappy|you feel trapped/i);
 }
});
test("all routes remain tentative, with claims traceable to existing Insight Packet",()=>{
 const p=reasonWoolf({resource:"access",barrier:"income",action:"challenge"});
 const e=expressPersonalInsight(p,{stance:"uncertain"});
 assert.equal(p.flags.productionEligible,false);
 assert.equal(p.flags.truthVerdict,false);
 assert.equal(e.debug.priorRule,p.insight.ruleId);
 assert.deepEqual(e.visual,p.visual);
 assert.match(e.sourceLine,/Woolf/);
 assert.match(e.debug.disclaimer,/not psychological assessment/);
});
test("bad status or malformed source packet fails closed",()=>{
 const p=reasonSeneca({ticks:[4,1,1],motivation:"expected"});
 assert.throws(()=>selectDiscovery(p,"angry"),/Invalid optional user stance/);
 const q=structuredClone(p);q.flags.productionEligible=true;
 assert.throws(()=>expressPersonalInsight(q,{stance:"positive"}),/Invalid Insight Packet/);
});
test("offline standalone HTML is an exact reproducible build from seven source modules",()=>{
 const out=readFileSync(new URL("../experiments/two-encounter-discovery-lab-v03-standalone.html",import.meta.url),"utf8");
 assert.equal(out,buildPersonalDiscoveryStandalone());
 assert.match(out,/function selectDiscovery/);
 assert.match(out,/function expressPersonalInsight/);
 assert.match(out,/class="mindmap"/);
 assert.match(out,/data-stance/);
 assert.match(out,/data-map-target/);
 assert.doesNotMatch(out,/^import\s/m);
 assert.doesNotMatch(out,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
});


test("whole-evening motivation is never misassigned to optional work that received zero hours",()=>{
 for(const motivation of ["necessary","expected","chosen"]){
   for(const stance of ["mixed","uncertain","unstated"]){
     const packet=reasonSeneca({ticks:[0,2,4],motivation});
     const e=expressPersonalInsight(packet,{stance});
     assert.doesNotMatch(e.title,/When did optional become necessary/);
     assert.doesNotMatch(e.summary,/gave free time to an optional request/);
     assert.ok(e.question);
   }
 }
 const necessary=expressPersonalInsight(reasonSeneca({ticks:[0,3,3],motivation:"necessary"}),{stance:"mixed"});
 assert.match(necessary.question,/Which part of tonight felt hardest to change/);
});
test("Woolf questions respond to actually chosen barriers and actions, not just sentiment",()=>{
 const q=(barrier,action)=>expressPersonalInsight(
   reasonWoolf({resource:"income",barrier,action}),{stance:"mixed"}).question;
 assert.notEqual(q("space","write"),q("access","write"));
 assert.notEqual(q("space","write"),q("space","challenge"));
 assert.match(q("space","challenge"),/uninterrupted space/);
 assert.match(q("access","challenge"),/whose writing/);
});
