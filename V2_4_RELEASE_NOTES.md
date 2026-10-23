# YourLogos V2.4 — Personal World & Quiet Daily Arrival

Status: **feature branch only**. This change is not released or deployed.

## What is ready in the static app

- Restores three main destinations: **Encounter, Library, My World**.
- Keeps the existing Encounter typography and gestures, six-school Library layout,
  and V2.1 cosmic renderer.
- My World landing links to **Living Sky, Saved Thoughts, Fingerprint, and Philosopher's Mirror**.
- Philosopher's Mirror uses explicit saved-theme/Discover evidence and shows an
  unfinished portrait until at least 3 saved quotes and 2 Discover responses.
  It never says the user *is* a particular philosopher as fact.
- Small profile button opens Settings from any main destination, instead of consuming a tab.
- Opt-in local display name for "A thought for you, [name]." Name is escaped and
  saved to this browser; it is **not a verified online account**.
- Quiet daily check-in with a seven-light visualization, no reward/streak penalty,
  and reduced-motion support.
- 42 indexed, attributed or source-labeled quote candidates (22 added).
  Original indices 0–19 are preserved. A seeded full-cycle deck prevents repeating
  the featured quote for 42 consecutive dates; same day reopens return the same
  featured quote. Foreground resume detects a changed local day.
- Settings → "Preview tomorrow's quote" is non-mutating for today's check-in.
- Personal Sky connections now require actual followed conceptual links,
  not an editorial predefined affinity or star maturity alone; sample stage remains illustrative.
- Saved new quote indices 20–41 are mapped to conceptual stars.

## Email account setup NOT YET ACTIVE

**There is currently no dedicated YourLogos Supabase project.** The connected
projects belong to other work and must not be reused. No database or auth service
has been provisioned and no email is sent.

`auth-config.js` intentionally has empty `AUTH_URL` and
`AUTH_PUBLISHABLE_KEY`. Once there is an authorized, dedicated YourLogos
Supabase project, the client is prepared for email magic-link authentication
and reads verified user identity via Auth (not from typed email values).
The browser must contain **only the Supabase publishable key**, never secret or
service-role credentials. Set the Auth Site URL and allowed redirect URL to the
production origin (currently `https://yourlogos-web-production.up.railway.app/`).

Email verification alone is **not cross-device sync**. The existing browser
history remains device-local until we implement owner-scoped sync, consented
import, conflict resolution, and retrieval. Do not silently upload personal
data when an email is verified. The UI explicitly warns about this limitation.

## Planned dedicated Supabase catalogue

Review `supabase/yourlogos_schema.sql` and
`supabase/yourlogos_quotes_seed.sql`. They are **NOT APPLIED**.

- `quotes`: publicly readable only when `is_published=true`; no client writes.
  Seeded rows are pending editorial review and unpublished.
- `profiles`, `user_state`, `user_links`: owner-scoped RLS for verified accounts.
- Client optionally loads only published quote entries from Supabase with stable,
  contiguous `legacy_id` starting at index 42. Offline curated quotes always work.
- Editorial review must verify quotation wording, translations, source citations,
  licensing and duplicate content **before** publication.
- Before enabling account sync, test signup/login/logout, email delivery/redirect,
  state isolation between two accounts, reconnection, offline behavior,
  and permissions/RLS with anon vs authenticated users.

## Review checklist

1. On a narrow iPhone: Encounter swipe, save, Discover, greeting, check-in,
   bottom navigation and Settings profile sheet; no overlap.
2. Library: all six existing cards and school details remain intact.
3. My World: landing, Sky pan/pinch, Saved, Fingerprint, Mirror portrait.
4. Mirror: empty history remains unassigned; known sample history yields
   a transparent, explainable match.
5. Check-in records once per local date; preview never records.
6. Across midnight or after backgrounding, featured quote changes; during
   the same day, it remains stable.
7. Offline cache upgrades, back navigation, empty states, reduced motion and
   settings modal ESC handling.
8. Ensure no personal Sky connections appear without a real recorded link.
9. Quote index compatibility: previously liked quote ids 0–19 are unchanged.

Source checks performed: JavaScript parser checks and quote cycle model test
(42 unique quotes, full-cycle no repeats across 168 simulated days).
**Browser/device end-to-end tests are pending**; do not merge until verified.
