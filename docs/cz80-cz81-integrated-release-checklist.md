# CZ-80 + CZ-81 — Integrated release candidate QA / go-no-go

**Status:** PRE-RELEASE REVIEW ONLY. Main/production is not authorized for changes by this document. The release branch combines CZ-80 PR #130 and CZ-81 PR #131 while the individual drafts remain unmerged. This is not a claim that both issues are Done.

## Confirmed scope
- Original Encounter experience and 91-quote catalogue remain the authority.
- One shared, pure semantic event bus receives valid local and consented AI transitions. The UI's visual beats do not persist records.
- AI errors emit error, not success; My World completion beat is emitted only after the existing real save.
- LilLogo original-art hybrid uses separately addressable face/eyes/lids/forelock and responds to these real events, but is still **provisional art** with masked face/neck seam. No independent arm/scarf rig yet.
- Both preview modes are **OFF by default**. Only explicit query parameters `?cz80=preview&cz81=preview` show the proposed UI/character, after the exact branch is deployed. Normal URLs retain the original mascot.
- The PWA service worker precaches the new JS/CSS imports and the same-origin SVG in release cache v92, preserving network-first code and API/cross-origin bypass. No new Kimi, paid library, remote character asset or backend.

## Automated gates
- [ ] Integrated review branch is a coherent, mergeable PR against current main.
- [ ] Fresh exact-commit Discover/Studio/V2.4 CI passes.
- [ ] Node CZ-80 event tests, CZ-81 controller tests, and **real worker** install/offline cache and API bypass tests pass.
- [ ] Real local mobile Chromium opens the actual Encounter (not an onboarding overlay), chooses a focus and receives the event-driven LilLogo pose.
- [ ] Mocked/consented AI path shows error handling, three-choice insight, and explicit save, with **no remote DeepSeek request** during the smoke test.
- [ ] No new My World entry before explicit save; retry/duplicate saves do not create duplicate records.
- [ ] Browser screenshot shows readable text, controls and character at phone viewport size.

## Human QA that cannot be claimed from headless Chromium
- [ ] Founder compares the original approved LilLogo art (CZ-23) side by side with proposed profile at idle, curious, reflective and completion. Confirm no uncanny hair, eye or face seams.
- [ ] Real iPhone Safari: tap latency, safe area, modal scroll, repeated navigation, background/foreground cleanup, no overheating/constant CPU, focus and VoiceOver.
- [ ] System Reduce Motion ON and OFF while app is open; accessible, understandable feedback without animation.
- [ ] Real offline installed PWA cold/returning startup: query-aware cache fallback, local Encounter with unavailable AI; no stale service worker dependencies.
- [ ] Real AI consented backend path: network failure/429/401, suspended/resumed requests and prompt response; existing consent remains enforceable.
- [ ] Founder explicitly approves the character artwork AND release to production; no silent upgrade of default flags.

## Release and rollback (pending authorization)
1. Retain old PRs #129 (art study), #130 (CZ-80), #131 (CZ-81) as source history; do **not** merge them separately when using the integrated candidate PR.
2. Finish green CI, visual QA and all blocking acceptance tests on one exact release SHA.
3. Obtain a **separate explicit founder decision to merge/release**. Merging to main can auto-deploy Railway even with both flags off; do not imply a draft PR is a deploy.
4. Deploy only from the approved SHA; verify Railway health, PWA service-worker cache transition and a real browser startup after release.
5. If health or regression fails, use the prior known-good commit/redeploy or revert the integrated commit; do not modify customer My World data to roll back an animation.
6. Keep CZ-80/CZ-81 In Progress until founder has verified the integrated experience; if only preview mode is released, label the milestone precisely as preview/pilot.

**Known acceptance blockers as of 2026-11-05:** live iPhone Safari / VoiceOver unverified; original-art face/neck seam still provisional; independent scarf/arms not finished. Automated CI and mock AI tests cannot clear those by themselves.
