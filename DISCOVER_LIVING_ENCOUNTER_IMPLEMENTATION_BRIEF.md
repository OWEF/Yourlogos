# YourLogos — Discover Living Encounter implementation brief

**Status:** Approved design direction; implementation specification. Not a shipped feature.
**Repo:** OWEF/Yourlogos
**Working branch:** feature/discover-v2-living-encounter-20261029
**Baseline:** Discover v6 in main at 5521054c75c7014d9943d90a9b625b03aa77bcd1
**North star:** Duolingo-like aliveness in the companion, but a distinct YourLogos experience: an encounter with philosophical tension, not a gamified quiz.

## 1. Scope and preservation contract

Keep three primary destinations exactly as they are: Encounter, Library, My World. Discover remains an experience launched from Encounter; no fourth tab, new onboarding gate, new mandatory sign-in or breaking change to the dock, quotes, saved thoughts, My World, Library, Living Sky or profile. Preserve dark charcoal, restrained warm gold, ivory typography, the original LilLogo character, the present explicit DeepSeek consent gate, existing quote ID mapping and opt-in saving behavior.

Enhance three linked areas:
1. **Living companion:** LilLogo moves autonomously while reading, not just after taps. It reacts to user input without becoming a nagging streak mascot. Its body, head, eyes, hair and scarf can eventually move independently.
2. **Philosopher presence:** Give thinker a recognizable, handmade warm pixel portrait, confidently sized name, legible type and source affordance.
3. **Philosophical interaction:** A recognizable dilemma with three meaningfully competing responses; a choice-specific continuation in the same scene; a concise insight that does not rate the person.

## 2. Grounded current architecture and important limitations

- app.js owns app state, Discover opening, network turn requests, tap handlers and the full app render. The full app subtree is replaced on each render; any mounted companion element is therefore also replaced.
- discover-ai-client.js returns the Discover HTML including choice cards, progress, LilLogo stage and thinker attribution.
- discover-ai-server.mjs creates/validates three-turn DeepSeek JSON. It already contains helpful v6 guardrails: scenario continuity, choices from the visitor's perspective, truthful selected direction, and rejection of canned praise.
- little-logo-poses-v5.webp + little-logo-poses-v5.css are **eight full-body painted poses**, not a jointed/rigged character. Repositioning the sprite alone is NOT independent facial or body motion.
- little-logo-discover.css and little-logo-live.css implement stage wander, breathing and certain visual effects. They still leave pose identity mostly event-driven, and some old raised landscape/ridge styling separates character from content.
- little-logo-fx.js is an event-driven particle accent; it is not an idle state controller.
- On the working branch, philosopher-portraits.js (original SVG pixel portrait prototype) and little-logo-presence.js (ambient timer prototype) have been added, **but are not yet imported, wired or validated in the app**. They must not be described as a deployed implementation.

## 3. Component architecture

### Logical ownership

- **DiscoverController (existing app.js; reduce coupling gradually):** owns quote, current turn, loading/error/complete, selected option, consent, save; independent of animation timing. Never lose or duplicate submitted choices when UI rerenders.
- **DiscoverSceneRenderer (existing discover-ai-client.js):** renders philosopher identity, observation, dramatic question, three alternatives, reflection and stable companion mount location. Render text escaped; never HTML from model.
- **LilLogoRig (new, e.g. lillogo-rig.js plus layered authored art):** persistent stage with independently addressable head, eyes, hair, scarf, torso/arms and shadow. Start by reusing approved LilLogo silhouette and painterly treatment. The eight-pose atlas is a safe fallback when layered art isn't ready.
- **LilLogoPresence (little-logo-presence.js, working-branch prototype):** schedules gentle autonomous behavior while idle, pauses when hidden and with reduced-motion. Must distinguish intentional answer reactions from spontaneous idle states and never override an in-flight reaction.
- **LilLogoStateMachine (new lillelogo-state.js or equivalent):** single source of truth for ambient mood, explicit response mood, stage transition and priorities. Avoid simultaneous competing CSS rules across legacy files.
- **ThinkerPortrait (philosopher-portraits.js prototype):** sanitized author-name lookup -> authored pixel portrait; safe consistent fallback. Only curated recognized identities should imply an actual philosopher.
- **DiscoverPresentation CSS (new discover-living-encounter.css imported LAST):** mobile first stage and typographic hierarchy, reduced-motion styling, suspense/reveal. Refactor old conflicting !important rules cautiously.

