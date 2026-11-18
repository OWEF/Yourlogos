# CZ-155 R2 / CZ-147 transfer — frozen implementation handoff for independent CZ-154

**Date:** 2026-11-18. **Scope:** isolated PR #247, still draft and unmerged. **Status:** engineering proof complete at the preceding tested code tree; independent QA NOT STARTED; founder acceptance PENDING. **Exact final review SHA** must be obtained from [PR #247](https://github.com/OWEF/Yourlogos/pull/247) and matched against the final 10/10 CI commit before activating independent cases. Do not treat a branch name, this document's creation time or any prior SHA as sufficient.

## Freeze contract

| Boundary | Frozen version / fingerprint | Invariant |
| --- | --- | --- |
| Event ledger | `encounter-events/1` | One action, one independently authored external observation, optional second action; exact-key, ordered, origin-checked replay and idempotent duplicate request |
| Unfinished tab draft | `b27-session-draft/1` | `sessionStorage` only; requires current source-version hash; tampered facts/observations cleared; completed result not saved until explicit My World save |
| Shared reasoning, Emotion and Expression | `universal-three-engine/1.0.0` | No philosopher-name or ID-specific interpretation logic. Emotion is a chosen rhetorical policy, not a reader emotion inference |
| Existing B2.7 route | `quote-direct-source-bound/2.7.0` | Ordinary admission decisions unchanged; no editorial override |
| Epictetus E0 author record | `cz155-author-proof/1` | Source ID 47, Long §1, source/edition tuple byte-for-byte unchanged |
| Epictetus Director | `public-laughter/1` | `agency_vs_external_reply`, three first decisions × two second decisions, independent no-reply and six path-specific histories |
| Epictetus source fingerprint | `sha256:ec8151dea768086b3355deecd050ebaafc2554109c0426c7257e06d5c4e35a42` | Server returns as sourceVersionHash; changing source must invalidate former draft |
| Epictetus scenario fingerprint | `sha256:25f665a4ba968eb1578e6e52922e206f42541a71375b74a4290106f78dcf1222` | Canonical source/choice replay |
| Emerson author record | `cz147-emerson-director-transfer/1` | Inherited ID 55, first-series *Self-Reliance*; opted-in author preview only, not a revised ordinary authoring record |
| Emerson Director | `last-bus-present-judgment/1` | `independent_judgment`, first public support, independent neighbor evidence, same public final words and two *selected* grounds |
| Emerson source fingerprint | `sha256:4aea30f0a30559b4d34d52e7e2159378c1db4d0b311ca958f4696afde503d84b` | Server sourceVersionHash after exact final source-authoring edits |
| Emerson scenario fingerprint | `sha256:6197a401ef09e6a0102c01eb8def3ab24a3c534e40f82623543554f73f2b9148` | Scenario provenance; order/recap variants must recompute fingerprints |
| Expression policy | `compact 40–65`; `full 80–120` words; **three sections** | Compact minimum section words [1,1,9] and maxima [48,65,26]; full minima [10,18,9], maxima [48,65,26]. Fail closed to `needs_editorial_review` if semantic qualification would be lost |

These values are from the final pre-handoff developer artifact's **computed** JSON, not assumed from source names. Reconfirm hashes against the independent check's exact SHA; re-freeze on any code or authoring modification.

## Files added/changed since the E0 baseline

**Stage A only:** `b27.css` adds 18px reconsideration question-to-card spacing, retaining keyboard focus outline, reduced motion, 44px+ targets, existing Waterline; `tests/yl-cz155-app-browser.test.mjs` synchronizes to *actual* Director readiness rather than shared `.b27-situation` loading markup, and adds nine isolated clean browser sessions (three each: valid draft, externally forged event, stale source hash) plus six width/motion combinations × before/after refresh.

