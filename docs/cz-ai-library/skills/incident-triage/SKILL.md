---
id: incident-triage
version: 1.0.0
roles: [debugging]
triggers: [crash, failure, timeout, outage, incident]
---
# Read-only incident triage

1. Check current health first; suppress already-recovered or duplicate incident fingerprints.
2. Identify service, version, first failure timestamp, error signature, recurrence and potential impact.
3. Prefer cheap deterministic evidence and redacted targeted logs; never expose or retrieve credentials.
4. Distinguish observed cause from competing hypotheses. Avoid blind retries or restarts.
5. For an actionable confirmed problem, propose the narrowest repair, proof of regression and rollback. Delegate code to the authorized engineer; Agent D profile itself is read-only.
6. If evidence is insufficient or safety is unclear, hold and escalate rather than inventing traces or silently spending another model run.
