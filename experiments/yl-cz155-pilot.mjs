// Private authoring registry. Only the server's opt-in preview route calls this
// module. The ordinary quote ledger and its admission decisions remain owners.
import {B27_APP_QUOTES} from "./yl-b27-quote-ledger.mjs";
import {makeUniversalRegistry} from "./yl-cz147-engines.mjs";
import {EPICTETUS_SCENARIO as scenario} from "./yl-cz155-epictetus.mjs";
import {EMERSON_RECORD} from "./yl-cz155-emerson.mjs";

const source = scenario.source;
const evidenceIds = [...new Set(["source:central", "source:boundary",
  "scenario:fictional", ...scenario.warrantIds])];

const record = {
  version: "cz155-author-proof/1", recordId: scenario.id, quoteId: source.quoteId,
  status: "development_provisional", publicationAllowed: false,
  developmentOnly: false, exposeInApp: false,
  familyId: "decision_cards", title: "After the laughter",
  intro: scenario.opening,
  source: {text: source.text, author: source.author, work: source.work,
    referenceUrl: source.referenceUrl},
  sourceThesis: "You can offer repair. An answer requires another person's choice.",
  evidenceClaim: "Another person can withhold a response even when you have acted with care",
  humanTension: "You want to acknowledge publicly hurting your friend and you also want to be understood",
  epistemicLimits: "Silence reveals neither your friend's judgment nor whether more repair is owed.",
  compactLimit: "Silence cannot settle what repair you still owe.",
  counterexample: "Even a considerate message cannot guarantee acceptance or discharge every obligation.",
  readerAgency: "Choose your words, then decide what you can still undertake.",
  reflectionQuestion: scenario.reconsiderationQuestion,
  narrativeBridge: {
    version: "cz152-narrative/1",
    bridgeFromSource: "What happens when something you say matters to someone else?",
    situationHook: "Yesterday you laughed at a friend’s idea in front of everyone. They went quiet. You want to put things right, and you also want to explain yourself.",
    playPrompt: "Choose the message you will send.",
    sourceWarrantIds: ["source:central","scenario:fictional"],
    // Source-authored, presentation-only. No scenario or Director contract changes.
    // The same renderer may accept another reviewed message-thread record.
    directorPresentation: {
      kind: "message_thread",
      correspondent: "Your friend",
      openingPrompt: "You have one message to send. What will you say?",
      reconsiderationLead: "Your message was delivered. An answer has not arrived. Consider what your next action can change.",
      completionLead: "You chose a second action. Nothing in the story yet establishes their response."
    }
  },
  evidenceIds, affordances: ["boundary_awareness","choice_awareness"],
  prohibitedInferences: ["Words caused silence","Delivery proves reading",
    "Acknowledgment completes repair","A private commitment was fulfilled"],
  supportedConclusions: ["An acknowledgement can be offered while the recipient's response remains unknown"],
  philosophicalOperation: {kind: "agency_vs_external_reply", focus: "chosen conduct and independent response",
    contrast: "your own undertaking versus another person's judgment", sourceWarrantIds: scenario.warrantIds},
  director: scenario,
  decisionWarrant: {fact: "acknowledged", warrantId: "mistaken_dependency",
    established: {
      inference: "You could acknowledge the harm without their agreement.",
      question: "What would keeping faith with that acknowledgment require next?",
      strategy: "boundary_awareness"
    },
    outstanding: {
      inference: "Their answer cannot acknowledge the harm on your behalf.",
      question: "What could you still name even if no answer comes?",
      strategy: "choice_awareness"
    },
    // Source-authored distinctions that were present in encounter-events/1
    // but lost when Reasoning selected only the acknowledged boolean.
    // Equivalent established facts deliberately share one interpretation.
    refinements: [
      {
        factsAny: ["plannedConductChange", "preparedListeningQuestion"],
        inference: "Private preparation is yours to choose; it does not establish that you have listened or changed your conduct.",
        question: "What part of this plan can you carry through, and what still depends on them?",
        strategy: "choice_awareness", warrantId: "continuing_repair"
      },
      {
        factsAll: ["acknowledgedWithoutExplanation"],
        inference: "Your second apology separates harm from intention, but cannot determine how either message is received.",
        question: "What might you still owe beyond a second acknowledgment?",
        strategy: "boundary_awareness", warrantId: "continuing_repair"
      },
      {
        factsAll: ["acknowledged", "requestedConversation"],
        inference: "You acknowledged the harm and offered to talk; the invitation does not give you authority over their reply.",
        question: "How can you honor your invitation without treating a reply as owed?",
        strategy: "boundary_awareness", warrantId: "external_action"
      }
    ]}
};
// Both authoring records use the *same* validated Director and universal
// Reasoning/Emotion/Expression engine. No author/quote-specific runtime branch.
const registry = makeUniversalRegistry([record,EMERSON_RECORD], B27_APP_QUOTES);
const eligible = input => input?.cz155Preview === true &&
 registry.ids.includes(input.quoteId);

export const resolvePilot = input => eligible(input) ? registry.resolve(input) : null;
export const runPilot = input => eligible(input) ? registry.run(input) : null;
