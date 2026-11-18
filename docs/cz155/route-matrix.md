# CZ-155 — Actual Discover route matrix and exposure denominator

**Engineering snapshot:** PR #247, parent app `493cb1471814fba9feb4cbeab6ae96b8e46565d6`. This matrix describes the source resolver and current app catalogue; it is **not** a claim of production exposure, live Railway smoke-test success, editorial sign-off or human comprehension.

| Entry and flags | Exact quote identity | Server resolution / reader experience | Independent storage or publication effect |
| --- | --- | --- | --- |
| Normal inherited daily feed; B2.7 local preview on; CZ-155 flag off | ID 47, George Long, *Enchiridion* §1 | `/api/b27/start` → `no_fit`, reading-first with a useful source-context distinction, one question and Long passage link | No game completion. Does not unlock source admission |
| Same daily feed, CZ-155 server flag on but no `?cz155=1` | ID 47, George Long | Still reading-first: server AND client must opt into the simulator | No publication |
| Actual daily card, `YOURLOGOS_B27_PREVIEW=1`, `YOURLOGOS_CZ155_PREVIEW=1`, `?b27=1&cz155=1` | ID 47, George Long | `/api/b27/start` → draft Director; two decisions + independent delivered/no-reply event; `/api/b27/run` → existing Reasoning → Emotion Strategy → Expression. Real-card Chromium fixture uses unseeded date **2027-01-07** | `Finish & Save` uses existing My World storage; no ordinary publication authorization |
| Existing development quote opened in the actual dev feed | ID 92, Carter-labelled web witness | Remains original Tap & Pair via B2.7; **never** inherits Long dossier or pilot | Existing preview-only source identity |
| Existing inherited playable quote | IDs 12, 23, 34, 48, 49, 55 | Existing appropriate four-family route and source-specific contract; no simulator rewrite | Existing Like/Discover and save contracts retained |
| Other inherited, non-admitted quote | E.g., ID 31 (Hegel) | Reading-first / no-fit, not an invented source interpretation | No promotion or false philosophical result |
| AI route explicitly enabled | Separate Little Logo AI journey | Its own feature-gated path; **not** the CZ-155 Director. Requires separate UI verification | Must not affect Like, source admission or saved Director history |
| B2.7 preview disabled | Any quote | `/api/b27/start` and `/api/b27/run` unavailable (404); existing unrelated app remains separate | Neither preview nor production eligibility implied |

## Verified inventory, not traffic exposure

The canonical editorial ledger covers **91 inherited** and **4 development** quotations. Six inherited IDs are source-authorized for the current *isolated preview*: **12, 23, 34, 48, 49, 55**. Four additional development IDs are **91–94**. Of the `56` IDs in the current `app.js` daily-feature list, **five** overlap the six inherited playable IDs: **12, 23, 34, 48, 49**. **ID 55 is not in the 56-ID daily-feature list; ID 47 is in that list but ordinarily reading-first.** This is an eligibility intersection, not 5/56 measured daily card impressions, sessions, taps or real-user outcomes.

A daily quote is chosen through `DAILY_ORDER` and `dailyPick`. The long-source E0 browser test fixes the date to 2027-01-07 to exercise the genuine app entry instead of injecting an arbitrary card. Representative ordinary-feed exposure frequency must be separately measured against the actual rotation and user sessions; no telemetry-based denominator has been obtained here.

## The editorial gate remains closed

Long §1 inherited ID 47 is currently `awaiting_source_review`; Carter-labelled development ID 92 is a different record with different text. The Long source dossier authenticates an **engineering-only** hypothetical argument. An accountable editor must authorize the exact translation, quotation, interpretation, warrants, limitations and consumer copy before changing publication eligibility. **No such permission is established by the new Director or by a successful browser check.**

## Verification ledger

- App catalogue: `app.js`, `DAILY_FEATURE_IDS`, `dailyPick`, `activeQuote`.
- Router and exact identity: `experiments/yl-b27-route.mjs`; admission: `experiments/yl-b27-editorial-ledger.mjs`.
- Pilot flags and handler: `server.mjs`, `experiments/yl-cz155-pilot.mjs`, `b27-app-runtime.js`.
- Current actual card tests: `tests/yl-cz155-app-browser.test.mjs`; non-UI denominators: `tests/yl-cz155-routing.test.mjs`.
- Baseline Emerson comparison and earliest information loss: `docs/cz155/emerson-handoff.md`; separate correction remains outside CZ-155 E0.
- The Railway review service was inspected separately. Its last inspected deploy is `493cb147`, not PR #247; no preview deployment of this new branch is claimed.

**Next gate:** complete exact-SHA CI and review all six literal computed endings, then obtain editorial and independent QA assessment. Physical Safari and first-time learning comparisons remain NOT TESTED.
