import {expressSemantic} from './semantic-reasoning-v12.js';
import {validateKernelPacket} from "./reasoning-kernel-v11.js";
// Renderings of existing distinctions, indexed by their validated rule IDs.
// Each row contains three alternate readings of the reflective headline.
export const expressionModes=["reflective","surprising","playful","challenging"];
const inflections={
 "requests-without-writing":["Every hour has a place. The story still has none.","Tonight’s calendar has room for every hour and no appointment with the story.","Repeat tonight exactly and the story still has nowhere to begin."],
 "deliberate-pause":["Repeat the pause and the next sitting never arrives.","Tomorrow needs a different timetable.","Give the postponed sitting a date and the week has to change."],
 "exception-repeated":["An exception can become the rule by returning tomorrow.","Even exceptions can keep a regular appointment.","Call tonight an exception only if another evening differs."],
 "chosen-rest":["Rest can be what the plan provides.","Rest has a seat at the table tonight.","Count the rest you chose as part of the day you made."],
 "exclusive-evening":["An evening entirely for writing depends on time elsewhere.","The story has booked the whole evening.","Repeat the writing evening and the other claims need another home."],
 "protected-or-remainder":["Two schedules can hide inside the same writing session.","The story got a seat. Its reservation is harder to see.","Put one more request against the boundary around writing."],
 "writing-sets-budget":["A writing session sets a limit on the rest of the evening.","The story has the biggest seat at a small table.","A writing priority asks something of the rest of the evening."],
 "planned-replies-majority":["Protecting time can leave replies with the largest share.","The replies have the biggest square on tonight’s calendar.","A plan that includes writing can still revolve around replies."],
 "room-for-both":["Rest already belongs to this writing evening.","Tonight the story has room for an intermission.","Count the pauses when you picture a week of writing."],
 "obligations-visible-replies":["The time replies take is clearer than the duty behind them.","The clock measures reply time. It cannot read the messages.","Time spent replying tells only part of the story of an obligation."],
 "obligations-visible-rest":["An evening with obligations can still give rest a substantial place.","Rest has a place on a busy page.","The time you gave rest is clearer than the reason for it."],
 "obligations-visible-writing":["Other claims on your time still leave writing a place.","The story shares the bill tonight.","Finding a sitting leaves its future unsettled."],
 "interrupted-without-replies":["An interruption can arrive without getting a reply.","The phone can knock without being let in.","A demand can arrive and still receive no reply."],
 "recurring-foothold":["Having a sitting today leaves tomorrow’s sitting open.","The story has a booking for tonight.","One sitting leaves the terms of its return open."],
 "feeling-and-forecast":["You know more about leaving just as you must choose again.","The next page is blank even after you reread the last one.","Take today’s loss seriously while leaving tomorrow open."],
 "new-reason-for-action":["Missing your friends can change the next decision while leaving the first open.","Distance adds a new entry to the plan.","Judge the next step with the knowledge the move gave you."],
 "continuity-of-place":["You kept the familiar job. Familiarity could still change.","The same desk can belong to a different team.","Staying could secure the job while the team changed around you."],
 "successive-decisions":["You stayed twice.","One job. Two decisions to stay.","Look twice before calling it one decision to stay."],
 "reasons-and-alternatives":["You can recover the reasons for staying and still never know the other job.","Only one of the two jobs has a yesterday.","Reconstruct the reasons and the other life is still missing."],
 "commitment-without-comparison":["You can choose tomorrow’s work with the comparison still open.","One job supplies tomorrow’s to-do list. The other remains a possibility.","Tomorrow’s commitment can come before a final comparison."],
 "terms-open-to-revision":["Accepting the offer left room to ask about the hours.","The offer was one conversation. The hours open another.","Date the evidence before judging the acceptance."],
 "cost-of-learning":["Learning the cost of the hours costs more evenings.","The trial period spends real evenings.","Include the price of waiting in the decision to wait."]
};
const preferences={
 "requests-without-writing":"surprising","deliberate-pause":"surprising","protected-or-remainder":"challenging",
 "exclusive-evening":"playful","room-for-both":"playful","writing-sets-budget":"challenging",
 "successive-decisions":"surprising","reasons-and-alternatives":"surprising","cost-of-learning":"challenging"
};

