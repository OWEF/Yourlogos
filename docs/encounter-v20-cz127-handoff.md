# CZ-127 — Encounter v2.0 Isolated Engineering Proof and QA Handoff

Status: ISOLATED PROOF / PARTIAL PRODUCT IMPLEMENTATION / NO PRODUCTION RELEASE.
Parent: CZ-13. QA authority: CZ-123.
Original baseline: draft PR #175 at 84ee9b3b56e056df3e96c4701ec48b6b5533ce81.
Candidate: draft PR #176, feature/cz127-encounter-v20-proof, stacked on the exact PR #175 branch.
The latest commit and exact-SHA checks must be read from PR #176 / GitHub Actions after this document is committed. This document is not an independent QA certification.

## 1. Reconciliation and file inventory

The connected GitHub PR, branch and Linear searches did not find a prior dedicated CZ-127 v2.0 implementation or CI evidence. An inaccessible private/local workspace cannot be excluded. No local work was overwritten. An isolated proof was built rather than claiming existing development was complete.

Added paths (no frozen kernel, existing v1 expression engine, main app, database, permissions or production assets edited):

| File | Purpose |
| --- | --- |
| philosophy-engine/encounter/emotion-strategy-v20.js | evidence adapter, source-witness admission, deterministic eligibility/scoring, trace and fallback |
| philosophy-engine/encounter/encounter-v20.js | exact three-section v2 storyteller, unchanged v1 word policy, evidence/copy/creative-brief validator |
| tests/encounter-v20.test.mjs | source, choice, strategy, safety, path and word tests, plus RED-first adversarial regressions |
| scripts/build-encounter-v20.mjs | derives seven real paths from frozen reasoner and outputs full v1.9.6/v2 comparison JSON + local HTML |
| tests/encounter-v20-browser.mjs | seven-path, four-viewport Chromium interaction/overflow/browser errors checks |
| .github/workflows/encounter-v20.yml | exact-SHA Node baseline and new tests, original bundle check, v2 artifacts, real Chromium automation |
| docs/encounter-v20-cz127-handoff.md | this reproducible matrix/RFC/QA checklist |

Generated (not committed, rebuilt identically in CI): experiments/encounter-v20-proof.html and design-review/encounter-v20-comparison.json. Retrieve both from the PR #176 CZ-127 workflow artifact. The source comparison JSON includes seven full three-section outputs, baseline output and structured strategy briefs.

## 2. Requirements traceability (research proof versus complete v2 product)

