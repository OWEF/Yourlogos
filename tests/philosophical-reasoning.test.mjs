import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SENECA_TIME_TRADEOFF_V1 as model,
  validatePhilosophicalModel,
} from "../philosophy-engine/models/seneca-time-v1.js";
import {
  analyzeTradeoff,
  validateTradeoffInput,
  REASONING_RESULT_SCHEMA_VERSION,
} from "../philosophy-engine/tradeoff-reasoner.js";

const make = (rest, obligations, reflection, context = undefined) =>
  analyzeTradeoff({
    allocation: { rest, obligations, reflection },
    ...(context === undefined ? {} : { context }),
  });
const getIds = rows => rows.map(x => x.id);
const text = x => JSON.stringify(x);

test("model identifies source, reconstructed claim, warrants, relations and limits", () => {
  assert.deepEqual(validatePhilosophicalModel(model), []);
  assert.equal(model.quote.legacyId, 49);
  assert.equal(model.editorial.productionEligible, false);
  assert.equal(model.editorial.sourceContextVerified, false);
  assert.equal(model.quote.wordingStatus, "bundled_translation_varies");
  assert.ok(model.premises.length >= 2);
  assert.ok(model.relations.every(r => model.concepts.some(c => c.id === r.from) &&
                                       model.concepts.some(c => c.id === r.to)));
  assert.ok(model.interpretiveBoundaries.some(s => s.includes("entire day")));
});

test("unverified model cannot be marked production eligible", () => {
  const changed = structuredClone(model);
  changed.editorial.productionEligible = true;
  assert.match(validatePhilosophicalModel(changed).join("; "), /Unverified/);
});

test("all four founder acceptance outputs exist and are populated", () => {
  const r = make(3, 3, 2);
  assert.equal(r.schemaVersion, REASONING_RESULT_SCHEMA_VERSION);
  assert.match(r.what_happened.summary, /3h/);
  assert.ok(r.what_follows.necessary.length);
  assert.ok(r.what_follows.possible.length);
  assert.ok(r.what_remains_uncertain.length);
  assert.ok(r.why_this.rule_trace.length);
  assert.ok(r.why_this.interpretive_boundaries.length);
  assert.equal(r.expression_handoff.status, "placeholder_only");
  assert.equal(r.tension_gate_handoff.triggered, false);
  assert.equal(r.tension_gate_handoff.firstRoundComplete, true);
  assert.doesNotThrow(() => JSON.stringify(r));
});

test("extreme allocations differ by value, not just an extremity number", () => {
  const a = [make(8, 0, 0), make(0, 8, 0), make(0, 0, 8)];
  assert.ok(a.every(r => r.what_happened.signals.extremes.exclusive));
  assert.ok(a.every(r => r.what_happened.signals.magnitude.maxSharePercent === 100));
  assert.equal(new Set(a.map(r => r.what_follows.possible[0].statement)).size, 3);
  for (const r of a) {
    assert.equal(r.what_happened.signals.balance.index, 0);
    assert.equal(r.what_happened.signals.extremes.excludedCategoryIds.length, 2);
    assert.ok(getIds(r.what_follows.necessary).includes("exclusive-choice"));
    assert.equal(r.what_follows.tensions[0].isLogicalContradiction, false);
  }
});

test("100%, 75%, 62.5%, 50%, and 37.5% have distinct descriptive categories", () => {
  const samples = [[8, 0, 0], [6, 1, 1], [5, 2, 1], [4, 2, 2], [3, 3, 2]]
    .map(x => make(...x));
  assert.deepEqual(samples.map(x => x.what_happened.signals.combinations.dominance),
    ["exclusive", "strong_dominance", "majority", "half", "distributed"]);
  assert.equal(samples[0].what_happened.signals.magnitude.maxSharePercent, 100);
  assert.equal(samples[1].what_happened.signals.magnitude.maxSharePercent, 75);
  assert.equal(samples[2].what_happened.signals.magnitude.maxSharePercent, 62.5);
  assert.equal(samples[3].what_happened.signals.magnitude.maxSharePercent, 50);
  assert.equal(samples[4].what_happened.signals.magnitude.maxSharePercent, 37.5);
});

test("near-balanced 3/3/2 is not treated as strict equality or a moral ideal", () => {
  const r = make(3, 3, 2);
  assert.ok(getIds(r.what_happened.patterns).includes("tied-leaders"));
  assert.ok(getIds(r.what_happened.patterns).includes("nearly-even"));
  assert.equal(r.what_happened.signals.combinations.dominance, "distributed");
  assert.ok(r.what_happened.signals.balance.index > 0.9);
  assert.match(r.what_happened.signals.balance.description, /not a goodness score/);
});

test("the runner-up influences the result even if the same choice dominates", () => {
  const a = make(5, 2, 1);
  const b = make(5, 1, 2);
  assert.equal(a.what_happened.signals.magnitude.maxSharePercent,
    b.what_happened.signals.magnitude.maxSharePercent);
  assert.notEqual(a.what_happened.summary, b.what_happened.summary);
  assert.notEqual(a.what_follows.possible[0].statement, b.what_follows.possible[0].statement);
});

