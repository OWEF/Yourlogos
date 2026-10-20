# YourLogos — Web Preview

Browser-native mobile-first YourLogos, deployed to Railway as a static site. Features daily philosophy, Sit with it, Question it, local practice history, saved quotes, themes, and export. 

**Important:** This is a first web migration, **not a full fidelity port** of the Expo app. The provided Markdown bundle was reviewed but its raw file was unavailable to the deployment runtime. This web edition currently contains a 20-quote sample adapted from the user's prior source, not the entire 69-quote catalog. Counter-voices are generic probes rather than verified philosopher-specific pairings. No paid billing, user accounts, or cross-device sync yet. Practice is browser-local and should be exported regularly.

Open index.html to preview locally via a simple static server; Railway Railpack detects the root index.html and serves the static site. No secrets required.

## Future migration tasks
- Import/audit complete original quote corpus, with rigorous attribution/source verification.
- Port full custom Sit/Question content and evolve dialectical structure.
- Durable private cross-device storage and auth; explicit migration/import of legacy Expo SQLite (browser cannot access this automatically).
- Privacy, billing, App Store / PWA launch checks.
