# Encounter Lab v0.2 — Founder feedback incorporated

## Founder findings from v0.1
- Trade-Off: **keep**. The linked allocation model was accepted.
- Decision Map: **keep**. Compact branching choices were accepted.
- Concept Builder: **too hard**. Original three-premise ordering demanded excessive abstraction.
- Perspective Switch: **not engaging enough**. Passive two-view toggle did not meaningfully involve the user.
- Counterexample: **not engaging enough**. Reading three cases and receiving an explanation was too close to a quiz.
- Thought Experiment: **animation did not work in founder test**. The old CSS movement was too subtle and had no explanatory fallback when reduced motion suppressed it.

## v0.2 changes
- **Unchanged:** Seneca's linked 8-hour Trade-Off; Woolf's decision-map path and consequence logic.
- **Concept Builder:** Kant promise example now requires *one* connection: personal rule → what happens if everyone follows it. Two tappable endings; coherent immediate feedback; no three-step proposition-ordering test.
- **Perspective Clash:** Mill example now includes selecting a side, sending an actual challenge and viewing that side's reply. Weak objection vs argument-targeting objection demonstrates what engagement with the strongest version of another position means.
- **Claim Breaker:** Pascal example now lets user select a case and actively test the literal quantifier “ALL.” An independent counterexample changes the visible claim to “NOT ALL”; other cases leave it standing. Includes explicit caveat that Pascal's aphorism need not be a literal universal thesis.
- **Sisyphus Experiment:** Replaced subtle CSS-only animation with an explicit requestAnimationFrame (stone rises, falls, figure follows, caption announces the phase). Separate three-step text-only alternative when `prefers-reduced-motion: reduce` is enabled; all stages are announced with live text.

## Validation performed (isolated lab only)
- Headless Chromium mobile viewport interaction tests at **320, 390 and 768 CSS pixels**: all six modes reachable; slider invariant 8h; map branch resets; new builder responses; perspective response resets on role switch; counterexample's claim state updates correctly; the experiment's stone inline transform changes during playback; no horizontal overflow or uncaught JavaScript errors.
- At **390px**, saved screenshots checked for concept builder and thought experiment.
- Reduced Motion simulation: **PUSH → RETURN → REPEAT** textual stages.
- `node --check` for the extracted JS passed.
- GitHub PR CI should independently check the latest push.
- **Still pending:** real iPhone Safari verification, philosophical editorial/source review, A/B user engagement measurement. No live app, paid services, Supabase schema, or production release altered.

## Test protocol
1. Open `experiments/encounter-lab.html` from the review branch or the supplied self-contained HTML.
2. Switch among the six *fixed* examples; no random daily quote.
3. Retest each revised mechanic and mark `Works` or `Needs revision` with the local review controls. Copy all six reviews.
4. For Sisyphus, press **Push the stone** and watch the stone traverse and return; optionally enable iOS Settings → Accessibility → Motion → Reduce Motion and verify the explicit three-step text alternative.
5. Use the review to decide whether Perspective and Counterexample are worth keeping. Do not assume that more movement automatically means a better philosophical interaction.

**GitHub review:** [PR #146](https://github.com/OWEF/Yourlogos/pull/146) · **Linear:** [CZ-103](https://linear.app/czd217/issue/CZ-103/discover-route-each-quote-to-a-philosophically-fitting-interaction)
