import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reallocate, toAllocation, TOTAL_TICKS, INITIAL_TICKS, PRESETS, validateTicks} from "../experiments/cz105-lab-controls.js";
import {analyzeTradeoff} from "../philosophy-engine/tradeoff-reasoner.js";
import {buildStandalone} from "../scripts/build-cz105-lab-standalone.mjs";

const html = readFileSync(new URL("../experiments/cz105-reasoning-lab.html", import.meta.url), "utf8");
const standalone = readFileSync(new URL("../experiments/cz105-reasoning-lab-standalone.html", import.meta.url), "utf8");

test("all slider mutations preserve the fixed eight-hour budget", () => {
  for (let rest = 0; rest <= TOTAL_TICKS; rest++) {
    for (let obligations = 0; obligations <= TOTAL_TICKS - rest; obligations++) {
      const original = [rest, obligations, TOTAL_TICKS - rest - obligations];
      for (let selected = 0; selected < 3; selected++) {
        for (let desired = 0; desired <= TOTAL_TICKS; desired++) {
          const next = reallocate(original, selected, desired);
          assert.ok(validateTicks(next));
          assert.equal(next[selected], desired);
          assert.equal(Object.values(toAllocation(next)).reduce((a,b)=>a+b,0), 8);
        }
      }
    }
  }
});
test("no-op slider change preserves original allocation", () => {
  assert.deepEqual(reallocate([...INITIAL_TICKS], 1, INITIAL_TICKS[1]), [...INITIAL_TICKS]);
});
test("all preset examples are engine-valid and cover meaningful different outcomes", () => {
  const findings = Object.values(PRESETS).map(ticks => {
    const result = analyzeTradeoff({allocation:toAllocation(ticks)});
    assert.equal(result.what_follows.necessary.length > 0, true);
    return result.what_happened.signals.combinations.dominance;
  });
  assert.ok(new Set(findings).size >= 4);
});
test("real engine is imported directly in the module-based lab", () => {
  assert.match(html, /import \{ analyzeTradeoff \} from "\.\.\/philosophy-engine\/tradeoff-reasoner\.js"/);
  assert.match(html, /const result = analyzeTradeoff\(input\)/);
  assert.ok(["out-happened","out-follows","out-uncertain","out-why"].every(x => html.includes('id="' + x + '"')));
});
test("zero free-text input, no network fetch, and no production dependencies", () => {
  assert.doesNotMatch(html, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|api\/discover|supabase/);
  assert.doesNotMatch(html, /<form[^>]*action=/i);
  assert.match(html, /Save result A/);
  assert.match(html, /Save result B/);
});
test("standalone source parity is exact and does not depend on remote imports", () => {
  assert.equal(standalone, buildStandalone());
  assert.doesNotMatch(standalone, /<script[^>]*src=|import\s*\{\s*analyzeTradeoff\s*\}/);
  assert.match(standalone, /function analyzeTradeoff\(input, model = SENECA_TIME_TRADEOFF_V1\)/);
  assert.match(standalone, /function validatePhilosophicalModel\(model\)/);
  assert.match(standalone, /function reallocate\(ticks, selectedIndex, desiredTicks\)/);
});
test("offline result is the actual model's structured four-section contract", () => {
  const value = analyzeTradeoff({allocation:toAllocation([0,0,16]),context:{cadence:"recurring",statedPriority:"obligations"}});
  assert.ok(value.what_happened.summary.length);
  assert.ok(value.what_follows.possible.length);
  assert.ok(value.what_remains_uncertain.length);
  assert.ok(value.why_this.rule_trace.length);
  assert.ok(value.what_follows.tensions.some(x => x.id === "goal-action-mismatch"));
  assert.equal(value.expression_handoff.status,"placeholder_only");
  assert.equal(value.tension_gate_handoff.triggered,false);
});
