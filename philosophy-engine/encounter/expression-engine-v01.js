/**
 * CZ-111 Expression Engine v0.1.
 * Converts a validated Insight Packet into a predictable SHORT presentation.
 * It may arrange or omit detail but never infer new philosophical claims.
 * Does not use LLMs, external APIs, scoring, profiling, or persistence.
 */
import {validateInsightPacket} from "./insight-packet-v01.js";

export const EXPRESSION_VERSION=1;

export function expressInsight(packet,{tone="reflective"}={}){
 const errors=validateInsightPacket(packet);
 if(errors.length)throw new TypeError("Invalid Insight Packet: "+errors.join("; "));
 if(tone!=="reflective")throw new RangeError("Only source-faithful reflective expression is supported in v0.1");
 return {
   version:EXPRESSION_VERSION,
   quoteId:packet.quote.id,
   mechanism:packet.mechanism,
   eyebrow:"YOUR DISCOVERY",
   title:packet.insight.headline,
   summary:packet.insight.discovery,
   observation:packet.observation.text,
   sourceLine:packet.insight.connection,
   question:packet.insight.question,
   visual:packet.visual,
   // For editor tools, never for the regular three-line Encounter surface:
   debug:{
     ruleId:packet.insight.ruleId,
     philosophicalLimit:packet.insight.limit,
     sourceReferences:packet.trace.sourceReferences,
     conceptualRelation:packet.insight.conceptualRelation,
     trace:packet.trace.rules,
     disclaimer:"Draft philosophical interpretation, not a truth verdict."
   }
 };
}
