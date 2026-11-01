# YourLogos Discover · Quote-specific production standard v1

**Scope:** CZ-13 / CZ-7. **Status:** editorial/engineering draft, not production-approved. No changes to app's three-tab structure.

## Experience contract (all quotes, including future additions)

Quote (visible throughout) → **6–12-word bridge** → one ordinary-life scene and one short question → **exactly three defensible, different readings** (optional collapsed own-words input) → one concise **choice-specific clarification** + an explanatory visual → an optional closing question → save deliberately, finish, or explore another lens.

A choice is a temporary interpretation within a fictional situation, **not a diagnosis or stable personal belief**. No compulsory counterargument, no forced additional rounds.

## Per-quote schema

Implemented in `discover-quote-schema.js` and the 91-row catalogue `discover-quote-editorial.js`.

- **Identity & provenance:** stable `id`, exact quote, author, theme, source/translation, original catalogue match, review status.
- **Philosophy:** precise claim, warrant, conceptual poles and live ambiguity; do not attribute the editorial reconstruction as a literal statement by the thinker.
- **Encounter:** welcoming bridge, short scene, one question, three perspectives each with a stable key, readable label, conceptual focus and eventual reviewable insight.
- **Visuals:** reusable visual grammar type, quote-specific conceptual terms, foreground motif, background theme and a choice-driven focus. Visual semantics before decorative illustration.
- **Reflection & trust:** one optional closing question, no automatic memory/belief inference, explicit save action.
- **Release checks:** source, philosophy, lenses, visual relevance, actual journey and accessibility, all explicitly reviewed.

### Structured example: Nietzsche

| Field | Value |
|---|---|
| Anchor | Purpose / Endurance |
| Bridge | Nietzsche asks what helps us endure. Picture this: |
| Scene | A friend asks why you stay in a job you often complain about |
| Lens A | Necessity → A practical reason sustains us without justifying the hardship |
| Lens B | Hope → An anticipated future can help us bear the present |
| Lens C | Uncertainty → Endurance may outlast our clear sense of purpose |
| Diagram | Relationship of Reason ↔ Difficulty, with changing focus |
| Motif | Night commute / warm city light |

Hegel uses a contextual network, while Kant's *Sapere aude* uses a pathway from received judgment to one's own reasoning. These are test fixtures, not claims that their interpretations have been historically verified.

## How all 91 quotes are handled

- **91/91 quote IDs** have explicit candidate interpretive triplets and individual motif identifiers. These were authored for this schema, not auto-filled with generic placeholders.
- Curated philosophical anchors already exist for all 91 and are reused, but **all 91 interpretation triplets are pending review**. A matching quote ID proves structural compatibility, *not* scholarly fidelity.
- **Only 3 pilot quotes** (IDs 0, 31, 70) currently have full bridge, scene, question, three brief lens-specific insights and closing question in the schema. They too remain unapproved.
- Visual grammar can be reused without manufacturing 91 full-resolution assets. Different quotes may use the same diagram family but distinct conceptual nodes, iconography and background. **A generic circle-and-diamond template is not adequate production artwork.**
- Backdrops must contextualize without introducing false historical imagery; decorative scenes are subordinate to the philosophical relationship.
- Models are given the quotation-specific lenses as **editorial guidance**. The model's returned text is not independently proof of fidelity or branch divergence.

## Future quote onboarding

1. Register a stable new numeric quote ID and preserve exact text, author, work, translation and source. Never reuse IDs.
2. Call `createFutureDiscoverDraft({id,quote,philosophy,encounter,visual})` to obtain the same versioned schema (default **draft**).
3. Curate the philosophical claim and the three distinct ways of understanding it, avoiding superficial yes/no choices.
4. Create an ordinary-life scene and bridge within word/character budgets; write a concise clarification and visual focus for each lens.
5. Choose a visual grammar family, then supply source-specific diagram semantics and suitable motif/background. Don't publish an unreviewed invented picture.
6. Review source, meaning, answer coverage, visual relevance, end-to-end branch test, accessibility and consent. Only then set the six review booleans after evidence and pass `validateDiscoverSpec(spec,{publish:true})`.
7. Add the new quote to the catalogue, supply its editorial record and tests. **No automatic production eligibility merely because DeepSeek generated text.**

## Current implementation limits / next gates

- The server can read the new quote-specific lenses. The live client still uses a comparatively simple two-node diagram grammar; bespoke animated visuals and scene art aren't implemented.
- Full visual semantics for all 91, quote-specific backgrounds in actual client rendering, and the source review workflow still require iteration.
- Manual DeepSeek output checks, reduced-motion/phone QA, free-text recovery, and the non-AI fallback's parity remain open under CZ-7.
- Do not merge/deploy the draft until full CI and targeted user journeys pass.


## Direct manipulation · draggable word cards (November 1 update)

The post-choice micro-exercise uses **free-floating word cards** and **sentence blanks** instead of input boxes. On touch devices, visitors hold and drag a card with their finger into the appropriate blank. For assistive access, visitors may also tap a card, then tap a blank; tap a filled blank to return its card. A reset affordance restores the two cards. The original philosopher quotation stays intact, visible above this **separately labeled everyday paraphrase**.

The quote-specific exercise is stored by quote ID + lens index in `discover-quote-drag.js`, with a reusable `parts` sequence (sentence fragments and named slot placeholders), two `slots` (role, accessible hint, word card) and a `connection` explaining the analogy. The `conceptualExercise` field in `discover-quote-schema.js` formalizes this for future quotes; publication requires three distinct validated substitutions.

**Coverage:** nine variants for Nietzsche 0, Hegel 31 and Kant 70. Other bundled quotes do not display an unreviewed drag exercise. This is intentionally optional after the main clarification and not a comprehension exam, personality inference or compulsory step.

**Safety and QA:** cards are escaped as text, renderer avoids model-generated HTML, pointer and click paths work independently, keyboard Enter/Space activates blanks, touch-action prevents scroll conflicts on active cards, and a visual relationship explanation appears when roles are correctly matched. Automated regression validates structure and rendered affordances. Real-device touch/VoiceOver testing, difficult edge cases and editorial review are still required.

