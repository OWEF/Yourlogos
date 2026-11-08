# CZ-103 · Encounter Lab v0.4 — conditional outcomes and context-aware humor

**Status:** Standalone six-mode founder lab, draft PR only. No production integration, no applied Supabase migration, no AI calls and no new paid infrastructure.

## Founder feedback and product principle
Two endings must not be treated as the same merely because the same option is largest. A choice's **magnitude, omitted alternatives, second priorities, constraints, provenance, and changed assumptions** affect the philosophical consequence. Do not infer a stable personal identity or score from any one interaction.

Humor is allowed **sparingly when the action earns it** (e.g. no allocated rest → "Buddy, your schedule forgot its human occupant"). No repetitive canned praise, shame, psychological diagnosis, impersonation of historical philosophers or humor over tragic circumstances. The educational meaning remains the point.

## Six deterministic examples; fixed selectable tabs
1. **Trade-Off — Seneca #49** (\`#tradeoff\`): eight-hour zero-sum linked sliders. Exact 8h, 7/6h dominance, 5h majority, 4h shared priority, near balance and a zero category produce distinct endings. Secondary priority modifies details. No claim that the allocation represents medical sleep needs or that Seneca mandated an optimal ratio.
2. **Decision Map — Woolf #28** (\`#map\`): choose income/privacy/time → specific action → **strength of support 0–100%**. A proposed intervention may be fragile, partial or sustainable. Historical source constraints still matter.
3. **Concept Builder — Kant #71** (\`#builder\`): drag one relevant consequence; additionally set rule reach to *one / many / everyone*. Only the universal case invokes Kant's strict universalization question. Keep mobile touch drag and keyboard fallback.
4. **Perspective — J. S. Mill #21** (\`#switch\`): select viewpoint + objection + whether to ask for reasons or end the exchange. Outcome distinguishes the quality of objection and the response to it.
5. **Counterexample — Pascal #10** (\`#counter\`): rephrase scope as **ALL / MOST / SOME**, then test one of three cases. A single exception refutes ALL, but does not establish a majority; an unrelated case does not refute SOME. Strong visual claim display, very little explanatory reading.
6. **Evidence Lens — David Hume #56** (\`#evidence\`): choose repost/photo/lab report, then indicate whether the source is verified and whether it is relevant to today. Qualitative strength bar varies, never presented as a statistical probability. The water example is hypothetical and not a real-world safety assertion.

## End-to-end interaction standard
Quote and short prompt → user's meaningful action → visible intermediate consequence → deliberate **Reveal my ending** → visual trace of inputs + distinct qualitative finding + concise philosophical reason + personalized closing question. Optional witty aside if pertinent. Allow **Try another path** and **Next experience**.

## Testing and release gates
- Fixed quote IDs and stable tabs; no random feed. Every path can be repeated and compared.
- Test extreme, moderate, nearly balanced, absent-option, and conflicting-input outcomes; ensure the second condition actually affects the final result.
- **Seven deterministic Node tests** in \`tests/encounter-lab-outcomes.test.mjs\` inspect the actual standalone lab source and cover all six outcome functions; do not duplicate the source formulas in test fixtures.
- Browser interactions at 320px and 390px confirmed distinct end-to-end outcomes across all six examples and no horizontal overflow/JavaScript errors. 768px full regression not complete in this run due test-runner timeout; repeat if needed. A real iPhone Safari test remains outstanding.
- Avoid publishing any of the source interpretations without philosophical/editorial review. Review the Sisyphus animation remains retired and the \`evidence_lens\` route is an unapproved database proposal.
- **Do not merge/deploy/migrate** without separate product acceptance and founder approval. This prototype is not production Discover.

## Rollback
Revert only \`experiments/encounter-lab.html\`, this test plan and the outcome tests. No user data, live application, or Supabase tables are changed.