### Proposed DOM structure

Discover screen
  > persistent compact companion / character stage
    > ambient light and subtle shadow
    > character rig or eight-pose fallback
  > thinker identity row (pixel portrait, full name, optional source)
  > one primary philosophical hook
  > one concrete scene / short observation
  > choices OR reaction-only interim OR final insight
  > private mode, save and exit controls

Design **one stage**, not an upper animated illustration followed by a visually disconnected scenic container. Remove or subordinate the oversized ridge/orbit and excess blank landscape. The thinker portrait is an anchor in the content; LilLogo is the persistent companion, not an illustration on each card.

### Rendering constraint

Because app.js rebuilds innerHTML on every interaction, mount LilLogo into a stable dedicated element that survives question-state changes (preferred), or explicitly preserve/reattach it without visual restart and restore its state. Do not use re-render on each random blink. Never create interval-per-render leaks. A singleton controller/MutationObserver with explicit teardown is acceptable only as a provisional step; test that it never reacts over user-controlled moods.

## 4. State machines

### Discover stages

- OPENING: user enters Discover; show source/thinker, warm ambient idle, and consent if needed.
- QUESTION: present one scenario, one conspicuous philosophical question, three equally defensible responses.
- ANSWER_SELECTED: immediately mark option, stop double taps, begin fading choices without delaying API request.
- REACTION_SCENE: question/choices retract; LilLogo remains visible and reacts to selected response. Avoid faux success or implied psychological conclusions.
- THINKING: pending DeepSeek result. Tiny gentle animation, no freeze and no artificial wait; announce loading accessibly if it lasts.
- REVEAL: reveal next scene grounded in the *actual selected answer*; resume idle motion.
- FINALE: concise human-sounding realization plus optional Keep in My World or End.
- ERROR: show understandable retry and private-mode exit; keep the same prompt/choice and never silently increment turn.
- REDUCED_MOTION: same steps and requests without motion or deliberate pauses.

### LilLogo moods and transition precedence

Priority: hidden/reduced-motion > active response/reaction > thinking > ambient idle.

- idle: soft breathing, independent occasional blink, small hair/scarf secondary motion; never an image drifting endlessly across the stage.
- glance: brief head/eye attention shift after periods of reading, non-intrusive; no guilt or persistent staring.
- curious: gentle head tilt and slight lean toward question.
- thinking: slow focused gaze / subtle tilt; avoid looping exaggerated body rocking.
- reflective: small lowering of gaze with calm return.
- surprised: short single accent; no repeated star explosions.
- delighted: brief lift and soft light on a completed reflection, not a reward score.
- encouraging: friendly receptive return.
- asleep/paused: page background or offscreen; pause timers and expensive motion.

**Idle rhythm:** always-present low-amplitude CSS breathing, light blink at non-uniform intervals (roughly every 4–9 s); after roughly 6–13 s allow a gentle glance; after 15–25 s a quiet thought/curiosity gesture. Interleave long rests, not continuous theatrical motion. When user interacts, explicit reaction takes precedence and hands control back to ambient behavior. Choose durations after real iPhone review, not as hard product commitments.

**Technical:** CSS transforms on composited layers, no animation-frame polling, no repeating network requests, respect visibilitychange, reduced motion and battery considerations. Reactions may be timed but must never block request dispatch.

## 5. Discover scene timing and interaction

1. User taps a response. Preserve exact choice text and previous actual question/history; submit promptly.
2. Give immediate tactile-visual confirmation (0–120 ms). Prevent duplicate API submission.
3. Fade text/cards into an independent LilLogo-only response stage (~150–300 ms).
4. LilLogo performs a short answer-appropriate gesture (~500–900 ms); while network is pending, settle into thinking, not frozen pose.
5. On receipt of valid model response, transition to REVEAL without adding an unnecessary fixed delay. Reintroduce observation/question/three choices in sequence; return LilLogo to ambient.
6. Final turn brings restrained conclusion and user-initiated keep/end; only explicit Keep persists a reflection.

