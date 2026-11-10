/**
 * CZ-111 Insight Packet v0.1: shared contract between source-grounded
 * philosophical reasoning and surface expression. It is not a truth verdict.
 */
export const INSIGHT_PACKET_VERSION = 1;
export const MAX_COPY = Object.freeze({headline:100,observation:190,discovery:230,connection:220,question:190});

function assertText(value, label, limit=2500) {
  if (typeof value !== "string" || !value.trim() || value.length > limit)
    throw new TypeError(label + " must be nonempty and <= " + limit + " characters");
}
export function validateInsightPacket(packet) {
  const errors=[];
  try {
    if (packet?.schemaVersion !== INSIGHT_PACKET_VERSION) throw Error("schema version mismatch");
    if (![49,28].includes(packet.quote?.id)) throw Error("unknown pilot quote ID");
    if (!["tradeoff","decision_map"].includes(packet.mechanism)) throw Error("unknown mechanism");
    assertText(packet.scenarioId,"scenarioId");
    assertText(packet.quote?.text,"source quotation");
    assertText(packet.quote?.author,"author");
    assertText(packet.quote?.source,"work");
    assertText(packet.observation?.text,"observation",MAX_COPY.observation);
    assertText(packet.insight?.headline,"headline",MAX_COPY.headline);
    assertText(packet.insight?.discovery,"discovery",MAX_COPY.discovery);
    assertText(packet.insight?.connection,"connection",MAX_COPY.connection);
    assertText(packet.insight?.question,"question",MAX_COPY.question);
    assertText(packet.insight?.limit,"epistemic limit");
    assertText(packet.insight?.ruleId,"inference rule ID");
    assertText(packet.insight?.conceptualRelation,"source-grounded relation");
    if (!Array.isArray(packet.trace?.rules)||packet.trace.rules.length===0 ||
       packet.trace.rules.some(s=>typeof s!=="string"||!s.trim())) throw Error("missing fired rule trace");
    if (!Array.isArray(packet.trace?.sourceReferences)||!packet.trace.sourceReferences.length)
      throw Error("missing source trace");
    if (packet.flags?.truthVerdict!==false||packet.flags?.productionEligible!==false ||
       packet.flags?.editorialStatus!=="draft") throw Error("pilot must be clearly non-authoritative");
    if (packet.visual?.type==="segments") {
      const values=packet.visual.values;
      if(!Array.isArray(values)||values.length!==3||values.some(n=>!Number.isFinite(n)||n<0)||
         values.reduce((a,b)=>a+b,0)!==3)throw Error("invalid three-hour segment visual");
    } else if (packet.visual?.type==="path") {
      if(!Array.isArray(packet.visual.nodes)||packet.visual.nodes.length!==3)
        throw Error("invalid three-node path");
    } else throw Error("unsupported visual");
  } catch (e) {errors.push(e.message);}
  return errors;
}
export function createInsightPacket(fields) {
  const packet={
    schemaVersion: INSIGHT_PACKET_VERSION,
    ...fields,
    flags:{truthVerdict:false,productionEligible:false,editorialStatus:"draft"}
  };
  const errors=validateInsightPacket(packet);
  if(errors.length)throw new TypeError(errors.join("; "));
  return packet;
}
