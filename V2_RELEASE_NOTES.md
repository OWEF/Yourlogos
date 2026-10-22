# YourLogos V2 — Living Universe release candidate

Status: **committed to GitHub, not merged or deployed** (22 October 2026).

## Scope and compatibility

- **Encounter / Quotes:** existing approved mobile quote experience remains intact. The existing V1 save/like data (`yourlogos_web_v1`) is preserved.
- **Library:** the six approved glass school cards, detail views and curated content remain intact. Neither `schools.js` nor `styles.css` changes in this branch.
- **Navigation:** original three-button dock (Encounter / Library / Constellation) stays. Only the previous static Constellation view is replaced.
- **Constellation:** the V2 cosmic renderer lives at `cosmos-v2.html` and is embedded, same-origin, into the existing third tab. Its embedded-only CSS hides duplicate child navigation. No additional backend or secrets.
- **Progress:** the universe defaults to **My encounters**, not the illustrative timeline. Likes from V1 are imported as initial sparks only, using an import timestamp. They do not fabricate past revisits, agreement with the quote, or further maturity. Explicitly marked perspective readings and explored connections are saved as V2 events to the browser (`yourlogos-v2-encounters-v1`).
- **Demo:** the separate sample evolution slider demonstrates five visual stages without modifying real user history.
- **User data:** the existing Export my data action now also exports V2 event history. Data remains browser-local; clearing browser storage removes it; no cross-device sync yet.

## Files

- `app.js`: swaps only Constellation HTML and updates export; preserves Encounter and Library logic.
- `index.html`: adds the isolated Constellation stylesheet.
- `cosmos-v2.html`: interactive cosmic scene, maturity logic, same-origin V1 like import, perspective exploration, demo isolation.
- `constellation-embed.css`: frame positioning and mobile adaptation.
- `sw.js`: new cache namespace and additional assets.

## Five-stage visual progression

Spark → Young Star → Radiant Star → Idea System → Living Constellation.

Progress is based on saved ideas, meaningful readings across separate days, distinct philosophical perspectives, and explored connections. Passive views, repeat likes, and demo controls do not increase real progress. The stages remain provisional interaction patterns, never metrics of intelligence or assertions about personal beliefs.

## Release gate (do not skip)

1. Wait for Railway deployments to recover; keep production pointed to `main` until then.
2. Deploy this branch to an isolated preview environment/service if possible.
3. On actual iPhone Safari and desktop Chrome, smoke test Quote swipe, Like, Discover, six Library cards and detail screens, the third Constellation tab, pinch/pan/drag, meaning sheet and navigation, personal history import, demo stage separation, persistence after refresh, export, and back/forward behavior.
4. Check console exceptions, frame timing, battery/memory, offline cache update, safe-area and reduced-motion behavior. Triage any defects before merging.
5. Merge the PR into `main` only after live preview verification and explicit release approval. Railway production auto-deploys `main`; merging ahead of Railway recovery risks an unverified rollout.

## Known limitations

- V2 is currently Canvas 2D, not a full GPU/WebGL particle engine.
- V2 curated concept catalog is a prototype; editorial attributions and mapping should be reviewed before broader public launch.
- User constellations do not synchronize across devices. Customized drag positions are session-local.
- Embedded integration has been code-reviewed and source-diff checked; full live integration QA is pending a working HTTPS preview. Earlier V2 standalone was tested in a mobile browser.
