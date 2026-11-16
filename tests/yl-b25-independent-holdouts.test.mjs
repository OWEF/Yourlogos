/**
 * CZ-123 independent QA R0-R2 — only QA tests on EXACT B2.5 SHA
 * 576743a354a961a35b35bf58f8b61f655c43d190.
 *
 * Holdouts deliberately differ from developer examples: weekend endpoints and
 * asymmetry, creative pattern extremes, source corruption, false compatibility,
 * and frozen old-game equivalence. This is not external scholarly signoff.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {B25_BALANCE_CONTRACTS,inspectB25Contract}
 from "../experiments/yl-b25-authored-scenarios.mjs";
import {selectMiniGameB25,runSelectedEncounterB25}
 from "../experiments/yl-b25-encounter.mjs";
import {renderEncounterB25,verifyEncounterB25}
 from "../experiments/yl-b25-generic-bridge.mjs";
import {reasonSemantically}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {semanticSources}
 from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {B23_SOURCE_CONTRACTS}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {runSelectedEncounterB24}
 from "../experiments/yl-b24-encounter.mjs";
import {KIERKEGAARD_V21,DILLARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const stable=x=>Array.isArray(x)?"["+x.map(stable).join(",")+"]":
 x!==null&&typeof x==="object"?"{"+Object.keys(x).sort().map(k=>JSON.stringify(k)+":"+stable(x[k])).join(",")+"}":
 JSON.stringify(x);
const hash=x=>"sha256:"+createHash("sha256").update(stable(x)).digest("hex");
const wc=s=>s.trim().split(/\s+/).filter(Boolean).length;
const check=r=>{
 assert.equal(r.status,"ready",JSON.stringify(r).slice(0,350));
 assert.equal(r.expression.sections.length,3);
 assert.deepEqual(r.expression.sections.map(s=>s.label),
   ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 const counts=r.expression.sections.map(s=>wc(s.text)),total=counts.reduce((a,b)=>a+b,0);
 assert.equal(total,r.expression.wordCount);
 assert.ok(total>=80&&total<=120,JSON.stringify({counts,total}));
 assert.ok(counts.every((x,i)=>x>=[10,18,9][i]&&x<=[48,65,26][i]));
 assert.equal(r.publicationAllowed,false);
 assert.equal(r.productionPlayable,false);
};
test("R0 bridge is abstract and exact-source bound; independent fingerprints and quotes audited",()=>{
 const source=readFileSync(new URL("../experiments/yl-b25-generic-bridge.mjs",import.meta.url),"utf8");
 for(const forbidden of ["Henry David Thoreau","Annie Dillard",
  "life_exchanged","time_kept","$20","eight hours","ten half-hours"])
  assert.ok(!source.includes(forbidden),"Bridge hardcoded forbidden author/scenario phrase: "+forbidden);
 assert.equal(B25_BALANCE_CONTRACTS.length,3);
 for(const c of B25_BALANCE_CONTRACTS){
  const data=Object.fromEntries(Object.entries(c).filter(([k])=>k!=="contentFingerprint"));
  assert.equal(c.contentFingerprint,hash(data));
  assert.equal(inspectB25Contract(c),c);
  assert.equal(c.publicationAllowed,false);
  assert.equal(c.independentlyScholarlyApproved,false);
  assert.equal(c.source.reviewState,"founder_provisional");
  assert.equal(c.source.quote,c.source.author==="Annie Dillard"?
   semanticSources.dillard.quote:semanticSources.thoreau.quote);
  assert.equal(c.context.semantic.admission.centralClaim,c.context.semantic.admission.centralClaim);
 }
 assert.equal(new Set(B25_BALANCE_CONTRACTS.map(c=>c.contentFingerprint)).size,3);
 assert.deepEqual(B25_BALANCE_CONTRACTS.map(c=>c.scenario.capacity),[8,12,10]);
 assert.deepEqual(B25_BALANCE_CONTRACTS.map(c=>c.meaningKind),
  ["conversion","conversion","repetition"]);
});
test("R1 positive held-out authored Thoreau 12h and Dillard 10-slot cases, no cast-specific code",()=>{
 const scenarios=[
  {id:"b25:walden-twelve-hour-exchange",allocations:[0,1,11,12],expected:"conversion",
   capacity:12,lenses:["exchange","openness"]},
  {id:"b25:dillard-four-fictional-evenings",allocations:[0,2,7,10],
   expected:"repetition",capacity:10,
   lenses:["single_evening","repeated_pattern"]}
 ];
 for(const s of scenarios){
  const c=B25_BALANCE_CONTRACTS.find(x=>x.recordId===s.id);
  const sel=selectMiniGameB25(c);
  assert.equal(sel.selected_game_id,"balance_of_values");
  assert.deepEqual(sel.selection_trace.evaluatedPeerIds,[
   "trade_off","decision_map","token_studio","balance_of_values","swipe_decision","future_reveal"]);
  for(const n of s.allocations){
   const observed=[];
   for(const lens of s.lenses){
    const r=runSelectedEncounterB25(c,sel,{leftSlots:n,touched:true,focus:lens});
    check(r);
    assert.deepEqual(r.canonical_choice.amounts,[n,s.capacity-n]);
    assert.equal(r.meaning.meaning.kind,s.expected);
    assert.equal(r.expression.sourceWarrant,c.context.semantic.admission.centralClaim);
    assert.equal(r.expression.quote,c.source.quote);
    assert.equal(r.expression.author,c.source.author);
    assert.equal(r.expression.evidenceTrace.fingerprint,c.contentFingerprint);
    assert.equal(r.expression.version,"evidence-bound-expression/2.5.0");
    assert.equal(r.emotion.version,"evidence-bound-emotion/2.5.0");
    assert.equal(r.emotion.inferredReaderEmotion,false);
    assert.equal(r.provenance.actualPurchaseInferred,false);
    assert.equal(r.provenance.moralValueScoreInferred,false);
    assert.doesNotMatch(JSON.stringify(r),/semantic-expression\/1\.2|frozen_v12_semantic_not_v20/);
    observed.push(r);
   }
   assert.deepEqual(observed[0].meaning,observed[1].meaning);
   assert.notEqual(observed[0].expression.sections[1].text,
    observed[1].expression.sections[1].text);
   if(s.expected==="repetition"){
    assert.equal(observed[0].meaning.meaning.evidence.repetitions,4);
    assert.deepEqual(observed[0].meaning.meaning.evidence.cumulative.map(x=>x.units),
     [n*4,(s.capacity-n)*4]);
    assert.equal(observed[0].meaning.meaning.evidence.unitHours,0.5);
   }else{
    assert.equal(observed[0].meaning.meaning.evidence.measure,n);
    assert.ok(c.context.scenario.includes("$15"));
   }
  }
 }
});
test("R2 altered source/editorial hash or fabricated new source cannot gain source-eligible READY",()=>{
 for(const c of B25_BALANCE_CONTRACTS){
  const s=selectMiniGameB25(c);
  const chosen={leftSlots:Math.floor(c.scenario.capacity/2),touched:true,
   focus:c.editorial.lenses[0].id};
  for(const altered of [
   {...c,source:{...c.source,quote:"A made-up philosopher phrase"}},
   {...c,editorial:{...c.editorial,qualification:"This choice proves moral excellence."}},
   {...c,context:{...c.context,model:{...c.context.model,
    resources:[{id:"money",type:"cap",min:0,max:999}]}}},
   {...c,independentlyScholarlyApproved:true},
   {...c,contentFingerprint:"sha256:"+"1".repeat(64)}
  ]){
   assert.equal(selectMiniGameB25(altered).status,"blocked");
   assert.equal(runSelectedEncounterB25(altered,s,chosen).status,"blocked");
  }
  for(const bad of [
   {...chosen,leftSlots:-1},{...chosen,leftSlots:c.scenario.capacity+1},
   {...chosen,leftSlots:0.5},{...chosen,focus:"moral_score"},
   {...chosen,touched:false},{...chosen,approval:"scholar passed"}
  ])assert.equal(runSelectedEncounterB25(c,s,bad).status,"blocked");
  const canonical={amounts:[chosen.leftSlots,c.scenario.capacity-chosen.leftSlots],
   budgets:[c.scenario.capacity],
   ...(c.scenario.repetitions===null?{}:{repetitions:c.scenario.repetitions})};
  const meaning=reasonSemantically(c.context,canonical);
  const expr=renderEncounterB25(meaning,c,canonical,{focus:chosen.focus});
  check({status:"ready",expression:expr,publicationAllowed:false,productionPlayable:false});
  assert.equal(verifyEncounterB25(meaning,c,canonical,chosen.focus,
   {...expr,sections:expr.sections.map((x,i)=>i===1?{...x,text:x.text+" Always right."}:x)})
    .status,"needs_editorial_review");
 }
 const unreviewed={recordId:"unseen:some-obviously-different-case",
  source:{author:"Unknown",work:"Invented research",quote:"Fabricated unknown quotation"},
  scenario:{capacity:3},gameId:"balance_of_values"};
 assert.equal(selectMiniGameB25(unreviewed).status,"blocked");
 assert.equal(selectMiniGameB25(HEGEL_NO_FIT_V21).status,"no_fit");
});
test("R0 all four old games unchanged and all 8 Kierkegaard paths preserve agency boundary",()=>{
 for(const [record,game,choice] of [
  [DILLARD_V21,"trade_off",{amounts:[2,3,1],repetitions:5}],
  [DILLARD_V21,"token_studio",{amounts:[2,3,1],repetitions:5}],
  [KIERKEGAARD_V21,"decision_map",{path:["stay","missed","reflect"]}],
  [KIERKEGAARD_V21,"swipe_decision",{path:["stay","missed","reflect"]}]
 ]){
  const s=selectMiniGameB25(record,{preferredGameId:game});
  const current=runSelectedEncounterB25(record,s,choice);
  const baseline=runSelectedEncounterB24(record,s,choice);
  check(current);
  assert.deepEqual(current.meaning,baseline.meaning);
  assert.deepEqual(current.expression,baseline.expression);
 }
 const f=B23_SOURCE_CONTRACTS[1],sel=selectMiniGameB25(f);
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [first,scene,last]=route.path;
  const input={actions:[{type:"choose_start",optionId:first},
   {type:"explore_authored",sceneId:scene},
   {type:"choose_response",optionId:last},
   {type:"read_retrospective"}]};
  const current=runSelectedEncounterB25(f,sel,input);
  const old=runSelectedEncounterB24(f,sel,input);
  check(current);
  assert.deepEqual(current.meaning,old.meaning);
  assert.deepEqual(current.expression,old.expression);
  assert.equal(current.provenance.authoredEventCausedByReader,false);
  assert.equal(current.provenance.unchosenFutureKnown,false);
 }
});
