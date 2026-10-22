# YourLogos V2.1 — Progressive Discovery

This is an iteration on the previously approved V2 release candidate. It modifies only the immersive Constellation renderer (`cosmos-v2.html`). The approved Encounter and Library screens and navigation stay unchanged.

## Agreed experience

YourLogos is a freely pannable, zoomable celestial canvas. Atmospheric stars provide depth, while interactive formations represent actual encounters. For a new user, **no unfamiliar ideas appear**: an empty personal history displays the starry sky with an invitation to save a thought.

### Emerging possibilities

- A saved thought becomes an owned **Spark**, with no unlocked suggestion.
- Returning to an idea, reading deeply across different dates and exploring different perspectives can mature it through the five existing visual stages.
- A faint unexplored formation appears **only** when its related owned idea reaches **Idea System** (level 3) or higher.
- Suggestions are curated neighbors of eligible mature concepts, ordered by bounded engagement evidence; at most **one** suggestion initially or **two** when the user has a level-4 Living Constellation. The proposal is always visibly distinct from an owned star.
- No explored idea is implicitly owned: selecting or inspecting a proposal does not add it to personal history. Passive views and repeated likes do not advance maturity.
- A genuinely deep multi-school reading history can unlock a first novel connection without requiring the user to have already explored other branches (avoids a progression deadlock).
- The evolution/demo timeline is explicitly separate and never alters real personal history.

### Verification

- JavaScript syntax check passed.
- Automated Chromium mobile viewport smoke checks: fresh sky contains no owned or suggested nodes; first three sample stages contain no faint proposals; later two stages show them.
- Synthetic realistic local-history test: one old saved quote produces level-0 Spark with no proposal; three reading sessions on separate days across two schools produce level-3 Idea System and exactly one new proposed concept; opening that concept does not mark it owned; meaning sheet opens; no page errors.
- Integration code remains isolated in `cosmos-v2.html`; other assets are unchanged compared with V2.
- Device-level HTTPS verification and Railway staging remain pending. **Do not merge to main or deploy production without explicit release approval.**

## Important limitations

This is a Canvas 2D prototype and editorial relationship graph, not a fully tuned WebGL universe or authenticated long-term knowledge graph. Browser-local history is device-specific. Engagement rules are provisional and should be revisited with real-world usage. Eventual user consent and controls over inferred interests remain important.
