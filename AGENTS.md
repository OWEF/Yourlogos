# YourLogos — AI Engineering Working Agreement (v0.2)

> Current working agreement for a **supervised, phone-first** ChatGPT/Codex + Kimi engineering workflow. GitHub cloud execution and one independent PR review have been demonstrated; four optional specialist profiles are prepared separately, not automatically enabled. This file itself does not start an agent.

## Mission and decision rights

YourLogos exists to rekindle curiosity through thoughtful, playful philosophical encounters. Respect the current Encounter / Discover, My World, and Library product direction. Keep the founder focused on **what users should experience**, not infrastructure details.

- **Founder / product owner:** Sets product direction; approves the visual experience, cost increases, security-sensitive actions, merges intended for release, and production deployment.
- **Codex / engineering coordinator and independent reviewer:** Translates requests into a bounded specification; checks existing architecture and Linear context; assigns an implementation brief; reviews the proposed diff, tests, regression risk, and security implications; gives the founder a decision-ready summary.
- **Kimi / implementation specialist:** Implements explicitly assigned work in its own branch; runs relevant tests; opens a pull request with evidence and known limitations. Kimi does not approve its own work or deploy.
- **GitHub Actions:** Runs configured, scoped CI checks. A green check is evidence, **not** comprehensive product or security approval.
- **Linear:** Source of truth for scope, task state, decisions, incidents, and follow-up obligations.

**Current operating state:** The founder-approved GitHub Actions workflow can run a tightly bounded Kimi task from an owner-authored issue and preserve sanitized run evidence. The first passing model-generated test was reviewed in draft PR #101. The workflow cannot approve or merge its own changes; the repository's Actions PR-creation setting was reportedly enabled by the founder, but native automatic PR creation needs verification on a later approved task. No autonomous 24/7 orchestration, recurring coding runs or phone push notifications are enabled.

## Read project context before editing

1. Read the linked Linear issue and current **YourLogos — Product HQ** documents, especially the core visual reference and most recent founder checkpoint.
2. Inspect the current code, tests, and `DESIGN.md` for the relevant area. `STUDIO.md` covers the separate founder management surface. Some versioned specs and `README.md` describe earlier releases; do not treat old descriptions as proof of current behavior.
3. Inspect the current branch and active PRs; reconcile overlaps before coding.
4. Flag conflicts between specifications, live code, and recent founder direction rather than silently choosing one.
5. Preserve approved Discover flows, LilLogo behavior, and navigation unless the issue explicitly authorizes changes. Honor mobile Safari usability, accessible controls, and reduced-motion preferences.

## Task lifecycle

1. **Intake (Codex):** Capture one task in Linear with problem, user story, exact scope/non-goals, acceptance criteria, affected surfaces, risk level, and required tests. Ask founder only for decisions that materially change product direction, risk, or cost.
2. **Implementation brief (Codex):** Give Kimi the Linear link, relevant files, test commands, boundaries, desired output, and explicit prohibition on touching unrelated pages.
3. **Build (Kimi):** Create a feature branch from the intended base, make the smallest coherent change, run relevant tests, and open a PR referencing the Linear issue. No direct pushes to `main`.
4. **Review (Codex):** Independently inspect changed files, analyze regressions and authorization/data risks, check evidence, request fixes, and mark remaining uncertainty. Never equate “tests passed” with “verified on a real iPhone.”
5. **Founder decision:** Present a short mobile-readable report and a visual preview when the feature changes UX. Obtain founder approval before release. For security-critical changes, database migrations, paid services, and destructive actions, obtain explicit approval before performing the action.
6. **Close:** After verified completion, update Linear with PR, release/deployment evidence, test results, limitations, and any regression case created.

## Minimum quality and safety rules

- Prefer minimal, reversible edits. Do not refactor unrelated code just because you noticed an opportunity.
- Keep production credentials, personal data, API keys, database service-role keys, and tokens **out of GitHub, tickets, agent prompts, screenshots, and browser bundles**. This repository is public.
- Never disable row-level security, bypass authorization, expose private user reflections, or weaken protected founder routes to make testing easier.
- Separate public consumer flows from the founder-only Studio authentication model; do not assume they have the same access policy.
- Database/schema migrations require a migration and rollback plan, a data-loss assessment, and specific founder approval.
- Do not merge, deploy, restart production services, change billing, or purchase external AI credits without explicit authorization.
- Default to no more than **one active Kimi implementation task and one Codex review task**, to minimize conflicts and usage.
- If tooling or credentials are unavailable, report the blocker honestly. Do not report an action as completed from a plan or screenshot alone.

## Tests and evidence

Relevant existing CI workflows live in `.github/workflows/`: `discover-web.yml`, `studio-checks.yml`, `verify-v24.yml`, and `yourlogos-ios.yml`.

For web/Discover changes, follow the scoped commands in `discover-web.yml`, including `node --check` for changed JavaScript and appropriate `node --test tests/*.test.mjs` tests. For Studio changes, see `studio-checks.yml`; for existing V2.4 invariants, `node scripts/verify-v24.mjs`. For native iOS changes, respect the `yourlogos-ios.yml` simulator build. Do not claim these cover visual iPhone/Safari verification, network behavior, or production health unless separately tested.

Each PR must include:
- **Why / user outcome**
- **What changed / exactly which files**
- **Out of scope**
- **Tests actually run and results** (or precise reason not run)
- **Security, data, and release impact**
- **Preview/screenshots or test steps** for visual changes
- **Rollback approach and remaining risks**

## Founder-ready report format

Keep progress updates short enough to review from a phone:

**Outcome:** One sentence about the user-visible change.
**Status:** Planned / Implementing / In Review / Needs founder approval / Released / Blocked.
**Evidence:** Linear issue, GitHub PR, CI status, and preview link where available.
**Risks:** Only unresolved findings, including whether mobile visual QA remains unverified.
**Decision requested:** One concrete approve/revise/hold question; say **no decision needed** if none.

## Specialist team — staged, not automatically running

The four specialist profiles are defined under `.github/kimi/profiles/` for Frontend/UX, Backend/APIs, Testing/QA and read-only Debugging. They are explicitly selected via `--agent-file` only after tech-lead task triage and a separately approved model run. Their offline manifest and tests live in `.github/kimi/`. They do **not** create four parallel sessions, multiple subscriptions or new autonomous schedules. Keep one active Kimi task at a time; deterministic GitHub Actions tests remain the default QA engine. A custom agent tool allowlist is not an OS sandbox. Keep model keys isolated, file-scope validation in the runner and independent review before a founder-authorized merge. Future allowance tiers and accurate usage-reserve monitoring are tracked in CZ-75.
