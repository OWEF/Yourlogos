import {test} from "node:test";
import assert from "node:assert/strict";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically,expressSemantic} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {adaptEncounterEvidence,selectEmotionStrategy,V20_WORD_POLICY} from "../philosophy-engine/encounter/emotion-strategy-v20.js";
import {renderEncounterV20,encounterV20,validateEncounterV20,withPartialScheduleCapacity} from "../philosophy-engine/encounter/encounter-v20.js";

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

test("CZ-127 RED: validator rejects a fabricated user fact even if evidence IDs are retained",()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const forged=structuredClone(renderEncounterV20(p));
 forged.sections[2].text+=" Your real friends are disappointed in you.";
 assert.equal(validateEncounterV20(p,forged).status,"needs_editorial_review");
});
test("CZ-127 RED: validator rejects an unselected rhetorical angle with borrowed evidence",()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const forged=structuredClone(renderEncounterV20(p));
 forged.brief.rhetorical_angle.id="space-not-outcome";
 assert.equal(validateEncounterV20(p,forged).status,"needs_editorial_review");
});

test("CZ-127 RED editorial: later-route knowledge reads as grammatical plain English",()=>{
 for(const path of [["change","risk","continue"],["stay","missed","reflect"]]){
  const out=encounterV20(semanticCases.kierkegaard,{path});
  assert.equal(out.status,"ready");
  assert.match(out.sections[1].text,/Later in the imagined route, a new detail appears:/);
  assert.doesNotMatch(out.sections[1].text,/only becomes known after the first decision/);
 }
});

