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
  version: "cz155-author-proof/2", recordId: scenario.id, quoteId: source.quoteId,
  status: "development_provisional", publicationAllowed: false,
  developmentOnly: false, exposeInApp: false,
  familyId: "decision_cards", title: "After the laughter",
  intro: scenario.opening,
  source: {text: source.text, author: source.author, work: source.work,
    referenceUrl: source.referenceUrl},
  sourceThesis: "Epictetus distinguishes our own judgments and actions from others' responses.",
  evidenceClaim: "You may prepare or promise a correction without commanding a chance to perform it or anyone's response.",
  humanTension: "Tomorrow the group returns to the interrupted idea while any private reply remains uncertain",
  epistemicLimits: "A missing reply reveals neither your friend's judgment nor what public responsibility remains appropriate.",
  compactLimit: "Public conduct and private reconciliation remain separate.",
  counterexample: "Even a promise to acknowledge the interruption publicly may go unfulfilled; a friendly reply would not automatically settle public responsibility.",
  readerAgency: "Choose what to send, then decide what to prepare or promise before tomorrow's discussion.",
  reflectionQuestion: scenario.reconsiderationQuestion,
  narrativeBridge: {
    version: "cz152-narrative/2",
    bridgeFromSource: "When another person's response is uncertain, what can you still choose in the next situation?",
    situationHook: "Yesterday you laughed as a friend presented an idea to the group. They went quiet. You do not know what they thought. You open a message.",
    playPrompt: "Choose the message you will send.",
    sourceWarrantIds: ["source:central","scenario:fictional"],
    // Source-authored, presentation-only. No scenario or Director contract changes.
    // The same renderer may accept another reviewed message-thread record.
    directorPresentation: {
      kind: "message_thread",
      correspondent: "Your friend",
      openingPrompt: "You have one message to send. What will you say?",
      developmentLabel: "SEPARATE GROUP NOTICE",
      firstMessageStatus: "Message delivered. No reply yet.",
      waitCue: "No private reply yet. Tomorrow presents a public situation.",
      // Reconsideration is the participant's question, not a precomputed
      // philosophical dashboard or a second explanation of observed silence.
      completionLead: "Your next step is recorded; tomorrow's meeting and any later responses remain unwritten."
    }
  },
  evidenceIds, affordances: ["boundary_awareness","choice_awareness"],
  prohibitedInferences: ["The message caused the meeting notice","Delivery proves reading",
    "Acknowledgment settles public repair","A plan or promise has already been carried out",
    "Silence proves rejection","A friendly reply eliminates all responsibility"],
  supportedConclusions: ["The participant can choose a next action without determining the friend's response; plans and promises are not completed public conduct"],
  philosophicalOperation: {kind: "agency_vs_external_reply", focus: "chosen judgment and action under external uncertainty",
    contrast: "your own decisions and attempts versus another person's response", sourceWarrantIds: scenario.warrantIds},
  director: scenario,
  decisionWarrant: {fact: "acknowledged", warrantId: "own_conduct",
    established: {
      inference: "Your acknowledgment is chosen; its reception and tomorrow's meeting remain uncertain.",
      question: "If tomorrow offers a turn, what could you attempt?",
      strategy: "boundary_awareness"
    },
    outstanding: {
      inference: "Your invitation is chosen; tomorrow's public conduct remains open.",
      question: "What remains possible for you tomorrow without a private conversation?",
      strategy: "choice_awareness"
    },
    // These are shared predicates about action status, not one authored
    // philosophical speech per route. Different messages may rightly converge.
    refinements: [
      {
        factsAny: ["publicCommitmentCommunicated"],
        inference: "Your promise is a present act; performance and reception remain uncertain.",
        question: "If you have a turn tomorrow, what would carrying it out involve?",
        strategy: "boundary_awareness", warrantId: "public_action"
      },
      {
        factsAny: ["plannedPublicCorrection", "preparedListeningQuestion"],
        inference: "Preparing a step is an act, not evidence that it happened or succeeded.",
        question: "What if tomorrow offers no chance to act on your plan?",
        strategy: "choice_awareness", warrantId: "preparation_vs_action"
      },
      {
        factsAny: ["invitationAfterAcknowledgment"],
        inference: "An invitation is yours; another person's answer and tomorrow's public conduct remain open.",
        question: "What could matter publicly if the private invitation stays unanswered?",
        strategy: "boundary_awareness", warrantId: "dialogue_opening"
      },
      {
        factsAny: ["deferredAcknowledgment"],
        inference: "Waiting now does not settle what you can attempt publicly tomorrow.",
        question: "If you have a turn tomorrow, what could you attempt?",
        strategy: "choice_awareness", warrantId: "continuing_repair"
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
