/**
 * CZ-112 · Expression Engine v0.2.
 * Display a proactive philosophical QUESTION, not a verdict about the user.
 * Rendering is purely from question-selection reasoning; full evidence is
 * internal to an expandable founder view. No AI, persistence or external calls.
 */
import {validateInsightPacket} from "./insight-packet-v01.js";
import {reasonToQuestion} from "./question-selection-v02.js";

export const EXPRESSION_VERSION_V02=2;
export function expressEncounterV02(packet,{reaction="unanswered"}={}){
  const errors=validateInsightPacket(packet);
  if(errors.length)throw new TypeError(errors.join("; "));
  const thought=reasonToQuestion(packet,{reaction});
  const closed=thought.questionSelection.decision==="close";
  const selected=thought.questionSelection.question;
  return {
    version:EXPRESSION_VERSION_V02,
    quoteId:packet.quote.id,
    mechanism:packet.mechanism,
    eyebrow:closed?"A THOUGHT YOU CAN LEAVE HERE":"A QUESTION YOUR CHOICE RAISED",
    title:closed?"You can leave the question here.":selected,
    summary:thought.expressionDraft.discovery,
    sourceLine:thought.expressionDraft.sourceConnection,
    closingNote:closed?thought.expressionDraft.positiveClosing:null,
    selectedQuestion:closed?null:selected,
    questionMode:thought.questionSelection.decision,
    visual:thought.visual,
    reaction:thought.personalRelevance.reaction,
    feedbackIsOptional:true,
    debug:{
      fiveLayers:{
        observation:thought.observation,
        philosophicalTension:thought.philosophicalTension,
        personalRelevance:thought.personalRelevance,
        questionSelection:thought.questionSelection,
        expression:{title:closed?"You can leave the question here.":selected,
          supportedDiscovery:thought.expressionDraft.discovery}
      },
      sourceReferences:packet.trace.sourceReferences,
      supportingRuleTrace:packet.trace.rules,
      epistemicLimit:packet.insight.limit,
      disclaimer:"A context-grounded, conditional reading—not a verdict about philosophical truth or personal character."
    }
  };
}