| CZ-127 obligation | Position | Evidence / limitation |
| --- | --- | --- |
| Preserve deterministic Reasoning Engine as truthkeeper | Implemented | Source files reasoning-kernel-v11.js and semantic-reasoning-v12.js unchanged; v2 reads meaning/1.2 |
| Preserve source admissions, warrant, limitations | Implemented for pilot | Adapter requires curated source witness and the exact source claim; full scholarly approval remains open |
| Separate imagined consequences from actual biography | Implemented for pilot | Evidence tagged selected/modeled/hypothetical; narratives explicitly say imagined |
| No psychological/emotional diagnosis | Implemented for pilot | Strategy derives solely from selected path and evidence; no account or emotion input |
| Genuinely intermediate Emotion Strategy Engine | Implemented for pilot | independent adapter, registered candidates, source- and path-dependent gating and creative brief |
| Evaluate playful, provocative, warm, contemplative | Partial | four supported choices; not every tone qualifies for every scenario, appropriate abstention |
| Deterministic tie-breaking and evidence trace | Implemented | score DESC then fixed strategy order, ID, trace and evidence IDs |
| Inappropriate humor rejection | Partial | relationship scenario excludes humor; broader contextual safety taxonomy awaits review |
| Fallback and abstention | Implemented | neutral when an explicit tone is ineligible, needs_editorial_review on invalid input |
| Creative brief / source warrant / prohibited claims | Implemented | emotion-strategy/2.0.0 with grounds and selection_trace |
| Section I plain-language consequence | Implemented for pilot | encounter-v20.js choiceText, seven actual outputs |
| Section II source-supported central idea | Partial | source-claim checked and plain paraphrase written; qualified historian/philosopher review missing |
| Section III short memorable payoff, statement allowed | Implemented for pilot | lastThing expressions for path-grounded strategies, no mandatory question |
| Exactly three sections, no fourth ceremony | Implemented for research proof | renderer returns three sections; no saves or postscript |
| True variation across paths | Implemented for tested cases | Dillard full/rest/shared, Epictetus offer/space, Kierkegaard move/stay |
| Genuine variation across eligible tones | Implemented in bounded proof | same writing path supports playful and contemplative endings; unsupported requested tones abstain |
| Word bounds | Implemented | frozen v1.9.6 policy: 80–120 total; I 10–48, II 18–65, III 9–26 |
| Proposed shorter v2 editorial policy | Not Approved / Not Applied | 60–95 proposed in Phase A, pending founder approval; not silently changed |
| 15-quote Atlas curation | Implemented as editorial audit | section 4 below; Atlas source remains an unapproved research dataset |
| Human-dilemma-first future content | Partial | pilot paths selected; no published catalogue migration |
| Use only Trade-Off and Decision Map | Implemented | imports existing semanticCases for Dillard, Epictetus and Kierkegaard |
| Preserve original mobile application navigation/onboarding/Like | Not Applicable to isolated proof | no main-app integration was authorized; current production flow unchanged |
| Reproducible actual v1.9.6 versus v2 outputs | Implemented | generator comparison JSON and seven CZ127-FULL CI log entries |
| Automated reasoning and negative tests | Implemented for pilot | tests/encounter-v20.test.mjs plus all existing 108 historical tests |
| Browser artifact parity | Implemented for research proof | deterministic generator then --check, test in Chrome at 320, 390, 430, 1024 |
| Real iPhone Safari and VoiceOver | Missing separate gate | CZ-126, cannot be inferred from Chromium |
| Qualified independent source analysis | Missing separate gate | CZ-121; provisional curated records are NOT certified |
| Five first-time readers and consented 24h recall | Missing separate gate | CZ-125; no real readers recruited or falsely simulated |
| Production integration/release | Not Authorized | no merge, deploy, database migration or paid inference |

## 3. RFC — authority, contracts and rejection logic

Authoritative flow: Context Atlas/editorial source → scenario/interaction → unchanged reasonSemantically() → adaptEncounterEvidence() → selectEmotionStrategy() → renderEncounterV20() → validateEncounterV20() → research HTML.

Evidence adapter returns encounter-evidence/2.0.0 with kind, immutable quote/author/source identity, warranted central source claim, selected choices, meaning.evidence and explicit machine-origin paths such as meaning:central, choice:0, source:central, event:0, imagined:0. These IDs are created by the v2 adapter; they are NOT claimed to be original kernel claim IDs.

Strategy contract: emotion-strategy/2.0.0: strategy, grounded_evidence_ids, source_warrant_id, rhetorical_angle{id,operator,scope}, prohibited_claims, selection_trace (all candidate scores, eligible flags and rejections, tie-break), fallback_reason. Automatic selection compares editorially pre-registered candidates by stated path guards and score (currently 12–15 for eligible angles); no diagnosis or LLM inference. A requested strategy may abstain to neutral rather than invent evidence. This is a limited curated-rhetoric prototype, NOT a generalized humor model.

Output contract: encounter-output/2.0.0 with sections [{label,text,evidence_ids}] in exact order Your Choice, Back to the Philosopher, One Last Thing…. Displayed quotation and author are retained as metadata, not a fourth section. Validation requires source-witness match, full section labels/order, relevant IDs, policy-compliant word counts, authorized strategy brief (recomputed from source), exact evidence-grounded rendering and unchanged quoted source/warrant. Mutating a generated line or swapping a creative brief cannot preserve READY.

