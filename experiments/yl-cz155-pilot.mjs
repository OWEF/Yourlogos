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
  sourceThesis: "In Enchiridion §1, Epictetus separates our own judgments and deliberate acts from what other people decide.",
  evidenceClaim: "You may prepare or promise a correction without commanding a chance to perform it or anyone's response.",
  humanTension: "Tomorrow the group returns to the interrupted idea while any private reply remains uncertain",
  epistemicLimits: "A missing reply reveals neither your friend's judgment nor what public responsibility remains appropriate.",
  compactLimit: "Public responsibility and private reconciliation remain distinct and open.",
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
      inference: "You acknowledged the interruption, a chosen act, without deciding how the meeting or your friend will respond.",
      question: "If tomorrow offers an opening, what would you choose without presuming its outcome?",
      strategy: "boundary_awareness"
    },
    outstanding: {
      inference: "You offered a conversation without yet naming the public interruption; another person's silence does not choose your public conduct.",
      question: "What remains possible tomorrow, whether or not a conversation happens?",
      strategy: "choice_awareness"
    },
    // These are shared predicates about action status, not one authored
    // philosophical speech per route. Different messages may rightly converge.
    refinements: [
      {
        factsAny: ["publicCommitmentCommunicated"],
        inference: "You promised a public acknowledgment. The promise is your action today; a chance to carry it out and others' responses are not guaranteed.",
        question: "If you get a chance tomorrow, what would acting on that promise require?",
        strategy: "boundary_awareness", warrantId: "public_action"
      },
      {
        factsAny: ["plannedPublicCorrection", "preparedListeningQuestion"],
        inference: "You prepared a specific step for tomorrow. Preparation is an act you can choose; it does not mean the step has happened or will succeed.",
        question: "What could make the preparation useful if tomorrow unfolds differently from your plan?",
        strategy: "choice_awareness", warrantId: "preparation_vs_action"
      },
      {
        factsAny: ["invitationAfterAcknowledgment"],
        inference: "You acknowledged the interruption and invited dialogue. Neither act can command a reply, nor does an invitation settle what happens in the group tomorrow.",
        question: "How might the public discussion matter even if the private invitation is unanswered?",
        strategy: "boundary_awareness", warrantId: "dialogue_opening"
      },
      {
        factsAny: ["deferredAcknowledgment"],
        inference: "You chose not to send another message and privately planned to listen first. Neither listening nor public acknowledgment has occurred; no reply is required for you to reconsider.",
        question: "If you have the floor tomorrow, what could you attempt without a prior conversation?",
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
