# CZ-105 · Founder mobile reasoning laboratory

**Status:** Isolated test surface on draft PR #147. Not connected to live YourLogos Discover; no Railway, Supabase, AI API, login, account, user reflection or production deployment. The Seneca educational model is still provisional.

## Open on iPhone
The preferred file is `experiments/cz105-reasoning-lab-standalone.html`. It is fully self-contained and includes the **exact** current `analyzeTradeoff()`, philosophical model, and zero-sum slider controls. It requires no external scripts, network or build pipeline once opened.

For convenience, use the GitHub **commit-pinned** file through an external HTML preview proxy such as raw.githack.com. This is a third-party viewing service, **not** our production domain; its browser security confirmation screen may require one additional tap. Do not enter personal or confidential information. If the proxy does not work on iPhone, download the standalone HTML from GitHub's **Download raw file** action, save it to Files, and open it using a local HTML viewer or browser with local file support. The separate import-based file `experiments/cz105-reasoning-lab.html` requires a local static HTTP server and its relative JS modules; do **not** treat it as a self-contained download.

## Testing protocol

1. Open the lab. Confirm the default **Rest 3h / Obligations 3h / Reflection 2h** produces all four sections: **What happened? / What follows? / What remains uncertain? / Why this?**.
2. Select **All rest** and run reasoning. Then select **All duties** and **All reflection**. All three are 100% extreme but yield **different qualitative possible implications**.
3. Drag any slider. Confirm the other sliders rebalance so the displayed total always remains eight hours, with half-hour precision. Contrast **5/2/1** with **5/1/2**; the primary share is unchanged but the secondary priority changes.
4. Switch **Unknown → One-off → Recurring** without changing the allocation. The math (what necessarily follows) should stay fixed; the *possible* contextual interpretation should change.
5. Set **Stated priority: Rest**, then allocate all eight hours to duties. Expect an **apparent intention–allocation tension**, **not** a formal contradiction, diagnosis or accusation.
6. Expand **Why this → Open the exact inference trail**. The fired rules and relation IDs must be auditable. Expand the complete JSON when debugging.
7. **Save result A**, change inputs and **Save result B**. Compare the two cards; select **Load this scenario** to restore the captured allocation and context.
8. Optionally copy the JSON report. The lab records nothing on a remote database and its A/B snapshots last for this browser session only.

## Philosophy acceptance
Every first-round run must distinguish:
- **Observed fact** — what the eight-hour hypothetical arrangement *actually* entails;
- **Possible interpretation** — philosophically defensible but *not* established as fact;
- **Unknown** — e.g., actual purpose, cadence, remainder of the day;
- **Trace** — exact model, triggered rule, relation and epistemic status.

Examples that fail: equating zero rest **in this eight-hour block** with sleep deprivation; asserting eight hours of reflection is unwise; treating a balanced allocation as morally correct; calling a stated-priority mismatch hypocrisy; describing two tied categories as winner and runner-up; giving a generic summary regardless of the second priority.

## Implementation and tests

The import-based lab draws directly from:
- `philosophy-engine/tradeoff-reasoner.js`
- `philosophy-engine/models/seneca-time-v1.js`
- `experiments/cz105-lab-controls.js`

The offline edition is reproducibly bundled from these same modules, **not** a parallel or independently invented reasoning implementation:

```sh
node scripts/build-cz105-lab-standalone.mjs --check
node --test tests/philosophical-reasoning.test.mjs tests/cz105-mobile-lab.test.mjs
```

A dedicated Github Actions browser workflow runs the standalone file in actual headless Chrome at 320px, 390px and 768px and checks four-section rendering, zero-sum slider, changed context, A/B restoration, script errors, unwanted external requests and horizontal overflow. Screenshot artifact is attached to the CI run.

**Limitations:** Chromium emulates a mobile viewport/touch but is not iPhone Safari. Founder should test on real iPhone and report typography, scroll, touch-slider feel, accessibility and the intellectual quality of the outputs. Source wording and scholarly attribution require review before production. The Expression Engine and Tension Gate remain disabled placeholders.

**No merge, production deploy, DB migration, or paid agent action is authorized by this lab.**
