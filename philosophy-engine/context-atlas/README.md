# CZ-110 · Philosophical Context Atlas v0.1 (15-quotation research pilot)

**Status:** Unpublished research prototype. This is **a knowledge representation and falsification test**, not an authority on philosophical truth, automated historiography, or a publisher-approved quotation database.

## Purpose

A user sees a minimal quote. The reasoning system privately retrieves a *versioned, context-rich model* that preserves evidence, uncertainty, other readings and historic scope. That model is provisionally analyzed through four separate layers:

1. **Logical form** — quantity, quality, relation, modality, where supportable. Kant's table of judgments motivates the vocabulary, but is **not** presumed universally exhaustive or a substitute for textual interpretation.
2. **Conceptual structure** — reconstructed proposition, warrant, linked concepts, conditions, alternative readings, conceptual challenge, explicit inference boundaries.
3. **Philosophical operation** — what intellectually meaningful action might expose/question the claim: examine a dependency, restore a qualifier, trace a process, test a generalization, reconstruct mediation.
4. **Interactive realization** — identify a candidate Trade-Off / Decision Map / Counterexample **only when supported**. The valid result **none suitable** is intentionally common; not every philosophical claim maps to the current three games.

The objective is *a defensible question or discovery*, not to certify the philosopher's truth or assign a moral/personality score.

