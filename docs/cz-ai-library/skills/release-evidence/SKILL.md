---
id: release-evidence
version: 1.0.0
roles: [testing-qa, debugging]
triggers: [PR review, release, smoke test, rollback]
---
# Evidence-based verification

1. Identify exact repository, branch, source SHA, deployment SHA and scope. Do not trust screenshots as release proof.
2. Check test results, change diff, known issues and rollback steps; separate direct observations from assumptions.
3. Verify only the environments actually inspected: CI pass, preview, physical device, staging and production are distinct states.
4. Never infer a deployed fix from an approved PR or a successful workflow. Require actual deployment identity and behavior evidence.
5. Escalate high-risk changes and require founder sign-off; no auto-merge or auto-deployment authority.
