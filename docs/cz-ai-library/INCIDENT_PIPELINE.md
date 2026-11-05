# CZ AI Incident → Lesson Pipeline v1

**Operating mode:** event-driven candidate drafting, zero Kimi/model calls, founder approval before any lesson is accepted. Current source: **OWEF/Yourlogos**, on the GitHub `main` push event following a merged fix PR. Current scope intentionally excludes purely Railway/Linear incidents and private TrendForge data until a separate, audited connector exists.

## What happens automatically

1. A PR with title `fix(...):`, `hotfix(...):`, `bugfix(...):` (or their unscoped equivalents) is merged into the default branch through GitHub.
2. `.github/workflows/cz-ai-lesson-pipeline.yml` runs a **read-only** inspector on the exact merged commit. It refuses unmatched PRs, features, unmerged fixes, fixes without a source-code change AND changed regression test, and PR heads without a completed successful test/check CI. It also refuses any observed failed CI check.
3. If eligible, a deterministic script summarizes public PR metadata and redacted evidence into a **candidate**, never an approved lesson. It does not invent a root cause if the PR lacks one. Missing context stays explicitly unverified.
4. An isolated scoped writer receives only the validated artifact, creates `automation/cz-ai-lesson-pr-N`, and opens a **draft PR** with a candidate under `docs/cz-ai-library/candidates/`. The draft is not in `lessons/INDEX.md` and **cannot be retrieved by Kimi**.
5. ChatGPT's separate CZ AI Lesson Approval Watch checks for new candidate PRs and notifies the founder if enabled. GitHub PR notifications remain a fallback. The watch is periodic, not instantaneous; GitHub draft creation itself is event-driven.

## Founder decision and promotion

The founder can say in ChatGPT: **Approve lesson #N**, **Revise lesson #N**, or **Reject lesson #N**. The coordinator uses the connected GitHub tools; the founder never needs to author Markdown or edit the GitHub repository.

An **approval is permission to perform the independent QA and promotion process**, not permission to merge unknown content. Agent C or an independent reviewer must inspect the original fix and changed tests, verify the root cause versus hypotheses, examine code/negative cases, and check public-data sanitization. If evidence is insufficient, request revision or hold; do not self-certify.

For an accepted lesson, revise content into a **final** `lessons/<id>.md`, set the truthful evidence level (e.g., `ci-verified` only with demonstrated before-fail/after-pass), update `lessons/INDEX.md`, run the library validator, review the diff, and merge with founder authorization. The candidate is archival, not authoritative. Only indexed accepted lessons participate in future agent retrieval.

## Guardrails

- Only the actual merged source PR's public data is summarized, with conservative token/email redaction. No private notes or user data.
- The workflow uses an exact trusted main-branch checkout and no code from unmerged PRs. The read-only inspector has no GitHub write permission. The separate writer can only stage a candidate draft PR; no release or model key.
- No automatic merge, auto-approval, automatic retries, Kimi invocations, cloud agents, changes to trading/reliability services, or billing changes. Normal running product builds are unrelated.
- GitHub-created draft PRs may need an additional human CI-approval step; if so, that is **not** authorization to bypass required checks.
- A candidate proves the source PR was merged with CI evidence; it does **not** prove that a fix was effective in production.
- Existing historical incidents are not backfilled by this hook. One-time backfills and private-project adoption require separately scoped review.

## Minimal fix-PR evidence template for future specialists

Include these sections when writing an actual bug fix:

```markdown
## Root cause
What the evidence establishes (and what remains uncertain).

## Regression test
Exact changed test file and demonstration of failure before / pass after.

## Verification
CI result, source SHA, limits of manual or production verification.

## Rollback
Precise reversible recovery steps.
```

The producer need not manually create a library entry. The after-merge hook evaluates eligibility and drafts it. The founder receives a concise approval request; approval is never implied by silence.
