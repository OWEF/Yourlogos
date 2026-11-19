// Authoring record for isolated E0 review. Catalogue eligibility lives in the
// existing editorial ledger; this record does not admit a quotation to the feed.
import {fingerprintB25} from "./yl-b25-authored-scenarios.mjs";

const source = {
  id: "enchiridion-1-long", quoteId: 47, author: "Epictetus", work: "Enchiridion 1, George Long translation",
  section: "§1", translation: "George Long", edition: "A Selection from the Discourses of Epictetus with the Encheiridion",
  text: "Of things some are in our power, and others are not.",
  referenceUrl: "https://www.gutenberg.org/files/10661/10661-h/10661-h.htm#:~:text=Of%20things%20some%20are%20in%20our%20power",
  warrants: {
    own_conduct: "§1 opening. Epictetus puts opinion and our own acts among things in our power.",
    external_action: "§1 opening. Things that are not our own acts can depend on others. The friend's reply is their act.",
    mistaken_dependency: "§1 opening and final paragraph. Treating what belongs to others as one's own makes one's judgment depend on them. Examine the appearance before accepting it.",
    continuing_repair: "Scenario qualification, not a quotation from Epictetus. One may still have responsibilities in a public discussion even without interpersonal reconciliation; §1 does not prescribe apologies or messaging etiquette.",
    public_action: "§1 agency boundary applied to the fiction: choosing or announcing a public correction is distinct from carrying it out, another person hearing it, or obtaining reconciliation.",
    preparation_vs_action: "§1 agency boundary applied to the fiction: private preparation is an act, but it is not evidence that listening or correction has occurred.",
    dialogue_opening: "§1 agency boundary applied to the fiction: an invitation can be offered; whether dialogue occurs is not controlled by its sender."
  },
  review: "provisional_e0_only", publicationAllowed: false
};

