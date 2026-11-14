/**
 * Encounter v2.0 isolated storyteller and validator — CZ-127.
 * Deliberately leaves v1.9.6 expressSemantic() and generated bundles untouched.
 */
import {reasonSemantically} from "./semantic-reasoning-v12.js";
import {adaptEncounterEvidence,selectEmotionStrategy,V20_WORD_POLICY,isCuratedEveningPilot} from "./emotion-strategy-v20.js";
/**
 * v2-only scenario capability switch. The frozen v1.9.6 Dillard research model
 * requires exact allocation; here "cap" means six available half-hour slots,
 * some or all of which may remain intentionally unassigned. The kernel and
 * source/editorial contracts are unchanged, and the original object is untouched.
 */
export function withPartialScheduleCapacity(context){
 if(context?.mechanism!=="tradeoff"||
    !context.semantic?.selection?.central?.includes("repetition")||
    context.model?.resources?.length!==1||
    context.model.resources[0].type!=="exact")
  throw new TypeError("Only the declared exact-capacity recurrence research scenario can be adapted.");
 return {...context,model:{...context.model,
  resources:context.model.resources.map(r=>({...r,type:"cap"}))}};
}
const LABELS=["Your Choice","Back to the Philosopher","One Last Thing…"];
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
const fHours=n=>Number(n.toPrecision(12))+" "+(Number(n.toPrecision(12))===1?"hour":"hours");
const clean=x=>String(x||"").replace(/[.!?]+$/,"");
const lower=x=>x?x[0].toLowerCase()+x.slice(1):"";
const capitalize=x=>x?x[0].toUpperCase()+x.slice(1):"";
const toAction=s=>clean(String(s||"").replace(/^You\s+/i,""));

