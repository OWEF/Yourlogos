/**
 * Encounter v2.0 isolated storyteller and validator — CZ-127.
 * Deliberately leaves v1.9.6 expressSemantic() and generated bundles untouched.
 */
import {reasonSemantically} from "./semantic-reasoning-v12.js";
import {adaptEncounterEvidence,selectEmotionStrategy,V20_WORD_POLICY} from "./emotion-strategy-v20.js";
const LABELS=["Your Choice","Back to the Philosopher","One Last Thing…"];
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
const fHours=n=>Number(n.toPrecision(12))+" "+(Number(n.toPrecision(12))===1?"hour":"hours");
const clean=x=>String(x||"").replace(/[.!?]+$/,"");
const lower=x=>x?x[0].toLowerCase()+x.slice(1):"";
const toAction=s=>clean(String(s||"").replace(/^You\s+/i,""));

function choiceText(x){
 const e=x.grounded;
 if(x.kind==="repetition"){
  const intervals=e.period?e.repetitions+" imagined "+e.periodPlural:e.repetitions+" imagined cycles";
  const amounts=e.cumulative.map(a=>fHours(a.units*e.unitHours)+" for "+a.label);
  const allocated=amounts.length===2?amounts.join(" and "):amounts.slice(0,-1).join(", ")+", and "+amounts.at(-1);
  const extra=e.totalUnallocated>0?" "+fHours(e.totalUnallocated*e.unitHours)+" stay unallocated in this model.":"";
  return "Across "+intervals+", your selected plan sets aside "+allocated+"."+extra+" These are imagined allocations, not a record of your real evenings.";
 }
 if(x.kind==="agency"){
  const first=x.selected_choices[0]?.label||e.events[0].action;
  const second=x.selected_choices.at(-1)?.label||e.events.at(-1).action;
  const happened=e.events.some(a=>a.occurred?.apologyOffered===true);
  return "In this imagined conversation, you selected “"+first+"” and then “"+second+".” "+
    (happened?"The scenario records an apology as offered. ":"No offered apology is recorded. ")+
    "Whether your friend forgives you is unknown, and selecting a response does not confirm other actions.";
 }
 const first=toAction(e.steps[0].label),last=toAction(e.steps.at(-1).label);
 return "You chose to "+first+". Later, in this imagined route, "+lower(clean(e.revelations[0]))+
  ". You then chose to "+last+". The future of the path not taken remains unknown; this is a scenario, not your life.";
}
function teachingText(x){
 const e=x.grounded;
 if(x.kind==="repetition"){
  const slots=e.cumulative,first=slots[0],rest=slots[2];
  const contrast=e.totalAllocated===0?"no time is assigned to any modeled activity":
   first.units===e.totalAllocated?"writing takes the whole modeled block":
   rest && rest.units===e.totalAllocated?"rest takes the whole modeled block":
   first.units===0?"writing receives none of the modeled time":
   "writing shares the modeled time with other activities";
  return "Dillard connects ordinary days with the shape of a life. In your imagined repeated schedule, "+
   contrast+". A repeated timetable makes that pattern visible without telling us how you really live. "+
   "It also does not show that writing, messages, or rest is inherently worth more than another activity.";
 }
 if(x.kind==="agency"){
  const happened=e.events.some(a=>a.occurred?.apologyOffered===true);
  return "Epictetus draws a boundary between choices we can make and responses that belong to someone else. "+
   (happened?"Here, the imagined apology is offered, but forgiveness is still the friend's decision. "+
   "Choosing another response does not extend your control over theirs. ":
   "Here, selecting space does not establish that an apology happened or that forgiveness followed. "+
   "This does not make silence good or bad. ")+
   "Nothing in the scenario tells us either person's feelings or motives.";
 }
 return "Kierkegaard contrasts living forward with understanding events afterward. In this imagined route, "+
  lower(clean(e.revelations[0]))+" only becomes known after the first decision. "+
  "Looking back can change how the choice is understood, but it cannot reveal what the other future held. "+
  "Even the path you chose never provides a view from outside your ongoing life.";
}
function lastThing(x,brief){
 const id=brief.rhetorical_angle.id;
 switch(id){
  case "schedule-booked":return "Your story has booked the whole evening. No other activity got a reservation in that block.";
  case "rest-is-part-of-day":return "Rest did not disappear from the timetable. This time, it is the whole timetable.";
  case "full-but-no-writing":return "The story has an empty page. The evening was anything but empty.";
  case "shared-calendar":return "One evening holds several different things. Repeat it, and each gets another page.";
  case "repetition-neutral":return "The time is still available in the model. Its destination remains a blank page.";
  case "apology-not-reply":return "You can offer the apology. You cannot reach over and write the other person's answer.";
  case "space-not-outcome":return "Giving space is a selected response. The other person's reply is still their own.";
  case "later-apology":return "You can change what you offer next. You still cannot choose someone else's response.";
  case "stay-unlived":return "You can revisit the choice. You cannot visit the future you never chose.";
  case "move-hours":return "The hard hours entered the story after the decision. The other path remains unread.";
  case "move-friends":return "The choice came first. Missing old friends arrived in the next imagined chapter.";
  case "other-tomorrow":return "A choice opens one page, not the page that was left unread.";
  default:
   if(x.kind==="repetition")return "This imagined pattern has a shape. No one knows whether your real days will follow it.";
   if(x.kind==="agency")return "Your response is yours to choose. The other person's reply remains an unwritten line.";
   return "One future becomes a story. The future not chosen stays unknown.";
 }
}
export function validateEncounterV20(packet,output) {
 const x=adaptEncounterEvidence(packet);
 if(x.status!=="ready")return {status:"needs_editorial_review",reason:x.reason};
 if(output?.version!=="encounter-output/2.0.0"||!Array.isArray(output.sections)||
    output.sections.length!==3 || output.sections.some((s,i)=>s.label!==LABELS[i]||!s.text?.trim()||!Array.isArray(s.evidence_ids)))
  return {status:"needs_editorial_review",reason:"Exactly three evidence-traced sections are required."};
 const validIds=new Set(x.evidence.map(z=>z.id));
 if(output.sections.some(s=>s.evidence_ids.some(id=>!validIds.has(id))))
  return {status:"needs_editorial_review",reason:"A section references missing evidence."};
 if(output.quote!==packet.quote || output.source_url!==packet.sourceAdmission.sourceUrl ||
   output.source_warrant!==packet.sourceAdmission.centralClaim ||
   output.source_review!=="curated_provisional")
  return {status:"needs_editorial_review",reason:"Quoted source, warrant or review status changed."};
 if(output.brief?.source_warrant_id!=="source:central"||
    output.brief.grounded_evidence_ids.some(id=>!validIds.has(id)))
  return {status:"needs_editorial_review",reason:"Creative brief has invalid evidence references."};
 const counts=output.sections.map(s=>count(s.text)),total=counts.reduce((a,b)=>a+b,0);
 const valid=total>=V20_WORD_POLICY.total.min&&total<=V20_WORD_POLICY.total.max &&
   counts.every((n,i)=>n>=V20_WORD_POLICY.sections[i].min&&n<=V20_WORD_POLICY.sections[i].max);
 if(!valid)return {status:"needs_editorial_review",reason:"Frozen v1.9.6 word policy violated; do not truncate claims.",counts,total};
 return {status:"ready",wordCount:total,sectionWordCounts:counts,
  source_status:"provisional_not_scholarly_verified"};
}
export function renderEncounterV20(packet,{tone}={}){
 const x=adaptEncounterEvidence(packet);
 if(x.status!=="ready")return {status:"needs_editorial_review",reason:x.reason};
 const brief=selectEmotionStrategy(packet,{tone});
 if(brief.status!=="ready")return brief;
 const out={
  version:"encounter-output/2.0.0",
  quote:packet.quote,author:packet.author,source_url:packet.sourceAdmission.sourceUrl,
  source_warrant:packet.sourceAdmission.centralClaim,source_review:packet.sourceAdmission.reviewStatus,
  brief,
  sections:[
   {label:LABELS[0],text:choiceText(x),evidence_ids:["meaning:central","choice:0"]},
   {label:LABELS[1],text:teachingText(x),evidence_ids:["source:central","source:bridge","meaning:central","limit:0"]},
   {label:LABELS[2],text:lastThing(x,brief),evidence_ids:brief.grounded_evidence_ids}
  ]
 };
 const checked=validateEncounterV20(packet,out);
 return checked.status==="ready"?{...out,...checked}:{...checked,brief};
}
export function encounterV20(context,input,options={}){
 const packet=reasonSemantically(context,input);
 if(packet.status!=="ready")return {status:"needs_editorial_review",reason:"Reasoning failed: "+packet.reason};
 return renderEncounterV20(packet,options);
}
