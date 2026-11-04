# CZ-75 | Smart engineering allowance playbook (v1)

**Purpose:** maximize completed, independently reviewed engineering work per unit of Kimi membership allowance. This is an advisory planning policy, not a model dispatch, billing cap, or permission change. Existing CZ-75 legacy and CZ-82 one-use authorization remain authoritative.

## Evidence-based lesson

- CZ-80 A1, GitHub run https://github.com/OWEF/Yourlogos/actions/runs/41848388186: one narrowly scoped event-bus implementation succeeded, and its PR #122 was reviewed and merged without a second Kimi call.
- CZ-81 B1, GitHub run https://github.com/OWEF/Yourlogos/actions/runs/41853061401: too many art references, body parts, motion states, tests and preview requirements for 150 seconds. Exit 124; no PR. A shorter model runtime is not necessarily a cheaper *completed feature*.
- Wall-clock duration and per-turn step settings do not measure token usage or actual membership quota consumption. Official Kimi docs confirm KIMI_LOOP_MAX_STEPS_PER_TURN is **per turn**, not a guaranteed per-run total. The workflow hard timeout and independent checks remain essential.

## Project portfolio prioritization

| Project type | Default engineering behavior | AI coding justified by |
| --- | --- | --- |
| YourLogos | Main active feature build; priority for planned model allowance | Accepted product brief and finite, independently testable task |
| TrendForge, ZA Portfolio, CryptoComply, Job Agent, PulseOS and other deployed tools | Business-as-usual monitoring and deterministic regression checks | Verified service incident, data integrity problem, or explicitly approved urgent security/compliance fix |
| New product inspirations | Linear idea incubator; compare reuse, opportunity cost and maintenance burden | Explicit promotion into the main development lane |

One Kimi coding worker at a time. Do not create four running agents or swarms just to demonstrate activity. A = Frontend/UX; B = Backend/APIs when needed; C = model QA only when deterministic tests are insufficient; D = read-only debugging for difficult reproduced faults. ChatGPT/Codex handles task framing, investigation, independent review and Linear/GitHub coordination where possible without additional Kimi usage.

## Task-size recommendation (not a permission to run)

| Tier | Task characteristics | Model hard wall | Max steps per turn | Authorization |
| --- | --- | --- | --- | --- |
| Zero model | Asset inventory, source inspection, test design, reviews, incident classification, simple deterministic fixes | No Kimi | 0 | Coordinator |
| Small | One focused bug/semantic event seam, up to two output files and tests | 150 s | 8 | Exact owner-authorized one-use task |
| Normal | One bounded visual component or modest app integration, with a context packet already prepared | 360 s | 18 | **Separate reviewed workflow and explicit founder approval** |
| Complex | Irreducible architecture change only after decomposition | 600 s | 30 | **Elevated founder approval; review security and data risks** |

Legacy CZ75 normal/complex settings remain **disabled**, regardless of this table. A new larger-cap workflow requires a separate reviewed safety policy and one-use authorization; it is never activated by advice alone. The companion planner always returns authorizedToDispatch=false.

Before raising limits, split oversized work into reusable stages. Do not assign all asset inspection, visual art decisions, complete rig, multiple gestures, tests, and real-app wiring to one limited run.

## Membership allocation and human checks

Allocate available membership allowance for planning: **60% purposeful engineering; 20% debugging/rework; 20% untouched reserve.** This is an internal allocation guideline, not live provider telemetry.

- If a founder-supplied account observation shows 80% or more monthly usage, defer optional tasks and protect reserve.
- If the rolling five-hour usage is at or above 80%, defer noncritical new runs.
- A verified incident may be considered under the reserve only with a new explicit decision.
- Extra Usage must remain OFF; no subscription upgrade, top-up, additional paid provider or model call from a failed run without approval.
- The founder can attest current account limits in chat before authorizing a new one-use task rather than toggling any GitHub repository variable. The connected GitHub runner does not independently read Kimi membership balances or pay-as-you-go settings.
- Official Kimi Code documentation describes a managed-OAuth usage endpoint. That does **not** prove our current API-key runner can access it; explore independently and without moving account secrets or storing private credentials in the public repository.

## Free preflight packet, then one bounded worker

Coordinator prepares a small *trusted* context packet using existing GitHub/Linear knowledge before invoking Kimi:
1. Product outcome and one meaningful acceptance criterion.
2. Existing code/current SHA, exact known files, previous failure and dependencies.
3. The approved original design identity (for LilLogo: CZ-23) and no new interpretation of artwork without founder review.
4. Output-file allowlist, a deterministic test, rollback and clear non-goals.
5. Pre-approved tier, exact fixed GitHub issue one-use trigger; never inject user-submitted issue body into a secret-bearing model prompt.

Stop when accepted. Never add automatic retries or repeatedly ask models to rediscover what we already know. Failed jobs receive one sanitized report (issue, run ID, cap, exit class, actual output, tests, unverified credit delta). Model completion alone is not feature acceptance, and CI is not real iPhone QA.

## Immediate recovery plan for CZ-81 LilLogo

- **B1a (zero-model):** inventory the approved art, compare it with prototype and existing PNG, prepare a concise reference and target-motions packet. Confirm identity limitations.
- **B1b (Normal recommended; NOT activated):** one standalone approved-look LilLogo character with independent head/gaze movement and one deterministic test. Only two files, no production app changes. A 360-second / 18-step-per-turn proposal; create a separate reviewed one-shot workflow and obtain founder approval after checking Kimi allowance.
- **B1c (later separate decision):** add arms, scarf and gentle state transitions only after B1b preview passes founder visual review.
- **B2 (later):** event-driven connection to merged CZ-80 semantic events, behind default-OFF flag, no fake My World saves.
- **C QA / founder:** automated regression tests followed by actual iPhone Safari, reduced motion, accessibility and faithful artwork comparison before product release.

## Security, rollback, progress

Keep the existing CZ82 exact owner READY-to-RUN authorization, shared single concurrency group, hard timeout, pinned CLI, fixed trusted prompts, protected secrets, file allowlist and separate draft-only PR writer. Larger budgets must never silently weaken these. Agent profile prompt instructions are not an OS sandbox; CZ75 sandbox restrictions are still open.

Track model outcome, issue/task tier, run URL, safe diagnostics, candidate SHA, reviewed PR and true provider quota usage **only if independently available** in existing Linear and GitHub. No new always-on paid dashboard. The key performance indicator is completed, independently reviewed deliverables and fewer timeout/rework loops—not hours the model spends working.