test("CZ-127 corrective RED: partial slot allocation never becomes whole available evening",()=>{
 const partial=withPartialScheduleCapacity(semanticCases.dillard);
 assert.equal(semanticCases.dillard.model.resources[0].type,"exact","frozen scenario untouched");
 assert.equal(partial.model.resources[0].type,"cap","explicit v2 adapter enables unused capacity");
 assert.equal(reasonSemantically(semanticCases.dillard,{amounts:[2,0,0],budgets:[6],repetitions:5}).status,
  "incompatible","the original v1 scenario must retain its exact-allocation contract");
 const cases=[
  {amounts:[2,0,0],allocated:2,unused:4,hours:"1 hour",unallocated:"2 hours",expect:"writing"},
  {amounts:[0,0,3],allocated:3,unused:3,hours:"1.5 hours",unallocated:"1.5 hours",expect:"rest"},
  {amounts:[0,0,0],allocated:0,unused:6,hours:"3 hours",unallocated:"3 hours",expect:"none"},
  {amounts:[6,0,0],allocated:6,unused:0,hours:"3 hours",unallocated:null,expect:"writing"}
 ];
 for(const c of cases){
  const packet=reasonSemantically(partial,{amounts:c.amounts,budgets:[6],repetitions:5});
  assert.equal(packet.status,"ready",JSON.stringify(c));
  const e=packet.meaning.evidence;
  assert.equal(e.perIntervalCapacity,6);
  assert.equal(e.perIntervalAllocated,c.allocated);
  assert.equal(e.perIntervalUnallocated,c.unused);
  const a=adaptEncounterEvidence(packet);
  assert.equal(a.status,"ready");
  assert.equal(a.allocation.per_interval_available_slots,6);
  assert.equal(a.allocation.per_interval_allocated_slots,c.allocated);
  assert.equal(a.allocation.per_interval_unallocated_slots,c.unused);
  assert.equal(a.allocation.total_available_slots,30);
  const brief=selectEmotionStrategy(packet),output=renderEncounterV20(packet);
  assert.equal(output.status,"ready",JSON.stringify(output));
  assert.match(output.sections[0].text,new RegExp(c.unallocated?"unallocated":"all three hours","i"));
  if(c.unallocated){
   assert.match(output.sections[0].text,new RegExp(c.unallocated.replace(".","\\.")));
   assert.doesNotMatch(output.sections.slice(1).map(s=>s.text).join(" "),/whole evening|whole timetable|entire evening|fills the modeled block|all of the available time/i);
   assert.notEqual(brief.rhetorical_angle.id,"schedule-booked");
   assert.notEqual(brief.rhetorical_angle.id,"rest-is-part-of-day");
  } else {
   assert.equal(brief.rhetorical_angle.id,"schedule-booked");
  }
  assert.match(output.sections[0].text,/imagined/i);
 }
});
test("CZ-127 corrective RED: author identity and provenance changes invalidate READY",()=>{
 const packet=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const original=renderEncounterV20(packet);
 assert.equal(original.status,"ready");
 for(const [field,value] of [
  ["author","Another Philosopher"],["quote","Invented source"],["source_url","https://invalid.example/source"],
  ["source_warrant","Different supposed warrant"],["source_review","independently_verified"]
 ]){
  const altered=structuredClone(original);altered[field]=value;
  assert.doesNotThrow(()=>validateEncounterV20(packet,altered),field);
  assert.equal(validateEncounterV20(packet,altered).status,"needs_editorial_review",field);
 }
});
test("CZ-127 corrective RED: malformed strategy brief never throws; returns editorial-review",()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 const original=renderEncounterV20(p);assert.equal(original.status,"ready");
 const defects=[
  {title:"missing entire brief",change:x=>delete x.brief},
  {title:"null",change:x=>x.brief=null},
  {title:"string",change:x=>x.brief="playful"},
  {title:"empty object",change:x=>x.brief={}},
  {title:"missing evidence list",change:x=>delete x.brief.grounded_evidence_ids},
  {title:"null evidence list",change:x=>x.brief.grounded_evidence_ids=null},
  {title:"wrong evidence list type",change:x=>x.brief.grounded_evidence_ids="meaning:central"},
  {title:"null rhetorical angle",change:x=>x.brief.rhetorical_angle=null},
  {title:"null selection trace",change:x=>x.brief.selection_trace=null},
  {title:"missing prohibited claims",change:x=>delete x.brief.prohibited_claims},
  {title:"typed strategy object",change:x=>x.brief.strategy={id:"playful"}},
  {title:"incorrect evidence entry",change:x=>x.brief.grounded_evidence_ids=[15]},
  {title:"missing source warrant",change:x=>delete x.brief.source_warrant_id}
 ];
 for(const d of defects){
  const altered=structuredClone(original);d.change(altered);
  assert.doesNotThrow(()=>validateEncounterV20(p,altered),d.title);
  assert.equal(validateEncounterV20(p,altered).status,"needs_editorial_review",d.title);
 }
});
test("CZ-127 corrective RED: endings do not narrate a ledger back to the reader",()=>{
 const paths=[
  ["dillard",{amounts:[0,0,6],budgets:[6],repetitions:5}],
  ["dillard",{amounts:[3,1,2],budgets:[6],repetitions:5}],
  ["apology",{path:["space","space"]}],
  ["kierkegaard",{path:["stay","missed","reflect"]}]
 ];
 for(const [k,input] of paths){
  const out=encounterV20(semanticCases[k],input);
  assert.equal(out.status,"ready",k);
  const ending=out.sections[2].text;
  assert.doesNotMatch(ending,/selected response|entire timetable|gets another page|you cannot visit the future/i,k+": "+ending);
 }
});

