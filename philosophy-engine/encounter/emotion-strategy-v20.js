import {traceSourcePassage} from "./source-passage-witness-v19.js";
/**
 * CZ-127 Encounter v2.0 isolated research proof.
 * This module consumes meaning/1.2 as an immutable authority. It neither reads
 * user profiles nor changes the kernel. Editorial mappings are provisional.
 */
const SOURCE_CLAIMS = Object.freeze({
  repetition: "Dillard draws attention to the way the arrangement of days accumulates into a life.",
  agency: "Epictetus distinguishes choices and judgments within rational agency from outcomes that depend on others.",
  information: "A life must be lived forward even though an account of it is formed retrospectively, never from outside time."
});
/**
 * v2-only provisional editorial identity ledger: independent of the incoming
 * meaning/1.2 packet, keyed by its curated source URL. Not scholarly approval.
 * The legacy reasoning kernel and shared source witness remain untouched.
 */
/**
 * Source-work editorial identity contract, version 2.0.0. Only these three
 * already-admitted pilot sources are included (no dataset expansion).
 * A title and a review/excerpt label may differ between the two existing
 * packet fields while still identifying the same work. Each allowed form is
 * explicitly documented; all other texts fail closed. This is NOT scholarly
 * source verification or a promotion of any provisional review status.
 */
export const SOURCE_WORK_IDENTITY_V20=Object.freeze({
 version:"source-work-identity/2.0.0",
 sources:Object.freeze({
  "https://www.dltn.io/posts/annie-dillard-keep-a-daily-routine":Object.freeze({
   author:"Annie Dillard",kind:"repetition",canonicalWork:"The Writing Life",
   allowedWorkLabels:Object.freeze([
    "The Writing Life",
    "The Writing Life (excerpt)",
    "The Writing Life (excerpt; source review pending)",
    "The Writing Life (1989), scheduling passage",
    "The Writing Life — scheduling excerpt"
   ])
  }),
  "https://barryfvaughan.org/text/philtext/epictetus/enchiridion.html":Object.freeze({
   author:"Epictetus",kind:"agency",canonicalWork:"Enchiridion",
   allowedWorkLabels:Object.freeze([
    "Enchiridion",
    "The Enchiridion",
    "Enchiridion · §1",
    "Enchiridion · §1, Elizabeth Carter translation",
    "Enchiridion (§1; Elizabeth Carter translation)"
   ])
  }),
  "https://homepage.divms.uiowa.edu/~jorgen/kierkegaardquotesource.html":Object.freeze({
   author:"Søren Kierkegaard",kind:"information",canonicalWork:"Journal JJ:167",
   allowedWorkLabels:Object.freeze([
    "Journal JJ:167",
    "Journal JJ:167 (shortened quotation)",
    "Journal JJ:167 (wording review pending)",
    "Journal JJ:167 (shortened quotation; wording review pending)",
    "Journal JJ:167 (1843), shortened variant"
   ])
  })
 })
});
const normalizeWorkLabel=v=>typeof v==="string"?v.normalize("NFKC").replace(/\s+/g," ").trim():null;
function recognizedWorkLabel(identity,work){
 const value=normalizeWorkLabel(work);
 return !!value && identity.allowedWorkLabels.some(x=>normalizeWorkLabel(x)===value);
}
const PILOT_ACTIVITY_LABELS=Object.freeze([
 "writing your story","answering messages","resting and recharging"
]);
/** The original Dillard display labels are editorial aliases, not arbitrary
 * position-based names. Reject stale aliases if a selected action is renamed. */
const PILOT_SELECTED_LABEL_BY_READING=Object.freeze({
 "writing your story":"Write your story",
 "answering messages":"Answer messages",
 "resting and recharging":"Rest and recharge"
});

export function isCuratedEveningPilot(x){
 const e=x?.grounded;
 return x?.kind==="repetition" && e?.period==="evening" &&
  e?.periodPlural==="evenings" &&
  Array.isArray(e.cumulative) && e.cumulative.length===PILOT_ACTIVITY_LABELS.length &&
  e.cumulative.every((v,i)=>v.label===PILOT_ACTIVITY_LABELS[i]);
}

