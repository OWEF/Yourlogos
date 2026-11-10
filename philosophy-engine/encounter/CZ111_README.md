# CZ-111 — Shared Insight Packet → Expression Engine v0.1

**Status:** source-aware, developer-reviewed prototype awaiting founder QA; unmerged, not integrated with production Discover.

## Goal
A complete first round must feel like **question → grounded scenario → meaningful choice → visual consequence → brief philosophical discovery → one question**. Keep the rich audit trace available **only in founder QA**, not routinely on screen. Neither philosophical truth nor user virtue is being scored.

## Shared architecture
- `philosophy-engine/context-atlas/pilot-records-v01.js` provides the existing work-scoped, source-linked **editorial hypotheses** for quote IDs 49 and 28.
- `philosophy-engine/context-atlas/grammar-v01.js` validates four analytical layers: logical form, conceptual structure, philosophical operation, interactive realization.
- `philosophy-engine/encounter/experience-reasoners-v01.js` contains two **specific provisional rule adapters**, one each for the founder-approved interaction shapes. They emit a **common** Insight Packet.
- `philosophy-engine/encounter/insight-packet-v01.js` validates traceable observation, philosophical discovery and justification, uncertainty, visual payload, and provisional source-referenced status; rejects empty, overlong, malformed, and accidentally production-approved packets.
- `philosophy-engine/encounter/expression-engine-v01.js` converts **the same packet shape** from either encounter into a short, deterministic display. It does not invent insight, run an LLM, conceal provenance or claim truth.
- `experiments/two-encounter-insight-lab-v02.html` is the import-based review interface. `experiments/two-encounter-insight-lab-v02-standalone.html` is **automatically reproducible from exactly those source modules and UI**, can open as a single file on iPhone, and does not request remote assets.
- `scripts/build-two-encounter-lab.mjs --check` makes source/standalone drift a failing test. All actual output content is sourced from the reasoners, not parallel hardcoded copy in the UI.

## Two exercises and intellectual constraints

### Seneca #49 — bounded Trade-Off
Only the **three genuinely discretionary evening hours** are allocated; other hours of the day are explicitly out of scope. Three linked 0.5-hour sliders distribute the same three hours among optional work, a friend and quiet reflection. A separately declared motivation (chosen / external expectation / necessary) affects the interpretation. The engine identifies dominance, ties, omitted activities and chosen motivation. It does **not** declare a balance objectively wise or work intrinsically wasteful.

### Woolf #28 — enabling-condition Decision Map
Changing money, privacy or institutional access doesn't guarantee that fiction will be written or published. The user chooses **an improved condition → a remaining barrier → a response**. An improvement may be partial; a different limitation may still operate. The model keeps material and gendered institutional context, and the visual retains three steps while showing that the final outcome remains contingent.

## Intellectual status
Both passages remain Atlas **drafts**, not scholarly-certified source reconstructions. Their 2 adapter rules are *not yet* general-purpose philosophical reasoning engines. Unlike the old CZ-105 eight-hour pilot, this Seneca illustration explicitly grounds the trade-off in a particular discretionary constraint. The source-based fit still needs founder/editorial approval. Counterexample is **not included**: founder deferred its current experience.

## Test / review
```bash
node --test tests/insight-expression-v01.test.mjs
node scripts/build-two-encounter-lab.mjs --check
# in GitHub Actions, mobile Chromium tests:
node tests/two-encounter-expression-browser.mjs
```

Acceptance:
- All Seneca half-hour distributions × three motivations and all 27 Woolf branch combinations validate.
- Distinct inputs meaningfully affect observations, justified interpretations and optional questions.
- The Expression Engine **cannot** change the philosophical proposition; source and uncertainty remain in the packet.
- No production eligibility, unverified personal trait inference, new quote routing, Internet requests, real money, database writes, or service keys.
- Two viewports comparable to iPhone plus tablet tested for clipping, slider continuity, restored paths, real user touch parity where possible; real Safari review remains outstanding.
- Founder decides whether the short ending is enough, whether visual clarity works, and whether the new discoveries feel philosophically worthwhile.

## Next gate
Do not merge, deploy, or expand to 15 interactive quotes. First gather founder QA on these two end-to-end rounds. Then assess an editorial versioned schema / real source checks and a scoped production integration PR.