## Existing sources reused (no migration)
- \`app.js\`: stable bundled quote IDs, literal wording, author, work, theme, prompt.
- \`tension-catalogue-*.js\` and \`TENSION_ENGINE.md\`: pre-existing claim/warrant/tension editorial scaffolding for 91 quotes. Those records are draft interpretation, **not 91 completed source checks**.
- \`philosophy-engine/models/seneca-time-v1.js\` and \`tradeoff-reasoner.js\` from upstream CZ-105 PR #147: existing deterministic engine to challenge.
- Existing \`supabase/yourlogos_schema.sql\` is **a proposal**, not evidence that its tables exist in a live database. This task makes no SQL writes or client changes.

## Source and integrity policy
- Every record has a bundled source identity and a *limited* evidence list: external source URLs say **what they support**. A linked passage does not validate every interpretation of the whole author.
- Original-language text is **null until examined**; a source's advertised language alone does not certify an exact original passage.
- An abridgement, paraphrase, disputed translation, or character's speech remains flagged as such.
- \`sourcePassage.contextualSummary\`, \`authorPosition.scopedSummary\`, \`argumentModel\` are **draft editorial reconstructions** and can be disputed, replaced or given multiple readings. The model retains two alternative readings by design.
- Positions are scoped by work/period. Do **not** assume an author's views are timeless and entirely consistent.
- The atlas does not issue final verdicts about truth. A philosopher's statements are not always deductive, literal or universally quantified; an aphorism may be figurative.
- No record is approved for public display, inference, paid model use, or database migration.

## 15 pilot quotes and tentative verdicts

| ID | Author | Primary challenge | Candidate (not approval) |
| --- | --- | --- | --- |
| 0 | Nietzsche | Aphorism about purpose and endurance; translation/scope | **None** |
| 8 | Wittgenstein | Tractatus logical limits; late-vs-early author distinction | **None** |
| 10 | Pascal | Popular 'all humanity' paraphrase, not literal formal universal | **None** |
| 11 | Kant | Wonder at nature and moral law is no finite allocation | **None** |
| 16 | Laozi | Proverb, translation and Daoist context | **None** |
| 20 | Descartes | Cogito as first-person certainty, not a generic argument game | **None** |
| 21 | Mill | Hearing opposing arguments; Perspective is deferred | **None** |
| 22 | Marx | Praxis relation is not a finite thought/action budget | **None** |
| 23 | Wollstonecraft | Social/educational conditions and self-direction | Decision Map, **conditional** |
| 28 | Woolf | Gendered material constraints on writing opportunities | Decision Map, **conditional** |
| 31 | Hegel | Whole/mediation; no faithful current three-mechanic fit | **None** |
| 33 | Shakespeare (Hamlet) | Character vs author, tragic speech; do not gamify self-harm | **None** |
| 34 | Kierkegaard | Retrospection vs prospective action, source needs verification | Decision Map, **conditional** |
| 42 | Aristotle | A generic 'all ... by nature' needs disposition qualifiers | Counterexample, **conditional** |
| 49 | Seneca | Finite life and purposive use; arbitrary eight hours **fail** | Trade-Off, **conditional** |

This pilot intentionally includes many **no-fit** decisions. That is a strength: high-level grammar is not the same as forced game routing. A later validated mechanism may make some of them suitable.

## Externally linked contextual passage checks (limited)
External references exist for **5/15** cases as of this pilot:
- **Wittgenstein #8:** https://plato.stanford.edu/entries/wittgenstein/ — Tractatus proposition 7 and theory of proposition/logical representation.
- **Pascal #10:** https://emend.press/pascal.html — Diversion fragment: popular viral English wording overstates scope.
- **Wollstonecraft #23:** https://barryfvaughan.org/text/philtext/wollstonecraft/vindication/4.html and https://plato.stanford.edu/entries/wollstonecraft/ — autonomy, domination, educational context.
- **Woolf #28:** https://teachers.americanliterature.com/author/virginia-woolf/book/a-room-of-ones-own/chapter-1 and https://anthologydev.lib.virginia.edu/work/Woolf/woolf-room-of-ones-own?section=frontMatter — literary/material/historical context, Woolf's stated qualification.
- **Seneca #49:** https://thestoiclibrary.com/shortness-of-life/2 and https://en.mouseia.org/texts/seneca-brevitate-vitae/part-2 — De Brevitate Vitae 2.1 and the examples of life consumed by restless ambition and superfluous labor.

All linked summaries **still require human editorial review**. The other 10 entries only claim bundled metadata and **draft contextual hypotheses**; they are NOT independently sourced or verified in this pass. Do not invent exact citations, original Greek/Latin/Chinese, or author's settled intent.

## Test protocol

\`\`\`sh
node --check philosophy-engine/context-atlas/pilot-records-v01.js
node --check philosophy-engine/context-atlas/grammar-v01.js
node --test tests/context-atlas-pilot.test.mjs
node scripts/audit-context-atlas.mjs
\`\`\`

The tests verify:
- Exactly **15 unique stable IDs**, exact-match quote/author/source from the existing 91-row \`app.js\`;
- Draft-only epistemic status, appropriate source references, scoped author position, at least **two alternative readings**, full 4-layer objects and a trace of how the interpretation reached the candidate mechanic;
- Candidate proof and conditions, and legitimate **abstention** for quotes that do not fit;
- Pascal's paraphrase is **not** silently treated as a logically universal Pascal claim;
- Hamlet's voice is marked **character speech**, not Shakespeare's endorsed moral doctrine;
- Aristotle's 'by nature' is treated as a qualified/dispositional universal requiring an explicit scope test;
- **Actual CZ-105 \`analyzeTradeoff()\`** returns structurally valid outputs for Seneca, **but the Context Atlas blocks its invented 'eight-hour-thought-exercise' scenario** from being an approved Senecan interaction;
- The bridge exposes a provisional Insight Packet-shaped record with observation, conditional interpretation, warrant, uncertainty and trace; it marks \`readyForExpression:false\` whenever source/context/scenario support is missing.

## Storage roadmap — design only

Keep the public-facing \`quotes\` record lean. Model five versioned concepts in a *future, reviewed* datastore:
1. **quotes**: stable ID, published display text/author, source short label, current validated version pointer.
2. **source_passages**: work, chapter/fragment, original-language text, translation variants, licence, external reference, status and reviewer.
3. **author_positions**: work/period-qualified claims and counterpositions with provenance and author/character distinction.
4. **argument_models**: competing reconstructions, warrants, conceptual graph, scope, objections, uncertainty and evidence links.
5. **interaction_models**: operative intellectual test, mechanic eligibility/decline rationale, source fidelity, scenario constraints, versioned approvals.

Possible additional supporting tables: editorial_reviews, citations/attestations and source-version audit history. A future Postgres design should use stable IDs and RLS, public **approved-only** views, least-privilege writes, migration/rollback plan and no third-party copyrighted passage copying beyond permission. **No actual DDL migration or production connection is part of this PR.**

## Next founder review questions
- Are the 4 grammar layers reliably faithful to 15 diverse cases, or do they flatten historically specific claims?
- Which of the 10 no-fit records might require **new philosophical operations**, and which genuinely should remain non-interactive?
- Is a **candidate** Decision Map for Woolf meaningfully grounded in material enabling conditions or does it imply falsely deterministic futures?
- Can the Seneca scenario be rewritten as a real, motivated constraint that invites discovery rather than a daily schedule optimization?
- Can our future **Insight Packet** be compact while retaining uncertainty and primary-source trace? This remains a contract/design issue, not a completed Expression Engine.

**Hard release gate:** Human philosophical/editorial review, original-source and translation checks, founder acceptance, then separately approved data migration or app integration. No merge/deploy/agent billing triggered here.
