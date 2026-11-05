---
id: scheduler-safety
version: 1.0.0
roles: [debugging]
triggers: [cron, timeout, ECONNRESET, duplicate tick, acknowledgement]
---
# Scheduler acknowledgement and idempotency safety

1. A failed client acknowledgement is NOT evidence that the server-side operation failed.
2. Read-only reconcile known request IDs, downstream state and ledger/journal before considering any retry.
3. Never issue a second non-idempotent POST or manual trading tick to diagnose a timeout.
4. Treat idle zero-replica cron services as normal between scheduled invocations; assess recent execution outcomes rather than replica count alone.
5. Do not restart stateful or trading-critical services as a generic repair; follow project-specific preauthorized recovery policy.
6. Document the precise uncertainty and escalation threshold. A safe hold is preferable to duplicated work.
