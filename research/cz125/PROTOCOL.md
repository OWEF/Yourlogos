# CZ-125 — Human philosophical comprehension study
Status: NOT VERIFIED (0 of 5 human readers). Pinned integrated prototype: PR #191 at 73849bff27fc73db97d5fb015c57f45323e18f30. This research kit makes no engine, selector or game changes.

## Eligibility and consent
Recruit at least five genuinely distinct, first-time readers who have not worked on YourLogos or its tests. Do not count the founder or AI simulations. Obtain voluntary informed consent; no names, contact details, precise addresses, health data or other identifying information in response forms. Explain: this is an experimental product, source verification remains provisional, people may stop at any time, and quotations/answers may be used only as anonymized internal research evidence. Audio/video requires separate opt-in. Keep raw answers off GitHub, Linear, and public services; store consented exports in a private encrypted folder.

## Research environment
From the exact PR #191 checkout (Node.js 22+, including original PR #182 commit in local Git history), run:
  node experiments/cz128-research-server.mjs
Open the reported localhost address in the participant's desktop browser. It uses the **actual** six-peer selector and existing Token Studio and Swipe Decision; it is NOT standalone offline HTML. No public preview has been deployed. Run a fresh session per person and record pinned candidate SHA, source record, game, canonical choice, viewport, browser, time and observed assistance. Assign two or three readers to each playable passage (Dillard Token Studio and Kierkegaard Swipe Decision), with at least two for each. Choose *source* first; do not override the selector. Unadmitted source, Hegel no-fit, or headless-only source does not count as a playable session.

## Neutral opening — read verbatim
"You will try a short experimental philosophical experience. Work through it however you understand the screen. There are no correct personal choices. Afterwards, please explain in your own words what you understood. The philosophical quotation and scenario are provisional research material. You may stop at any time. Your responses will remain anonymous within this study."

Do not mention the intended philosophical thesis, which outcome is correct, real-life character conclusions, source caveat answer, or the external-event distinction before play. Observe actual usability and record every intervention. Reader completes Quote → Play → three progressively revealed Discover sections. No leading explanations or AI answer simulations.

## Immediate four-question protocol
Prompt unassisted and transcribe **verbatim** using the offline reader response sheet.
1. Consequence: "In your own words, what did the choice you made change in this scenario?"
2. Central thesis: "What do you think this philosopher's central argument was, and how did the example help you understand it?"
3. Limits: "What, if anything, remains hypothetical, uncertain, or unknown after the experience?"
4. Final reflection: "What is the final question or reflection asking you to consider?"

Record hesitation, inability to understand instructions, source claims misread, navigation trouble, and any exact sentence causing a misconception separately from philosophical scores. Any coaching marks the answer assisted, not unassisted.

## Delayed recall — requested supplementary evidence
Administer the **same four unprompted questions before showing the app, earlier answers or notes**, target 24 hours after the first session, with 18–30 hour target range. Delayed recall is a new prospective extension; do not rewrite the original CZ-125 immediate criteria. Keep late responses and mark actual interval. If exposed to the earlier answers, mark contaminated rather than treating as independent memory evidence. Obtain genuine reader answers; no generated recollections.

## Independent human rubric: preserve four 0–2 axes
- **Choice/consequence:** 0 missing or false, 1 identifies an action but weak modeled consequence or agency distinction, 2 accurately describes canonical decision, the modeled implication and who controlled what.
- **Philosopher's argument:** 0 materially wrong or mere game recap, 1 partial philosophical idea without meaningful choice-to-argument bridge, 2 source-faithful thesis and explanation of how this specific choice illustrates it.
- **Hypothetical limits:** 0 falsely asserts real motives, known unchosen future or universal result; 1 partial caveat; 2 distinguishes model from real life and identifies crucial unknowns.
- **Final prompt:** 0 irrelevant/missing, 1 partial topic, 2 understands philosophical invitation as applied to the actual scenario.

A **human independent reviewer** scores each axis and each phase 0–2, with supporting verbatim evidence. Display possible 0–8 totals and qualitative misunderstandings, not inferred AI correctness. Prefer a second human for disputed cases; log disagreement. Original CZ-125 established no universal numeric PASS cutoff: do not invent or move a cutoff retrospectively. Five reader experiences are qualitative evidence, not statistical proof of general learning efficacy.

## Recorder and evidence
Open the separate local file [reader-response.html](./reader-response.html) **offline**. No network, cookies, localStorage, analytics or server submission. Reader/observer must download the anonymous JSON for each immediate and delayed phase; unsaved typing is lost on close. Store exports in a private directory outside the repo. Participant code R01–R05 only, and session start and end times, game, path, actual answers, assisting prompts and observations.

## Gate decision
The independent reviewer must see five actual consented human records, four scored axes each, actual source/route metadata, delayed results or explicit missingness, and observed misunderstandings before issuing PASS / REVISE / BLOCK. Technical CI PASS does not replace this. As of writing count remains **0/5**.

CZ-121 qualified scholarly source review OPEN; CZ-126 physical iPhone Safari/VoiceOver OPEN. The integrated prototype remains draft and unmerged. No deployment, public source publication, migration or paid service authorized by this file.
