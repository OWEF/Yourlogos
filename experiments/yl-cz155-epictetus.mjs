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
    continuing_repair: "Scenario qualification. Distinguishing another person's reply from one's own conduct leaves responsibility for one's conduct open. §1 offers no rule for how many messages to send."
  },
  review: "provisional_e0_only", publicationAllowed: false
};
const own = ["own_conduct", "continuing_repair"];
const openingChoices = [
  {
    id: "acknowledge", label: "Send an acknowledgment", medium: "message",
    literal: "I made fun of your idea yesterday. That was hurtful, and I'm sorry.",
    recap: "You acknowledged the harm.", effect: "acknowledgment_sent",
    establishes: ["acknowledged"], commitment: "An apology has been sent without asking for anything in return.",
    possibleRationale: "A direct acknowledgment can leave room for the friend to respond in their own time.",
    explicitMotive: null, warrantIds: own
  },
  {
    id: "request", label: "Ask for a conversation", medium: "message",
    literal: "Could we talk about yesterday? I want to hear your side and explain what I meant.",
    recap: "You asked to talk.", effect: "conversation_requested",
    establishes: ["requestedConversation"], commitment: "The conversation request stands. The message has not acknowledged the harm.",
    possibleRationale: "A conversation could give both people a chance to speak.",
    explicitMotive: "The message states a wish to hear the friend's side and explain the speaker's intention.",
    warrantIds: own
  },
  {
    id: "explain", label: "Apologize and explain your intention", medium: "message",
    literal: "I'm sorry I laughed at your idea. I meant to lighten the mood, but I hurt you.",
    recap: "Your apology included an explanation.", effect: "apology_with_context_sent",
    establishes: ["acknowledged", "explainedIntention"], commitment: "The message names both the hurt and the intention.",
    possibleRationale: "Context can explain what the speaker was attempting without settling what the friend experienced.",
    explicitMotive: "The message describes the earlier joke as an attempt to lighten the mood.",
    warrantIds: own
  }
];
const followUps = {
  acknowledge: [
    {
      id: "invite", label: "Send an invitation to talk", medium: "message",
      literal: "If you want to talk about what happened, I'd like to listen.",
      recap: "You invited a conversation.", effect: "invitation_sent",
      establishes: ["requestedConversation"], commitment: "There is now an invitation to listen if the friend chooses to speak.",
      possibleRationale: "An invitation gives the friend a concrete opening.", explicitMotive: null, warrantIds: own
    },
    {
      id: "correct", label: "Write down a change for the next meeting", medium: "private_note",
      literal: "Next meeting, I will let them finish and ask about their idea before I comment.",
      recap: "You wrote down a change for the next meeting.", effect: "conduct_change_recorded",
      establishes: ["plannedConductChange"], commitment: "A change of conduct is written down. Carrying it out is still ahead.",
      possibleRationale: "A written plan can focus attention on the next occasion for action.", explicitMotive: null, warrantIds: own
    }
  ],
  request: [
    {
      id: "name_harm", label: "Send the acknowledgment now", medium: "message",
      literal: "I laughed at your idea in front of everyone. That was hurtful, and I'm sorry.",
      recap: "You then acknowledged the harm directly.", effect: "acknowledgment_sent",
      establishes: ["acknowledged"], commitment: "The harm has now been acknowledged regardless of whether the conversation takes place.",
      possibleRationale: "Naming the harm now separates acknowledgment from the invitation to meet.", explicitMotive: null, warrantIds: own
    },
    {
      id: "leave_request", label: "Leave the request as your only message", medium: "commitment",
      literal: "I'll leave my request there today. If we talk, I'll open by acknowledging what I did.",
      recap: "You reserved the acknowledgment for a possible conversation.", effect: "acknowledgment_deferred",
      establishes: ["deferredAcknowledgment"], commitment: "The request remains the only message. An acknowledgment is still outstanding.",
      possibleRationale: "Leaving one request can avoid pressing for a conversation.", explicitMotive: null, warrantIds: own
    }
  ],
  explain: [
    {
      id: "unqualified", label: "Send a second acknowledgment", medium: "message",
      literal: "Laughing at you in front of everyone was hurtful. I'm sorry I did it.",
      recap: "You sent another acknowledgment without an explanation.", effect: "unqualified_acknowledgment_sent",
      establishes: ["acknowledged", "acknowledgedWithoutExplanation"], commitment: "The new message acknowledges harm without explaining the speaker's intent.",
      possibleRationale: "A second acknowledgment can give the hurt its own sentence.", explicitMotive: null, warrantIds: own
    },
    {
      id: "prepare_question", label: "Prepare a question to listen with", medium: "private_note",
      literal: "What was it like to bring up your idea and hear me laugh?",
      recap: "You prepared a question for a possible conversation.", effect: "listening_question_prepared",
      establishes: ["preparedListeningQuestion"], commitment: "A listening question has been written privately. No second message has been sent.",
      possibleRationale: "Preparing a question can make room for the friend's experience if they want to speak.",
      explicitMotive: null, warrantIds: own
    }
  ]
};
const record = {
  id: "public-laughter", version: "public-laughter/1", operation: "agency_vs_external_reply",
  source, sourceFingerprint: fingerprintB25(source), warrantIds: Object.keys(source.warrants),
  opening: "Yesterday, in front of the group, you laughed at a friend's idea. They fell quiet and withdrew from the conversation. You want to acknowledge the hurt and also be understood. You open a message to them.",
  reconsiderationQuestion: "What am I asking the other person's reply to prove about whether I have done my part?",
  selfFacts: ["acknowledged", "requestedConversation", "explainedIntention", "plannedConductChange",
    "deferredAcknowledgment", "acknowledgedWithoutExplanation", "preparedListeningQuestion"],
  openingChoices, followUps,
  externalEvent: {
    id: "delivered_no_reply", text: "Message delivered. Later, no reply has arrived.",
    observed: ["The first message was delivered.", "No reply has arrived at this point."],
    unknowns: ["Whether your friend read it.", "What they thought or felt.", "Whether they will reply or forgive you."],
    warrantIds: ["external_action", "mistaken_dependency"]
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
