# CZ-154 / M3 — First-reader comprehension and transfer pilot, preregistration-ready protocol

**Research state:** PREPARED; **zero respondents**; no efficacy claims. **Frozen app SHA:** `de940a15b32a6ad3ac3fbd082d6e64efbdf05441`. **Review only:** No M2 edits, merge, staging, production, paid service or participant recruitment without consent. Researchers must be independent of implementation and should not coach or signal the Stoic answer.

## 1. Purpose, eligibility and design

Primary outcome: *Does a participant independently transfer Epictetus's §1 distinction to an unfamiliar problem*, including a reason and a limit? Engagement is recorded separately and is not evidence of learning. Aim for **10 uncoached adults**, acceptable **8–12**, preferably novices. Record prior exposure to Stoicism/Epictetus before assignment, with a short neutral question; no unnecessary demographic collection.

Randomly assign approximately half to **interactive Encounter (I)**, half to **matched reading (R)**, with balanced familiarity when feasible. Use pairs/yoking: when I completes one of the 18 frozen authored paths, R sees the **same exact Long §1 quotation, scene, opening-message literal, independent group notice, second-action literal, status, compact three-section ending, and optional full reading** but is shown these as one person's decisions rather than selecting them. R should not get less source material or fewer consequences than I. Record exact frozen path ID, exposure time and result sections per pair. If yoking creates assignment delay, randomize study order independently and keep ordinary session timing, not forced dwell. **Legacy Tap & Pair** is a separate optional usability reference, never the main matched-reading control.

Test on an isolated playable snapshot pinned to the SHA, protected by the existing preview gate. Do not use ordinary production or staging. No live LLM, memory, contact with fictional recipient, or real messaging.

## 2. Uncoached script and procedure

Researcher reads only: “You will see a quotation and a short fictional situation. Please proceed as you normally would. Afterwards, answer a few questions in your own words. There are no preferred choices or feelings. You may disagree with the author. I cannot explain the idea during the exercise.” Obtain clear opt-in for participation, notes, screenshot/video recording only if separately consented, anonymization and optional delayed follow-up.

1. Record anonymous participant ID, assigned arm, basic prior Stoicism familiarity (none / heard of / previously studied), consent, timestamp, device class and viewport.
2. Show the frozen experience or fully content-matched reading; log which source and path displayed. Observe first reader's behavior silently; record unprompted hesitation, whether all six possibilities are noticed and whether the participant understands that opening an action does not commit it. Do **not** explain what the correct answer is.
3. For a small preregistered subset in both arms (e.g. first two per arm), **before the final philosophical ending** ask only: “What question is this situation raising for you at this point?” Do not mention Stoicism, power, control or responsibility. Encode whether the answer addresses another message's etiquette versus judgment and agency; report separately, not as the primary learning score.
4. After completion, remove the source/ending from view and present the unfamiliar immediate transfer case below. Collect an unassisted free-text or spoken response with its exact transcript, no hints or retries.
5. Separately ask one optional process question: “What, if anything, surprised you?” Then record enjoyment, agency, willingness to explore another source, path coverage and dwell/completion in a separate engagement table. Never combine these with philosophical scores.
6. Invite optional **day-4 delayed follow-up** (valid window **2–7 days**, only within consent/approved research dates). Use a different transfer scenario, no re-exposure to the Epictetus source or prior score. Record completed/missing follow-ups; do not impute dropouts.

Avoid cueing the source distinction before either transfer task. Do not reveal the rubric to participants until data collection has ended.

## 3. Immediate novel-case transfer (not an Epictetus restatement)

*Community newsletter.* “You helped publish a community newsletter. Afterwards you discover that a factual claim about the local library's opening hours was wrong. You can submit a correction with evidence and contact the editor. The editor might print it next issue, revise it, reject it or not answer. Some readers may already have relied on the error.”

Ask: “What would you do and why? What part of the outcome remains uncertain? Is there any responsibility that would remain even if you send the correction?”