Rejection / abstention: malformed meaning packet, contradicted source, missing event ledger, inconsistent recurrence arithmetic, unknown route, invalid requested tone or output that cannot fit word policy is needs_editorial_review. Ineligible rhetorical opportunities are logged in selection_trace. A neutral path may still be returned as READY only when it meets all source/word constraints; it is not a claim of emotional impact.

No claim is made that machine-readable evidence makes any philosophical interpretation correct independently of scholarship or that exact text matching is a universal natural-language safety classifier. The closed copy catalogue itself remains subject to editorial review.

## 4. Ranked 15-record Atlas curation matrix

These are provisional editorial rankings for novice Encounter (not rankings of philosophical worth). Source categories: C = bundled catalogue only, L = passage locator checked, P = checked-context paraphrase. NONE of these signifies qualified scholarly signoff. 1–4 are conditional future candidates, not released content.

| Rank | Atlas ID / author | Everyday dilemma | Depth | Provenance | Active mechanic fit | Expressive angle | Decision |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 34 Kierkegaard | choose without knowing tomorrow | high | C, disputed shortened variant | Decision Map, conditional | unchosen-future reversal | proof, provisional |
| 2 | 28 Woolf | money/privacy barriers to creating | high | L, incomplete scholarly review | Decision Map, conditional | material conditions vs ambition | next wave |
| 3 | 23 Wollstonecraft | education and power over one's choices | high | L, incomplete scholarly review | Decision Map, conditional | agency vs structural limits | next wave |
| 4 | 49 Seneca | duties and finite discretionary time | high | L, model context needs repair | Trade-Off, conditional | obligations vs deliberate use | rewrite first |
| 5 | 21 Mill | facing the strongest objection | high | C | none; Perspective deferred | disagreement as discovery | Library |
| 6 | 42 Aristotle | curiosity and disposition | high | C | Counterexample inactive | quiet wonder | Library |
| 7 | 16 Laozi | beginnings and non-forcing | high | C, translation disputed | none | small beginnings | Library |
| 8 | 0 Nietzsche | purpose during hardship | high | C, source scope unresolved | none | contrast with endurance | Library |
| 9 | 10 Pascal | activity and diversion | high | P, popular wording not literal | none | distraction vs stillness | Library |
| 10 | 22 Marx | interpretation and praxis | high | C | none, false time slider | theory/action not binary | Library |
| 11 | 11 Kant | nature and moral law | high | C, abridged | none | two grounds for awe | Library |
| 12 | 20 Descartes | radical doubt and certainty | high | C | none, self-verification not modeled | doubt/certainty | Library |
| 13 | 31 Hegel | whole and mediation | high | C | none | partial/whole | Library |
| 14 | 8 Wittgenstein | what meaningful saying permits | high | L, translation variation | none | limits of language | Library |
| 15 | 33 Shakespeare, Hamlet | tragic soliloquy and author/character | high | C | none, sensitive content | no gamified payoff | Library |

Source: philosophy-engine/context-atlas/pilot-records-v01.js and README.md, as frozen in 84ee9b3. This report does not edit or delete any Atlas entry.

Pilot sources OUTSIDE the Atlas 15: Dillard (Quote ID 12, secondary excerpt witness, Trade-Off), Epictetus (curated translation witness, Decision Map). Their current semantic admission remains curated_provisional; no claim that they are source-verified or appropriate for public release. Adam Smith remains legitimate specialized content; not chosen for this human-dilemma-first proof.

## 5. Actual generated seven-path comparison summary

Exact full text, original baseline text and structured traces are generated into design-review/encounter-v20-comparison.json by scripts/build-encounter-v20.mjs. CI prints CZ127-FULL records, not paraphrased recollections. The original baseline is expressSemantic(packet) run on the original v1.9.6 source, not an old v1.8 comparison.