const own = ["own_conduct", "continuing_repair"];
const publicWarrants = ["own_conduct", "public_action", "continuing_repair"];
const planningWarrants = ["own_conduct", "preparation_vs_action", "continuing_repair"];
const dialogueWarrants = ["own_conduct", "dialogue_opening", "external_action"];
const openingChoices = [
  {
    id: "acknowledge", label: "Acknowledge the interruption", medium: "message",
    literal: "I laughed while you were explaining your idea. I put you on the spot, and I'm sorry.",
    recap: "You acknowledged laughing before your friend could finish.", effect: "acknowledgment_sent",
    establishes: ["acknowledged"], commitment: "You have named your public interruption privately; no reply was requested.",
    possibleRationale: "Acknowledging an action need not wait for an answer or settle how it was received.",
    explicitMotive: null, warrantIds: own
  },
  {
    id: "request", label: "Offer a conversation", medium: "message",
    literal: "Could we talk about yesterday? I'd like to hear how you saw it and explain what I meant.",
    recap: "You offered a conversation without first naming the interruption.", effect: "conversation_requested",
    establishes: ["requestedConversation"], commitment: "The invitation exists. No conversation or acknowledgment has occurred.",
    possibleRationale: "An exchange could allow both perspectives to be heard, but requires the other's participation.",
    explicitMotive: "The words express a wish to hear the other view and explain an intention.",
    warrantIds: dialogueWarrants
  },
  {
    id: "explain", label: "Acknowledge and give context", medium: "message",
    literal: "I laughed yesterday. I meant it as a joke, but it could have dismissed your idea. I'm sorry.",
    recap: "You acknowledged the laugh and described your intention.", effect: "apology_with_context_sent",
    establishes: ["acknowledged", "explainedIntention"], commitment: "You have taken responsibility and offered context, not settled your friend's experience.",
    possibleRationale: "An account of intention may be relevant without overruling the listener's interpretation.",
    explicitMotive: "The message says the speaker intended a joke.", warrantIds: own
  }
];
const followUps = {
  acknowledge: [
    {
      id: "invite", label: "Leave an optional opening for conversation", medium: "message",
      literal: "If you'd like to talk before tomorrow, I'll listen. There is no need to reply now.",
      recap: "You offered to listen if your friend wants to talk.", effect: "optional_dialogue_offered",
      establishes: ["requestedConversation", "invitationAfterAcknowledgment"],
      commitment: "An optional conversation was offered; it has not happened and tomorrow's public discussion remains.",
      possibleRationale: "An invitation need not demand an immediate answer.", explicitMotive: null,
      warrantIds: dialogueWarrants
    },
    {
      id: "correct", label: "Prepare a public acknowledgment", medium: "private_note",
      literal: "If I have a turn tomorrow, I'll acknowledge that I laughed before hearing the idea through, then make room for it.",
      recap: "You privately prepared a public acknowledgment.", effect: "public_correction_planned",
      establishes: ["plannedPublicCorrection"],
      commitment: "A specific public correction has been planned but not yet carried out.",
      possibleRationale: "The public conversation offers a different opportunity from a private message.",
      explicitMotive: null, warrantIds: planningWarrants
    }
  ],
  request: [
    {
      id: "name_harm", label: "Promise to acknowledge the interruption publicly", medium: "message",
      literal: "I also want to name what happened: I laughed before you finished. If there's room tomorrow, I'll acknowledge that to the group.",
      recap: "You named the interruption and sent a conditional public commitment.", effect: "public_commitment_sent",
      establishes: ["acknowledged", "publicCommitmentCommunicated"],
      commitment: "A public acknowledgment is promised conditionally, not yet performed; dialogue remains optional.",
      possibleRationale: "Addressing a public act need not depend on obtaining a private discussion first.",
      explicitMotive: null, warrantIds: publicWarrants
    },
    {
      id: "leave_request", label: "Let the request stand and prepare to hear the idea", medium: "commitment",
      literal: "I'll leave the invitation as it is. If I have a turn tomorrow, I'll ask about the idea before arguing for my view.",
      recap: "You held off on another message and decided to listen first.", effect: "listening_first_decided",
      establishes: ["deferredAcknowledgment", "preparedToListen"],
      commitment: "The private decision is real; no public listening or acknowledgment has taken place.",
      possibleRationale: "Avoiding another message can leave space, though the public interruption remains unaddressed.",
      explicitMotive: null, warrantIds: planningWarrants
    }
  ],
  explain: [
    {
      id: "unqualified", label: "Commit to address your public interruption", medium: "message",
      literal: "Whatever I meant, I interrupted you by laughing. If I have the floor tomorrow, I'll say that to the group.",
      recap: "You sent a commitment to name the public interruption.", effect: "public_commitment_sent",
      establishes: ["acknowledgedWithoutExplanation", "publicCommitmentCommunicated"],
      commitment: "The new message makes a public commitment; the public correction has not occurred.",
      possibleRationale: "A statement about conduct can stand independently of an explanation of intention.",
      explicitMotive: null, warrantIds: publicWarrants
    },
    {
      id: "prepare_question", label: "Prepare a question for tomorrow's discussion", medium: "private_note",
      literal: "If the idea comes up, I can ask which part matters most before giving my criticism.",
      recap: "You privately prepared a question about the idea.", effect: "listening_question_prepared",
      establishes: ["preparedListeningQuestion", "preparedToListen"],
      commitment: "The question has been prepared; it has not been asked or answered.",
      possibleRationale: "Curiosity can be prepared before a meeting without assuming a friend's response.",
      explicitMotive: null, warrantIds: planningWarrants
    }
  ]
};
const record = {
  id: "public-laughter", version: "public-laughter/2", operation: "agency_vs_external_reply",
  source, sourceFingerprint: fingerprintB25(source), warrantIds: Object.keys(source.warrants),
  opening: "Yesterday, you laughed while a friend presented an idea to the group. They fell quiet and withdrew. You want to address what happened, without knowing how they interpreted it. You open a message.",
  reconsiderationQuestion: "Tomorrow the group will revisit the idea. What remains possible without knowing your friend\'s response?",
  reconsiderationQuestions: {
    acknowledge: "You have acknowledged the interruption. Tomorrow the group revisits the idea. What could you do there, without assuming how your friend will respond?",
    request: "You offered a conversation; tomorrow the group revisits the idea. What would you choose before knowing whether a private conversation will happen?",
    explain: "You described your intention; your friend\'s response is unknown. Tomorrow the group revisits the idea. What could you say or ask?"
  },
  selfFacts: ["acknowledged", "requestedConversation", "explainedIntention", "plannedPublicCorrection",
    "deferredAcknowledgment", "acknowledgedWithoutExplanation", "preparedListeningQuestion",
    "publicCommitmentCommunicated", "invitationAfterAcknowledgment", "preparedToListen"],
  openingChoices, followUps,
  externalEvent: {
    id: "delivered_no_reply", text: "Message delivered. No reply yet. A group notice says tomorrow\'s meeting will revisit the same idea.",
    observed: ["The first message was delivered.", "No reply has arrived at this point.",
      "A group notice independently announces that the same idea will be discussed tomorrow."],
    unknowns: ["Whether your friend read it or what they thought.",
      "Whether there will be a chance to speak, listen or act differently at the meeting.",
      "Whether your friend will reply, forgive you or want a private conversation."],
    warrantIds: ["external_action", "mistaken_dependency", "continuing_repair"]
  }
};
function freezeRecord(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const member of Object.values(value)) freezeRecord(member);
    Object.freeze(value);
  }
  return value;
}
export const EPICTETUS_SCENARIO = freezeRecord({...record, scenarioFingerprint: fingerprintB25(record)});
