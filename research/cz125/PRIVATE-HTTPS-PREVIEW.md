# CZ-126 / CZ-128 — PRIVATE authenticated HTTPS preview proposal (NOT DEPLOYED)

**Authorization:** NONE for this document. NO tunnel, public hostname, VPN sharing, deploy, paid service, invited user, site publishing or production merge has been performed. This is a proposed way to put the *existing* PR #191 local research prototype on a founder's physical iPhone for study. Existing accepted selector and frozen engines must remain byte-identical.

## Recommended private route: Tailscale Serve (not public Funnel)

Official documentation: https://tailscale.com/docs/features/tailscale-serve
Sharing only with specifically invited identities: https://tailscale.com/docs/features/sharing
iPhone support: https://tailscale.com/docs/install/ios

Tailscale Serve provides HTTPS for a service only within an authenticated tailnet; it respects access rules. Unlike Funnel, it is not a public internet endpoint. Devices must install/sign in to Tailscale or accept an explicitly permissioned machine share. This is appropriate for **founder and individually invited test-reader devices** if the founder agrees to VPN/identity setup. Do **not** enable Funnel, public wildcard access, shared authentication keys, anonymous access or open ports.

**Important blocker:** The current accepted PR #191 loopback research server pins the exact Host header to 127.0.0.1:port and requires same-origin JSON POST with that origin. A naive Tailscale HTTPS proxy may supply the HTTPS tailnet Host/Origin and receive 403. It is **not correct** to claim a Tailscale URL already works. After explicit founder approval, implement a **transport-only, separately reviewed research access boundary** that translates or validates the external authenticated HTTPS host/origin without weakening source, game or publisher checks. Do not silently remove Host/Origin protections or trust arbitrary forwarded headers. Restrict upstream to localhost and prove cross-origin / unauthenticated replay are rejected.

### Proposed operator sequence — AFTER explicit approval only

1. Freeze/check exact candidate PR #191 SHA 73849bff27fc73db97d5fb015c57f45323e18f30 and the original PR #182 HTML blob; run all regressions before exposing anything.
2. Confirm device owner, exact permitted test identities, installation of Tailscale and HTTPS enablement for a private tailnet. Use per-user identity/ACL policies permitting only the research machine/service. **No shared login secrets** or all-members access.
3. Start the existing server on a predictable loopback port, e.g. set CZ128_PORT to 4173 when running the exact PR #191 command on Mac. It must remain bound to 127.0.0.1 and perform all SHA verifications.
4. Validate transport-only proxy/Host/Origin translation with targeted tests. Only then configure a **Tailscale Serve** HTTPS forwarding rule for that local port. Current Tailscale docs show the pattern “tailscale serve 4173”; actual syntax/settings must be verified on the installed Tailscale version and app. Never substitute the publicly exposed “tailscale funnel” command.
5. Use a dedicated short preview window (suggest at most 48 hours per session or cohort) and an explicit access revocation checklist. Remove the route, revoke shared machine access and shut down the local research service after each window. Individual Tailscale sign-ins remain identity-gated. Keep logs minimal; DO NOT log free-text answers or enable analytics.
6. On founder's **physical iPhone** open the private HTTPS URL in Safari only after authenticated tailnet access. Verify full selected Token Studio and Swipe Decision, guest-denial, expiry/revocation, correct source and HTTP response, actual 3-section copy, private recall and lack of unexpected network writes.
7. Record model, iOS/Safari build, actual VoiceOver reading order, rotor/focus, tap/swipe/keyboard controls, dynamic type, orientation, no overflow, reset/undo, connection termination and screenshot or observed defects under CZ-126. This cannot be replaced by Chromium.

All steps require explicit authorization to expose any service, even a private one. No paid service should be enabled. Check current vendor plan limits and any account-sharing restrictions before proceeding.

## Alternative, if the founder does not want an iPhone VPN app

Cloudflare Access plus a named Tunnel, with explicit email allowlist/identity verification, strict application token lifetime, hardened origin Access JWT verification and route revocation; unlike Tailscale Serve, this puts a **public DNS hostname** on the internet and should be treated as hosting behind authentication, **never as private by default**. Cloudflare warns that a tunnel configured before Access policy risks public exposure. It requires founder approval, domain setup and a separate transport-only adapter. Reference:
https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/
https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/

## Independent security acceptance requirements

- External unauthenticated request: **403/deny** including HTML, JS/CSS and all API routes.
- Authenticated reader: only allowed research source IDs; all six peer status recorded, only approved browser games playable.
- Browser Origin/Host controls and CSRF defenses remain valid when proxied through trusted HTTPS boundary; forged Host, X-Forwarded or identity headers refused from untrusted origin.
- Same-source canonical choice reaching the identical accepted Node reasoning and expression content as the localhost baseline.
- No stored responses: Reminder questions remain client-only; no uploads, analytics, hidden writes, tracing of free-form text.
- No source-publication status or production-game availability changes.
- Test user access revoked at the end; HTTP route no longer reachable; screenshots and device metadata preserved privately.
- Log exact transport-only code/CI SHA separately; never claim it is the original accepted PR #191 SHA if even one server file changes.

**Current preview state:** localhost-only accepted research prototype; **no private HTTPS link exists and no physical iPhone test occurred**. The only currently executable real-reader path is a supervised research laptop using the local Node server.
