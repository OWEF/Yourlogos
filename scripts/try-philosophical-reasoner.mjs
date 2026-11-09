/**
 * Founder test harness for CZ-105.
 * Usage: node scripts/try-philosophical-reasoner.mjs exclusive-reflection recurring
 *        node scripts/try-philosophical-reasoner.mjs 5,2,1 one_off rest
 */
import { analyzeTradeoff } from "../philosophy-engine/tradeoff-reasoner.js";

const named = {
  "all-rest": [8, 0, 0],
  "all-obligations": [0, 8, 0],
  "all-reflection": [0, 0, 8],
  "strong-rest": [6, 1, 1],
  "majority-rest": [5, 2, 1],
  "half-rest": [4, 2, 2],
  "near-even": [3, 3, 2],
  "zero-rest": [0, 5, 3],
};
const [choice = "near-even", cadence = "unknown", statedPriority] = process.argv.slice(2);
const parts = named[choice] || choice.split(",").map(x => Number(x.trim()));
if (parts.length !== 3) {
  process.stderr.write("Usage: node scripts/try-philosophical-reasoner.mjs <preset|rest,obligations,reflection> [unknown|one_off|recurring] [rest|obligations|reflection]\n");
  process.exitCode = 2;
} else {
  try {
    const result = analyzeTradeoff({
      allocation: Object.fromEntries(["rest","obligations","reflection"].map((key, i) => [key, parts[i]])),
      context: { cadence, ...(statedPriority ? {statedPriority} : {}) },
    });
    console.log(JSON.stringify({
      what_happened: result.what_happened,
      what_follows: result.what_follows,
      what_remains_uncertain: result.what_remains_uncertain,
      why_this: result.why_this,
      placeholders: {
        expression: result.expression_handoff.status,
        secondRound: result.tension_gate_handoff.status,
      },
    }, null, 2));
  } catch (e) {
    process.stderr.write("Invalid scenario: " + e.message + "\n");
    process.exitCode = 1;
  }
}
