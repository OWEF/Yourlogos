# M2 R4 R2 — Genuine choice availability, fiction-grounded constraints and presentation

**Frozen baseline:** `8275949ea79089d454239cd3a8f5413b5942b71a`, draft PR #248. **Source:** inherited quote ID 47, Epictetus, George Long, *Enchiridion* §1; only development-provisional. The Director's four-beat presentation, `encounter-events/1`, independent notice and five philosophical interpretations remain unchanged in kind.

## Why six paths were unjustified

R1's `followUps[openingMessageId]` supplied two mutually exclusive second-stage options per opening despite all three openings observing the **same independent group notice**, including a place to post. No world fact conditioned public posting on prior private explanation. A participant who acknowledged privately, invited dialogue, or explained their intent could all reasonably post to the same public group thread. Similar restrictions had limited private planning, promises and restraint arbitrarily.

R2 removes the first-ID index. **One source-authored pool of six follow-up actions** is filtered through validated, grounded `eligibility` predicates. The same six actions are available after each of the three opening messages: **18 reachable paths**, all with accurate event replay and full/compact philosophical endings. This is a finite pool of distinct actions, not a new branching stage or added ending merely to inflate engagement.

World facts are derived from the **literal text of the existing independent event**, without changing the event count or authoring others' reactions:

- `first_message_delivered` → “The first message was delivered.”
- `meeting_announced` → “A separate group-thread notice announces that the same idea will be discussed tomorrow, with a place for participants to post.”
- `group_posting_available` → the same independent group-thread notice

The Director checks that `worldEvidence` quotes clauses actually present in `externalEvent.observed`, and requires each selected action's `requiresWorld` facts to be available. `requiresSelf`, `forbidsSelf`, and `forbidsWorld` are also supported, checked against participant fact history and the independent event. No precondition contains a first-choice ID. A forged world condition or an action claiming unobserved availability fails closed.

## Cross-route availability matrix — derived from authored world conditions

| Follow-up action | Preconditions: observed facts | What would make it unavailable | After **acknowledge** | After **request** | After **explain** | Philosophical warrant |
| --- | --- | --- | --- | --- | --- | --- |
| **Optional dialogue** (`invite`) | First message delivered | No first-message delivery; no valid reconsideration stage | Second optional invitation sent | Clarifies already-sent request is optional; no conversation | Second optional invitation sent | `dialogue_opening` |
| **Private public-correction plan** (`correct`) | Meeting independently announced | No meeting notice | Private note prepared | Private note prepared | Private note prepared | `preparation_vs_action` |
| **Conditional public promise** (`name_harm`) | First message delivered **and** meeting notice | Either prerequisite absent | Sent, referring to prior private acknowledgment | Sent, naming interruption for the first time | Sent, referring to prior explanation | `public_action` |
| **Restraint + intended listening** (`leave_request`) | First message delivered | No first-message delivery | No second message | Existing invitation left standing; no second message | No second message | `continuing_repair` |
| **Actual group post** (`unqualified`) | Independently observed group-thread posting surface | No group posting channel in independent notice | **Public post completed** | **Public post completed** | **Public post completed** | `public_post` |
| **Private question draft** (`prepare_question`) | Meeting independently announced | No meeting notice | Private question prepared | Private question prepared | Private question prepared | `preparation_vs_action` |

None of these six actions needs a specific opening message. To be truthful, only **wording**, not availability, varies according to existing self-facts:
- With `requestedConversation` already true, `invite` makes that existing invitation explicitly optional; it does not misleadingly offer a conversation for the first time.
- With `acknowledged` already true, `name_harm` promises a public follow-up without pretending the private acknowledgment never occurred.
- With `requestedConversation` already true, `leave_request` refers to leaving that existing invitation unanswered. Otherwise it simply refrains from another message. `deferredAcknowledgment` is established only where the initial request did **not** already acknowledge the interruption.

These context selections use self-fact predicates, not hard-coded opening IDs. Both a repeated invitation and clarification of an existing invitation are plausible, participant-controlled actions. Excluding the latter simply because the first message asked to talk would reintroduce the restriction under review.

## Complete updated path transcripts and real computed output

The exact-head `CZ-155 isolated Encounter proof` generates the two **full, unabridged** artifacts:

