# YourLogos Engineering Team — supervised specialist roles (CZ-75 readiness)

## Decision rights and architecture

Founder **owns vision, scope, budget exceptions and every production release decision**.
ChatGPT is the **task orchestrator / technical lead / independent reviewer**.
Kimi may serve as one selected implementation specialist at a time; GitHub Actions provides deterministic tests and an ephemeral cloud runner. Linear retains issues and decision history.

The four profiles in `.github/kimi/profiles/` are:

| Key | Kimi role | Capability |
| --- | --- | --- |
| `frontend-ux` | A · Frontend & UX | Scoped UI/interaction/accessibility edits |
| `backend-apis` | B · Backend & APIs | Scoped server/API code; **no live credentials/migrations** |
| `testing-qa` | C · Testing & QA | Scoped deterministic regression tests and negative cases |
| `debugging` | D · Debugging | **Read-only** diagnosis; no file edits |

**These files are deliberately outside Kimi's automatically discovered directories** (`.kimi-code/agents/`, `.agents/agents/`). They must be selected *explicitly* with the CLI's documented `--agent-file` option. This avoids a silently expanded subagent swarm and unrequested consumption of subscription quota.

The validated routing manifest is `.github/kimi/role-routing.json`; the offline validator/selector is `.github/scripts/cz69-role-router.mjs`.

Example of **offline selection (does not call Kimi)**:

```bash
node .github/scripts/cz69-role-router.mjs --check
node .github/scripts/cz69-role-router.mjs testing-qa
```

Future cloud-runner invocation after a scoped issue and founder authorization:

```bash
# Example only. Do not execute without an authorized bounded workflow.
kimi --agent-file .github/kimi/profiles/testing-qa.md \
  --prompt 'Implement only the allowlisted test in the approved issue' \
  --output-format stream-json
```

## Required handoff contract

1. **Founder:** Defines outcome and priorities; approves sensitive or production-impacting decisions.
2. **ChatGPT:** Searches Linear and current code; identifies one concrete acceptance test, one Kimi specialty, exact allowed files, risk classification and budget. Refuses tasks lacking a bounded scope.
3. **GitHub runner:** Loads one exact profile file from the reviewed manifest. Runs zero-model preflight before the Kimi membership secret is exposed. Maximum **one** model session active, no delegated subagents or automatic retries.
4. **Kimi specialist:** Works on one bounded assignment, without `Bash`, `Agent` or `AgentSwarm` access in the agent profile. Profiles may read code and (except debugging) propose file edits; the shell/network and credentials must also be restricted at **runner/OS level** before scaling beyond the existing trusted pilot.
5. **CI:** Enforces the task-specific changed-file allowlist, tests and static safeguards. On failure, stop and preserve only sanitized diagnostic metadata, not model transcripts or sensitive traces.
6. **Draft PR:** A separate credential scope handles GitHub branch/PR writes. Kimi itself has no GitHub write authority. GitHub Actions has independently **created draft PRs** for the Kimi C and Kimi A pilots. Founder release approval and fresh PR CI remain mandatory.
7. **ChatGPT:** Independently reads the actual diff and CI logs, reviews product and regression risks, and presents a go/no-go result to the founder. A green check is never permission to deploy.
8. **Founder:** Approves or declines merging anything that triggers Railway production deployment.

## Budget, security, and rollout

- These are **role definitions, not running agents or cloud services**. No extra subscription, parallelism, periodic scan, live API connection or deployment is created by this directory.
- The four specialist issue workflows are implemented, but only A/C/D have completed full successful role-specific QA or diagnostic tasks. B made one bounded coding attempt but its test failed the independent gate; the subsequent code fix was authored by the tech lead rather than claimed as an agent success. Before **any new Kimi call**, follow the default-off CZ-75 quota attestation procedure in [CZ75-READINESS-RUNBOOK.md](./CZ75-READINESS-RUNBOOK.md).
- Four role labels do not mean four concurrent Kimi sessions; `maxConcurrentKimiSessions=1` and `automaticSubagents=false` are asserted by offline tests, but the **execution runner must continue to enforce concurrency** itself.
- Disallowing the `Bash` tool in profiles reduces risk but is **not an operating-system sandbox**. Runtime process permissions, tool filesystem scope, network egress, secret isolation, cost telemetry and artifact integrity require separate engineering before broad autonomy.
- Until verified Kimi membership usage telemetry exists, no automated money/token limit should be claimed. Keep one approved task per run, hard wall-clock limits, no automatic retries and a reserve policy as specified in [Linear CZ-75](https://linear.app/czd217/issue/CZ-75/ai-engineering-allowance-v2-adaptive-budgets-quota-reserve-and-zero).
- Never turn these profiles into an always-on `n8n`-style automation or a Tower/swarm configuration without distinct founder approval and measured costs.

## Acceptance of Phase 2

- Four distinct, non-auto-loaded profiles with verified frontmatter and documented tool restrictions.
- Deterministic role selection and negative tests for arbitrary file paths, extra agents, subagent delegation, unsafe tools and concurrent sessions.
- No Kimi model call during PR construction or static CI.
- A/C/D have live run evidence; B has been exercised but remains not fully QA-validated. Keep the one-model-at-a-time limit and the owner-approved, default-off manual quota gate. Do not infer full sandboxing or membership quota accounting from passing CI.
