# CZ-155 · Epictetus source dossier

Engineering and editorial candidate, 18 November 2026. Reference app `493cb1471814fba9feb4cbeab6ae96b8e46565d6`. Scope: a six-path, isolated proof of `agency_vs_external_reply`. Accountable source reviewer and product manager sign-off are outstanding.

## Edition identity

| Catalogue record | Exact quotation and source | Disposition |
|---|---|---|
| 47 · inherited | “Of things some are in our power, and others are not.” Epictetus, *Encheiridion*, §1, George Long. The opening sentence, including comma and period, matches the Project Gutenberg transcription. | Long §1 is the proposed dossier. The existing `awaiting_source_review` row remains binding for ordinary publication. |
| 92 · additional development record | “Some things are in our control and others not.” Epictetus, *Enchiridion*, §1. The exact words occur in the Carter-labelled texts published by Barry F. Vaughan and the Internet Classics Archive. Vaughan explicitly identifies HTML, modifications and corrections. Carter's early printed wording is different. | Retain the specific Carter-labelled web witness and existing development-only Tap & Pair. No Long witness substitution or inherited admission. |
| 48 · inherited | “Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are.” Catalogue identifies a Long §8 excerpt. | Separate `event_acceptance` Flip & Reveal. The baseline record links MIT's Carter-labelled web edition. Log the link mismatch for that record’s editor. It supplies no §1 evidence. |

