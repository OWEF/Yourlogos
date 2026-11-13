# CZ-13 v1.9 — Source-fidelity review and teaching limits

**Review basis:** six curated sources in draft PRs #165–#171. Independent inspection of cited source passages, rather than acceptance by CI alone. **Status: provisional; no human-first-time reader or specialist signoff claimed.**

## Source-by-source findings

| Source | Textual proposition and verified location | What the scenario can actually show | False reading to reject | Editorial status |
|---|---|---|---|---|
| **Thoreau, _Walden_, Economy** | The cost of shelter or goods includes the life/time exchanged for them; [Walden, Economy](https://en.wikisource.org/wiki/Walden_%281893%29_Thoreau/Chapter_I). | Under an explicitly stipulated net hourly wage and extra working shifts, purchase cost can be expressed as working time. | That all consumers must work extra shifts, that price determines worth, or that purchasing is morally bad. | **Bounded analogy** |
| **Adam Smith, _Wealth of Nations_, I.i** | Dividing labour increases productive capacity through **specialist dexterity, time saved when changing tasks, and machinery**; [Book I, Chapter I](https://en.wikisource.org/wiki/The_Wealth_of_Nations/Book_I/Chapter_1). | Dedicated printing and binding stages may improve output relative to a declared **fictional** all-purpose team when task switching is assumed to cost time. Capacity balance is a distinct constraint. | That a printing/binding bottleneck **proves** specialization increases output, or that the exercise reproduces the historical pin factory / establishes its output. | **New comparator is modeled, not verified empirically** |
| **Epictetus, _Enchiridion_, §1** | Distinguishes our own opinions, desires and choices from externals; [Carter translation, §1](https://barryfvaughan.org/text/philtext/epictetus/enchiridion.html). | A person can choose to apologize; a friend's forgiveness remains their independent judgment. | Guaranteed forgiveness, absence of moral responsibility for one's actions, or a diagnosis of the user. | **Bounded analogy** |
| **Descartes, _Discourse on Method_, II** | Withhold assent unless the proposition is apprehended clearly and distinctly; [Part II](https://barryfvaughan.org/text/philtext/descartes/method/2.html), [SEP exegesis](https://plato.stanford.edu/entries/descartes-method/). | Endorsing, suspending and revising an uncertain documentary claim illustrate *restraint of assent*. | Equating an archive check with Cartesian clear-and-distinct knowledge or treating suspension as disproof. | **Analogy only, not Cartesian epistemic proof** |
| **Annie Dillard, _The Writing Life_** | The role of schedules in giving structure to days that cumulatively form a life; [cited book excerpt, p. 32](https://anthonywilsonpoetry.com/2016/08/08/how-we-spend-our-days-by-annie-dillard/). | Five identical hypothetical evenings yield specific cumulative time allocations. | That a participant has those habits, that time automatically measures fulfillment, or that one sitting diagnoses a life. | **Excerpt located; book-edition editorial verification outstanding** |
| **Kierkegaard, _Journal JJ:167_ (1843)** | Living forward while seeking understanding backward does not grant a timeless vantage point; [Danish original and research-center citation](https://homepage.divms.uiowa.edu/~jorgen/kierkegaardquotesource.html). | An imagined event introduces new information for a later choice; it does not reveal the alternative life. | Treating the abbreviated slogan as a full literal quotation, retroactive certainty, or predicting job outcomes. | **Short quotation explicitly identified as shortened** |

## Source-central remediation: Smith

The earlier booklet experiment gave four volunteers two jobs and a minimum-output function. It taught **coordination** but not, by itself, the **productivity mechanism** of dividing labour. The newly declared *rotating generalist baseline* is a comparative thought experiment: given four fictional volunteers and an explicitly *invented* time penalty for switching jobs, an assignment of dedicated press/bind roles can outperform an all-purpose rotating group. A poor split may not. The gain is conditional on stipulated rates and balanced stages.

The engine must report a numerical comparison **only** when a comparator is declared, structurally valid and compatible with the team's resource budget. When no comparator is supplied, the only admissible meaning is the narrower **dependency** claim. Source truth and actual worker productivity are **not** computed by the engine.

## Explicit no-go gates

1. **Source truth:** a source contract can be internally consistent and still editorially wrong. Automated checks enforce contract consistency, not philosophical truth.
2. **First-time learning:** show users a fresh encounter; require them to state the author’s idea, what the interaction established, and what it *did not* establish. Record observations rather than treating an AI self-review as human evidence.
3. **Unseen transfer:** pre-register completely unseen source-to-scenario mappings *before* running the engine. Previously used tests cease to be blind holdouts.
4. **Mobile and accessibility:** actual iPhone/Safari and VoiceOver evidence remains absent until explicitly executed.
5. **Release:** draft PRs only; founder decides any merge and production cutover.

**Scope exclusions:** no public Counterexample mechanic, no personal-health/identity inference, no My World writes, no new LLM provider or paid model call, and no broad production adaptation.
