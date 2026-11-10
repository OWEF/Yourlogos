/**
 * CZ-112 v0.3 expression: pure, non-inferential rendering of the five-stage
 * discovery output. A strongly positive self-report ends without prompting.
 */
import {selectDiscovery} from "./personal-question-engine-v02.js";

export const PERSONAL_EXPRESSION_VERSION=3;
export function expressPersonalInsight(packet,{stance="unstated"}={}){
 const model=selectDiscovery(packet,stance);
 return {
   version:PERSONAL_EXPRESSION_VERSION,
   quoteId:model.quoteId,
   mechanism:model.mechanism,
   eyebrow:model.questionSelection.action==="complete_encounter"?"A CHOICE TO CARRY FORWARD":"A QUESTION WORTH KEEPING",
   title:model.expression.title,
   summary:model.tension,
   sourceLine:model.expression.connection,
   question:model.questionSelection.prompt,
   complete:model.questionSelection.action==="complete_encounter",
   visual:model.visual,
   debug:{
     fiveStages:{
       observation:model.observation,
       philosophicalTension:model.tension,
       personalRelevance:model.relevance,
       questionSelection:model.questionSelection,
       expression:model.expression
     },
     sourceReferences:model.audit.sourceTrace,
     uncertainty:model.audit.uncertainty,
     priorRule:model.audit.packetRule,
     disclaimer:model.audit.note
   }
 };
}
