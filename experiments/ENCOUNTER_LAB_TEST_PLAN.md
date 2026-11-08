# CZ-103 · Encounter Lab v0.3 — Founder test protocol

**Status:** Standalone six-mode prototype on a draft pull request; no production integration, schema migration, login, AI usage or deployment. The live Discover feed is unchanged.

## Philosophy of interaction
- **Minimal reading, maximum visible consequence.** Every action should advance understanding, challenge an assumption or open a perspective. Avoid rote quizzes and false inferences about the user's beliefs.
- **Complete arc:** quotation and concise prompt → user action → immediate visual/consequential response → an explicit *Reveal my ending* action → **Encounter Complete** screen showing that exact path, a distinct consequence, and one relevant closing question.
- The final reveal is *not* a personality score, “correct thinker” label or generic congratulations. The user can **Try another path** or **Next experience**.
- The experiment that depended on Sisyphus animation has been **retired** per founder feedback; avoid scope creep. Evidence Lens is the sixth example pending founder review.

## Fixed interactions (six selectable tabs; no random feed)
1. **Trade-Off — Seneca #49** `#tradeoff`: three linked sliders allocate exactly 8 discretionary hours, sum invariant. Move any slider before revealing. Different allocations generate different summaries and a proportioned visual bar.
2. **Decision Map — Virginia Woolf #28** `#map`: one screen, select income/privacy/time and then one of two interventions. Six distinct result paths. Changing the first decision clears the branch; no invented historically unsupported causal certainty.
3. **Concept Builder — Kant #71** `#builder`: **drag** one of two consequence cards to a dashed target; touch/mouse pointer drag and keyboard fallback. The proposed link survives or comes under pressure. One link, not multi-sentence sorting.
4. **Perspective — John Stuart Mill #21** `#switch`: choose student/teacher and one objection, see the response and a choice-dependent ending; not merely switching static paragraphs.
5. **Counterexample — Blaise Pascal #10** `#counter`: visual test on **ALL** and a small set of cases; a genuine exception breaks the literal universality of the saying. Minimal text and strong visual contrast. Different tested examples result in different endings.
6. **Evidence Lens — David Hume #56** `#evidence`: choose a hypothetical clue supporting an unsafe-water claim; a qualitative evidence-strength meter and path-specific reveal. Bars illustrate *relative support* and are **not statistical probabilities**. No animation engine.

## Founder testing checklist
- Open each tab repeatedly, test two divergent choices, and confirm the closing headline, consequence, path graphic and final question actually differ.
- Check that changing an earlier choice invalidates the downstream completion state; the same quote can always be retested.
- Drag builder cards on iPhone Safari, not just mouse. Keyboard and focus fallback should work.
- At 320px/390px widths: no horizontal overflow, legible quote and conclusion, touch targets usable. No costly or distracting animation.
- Complete the review panel for each mode. Notes remain device-local until **Copy all six reviews**.
- Review quotation context and philosophical interpretations before production use; these are educational prototypes, not expert-reviewed scholarly commentary.

## Verification as of 8 November 2026
- JavaScript syntax check passed.
- Headless Chromium regression ran at widths 320, 390 and 768. Tests exercised all six mechanics, distinct branch-dependent endings, revisiting prior choices, slider eight-hour invariant, and no horizontal overflow or page-script errors.
- Emulated mobile touch events successfully dragged a Concept Builder card and completed the ending.
- **Still outstanding:** real iPhone Safari QA and founder philosophical review.
- Production remains unchanged; migration proposal in `supabase/yourlogos_interaction_routing_proposal.sql` has not been executed.

## Rollback
Revert standalone experiment file and docs; there is no production database or application impact.