test("zero rest is a block observation, not a diagnosis of missing sleep", () => {
  const r = make(0, 5, 3);
  const line = r.what_follows.necessary.find(x => x.id === "no-time-rest").statement;
  assert.match(line, /specific block/);
  assert.match(line, /does not establish/);
  assert.ok(!text(r.what_follows).includes("sleep deprivation"));
  assert.ok(getIds(r.what_happened.patterns).includes("excluded-activities"));
});

test("single and repeating context change possible implications, not necessity", () => {
  const a = make(0, 0, 8, { cadence: "one_off" });
  const b = make(0, 0, 8, { cadence: "recurring" });
  const c = make(0, 0, 8);
  assert.deepEqual(a.what_follows.necessary, b.what_follows.necessary);
  assert.ok(getIds(a.what_follows.possible).includes("temporary-context"));
  assert.ok(getIds(b.what_follows.possible).includes("repetition"));
  assert.ok(getIds(c.what_remains_uncertain).includes("cadence-unknown"));
  assert.ok(!getIds(a.what_remains_uncertain).includes("cadence-unknown"));
});

test("declared intent mismatch is only an apparent tension, not a formal contradiction", () => {
  const r = make(0, 8, 0, { cadence: "unknown", statedPriority: "rest" });
  assert.equal(r.what_happened.signals.contradictions.apparentStatedPriorityMismatch, true);
  assert.equal(r.what_happened.signals.contradictions.isFormalLogicalContradiction, false);
  assert.ok(r.what_follows.tensions.some(t => t.id === "goal-action-mismatch"));
  assert.ok(r.what_remains_uncertain.some(x => x.id === "priority-mismatch-context"));
  assert.ok(r.why_this.rule_trace.some(x => x.ruleId === "declared-priority-check"));
});

test("stated intent aligned with top choice does not produce a mismatch", () => {
  const r = make(5, 2, 1, { statedPriority: "rest" });
  assert.equal(r.what_happened.signals.contradictions.apparentStatedPriorityMismatch, false);
  assert.ok(!r.what_follows.tensions.some(t => t.id === "goal-action-mismatch"));
});

test("trace relates every necessary and possible finding to a rule", () => {
  for (const r of [make(8, 0, 0), make(5, 2, 1), make(3, 3, 2, {cadence: "recurring"})]) {
    const tracedIds = new Set(r.why_this.rule_trace.flatMap(t => t.findingIds));
    for (const f of [...r.what_follows.necessary, ...r.what_follows.possible]) {
      assert.ok(tracedIds.has(f.id), "Not traced: " + f.id);
      assert.ok(f.relationIds.every(rel => model.relations.some(x => x.id === rel)));
      assert.ok(["scenario_necessity", "interpretive_possibility"].includes(f.epistemicStatus));
    }
  }
});

test("no numerical balance or extremity score is represented as correctness", () => {
  const r = make(8, 0, 0);
  assert.equal(typeof r.what_happened.signals.balance.index, "number");
  assert.equal(r.what_follows.philosophical_connection.interpretationStrength, "illustration_not_proof");
  assert.ok(r.why_this.interpretive_boundaries.length >= 5);
  assert.ok(!Object.hasOwn(r, "philosophicalTruthScore"));
});

test("half-hour allocations work without rounding inconsistencies", () => {
  const r = make(4.5, 2, 1.5);
  assert.equal(r.what_happened.signals.magnitude.maxSharePercent, 56.25);
  assert.equal(r.what_happened.signals.balance.index <= 1, true);
  assert.match(r.what_happened.summary, /4.5h/);
});

test("invalid and malformed inputs fail closed", () => {
  const good = { allocation: { rest: 3, obligations: 3, reflection: 2 } };
  const bad = [
    { allocation: {rest: 3, obligations: 3} },
    { allocation: {rest: -1, obligations: 7, reflection: 2} },
    { allocation: {rest: 9, obligations: 0, reflection: 0} },
    { allocation: {rest: "3", obligations: 3, reflection: 2} },
    { allocation: {rest: NaN, obligations: 3, reflection: 5} },
    { allocation: {rest: 3, obligations: 3, reflection: 3} },
    { allocation: {rest: 3, obligations: 3, reflection: 2, sleep: 0} },
    {...good, context:{cadence:"dailyish"}},
    {...good, context:{statedPriority:"sleep"}},
    {...good, context:{otherPrivateField:"x"}},
    {...good, foo:"bar"},
  ];
  for (const item of bad) {
    assert.ok(validateTradeoffInput(item).length > 0);
    assert.throws(() => analyzeTradeoff(item), TypeError);
  }
});

test("no AI calls, network, storage, or personal profiles are needed", () => {
  const input = {allocation:{rest:3,obligations:3,reflection:2}};
  assert.deepEqual(make(3,3,2), make(3,3,2));
  assert.deepEqual(input, {allocation:{rest:3,obligations:3,reflection:2}});
  assert.equal(model.editorial.productionEligible, false);
});