**Stage B only:** `experiments/yl-cz155-emerson.mjs` adds one source-authored fictional scenario and explicit reason-bound `decisionWarrant`; `experiments/yl-cz155-pilot.mjs` adds the second editorial record to an existing opt-in registry and makes eligibility data-driven by that registry's IDs; `tests/yl-cz155-emerson-transfer.test.mjs` proves same final utterance/different selected reasons, correct warrants, correct word policy, order/recap irrelevance, source substitution, replay and stale command rejection; `tests/yl-cz155-emerson-browser.test.mjs` traverses the *actual unseeded mobile feed* to inherited Emerson ID 55 and runs both actions end to end. `docs/cz155/emerson-transfer-dossier.md` records source witness, philosophical qualification and excerpt punctuation caveat.

**Bespoke philosopher-specific runtime branches added: 0. Shared Director/Reasoning/Emotion/Expression changes in Stage B: 0. New family, LLM, memory system, service and database migration: 0.** All differentiated meaning is authored in versioned, immutable data interpreted by the same engine.

## Source-authoring instructions to hand to an independent reviewer

1. Preserve the exact tuple `quoteId + quoteText + quoteAuthor + quoteWork + source referenceUrl` and the named edition. A development proof does not change the catalogue's publication status. **Epictetus #47** is a Long §1 inherited excerpt; **Carter-labelled #92** remains a separate development-only quotation; **Emerson #55** is an inherited truncated excerpt whose period normalizes an 1841 printed comma. An accountable editor must rule on this last discrepancy before publication.
2. Provide an explicit `philosophicalOperation.kind`, `source.warrants`, evidence IDs, central thesis, human tension, counterexample, epistemicLimits, compactLimit, prohibitedInferences, supportedConclusions and a falsifiable analogy boundary. The source does not authorize a diagnosis of real people, success forecasts or a scored best choice.
3. Author one versioned Director `scenario` with `openingChoices`, a deterministic `externalEvent` whose origin is `independent_fiction`, `followUps`, and enumerated participant-owned `selfFacts`. Only the participant's **literal selected action** may establish those selfFacts. The event may establish external fiction, never the reader's intention, forgiveness, an unobserved outcome or a hidden motive. Store and verify both `sourceFingerprint` and `scenarioFingerprint` using `fingerprintB25`.
4. Express the reason with a source-bound `decisionWarrant`: `fact`, optional `oppositeFact`, `warrantId`, established/outstanding inferences, an authentic closing question, and an allowed Emotion strategy. `refinements` may attach additional *non-overlapping* `factsAll`/`factsAny` to path-specific source warrants. The generic validator rejects unknown, overlapping and unsupported fact rules. Do not insert surname checks, invented motivational diagnoses or presentation-only unique endings.
5. The response must preserve the exact stage and quote identity in the three-engine packet, meet both word policies, and keep residual obligation or source uncertainty. The normal alternative for incompatible or missing evidential support is **no-fit / needs-editorial-review**, not a substitute puzzle, unrelated quote, fabricated justification or runtime LLM.
6. **Blind-to-recap comparison:** hide Section I (choice echo), compare Reasoning selectedClaim, Emotion policy, Section II and final question. Equivalent philosophical facts should give the same interpretation; different expressly established philosophical reasons should differ even for identical public words. Changing option ordering, cosmetic labels or equal-length recaps must not change claims or questions.

## Demonstrated developer-side evidence — not independent acceptance

