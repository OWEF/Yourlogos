# YourLogos V2.2 · Discover, Fingerprint and Settings

Status: **development branch, not merged into production**.

## Navigation

Three bottom destinations: **Encounter · Universe · Settings**. Universe provides a small secondary switcher for **Sky · Saved · Fingerprint · Library**. This keeps saved thoughts distinct and directly reachable without hiding them inside the six-school Library. The six existing school art assets, content and card stylesheet are unchanged. Sky retains the interactive V2.1 canvas.

## Discover interaction

- The provocative, theme-grounded opening question is explicitly a challenge, not a supposed quotation from the author.
- Four nonbinary initial responses: resonance, resistance, ambivalence, curiosity for another perspective.
- Four optional interpretive lenses: lived experience, logic, others, changing over time.
- A concluding card shows the chosen approach and lets the reader save, inspect their fingerprint, or revise their choice.
- Responses are deliberately **provisional and editable**. A response never indicates agreement with a philosopher, and never automatically increases idea maturity.
- Responses are persisted in the existing V1 browser-local object under `data.discovery[quoteId]`. The saved quote records remain under `data.saved`. The original V2 universe event log is still separate.

## Fingerprint: grounded statistics, not a psychometric label

- Saved themes: share of saved quotes, with donut visualization and text percentages.
- Authors: number of saved quotes per author.
- Philosophical traditions: only limited, explicitly hard-coded editorial associations (not inferred belief).
- Discover approaches and lenses: counts of explicit user choices.
- Empty states are explanatory. The screen does not pretend that browsing alone proves philosophical preferences.
- Local data only; no identity scoring, health inferences, ranking of users or server analytics.

## Settings and privacy

- Export the existing saved/practice data, Discover choices and V2 universe events using the existing export action.
- Edit interests.
- Clear Discover answers only via confirm/cancel. Does **not** clear saved quotes or the universe history.
- Data is currently device-local; clearing browser storage loses it. Account sync is not available.

## Constellation overlay

- Export has been removed from the celestial canvas (moved to Settings).
- Faint-possibility control is hidden while a meaning panel is open, with revised placement and size for small iPhones.
- The original five-stage V2.1 progressive discovery remains in place.

## Verification and release gate

Source checks: JS parses after removing module import; nested cosmos JS parses; six-school source and base stylesheet hashes match V2.1; new files are precached by a new service-worker cache version.

**Not yet confirmed:** actual iPhone browser tests of the integrated V2.2 navigation, modal state, and persistence after refresh. Before merging into `main`, perform HTTPS staging/mobile smoke testing of: Encounter swipe and like, Discover choose/reconsider/close, Settings export and clear confirmation, Universe Sky/Saved/Fingerprint/Library, school detail, Constellation gestures/overlays, cross-tab persistence and offline refresh. Never merge/deploy solely because static checks pass.