export const V20_WORD_POLICY = Object.freeze({
  total: {min:80,max:120},
  sections: [{min:10,max:48},{min:18,max:65},{min:9,max:26}],
  status:"FROZEN_V196_UNTIL_FOUNDER_APPROVAL"
});
const STRATEGY_ORDER = ["contemplative","provocative","warm","playful"];
const copy = value => JSON.parse(JSON.stringify(value));

export function adaptEncounterEvidence(packet) {
  if (packet?.version !== "meaning/1.2" || packet.status !== "ready" ||
      !Array.isArray(packet.claims) || !packet.claims.includes(packet.meaning) ||
      packet.meaning?.classification === "unsupported")
    return {status:"incompatible",reason:"An authoritative READY meaning/1.2 claim is required."};
  const kind=packet.meaning.kind, source=packet.sourceAdmission, e=packet.meaning.evidence;
  if (!Object.hasOwn(SOURCE_CLAIMS,kind) ||
      !source || source.centralClaim !== SOURCE_CLAIMS[kind] ||
      !source.scenarioBridge || !source.sourceUrl || source.sourceUrl!==packet.source?.url ||
      !["curated_passage_match","unverified"].includes(source.claimTraceStatus) ||
      !Array.isArray(packet.selectedChoices) || !packet.selectedChoices.length ||
      !Array.isArray(packet.limitations) || !packet.limitations.length ||
      !e || typeof e !== "object")
    return {status:"incompatible",reason:"Missing or incompatible provisional editorial/source contract."};
  const identity=SOURCE_WORK_IDENTITY_V20.sources[source.sourceUrl];
  if(!identity || identity.kind!==kind || packet.author!==identity.author ||
      typeof packet.author!=="string" || !packet.author.trim())
    return {status:"incompatible",reason:"Author does not match the provisional source-linked editorial identity."};
  if(!recognizedWorkLabel(identity,packet.source?.work) ||
     !recognizedWorkLabel(identity,source.sourceWork))
    return {status:"incompatible",reason:"Source-work metadata is missing or not admitted by the versioned source-identity contract."};
  if (traceSourcePassage(source,packet.quote).status!=="curated_passage_match")
    return {status:"incompatible",reason:"Displayed quotation no longer matches the curated source witness."};
  if(kind==="repetition" && Array.isArray(e.cumulative) &&
     e.cumulative.some((slot,i)=>Object.hasOwn(PILOT_SELECTED_LABEL_BY_READING,slot?.label) &&
       packet.selectedChoices[i]?.label!==PILOT_SELECTED_LABEL_BY_READING[slot.label]))
    return {status:"incompatible",reason:"Selected activity and its curated reading label disagree."};

  if (kind==="repetition" && (!Array.isArray(e.cumulative) || e.cumulative.length<2 ||
      !e.cumulative.every(x=>x && typeof x.label==="string" && Number.isSafeInteger(x.units) && x.units>=0) ||
      !Number.isSafeInteger(e.repetitions) || e.repetitions<2 ||
      !Number.isFinite(e.unitHours) || e.unitHours<=0 ||
      !["perIntervalCapacity","perIntervalAllocated","perIntervalUnallocated",
         "totalCapacity","totalAllocated","totalUnallocated"].every(k=>Number.isSafeInteger(e[k])&&e[k]>=0) ||
      e.totalAllocated!==e.cumulative.reduce((n,x)=>n+x.units,0) ||
      e.perIntervalCapacity!==e.perIntervalAllocated+e.perIntervalUnallocated ||
      e.totalCapacity!==e.totalAllocated+e.totalUnallocated ||
      e.totalCapacity!==e.perIntervalCapacity*e.repetitions ||
      e.totalAllocated!==e.perIntervalAllocated*e.repetitions ||
      e.totalUnallocated!==e.perIntervalUnallocated*e.repetitions ||
      !Number.isSafeInteger(e.perIntervalCapacity*e.repetitions) ||
      packet.structure?.budgets?.[0]!==e.perIntervalCapacity ||
      packet.structure?.spent?.[0]!==e.perIntervalAllocated ||
      packet.structure?.slack?.[0]!==e.perIntervalUnallocated))
    return {status:"incompatible",reason:"Invalid modeled recurrence: available, allocated and unallocated slots must reconcile."};
  if (kind==="agency" && (!Array.isArray(e.events) || e.events.length<2 ||
      !e.events.every(x=>typeof x.action==="string" && x.occurred && typeof x.occurred==="object") ||
      typeof e.external!=="string" || !e.external))
    return {status:"incompatible",reason:"Missing agency ownership or event ledger."};
  if (kind==="information" && (!Array.isArray(e.steps) || e.steps.length<2 ||
      !Array.isArray(e.revelations) || !e.revelations.length ||
      !e.revelations.every(x=>typeof x==="string") ||
      typeof e.firstChoice!=="string"))
    return {status:"incompatible",reason:"Missing imagined event or decision sequence."};
  const atoms=[
    {id:"source:central",origin_path:"sourceAdmission.centralClaim",epistemic_status:"curated_provisional",value:source.centralClaim},
    {id:"source:bridge",origin_path:"sourceAdmission.scenarioBridge",epistemic_status:"curated_provisional",value:source.scenarioBridge},
    {id:"meaning:central",origin_path:"meaning.evidence",epistemic_status:kind==="repetition"?"modeled":"scenario_evidence",value:copy(e)},
    ...packet.selectedChoices.map((c,i)=>({id:"choice:"+i,origin_path:"selectedChoices["+i+"]",epistemic_status:"selected",value:copy(c)})),
    ...packet.limitations.map((l,i)=>({id:"limit:"+i,origin_path:"limitations["+i+"]",epistemic_status:"source_limit",value:l}))
  ];
  if(kind==="agency")for(let i=0;i<e.events.length;i++)
    atoms.push({id:"event:"+i,origin_path:"meaning.evidence.events["+i+"]",epistemic_status:"modeled_event",value:copy(e.events[i])});
  if(kind==="information")for(let i=0;i<e.revelations.length;i++)
    atoms.push({id:"imagined:"+i,origin_path:"meaning.evidence.revelations["+i+"]",epistemic_status:"hypothetical",value:e.revelations[i]});
  return {
    version:"encounter-evidence/2.0.0",status:"ready",kind,
    quote:packet.quote,author:packet.author,source:copy(packet.source),
    warrant_id:"source:central",evidence:atoms,selected_choices:copy(packet.selectedChoices),
    grounded:copy(e),limitations:[...packet.limitations],
    ...(kind==="repetition"?{allocation:{
      per_interval_available_slots:e.perIntervalCapacity,
      per_interval_allocated_slots:e.perIntervalAllocated,
      per_interval_unallocated_slots:e.perIntervalUnallocated,
      total_available_slots:e.totalCapacity,
      total_allocated_slots:e.totalAllocated,
      total_unallocated_slots:e.totalUnallocated,
      unit_hours:e.unitHours,
      imagined_repetitions:e.repetitions
    }}:{}),
    source_verification:"provisional_not_scholarly_verified",
    prohibited_claims:["actual_user_history","user_emotion_or_motive","guaranteed_outcome","actual_friend_response","unchosen_future_as_fact"],
    tension_id:"meaning:"+kind
  };
}

