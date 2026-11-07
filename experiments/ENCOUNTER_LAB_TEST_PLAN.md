# CZ-103 · Encounter Lab v0.1 — Founder test protocol

**Scope:** One standalone, versioned HTML page with **exactly six fixed quote examples** (no random daily rotation or live LLM). The production Discover app and Supabase database are unchanged.

## Open the lab
- Test HTML file on review branch: `experiments/encounter-lab.html`.
- Every tab can be opened by a stable fragment: `#tradeoff`, `#map`, `#builder`, `#switch`, `#counter`, `#experiment`.
- No user authentication. No network calls for content, data storage or model use. Optional Google Fonts request; safe serif/sans fallback when offline.
- Mark **Works** or **Needs revision**, add a note for each, and use **Copy all six reviews**. Device-local review storage only; feedback is not submitted.

## Six deterministic examples
1. **Trade-Off — Seneca, quote 49.** Three mutually linked sliders allocate exactly eight discretionary hours. Changing any allocation should preserve `sum=8` and show coherent opportunity-cost feedback. Test rapid drags on mobile and keyboard arrows.
2. **Decision Map — Virginia Woolf, quote 28.** Select income, privacy, or time; then one of two practical interventions. Feedback should follow the exact chosen branch and return to Woolf's material conditions and historical restrictions on creative independence. Test revising the first choice: the second branch must reset.
3. **Concept Builder — Kant, quote 71.** Tap rearrangeable propositions into three numbered positions; completed correct order explains maxim → universalization → consistent willing. Incorrect order displays constructive correction, not a personality judgment; filled slots are removable.
4. **Perspective Switch — J. S. Mill, quote 21.** Switch from student to teacher case in a contemporary AI-writing debate; after both positions, a relevant blind spot appears. This is a prototype analogy to Mill, not his own example.
5. **Counterexample — Pascal, quote 10.** Choose among three plausible cases; only a natural disaster directly challenges an overly literal reading of 'all'. Preserve the distinction between refuting the wording and dismissing the broader insight of an aphorism.
6. **Thought Experiment — Camus, quote 66.** An endless task stays unchanged; toggle awareness and revolt while watching a short Sisyphus stone animation. No autoplay; reduced-motion preference cancels animation.

## Quality gates
- Every experience uses an explicitly fixed original quote and documented stable ID.
- Feedback is contingent on action, and the philosophical connection is checked before approving use in Encounter.
- One screen's worth of interactive logic, no endless steps, no fake 'correct thinking' score, no user-belief inference.
- Mobile widths 320/390 px should not scroll horizontally; keyboard focus visible; reduced-motion honored; no network/model dependencies for functionality.
- Review sourced quotations and philosophical reconstructions before production; this preview remains educational prototype only.
- New DB routing table is separately proposed in `supabase/yourlogos_interaction_routing_proposal.sql` (not applied); no production rollout until founder approval.

## Current test evidence and limitation
- Headless Chromium visual inspection at 390px completed for the default slider screen, and the screenshot is available alongside the founder handoff. Simple deterministic navigation confirmed all six modes and no horizontal overflow at 390px; the narrower 320px overflow was corrected.
- Automated GitHub CI checks verify the repository but do not replace iPhone Safari touch testing. This lab's manually crafted philosophical examples are not yet expert source-reviewed.
- The standalone HTML can be opened from a local file or under any static web host; it has no backend dependency.