function choiceText(x){
 const e=x.grounded;
 if(x.kind==="repetition"){
  if(!isCuratedEveningPilot(x)){
    const period=e.period||"cycle",periods=e.periodPlural||"cycles";
    const active=e.cumulative.filter(a=>a.units>0);
    const amount=active.map(a=>fHours(a.units*e.unitHours)+" for "+a.label).join("; ");
    if(!active.length)return "Across "+e.repetitions+" imagined "+periods+
      ", no modeled activity receives time. Each "+period+" has "+
      fHours(e.perIntervalCapacity*e.unitHours)+" available, all unallocated. "+
      "This represents "+fHours(e.totalUnallocated*e.unitHours)+
      " unallocated across the repetitions, not your real life.";
    return "Across "+e.repetitions+" imagined "+periods+", the plan assigns "+
      amount+". Each "+period+" has "+fHours(e.perIntervalCapacity*e.unitHours)+
      " available: "+fHours(e.perIntervalAllocated*e.unitHours)+" assigned and "+
      fHours(e.perIntervalUnallocated*e.unitHours)+
      " unallocated. This is hypothetical, not your actual routine.";
  }
  const intervals=e.period?e.repetitions+" imagined "+e.periodPlural:e.repetitions+" imagined cycles";
  const assigned=e.cumulative.filter(a=>a.units>0);
  if(e.perIntervalUnallocated>0){
   const each=assigned.map(a=>fHours((a.units/e.repetitions)*e.unitHours)+" for "+a.label).join("; ");
   const totals=assigned.map(a=>fHours(a.units*e.unitHours)+" for "+a.label).join("; ");
   return "In each of "+intervals+", "+
     (assigned.length?"the plan assigns "+each:"no modeled activity receives time")+". "+
     fHours(e.perIntervalUnallocated*e.unitHours)+" remain unallocated. Across the "+
     e.repetitions+" intervals: "+(assigned.length?totals+"; ":"")+
     fHours(e.totalUnallocated*e.unitHours)+" unallocated. "+
     "This is an imagined schedule, not a report of your life.";
  }
  const amounts=e.cumulative.map(a=>fHours(a.units*e.unitHours)+" for "+a.label).join("; ");
  return "Across "+intervals+": "+amounts+". All "+
   (e.perIntervalCapacity*e.unitHours===3?"three hours":fHours(e.perIntervalCapacity*e.unitHours))+
   " of each evening are allocated. This is an imagined plan, not your actual routine.";
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
  if(!isCuratedEveningPilot(x)){
    const period=e.period||"cycle";
    return "Dillard draws attention to how ordinary days build a life. "+
     "Here, a repeated "+period+" is an imagined way to allocate time, not a report of anyone's habits. "+
     "The model shows assigned hours and any unallocated space. It cannot say what fills those gaps or which activity matters most.";
  }
  const writing=e.cumulative[0].units,rest=e.cumulative[2]?.units||0;
  const total=e.totalAllocated,available=e.totalCapacity;
  if(total===0)return "Dillard reminds us that a life is made from ordinary days. Here, the model assigns none of the available time to its activities. An empty plan cannot tell us what happens during those hours, let alone what somebody actually values.";
  if(total<available){
   if(writing===total)return "Dillard asks us to look at what ordinary days accumulate. Here, only "+
     fHours(e.perIntervalAllocated*e.unitHours)+" per evening goes to writing; "+
     fHours(e.perIntervalUnallocated*e.unitHours)+" remain unassigned. Repeating this pattern shows only where the modeled time goes, not what the unassigned hours become or what you truly value.";
   if(rest===total)return "Dillard reminds us that life is made from ordinary days. Here, rest has a modeled place, but some of the evening is still unallocated. Those open hours have no assigned activity in this scenario; they aren't secretly more rest, writing, or a verdict about priorities.";
   return "Dillard draws attention to how our days accumulate. This imagined plan reserves some time for chosen activities while leaving other hours unassigned. Repetition can reveal a modeled pattern, but it does not tell us what fills the gaps, or which activity matters most.";
  }
  if(writing===total)return "Dillard suggests that a life takes shape through ordinary days. Here, writing claims every modeled hour across repeated imagined evenings. Repeating a choice gives it a place in the pattern, but this thought experiment cannot say whether writing matters more than anything else.";
  if(rest===total)return "Dillard writes about how ordinary days make up a life. Here, the imagined evening makes space entirely for rest. Repetition gives that quiet time a recurring place; the model cannot judge its worth or tell us how anyone really spends their days.";
  return "Dillard shows how ordinary days can accumulate into a life. This imagined plan repeats time for writing, messages and rest instead of giving it all to one thing. It describes a possible pattern without measuring anyone's worth or revealing your actual habits.";
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
 return "Kierkegaard contrasts living forward with understanding events afterward. Later in the imagined route, a new detail appears: "+
  lower(clean(e.revelations[0]))+". "+
  "Looking back can change how the choice is understood, but it cannot reveal what the other future held. "+
  "Even the path you chose never provides a view from outside your ongoing life.";
}
function lastThing(x,brief){
 const id=brief.rhetorical_angle.id;
 switch(id){
  case "repetition-evidence-only":{
   const e=x.grounded,active=e.cumulative.filter(a=>a.units>0);
   const periods=e.periodPlural||"cycles";
   if(!active.length)return "These imagined "+periods+
     " leave all the modeled time open. An empty allocation is not an empty life.";
   if(active.length===1)return e.totalUnallocated>0?
     capitalize(active[0].label)+" has a recurring place in these imagined "+periods+
       ". The open hours remain unwritten.":
     capitalize(active[0].label)+" takes the modeled time in these imagined "+periods+
       ". That is one arrangement, not a whole life.";
   return "These imagined "+periods+
    " hold several commitments. Their arrangement is a pattern, not a verdict on anyone's life.";
  }
  case "schedule-booked":return "Your story got the entire three-hour slot, five imagined evenings in a row. At that rate, the calendar needs a bookmark.";
  case "full-evening-image":return "Five imagined evenings of writing form a longer chapter. The other activities have no assigned place in that block.";
  case "rest-is-part-of-day":return "No footnote, no apology: in this imagined timetable, rest gets a full chapter of its own.";
  case "full-but-no-writing":return "The story has an empty page. The evening was anything but empty.";
  case "shared-calendar":return "A story, some messages, a little rest. This imagined evening isn't a solo; it's a small ensemble.";
  case "repetition-neutral":return "The evening hasn't vanished. The model has simply run out of things to say about it.";
  case "apology-not-reply":return "You can offer the apology. You cannot reach over and write the other person's answer.";
  case "space-not-outcome":return "Not every silence is a verdict. In this imagined exchange, the other person still gets to choose what comes next.";
  case "later-apology":return "You can change what you offer next. You still cannot choose someone else's response.";
  case "stay-unlived":return "The job you didn't take gets no bad Mondays in this story. Unwritten futures enjoy that privilege.";
  case "move-hours":return "The difficult hours arrived after the job started. The offer didn't come with a preview of that chapter.";
  case "move-friends":return "The choice came first. Missing old friends arrived in the next imagined chapter.";
  case "other-tomorrow":return "A choice opens one page, not the page that was left unread.";
  case "partial-writing-window":return "The story has its hour. The other two hours aren't secretly part of the plot.";
  case "partial-rest-window":return "Rest gets a chair in this evening; the empty chairs haven't been claimed by another activity.";
  case "partial-shared-window":return "Some parts of this evening have a name. The open hours have not been cast in the story.";
  case "partial-other-window":return "Some time has a name; some doesn't. The unnamed time isn't secretly spoken for.";
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
    output.sections.length!==3 || output.sections.some((s,i)=>!s||typeof s!=="object"||
      s.label!==LABELS[i]||typeof s.text!=="string"||!s.text.trim()||
      !Array.isArray(s.evidence_ids)||s.evidence_ids.some(id=>typeof id!=="string")))
  return {status:"needs_editorial_review",reason:"Exactly three evidence-traced sections are required."};
 const validIds=new Set(x.evidence.map(z=>z.id));
 if(output.sections.some(s=>s.evidence_ids.some(id=>!validIds.has(id))))
  return {status:"needs_editorial_review",reason:"A section references missing evidence."};
 if(output.quote!==packet.quote || output.author!==packet.author ||
   output.source_url!==packet.sourceAdmission.sourceUrl ||
   output.source_warrant!==packet.sourceAdmission.centralClaim ||
   output.source_review!==packet.sourceAdmission.reviewStatus ||
   output.source_review!=="curated_provisional")
  return {status:"needs_editorial_review",reason:"Quoted source, warrant or review status changed."};
 // Do not dereference nested creative-brief fields until the entire structure is checked.
 const brief=output.brief,object=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
 const strings=x=>Array.isArray(x)&&x.every(v=>typeof v==="string"&&v.length>0);
 if(!object(brief)||brief.version!=="emotion-strategy/2.0.0"||
    typeof brief.strategy!=="string"||!["neutral","playful","provocative","warm","contemplative"].includes(brief.strategy)||
    brief.source_warrant_id!=="source:central"||
    !strings(brief.grounded_evidence_ids)||brief.grounded_evidence_ids.length===0||
    !strings(brief.prohibited_claims)||!object(brief.rhetorical_angle)||
    !["id","operator","scope"].every(k=>typeof brief.rhetorical_angle[k]==="string"&&brief.rhetorical_angle[k].length>0)||
    !object(brief.selection_trace)||!Array.isArray(brief.selection_trace.scored)||
    !Array.isArray(brief.selection_trace.rejected)||
    (brief.selection_trace.requested_tone!==null&&
      typeof brief.selection_trace.requested_tone!=="string")||
    !["string","object"].includes(typeof brief.fallback_reason)||
    (brief.fallback_reason!==null&&typeof brief.fallback_reason!=="string")||
    brief.grounded_evidence_ids.some(id=>!validIds.has(id)))
  return {status:"needs_editorial_review",reason:"Malformed or unauthorized creative brief."};
 const expectedBrief=selectEmotionStrategy(packet,{tone:output.brief?.selection_trace?.requested_tone??undefined});
 if(expectedBrief.status!=="ready"||JSON.stringify(expectedBrief)!==JSON.stringify(output.brief))
  return {status:"needs_editorial_review",reason:"Creative brief differs from evidence-grounded deterministic selection."};
 if(output.sections[0].text!==choiceText(x)||output.sections[1].text!==teachingText(x)||
    output.sections[2].text!==lastThing(x,output.brief))
  return {status:"needs_editorial_review",reason:"Generated copy differs from evidence-grounded approved composer; human rewriting needs editorial review."};
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
