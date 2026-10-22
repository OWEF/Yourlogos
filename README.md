# YourLogos — Web V1

Mobile-first philosophical discovery app. The current version is a static website hosted on Railway and sourced from **OWEF/Yourlogos**, branch `main`.

## V1 interfaces

**Encounter**
- One featured daily quote, followed by additional perspectives with vertical swipe.
- Tactile spring-like quote transitions, animated heart likes and compass Discover sheet.
- Likes are stored in the current browser; no account sync.
- Floating three-icon navigation: Encounter / Library / Constellation.

**Library**
- Six glass-inspired cards in a two-column, three-row mobile grid: Stoicism, Existentialism, Nihilism, Skepticism, Daoism, Buddhism.
- Original vector illustrations and subtle responsive material effects.
- Tap a school for an introduction, a central question, key thinkers, philosophical tensions and one optional reflection.
- Content and card art live in `schools.js`; this first release is editorially curated and expandable.

**Constellation**
- Experimental representation of liked quotes and attention. Does **not** infer philosophical beliefs from likes.

## Architecture

Pure `index.html`, `styles.css`, ES module `app.js` + `schools.js`, and a service worker `sw.js`. No backend secrets, database or framework are necessary for V1. Railway serves the static files directly.

Offline assets are cached by `sw.js`; bump the cache identifier whenever critical assets change. The service worker prefers fresh network content while online.

Run a local static HTTP server to preview (`python3 -m http.server 8000`), rather than opening `index.html` directly with a `file://` URL (ES modules require HTTP serving).

## Known limitations and planned work

- The original theme-selection onboarding remains as V1 scaffolding and needs the agreed more-personal curiosity-led redesign.
- Quote catalog currently contains a limited 20-quote sample. Before expanding it, verify wording, translations, attributions and primary sources.
- Discover presents initial prompt-based context, not deeply curated philosophical counter-voices.
- Likes, interests and practice traces use browser `localStorage`. Clearing browser data removes them; no cross-device synchronization or login. An older Expo app's SQLite data is **not** automatically migrated.
- The card illustrations are original symbolic SVG drawings, not verified portraits of historical figures.
- No actual iOS home-screen widget, paid subscription, live AI companion, or individualized belief inference yet.

## Future data architecture

No Supabase dependency for V1. Add a backend when we need signed-in accounts, cross-device preference/fingerprint sync, an editorial publishing workflow, consented user reflections, content analytics, or recommendation systems. If Supabase is adopted, use a **separate** YourLogos project, enforce row-level security for each user's private data, and never ship secret service-role keys to the browser.
