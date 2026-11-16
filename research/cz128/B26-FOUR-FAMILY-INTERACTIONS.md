# YourLogos Encounter B2.6 — Four Core Interaction Families

**Status:** Founder-authorized design + engineering kickoff; **WIP, nonproduction only**.
**Linear:** https://linear.app/czd217/issue/CZ-141/encounter-b26-four-playful-universal-interaction-families-founder
**Engineering baseline:** PR #215 SHA `576743a354a961a35b35bf58f8b61f655c43d190`.
**Independent QA baseline:** PR #216 SHA `263de69be20e33fc6cad4776a99bb8bf73948453`.

## Product decision

The old six *user-facing* mini-games are replaced with **exactly four** reusable, casual tactile interaction families. This is a presentation/selection change, not a simplification or rewrite of the verified philosophical reasoning model.

1. **Balance & Move (`balance_move`)**: combine Trade-Off / Token Studio / Value Balance into resource movement with a slider *and* tangible draggable/tappable pieces using one canonical allocation state. No sorting puzzle, no win/lose state.
2. **Decision Cards (`decision_cards`)**: preserve the original large tap-to-choose boxes and short state-dependent branching; swipe may be optional but never required. No maze or memory game.
3. **Tap & Pair (`tap_pair`)**: pair two of **at most six** large illustrated source-authored cards; default four; only source-warranted relations/tensions, multiple permissible relationships, no memory-match objective. New pair/relation reasoning is a distinct bounded capability. If not supported, return `capability_research`, not a fabricated READY.
4. **Flip & Reveal (`flip_reveal`)**: effortless flip of 2–3 large cards to view authored hypothetical possibilities, with reader response where the source warrants it. No prediction or claim the reader caused the revealed event.

### Design direction
Casual-game-level tactile pleasure, YourLogos-level sophistication. Retain the current app's charcoal, ivory, amber, sage and coral system, pixel philosopher assets and typography. Add restrained motion, snapping, soft easing, small reveal animations and optional sound/haptics (off by default). No neon / copies of reference games. Reduce interaction effort: clear within ~5s, satisfying in ~10–20s, **no countdowns**. Minimum 44px interactive targets, keyboard/tap/VoiceOver/focus equivalents, reduced-motion/low-power fallback. Progressive screen flow, rather than a giant card catalogue.

## Source-generalized system

```text
versioned philosophical source + scenario + provenance
               |
  one four-family compatibility selector
               |
    accessible tactile interaction
               |
    validated canonical choice packet
               |
 Reasoning -> Emotion Strategy -> Expression
               |
      Play -> Discover -> Remember
```

**Reusable components ≠ every quotation forced into every game.** The UI components accept versioned source-authored inputs. Eligibility must be grounded in source warrant, epistemic limits, scenario shape, evidence-backed choice and typed operations; show `no_fit`, `needs_source_review`, or `capability_research` when unsupported, with a non-game reading fallback. Do not select based on philosopher names, hard-coded quote IDs or animations.

Single conceptual selector evaluates *four peer families*, returning: `{sourceRecordId,sourceVersion,sourceFingerprint,eligibleFamilies,excludedFamilies:[{id,reason}],selectedFamilyId,canonicalChoiceSchema,reasoningOperation,selectionTrace,status}`. Preserve version hashes, refusal cases and source limitation metadata.

| Four-family UX ID | Existing internal capabilities to reuse | New capability |
| --- | --- | --- |
| balance_move | trade_off, token_studio, balance_of_values; numeric allocation, conservation, repetition/conversion | Single gesture state, object motion, accessible slider/tokens |
| decision_cards | decision_map, swipe_decision; typed branching, agency | Large choice-card renderer, transition and back/edit |
| tap_pair | **No valid legacy equivalent** | Authored concept graph + relation/tension evidence operator, pair-specific canonical packet |
| flip_reveal | future_reveal; staged authored hypothetical narrative | Flip-card reveal renderer, explicit stage/agency distinction |

Do not merge six old source records into one synthetic case. Canonical choices in old models must remain semantically identical when used with the new visual families. The prior six IDs may remain private regression/compatibility tokens but are not six separate UI choices.

### Typed contract examples (schematic, not trusted user inputs)

```ts
type CanonicalChoice =
  | {familyId:'balance_move'; amounts:number[]; budgets:number[]; repetitions?:number}
  | {familyId:'decision_cards'; path:string[]}
  | {familyId:'tap_pair'; pairs:Array<{aId:string;bId:string;relationId:string}>}
  | {familyId:'flip_reveal'; actions:Array<
      {type:'choose_start';optionId:string} |
      {type:'explore_authored';sceneId:string} |
      {type:'choose_response';optionId:string} |
      {type:'read_retrospective'}
    >};
```

Each source-bound packet carries proven `sourceRecordId`, `sourceVersion`, `sourceFingerprint`, `reasoningOperator`, `sourceWarrantIds`, `limitations`, `canonicalChoice` and `provenance`. Authentication must happen **server-side against an immutable registered source**; client-supplied approval flags never grant admission.

### Tap & Pair admission contract

An authored relationship graph declares a small set of cards with ids, accessible plain labels and image references, along with a source-bound set of permitted relationships of the form `{aId,bId,relationId,sourceEvidenceIds,claim,limitations}`. Each pair created is user-authored; only relationships grounded in the source and admitted by the graph become READY. Cards that look attractive but lack source warrant must not produce an invented interpretive claim. No fake score or mandatory one correct match.

### Flip & Reveal epistemic boundaries

The reader chooses a start or an exploration path, views source-authored fictional developments with `EXPLORE_ONLY` provenance, optionally chooses a later response and reads retrospective meaning. Different scene labels with the same ID must remain scoped to earlier user choice. Rewinds and revisions clear downstream choice dependencies. Neither UI nor text may imply factual future knowledge.

### Downstream invariants

- Existing source-authenticated Reasoning kernel and fixed admissibility standards preserved.
- Emotion selects *rhetorical strategy*, not inferred reader feelings, politics, virtue or identity.
- Expression returns exactly three sections: Your Choice; Back to the Philosopher (source-linked teaching card); One Last Thing… with **80–120 total words**, section **10–48 / 18–65 / 9–26**; fail closed if preserving source qualification exceeds bounds.
- Quote Like remains separate. Existing account data, My World storage, sync, offline and consent boundaries untouched in B2.6. No fake saved state.
- External scholarly signoff is deferred for *internal development*, never claimed to have happened; publication/release still separate.

## Delivery sequence / acceptance

**A.** Contract + four-family registry + one source-driven selector + refusal paths; existing B2.5 regression, original four output equivalence, all eight Kierkegaard routes. Independent red-team negative tests.

**B.** Actual four tactile vertical slices in isolated browser at 320,390,430,1024 px; source-authored Tap & Pair operator, strong mobile UX, keyboard/VoiceOver labels and reduced-motion. All four must complete to a truthful three-section Encounter; don't use placeholder screenshots as proof of functional QA.

**C.** QA-only exact-SHA independent holdouts for diverse authors/scenarios, unexpected sources, invalid pair/false claim, malformed allocation, agency-order, unsupported philosophy/no_fit, expression limits, touch/keyboard/accessibility basics, network/storage safety and visual consistency.

**D.** Deliver one coherent, code-backed candidate with 390px screenshots, concise user-journey explanations and exact-SHA evidence **for founder review only**. No merge, deploy, public preview, paid services, database/account writes or invented physical iPhone / five-person study evidence.

**Do not** mark completion while Tap & Pair's real meaning adapter or any one of the four experiences remains a fake/placeholder. Do not require an external independent scholar signature to begin isolated work.
