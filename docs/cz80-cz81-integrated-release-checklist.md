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

## Real iPhone Safari acceptance runbook — NOT YET EXECUTED

**Review build prerequisite:** use an isolated, HTTPS-hosted build of the *exact PR #132 head SHA* with both `?cz80=preview&cz81=preview` flags. The current production URL is **not** a review build: do not claim its query parameters exercise this unmerged PR. A review-hosted build must be separately approved before any additional Railway runtime/service or public release. GitHub Actions' 390×844 Chromium screenshots are useful evidence but cannot substitute for a genuine iPhone test.

**Test record:** reviewer: ______ · device/iPhone model: ______ · iOS: ______ · Safari/PWA: ______ · review HTTPS origin: ______ · exact deployed SHA: ______ · test date/time/timezone: ______.

Run on the **same exact SHA**, once in Safari (fresh and returning) and once as an installed PWA where supported. Record PASS/FAIL/N/A with screenshot or short screen recording for each:

| ID | Real-device test | Pass condition | Result / evidence |
| --- | --- | --- | --- |
| IP-01 | Compare CZ-23 approved original with AI and local LilLogo (idle, curious, reflective, saved) | No distracting dark square; facial identity, hair and scarf recognizable; no visible neck/eye distortion | NOT RUN |
| IP-02 | Enter one-choice Encounter; tap 3 alternatives in separate replays and use Back/Close | Visible first feedback, valid transition only, no duplicate actions, controls remain reachable | NOT RUN |
| IP-03 | Scroll AI sheet, rotate/resize if applicable, navigate away and back | No blocked buttons, excessive page bleed, safe-area overlap, viewport jump or content loss | NOT RUN |
| IP-04 | Toggle Settings → Accessibility → Motion → Reduce Motion ON/OFF while page is open | Animation stops/resumes correctly; completion still legible; no flicker or runaway timers | NOT RUN |
| IP-05 | Enable VoiceOver, navigate choices, Save, Close and re-enter | Accessible names, meaningful focus order, no focus trap and reliable activation | NOT RUN |
| IP-06 | Background/foreground; lock/unlock; repeat Encounter navigation ≥3 times | No duplicated LilLogo renderers, stale pose, frozen scroll, repeated sound or overheating | NOT RUN |
| IP-07 | Consent AI, exercise normal response and a network disconnect/failure; only explicitly save after user decision | AI error is never a success/celebration, consent enforced, real save occurs once only | NOT RUN |
| IP-08 | Installed PWA warm restart and offline cold launch; local Encounter offline then return online | Cached dependencies including matte load; local mode works; API/network bypass remains safe | NOT RUN |
| IP-09 | Open without both preview flags | Original production art/behavior unaffected | NOT RUN |

**Exit criteria:** IP-01 through IP-09 PASS or a documented N/A accepted by founder; screenshots and device details attached to PR #132; original-art founder signoff; independent technical review after fixes; exact-head CI SUCCESS and explicit separate production-release approval. If any item fails, mark **NO-GO** and keep both issues In Progress. No simulated device or Chromium result may be recorded as real Safari evidence.

## Release and rollback (pending authorization)
1. Retain old PRs #129 (art study), #130 (CZ-80), #131 (CZ-81) as source history; do **not** merge them separately when using the integrated candidate PR.
2. Finish green CI, visual QA and all blocking acceptance tests on one exact release SHA.
3. Obtain a **separate explicit founder decision to merge/release**. Merging to main can auto-deploy Railway even with both flags off; do not imply a draft PR is a deploy.
4. Deploy only from the approved SHA; verify Railway health, PWA service-worker cache transition and a real browser startup after release.
5. If health or regression fails, use the prior known-good commit/redeploy or revert the integrated commit; do not modify customer My World data to roll back an animation.
6. Keep CZ-80/CZ-81 In Progress until founder has verified the integrated experience; if only preview mode is released, label the milestone precisely as preview/pilot.

**Known acceptance blockers as of 2026-11-05:** live iPhone Safari / VoiceOver unverified; original-art face/neck seam still provisional; independent scarf/arms not finished. Automated CI and mock AI tests cannot clear those by themselves.
