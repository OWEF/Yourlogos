# YourLogos Studio — Founder Command Center

This is a separate private management surface served from **the existing YourLogos Railway service**, at `/studio.html`. It does not change the consumer-facing three-tab interface.

## Four questions

1. **Where are we?** Task-based completion, milestones and delivery stages.
2. **What happened?** Public GitHub commits and merged PRs, fetched by the existing Node server and cached for five minutes. Today's activity uses the last 24 hours.
3. **What's next?** Prioritized backlog, editable board, drag-and-drop status, quick task entry.
4. **Are we ready?** Founder-approved launch gates and a journal for milestones, decisions, blockers and releases.

## Architecture

- `studio.html` + `studio.css` + `studio.js`: responsive client-side management interface, no additional frontend framework.
- `server.mjs` adds `GET /api/studio-feed`, which reads the public GitHub repository server-side. It does not need a GitHub token, Railway API token or Supabase secret key.
- GitHub feed normalizes public commits and recently closed pull requests, and may include production commit/deployment identifiers when Railway supplies them as runtime environment variables. These identifiers are **not** independently verified deployment histories.
- The existing `/api/public-config` provides the public Supabase URL and publishable key; existing Supabase authentication handles email sign-in.
- YourLogos Supabase stores `studio_tasks`, `studio_milestones`, and `studio_updates`. Every table has enabled RLS, ownership restrictions and founder-account allowlisting at the database level. Private records are not stored in the GitHub repository.
- Existing web app files, service worker, consumer flow, database tables and server routes remain intact.

## First-time use

1. Open `https://yourlogos-web-production.up.railway.app/studio.html`.
2. Sign in with the authorized founder email. The founder Auth account must already exist. Studio-requested magic links target `/studio.html` directly; add the exact URL to Supabase Auth's redirect URL allowlist if needed.
3. Open **Task board** and select **Import proposed starter plan**. This creates nine proposed tasks and five milestones. Every task starts **Backlog**, not completed. Only the product foundation milestone is initially Active, as a proposed working stage, not a verified release gate.
4. Update tasks and milestones manually. Merged code and commits populate automatically from GitHub. Add decisions and blockers in the founder journal.

## Interpretation and limitations

- The task-completion percentage is `done tracked tasks / all tracked tasks`, **not** percentage of product shipped. It is not a quality or launch-readiness score.
- GitHub commits and merged PRs are factual development activity, not a substitute for validation, QA, customer research or commercial readiness.
- The public GitHub feed is cached and may be stale or unavailable due to public GitHub API rate limits; it shows up to 75 recent commits and up to 60 recently closed pull requests, not the entire repository history.
- Task planning, milestones, and manual updates sync across authenticated devices. They do not automatically create/close GitHub Issues in v1.
- Railway deployment health is surfaced by the existing live service, while an optional Railway commit ID is included if that environment variable exists. v1 does **not** query Railway's private deployment API.
- This is initially a founder-only management tool, not a multi-tenant team workspace.
- If email Auth redirects fail, check Supabase Auth's allowed URL configuration. Never share a service-role secret or deploy GitHub credentials to browser code.

## Validation

GitHub Actions `.github/workflows/studio-checks.yml` runs:
- `node --check server.mjs`
- `node --check studio.js`
- `node --test tests/studio.test.mjs`

The integration test starts the existing Node server, loads Studio's assets, checks existing public APIs and verifies the protected static paths stay blocked. A complete private-account interaction still requires a founder login smoke test in the browser.
