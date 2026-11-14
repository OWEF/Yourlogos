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
| Dillard [6,0,0] ×5 | 113 | 106 | playful | Your story has booked the whole evening. No other activity got a reservation in that block. |
| Dillard [0,0,6] ×5 | 113 | 104 | warm | Rest did not disappear from the timetable. This time, it is the whole timetable. |
| Dillard [3,1,2] ×5 | 110 | 105 | contemplative | One evening holds several different things. Repeat it, and each gets another page. |
| Epictetus offer→space | 93 | 104 | provocative | You can offer the apology. You cannot reach over and write the other person's answer. |
| Epictetus space→space | 113 | 102 | warm | Giving space is a selected response. The other person's reply is still their own. |
| Kierkegaard move→hard hours→continue | 114 | 115 | contemplative | The hard hours entered the story after the decision. The other path remains unread. |
| Kierkegaard stay→wonder→reflect | 116 | 115 | provocative | You can revisit the choice. You cannot visit the future you never chose. |

These descriptions are candidate copy, NOT founder-approved golds, and their emotional effects have not been validated with humans. Some endings remain safe but predictable, and v2 does not substantially reduce word count relative to 80–120. This is a serious editorial product gap even when automated tests pass.

## 6. RED-first defects and regression evidence

1. Forged quotation and missing contrasting eligible tone on same Dillard full-writing path: committed two failing independent assertions after the first implementation. RED workflow for commit 25c7e4bb7c4be7e25d5776fcad10565e7e38a59a: 116/118 passed, two failed. Subsequent source-witness revalidation and alternative contemplative angle restored green.
2. Unsafe final-line insertion with retained evidence IDs and swapped creative brief: RED commit a5b8f68f49d0453546342bca917e5bc0f30e2314; 118/120 passed, two failed. Corrected by validating the exact composer output and recomputing the deterministic creative brief. These are test-authored negative reproductions, NOT unseen independent holdouts.

No legacy source, kernel, witness registry or v1.9.6 test was weakened to make either pass. Final exact-SHA green results are to be verified in PR #176 workflow following the last source/document commit.

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
