import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_PILOT_V01} from "../philosophy-engine/context-atlas/pilot-records-v01.js";
import {
  validateContextRecord,
  evaluatePhilosophicalGrammar,
  auditLegacyReasoningResult,
  summarizeAtlasPilot
} from "../philosophy-engine/context-atlas/grammar-v01.js";
import {analyzeTradeoff} from "../philosophy-engine/tradeoff-reasoner.js";

const ids=[0,8,10,11,16,20,21,22,23,28,31,33,34,42,49];
const byId=id=>ATLAS_PILOT_V01.find(x=>x.id===id);
const quoteSource=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const start=quoteSource.indexOf("const QUOTES=[");
const end=quoteSource.indexOf("];",start);
const catalogue=quoteSource.slice(start+14,end).split("\n")
  .map(line=>line.trim().replace(/,$/,"")).filter(line=>line.startsWith('["'))
  .map(line=>JSON.parse(line));

test("pilot covers fifteen deliberately diverse, unique and source-identical bundled quotations",()=>{
  assert.deepEqual(ATLAS_PILOT_V01.map(x=>x.id),ids);
  assert.equal(new Set(ids).size,15);
  for(const r of ATLAS_PILOT_V01){
    assert.equal(r.quote.text,catalogue[r.id][0],"Quote mismatch at "+r.id);
    assert.equal(r.quote.author,catalogue[r.id][1],"Author mismatch at "+r.id);
    assert.equal(r.quote.bundledSource,catalogue[r.id][3],"Source mismatch at "+r.id);
  }
});
test("all records have valid source, author position, four-layer grammar and competing readings",()=>{
  for(const r of ATLAS_PILOT_V01){
    assert.deepEqual(validateContextRecord(r),[],"Validation errors "+r.id);
    const g=evaluatePhilosophicalGrammar(r);
    assert.equal(g.trace.length,6);
    assert.ok(g.logicalForm.note.length);
    assert.ok(g.conceptualStructure.alternatives.length>=2);
    assert.ok(g.philosophicalOperation.task.length);
    assert.ok(g.interactiveRealization.eligibility.length);
    assert.equal(g.epistemicStatus,"editorial_hypothesis");
    assert.equal(g.interactiveRealization.allowedForProduction,false);
    assert.equal(r.review.scholarlyReviewed,false);
    assert.equal(r.review.publisherApproved,false);
  }
});
test("candidate selection is provisional with explicit 'no fit' available",()=>{
  const stats=summarizeAtlasPilot();
  assert.equal(stats.count,15);
  assert.deepEqual(stats.candidates,{tradeoff:1,decision_map:3,counterexample:1,none:10});
  assert.equal(stats.readyForProduction,0);
  assert.equal(stats.sourceLinked,5);
  assert.ok(stats.notSuitable.includes(31),"Hegel must not be flattened into a slider");
  assert.ok(stats.notSuitable.includes(33),"Hamlet must remain dramatic character's speech");
  assert.ok(stats.notSuitable.includes(10),"Pascal paraphrase must not be tested as literal universal");
});
test("trade-off candidate demands an explicit source-related constraint and blocks made-up eight-hour scenario",()=>{
  const x=byId(49),g=evaluatePhilosophicalGrammar(x);
  assert.equal(g.interactiveRealization.candidate,"tradeoff");
  assert.equal(g.interactiveRealization.proof.kind,"source_grounded_constraint");
  assert.equal(g.interactiveRealization.eligibility,"candidate_editorial_review_required");
  assert.ok(g.interactiveRealization.scenarioExclusions.includes("eight-hour-thought-exercise"));
  assert.match(g.interactiveRealization.risks,/8[- ]hours/);
});
test("decision-map cases preserve distinct enabling, institutional, and temporal dependencies",()=>{
  for (const id of [23,28,34]){
    const g=evaluatePhilosophicalGrammar(byId(id));
    assert.equal(g.interactiveRealization.candidate,"decision_map");
    assert.equal(g.interactiveRealization.proof.kind,"branch_dependency");
  }
  assert.notEqual(byId(28).argumentModel.relation,byId(34).argumentModel.relation);
  assert.match(byId(28).argumentModel.limits,/historical|gendered|institutional/);
  assert.equal(evaluatePhilosophicalGrammar(byId(34)).interactiveRealization.eligibility,
               "candidate_source_review_required");
});
test("Counterexample candidate preserves Aristotle's natural-disposition qualifier",()=>{
  const g=evaluatePhilosophicalGrammar(byId(42));
  assert.equal(g.interactiveRealization.candidate,"counterexample");
  assert.equal(g.interactiveRealization.proof.kind,"generalization_scope");
  assert.match(g.conceptualStructure.boundaries,/single uninterested moment/);
  assert.ok(g.conceptualStructure.alternatives.length>=2);
});
test("popular Pascal paraphrase cannot masquerade as a source-exact universal claim",()=>{
  const p=byId(10);
  assert.equal(p.sourcePassage.translation.exactness,"paraphrase");
  assert.equal(p.interactionModel.candidate,"none");
  assert.match(p.argumentModel.limits,/paraphrase/);
  assert.match(p.sourcePassage.contextualSummary,/diversion|Diversion/i);
});
test("the Atlas preserves author vs character distinction and warns against simple consistency assumptions",()=>{
  const hamlet=byId(33);
  assert.equal(hamlet.authorPosition.stance,"character_speech");
  assert.match(hamlet.argumentModel.limits,/character/);
  const earlyWittgenstein=byId(8);
  assert.match(earlyWittgenstein.authorPosition.comparisonWithOtherWorks,/later philosophical/);
  assert.notEqual(earlyWittgenstein.authorPosition.stance,"character_speech");
});
test("model cannot be silently marked reviewed or eligible on unverified source data",()=>{
  const changed=structuredClone(byId(49));
  changed.review.publisherApproved=true;
  assert.ok(validateContextRecord(changed).length);
  changed.review.publisherApproved=false;
  changed.interactionModel.mechanismProof.kind="some_game";
  assert.ok(validateContextRecord(changed).length);
  const unsupported=structuredClone(byId(31));
  unsupported.interactionModel.candidate="tradeoff";
  assert.ok(validateContextRecord(unsupported).length);
});
test("actual PR #147 reasoner is tested against Atlas and its scenario is rejected as source-unfaithful",()=>{
  const result=analyzeTradeoff({allocation:{rest:8,obligations:0,reflection:0},context:{cadence:"one_off"}});
  const audit=auditLegacyReasoningResult(byId(49),result,"eight-hour-thought-exercise");
  assert.equal(result.model.quoteId,49);
  assert.equal(audit.outcome,"blocked_for_public_expression");
  assert.equal(audit.readyForExpression,false);
  assert.equal(audit.philosophicalTruthClaim,false);
  assert.ok(audit.blockers.some(x=>x.includes("teaching invention")));
  assert.ok(audit.blockers.some(x=>x.includes("not source-approved")));
  assert.ok(audit.necessaryFindings.length>0);
  assert.ok(audit.uncertainty.length>0);
  assert.ok(audit.trace.engine.length>0);
  assert.ok(audit.trace.atlas.length>0);
});
test("quote mismatch and unsupported mechanism fail closed at the existing-engine bridge",()=>{
  const r=analyzeTradeoff({allocation:{rest:3,obligations:3,reflection:2}});
  assert.throws(()=>auditLegacyReasoningResult(byId(28),r,"eight-hour-thought-exercise"),/identity mismatch/);
  const changed=structuredClone(r);
  changed.mechanism="decision_map";
  assert.throws(()=>auditLegacyReasoningResult(byId(49),changed,"anything"),/Unsupported mechanism/);
});
test("context sources are scoped, not universal authorial-truth certificates",()=>{
  for(const r of ATLAS_PILOT_V01){
    for(const ref of r.sourcePassage.references){
      assert.ok(ref.supports.length>0);
      assert.ok(ref.kind.length>0);
    }
    assert.equal(r.sourcePassage.originalText,null);
    assert.ok(r.authorPosition.periodOrWork.length>0);
  }
});
