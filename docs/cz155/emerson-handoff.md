# Emerson · eight-path baseline

App `493cb1471814fba9feb4cbeab6ae96b8e46565d6`, inherited quotation 55, development simulator enabled. The capture exercises the same resolver and runner used by the HTTP endpoints. It measures engine output. It supplies no feed exposure, physical-device or human-learning evidence.

## Where the distinction disappears

The source already contains the warrant. Emerson describes how the expectations of people who know our past declarations can displace our own current judgment. Keeping a position can still express considered judgment. Changing it can still express conformity. The first-edition witness is *Essays*, James Munroe & Company, Boston, 1841. [University of Virginia transcription](https://anthology.lib.virginia.edu/work/Emerson/emerson-self-reliance) · [edition PDF](https://anthology.lib.virginia.edu/work/Emerson/emerson-self-reliance.pdf)

**The earliest missing evidence is in the authored scene and available choices.** A reader never learns which new facts bear on a particular plan. The final action establishes that someone considered evidence or gave an explanation. Either could still keep or abandon the plan for either reputation or substantive reasons. Assigning one motive to either existing option would manufacture a fact.

| Boundary | Maintained, new details, reconsidered | Information available or lost |
| --- | --- | --- |
| Source and warrant | “Fidelity to earlier words is not always faithful to present judgment” | Record 55 binds the source concern about past public declarations to a source claim and limit. |
| Fiction → action | “new facts complicate the plan” → “You reconsider the evidence” | No specific policy, objection, final public action or rationale. The UI also invites a tap to choose between two outside developments. |
| Action → canonical input | `{"path":["maintain","details","consider"]}` | All authored option IDs survive. There is no motive to recover from the IDs. |
| Canonical → Reasoning | All three labels and the fictional scene text survive. Revision is a feature of the response. | The selected claim asks whether present reasons support the action. Substituting any other path changes the named actions/events but leaves this predicate the same. |
| Reasoning → Emotion | `revisability` / `introduce_counterconsideration` | Operation preference chooses this on all eight. Attention still carries start, development and response stance. Reusing this tone can be appropriate. |
| Reasoning/Emotion → Expression | Reading and question choose candidates by `retain_prior` or `reexamine_prior`. | The opening drives the interpretation. The longer rendering can name the scene but the selected response cannot change the substantive conclusion. |
| Expression → compact | All four maintain paths have four different choice recaps and one identical explanation/question pair. | The length selector can drop the reference to the scene. Among revisit paths it also changes attribution and question wording when recap length changes, despite identical grounds. |

Implementation loci on the pinned build are `experiments/yl-cz147-sources.mjs:166` (definition), `b27-encounter-ui.js:244` (participant selects development), `experiments/yl-cz147-engines.mjs:279` (canonical input), lines 301 and 317 (analysis and selected claim), 364 (strategy), 592 (opening-based inference rendering), 732 (opening-based question), and 945 (compact selection). `experiments/yl-b27-route.mjs:242` sends ID 55 through the generalized registry. The specialized replay routes for Dillard, Kierkegaard and Carter's Epictetus use other contracts.

## What a reader actually sees

For `maintain/details/consider`, the three displayed sections are:

> You chose to keep the original plan, saw “new facts complicate the plan”, then chose to reconsider the evidence.
>
> Fidelity to earlier words is not always faithful to present judgment. Keeping the earlier position calls for present reasons rather than loyalty to past words. Revision itself cannot guarantee a better judgment.
>
> After considering the imagined development, what evidence still warrants keeping the plan?

With the first section hidden, this is indistinguishable from `maintain/details/explain`, `maintain/critique/consider` and `maintain/critique/explain`. Across eight paths, all eight Reasoning packets retain different named actions/events, full outputs run 111–116 words, and compact outputs 63–65 words. `revisit/details/explain` and `revisit/critique/explain` even have identical *entire* compact outputs. Their external events differ, but both events lack substantive evidence the reader can evaluate.

## Reproduction and scope

From the named baseline run `node path/to/capture-emerson-baseline.mjs > /tmp/emerson-eight-paths.json`. The capture checks the Git blob identities of the router, sources, quote ledger and shared engine before execution. The JSON includes the full source record, canonical inputs, unabridged Reasoning and Emotion packets, full and compact outputs. SHA-256 of the JSON is `83dfd784d37689a50fa888d3e9f247b4756811a1beb31c688dc8b35c9f2ae787`.

Together the following baseline files passed 35/35 local Node tests. The older contract examines 84 Dillard states (28 allocations × three explicitly declared influences) and eight Kierkegaard routes. The compact-route test exercises the application's four older presentations and exact-source refusal. These counts describe executed assertions in their respective contracts. They do not imply 84 distinct ordinary-feed journeys.

```sh
node --test tests/encounter-v1.test.mjs tests/yl-cz149-philosophy.test.mjs tests/yl-b25-generalized-encounter.test.mjs tests/yl-b27-quote-compact.test.mjs
```

Repair starts by giving the same bus evidence to both readers and allowing the same final public act for two explicitly different reasons. The engine must preserve the source-warranted reason. Rotating the untaken option order is a suitable irrelevant-variation control. No after-version is asserted in this baseline.
