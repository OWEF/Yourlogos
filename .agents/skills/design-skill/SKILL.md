---
name: design-skill
description: Integrate a supplied UI design or interactive component into an existing product with design-system fidelity, precise scope, responsive behavior, accessibility, regression tests, and minimal dependencies. Use for navigation, mobile UI, animations, design patches, or implementing a component reference without rebuilding the application.
---

# Design Skill

## Goal
Treat visual references as implementation specifications, not permission to redesign the entire app. Ship the smallest production-safe patch that reproduces the desired interaction while preserving the product's existing identity, routes, state and data.

## 1. Inspect before modifying
- Read the repository's actual entry point, framework, build scripts, routing, styling conventions, component location, existing interaction handlers, design contract and tests.
- Record the requested **sole scope** and explicitly identify what must remain unchanged.
- Identify source component dependencies, hooks, props, assets, motion, responsive states, keyboard behavior, and fallback requirements.
- If the app already uses React + TypeScript + Tailwind + shadcn, follow its configured aliases and place reusable primitives in `components/ui` (or its configured equivalent). Create `components/ui` only if appropriate to that architecture.
- If it does **not** use that stack, adapt the interaction natively. Do not migrate the framework or add Tailwind, React, TypeScript, lucide-react, or shadcn simply to paste a component. Explain any feature that cannot be ported faithfully.

## 2. Specify the integration contract
Before writing code, map:
1. The original reference's visual and motion behavior (e.g. liquid selection, droplets, ripple, icon scenes, cursor meniscus).
2. The real product's navigation destinations, active state source of truth, event semantics and route transitions.
3. Its surface colors, typography, spacing, contrast, shadows and existing iconography.
4. Mobile safe areas, small screens, keyboard focus, touch targets, reduced-motion settings and non-WebGL fallback.
5. Existing DOM ownership/lifecycle: overlays, settings controls, persistent nav, focus management, and interactions that must survive re-render.

Keep the component subordinate to the app's state rather than creating a second competing state machine.

## 3. Build the narrow patch
- Create a focused reusable component/module and styles. Scope styles to the target UI; prefer existing theme tokens and icons.
- Reproduce the reference's distinctive interactions where the host platform permits. Adapt palette rather than blindly transplanting the demo background.
- Use existing navigation and keyboard/gesture handlers. Never delay route changes for an animation.
- Add enhancement on top of a working accessible fallback. Respect `prefers-reduced-motion`, device support, hidden tabs, off-screen rendering, low-power mobile devices and context-loss.
- For expensive visual effects, constrain GPU/canvas area, cap device pixel ratio, pause inactive animation, and dispose listeners/resources when the component is removed.
- Do not alter unrelated features, page content, information architecture, authentication, data fetching, schemas, analytics or deployments.

## 4. Verify with regression-first thinking
- Validate syntax/build with the repository's actual toolchain.
- Test every original navigation target and any same-tab reselect behavior. Verify selected state stays synchronized.
- Test mobile Safari/PWA safe area, 320px width, desktop, keyboard arrows/Tab/Enter/Space, touch pointer feedback and modal/settings reachability.
- Test three variants: WebGL working, WebGL unavailable/context lost, and reduced motion. Verify no dead clicks or invisible active indication.
- Check route changes, focus, performance, no console errors and no unrelated changed files.
- Add or update a small automated regression test for the precise interaction; run existing project CI when available.
- When live UI verification is unavailable, state the unverified items plainly. Do not imply screenshot or physical-device testing happened.

## 5. Delivery
Produce a narrowly named branch/PR, a precise file/diff list, tests run and results, and any outstanding risks. Deploy or merge only when the user's requested release scope and available validation make it safe. If a design must change because of stack constraints, explicitly explain why.

## Reference: Nimbus "Waterline" liquid navbar
- `references/liquid-glass-navbar.tsx` is the **original user-supplied React/TSX source**.
- `references/demo.tsx` is the original demo, including its five example items and light palette.
- Reference author credited in source: guglielmogiannattasio.it.
- Use this as an optional component reference for similar requests, **not a mandatory styling template** across every future product.
- The original is a React component with a WebGL shader and CSS fallback. It assumes no extra dependency beyond React. Its demo entries are examples, not navigation requirements.
- For YourLogos specifically, the approved destinations remain **Encounter, Library, My World**, with separate Settings access; keep the approved dark charcoal/warm ivory visual language and persistent dock lifecycle.

## Acceptance criteria for a scope-limited navigation patch
- [ ] Only navigation-related runtime/UI files and the skill documentation change.
- [ ] Existing destination count, labels, paths, content and navigation events remain correct.
- [ ] Selected liquid indicator follows the actual active route, without resetting on app re-renders.
- [ ] 320px+ screens, touch, keyboard, focus and safe-area spacing are usable.
- [ ] Reduced-motion and missing-WebGL modes remain fully functional.
- [ ] Tests/regression check complete; no unrelated user data or infrastructure touched.
