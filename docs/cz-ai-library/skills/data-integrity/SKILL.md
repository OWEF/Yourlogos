---
id: data-integrity
version: 1.0.0
roles: [backend-apis]
triggers: [ledger, PnL, ETL, account data, deduplication]
---
# Data and financial integrity

1. Define source of truth, timestamp/timezone, currency/units, record identity, fees, reversals and completeness window.
2. Reconcile source rows with derived totals; never infer missing transactions from a plotted line.
3. Make ingestion idempotent and preserve traceability. Distinguish no data, delayed data, transport failure and rejected data.
4. Design before/after fixtures for duplicates, out-of-order events, partial fills, late data and restarts.
5. Keep financial/trading state read-only by default. Position, strategy, ledger and real-money changes are out of scope without explicit approval.
6. Disclose unverified historical coverage and unresolved data holds; do not replace missing numbers with estimates.
