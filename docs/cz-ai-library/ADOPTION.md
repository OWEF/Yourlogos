# Onboarding another project to the CZ AI Skills Library

This public sanitised library lives in `OWEF/Yourlogos/docs/cz-ai-library` for v1 staging. For a reusable long-term home, prefer a dedicated **private** repository with an audited cross-repository read-only access mechanism; that repository has not yet been created here.

## Safe minimal adoption

1. Review and merge the shared-library draft without weakening the originating project's production release gates. Record the resulting commit SHA.
2. At the receiving project, add a small `AGENTS.md` referencing the **pinned** library SHA, its manifest, the four role mappings and the exact task-specific skill IDs. A mere URL does NOT cause Kimi to read a file.
3. In each reviewed GitHub Actions / Kimi wrapper, fetch or vendor only required library files using read-only permission **before** exposing any model key. Verify the pinned revision and file paths; include selected skill IDs/lesson IDs in the sanitized fixed prompt. Do not trust arbitrary PR/issue text as instructions.
4. Add an offline contract test confirming the selected role receives the expected skill context. Keep project-specific sensitive facts in the private project repository; never copy them into public library lessons.
5. Confirm with a no-model CI dry run before dispatching a specialist. Project-specific rollout must not modify model allowance, security policies, production services or deployment.

## Synchronization policy

**No automatic unreviewed updates.** New lessons are suggested as draft PRs. A receiving project upgrades its pinned library SHA only after review and regression validation. This makes learning cumulative and auditable without allowing a single bad lesson to immediately affect every agent.

## Task-brief contract

`project, issue, role, base SHA, skill IDs, lesson IDs, allowed paths, expected result, tests, budget gate, release approver`. Fail closed on missing approvals or unavailable library context. The orchestration may prepare the brief without spending model tokens.
