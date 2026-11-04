# CZ-80 + CZ-81 — Free Encounter / LilLogo motion laboratory

Status: **standalone review prototype**, not an integrated user-facing feature and not a source for production quote/consent/persistence. Linked to [CZ-80](https://linear.app/czd217/issue/CZ-80/encounter-reward-choreography-responsive-interactions-and-meaningful) and [CZ-81](https://linear.app/czd217/issue/CZ-81/lillogo-v3-articulated-character-rig-and-event-driven-animation).

## Run without a paid animation service

Open `/experiments/cz80-cz81-reward-lab.html` from the existing YourLogos server. It is one self-contained HTML file: inline **SVG** (separate head, eye, eyelid, arm, torso, leg and scarf groups), native CSS animation, fixed sample lens content and plain DOM interactions. **No Rive export, Lottie subscription, Three.js, packages, web requests, AI calls, analytics, external fonts, account or stored user data.**

We chose SVG/CSS as the lowest-cost technical proof of articulated motion; Rive's own pricing requires paid Cadet to export a runtime `.riv` from the editor. This does **not** automatically mean the resulting art is the right LilLogo identity.

## Distinct verified UX behaviors

1. Intro with living character, source-inspired question and three different interpretative directions.
2. Card acknowledges click instantly; other cards recede, particle reaction fires only when motion is allowed.
3. Lens-specific reinterpretation and question; user can try another lens.
4. Optional reflection input, no storage.
5. Completion/constellation, visible reward and replay.
6. Sound is **off by default**, toggle is opt-in; reduced-motion has static equivalent, no bursts.
7. On page exit and reset, transient timers are cleared; no backend writes or process stays alive.

## Local QA evidence (isolated preview, not production)

Headless Chromium mobile viewport 390×844: all four states, three choices, reset and joint presence passed. Desktop 1200×900 passed. Reduced motion forced ON: immediate insight, no sparkle, passed. No JS page errors in the tested mobile path. iPhone Safari and VoiceOver remain **unverified**, and visual fidelity to the LilLogo reference image in CZ-23 requires founder comparison.

## What this is not

- **Not** the existing approved production character art: the cream/scarf companion here is an illustrative, newly drawn *rig prototype*. Before replacing assets, trace/re-rig the **actual** expression/pose reference from CZ-23, preserving its proportions, face and identity. Do not assert likeness or replace the existing asset silently.
- **Not** the real AI Encounter response flow. The sample copy is fixed, not claimed as quotes by historical philosophers. Do not wire these strings into the 91-quote catalogue.
- **Not** actual persistence to My World: the prototype shows a **visual-only** constellation; the real save must be driven by the established data model and explicit user consent.
- **Not** an authorization to merge a new avatar into production. Feature integration needs separate scoped PRs, deterministic state/event tests, mobile Safari capture, comparison to CZ-23 artwork, founder preview approval and subsequent release.

## Recommended integration sequence

A. **CZ-80**: extract response choreography to independent CSS/JS, wired to the existing single-choice flow through safe semantic events, without changing state, quote copy, AI or saved data.

B. **CZ-81**: create layered/riggable final asset based on CZ-23; keep current atlas as fallback and use an opt-in feature flag until approved. Character states must be triggered by actual events, with a single mounted renderer, no unnecessary polling and reduced motion.

C. **CZ-7**: visual regression and iPhone/VoiceOver QA (answer, retry, AI error, offline, save, back/revisit, 91-quote compatibility), then founder explicitly approves deployment of integrated changes.

Costs: no new subscription or paid animation tools in this preview. Existing Railway service resource usage may increase slightly if the route is served, but no new always-on service is created.