export function selectExpressionMeaning(packet){
 if(packet?.status!=="ready")return null;
 if(packet.version==="meaning/1.2")return {kind:"semantic",packet};
 if(packet.version==="reasoning/1.1"){
  if(!validateKernelPacket(packet))return null;
  const allowed=packet.claims.filter(c=>!c.role && c.classification!=="unsupported");
  return {kind:"kernel/"+packet.mechanism,caseId:packet.quote.id,quote:packet.quote,facts:packet.structure,
    headline:packet.headline,experience:allowed.map(c=>c.text).join(" "),interpretation:packet.relation,
    question:packet.question,warrant:packet.distinction,limits:packet.limitations,sources:[packet.source],trace:allowed};
 }
 const kind=packet.hiddenRelationship.kind;
 return {kind,caseId:packet.caseId,quote:packet.quote,facts:packet.evidence,headline:packet.userFacingDiscovery,
  experience:packet.experience,interpretation:packet.sourceGroundedInterpretation,question:packet.proactiveQuestion,
  warrant:packet.hiddenRelationship.warrant,concepts:packet.hiddenRelationship.concepts,
  limits:[packet.hiddenRelationship.open,...packet.limits],trace:packet.trace,sources:packet.sources,
  grounding:{observation:"evidence",headline:kind,interpretation:"centralPhilosophicalRelation",question:"proactiveQuestion"}};
}

export function selectExpressionStrategy(meaning){
 // Unknown or provisional distinctions have only the base reading.
 const eligible=meaning.kind==="semantic"?expressionModes:Object.hasOwn(inflections,meaning.kind)?expressionModes:["reflective"];
 const recommended=preferences[meaning.kind]||"reflective";
 return {eligible:[...eligible],recommended:eligible.includes(recommended)?recommended:"reflective"};
}

function duration(hours){
 if(hours===0)return "no time";
 if(hours===0.5)return "half an hour";
 return ({1:"one hour",1.5:"an hour and a half",2:"two hours",2.5:"two and a half hours",3:"three hours"})[hours];
}
function eveningSentence(facts,mode){
 const [writing,replies,rest]=facts.hours.map(duration);
 const influence={planned:"You chose a plan for your time.",interrupted:"You said other demands interrupted your plan.",obligations:"You had other things to get done."}[facts.declaredInfluence];
 if(mode==="playful")return "Tonight’s calendar reads like this: "+writing+" for the story, "+replies+" for replies and "+rest+" for rest. "+influence;
 if(mode==="challenging")return influence+" Look at where the evening went: "+writing+" for writing, "+replies+" for replies and "+rest+" for rest.";
 if(mode==="surprising")return "You set aside "+replies+" for replies and "+rest+" for rest. On that same evening, you gave "+writing+" to the story. "+influence;
 return "In the evening you imagined, you set aside "+writing+" for the story, "+replies+" for replies and "+rest+" for rest. "+influence;
}

export function composeExpression(meaning,requested){
 if(meaning.kind==="semantic")return expressSemantic(meaning.packet,requested);
 const strategy=selectExpressionStrategy(meaning);
 const mode=requested===undefined?strategy.recommended:strategy.eligible.includes(requested)?requested :"reflective";
 const idx=expressionModes.indexOf(mode);
 const headline=idx===0?meaning.headline:inflections[meaning.kind][idx-1];
 let experience;
 if(meaning.caseId==="dillard") experience=eveningSentence(meaning.facts,mode);
 else if(mode==="reflective")experience=meaning.experience;
 else {
   const {choice,imaginedLater,subsequentResponse}=meaning.facts;
   const later=imaginedLater[0].toLowerCase()+imaginedLater.slice(1);
   const next=subsequentResponse[0].toLowerCase()+subsequentResponse.slice(1);
   experience=mode==="playful"?choice+". Turn the page: "+later+". Your next line is another choice: "+next+".":
    mode==="challenging"?choice+". Only afterward, in this imagined future, "+later+". With that knowledge, "+next+".":
    choice+". Then "+later+". When you choose again, the situation has changed: "+next+".";
 }
 return {mode,headline,experience,interpretation:meaning.interpretation,proactiveQuestion:meaning.question};
}
