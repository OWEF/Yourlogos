# Lesson: Keep optional onboarding replay accessible independently of developer QA flags

- **ID:** 2026-11-07-settings-onboarding-replay-qa-gate
- **Status:** ci-verified
- **Evidence level:** Source-contract regression plus passing GitHub CI; **not** real-device/production-verified
- **Applies to:** Agent A (Frontend/UX), Agent C (Testing/QA); YourLogos browser Settings / onboarding replay flow as of source fix PR #142
- **Source issue / incident:** Returning users could not see Settings' onboarding replay unless URL query `qa=1` or a device-local developer-preview flag was enabled; [source fix PR #142](https://github.com/OWEF/Yourlogos/pull/142), merged 2026-11-07
- **Fix PR / commit:** [PR #142](https://github.com/OWEF/Yourlogos/pull/142), merged commit `b3e755e53130146b8af859bf0cdeabdb14331d2c`; tested PR head `b9f73dfc8b2b3ecbfc3866941ebc324312493659`
- **Independent reviewer / evidence:** 2026-11-07 separate read-only source-contract QA using [pre-fix commit](https://github.com/OWEF/Yourlogos/commit/4248b90d25b16129fbe08dc6755b9b0691bcd158) vs [fixed source head](https://github.com/OWEF/Yourlogos/commit/b9f73dfc8b2b3ecbfc3866941ebc324312493659); independently checked the Settings markup and replay-click handler. Founder authorized promotion of candidate [PR #143](https://github.com/OWEF/Yourlogos/pull/143) subject to verification.
- **Regression test:** `tests/onboarding-login.test.mjs`, especially `Settings always exposes onboarding replay without query flags or developer state`, with pre-fix static source-contract failures and fixed-source pass; [Discover CI #42358959377](https://github.com/OWEF/Yourlogos/actions/runs/42358959377) SUCCESS, [Studio CI #42358959354](https://github.com/OWEF/Yourlogos/actions/runs/42358959354) SUCCESS, [V2.4 CI #42358959378](https://github.com/OWEF/Yourlogos/actions/runs/42358959378) SUCCESS.
- **Sensitive-data review:** Only public application source, test observations, and repository links; no private sessions, account identifiers, credentials, or user-generated reflections.

## Symptoms and preconditions

Returning YourLogos visitors with no `?qa=1` URL parameter and no `yourlogos-developer-preview-v1=on` preference could not open onboarding replay from Settings. The UI offered a replay button only within a conditional **Onboarding QA** block. The click handler separately refused replay when neither QA condition held. Existing saved users were otherwise correctly spared an automatic new onboarding.

## Root cause (versus hypotheses)

**Confirmed source-level cause:** `app.js` used the QA query parameter or local preview preference to conditionally generate the Settings replay section **and** to gate the `qa-replay-onboarding` action. This was a coupling of a benign, user-facing replay feature to a developer/test-only capability flag. The independent before/after source check found `settingsAlwaysDisplayed=false` and `handlerNoQaGate=false` at pre-fix commit `4248b90`, both `true` at fixed head `b9f73df`.

Not established: any separate authentication outage, service-worker caching regression, or production-wide incidence count. The source PR also changed cover art, onboarding screen styling, and service-worker cache version; those broader changes are **outside the verified root cause and lesson scope**.

## Minimal resolution

1. Make **Onboarding & preview** visible in Settings for all visitors, without depending on QA query parameters, previous session state, or developer-preview opt-in.
2. Keep `data-action="qa-replay-onboarding"` reachable and remove the same QA gate from its click-handler branch, which fires `yourlogos:onboarding-replay`.
3. Keep **developer preview** as a separate, clearly labeled device-local preference. The preview flag is **not authentication** and must not grant privileged access.
4. Preserve user data and existing onboarding completion: the onboarding state machine calls `open(true)` for replay; the `finish` path writes the personalization profile only when `!replay`. Cancellation/skip on replay returns without overwriting responses.
5. Add a regression contract asserting that the Settings replay action is unconditional and the handler dispatches without a QA gate, plus a state-machine test that replay completion/cancellation leaves saved guest data unchanged.

## Verification

**Independent source-contract check, pre-fix vs fixed:** The old source still contained the conditional Settings block and early-return handler. The fixed source had an unconditionally rendered replay button, no QA gate in that handler, and distinct developer-preview enable/exit actions. An independent read-only code comparison evaluated those contract conditions against both revisions: the expected checks failed on the old revision and passed on the fixed revision.

**CI:** The changed onboarding regression test was included in the source fix PR, and GitHub reported successful Discover, Studio and V2.4 workflow runs on exact PR head `b9f73df`. Passing automated contracts supports the narrowly scoped source-level fix. No independent physical iPhone Safari validation, installed-PWA cache update validation, live verified-email session journey, or separately audited production outcome was performed for this lesson. Do **not** claim field-verified status.

## Reuse guidance

- **Retrieve for:** User-facing settings/control unexpectedly hidden behind a QA, preview, experiment or diagnostic flag; interaction exists but event handler repeats a stale guard; onboarding replay should not erase established progress.
- **Check both surfaces:** Presence of an accessible control **and** authorization/branching in the event handler. Fixing only one does not restore the journey.
- **Separate concerns:** Distinguish harmless user navigation/replay from developer-only controls and genuinely protected operations. A feature can be user-visible while privileged data/tools remain secured.
- **Do not generalize to:** admin routes, account recovery, editing another user's data, access to private information, or any operation where a real auth/consent requirement must remain. In those cases the guard may be essential.
- **Agent routing:** A handles scoped UI/handler repair. C writes independent failing-before/passing-after contract and state-machine tests. Agent D is not required simply to read this lesson.

## Risk and rollback

Changing visibility could expose a developer-only function if the action is not strictly read-only, so inspect side effects and permission boundaries before removing a gate. Current replay is specified as non-destructive, and local developer preview does not create a verified identity; keep security-sensitive flows separate. A future app refactor should rerun the tests and perform real iPhone checks. If a regression emerges, create a separate scoped fix and consider reverting the relevant PR #142 change with explicit product/release approval; do not silently restore the original broken QA coupling. GitHub `main` changes can trigger Railway deployment, so production rollback and verification require the established release process.

## Supersession / revision history

- 2026-11-07: Promoted from automatically generated, untrusted candidate PR #143 after founder approval and independent source-level verification. Status limited to `ci-verified` pending field validation.