1. `epictetus-r2-all-paths-literal.md`: all 18 literal first messages, identical independent observation, context-correct second actions, actual source-warrant IDs and warrant descriptions, compact and full three-section outputs, per-section and total word counts
2. `epictetus-r2-all-paths.json`: source/scenario fingerprints, all 18 actual Director and Reasoning/Emotion/Expression payloads, full history, warrant predicates, and canonical choices

Those files are generated from the **actual `runPilot` answers on the tested checkout**, not authored sample outputs. They demonstrate that the same action produces the same warrant-sensitive interpretation across opening messages even where first/second action recaps differ, and that the completed public post does **not** collapse into an unperformed promise. The private plan and private question genuinely converge in the narrower §1 distinction between preparing and performing, not in interpersonal merit.

## Conversation separation and agency status

The opening happens under a **PRIVATE MESSAGE** header addressed to the friend. A **separate group-thread notice** appears afterward as an independent external event. If the participant selects `unqualified`, the next scene contains a visible context switch from **PRIVATE CONVERSATION** to **PUBLIC GROUP THREAD**, then a separately labelled and bordered public-thread region showing the completed participant-authored post. Screen-reader role/labels identify the distinct group scene. The saved My World trace also labels the independent event and the public follow-up under a separate region.

- First private message: **sent; delivery observed; reply not observed**.
- Optional second private message or conditional promise: **sent; delivery/reply not observed**.
- Group post: **posted now in the authored fictional thread**. Other members' reads, replies, forgiveness, the future meeting and eventual repair **not observed**.
- Private plan/question: **written now, not performed publicly**.
- Restraint: **no second message; intention to listen if later possible, not completed listening**.

The completed public acknowledgment is **not** preferred by color, score, badges, answer highlighting or wording. Public attention can be unwelcome; an unperformed plan can defer accountability; an invitation depends on consent; restraint can protect space or leave public conduct unanswered. Epictetus's §1 boundary distinguishes participant acts from other agents' assent, but **does not prescribe a single etiquette answer**.

## Action-recap-blind and counterfactual QA

The 18-path tests compare the warranted interpretation, strategy, qualified full and compact source section, question, and refinement basis **without the choice recap section**. For a fixed follow-up across initial messages those philosophical sections are genuinely equivalent; the promise and completed public post are distinct, and the two private preparations share the source-specific performance distinction. The output generator rejects an incomplete path qualification rather than substituting a generic, irrelevant counterexample to satisfy word limits.

For the analytical hypothetical *friendly reply* and the opposite *no reply ever*, each participant-owned action remains what it was. Neither hypothetical is added to the canonical event. Trying to forge observed recipient reactions or a different scenario fingerprint causes deterministic replay to reject the stored history.

## Mobile focus investigation and acceptance scope

**Root cause reproduced and corrected at the runtime, not hidden by a looser assertion.** R1 reported an intermittent 430px `:focus-visible` failure. R2's first stress run reproduced two forms of focus theft: a 320px legacy test found the first option was no longer focused, and at 430px the first option **was focused with a visible ring immediately after Tab** but **lost focus within 120 ms**. Investigation located the cause in `b27-app-runtime.js`: the `social-reflect` action renders the Reconsider scene synchronously, then schedules a `requestAnimationFrame` callback that always calls `question.focus()`. Fast keyboard navigation can reach the first card before that callback fires; the callback then steals focus back to the question. The native Enter/Space restoration in `app.js` can create the same competition.

The correction makes delayed question autofocus conditional: it is allowed when no user-owned focus has entered the game, but **never steals focus from an existing focused control inside that game**. It preserves normal initial question focus and does not change Tab order, visible focus CSS, hit targets, the underlying Director, or the existing strict assertions. The R2 suite still runs the original 320/390/430/1024px keyboard checks and **16 unweakened immediate-plus-120ms tests at 430px** across motion preferences and repeated persisted/reloaded journeys. `M2R4R2-430px-focus-stress.json` records the active element, selector, focus visibility, outline, gap, and retained focus for independent inspection.

**Classification:** a real, user-facing asynchronous focus-steal bug under fast keyboard navigation, *not merely flaky testing*. Corrected in the app runtime; the final exact-head CI run determines whether the fix passed regression.

Evidence must also include an **unaltered real-app mobile video showing both `explain → unqualified` and `request → unqualified` in one continuous recording**, with mobile screenshots and both source-bound results. Independent philosophical/human evaluation remains separate from automated engineering QA.

**Release restriction:** no merge, staging/production deployment, source admission, sealed CZ-154 cases or founder review.
