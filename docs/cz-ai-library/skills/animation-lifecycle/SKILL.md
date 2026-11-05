---
id: animation-lifecycle
version: 1.0.0
roles: [frontend-ux]
triggers: [LilLogo, animation, interaction state, performance]
---
# State-based character motion

1. Separate character source assets/layers, independently controllable parts, event-driven state machine, renderer lifecycle and visual acceptance.
2. Validate actual independent transforms and proper occlusion/attachment, not only crossfades or whole-image translations.
3. Tie reactions to actual authorized UI/state events; never generate completion responses when persistence failed.
4. Respect reduced motion, hidden/offscreen pause, cleanup and singleton mounts; avoid timers and listeners leaking across routes.
5. Use a tiny testable proof before multi-part animation. No unrelated screens or backend changes.
6. Test deterministic event transitions and absence of duplicate mounts. Frame pacing and character fidelity need separately documented real-device review.
A green structural test does not prove natural emotion, stable mobile frame rate, or founder approval.
