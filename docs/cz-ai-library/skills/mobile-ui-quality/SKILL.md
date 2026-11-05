---
id: mobile-ui-quality
version: 1.0.0
roles: [frontend-ux, testing-qa]
triggers: [mobile UI, accessibility, frontend regression]
---
# Mobile-first UI quality

1. Confirm approved visual reference, intended user action, viewport, browser target and acceptance criteria.
2. Work in the exact allowlisted UI files. Preserve state, authentication and data contracts.
3. Cover text size, safe areas, tap targets, keyboard use, VoiceOver, reduced motion, dark mode, offline behavior and loading/error states where relevant.
4. Prefer small reversible edits, with explicit before/after capture instructions. Avoid visual fixes that hide underlying interaction faults.
5. Run deterministic checks in the independent CI runner. Label Chrome emulation as Chrome emulation, NOT as physical iPhone Safari verification.
6. Require founder visual approval before replacing approved artwork or user-facing choreography.
Stop if the source asset cannot meet the required identity or motion fidelity; document an art-layer dependency instead of claiming a CSS workaround is complete.