- **Stage A exact engineering SHA `95702ed8039a7e7358eb57f67d037bb4e5d52387`:** [CI run 44308164357](https://github.com/OWEF/Yourlogos/actions/runs/44308164357), [artifact 14428857579](https://github.com/OWEF/Yourlogos/actions/runs/44308164357/artifacts/14428857579). 10/10 CI; 16/16 CZ-155, 54/54 legacy semantic/storage/family, 2/2 older browser; 9/9 clean-session draft recovery checks and six width/motion combinations × pre/post reload. Baseline 390px screenshot reveals question/focus-ring collision; new 320px, 390px, 430px images demonstrate clearance.
- **Stage B validated code SHA `04a3219b03a7b55492d9f346fc9bf73c0fa98da6`:** [CI run 44310994022](https://github.com/OWEF/Yourlogos/actions/runs/44310994022), [artifact 14430771654](https://github.com/OWEF/Yourlogos/actions/runs/44310994022/artifacts/14430771654). 10/10 CI; **21/21** CZ-155 and Emerson assertions, 54/54 legacy, 2/2 older browser. Artifact: full/compact Epictetus six-path JSON/Markdown; Emerson `emerson-two-paths-literal.md`, `emerson-two-paths.json`, real mobile emulator feed, shared public action, both rendered endings, current-date reading-first screenshot, 320/390/430 focus captures and nine-session recovery JSON.
- Emerson compact totals **60** (merits) and **56** (public image); full totals **105** and **119**. Same final literal public statement. Reasoning chooses a different explicit-warrant claim; Emotion strategies `revisability` vs `choice_awareness`. Order and incidental recap variation do not change Section II or III.
- Earlier failing run **44267832844** was a test readiness race: `.b27-situation` is both a loading and initialized class; `game` could legitimately be null while source loaded. Replacement waits for the verified state. **No persistence backend defect was established.** The new tests also reject modified external event payloads and mismatched hashes.
- **Known out-of-scope mobile observation:** the global page at 320px can have horizontal scroll outside the Director shell. The scoped R2 CSS asserts no Director child extends beyond the viewport; it does not claim all global layout overflow has been eliminated.

## Independent CZ-154 work plan — cases remain sealed

**Important: STOP at the handoff boundary.** The three sealed cases have NOT been created, revealed, used in development or pretested here. Assign a separate independent reviewer. They must source their own sealed fixtures and only then record each one under an immutable case ID. Once disclosed, a case is no longer unseen holdout evidence.

Categories to evaluate without revealing specific content in this document:

- **Complete compatible:** independently sourced quotation and complete authentic contract → appropriate philosophical operation and warranted, readable output.
- **Compatible but missing prerequisite:** correctly request the specific missing source/context/contract metadata. Do not masquerade a metadata request as a complete success or silently fill gaps.
- **Incompatible:** justified no-fit/refusal that names the unsupported operation or unreliable attribution without substituting a theme-adjacent story.

Separately replay Epictetus six canonical paths; compare Emerson same-act/reason-divergent paths with their source warrants; tamper action origin, version, observation, unchosen future and response; verify compact/full qualification retention and source substitution refusal; perform 320/390/430 browser, keyboard/reduced-motion and physical-device accessibility checks; verify Go Deeper, My World save/readback/delete and preserved Like; rerun four-family/Dillard/Kierkegaard and route tests.

**Required independent report:** separate denominators for (A) successfully covered compatible cases, (B) justified prerequisite/metadata requests, (C) justified incompatible no-fits/refusals, (D) incorrect ready results, (E) incorrect refusals, (F) UI/accessibility failures. Record exact code SHA, source fingerprints, all prompts/inputs and provenance of each case; label disclosed cases as non-holdout thereafter. Do not extrapolate from one successful case to source generality or human comprehension.

## Remaining founder/product gates

The two-path Emerson fiction is editorially constructed, **not** an external independent scholarly approval of first-edition quotation, argument mapping or policy analogy. External source review and exact quote #55 punctuation decision are outstanding. Physical Safari/VoiceOver/touch hardware and first-time unaided human learning plus near/delayed transfer **NOT TESTED**. Existing Railway staging still tracks earlier code, and this SHA has no new Railway live preview validation. No merge/deploy/publication/paid action permitted.

**Verdicts for engineering handoff:** Engineering PASS (scoped, exact CI); philosophical fidelity **REVISE** (provisionally source-bound; independent scholarly review and quote punctuation open); human learning **NOT TESTED**; founder acceptance **PENDING**. No overall production PASS or authorization.