If the network responds early, ensure transition is legible; if slow, show a calm in-stage accessible loading label; if error, preserve context and offer retry. The UI is responsive on low-end devices and remains usable without motion.

## 6. Philosopher identity system

**Hero roster v1 (16):** Socrates, Plato, Aristotle, Friedrich Nietzsche, Immanuel Kant, G. W. F. Hegel, Karl Marx, Søren Kierkegaard, Seneca, Marcus Aurelius, Laozi, Confucius, Mencius, Albert Camus, Simone de Beauvoir, Hannah Arendt.

Asset registry per thinker: normalized stable ID, canonical display name, optional era/school, portrait SVG or transparently composited WebP, short attribution/source (where verified), attribution/fallback state. Keep portraits original editorial artwork, not third-party copied images. For visual accuracy, gather reference from licensed/public-domain portraits or canonical sculptures and verify the original source before publishing a likeness. Ancient thinkers often lack reliable likenesses; represent them symbolically or through established sculptural iconography, not inventing verified historical faces.

**Style:** handcrafted ~16–32 logical pixel grid, warm low-saturation palette, clear hair/face silhouette, rounded 48–60 CSS pixel display with crisp edges, appropriate labels, consistent framing. Avoid hyper-realism; recognizable facial signals (Kierkegaard hair, Nietzsche moustache, Marx beard, etc.) but don't caricature.

Existing philosopher-portraits.js on branch is only a prototype with partial coverage (and non-hero extras). Add remaining hero assets, unit-test mapping/unknown fallback and inspect at iPhone scale before wiring.

**Typography target, to tune on actual device:** canonical warm display serif for primary hook ~30–36 px, thinker identity ~17–19 px, observation ~16–18 px, choice text ~16–18 px, utility label no lower than sensible readable scale. Limit simultaneous labels; replace tiny all-caps 'WHAT WOULD [NAME] NOTICE?' with a confident human hook. Keep quotation/source separately accessible, and clearly distinguish hypothetical inspired dialogue from authentic historical quotation.

## 7. Philosophical dialogue quality contract

Existing Discover v6 prompt is a foundation, not something to discard. Retain real choice and question history, limited 3 taps, consent and cost ceilings, validation and correction pass.

Generate:
- A **scene** that can be pictured within three seconds and doesn't trivialize the thinker's actual theme.
- A **tension** between two or more legitimate values rather than three near-identical good-sounding actions.
- **Three directions**, each plausible, non-shaming, semantically distinct (e.g., honesty vs protection vs inquiry), NEVER forced into this exact taxonomy when the philosophy requires another.
- A **consequence or complication** specific to the selected direction, without asserting speculative external outcomes or making a diagnosis.
- A **revelation** that makes the choice's cost/assumption visible while leaving philosophical room to disagree.

Avoid any generic 'good choice', 'you are X person', coercive personality profiling, supposed real-world outcomes, algorithmic morality, protracted lectures, or fake citations. The user should recognize the philosophical idea in their life without being graded.

Keep explicit opt-in saving; completed sessions may inform the fingerprint only as *limited, user-saved evidence of exploration*, never a permanent belief assignment. Consider later showing user a tiny optional 'why this question?' link for interpretive transparency.

Editorial review sample: Kierkegaard/responsibility, Nietzsche/values, Kant/duty, Arendt/judgment, Marx/work, Laozi/action, Seneca/anticipation. For each, inspect scene relevance, realism, three-choice distinctiveness, causal follow-up, accurate original concept and non-patronizing finale. Seek at least one scholar/editor pass on quotations and doctrine, independently of model output.

## 8. Assets and files matrix

