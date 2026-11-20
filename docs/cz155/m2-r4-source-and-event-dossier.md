# CZ-155 M2 R4 — Source, scenario and event contract dossier

**Scope:** Epictetus Long §1, inherited quote ID 47, isolated development only. **Parent:** M2 R3 `67605e5d9ccc1dea03d56244c0cf51cf5ed93630`. Do not replace `docs/cz155/source-dossier.md`'s authenticated-edition evidence with this scenario revision.

## Authenticated source and interpretive limits

Exact inherited quotation: “Of things some are in our power, and others are not.” Attribution: Epictetus, *Enchiridion* §1, George Long translation, Project Gutenberg eBook 10661. ID 47 remains `awaiting_source_review`, and publication eligibility is unchanged. Distinct Carter-labelled development quote ID 92 remains untouched.

**Warrants carried into R4:** `own_conduct` (chosen words, judgments, and preparations), `external_action` (other people's replies), `mistaken_dependency` (do not treat another person's verdict as the deciding authority over one's judgment), and `continuing_repair` (contextual ethical qualification, explicitly not Epictetus' messaging rule).

**Narrow scenario warrants added:** `public_action` (a conditional promise is not public performance), `preparation_vs_action` (drafting a plan/question is not hearing or publicly correcting), and `dialogue_opening` (offering dialogue is not making it occur). These apply §1's agency boundary to the fictional evidence; none is a verbatim Stoic instruction. A reply may influence subsequent choices without being under the sender's command.

**What cannot be inferred:** the friend read, judged, approved, forgave or rejected; the group notice was caused by the message; tomorrow's meeting took place; the participant carried out an unselected future act; further apology is categorically required or pointless. Epictetus offers no algorithm for interpersonal repair. A well-informed participant can reject this framework.

## Scenario identities / replay

| Contract | Prior | R4 |
| --- | --- | --- |
| Source record | `cz155-author-proof/1` | `cz155-author-proof/2` |
| Scenario | `public-laughter/1` | `public-laughter/2` |
| Narrative bridge | `cz152-narrative/1` | `cz152-narrative/2` |
| History schema | `encounter-events/1` | unchanged |
| Source fingerprint | derived via `fingerprintB25` | regenerated from the updated source/warrants |
| Scenario fingerprint | derived via `fingerprintB25` | regenerated from the updated opening, actions, event, and questions |
| Source-engine contract | shared `universal-three-engine/1.0.0` | unchanged |
| Draft replay | strict schema, version and source fingerprint checks | old R3 histories rejected as stale/incompatible; no silent reinterpretation |

The server still owns the event record, source identity and canonical three-part path. The Director retains one first-message choice, one independently authored observation, and one participant follow-up. A source-authorized map of three reconsideration questions is optional, and existing Emerson scenarios without it use their unchanged default. Literal messages remain concrete UI data; outcomes are never extrapolated.

## New independently authored information

After any initial message:

> Message delivered. No reply yet. A group notice says tomorrow's meeting will revisit the same idea.

The facts are **(a)** first-message delivery, **(b)** lack of reply at that moment, and **(c)** an unrelated group notice scheduling discussion of the same idea. The actual meeting is future/unobserved. The recipient's reading or reaction is not known; second-message delivery and reply remain unobserved. The notice happens identically in all first-choice paths and must be visible in the **Wait** beat before reconsideration.

## Six routes → four warrants

- `acknowledge → invite`: optional dialogue; source-warranted distinction between invitation and other person's answer.
- `acknowledge → correct`: private preparation of a public acknowledgment; cannot count it as public performance.
- `request → name_harm`: message containing conditional public promise; commitment is recorded, enactment is not.
- `request → leave_request`: private decision to listen first and leave the invitation; silence does not determine public conduct.
- `explain → unqualified`: second conditional public promise, semantically equivalent on the agency boundary to the earlier route, despite distinct chronology.
- `explain → prepare_question`: private question about the idea; equivalent preparation boundary to the other private plan, not necessarily the same ethical intention.

The shared Reasoning engine selects a source-authored warrant from canonical facts; Emotion Strategy remains rhetorical only; Expression is constrained to full 80–120 words and compact 40–65 words with section-level checks. If a core qualification cannot fit, return `needs_editorial_review` rather than truncating it.

## Adversarial review obligations

Mask action recaps and compare the four substantive interpretations; test agreement for semantically equivalent public commitments and private preparations, disagreement for invitation vs deferred action, positive/no-reply counterfactuals *without adding them to the story*, forged observations, changed source versions, old drafts, source/quote swaps, and both compact/full word limits. Automated fidelity and visual checks are not evidence of human learning.

**Independent QA verdicts remain separate:** engineering correctness, philosophical fidelity, experiential quality, human learning. Learning requires actual uncoached participants and a novel-transfer probe. Do not activate sealed CZ-154 cases, merge, stage, deploy or change production.
