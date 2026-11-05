# Lesson: Separate model timeout from missing diagnostic artifact

- **ID:** 2026-11-05-ci-timeout-diagnostics
- **Status:** ci-verified (diagnostic workflow only)
- **Applies to:** Agent C and Agent D; bounded GitHub Actions model runners
- **Evidence:** [GitHub PR #135](https://github.com/OWEF/Yourlogos/pull/135), [synthetic dry-run Actions #42004562572](https://github.com/OWEF/Yourlogos/actions/runs/42004562572)
- **Test:** `tests/cz81-e0-diagnostics.test.mjs` (5/5 passed in recorded dry-run).
- **Data policy:** only generic failure pattern and public evidence; no runner tokens, prompts, raw model logs or customer data.

## Symptoms and preconditions
A bounded Kimi illustration job reached its time limit without a usable saved candidate. A subsequent upload step could fail because an expected artifact was absent, obscuring whether the model timed out, errored or finished without saving output.

## Root cause versus uncertainty
**Established instrumentation defect:** treating a missing candidate upload as the primary reported failure masks the worker's earlier process exit reason. **Not established:** why the original model attempt made insufficient progress; the failed run cannot be retroactively diagnosed from missing redacted telemetry.

## Verified safe response
1. Run the model in a bounded wrapper that separately records exit code, duration, progress counts and candidate-presence metadata without logging raw secrets or prompts.
2. Always preserve sanitized diagnostics before applying a separate fail-closed success gate. A hard timeout is not a partial success.
3. Verify the workflow without a paid model using synthetic success/error/no-progress timeout fixtures.
4. If timeout has no saved candidate, **stop**. Do not automatically retry, extend budget, infer a source-art solution or report success.

## Verification and limits
The cited zero-model dry run passed five deterministic tests and a deliberate two-second no-progress timeout exercise; it recorded exit 124 and no candidate. This verifies the diagnostic method only. It does NOT prove that the prior Kimi illustration problem or visual quality was fixed, nor that the PR was merged/deployed.

## Reuse and rollback
Use for GitHub-hosted model tasks with ambiguous timeout/artifact errors. Not a blanket directive to replace other incident handling. Revert wrapper/CI integration if it suppresses actual exit failures, hides useful safe evidence or violates the task's strict allowlist. Model dispatch still requires independent authorization.
