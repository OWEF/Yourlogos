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
  version: "cz155-author-proof/3", recordId: scenario.id, quoteId: source.quoteId,
  status: "development_provisional", publicationAllowed: false,
  developmentOnly: false, exposeInApp: false,
  familyId: "decision_cards", title: "After the laughter",
  intro: scenario.opening,
  source: {text: source.text, author: source.author, work: source.work,
    referenceUrl: source.referenceUrl},
  sourceThesis: "Epictetus places our judgment and chosen acts within our power, not others' assent.",
  evidenceClaim: "A posted group statement, a promise and a private plan are different choices; none commands another person's judgment.",
  humanTension: "Tomorrow the group returns to the interrupted idea while any private reply remains uncertain",
  epistemicLimits: "A missing reply reveals neither your friend's judgment nor what public responsibility remains appropriate.",
  compactLimit: "Public conduct and private reconciliation remain separate.",
  counterexample: "Even a considerate action cannot guarantee another person's agreement or a better discussion.",
  readerAgency: "Choose what to send, then decide whether to post, promise, prepare, invite or refrain.",
  reflectionQuestion: scenario.reconsiderationQuestion,
  narrativeBridge: {
    version: "cz152-narrative/3",
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
      completionLead: "Your chosen action is recorded. Tomorrow's discussion and others' responses remain unwritten."
    }
  },
  evidenceIds, affordances: ["boundary_awareness","choice_awareness"],
  prohibitedInferences: ["The message caused the meeting notice","Delivery proves reading",
    "Acknowledgment settles public repair","A plan or promise is completed public conduct",
    "Silence proves rejection","A friendly reply eliminates all responsibility"],
  supportedConclusions: ["An actual group post, a promise and a private plan are distinguishable participant acts; none determines others' responses"],
  philosophicalOperation: {kind: "agency_vs_external_reply", focus: "chosen judgment and action under external uncertainty",
    contrast: "your own decisions and attempts versus another person's response", sourceWarrantIds: scenario.warrantIds},
  director: scenario,
  decisionWarrant: {fact: "acknowledged", warrantId: "own_conduct",
    established: {
      inference: "An acknowledgment is your act, not proof of another person's judgment.",
      question: "What remains yours to consider when the group's response is unknown?",
      strategy: "boundary_awareness"
    },
    outstanding: {
      inference: "A request for dialogue is your act, not the conversation itself.",
      question: "What remains possible without assuming a private conversation will occur?",
      strategy: "choice_awareness"
    },
    // Generic predicates over replayed participant-owned facts. No literal
    // route or philosopher-key switch: equivalent preparation shares a lens.
    // Path-bound qualifications prevent irrelevant boilerplate in Expression.
    refinements: [
      {
        factsAll: ["publicAcknowledgmentCompleted"],
        inference: "Your group post is complete; its reception and repair remain undecided.",
        question: "Was public acknowledgment worth the risk of bringing renewed attention to the interruption?",
        strategy: "boundary_awareness", warrantId: "public_post",
        qualification: "Epictetus's agency distinction recognizes the posted words, not control of how the group receives them.",
        compactLimit: "A completed post does not settle its consequences.",
        counterexample: "Posting now may spotlight the friend again; waiting might spare that attention but leave the group without acknowledgment."
      },
      {
        factsAll: ["publicCommitmentCommunicated"],
        inference: "Your promise is sent privately; public acknowledgment has not occurred.",
        question: "What could justify promising public action without assuming an opportunity tomorrow?",
        strategy: "boundary_awareness", warrantId: "public_action",
        qualification: "The commitment is your chosen act; a speaking opportunity and the group's judgment are not assured.",
        compactLimit: "A private promise is not public performance.",
        counterexample: "A promise can protect privacy today, yet tomorrow may arrive without a chance to keep it."
      },
      {
        factsAny: ["plannedPublicCorrection", "preparedListeningQuestion"],
        inference: "You prepared a step privately; it has not been performed.",
        question: "What does preparation make possible without guaranteeing tomorrow's opportunity?",
        strategy: "choice_awareness", warrantId: "preparation_vs_action",
        qualification: "Epictetus's distinction counts preparation as chosen conduct, not as completed public speaking or listening.",
        compactLimit: "Preparation is an act, not its future performance.",
        counterexample: "Preparation may avoid an unsolicited public post, but the discussion could move on before the plan is used."
      },
      {
        factsAll: ["invitationAfterAcknowledgment"],
        inference: "You sent an invitation; dialogue and public repair remain undecided.",
        question: "Can a private opening matter without becoming a demand for an answer?",
        strategy: "boundary_awareness", warrantId: "dialogue_opening",
        qualification: "Offering dialogue belongs to your agency; choosing whether to answer belongs to your friend.",
        compactLimit: "An invitation does not create a conversation.",
        counterexample: "An optional invitation can respect space, but the group may still revisit an interrupted idea without any private conversation."
      },
      {
        factsAll: ["deferredAcknowledgment"],
        inference: "You withheld another message and planned to listen; listening has not happened.",
        question: "When does restraint leave space, and when might it defer public accountability?",
        strategy: "choice_awareness", warrantId: "continuing_repair",
        qualification: "Choosing restraint is possible now; whether a later chance to listen occurs belongs to an uncertain situation.",
        compactLimit: "Restraint is not proof of completed repair.",
        counterexample: "Not pressing for dialogue may respect privacy, yet doing nothing publicly can leave the interruption unaddressed."
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
