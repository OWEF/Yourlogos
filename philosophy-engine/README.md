# CZ-105 — Philosophical Reasoning Engine v1 (Trade-Off pilot)

**Review branch only.** The founder approved building and testing the **philosophical model and reasoning engine** in the sequence Trade-Off → Decision Map → Counterexample. This first PR only builds Trade-Off. It does **not** modify the live Encounter renderer, existing tension engine, database, production deployment, monetization, AI prompts, or app UI.

## Founder acceptance contract

Every analysis must answer **four questions**, in structured, inspectable data:

1. `what_happened` — facts directly observed from structured input, numeric magnitude/percentages, spread/balance, omissions, combinations, declared-priority mismatch and scenario context.
2. `what_follows` — **necessary** consequences (the fixed-budget opportunity cost), **possible** philosophical interpretations, tensions and a connection to a source-aware reconstructed claim. Distinguish certainty levels explicitly.
3. `what_remains_uncertain` — questions about missing context, purpose and the rest of the day. Unknown is a meaningful outcome, not zero.
4. `why_this` — model and editorial status, **rule_trace** identifying exact condition, linked finding IDs, conceptual relations, inferential status and interpretive boundaries.

The same envelope will be reusable by Decision Map and Counterexample, but **each has different reasoning rules**. No generic numeric index is allowed to decide what the philosopher “means.”

## Model foundation

- `models/seneca-time-v1.js`: draft quote #49 and reconstructed Senecan concern about finite time, attention and meaningful use. Existing repository’s `tension-catalogue-d.js` provides a preliminary editorial reading: “Time can feel sufficient when directed meaningfully,” with attention and regret as its warrant. The bundled app labels the English translation **“translation varies.”**
- The educational **eight-hour block** is our hypothetical teaching device, **not** Seneca’s prescribed schedule. Rest, obligations and reflection are exclusive allocations only within this artificial block.
- A versioned model contains a **claim, premises, concept nodes, typed conceptual relations, strain conditions, editorial status and explicit interpretive boundaries**.
- `editorial.productionEligible = false`, `sourceContextVerified = false` and `reviewStatus = proposed`. **A quote source/translation and philosophical review must happen before any production activation.**
- The validator rejects unreviewed models falsely marked production eligible and any relationship whose endpoint is not a declared concept.

## Trade-Off rule model

Structured input: `{ allocation: {rest, obligations, reflection}, context?: {cadence: "unknown"|"one_off"|"recurring", statedPriority?: "rest"|"obligations"|"reflection"|null} }`

All amounts must be finite nonnegative numbers totaling **eight hours**. No missing or additional allocation categories, unknown context fields, NaN or stringified numbers are accepted. Missing cadence means **unknown**, not “one-off”.

Interpretive rules:
- Detect **exclusive (100%)**, **strong-dominance (≥75%)**, **majority (>50%)**, **half (50%)**, **distributed (<50%)**, shared leadership, zero allocations, near-even spread, and second-priority differences.
- Compute a normalized concentration/balance index for **description only**. It is **not** a measure of virtue or wise living.
- A stated goal receiving less time than an alternative is an **apparent intention/allocation mismatch**. It does **not** prove deception, hypocrisy, delusion or formal logical contradiction.
- Context `one_off` versus `recurring` produces different **possible** conclusions without altering necessary budget facts.
- Each required/possible finding carries a relation ID and is covered by a testable rule trace.

## Example scenarios

| Run | Why this matters |
| --- | --- |
| `node scripts/try-philosophical-reasoner.mjs all-rest` | Exclusive rest, but no assertion about health or actual lifestyle |
| `node scripts/try-philosophical-reasoner.mjs all-obligations` | Exclusive obligations, different possible implications |
| `node scripts/try-philosophical-reasoner.mjs all-reflection recurring` | Reflection exclusivity plus possible repeated pattern |
| `node scripts/try-philosophical-reasoner.mjs 6,1,1` | 75% dominance |
| `node scripts/try-philosophical-reasoner.mjs 5,2,1` | 62.5% majority |
| `node scripts/try-philosophical-reasoner.mjs 5,1,2` | Same primary share; **different second priority** |
| `node scripts/try-philosophical-reasoner.mjs 4,2,2` | 50% half |
| `node scripts/try-philosophical-reasoner.mjs near-even` | 3/3/2 near balance |
| `node scripts/try-philosophical-reasoner.mjs zero-rest` | Rest omitted **in the block**, not assumed absent from the entire day |
| `node scripts/try-philosophical-reasoner.mjs 0,8,0 unknown rest` | Stated rest priority clashes with actual **scenario** allocation |

### Tests

```bash
node --check philosophy-engine/models/seneca-time-v1.js
node --check philosophy-engine/tradeoff-reasoner.js
node --check scripts/try-philosophical-reasoner.mjs
node --test tests/philosophical-reasoning.test.mjs
```

A dedicated GitHub Actions workflow runs syntax and deterministic reasoning tests on relevant PRs. All tests must pass before founder review.

## Future-only handoffs (placeholders, *not implementation*)

- `expression_handoff` lists finding IDs and possible styles (reflective, surprising, playful, challenging). It never writes jokes or user-facing commentary in this PR.
- `tension_gate_handoff` records a candidate question but sets `triggered:false`. The first-round `what_follows` is already meaningful and complete; there is no second-round UI or runtime.
- Additional specialized adapters for **Decision Map (CZ-106)** and **Counterexample (CZ-107)** will be built sequentially and independently reviewed.

## Known limitations and next review

1. The model is a **curated draft**, not a formally source-verified interpretation or all-purpose understanding of arbitrary natural language.
2. The mathematical resource constraint is exact; philosophical meanings remain tentative and require source context. There is no general contradiction solver or semantic model for arbitrary free-text.
3. Balance/dominance thresholds are **descriptive heuristics**. Their selection is an engineering convenience, not a philosophical or clinical threshold; founder may revise.
4. The eight-hour allocation is bounded and can be unrealistic outside its explicitly invented scenario. The engine declines to conclude how anyone lives outside it.
5. Founder can inspect counterfactual scenarios through the CLI. Before release: editorial audit, independent engineering review, then later mobile interaction QA.
6. Rollback: close/revert this draft PR; it has no production or database side effects.