test("CZ-127 corrective RED: per-evening partial schedule is explicit and ordinary English",()=>{
 const partial=withPartialScheduleCapacity(semanticCases.dillard);
 for(const [amounts,activity,unused,cumulative] of [
  [[2,0,0],"1 hour for writing your story","2 hours","5 hours"],
  [[0,0,3],"1.5 hours for resting and recharging","1.5 hours","7.5 hours"],
  [[0,0,0],"no modeled activity receives time","3 hours","15 hours"]
 ]){
  const out=encounterV20(partial,{amounts,budgets:[6],repetitions:5});
  assert.equal(out.status,"ready",JSON.stringify(out));
  assert.match(out.sections[0].text,new RegExp(activity.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"));
  assert.match(out.sections[0].text,new RegExp(unused.replace(".","\\.")));
  assert.match(out.sections[0].text,new RegExp(cumulative.replace(".","\\.")));
  assert.doesNotMatch(out.sections[1].text,/hours stays unassigned/i);
 }
});

test("CZ-127 source identity RED: Dillard packet refuses Adam Smith and empty authors before READY",()=>{
 const packet=reasonSemantically(semanticCases.dillard,{amounts:[6,0,0],budgets:[6],repetitions:5});
 assert.equal(packet.status,"ready");
 assert.equal(renderEncounterV20(packet).status,"ready");
 for(const author of ["Adam Smith",""]){
  const forged=structuredClone(packet);
  forged.author=author;
  assert.equal(forged.quote,packet.quote);
  assert.equal(forged.sourceAdmission.sourceUrl,packet.sourceAdmission.sourceUrl);
  assert.equal(forged.sourceAdmission.centralClaim,packet.sourceAdmission.centralClaim);
  assert.equal(adaptEncounterEvidence(forged).status,"incompatible",JSON.stringify(author));
  assert.equal(renderEncounterV20(forged).status,"needs_editorial_review",JSON.stringify(author));
  assert.equal(selectEmotionStrategy(forged).status,"needs_editorial_review",JSON.stringify(author));
 }
});
test("CZ-127 scenario RED: renamed weekly activities must never inherit writing or evening language",()=>{
 const weekly=withPartialScheduleCapacity(semanticCases.dillard);
 weekly.model.choices=weekly.model.choices.map((c,i)=>({
  ...c,label:["Train","Visit family","Rest"][i],
  readingLabel:["training","visiting family","resting"][i]
 }));
 weekly.model.repetitionPeriod="week";
 const input={amounts:[2,0,0],budgets:[6],repetitions:5};
 const packet=reasonSemantically(weekly,input);
 assert.equal(packet.status,"ready");
 assert.deepEqual(packet.meaning.evidence.cumulative.map(x=>x.label),["training","visiting family","resting"]);
 assert.equal(packet.meaning.evidence.period,"week");
 const output=renderEncounterV20(packet);
 assert.equal(output.status,"ready",JSON.stringify(output));
 const all=output.sections.map(x=>x.text).join(" ");
 assert.match(all,/training/i);
 assert.match(all,/week/i);
 assert.doesNotMatch(all,/writing|your story|messages|evening/i);
 assert.match(output.sections[0].text,/2 hours.*unallocated/i);
 process.stdout.write("CZ127-VARIANT "+JSON.stringify({id:"renamed-weekly",status:output.status,
  strategy:output.brief.strategy,sections:output.sections.map(y=>y.text),
  evidence:packet.meaning.evidence.cumulative,period:packet.meaning.evidence.period})+"\n");
});
test("CZ-127 scenario RED: reordered session activities cannot inherit positional writing/rest assumptions",()=>{
 const session=withPartialScheduleCapacity(semanticCases.dillard);
 session.model.choices=[session.model.choices[2],session.model.choices[0],session.model.choices[1]]
  .map((c,i)=>({...c,id:"activity-"+i,label:["Rest","Train","Visit family"][i],
    readingLabel:["resting","training","visiting family"][i]}));
 session.model.repetitionPeriod="session";
 const packet=reasonSemantically(session,{amounts:[6,0,0],budgets:[6],repetitions:5});
 assert.equal(packet.status,"ready");
 assert.equal(packet.meaning.evidence.period,"session");
 const output=renderEncounterV20(packet);
 assert.equal(output.status,"ready",JSON.stringify(output));
 const all=output.sections.map(x=>x.text).join(" ");
 assert.match(all,/resting/i);
 assert.match(all,/sessions/i);
 assert.doesNotMatch(all,/writing|your story|answering messages|evening/i);
 assert.doesNotMatch(output.sections[2].text,/your story|calendar needs a bookmark|other two hours/i);
 process.stdout.write("CZ127-VARIANT "+JSON.stringify({id:"reordered-session",status:output.status,
  strategy:output.brief.strategy,sections:output.sections.map(y=>y.text),
  evidence:packet.meaning.evidence.cumulative,period:packet.meaning.evidence.period})+"\n");
});

test("CZ-127 scenario RED: a renamed selected choice with stale canonical reading label must abstain",()=>{
 const partial=withPartialScheduleCapacity(semanticCases.dillard);
 partial.model.choices=partial.model.choices.map((c,i)=>i===0?{...c,label:"Train"}:c);
 const packet=reasonSemantically(partial,{amounts:[2,0,0],budgets:[6],repetitions:5});
 assert.equal(packet.status,"ready");
 assert.equal(packet.selectedChoices[0].label,"Train");
 assert.equal(packet.meaning.evidence.cumulative[0].label,"writing your story");
 assert.equal(adaptEncounterEvidence(packet).status,"incompatible");
 assert.equal(renderEncounterV20(packet).status,"needs_editorial_review");
});
