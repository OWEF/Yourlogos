/**
 * CZ-128 B2.4 — versioned, SOURCE-BOUND v2-compatible Emotion/Expression bridge.
 *
 * The frozen v2.0 composer rightly REFUSES "conversion": do not mutate its
 * allowlist, spoof its 2.0 output, or reuse the v1.2 semantic expression.
 * A new structurally constrained conversion adapter consumes only the
 * authoritative frozen meaning/1.2 packet. Publication remains disabled.
 */
export const B24_BRIDGE_VERSION="source-bound-encounter-v2-compatible/2.4.0";
export const B24_EMOTION_VERSION="emotion-strategy-v2-compatible/2.4.0";
export const B24_EXPRESSION_VERSION="encounter-output-v2-compatible/2.4.0";
export const B24_FOCI=Object.freeze(["life_exchanged","time_kept"]);
const LABELS=Object.freeze(["Your Choice","Back to the Philosopher","One Last Thing…"]);
const LIMITS=Object.freeze({total:{min:80,max:120},
 sections:[{min:10,max:48},{min:18,max:65},{min:9,max:26}]});
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=(reason)=>({status:"needs_editorial_review",version:B24_BRIDGE_VERSION,
  reason,publicationAllowed:false,productionPlayable:false});
/**
 * The calling boundary must authenticate its own exact founder-provisional
 * record against the server-owned registry. This adapter independently
 * verifies that its inference comes from the same record and model.
 */