Primary text for ID 47: George Long, trans., *A Selection from the Discourses of Epictetus with the Encheiridion*, “The Encheiridion, or Manual”, I, Project Gutenberg eBook 10661. The reader can open the [Long passage](https://www.gutenberg.org/files/10661/10661-h/10661-h.htm#:~:text=Of%20things%20some%20are%20in%20our%20power) or [plain text](https://www.gutenberg.org/cache/epub/10661/pg10661.txt). Perseus Digital Library independently transcribes the same opening with typographic uppercase “OF”. Its TEI includes translator, chapter boundary, subsequent argument and a print-scan reference. [Perseus text](https://github.com/PerseusDL/canonical-greekLit/blob/master/data/tlg0557/tlg002/tlg0557.tlg002.perseus-eng3.xml) · [Perseus chapter reader](https://scaife.perseus.org/reader/urn:cts:greekLit:tlg0557.tlg002.perseus-eng3:1/)

ID 92’s web witnesses identify Elizabeth Carter. Their exact opening does not establish a verbatim quotation from her 1758 printing. Keep the web edition attached to the wording that the reader sees. [Vaughan text and edition note](https://barryfvaughan.org/text/philtext/epictetus/enchiridion.html) · [MIT text](https://classics.mit.edu/Epictetus/epicench.html) · [earlier Carter text](https://en.wikisource.org/wiki/All_the_Works_of_Epictetus,_Which_Are_Now_Extant/The_Encheiridion)

Pinned repository evidence: [47 and 48](https://github.com/OWEF/Yourlogos/blob/493cb1471814fba9feb4cbeab6ae96b8e46565d6/experiments/yl-b27-quote-ledger.mjs#L336) · [92](https://github.com/OWEF/Yourlogos/blob/493cb1471814fba9feb4cbeab6ae96b8e46565d6/experiments/yl-b27-quote-ledger.mjs#L651) · [admission decisions](https://github.com/OWEF/Yourlogos/blob/493cb1471814fba9feb4cbeab6ae96b8e46565d6/experiments/yl-b27-editorial-ledger.mjs) · [§8 source record](https://github.com/OWEF/Yourlogos/blob/493cb1471814fba9feb4cbeab6ae96b8e46565d6/experiments/yl-cz147-sources.mjs#L224).

## Source argument and limits

**Question.** If I take another person's judgment as the test of whether I have acted well, who determines that test? Epictetus makes assent, desire and chosen conduct matters for the agent; he includes reputation among things subject to others. His reason is that the latter can be withheld or impeded even when the agent has exercised judgment and acted. Making another's verdict a condition of acting well leaves one's judgment hostage to their verdict.

| Dossier warrant | Passage basis | Permitted use in this encounter |
|---|---|---|
| W1 · agency | §1 opening division and examples of judgments, impulses and acts | Attribute the deliberately selected wording and commitments to the fictional speaker. The delivery receipt is an externally supplied observation. |
| W2 · dependence | §1 contrasts unobstructed agency with things liable to hindrance, including reputation | A reply, forgiveness or renewed trust requires another agent. Silence supplies no verdict on whether the speaker has done their part. |
| W3 · examination | §1 closing instruction to test a troubling impression against this division | Invite examination of the inference “they haven't replied, so my attempt failed.” A reader may consider it and disagree. |
| F1 · qualification from the fiction | The speaker ridiculed a friend's idea in public, then chooses what to do | A further acknowledgement or correction may be owed. A written commitment proves no subsequent performance. §1 supplies a distinction, not a rule fixing apology timing, sufficiency or wording. |

*Why the second choice needs the argument:* The speaker wants both to acknowledge harm and to be understood. After an identical delivery/no-reply observation, those aims can come apart. The reader can inspect what the message already did, what remains theirs to do, and what only the recipient can supply. Immediately before the second decision ask, “What am I asking the other person’s reply to prove about whether I have done my part?”

**Forbidden inferences.** Delivery establishes no reading, anger, opinion, acceptance or forgiveness. The authored interval is the same under every first choice. It establishes no causal effect of phrasing. The source does not say that influencing others is impossible, that feeling concern is a failure, that apology guarantees repair, that the speaker’s obligations are exhausted or that the recipient owes a reply. No virtue ranking, diagnosis of user motives, or imagined outcome of an unchosen act.

## Warrant review of the six paths

The player sees the literal first message in all subsequent beats. “Message delivered. Later, no reply has arrived.” The event concerns the **first** message. Following a second message, its delivery/read status and the friend's next act are still unknown. Editorial motives are hypotheses unless the words actually establish them.

| First message | Follow-up | Established difference and limit |
|---|---|---|
| A · “I made fun of your idea yesterday. That was hurtful, and I'm sorry.” | Send an invitation to talk | Acknowledgement already sent; a conversation has now been offered. No meeting is established. W1, W2, F1. |
| A · same message | Record a concrete change in future conduct | One acknowledgement remains in the conversation. A private, specific commitment is now made. Future conduct is unobserved. W1, W2, F1. |
| B · “Could we talk about yesterday? I want to hear your side and explain what I meant.” | Send an explicit acknowledgement | The request preceded the acknowledgement. The speaker can name the harm before receiving an answer; the recipient still controls their part. W1, W2, W3, F1. |
| B · same message | Leave the request standing, send nothing further | Only a conversation was requested. The acknowledgement is still outstanding; silence neither supplied it nor made it impossible. W1, W2, W3, F1. |
| C · “I'm sorry I laughed at your idea. I meant to lighten the mood, but I hurt you.” | Send an acknowledgement on its own | Two messages stand. The second gives the acknowledgement without the explanation. Nothing erases the earlier explanation or establishes how either was received. W1, W2, F1. |
| C · same message | Prepare a specific listening question | The original apology with context stands. A listening question is privately prepared. No question was sent, no answer received, and no listening conversation has occurred. W1, W2, F1. |

Every compact ending needs the path fact, the agency/dependence inference and the residual obligation or uncertainty. Avoid scoring the decision by the number of texts. Review with click recaps masked: could an editor still tell whether an acknowledgement remains outstanding, and explain why no reply can settle that issue?

## Transfer and release decision

**Outside texting.** A reporter discovers a numerical error in a published article, submits the corrected calculation, and awaits an editor’s decision. The reporter controls checking the figures and requesting correction; publication also depends on the editor. A delayed answer does not erase the submitted correction or settle whether other responsible steps are available. First-reader study cases must be novel and separate from material exposed in the encounter or its research instructions.

**Provisional editorial decision.** The exact Long wording and §1 distinction support a development-only six-path inspection, with W1–W3 and F1 distinguished. To change ordinary eligibility, an accountable editor must explicitly approve the *ID 47 + Long §1 + exact quotation + versioned scenario and six compact/full ending mappings* tuple and its witness, qualification, operation and permitted exposure. The product gate must then authorize the scoped admission. Record reviewer, version, decision and date. ID 92 retains its Carter-labelled source and independent comparator. An exact match of the opening sentence is only one prerequisite. Editorial assessment of the actual rendered endings remains a separate inspection; this dossier reviews their permissible inferences.
