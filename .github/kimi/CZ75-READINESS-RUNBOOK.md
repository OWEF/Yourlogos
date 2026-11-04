# CZ-75 | YourLogos supervised engineering readiness

**State:** Kimi model calls must be held until manual quota/billing attestation. This document describes the intended procedure, not proof of the current private Kimi account settings.

## Allowed operating mode

CZ-69 established the supervised engineering bridge. CZ-75 adds a minimum reliability boundary before another CZ-13 development sprint. Allowed: one small, fixed-scope founder-triggered task with offline preflight, deterministic CI, independent review and founder release approval. Not allowed: public-input or unrestricted tasks, automatic retries, parallel swarms, arbitrary new budget tiers, automatic PR merge or production release.

## Before EACH model run

1. Inspect the Kimi **Subscription → My Credits** page (or Kimi Code Console), including shared monthly membership credits and rolling five-hour Kimi Code usage. Legacy subscriptions may retain a weekly quota. Kimi CLI **/usage** is an interactive way to inspect usage, not a verified machine-readable GitHub quota source.
2. In the Kimi account **Extra Usage** settings, confirm Extra Usage is **OFF** if additional usage charges are not approved. This is an account-side control; GitHub cannot turn it off, read its state or cap spending.
3. If allowance is sufficient and Extra Usage is OFF, go to the GitHub repository **Settings → Secrets and variables → Actions → Variables** and set the ordinary *repository variable* named **CZ75_MANUAL_QUOTA_READY** to **true**. Do not put account credentials, credit balances, API keys, private user data or screenshots into that variable.
4. Have the tech lead verify the owner, exact issue number and idle-to-RUN title transition, live code scope, acceptance tests, expected cost and retry policy. Only an approved owner-edited fixed issue may trigger one existing small pilot.
5. Set the variable back to **false** or delete it after the intended run. The variable is a manual operator declaration, NOT live provider telemetry, a billing cap, or an automatically expiring per-run approval.
6. If quota status is unknown, the optional run stays on **HOLD**.

**Default-off:** An unset or non-true variable stops all five specialist/legacy coding workflows AND the older Kimi authentication smoke workflow at a no-model-key preflight. The gate runs before CLI installation, before the Kimi membership secret is exposed to the model step. No paid provider-side service is created by this change.

## Usage and budgets

The authoritative static policy file is .github/kimi/cz75-readiness-policy.json.

| Tier | Model-process cap | Step setting | Deployment status |
| --- | --- | --- | --- |
| Small | 120–150 seconds | 6–8 **per turn** | Only one reviewed owner task after manual quota gate |
| Normal | proposed 300 seconds | proposed 18 per turn | **Disabled** |
| Complex | proposed 600 seconds | proposed 35 per turn | **Disabled** |

The command setting KIMI_LOOP_MAX_STEPS_PER_TURN is NOT a verified global step counter. Elapsed time and step limits are NOT token, account quota, or monetary limits. Kimi membership credits are shared across Kimi products. The official quota interface available for this workflow has not been verified as a noninteractive API. Report **usage: not_verified** rather than guessing. Plan **60% development / 20% diagnostics and rework / 20% untouched reserve** manually; these percentages are not enforced by provider data.

## Permission, execution and failure boundaries

- Exactly OWEF owner-authored/edited GitHub issue and fixed issue number, exact idle-to-RUN transition; never interpolate issue bodies, public fork PR contents, arbitrary comments or runtime secrets into a model prompt.
- One eligible Kimi model job at a time with job-level group cz-69-kimi-coding; ineligible issue workflows skip without occupying the group. This incorporates the correction for cancelled pre-model Kimi D run #41787338777.
- Pinned Kimi CLI, role configuration and static policy are checked with no model call before revealing the member API key. Agents are configured without Bash, Agent and AgentSwarm; role D read-only. **These profile/tool restrictions are NOT an OS-level filesystem/network sandbox** and should not be used with untrusted code, secrets, public input or high-risk tasks.
- The Kimi code job lacks GitHub write-token authority. A no-secret independent step checks file allowlists and runs deterministic tests; on failure it stops without creating a candidate PR. Only a separate write-token-only job stages a **draft PR**; ChatGPT reviews independently and founder approves a production merge.
- Raw stdout/stderr, model prompts, agent text, tool traces and secrets must not be published. GitHub artifacts retain only bounded sanitized metadata and allowlisted candidates, with quota **not_verified**.
- Any timeout, failed test, malformed candidate, 429 quota response or unsupported CLI flag means **stop**. Do not rerun Kimi automatically. Diagnose the failed step and repair via reviewed CI-only change or human recovery. The first Kimi B invalid-fixture case is evidence of the value of that stop boundary.

## Before any production merge

Review the exact PR head SHA, source diff, CI, affected features, secrets/data implications, duplicate pending PRs, and an explicit rollback approach. After a founder-approved merge, verify Railway reached SUCCESS at the exact commit, intended service is online, and replicas, crashes and alerts are healthy. Do not perform automated rollbacks, destructive migrations or arbitrary production repairs.

## Zero-model readiness checks

From repository root, these make no Kimi model calls:

~~~bash
node .github/scripts/cz75-readiness-gate.mjs --check
node --test .github/scripts/cz75-readiness-gate.test.mjs
node .github/scripts/cz69-role-router.mjs --check
~~~

The existing .github/workflows/cz69-harness-checks.yml runs these in pull-request CI.

## Exact meaning of CZ-75 readiness

**Ready for supervised, small trusted tasks** only after the new gate passes CI, CI-only changes are founder-approved/released, and the founder manually confirms current membership quota plus Extra Usage settings. **Not ready for autonomous development** until actual provider quota accounting, reserve enforcement, sandboxed filesystem/network permissions, untrusted-input handling and operator-controlled spending caps are independently verified.

Brainstorming CZ-13 is zero-model engineering work and can proceed now. Starting another paid Kimi coding job needs the manual quota gate first.

Official documentation:
- https://www.kimi.com/en/help/membership/membership-update-rules
- https://www.kimi.com/en/help/membership/membership-extra-usage
- https://www.kimi.com/code/docs/en/kimi-code/membership.html