| Asset/module | Responsibility | Delivery |
| --- | --- | --- |
| assets/lillogo/base or rig SVG/WebP layers | independent head, eyes, hair, scarf, arm/body, ground shadow | new original rig artwork required |
| little-logo-poses-v5.webp | existing eight-pose fallback | preserve |
| little-logo-presence.js | independent idle tick and visibility behavior | prototype exists on branch; wire/refine |
| lillogo-state.js | priority state machine and transitions | new |
| discover-ai-client.js | structured philosopher header, question/reveal states | targeted edit |
| app.js | Discover state coordination, stable rig mount, choice dispatch | targeted edit only |
| philosopher-portraits.js | pixel portrait registry and fallback | prototype exists on branch; extend/wire |
| assets/thinkers/* | curated hero portrait assets if separate assets chosen | new optional |
| discover-living-encounter.css | typography, continuous stage, responsive layouts, motion | new |
| discover-ai-server.mjs | refine wording and validation without API contract break | targeted edit |
| tests/verify-discover-living.mjs | state, quality and fallback regression tests | new |
| DESIGN.md | link and add editorial/motion contract summary | targeted edit after validation |

## 9. Sprint/checklist

### Sprint A — LilLogo comes alive
- [ ] Obtain/create actual layered LilLogo art, with visual match to current approved character.
- [ ] Provide stable rig container and isolated independently transformable parts; preserve existing pose atlas fallback.
- [ ] Build priority-aware state controller and autonomous idle behavior.
- [ ] Implement pause/reduce-motion/teardown; guard against timer duplication when app.js re-renders.
- [ ] Verify idle motion is noticeable but subtle, and reaction interrupts/resumes it correctly.

### Sprint B — Discover gains rhythm
- [ ] Implement explicit QUESTION -> ANSWER_SELECTED -> REACTION_SCENE -> THINKING -> REVEAL -> FINALE/ERROR states.
- [ ] Keep user-selected direction and historical questions intact; no speculative fabricated choice history.
- [ ] Remove oversize ridge/vertical gap; keep character stage visually continuous with text.
- [ ] Tune staged reveal, long-response loading and retry path on iPhone Safari.
- [ ] Preserve consent, save behavior and correct 3-turn completion.

### Sprint C — Thinkers gain identity
- [ ] Finish curated 16 portraits including ancient-symbolic treatment, reference/license checks and fallback.
- [ ] Introduce portrait/name row, confident title hierarchy, readable choices and source disclosure.
- [ ] Ensure portrait does not impersonate a historical speaker in generated dialogue.
- [ ] Check smallest iPhone text sizes, touch targets, overflow and high zoom.

### Sprint D — Reflection earns its ending
- [ ] Refine prompt/validation, not replace with generic templates.
- [ ] Run multi-path semantic distinctness and attribution/editorial tests.
- [ ] Test quote-swap, exit/re-entry, guest session, AI unavailable, error and private mode.
- [ ] Confirm no automatic psychographic labels or unconsented persistence.
- [ ] Review with original screenshots and the approved emotional direction.

## 10. Definition of done / QA gates

**Experience:** LilLogo visibly breathes/blinks/glances without a tap and without just moving its entire picture; head/eye/hair/scarf are independently controlled when rig art is present. It stays present across all Discover stages. Every answer leads to a new question that acknowledges *that* answer, or to a concise philosophical finale.

**Design:** Thinker appears with identifiable portrait/fallback and readable type; no sharp split between character and conversation; no overcrowded titles, offscreen option, blocked exit or inaccessible privacy control at 320/375/390/430 CSS px widths and high font scaling.

**Technical:** No regressions to three tabs, daily quote, save, Living Sky or Library; existing test script and new regressions pass. No unhandled promises, duplicated timers/API calls, stale DOM animation effects or unnecessary model requests. Visibility/reduced motion handled. Low-bandwidth failures are recoverable. All text escaped.

**Release:** test feature branch first and review actual mobile screenshots; open PR for review; merge only after QA; validate Railway deploy and PWA update behavior before calling it shipped. Do not claim deployment merely because branch files exist.

## 11. Incremental implementation notes / safety

1. Do not drop in a generic CSS head-bob and call it a rig. Layered source artwork is needed for genuine independent motion.
2. Existing prototype's ambient timer may presently reassign mood classes during a request or stage rerender. Address precedence when wiring to production.
3. The present app rerender rebuilds character DOM. Preserve or cleanly remount the actual art and schedule in one place so motion does not reset every tap.
4. The question content quality gap is a product design issue, not a longer prompt alone. Add scenario-specific fixture tests and human editorial judgments.
5. Preserve private mode, voluntary saves and user control: the companion observes, it does not manipulate user time-on-screen.