function opportunities(x) {
  const e=x.grounded,c=[];
  const offer=e.events?.some(v=>v.occurred?.apologyOffered===true);
  const initialOffer=e.events?.[0]?.occurred?.apologyOffered===true;
  const total=e.totalAllocated,available=e.totalCapacity;
  const full=total===available,partial=total<available;
  const writing=e.cumulative?.[0]?.units,rest=e.cumulative?.[2]?.units;
  const add=(id,strategy,operator,applicable,score)=>c.push({
    id,strategy,operator,applicable,score,
    required:["meaning:central","choice:0","source:central"],
    evidence_ids:["meaning:central","choice:0","source:central"]
  });
  if(x.kind==="repetition"){
    if(!isCuratedEveningPilot(x)){
      // Never project curated writing/rest/evening rhetoric onto a generic
      // meaning/1.2 recurrence. Actual labels and period drive its copy.
      add("repetition-evidence-only","contemplative","grounded_allocation",true,14);
      return c;
    }
    add("schedule-booked","playful","calendar_image",full && total>0 && writing===total && rest===0,15);
    add("full-evening-image","contemplative","repeated_page",full && total>0 && writing===total,13);
    add("rest-is-part-of-day","warm","gentle_reversal",full && total>0 && rest===total,15);
    add("full-but-no-writing","warm","absence_contrast",full && total>0 && writing===0 && rest!==total,15);
    add("shared-calendar","contemplative","coexisting_uses",full && writing>0 && writing<total,13);
    add("partial-writing-window","contemplative","bounded_open_time",partial && writing>0 && writing===total,15);
    add("partial-rest-window","warm","rest_with_open_time",partial && rest>0 && rest===total,15);
    add("partial-shared-window","contemplative","partial_timetable",partial && total>0 && writing>0 && writing<total,13);
    add("partial-other-window","contemplative","unclaimed_capacity",partial && total>0 && writing===0 && rest===0,12);
    add("repetition-neutral","contemplative","quiet_pattern",total===0,15);
  }else if(x.kind==="agency"){
    add("apology-not-reply","provocative","agency_reversal",initialOffer,15);
    add("space-not-outcome","warm","unwritten_answer",!offer,15);
    add("later-apology","contemplative","changed_action",offer&&!initialOffer,14);
    // A sensitive relationship encounter does not automatically permit joking.
    add("apology-humor","playful","person_joke",false,16);
  }else if(x.kind==="information"){
    const first=e.firstChoice,news=String(e.revelations[0]).toLowerCase();
    add("stay-unlived","provocative","unavailable_future",first==="stay",15);
    add("move-hours","contemplative","knowledge_after_action",first==="change"&&news.includes("hours"),15);
    add("move-friends","warm","new_information",first==="change"&&news.includes("friends"),15);
    add("other-tomorrow","contemplative","unfinished_hindsight",first==="change",12);
    add("future-joke","playful","forced_humor",false,16);
  }
  return c;
}
export function selectEmotionStrategy(packet,options={}) {
  const x=adaptEncounterEvidence(packet);
  if(x.status!=="ready")return {status:"needs_editorial_review",reason:x.reason};
  const requested=options.tone??null;
  if(requested!==null && !STRATEGY_ORDER.includes(requested))
    return {status:"needs_editorial_review",reason:"Unknown tone request."};
  const all=opportunities(x);
  const rejected=all.filter(a=>!a.applicable).map(a=>({id:a.id,reason:"Missing scenario evidence or inappropriate expressive strategy."}));
  const viable=all.filter(a=>a.applicable && (requested===null||a.strategy===requested) && a.score>=11);
  viable.sort((a,b)=>b.score-a.score||STRATEGY_ORDER.indexOf(a.strategy)-STRATEGY_ORDER.indexOf(b.strategy)||a.id.localeCompare(b.id));
  const chosen=viable[0]||null;
  const fallback_reason=chosen?null:requested?"No source-grounded angle is eligible for the requested strategy.":"No strong source-grounded expressive opportunity.";
  const trace={
    requested_tone:requested,
    scored:all.map(a=>({id:a.id,strategy:a.strategy,eligible:a.applicable,score:a.applicable?a.score:null})),
    rejected,chosen_id:chosen?.id??null,
    tie_break:"score DESC; contemplative > provocative > warm > playful; angle id ASC"
  };
  return {
    status:"ready",version:"emotion-strategy/2.0.0",strategy:chosen?.strategy||"neutral",
    grounded_evidence_ids:chosen?.evidence_ids||["meaning:central","source:central","choice:0"],
    source_warrant_id:x.warrant_id,
    rhetorical_angle:{id:chosen?.id||"quiet-fallback",operator:chosen?.operator||"quiet_summary",scope:"fictional_example_only"},
    prohibited_claims:[...x.prohibited_claims],
    selection_trace:trace,fallback_reason
  };
}