**Blind reference qualities**, not a model response shown to participants: identify chosen verification/correction and responsible judgment versus independent editorial acceptance, articulate why contingent acceptance should not determine the quality of one's decision, preserve responsibility to check accuracy/consider readers or further repair, and apply distinction to the specific editor and affected readers. Disagreement with any Stoic practical advice can earn full marks if the distinction and limits are understood.

## 4. Delayed *different* transfer case (day 4, permissible days 2–7)

*Volunteer scheduling.* “You coordinated a shared volunteer timetable. A late change left one participant without a slot. You can investigate what went wrong, contact affected participants and propose a fair correction. The committee can accept or reject the revision, and the excluded participant may remain dissatisfied.”

Ask: “How would you decide what to do? What depends on your judgment or conduct, and what depends on other people? Could anything still be owed after you have made your proposal?”

Neither prompt uses the Stoic phrase ‘in our power.’ If a participant simply recites the earlier friendship story, give no application credit without explaining the new case.

## 5. Preregistered philosophical transfer rubric (0–4 each time)

Score **four separate binary indicators, 0 or 1**, then report the total:
- **D — Distinction (0/1):** Accurate difference between one's considered actions/judgment and someone else's independent decisions; not merely a generic “do your best.”
- **W — Why it matters (0/1):** Explains why relying on another's approval or event as the *measure of the quality of one's judgment* is a conceptual mistake or an unstable basis for evaluating action; articulated reasoning beyond naming controllable items.
- **Q — Essential qualification (0/1):** Recognizes that not controlling acceptance is **not** an excuse to neglect verification, obligations, care, corrective follow-up or consequences of one's own conduct.
- **A — Novel application (0/1):** Applies the distinction to concrete facts of the unfamiliar newsletter/volunteer case, with a viable own act and a named genuinely external uncertainty.

Accept accurate dissent from Epictetus and alternative concrete corrective actions. Do not award Q simply for saying the external result is unknown (already D). Do not award W for copying an aphorism without reason. Do not award A for copying the friendship scenario. Blindly score independent answers without indicating I/R arm, path, satisfaction or any evaluator-imposed expectation of apology. Two scorers independently score each response; report raw scorer scores, disagreements and reconciled score; adjudicate only after each has finished.

## 6. Distinct secondary evidence and analysis

**Primary reported quantities:** denominator randomly assigned per arm; number finishing experience; number contributing immediate transfer; D/W/Q/A proportions and 0–4 distribution per arm, means/medians and paired path-matched differences where possible. This is qualitative/feasibility only: no efficacy verdict from n=8–12, and no causal generalization from a convenience sample.

**Delayed:** day-lag distribution, invitation/completion counts, D/W/Q/A and total scores; report missingness and prior familiarity. Do not pretend that only respondents who return represent all participants.

**Engagement, not learning:** time/finishing, non-required source opening, voluntarily inspecting more than one choice, subjective enjoyment/agency, optional curiosity question, discoverability of all six and any narrated comprehension breakpoints.

**Ethics/data:** no actual friendship disclosures required; do not persist sensitive data in YourLogos; store de-identified responses in the approved research location with access controls, explicit consent and a deletion window. Any adverse uncoached reader finding must be linked to exact screenshot, event step, prompt, transcript ID and branch SHA (not inferred psychology).

## 7. Decision rule and limitations

An observed comprehension failure should create a narrow **source- or copy-level acceptance defect** before engineering changes; perform minimal targeted correction on a separate nonproduction branch only after independent adjudication, then re-run affected semantic/mobile tests and at least the relevant novel-case probes. A participant who enjoys the story but cannot explain W or Q has **not** demonstrated philosophical learning.

The preexisting product hypothesis **+0.5/4 points** over matched reading is a hypothesis, not a powered significance threshold. Even with a positive small-n directional difference, human-learning verdict should be **INCONCLUSIVE / NOT YET VALIDATED**, not production-ready, until interpretation and study limits are reviewed.

**Current result:** participants recruited 0, completed 0, immediate transfers 0, delayed transfers 0; engagement and effectiveness **NOT TESTED**.