| Path | v1.9.6 words | v2.0 words | Auto strategy | v2 final observation (editorial candidate) |
| --- | ---: | ---: | --- | --- |
| Dillard [6,0,0] ×5 | 113 | 102 | playful | Your story got the entire three-hour slot, five imagined evenings in a row. At that rate, the calendar needs a bookmark. |
| Dillard [0,0,6] ×5 | 113 | 96 | warm | No footnote, no apology: in this imagined timetable, rest gets a full chapter of its own. |
| Dillard [3,1,2] ×5 | 110 | 97 | contemplative | A story, some messages, a little rest. This imagined evening isn't a solo; it's a small ensemble. |
| Epictetus offer→space | 93 | 104 | provocative | You can offer the apology. You cannot reach over and write the other person's answer. |
| Epictetus space→space | 113 | 108 | warm | Not every silence is a verdict. In this imagined exchange, the other person still gets to choose what comes next. |
| Kierkegaard move→hard hours→continue | 114 | 117 | contemplative | The difficult hours arrived after the job started. The offer didn't come with a preview of that chapter. |
| Kierkegaard stay→wonder→reflect | 116 | 117 | provocative | The job you didn't take gets no bad Mondays in this story. Unwritten futures enjoy that privilege. |

These descriptions are candidate copy, NOT founder-approved golds, and their emotional effects have not been validated with humans. Some endings remain safe but predictable, and v2 does not substantially reduce word count relative to 80–120. This is a serious editorial product gap even when automated tests pass.

## 6. RED-first defects and regression evidence

1. Forged quotation and missing contrasting eligible tone on same Dillard full-writing path: committed two failing independent assertions after the first implementation. RED workflow for commit 25c7e4bb7c4be7e25d5776fcad10565e7e38a59a: 116/118 passed, two failed. Subsequent source-witness revalidation and alternative contemplative angle restored green.
2. Unsafe final-line insertion with retained evidence IDs and swapped creative brief: RED commit a5b8f68f49d0453546342bca917e5bc0f30e2314; 118/120 passed, two failed. Corrected by validating the exact composer output and recomputing the deterministic creative brief. These are test-authored negative reproductions, NOT unseen independent holdouts.

3. Full generated-text editorial review caught an ungrammatical Kierkegaard sentence in Section II on both tested paths. RED commit 0f90948ce61e1e30b68882eaa4c4452dcaa36ab4: 120/121 passed, one failed. Shared grammatical repair then passed. This is a readability correction, not a change to philosophical evidence or the source claim.\n\nNo legacy source, kernel, witness registry or v1.9.6 test was weakened to make these tests pass. Final exact-SHA green results are to be verified in PR #176 workflow following the last source/document commit.

Reproduce locally in a checkout of the PR branch:

    node --test tests/encounter-v20.test.mjs
    node --test tests/scenario-transfer-v02.test.mjs tests/encounter-v1.test.mjs tests/kernel-v11.test.mjs tests/semantic-v12.test.mjs tests/semantic-v18-holdout.test.mjs tests/semantic-v19-transition.test.mjs tests/semantic-v19-transfer.test.mjs tests/semantic-v19-admission.test.mjs tests/semantic-v19-expression.test.mjs tests/semantic-v19-smith-source.test.mjs tests/semantic-v19-frozen-holdout.test.mjs tests/semantic-v19-reasoning-lane.test.mjs tests/cz13-acceptance-matrix.test.mjs
    node scripts/build-encounter-v1.mjs --check
    node scripts/build-encounter-v20.mjs
    node scripts/build-encounter-v20.mjs --check
    npm install --no-save --package-lock=false playwright-core@1.56.1
    node tests/encounter-v20-browser.mjs

## 7. Internal editorial review and outstanding gates

Internal preliminary marks (not actual novice scores; 1 = weak, 5 = strong):

