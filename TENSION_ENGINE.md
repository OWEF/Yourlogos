# YourLogos Tension Engine V3.4

## Status
Curated pilot: **22 / 91** bundled quotations. The other quotes are **not** automatically given a synthetic dialectic. Encounter/Keep remains available; Question politely identifies uncurated content.

## Editorial contract
The display begins with a genuine pressure point, not "What if X is wrong?".

Each record requires:
- Exact stable quote ID and identifying source phrase;
- A defensible **claim** reconstructed from the quotation;
- An explicit **warrant** or premise that supports that claim;
- Two independently intelligible **poles** in tension;
- One short **friction** question;
- Three operations with **different targets**: **Resist** tests a counterexample/consequence; **Doubt** tests an assumption, justification or definition; **Reframe** alters the conceptual distinction;
- Two responses for each operation; each response has a clear conceptual insight, Library school and conceptual destination.

This is a philosophical editorial system, **not** a deductive solver. An apparent conflict may be qualified or dissolved without automatically refuting its author. Avoid strawmen, false attributions and importing a foreign philosophical school without explaining the connecting concept.

## Software contract
`tension-catalogue-a.js`, `tension-catalogue-b.js`: curated records.
`tension-engine.js`: record validation, source-to-record identity checking and destination resolution.
`thought-threads.js`: existing UI adapter; no LLM calls or generic theme inference when a stable quote ID is present.
`app.js`: provides the stable quote ID and logs explicit thread choices; no scoring or inferred user beliefs.

## Publishing checklist
1. Verify verbatim quotation, attribution, translation and original context against a credible scholarly/primary source.
2. State the strongest reasonable interpretation and distinguish the quote from a full doctrine.
3. Explain why both poles matter. Reject false dilemmas and mere semantic tricks.
4. Test Resist / Doubt / Reframe for independence and non-redundancy.
5. Ensure short text is readable on a phone, with no more than 3 initial and 2 subsequent options.
6. Link the final move to a **concept**, not merely a philosophical school.
7. Run content validation and browser tests; have a human editor approve philosophical accuracy.

## LLM integration (not enabled)
Future models should generate **candidates only** in a review queue, bound to this schema and citing primary/contextual sources. A separate reviewer checks source fidelity, move distinctiveness and conceptual link before a candidate is published. Never show unreviewed live-generated claims to users as authoritative.

## Limitation
The pilot's reconstruction and bridges are editorial drafts requiring scholarly fact checking, not yet source-audited line-by-line. All uncurated quotes should remain explicitly labeled until review.
