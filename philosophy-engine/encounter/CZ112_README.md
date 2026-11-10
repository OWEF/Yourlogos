# CZ-112 — Encounter v0.3: questions that expose a tension

**Status:** Draft research preview, not a production engine or approved scholarly commentary.

## Founder decision
Keep the approved **Seneca Trade-Off** sliders, three motivations, relatable optional-work/friend/reflection scenario and distribution visualization. Keep the **Woolf Decision Map**'s three staged choices, but make every user-facing option sound like something a person encounters—not an abstract analytical category. Replace the sequential three-box outcome with a **tappable, connected six-node relationship map** that forks, reconverges and branches into possibility versus uncertainty.

A philosophical Encounter should culminate in a **well-grounded proactive question**, not a generic summary or unearned claim about the user's feelings.

## New five-stage logic
\`question-selection-v02.js\` reads the existing **Context Atlas → four-layer grammar → quote-specific Insight Packet** and performs:

1. **Observation:** the exact facts of a hypothetical interaction and what was explicitly reported.
2. **Philosophical tension:** a traceable relationship between the decision and its stated rationale; for example, **scenario says optional work / user reports necessary**. Do not assign this contradiction if the user chose *zero* optional work.
3. **Personal relevance:** categories from supplied choices (self-directed, expected, considered necessary; or fiction-specific agency, stability and institutions), not diagnoses or assumed emotions.
4. **Question selection:** one source-compatible question chosen from the tension. Can **abstain from further questioning** if a user explicitly reports that the discovery feels settled.
5. **Expression:** \`expression-engine-v02.js\` communicates that exact selected question with a compact explanation, the preserved time distribution or branched mindmap, and a short philosophical connection. It cannot secretly create another philosophical claim.

## Optional feedback is not onboarding
An optional row **inside the finished Encounter**, *not a new form* or required step, reads:
- **This feels right:** explicit strongly positive/settled signal; gracefully close without further probing.
- **I'm curious:** select a different, deeper question from the same bounded philosophical issue.
- **Something feels unresolved:** select a precise tension-probing question; don't assume the user is afraid, guilty or ashamed.

No reaction is required, no behavioral profile is stored, and the three existing interaction choices remain intact. No new model calls or costs.

## Decision Map mindmap (not a list)
- **She wants to write** forks into **one thing changes** vs **what still blocks her**.
- Both inform **her next move**.
- That move forks into **more room to try** and **other limits remain**.
- Tap a node to read one short, source-bounded explanation. The dashed branch is uncertainty; no depiction promises publishing success.
- Front-end options become concrete lived-language ("She earns her own money", "People keep interrupting her", "Editors still won't take her seriously"), while the internal argument retains concepts such as material independence and institutional exclusion.

## Research and technical boundaries
- **Existing approved mechanic layouts stay intact**; only Woolf option wording, result visualization, question/relevance and output wording are refined.
- Counterexample remains deferred, not silently generalized.
- Source and translation are **draft editorial hypotheses**; a quote may have alternative readings. No absolute truth, character judgments, mental-health inference, personal profiling, external API, backend, DB write or production publication.
- New \`question-selection-v02.js\` and \`expression-engine-v02.js\` build on existing v0.1 packet and quote-specific reasoners; this is not an autonomous universal philosophical model.
- \`experiments/two-encounter-question-lab-v03-standalone.html\` is an **exact** bundle of the same six modules and UI, checked with \`scripts/build-question-lab-v03.mjs --check\`.
- Automated tests cover **28×3 Seneca and 3×3×3 Woolf** choices across all four reaction states = **444 combinations**, including boundary cases and non-inference guards; mobile Chrome checks run at 320 / 390 / 768px. A physical iPhone Safari review remains a founder acceptance gate.
- No merge/deploy/production/database/paid model actions allowed at this stage.

## Founder QA question
After choosing a path: **Does the selected question reveal a thought you didn't already see—without pretending to know more about you than the choices can support?**

For Woolf: **Does the new connected mindmap illuminate which conditions interact and which possibilities remain open, rather than merely list what you picked?**
