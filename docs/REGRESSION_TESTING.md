# YourLogos — Regression Testing

**Tracking:** [Regression Assurance (separate Linear project)](https://linear.app/czd217/project/regression-assurance-cross-project-2af58a83bbf9) · [UI issue CZ-24](https://linear.app/czd217/issue/CZ-24)

## Known risk / expected behavior
| Area | Symptom to monitor | Root cause | Fix | Executable regression test |
|---|---|---|---|---|
| Discover / Encounter | choices or interludes disappear | Not verified for historical reports | No production changes | `tests/discover-encounter.test.mjs` |
| LilLogo autonomous UI | idle character becomes static or acts only on tap | Not verified | No production changes | `tests/lillogo-presence-regression.test.mjs` |
| Philosopher gallery | portraits or cards disappear | Not verified | No production changes | `tests/philosopher-gallery.test.mjs` |
| Studio | pages/API accidentally break | Not verified | No production changes | `tests/studio.test.mjs` |

## CI and manual coverage
- Existing Discover and Studio workflows remain in place.
- Dedicated LilLogo guard uses a deterministic fake DOM and checks autonomous idle timing, reduced-motion and initial controller load. **Not** a visual screenshot comparison.
- **Gap:** add Playwright mobile viewport screenshots, visual baselines, touch/keyboard usability and real iPhone review before claiming UI visual quality is secured.
- Never store secrets, real users' choices or private studio data in tests.

## Bug template
**Symptom:** / **Environment and reproduction:** / **Expected vs actual:** / **Root cause (verified/unverified):** / **Fix/PR:** / **Regression test:** / **CI run:** / **Production verified?:**

Every bug fix should link both its Linear issue and GitHub test. A green test means the checked behavior passed, not that every visual state is correct.