| Proof group | Immediate clarity | Philosophical value | Expressive effect | Path specificity | Memorability | Concern |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Dillard | 4 | 4 | 3 | 4 | 3 | reservation image repeats established motif, still more description than genuine humor |
| Epictetus | 4 | 4 | 4 | 4 | 4 | sharper apology line; warm no-apology path may read as a truism |
| Kierkegaard | 4 | 4 | 3 | 4 | 4 | perceptive contrast, but explanation is still long for a newcomer |

Scores are editorial hypotheses by the implementation pass, not independent blind QA. No verified reader comprehension, amusement, delight or 24-hour recall. A human editor should inspect whether Section II paraphrases are faithful to source, not merely syntactically grounded to a provisional source contract.

External gates required before broader approval:
- CZ-121: qualified philosophical source/translation and historical context review (open).
- CZ-125: at least 5 genuine first-time readers, verbatim understanding/reactions/clarity+enjoyment scores, consented 24h recall (open).
- CZ-126: physical iPhone Safari and VoiceOver (open).
- CZ-123: independent QA reviewer must inspect exact final SHA, run holdout paths and review generation/DOM artifacts; the implementing lane cannot self-certify.

## 8. Scope, cost, dependencies and release

No subscriptions or model inference; deterministic JavaScript. No database changes, new personal tracking, cookies, My World storage, backend/API, production app modifications or deployments. GitHub Actions runner use is the only automation footprint. Existing source models, context Atlas and production UI remain untouched.

Implementation caveat: this is a bounded seven-path **isolated research proof**, not a replacement for the full three-stage interactive production Encounter. It uses the old source admission and an explicitly small curated rhetorical opportunity set. It cannot generalize humor quality, solve original-source scholarship, establish human enjoyment, or certify actual iPhone accessibility. Future UI integration, expanded Atlas publication and shorter word policy each need separate review and approval.

Implementation verdict: PARTIAL overall / isolated engineering proof ready for independent candidate review IF exact final CI is green. Production: NOT AUTHORIZED.


---

## 9. CZ-127 P0 independent QA corrective round — v2-only, exact-case boundary

**Original QA reference:** `7e94d38cc0b4d86f803b58aec410e4710ca43587` (initial proof). All corrective changes remain stacked in draft PR #176 and DO NOT change `reasoning-kernel-v11.js`, `semantic-reasoning-v12.js`, `semantic-cases-v12.js`, the original 80–120 word limit or production application state.

### 9.1 RED-first defects and fixes

- RED `71f7086454593135c244aa0ad47fb2c95cd6b009`: **121 passed / 4 failed** of 125 Node assertions. The four deliberate failing test groups were (1) available versus allocated slots, (2) forged output author, (3) null/malformed strategy-brief exceptions, (4) descriptive, emotionally flat endings.
- **Important frozen contract:** the original Dillard scenario uses `type:"exact"` for its six half-hour slots. The original kernel correctly rejects [2,0,0], [0,0,3], [0,0,0] with budgets [6]. A new v2-only `withPartialScheduleCapacity()` returns a fresh cloned scenario using the existing kernel's supported `type:"cap"`, without modifying or weakening the original context. Original strict scenario remains strict.
- In the v2 evidence adapter, explicit fields `allocation.per_interval_available_slots`, `allocation.per_interval_allocated_slots`, `allocation.per_interval_unallocated_slots`, and corresponding total slots distinguish the scenario's full allowance from assigned uses. All three amounts must reconcile across recurrence, arithmetic and the unchanged kernel's `structure`; inconsistent packets are rejected.
- The deterministic strategy policy now gates whole-evening metaphors on `totalAllocated === totalCapacity`, with separate partial-writing, partial-rest and zero-allocation angles; unallocated does not imply any particular hidden activity.
- The output validator requires exact author match together with quote/source URL/warrant/provisional review status. All nested fields of the Emotion Strategy creative brief are type-checked before any evidence-ID lookup; missing/null/typed-wrong data is declined with `needs_editorial_review`, never a TypeError.
- Sections II/III were rewritten for a more legible source-grounded explanation and distinct closing images. All outputs continue to be bounded to three sections and the frozen word policy; free-form input or model-generated copy is not introduced.

