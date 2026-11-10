import {test} from "node:test";
import assert from "node:assert/strict";
import {transferContexts as contexts} from "../philosophy-engine/encounter/kernel-contexts-v11.js";
import {mechanismFit,evaluateKernel,tradeoffStructure,decisionStructure,pilotStructure} from "../philosophy-engine/encounter/reasoning-kernel-v11.js";
import {getMechanismCase} from "../philosophy-engine/encounter/mechanism-transfer-cases-v02.js";
import {evaluateTradeoffCase,evaluateDecisionCase,reachableDecisionRoutes} from "../philosophy-engine/encounter/mechanism-transfer-engine-v02.js";
import {encounterConsequence,expressConsequence} from "../philosophy-engine/encounter/consequence-v1.js";

test("source and operation must fit the actual scenario",()=>{
 for(const ctx of Object.values(contexts))assert.equal(mechanismFit(ctx).status,"conditional");
 assert.equal(mechanismFit({...contexts.thoreau,assumptions:[]}).status,"applicable");
 for(const c of [null,{...contexts.smith,source:null},{...contexts.smith,operation:"conversion"},
   {...contexts.smith,operations:["decision_map"]},{...contexts.descartes,mechanism:"counterexample"}]){
   assert.equal(evaluateKernel(c,{}).status,"unsupported");
 }
});
test("four different texts reach the existing expression layer through the same packet contract",()=>{
 const inputs=[["thoreau",{amounts:[1,0,1],budgets:[6]}],["smith",{amounts:[3,1],budgets:[4]}],
  ["epictetus",{path:["revise","edit","wait"]}],["descartes",{path:["seek","qualify","amend"]}]];
 for(const [id,input] of inputs){
  const p=evaluateKernel(contexts[id],input),v=expressConsequence(p);
  assert.equal(p.version,"reasoning/1.1");assert.equal(v.quote,contexts[id].quote);
  assert.equal(v.interpretation,p.relation);assert.equal(v.proactiveQuestion,p.question);
  assert.ok(p.claims.some(c=>c.classification==="unsupported"));assert.ok(!v.experience.includes(contexts[id].limit));
  assert.ok(p.claims.some(c=>c.classification==="conditional"));assert.ok(v.experience.includes(p.claims[0].text));
 }
});
test("changing constraints, two resources, spare capacity and complementary output",()=>{
 const m=contexts.thoreau.model;
 const p=tradeoffStructure(m,{amounts:[1,0,1],budgets:[8]});assert.equal(p.measure,4);assert.deepEqual(p.slack,[4]);
 assert.ok(p.alternatives.some(a=>a.remove===-1));
 assert.equal(tradeoffStructure(m,{amounts:[1,1,2],budgets:[5]}),null);
 const joint=tradeoffStructure(contexts.smith.model,{amounts:[3,1],budgets:[4]});
 assert.equal(joint.measure,1);assert.ok(joint.alternatives.some(a=>a.measure===2));
 assert.equal(tradeoffStructure(contexts.smith.model,{amounts:[0,0],budgets:[4]}),null);
 const two={resources:[{min:0,max:10,type:"cap"},{min:0,max:2,type:"cap"}],choices:Array.from({length:5},(_,i)=>({id:i,max:4,cost:[1,i%2]}))};
 assert.deepEqual(tradeoffStructure(two,{amounts:[1,1,1,1,1],budgets:[7,2]}).slack,[2,0]);
 assert.equal(tradeoffStructure(two,{amounts:[1,2,1,1,1],budgets:[7,2]}),null);
});
test("a graph rejects missing facts and invalid edits and distinguishes revision from closure",()=>{
 const c=contexts.epictetus,d=contexts.descartes;
 assert.equal(evaluateKernel(c,{path:["pass"]}).structure.steps.length,1);
 assert.equal(evaluateKernel(c,{path:["send","revise"]}).status,"unsupported");
 assert.equal(evaluateKernel(d,{path:["cite"]}).status,"unsupported");
 assert.equal(evaluateKernel(d,{path:["seek"]}).status,"unsupported");
 assert.deepEqual(evaluateKernel(d,{path:["seek","qualify","amend"]}).structure.revisions,[{field:"report",from:"provisional",to:"confirmed"}]);
 assert.equal(evaluateKernel(d,{path:["seek","verify","cite"]}).structure.steps.length,3);
 const altered=structuredClone(d.model);altered.nodes.reply.options[1].reveal=[];
 assert.equal(decisionStructure(altered,["seek","verify","cite"]),null);
});
test("Dillard and Kierkegaard retain voices and use the structural kernel; Seneca and Woolf transfer unchanged",()=>{
 assert.equal(encounterConsequence("dillard",{ticks:[0,2,4],motivation:"interrupted"}).kernel.structure.spent[0],6);
 assert.equal(encounterConsequence("kierkegaard",reachableDecisionRoutes("kierkegaard")[0]).kernel.structure.steps.length,3);
 const input={ticks:[1,2,3],motivation:"chosen"};
 assert.equal(pilotStructure(getMechanismCase("seneca"),evaluateTradeoffCase("seneca",input),input).status,"ready");
 for(const route of reachableDecisionRoutes("woolf"))assert.equal(pilotStructure(getMechanismCase("woolf"),evaluateDecisionCase("woolf",route),route).status,"ready");
});
test("the expression boundary withholds an ungrounded or reclassified headline",()=>{
 const packet=evaluateKernel(contexts.smith,{amounts:[3,1],budgets:[4]});
 assert.equal(expressConsequence({...packet,headline:"You value efficiency above everything."}),null);
 assert.equal(expressConsequence({...packet,claims:packet.claims.map(c=>c.role==="discovery"?{...c,classification:"unsupported"}:c)}),null);
});
