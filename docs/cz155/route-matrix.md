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

## Current-date ordinary feed evidence — 18 November 2026 (Asia/Singapore)

The genuine `app.js` `DAILY_ORDER` / `dailyPick` selects **ID 23, Mary Wollstonecraft**, on 2026-11-18 in a new unseeded session. This quotation is playable, so it is **incorrect** to label the current day's first card as reading-first. The new browser journey preserves that fact: opens the real current-date card, then browses forward through the existing quote viewport using ArrowDown to reach **ID 56, David Hume**, “A wise man proportions his belief to the evidence.” Tapping the actual card's Discover yields `/api/b27/start` → `no_fit` and literal consumer copy:

> “A wise man proportions his belief to the evidence.”
>
> — David Hume
>
> An Enquiry Concerning Human Understanding, X
>
> A question to sit with
>
> What would change your mind about something important?

No internal `admission` / `no_fit` / capability jargon appears in the foreground. This specific reading-first item has **no source-grounded explanatory paragraph or passage link**, because no further exact-edition witness has been admitted. It is a truthful attribution-and-question experience, not a claim that an argument was editorially authenticated. Screenshot, literal foreground text and an actual route JSON are created by `tests/yl-cz155-app-browser.test.mjs` in the CI artifact as `07-current-date-*`.

## Refresh / resume evidence — same real quote, no new profile store

For the opt-in Long §1 pilot, the browser now persists an **unfinished fictional event history only** in tab-scoped `sessionStorage` as `b27-session-draft/1` with quote ID and source version. Reopening Discover after a reload obtains the fresh server source record, validates `encounter-events/1` by pure `replayEncounter`, and restores the exact first/second action stage and Undo history. A tampered external observation or incompatible source version is discarded. The draft is removed when the authoritative `/api/b27/run` returns a completed result. It is not an authenticated user profile, cross-device memory, My World record, or a way to assign the friend's response. Saving, reading back and deleting a completed Encounter still use `b27-saved-encounters.js`.

The responsive Chromium screenshots `03b-resumed-after-first.png` and `03c-resumed-after-second.png` demonstrate both partial states. No claim of physical iPhone/Safari, crash-safe recovery across cleared browser sessions, or real-world reading behavior is made.