### 9.2 Four-capacity numerical regressions (five **imagined** evenings)

| Allocation (slots per evening) | Available / allocated / free each evening | Hours each evening | Five-evening totals | Valid ending class |
| --- | --- | --- | --- | --- |
| [2,0,0] | 6 / 2 / 4 | 1h writing, 2h unallocated | 5h writing; 10h unallocated | partial-writing-window (not whole evening) |
| [0,0,3] | 6 / 3 / 3 | 1.5h rest, 1.5h unallocated | 7.5h rest; 7.5h unallocated | partial-rest-window (not whole timetable) |
| [0,0,0] | 6 / 0 / 6 | 3h unallocated | 15h unallocated | repetition-neutral |
| [6,0,0] | 6 / 6 / 0 | 3h writing, 0h unallocated | 15h writing | schedule-booked full-evening control |

For each partial example, genuine original v1.9.6 output is **NOT APPLICABLE**, rather than being silently generated under a different original scenario. The v1.9.6 seven-path baseline comparison remains exact and unchanged. The generated comparison archive includes eleven full paths: seven original + four capacity tests.

### 9.3 Editorial alternative catalogue — NOT production strings

These are bounded **candidate closing-line alternatives**, not added runtime claims or interchangeable style labels. Each is paired with the same path-specific hypothetical evidence, a provisional source warrant and its intended (not proven) emotional effect. Word counts use the existing whitespace-separated word counter. An independent editor must evaluate accuracy and genuine reader impact.

| Path / option | Proposed tone | Words | Evidence IDs | Intended effect | Candidate last line |
| --- | --- | ---: | --- | --- | --- |
| Dillard: full writing · 1 | playful | 17 | `meaning:central, choice:0, source:central` | Understated calendar humor | “Five evenings, one standing appointment: your story. The imaginary calendar might as well come with a bookmark.” |
| Dillard: full writing · 2 | playful | 20 | `meaning:central, choice:0, source:central` | Absurd but bounded reservation metaphor | “Your story has booked every seat at the evening table. Across five imagined nights, even the clock knows the plot.” |
| Dillard: full rest · 1 | warm | 17 | `meaning:central, choice:0, source:central` | Rest as an activity rather than a deficit | “For once, rest isn't squeezed into the margins. In this imagined evening, it gets the whole page.” |
| Dillard: full rest · 2 | warm | 17 | `meaning:central, choice:0, source:central` | Quiet worth without diagnosing motivation | “A whole evening of rest is still an evening with a shape. It doesn't need a punchline.” |
| Dillard: balanced · 1 | contemplative | 18 | `meaning:central, choice:0, source:central` | The plurality of time uses becomes image | “Writing, messages, and rest share the imaginary evening. No single one can claim to be the whole story.” |
| Dillard: balanced · 2 | playful | 17 | `meaning:central, choice:0, source:central` | Everyday ensemble rather than heroic winner | “No star of the show tonight: writing, messages, and rest all have lines in this imaginary scene.” |
| Epictetus: space without apology · 1 | warm | 18 | `meaning:central, choice:0, source:central` | Silence is not a verdict on another person | “The empty line is not an ending. In this imagined exchange, the other person still owns their reply.” |
| Epictetus: space without apology · 2 | provocative | 18 | `meaning:central, choice:0, source:central` | Selected restraint cannot determine another's understanding | “You can choose not to send another message. You can't choose what the silence means to someone else.” |
| Kierkegaard: move, harder hours · 1 | contemplative | 21 | `meaning:central, choice:0, imagined:0, source:central` | Future cannot provide advance spoilers | “The hard hours show up after the choice. It is a little late for the job offer to include a spoiler.” |
| Kierkegaard: move, harder hours · 2 | contemplative | 18 | `meaning:central, choice:0, imagined:0, source:central` | Separates chosen lived route from unknowable other route | “The job gave you harder hours after you arrived. The route you didn't take still has no timetable.” |
| Kierkegaard: stay, wonder · 1 | provocative | 19 | `meaning:central, choice:0, imagined:0, source:central` | Unlived alternatives escape ordinary friction | “The road not taken has no potholes in this story. That is not evidence it would have been smoother.” |
| Kierkegaard: stay, wonder · 2 | contemplative | 18 | `meaning:central, choice:0, imagined:0, source:central` | Unwritten chapter versus later interpretation | “You can keep rereading the offer. The unchosen job will never send this imaginary story a progress report.” |

