# CZ-82 | One-use founder authorization for Kimi (no GitHub-variable toggles)

## Why
The founder should approve a bounded engineering task, not manually set and unset a reusable GitHub Actions variable. Existing CZ75 pilot workflows remain default-off and still require their original quota attestation. The new method applies to separately reviewed, fixed-scope workflows.

## One-run protocol
- Founder checks the Kimi account before each run: sufficient current membership/5-hour allowance, Extra Usage OFF. These account-side facts cannot be independently read through the GitHub Actions workflow. The approval is a human attestation, NOT verified quota telemetry, spending limit or guarantee of no overage.
- The founder approves the exact task in chat; the tech lead uses the connected GitHub action to make ONE issue title edit from a fixed READY title to a fixed RUN title. No user visit to repository variable settings is needed.
- GitHub must verify actor OWEF, sender OWEF, repository OWEF/Yourlogos, issue author OWEF, exact issue number and exact prior/current titles. Issue body, comments and untrusted PR text never become model prompts.
- Source, agent role, output allowlist and fixed prompt are reviewed and committed on main before execution. Preflight happens before Kimi credential exposure; the model has no GitHub write token. A separate writer can open only a draft PR.
- One shared concurrency group; pinned Kimi CLI; small 150-second hard process cap, eight steps per turn, one failed-step attempt, no auto retry, no auto subagents, no paid upgrades and no automatic production release.
- The issue stays in RUN status after this action. An identical title edit cannot repeat without a *fresh* owner reset and approval. There are no background loops or standing run permissions.

## First route, CZ-81 B1
GitHub task: https://github.com/OWEF/Yourlogos/issues/119
Linear: https://linear.app/czd217/issue/CZ-81/lillogo-v3-articulated-character-rig-and-event-driven-animation

READY title: [CZ81-B1-READY] Quiet companion motion preview
RUN title: [RUN-CZ81-B1-APPROVED] Quiet companion motion preview

Role: Kimi A Frontend/UX. This first bounded task writes only a standalone experimental HTML animation and one Node regression test: experiments/cz81-curious-companion-lab.html and tests/cz81-curious-companion-lab.test.mjs. It does not modify production app.js, LilLogo assets, Encounter logic, user data, consent, authentication or My World. The original CZ-23 mascot identity must be respected. Visible phone QA and founder approval are required before any later character rollout.

## What is and is not automatic
The founder can say "Approve CZ-81 B1 run" in chat after reviewing Kimi account settings. The team coordinator can issue the signed GitHub owner title transition directly; the job automatically stops when done, and the reusable quota variable is never enabled by this route.

Not authorized: unattended agents, open-ended model prompts, always-on tasks, unlimited or parallel credit use, converting arbitrary issue bodies into instructions, auto-retries, merging PRs, deploys or changing billing. If Kimi account-side Extra Usage changes, GitHub cannot detect it; keep Extra Usage OFF and do not assume an enforced cash cap.

## Future tasks, release and rollback
Extend this reviewed fixed-task pattern using a new task issue/allowlisted prompt and scoped workflow after independent CI review. Old CZ75 workflows are not weakened. Failure/timeout stops and requires fresh authorization, never automatic retry. To roll back, close/revert the CI PR, or remove the new workflow and gate on main. Keep production and existing tasks untouched.
