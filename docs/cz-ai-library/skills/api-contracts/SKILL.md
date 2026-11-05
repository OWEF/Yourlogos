---
id: api-contracts
version: 1.0.0
roles: [backend-apis]
triggers: [API, endpoint, integration, service contract]
---
# Backend/API changes

1. Enumerate callers, schema, auth model, input validation, idempotency, timeouts and failure semantics.
2. Identify the precise affected endpoint and backward-compatibility constraints before editing.
3. Use the smallest allowed patch; no live credentials, database migrations, permissions/RLS changes, billing or production writes without separate authorization.
4. Treat transport errors and ambiguous acknowledgements as possible side effects, not proof of no execution.
5. Test both success and failure behavior with mock/fake boundaries; log only safe diagnostics.
6. Provide rollback instructions and follow-up monitoring signals in the PR.
