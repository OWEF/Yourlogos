import {test} from "node:test";
import assert from "node:assert/strict";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically,expressSemantic} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {adaptEncounterEvidence,selectEmotionStrategy,V20_WORD_POLICY} from "../philosophy-engine/encounter/emotion-strategy-v20.js";
import {renderEncounterV20,encounterV20,validateEncounterV20} from "../philosophy-engine/encounter/encounter-v20.js";

export const SIX_PATHS=[
 ["dillard-full","dillard",{amounts:[6,0,0],budgets:[6],repetitions:5},"playful"],
 ["dillard-rest","dillard",{amounts:[0,0,6],budgets:[6],repetitions:5},"warm"],
 ["dillard-shared","dillard",{amounts:[3,1,2],budgets:[6],repetitions:5},"contemplative"],
 ["epictetus-offer","apology",{path:["offer","space"]},"provocative"],
 ["epictetus-space","apology",{path:["space","space"]},"warm"],
 ["kierkegaard-move","kierkegaard",{path:["change","risk","continue"]},"contemplative"],
 ["kierkegaard-stay","kierkegaard",{path:["stay","missed","reflect"]},"provocative"]
];
test("seven required pilot paths derive from unmodified meaning/1.2 and produce word-compliant three sections",()=>{
 for(const [id,key,input,strategy] of SIX_PATHS){
  const packet=reasonSemantically(semanticCases[key],input);
  assert.equal(packet.status,"ready",id+" "+packet.reason);
  const before=expressSemantic(packet);
  const adapted=adaptEncounterEvidence(packet);
  assert.equal(adapted.status,"ready",id);
  assert.ok(adapted.evidence.some(x=>x.id==="source:central"));
  const out=renderEncounterV20(packet);
  assert.equal(out.status,"ready",id+" "+JSON.stringify(out));
  assert.deepEqual(out.sections.map(s=>s.label),["Your Choice","Back to the Philosopher","One Last Thing…"]);
  assert.equal(out.brief.strategy,strategy,id);
  assert.ok(out.wordCount>=V20_WORD_POLICY.total.min&&out.wordCount<=V20_WORD_POLICY.total.max,id);
  assert.equal(out.source_review,"curated_provisional");
  assert.equal(out.brief.source_warrant_id,"source:central");
  assert.ok(out.brief.selection_trace.scored.length>=2);
  assert.ok(out.sections[1].evidence_ids.includes("source:central"));
  assert.deepEqual(expressSemantic(packet),before,"v1 expression must be unchanged");
  assert.deepEqual(semanticCases[key].initial,semanticCases[key].initial,"scenario remains intact");
 }
});
test("different decisions create different explanations and ending observations",()=>{
 for(const [key,a,b] of [
  ["dillard",{amounts:[6,0,0],budgets:[6],repetitions:5},{amounts:[0,0,6],budgets:[6],repetitions:5}],
  ["apology",{path:["offer","space"]},{path:["space","space"]}],
  ["kierkegaard",{path:["change","risk","continue"]},{path:["stay","missed","reflect"]}]
 ]){
  const first=encounterV20(semanticCases[key],a),second=encounterV20(semanticCases[key],b);
  assert.equal(first.status,"ready");assert.equal(second.status,"ready");
  assert.notEqual(first.sections[0].text,second.sections[0].text);
  assert.notEqual(first.sections[1].text,second.sections[1].text);
  assert.notEqual(first.sections[2].text,second.sections[2].text);
 }
});
test("strategy choice deterministic; incompatible tone request abstains rather than fabricates humor",()=>{
 const p=reasonSemantically(semanticCases.apology,{path:["offer","space"]});
 const a=selectEmotionStrategy(p),b=selectEmotionStrategy(p);
 assert.deepEqual(a,b);
 assert.equal(a.strategy,"provocative");
 const x=selectEmotionStrategy(p,{tone:"playful"});
 assert.equal(x.strategy,"neutral");
 assert.match(x.fallback_reason,/No source-grounded angle/);
 assert.ok(x.selection_trace.rejected.some(y=>y.id==="apology-humor"));
 assert.equal(renderEncounterV20(p,{tone:"playful"}).status,"ready");
});
test("selected response is not falsely presented as an accomplished apology",()=>{
 const p=reasonSemantically(semanticCases.apology,{path:["space","space"]});
 const out=renderEncounterV20(p);
 assert.equal(out.status,"ready");
 assert.match(out.sections[0].text,/No offered apology is recorded/);
 assert.doesNotMatch(out.sections.map(x=>x.text).join(" "),/you apologized|you sent an apology/i);
 assert.match(out.sections[0].text,/unknown/);
});
test("Dillard writing/rest and Kierkegaard unchosen routes preserve hypothetical boundaries",()=>{
 const d=encounterV20(semanticCases.dillard,{amounts:[0,0,6],budgets:[6],repetitions:5});
 assert.equal(d.status,"ready");
 assert.match(d.sections[0].text,/imagined/);
 assert.match(d.sections[1].text,/real/);
 const k=encounterV20(semanticCases.kierkegaard,{path:["stay","missed","reflect"]});
 assert.equal(k.status,"ready");
 assert.match(k.sections[0].text,/unknown/);
 assert.match(k.sections[1].text,/cannot reveal what the other future held/);
});
test("fabricated source provenance or invented selected choice is rejected",()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const bad=structuredClone(p);
 bad.sourceAdmission.centralClaim="A fabricated philosophical theory";
 assert.equal(renderEncounterV20(bad).status,"needs_editorial_review");
 const reading=renderEncounterV20(p);
 reading.sections[0].evidence_ids.push("user:emotion");
 assert.equal(validateEncounterV20(p,reading).status,"needs_editorial_review");
});
test("short output cannot silently bypass frozen founder word policy",()=>{
 const p=reasonSemantically(semanticCases.apology,{path:["offer","space"]});
 const reading=renderEncounterV20(p);
 assert.equal(reading.status,"ready");
 reading.sections[2].text="Okay.";
 assert.equal(validateEncounterV20(p,reading).status,"needs_editorial_review");
});
test("no cross-source reinterpretation, stage-only evidence or unsupported scenario reads",()=>{
 const p=reasonSemantically(semanticCases.money,semanticCases.money.initial);
 assert.equal(p.status,"ready");
 assert.equal(renderEncounterV20(p).status,"needs_editorial_review");
 const wrong=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 wrong.meaning.evidence.totalAllocated++;
 assert.equal(renderEncounterV20(wrong).status,"needs_editorial_review");
});

test("CZ-127 RED: a forged displayed quotation must fail source-witness admission",()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const corrupt=structuredClone(p);
 corrupt.quote="An invented quotation never written by this author.";
 assert.equal(renderEncounterV20(corrupt).status,"needs_editorial_review");
});
test("CZ-127 RED: two genuinely eligible tones change the rhetoric on the same validated path",()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const playful=renderEncounterV20(p,{tone:"playful"});
 const contemplative=renderEncounterV20(p,{tone:"contemplative"});
 assert.equal(playful.status,"ready");
 assert.equal(contemplative.status,"ready");
 assert.equal(playful.brief.strategy,"playful");
 assert.equal(contemplative.brief.strategy,"contemplative");
 assert.notEqual(playful.sections[2].text,contemplative.sections[2].text);
 assert.equal(playful.sections[1].text,contemplative.sections[1].text);
});