function evidence(packet,contract,choice,focus){
 const meaning=packet?.meaning,e=meaning?.evidence,s=packet?.sourceAdmission;
 if(!B24_FOCI.includes(focus))return null;
 if(contract?.gameId!=="balance_of_values"||
    contract?.editorialAuthority!=="FOUNDER_POLICY_RESEARCH_ONLY"||
    contract?.independentlyScholarlyApproved!==false||
    contract?.publicationAllowed!==false||
    contract?.source?.reviewState!=="founder_provisional"||
    !/^sha256:[0-9a-f]{64}$/.test(contract?.contentFingerprint||"")||
    packet?.version!=="meaning/1.2"||packet.status!=="ready"||
    !Array.isArray(packet.claims)||!packet.claims.includes(meaning)||
    meaning.classification!=="conditional"||meaning.kind!=="conversion"||
    !packet.semantic?.admission?.allowedClaimKinds?.includes("conversion")||
    s?.reviewStatus!=="curated_provisional"||s.independentlySourceVerified!==false||
    !["curated_passage_match","unverified"].includes(s.claimTraceStatus)||
    s.centralClaim!==contract.context?.semantic?.admission?.centralClaim||
    s.scenarioBridge!==contract.context.semantic.admission.scenarioBridge||
    s.sourceUrl!==contract.source.referenceUrl||
    packet.source?.url!==contract.source.referenceUrl||
    packet.quote!==contract.source.quote||
    packet.author!==contract.source.author||
    !same(packet.limitations,[contract.context.semantic.boundary])||
    !same(packet.selectedChoices.map(c=>c.id),contract.context.model.choices.map(c=>c.id))||
    !Array.isArray(choice?.amounts)||!same(choice.budgets,[8])||
    choice.amounts.length!==2)return null;
 const [work,kept]=choice.amounts;
 if(!Number.isSafeInteger(work)||!Number.isSafeInteger(kept)||
   work<0||kept<0||work+kept!==8||
   !same(packet.structure.amounts,choice.amounts)||
   !same(packet.structure.budgets,[8])||
   !same(packet.selectedChoices.map(c=>c.amount),choice.amounts)||
   !Number.isSafeInteger(e?.measure)||e.measure!==work||
   e.unit!==contract.context.model.metric.unit||
   contract.context.model.resources[0].type!=="exact"||
   contract.context.model.resources[0].min!==8||
   contract.context.model.resources[0].max!==8||
   !same(contract.context.model.choices.map(c=>c.cost),[[1],[1]])||
   !same(contract.context.model.metric.weights,[1,0])||
   contract.scenario.fictionalNetHourlyEarnings!==20)return null;
 return {work,kept,assumedIncome:work*20,source:s.centralClaim,
  bridge:s.scenarioBridge,limitation:packet.limitations[0],
  choiceIds:packet.selectedChoices.map(c=>c.id),
  meaningEvidenceId:"meaning:conversion",sourceEvidenceId:"source:central",
  claimTraceStatus:s.claimTraceStatus,focus};
}
export function selectEmotionB24(packet,contract,choice,{focus="life_exchanged"}={}){
 const verified=evidence(packet,contract,choice,focus);
 if(!verified)return fail("Untrusted, mismatched or non-conversion source evidence");
 // Structurally selected, NOT a diagnosis of the person's state. The
 // requested focus is a reader-authored interpretive question, not a motive.
 return {status:"ready",version:B24_EMOTION_VERSION,strategy:"contemplative",
  rhetorical_angle:{operator:"source_bound_conversion",
   scope:"hypothetical_life_hours",focus},
  grounded_evidence_ids:["source:central","meaning:conversion","limit:0"],
  prohibited_claims:[
   "No preference, virtue, moral ranking or personality is inferred.",
   "No actual purchase, salary or historical wage is inferred.",
   "No counterfactual outcome beyond the modeled exchange is known."
  ],
  selected_by:"declared_reader_lens_plus_authenticated_source_meaning",
  inferredReaderEmotion:false,publicationAllowed:false};
}
function copy(verified){
 const {work,kept,assumedIncome,focus}=verified;
 const choice="This imagined week puts "+work+" of eight hours into optional extra work and keeps "+
  kept+" for other uses. At an invented $20 net hourly rate, the shifts would earn $"+
  assumedIncome+"; they prove neither a purchase nor what you value.";
 const source=verified.source+" "+
  (focus==="time_kept"?
   "Viewed from the time retained, each extra work hour is also an hour no longer free for other uses. ":
   "Viewed from extra paid work, an additional hour earns money but also costs one hour available for other uses. ")+
  "These eight hours and the wage are invented. The model cannot rank the worth of either use or reveal your real priorities.";
 const question=focus==="time_kept"?
  "When you keep one hour available, what possibilities stay open—and which of their values can no number measure?":
  "If you exchanged one more hour for money, what would you forgo—and what could no price decide for you?";
 return [choice,source,question];
}
function compose(packet,contract,canonical,focus){
 const e=evidence(packet,contract,canonical,focus);
 if(!e)return fail("The source-conversion contract failed its replayable evidence check");
 const emotion=selectEmotionB24(packet,contract,canonical,{focus});
 if(emotion.status!=="ready")return emotion;
 const lines=copy(e);
 const counts=lines.map(count),total=counts.reduce((a,b)=>a+b,0);
 if(total<LIMITS.total.min||total>LIMITS.total.max||
    counts.some((n,i)=>n<LIMITS.sections[i].min||n>LIMITS.sections[i].max))
  return fail("Composition exceeds the 80–120 and section-specific word policy; never truncate the qualification: "+
   JSON.stringify({counts,total}));
 const sections=lines.map((text,i)=>({label:LABELS[i],text,
  evidence_ids:i===0?["meaning:conversion","choice:0","choice:1"]:
   i===1?["source:central","source:bridge","meaning:conversion","limit:0"]:
    ["meaning:conversion","limit:0"]}));
 return {status:"ready",version:B24_EXPRESSION_VERSION,
  sourceReview:"founder_provisional_not_scholar_verified",
  source_warrant:packet.sourceAdmission.centralClaim,
  source_url:contract.source.referenceUrl,author:packet.author,quote:packet.quote,
  brief:emotion,sections,wordCount:total,sectionWordCounts:counts,
  meaningEvidenceVerified:true,
  evidenceTrace:{kind:"conversion",meaningId:"meaning:conversion",
   contractFingerprint:contract.contentFingerprint,
   sourceFingerprint:contract.proposalFingerprint,
   mathematicalDifference:1,readerAuthoredFocus:focus},
  publicationAllowed:false,productionPlayable:false};
}
export function validateConversionEncounterB24(packet,contract,canonical,focus,output){
 const expected=compose(packet,contract,canonical,focus);
 if(expected.status!=="ready")return expected;
 if(!same(expected,output))return fail("Expression or emotion differs from recomposed, source-authenticated evidence");
 return {status:"ready",wordCount:expected.wordCount,sectionWordCounts:expected.sectionWordCounts};
}
export function renderConversionEncounterB24(packet,contract,canonical,{focus="life_exchanged"}={}){
 const out=compose(packet,contract,canonical,focus);
 if(out.status!=="ready")return out;
 const check=validateConversionEncounterB24(packet,contract,canonical,focus,out);
 return check.status==="ready"?out:check;
}
