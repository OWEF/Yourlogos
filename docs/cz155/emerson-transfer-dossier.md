# CZ-147 / CZ-155 R2 — Emerson's *Self-Reliance*: same outward bus decision, distinct grounds

**Status:** development-only source dossier; not a catalogue admission; not an independent qualified source-review signature. **Date:** 18 November 2026. **Authoring operation:** `independent_judgment` on the already-implemented `encounter-events/1` Director.

## Edition, literal quotation, and the existing display discrepancy

- Source witness: Ralph Waldo Emerson, “Self-Reliance,” *Essays: First Series*, Boston: James Munroe and Company, **1841**. Text prepared from the HathiTrust first-edition copy by the [University of Virginia Anthology of Earlier American Literature](https://anthology.lib.virginia.edu/work/Emerson/emerson-self-reliance). [First-edition page scan/transcription on Wikisource](https://en.wikisource.org/wiki/Page:Essays_(1841).djvu/59) is a secondary check.
- The relevant 1841 passage's full familiar sentence is: **“A foolish consistency is the hobgoblin of little minds, adored by little statesmen and philosophers and divines.”** The adjective *foolish* is important. A sentence nearby describes the pressure to honor an earlier word because other people use it to judge consistency; another urges bringing one's past to judgment in the present.
- **Inherited quote ID 55** currently displays only **“A foolish consistency is the hobgoblin of little minds.”** The existing quote excerpt replaces the printed comma after *minds* with a terminal full stop. The development route deliberately keeps the ledger text byte-for-byte. **This is a documented excerpt/punctuation normalization, not a claim that the abbreviated sentence is printed verbatim with that terminal period in 1841.** It requires an explicit editorial quotation decision prior to publication; this proof does **not** silently rewrite the existing quote or admission status.

## Source warrant and problem difference

**Central argument:** Trust present, independent judgment over a reputation for being predictably consistent. Earlier declarations may be evidence about who someone was, but they cannot by themselves settle what reasons support a position now. An earlier commitment is **not** false merely because it was earlier; what matters is whether, after reconsideration, the current judgment has genuine grounds.

**Supporting warrant:** Emerson's passage explicitly links conformity pressure to others' expectation that a person's past words will forecast their current views. He uses “*foolish* consistency” for mechanical fidelity to such expectations. This does **not** entail an obligation to change views or discount obligations and shared evidence.

**Qualification:** A person may reasonably maintain a public position after assessing new facts. Reflection is not a guarantee that the resulting policy is correct or that a fictional alternative works. The purported ridership, roster and transport budget are story facts, not empirical transit data.

**Tempting misreading to prevent:** “Changing your mind is always courageous or right; keeping it is always cowardly.” Another is pretending to know a reader's private motive because they maintained their public position. Both are prohibited.

**Analogy limit:** Emerson's criticism of reputational consistency can illuminate the *reason* for a public decision; the essay does not establish transportation policy, justify a specific service cut, guarantee an on-demand shuttle, or prove that concern for one's reputation cannot coexist with rational reasons.

**Contrast with Epictetus:** Epictetus E0 distinguishes the speaker's own apology from the friend's externally chosen reply. Emerson R2 distinguishes two possible explicitly selected reasons behind **the exact same public action**. Different philosophical operations share the Director, Reasoning, Emotion Strategy and Expression implementation.

## Fictional test and source-to-action bridge

**Original public commitment:** A neighborhood participant has publicly endorsed moving the last bus departure from **23:40 to 22:50** on the apparent strength of aggregate low late-night ridership. Both paths start with the exact public words:

> I support moving the final bus from 23:40 to 22:50.

**Independently authored development, identical across paths:** At a later meeting, a neighbor presents rosters showing **thirteen late-shift workers** rely on the 23:40 service. The transit office confirms there is budget for an **accessible 23:45 shuttle pilot serving the same stops**, but it is not tested and its efficacy remains unknown. This information is not authored or caused by the participant's first act. It does not demonstrate that moving the bus is desirable.

**Identical final outward act on both paths:**

> I still support moving the final bus from 23:40 to 22:50.

The first final choice, **Maintain on present merits**, explicitly selects the grounds: the character has weighed the ridership case against those workers and identifies the funded accessible shuttle as credible but unproven; the proposal is maintained subject to checking adequacy.

The second final choice, **Maintain for public image**, explicitly selects the grounds: the character has not assessed the contrary evidence and continues because reversal would look inconsistent. That is a user-selected fictional reason, not an inference from public speech.

| Interpretation | Established fictional fact | Source warrant | Permitted claim | Prohibited inference |
| --- | --- | --- | --- | --- |
| Present merits | `weighedBothEvidence=true`, `identifiedCredibleAlternative=true`, `avoidedInconsistency=false` | `present_judgment`, `thoughtful_retention`, `scenario_qualification` | Maintenance can be compatible with independent judgment, even when fallible | Shuttle will work; Emerson blesses this policy |
| Reputation | `weighedBothEvidence=false`, `avoidedInconsistency=true` | `public_consistency`, `scenario_qualification` | Maintenance to preserve consistency replaces examination of merits with reputation | This is the person's actual private psychology; policy is necessarily wrong |

The **canonical inputs** differ only at the expressly selected second reason-bearing action:

- Merits: `{"path":["publish_initial_support","neighbor_shift_evidence","maintain_merits"]}`
- Image: `{"path":["publish_initial_support","neighbor_shift_evidence","maintain_image"]}`

The resulting public utterances are unchanged. The shared Director records motives and actions as participant-owned facts and preserves the independent event. The same shared `decisionWarrant` contract selects the reasoned inference; Emotion is a rhetorical policy, not an inference about a human reader's actual feelings; Expression may compress but must not reverse the qualification.

## Blind-to-recap tests

The transfer tests hide Section I choice recaps and compare Section II (philosophical interpretation) and Section III (actual question). They require different, source-warranted Reasoning claims and distinct rhetorical strategies for the opposed explicit grounds.

The irrelevant-variation control reverses authored option order and changes incidental opening recap/possible rationale with the same initial and final substantive facts. It changes the source-version fingerprint **as it should**, but the selected inference, rhetorical policy and Sections II–III must stay identical for each unchanged philosophical path. Exact action IDs, quote ID, edition and source contracts are validated against the new version.

**No publication eligibility changes; no runtime LLM; no philosopher-named callback; no new family or storage backend.** The only application routing change is adding one provisional source record to the already dual-gated author-preview registry.

## Remaining editorial review

This authoring dossier is source-grounded but not an independent philosophical editor's signoff. The shortened punctuation of inherited quote ID 55, the factual *credibility* (not truth) of the budgeted shuttle, and whether either ending overstates Emerson's argument require a separate reviewer before moving the two-path candidate into ordinary source admission. The sealed CZ-154 sources remain unseen and unused.
