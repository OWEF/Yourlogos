# CZ-127 / CZ-123 — Final source-integrity corrective handoff

Baseline: PR #176 at bf8d448b6384337993f28ce2017ecbbde9277ca3.
Candidate: draft PR #176, branch feature/cz127-encounter-v20-proof. Use its final exact HEAD for independent re-review.

## RED-first evidence

- Commit 01516f2c1ebb2ae1d98d4de9c39ec98518ab2545: 126/129 Node pass; three intentional failures: Dillard author substituted with Adam Smith or blank, renamed weekly activities, reordered session activities. GitHub Actions run 43627639057.
- Commit 408ec78d3766abf891f7c4d6a197a3d1bf6554ab: 129/130 Node pass; stale Dillard reading label after selected activity was renamed. GitHub Actions run 43628083148.
- Correction: v2-only editorial ledger binds source URL, author and validated claim kind before a reasoning packet is admitted; mismatched authors and stale source-reading aliases abstain. No legacy kernel or passage-witness changes.

## Proof of varied input correctness

In the v2 intermediate layer, the original curated evening-specific rhetorical angles are eligible only for matching source-grounded activity names, order and evening period. Other valid recurrences use a separate evidence-based contemplative strategy using the actual selected labels and repetition period. The render may return needs_editorial_review if its source or word bounds cannot be maintained.

- Renamed weekly example: labels training, visiting family, resting; 5 weeks; six available half-hour slots/week, two assigned to training. Section I: "Across 5 imagined weeks, the plan assigns 5 hours for training. Each week has 3 hours available: 1 hour assigned and 2 hours unallocated. This is hypothetical, not your actual routine."
- Reordered session example: labels resting, training, visiting family; 5 sessions; six slots assigned to resting each session. Section I: "Across 5 imagined sessions, the plan assigns 15 hours for resting. Each session has 3 hours available: 3 hours assigned and 0 hours unallocated. This is hypothetical, not your actual routine."
- Stale alias: selected activity Train while the packet still describes writing your story; v2 returns needs_editorial_review.

The two full three-section examples are in the final CZ127-VARIANT GitHub workflow log records. Source records remain curated_provisional, not qualified scholarly approvals.

## Scope and verification

The existing eleven-path proof HTML and comparison JSON are intentionally byte-identical: original inputs and outputs are unchanged. The CI generator runs --check before and after regeneration, confirming the committed artifacts match the current source. No extra philosopher, mechanic, production UI, database change, or paid inference.

Independent CZ-123 re-review must inspect the exact HEAD SHA, rerun Node and browser tests plus source parity, verify author-mismatch rejection and scenario variations, and separately assess source scholarship, genuine novice-reader reactions and real Safari/VoiceOver. Engineering CI is not founder acceptance.

NO MERGE. NO DEPLOY. NO PRODUCTION RELEASE.


## CZ-123 independent work-title holdouts: versioned v2 metadata contract

Test-only PR #177 added six independent tests to the existing suite. Its failure, [Actions 43629006899](https://github.com/OWEF/Yourlogos/actions/runs/43629006899), found 134/136 passing and two cases still falsely READY:
1. Dillard packet with `source.work = "The Wealth of Nations"`.
2. Dillard packet with `sourceAdmission.sourceWork = "The Wealth of Nations"`.

All six original independent tests were copied unchanged into PR #176; the correction is confined to the v2 evidence-admission layer and test coverage. RED commit `e41804c70a2b29b3be069c7cbd1327feba6f1b13` reproduced 134/136 in the PR #176 CI. Two supplementary work-identity tests separately cover legitimate variants and unsupported/spoofed work labels.

The source-linked contract `SOURCE_WORK_IDENTITY_V20.version = "source-work-identity/2.0.0"` binds source URL, author, meaning kind, canonical work, and an explicit list of accepted work-title / excerpt-metadata labels. Both existing packet fields must independently identify the admitted work. They may use **different authorized labels for the same work**. Whitespace and Unicode compatibility forms are normalized; arbitrary titles, foreign works, missing values, or unverifiable claims of scholarly approval are rejected.

| Existing curated URL identity | Canonical work | Explicitly accepted work-title / excerpt metadata |
| --- | --- | --- |
| Annie Dillard | The Writing Life | The Writing Life; The Writing Life (excerpt); The Writing Life (excerpt; source review pending); The Writing Life (1989), scheduling passage; The Writing Life — scheduling excerpt |
| Epictetus | Enchiridion | Enchiridion; The Enchiridion; Enchiridion · §1; Enchiridion · §1, Elizabeth Carter translation; Enchiridion (§1; Elizabeth Carter translation) |
| Søren Kierkegaard | Journal JJ:167 | Journal JJ:167; Journal JJ:167 (shortened quotation); Journal JJ:167 (wording review pending); Journal JJ:167 (shortened quotation; wording review pending); Journal JJ:167 (1843), shortened variant |

This is a **provisional editorial identity contract**, NOT independent primary-source scholarship, approval of a historical attribution, or a newly published source dataset. A future legitimate label not currently recognized must be explicitly reviewed and added to the versioned contract; the renderer abstains rather than guessing.

This remediation does not modify the frozen v1.9.6 reasoning kernel, source witness, approved claim content, expression text, existing eleven output paths or word policy. The committed HTML and JSON remain intentionally unchanged and are regenerated and checked for source parity in CI. CZ-121 scholarly attribution, CZ-125 actual reader trials, CZ-126 physical Safari/VoiceOver and CZ-123 independent exact-SHA acceptance remain separate gates.

NO MERGE / NO DEPLOY / NO PRODUCTION RELEASE.