The educational sections still derive from the curated source admission and retain explicit hypothetical boundaries; these closing-line alternatives **cannot be promoted by substituting them into the output** without updating the bounded composer and rerunning source/word tests. Human response, novelty and retention have not been demonstrated.

### 9.3a Follow-up readability RED→GREEN

- After the 125/125 corrective tests passed, a full generated-output inspection found the grammatically incorrect partial sentence “2 hours stays unassigned”, and Section I did not make the per-evening assigned duration obvious. RED `d685a4cb5bb0ad85bdde4c7f1b8ac2b696bf1953`: **125/126 PASS, 1 FAIL**. Scope-limited correction `9c85dc487451cd9dd8dc7f0dd6e9db01fa253b6c` now presents **each evening** (1h writing + 2h free; 1.5h rest + 1.5h free; or 3h all free), plus exact five-evening totals and a hypothetical-life qualification. The same kernel/source/word policy remains frozen.
- Following regeneration, **126/126 Node** and **44/44 Chromium path×viewport journeys** passed in the isolated research workflow; strict checked-in HTML/JSON **pre-build** parity is restored for the final exact-SHA run. The frozen original Encounter browser regression and other workflow gates are independently verified on the final SHA rather than inferred from earlier versions.

### 9.4 Actual seven-path before/after and expanded proof

The canonical 11-path full-text output, exact v1.9.6 baseline where supported, each v2 Section I/II/III, individual word counts, selected strategy, selection_trace, grounded evidence IDs and provisional source status are in the *source-generated* `design-review/encounter-v20-comparison.json`, committed with the matching `experiments/encounter-v20-proof.html`. `scripts/build-encounter-v20.mjs --check` must pass **before** any rebuild in CI, detecting stale checked-in artifacts. Browser checks cover all eleven path choices at four viewports (44 journeys) plus original Encounter browser regression. Run `node scripts/build-encounter-v20.mjs --check` and the existing test commands from section 6.

**Internal editorial observations:** Dillard's new payoff is more concrete and shorter; rest has no insinuation of laziness; Epictetus's silence is not treated as accomplished communication or proof of forgiveness; Kierkegaard's late information is distinguished from counterfactual fact. The still finite curated angles can become predictable across more unseen inputs and are not a generalized emotional storytelling system. Some messages still spend substantial words explaining model boundaries, so founder-led acceptance of a future shorter (suggested 60–95 words) editorial policy should be a separate versioned decision, not a silent replacement.

**Next gate:** CZ-123 independent reviewer must run fresh unseen tests, read the actual 11-path HTML/JSON, assess all source claims and character/agency boundaries, and issue a separate PASS/FAIL. CZ-121 scholarly source confirmation, CZ-125 genuine novice readers + 24-hour recall, CZ-126 physical Safari/VoiceOver and founder approval remain **UNVERIFIED**.

**Release:** DRAFT / NO MERGE / NO DEPLOY / NO DATABASE OR USER-DATA CHANGE / NO PAID INFERENCE.
