# YourLogos · Design and interaction contract

## North star
A quiet intellectual autobiography: people encounter philosophy, preserve thoughts,
and discover patterns in their curiosity over time. It must never score intelligence,
reward compulsion, or pretend to know what a user believes.

## Canonical visual identity
The established dark near-black surfaces, muted gold highlights, warm ivory body text,
Cormorant Garamond / Libre Caslon Display headlines and DM Sans utility text are
canonical. `styles.css` and `v22.css` own the inherited visual language.
`daily-arrival.css` and `world.css` extend it without redesigning the Encounter
quote composition or the six art-backed Library schools. The bottom navigation is
the existing glass dock; one discreet profile button accesses Settings.

## Primary destinations
1. **Encounter**: original quote screen, Discover, gentle optional daily presence light.
2. **Library**: original six philosophical traditions and detailed school pages.
3. **My World**: personal landing with Living Sky, Saved Thoughts, Fingerprint
   and Philosopher's Mirror.

Living Sky keeps the existing `cosmos-v2.html` immersive iframe and gesture system.
A quiet back affordance returns to My World. No permanent export controls float
over celestial formations.

## Daily behavior
Daily featured quotes are deterministic for the user's local date, stable on reopening,
and freshly cycled over the complete curated collection. A foreground resume across
local midnight refreshes the daily encounter. Tomorrow preview in Settings is
strictly non-mutating. All dates are device-local and are not proof of attendance.
The arrival lights are voluntary, never streaks, and missed days have no penalty.
Honor `prefers-reduced-motion`.

## Personalization and privacy
The display name is safely escaped on output, opt-in, and locally persisted until
verified-email authentication with consented sync exists. The greeting never changes
or is embedded inside a philosopher's actual quotation.
Email and user data must never be treated as verified merely because someone typed
an email address or nickname. No secret Supabase credentials in the browser.
Only a dedicated YourLogos Supabase project, with owner-scoped RLS, may store
user quotes, responses or history. Do not silently migrate anonymous data to a
signed-in account or mix users' local histories.

## Philosopher's Mirror
An editorial, explainable similarity experience, not a typology.
Use multiple explicit signals: saved themes, Discover responses and lenses.
Show **an unfinished portrait** until a minimum evidence threshold is met.
Matches may evolve; a match never implies philosophical agreement.
Historical portraits require appropriate Wikimedia licensing and credit.
Include a full fallback if a remote portrait is inaccessible.

## Interaction contract
Quote saving retains stable legacy indices and must update Sky. Meaningful links
in the personal sky only exist after a recorded exploration. Predetermined
philosophical affinities may propose questions, but are not automatically drawn
as personal relationships. The sample-evolution graph is clearly illustrative.
Profile/settings sheet must be reachable from every primary destination.
Preserve accessible labels, visible keyboard focus, and modal escape behavior.

## Motion and touch contract (V2.8)
- Preserve the existing three-tab structure and glass dock; do not introduce a fourth primary destination.
- The bottom glass dock stays mounted independently of screen updates, so the active pill physically glides between targets without resetting.
- At pointer-down, nav and important action controls visibly compress and emit a gentle light wave. On selection, the icon gives a brief spring response and the incoming content moves a small distance in the navigation direction.
- Never hold back navigation for an animation. All interactions must function without motion, including when prefers-reduced-motion is enabled.
- Web-only iPhone Safari does not expose a generic Taptic Engine API; use truthful visual feedback with native vibration only on supporting hosts.
- Protect the currently approved Encounter, Library and My World hierarchy, quote readability and living sky gesture system.

## V3.0 — dependable routes and interactive learning
- The account icon opens a full in-app Settings route, not a modal overlay. The previous destination remains the context for Back. It must work on mobile Safari even when overlays, transforms or iframe layers are present.
- The Living Sky hosts its Back control directly in the body, beyond the iframe and animated viewport. Returning to My World must restore its landing tiles.
- Quote typography is larger and semibold where space allows; long quotes use responsive density classes rather than overflowing mobile height.
- Each Library school offers two one-question encounters with three plausible choices, an animated philosophical tension axis, and short editorial interpretation. This is not a right/wrong quiz and does not assign scores or personalities. Long-form copy is available under a collapsed deep-dive.
- Distinct historical images remain attributed. Prefer same-origin prewarmed reduced-size artwork; keep a remote Commons fallback if the thumbnail fetch fails.
- Verify mobile taps/back/focus, slow image loading, alt/fallback, reduced motion and cloud guest mode before release.

## Release gate
Review JavaScript syntax, quote IDs and rotation, RLS policy SQL, navigation,
Discover, Sky, Saved, Library, Mirror, Settings, iPhone touch/scroll/safe-area
and returning after the date changes. Never claim verified email sync until a
dedicated Supabase project and its callback settings have been deployed and tested.
