/**
 * CZ-115 Expression Engine v0.3: compose, never invent, a sourced personal
 * philosophical discovery. Question is optional; the revelation is primary.
 */
import {synthesizeDiscovery} from "./discovery-synthesis-v01.js";

export const EXPRESSION_ENGINE_VERSION=5;
export function expressDiscovery(packet,options={}){
 const result=synthesizeDiscovery(packet,options);
 const s=result.stages;
 return {
  version:EXPRESSION_ENGINE_VERSION,
  eyebrow:"WHAT YOUR CHOICE REVEALED",
  quoteId:packet.quote.id,
  mechanism:packet.mechanism,
  title:s.expression.headline,
  observation:s.observation,
  tension:s.philosophicalTension,
  discovery:s.discovery,
  connection:s.expression.connection,
  question:s.questionSelection.question,
  fingerprintLink:result.fingerprint?.statement||null,
  fingerprintEvidence:result.fingerprint,
  visual:result.visual,
  debug:result.qa,
  stages:s
 };
}
