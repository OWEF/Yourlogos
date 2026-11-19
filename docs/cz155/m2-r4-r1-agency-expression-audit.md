# CZ-155 M2 R4 R1 — Consequential agency & Expression fidelity audit

**Immutable review baseline:** `ebd9a9f783674ae0a37c6cb320944e9e0b34ba85`. **Scope:** PR #248, isolated and draft. Source: inherited ID 47, Epictetus, George Long, *Enchiridion* §1. No editorial admission or production authorization. New source/scenario/bridge versions are `cz155-author-proof/3`, `public-laughter/3`, `cz152-narrative/3`. Director ledger and three-engine version unchanged.

## Editorial choice: proportionate public agency, without rewarding it

The independent group-thread notice is identical across all first messages and explicitly provides a place to post. After the initial **private apology with context**, a participant may now post **one short, first-person admission** in the existing fictional group thread, addressing their own interruption rather than identifying or diagnosing the friend:

> Yesterday I laughed before the idea was finished. That interrupted the discussion. I want to hear the full idea when we revisit it.

The post is **completed now** in the fictional interaction. No read receipt, other member response, forgiveness, improved meeting, spoken correction or successful repair is invented. A short public post can account for a public interruption without exposing private conversation content; still, doing so might renew unwanted attention or make the recipient uncomfortable. That genuine downside is preserved in the selected counterexample. It is not awarded a badge, privileged UI color, or preferred decision score.

## Six-path failure matrix — before and after this R1

| Path | R4 baseline R1 failure / unresolved tension | R1 truthful participant-owned follow-up | Selected reason warrant | Path-relevant counterexample; why it is not generic advice |
| --- | --- | --- | --- | --- |
| `acknowledge → invite` | Invitation might appear to settle the problem; reply remains unowned | Send a **second private message** offering an optional conversation. No conversation occurs | `dialogue_opening` | Optional invitation can respect space, yet tomorrow's group discussion is unaffected; sending is within agency, accepting is another person's choice |
| `acknowledge → correct` | Written public-correction plan could be mistaken for correction | Privately **write a possible public acknowledgment** for tomorrow; no post now | `preparation_vs_action` | Preparation avoids an unsolicited public post, but cannot secure tomorrow's opportunity; self-governed preparation differs from its future success |
| `request → name_harm` | Future commitment is not completed public accountability | Send **private conditional promise** to acknowledge the public interruption if given the floor | `public_action` | Promising protects privacy now but may go unfulfilled; present promise, uncertain occasion, and another's judgment are distinct |
| `request → leave_request` | Abstention might be wrongly treated as ethical completion | **Send no second message**, decide privately to listen before criticizing if an opening comes | `continuing_repair` | Silence can respect space but leave public interruption unaddressed; Stoic self-government is not a rule to always abstain |
| `explain → unqualified` | **Main R1 change:** previously another private promise; no action in the public arena | **Post the acknowledgment to the fictional group now**; independently observe its completion but no reactions | `public_post` | Public attention may be unwelcome, while not posting may leave the interruption publicly unanswered. Own action is completed; assent and repair remain external |
| `explain → prepare_question` | A private question draft is not actual listening | Privately **draft a content-oriented question** for tomorrow; nothing asked or heard | `preparation_vs_action` | Preparation can be deliberate, but neither asks the question nor guarantees opportunity; may help without publicly addressing interruption |

The two private preparations share **one legitimate philosophical inference** about planning versus performance. Their concrete private notes, relevant possible values, and first-person action recaps remain different. Sharing an inference does **not** rank or equate their interpersonal merits. The completed group post and the conditional promise explicitly **do not converge**, even though both involve publicly acknowledging the same prior laughter.

## Five interpretive classes: why Epictetus is needed, without dictating etiquette

1. **Completed public post:** The public act is in the fictional participant's control and recorded; public reception and repair are not. Epictetus distinguishes the chosen act from other agents' judgments. Whether it was tactful to post publicly is an unresolved ethical trade-off, not a Stoic verdict.
2. **Private promise:** Sending a conditional promise is already a present action, but promising is neither carrying out public correction nor causing an opportunity. The §1 agency boundary clarifies this distinction without commanding the choice to promise.
3. **Private preparation (two routes):** Drafting a plan or question belongs to the participant's present activity; a meeting slot or another person's response is not the participant's to guarantee. A participant can prefer or reject private preparation while grasping the premise.
4. **Optional dialogue:** Extending an invitation is within the participant's agency, whereas obtaining another person's consent is not. A participant can argue that further outreach is intrusive while understanding the Stoic distinction.
5. **Restraint:** Choosing not to send another message is action by omission, not completed listening or public accountability. Nothing in §1 establishes that waiting is intrinsically virtuous or that public correction is required.

**Comparison against generic relationship advice:** “You should apologise,” “give your friend space,” and “be the bigger person” rank possible choices without proving the relevant boundary of agency. The five source-bound analyses instead distinguish the **already completed chosen act**, the **private commitment or preparation**, the **independent group's announced situation**, and **uncommandable assent and results**. A skeptic may reject Epictetus's claim that chosen judgment occupies a categorically different place from external outcomes, while still understanding how the claim is applied.

## Path-selected Expression policy

The reusable shared engine now accepts an optional complete set `{qualification, compactLimit, counterexample}` on a source-authorised, fact-selected decision warrant. Validation rejects incomplete packages. In a path that declares the complete set, both the qualified inference and relevant counterexample are mandatory in the **full** output, and its qualified compact limitation is mandatory in the **compact** output. Strict length/section constraints are unchanged: **40–65 compact, 80–120 full**, no generic fallback if a necessary clause cannot fit. Other philosophers and source records retain their original global fields unless they opt into the same reusable contract.

The exact **real outputs**, each with source warrants, fact predicates, selected qualification, exact three section texts, word counts, plus Reasoning and Emotion payloads, are generated by `tests/yl-cz155-expression.test.mjs` as:
- `epictetus-six-paths.json`
- `epictetus-six-paths-literal.md`

Both are in the **exact-head CZ-155 GitHub Actions evidence artifact**, alongside mobile screenshot captures, stored-state checks, and a real-playwright recorded unedited journey of the completed public post.

## Counterfactuals — analytical comparisons, not events

| Alternative outside the canonical fiction | Completed post route | Promise or private-plan routes |
| --- | --- | --- |
| Friend replies positively | The post still happened; positive sentiment does not prove a repair of the public conversation | A promise or plan remains a promise or plan. Positive sentiment does not retroactively turn it into completed public conduct |
| No reply ever arrives | The post still happened; others' assent and long-run repair remain unverified | A private message or plan is still recorded; no reply does not automatically require or prohibit a public action |

Neither alternative can be added to `encounter-events/1` as an observed fact; `replayEncounter` must reject both when forged. No motive for silence or expectation about another person is inferred.

## Release gate

The final exact-SHA automated evidence is engineering-only. Independent QA must separately judge narrative stakes, comparison with generic advice, source fidelity, review of the real captured app, and whether an uncoached person would understand the distinction before reading the final explanation. **No merge, deploy, staging change, sealed CZ-154 access or founder review.**
