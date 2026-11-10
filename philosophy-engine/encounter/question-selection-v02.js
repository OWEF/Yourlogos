/**
 * CZ-112 · Observation → Philosophical Tension → Personal Relevance
 *        → Question Selection.
 *
 * A pure, question-centered reasoning extension to CZ-111. It consumes
 * *observed* choices and the already source-linked Insight Packet; it never
 * infers a real emotion from a slider or declares a philosopher's truth.
 * "settled" is explicitly SELF-REPORTED after seeing the first result.
 */
import {validateInsightPacket} from "./insight-packet-v01.js";

export const QUESTION_REASONER_VERSION = 2;
export const REACTIONS = Object.freeze(["unanswered","settled","curious","unsettled"]);

const hours=x=>String(x)+"h";
const works={income:"She earns her own money",space:"She gets a room to write",access:"A publisher reads her work"};
const obstacles={income:"She still has bills to pay",space:"People still interrupt her",access:"Other editors still shut her out"};
const moves={write:"She starts writing",protect:"She protects writing time",challenge:"She challenges the rules"};
const mapNotes={
  gain:{
    income:"An income creates choices, but money alone cannot guarantee uninterrupted time or publication.",
    space:"A quiet room creates opportunity, but other material and social obstacles can remain.",
    access:"One publisher's attention may help, but a single opening cannot dismantle broader exclusion."
  },
  barrier:{
    income:"Bills and insecure income can make free hours difficult to sustain.",
    space:"Interruptions can take away the practical freedom a room or an income was meant to create.",
    access:"Gatekeepers may still restrict who has a chance to publish."
  },
  action:{
    write:"Beginning is possible, but effort is not proof that the obstacles have disappeared.",
    protect:"Making time reliable can matter as much as gaining it once.",
    challenge:"Changing the rules asks who controls opportunity, not merely who works hardest."
  }
};

function sourceCheck(packet){
 const errors=validateInsightPacket(packet);
 if(errors.length)throw new TypeError("Invalid source-linked Insight Packet: "+errors.join("; "));
 if(!packet.trace.sourceReferences.length)throw new TypeError("Source trace missing");
 if(packet.flags.productionEligible!==false||packet.flags.truthVerdict!==false)
   throw new TypeError("Research prototype cannot certify publication or truth");
}
const observation=(packet)=>({
 text:packet.observation.text,
 evidence:packet.trace.rules.slice(),
 source:"user_choices_in_a_hypothetical_scenario",
 inferredFeeling:false
});
const clampCopy=(text,cap,label)=>{
 if(typeof text!=="string"||!text.trim()||text.length>cap)
  throw new TypeError(label+" must be nonempty and at most "+cap+" characters ("+String(text?.length)+")");
 return text;
};
const mapText=(key,value)=>key[value];

function senecaStages(packet){
 const allocation=packet.observation.allocation;
 const motivation=packet.observation.motivation;
 const work=allocation[0],friend=allocation[1],thought=allocation[2];
 if(!Array.isArray(allocation)||allocation.length!==3||allocation.some(x=>typeof x!=="number"||x<0)||
    allocation.reduce((a,b)=>a+b,0)!==3||!["chosen","expected","necessary"].includes(motivation))
   throw new TypeError("Observed Seneca allocation is invalid");
 const workDominates=work>=1.5 && work>friend && work>thought;
 const noWork=work===0;
 let kind,headline,discovery,question,curiosity,unease,basis;
 if(motivation==="necessary"&&workDominates){
   kind="optional_necessary_tension";
   headline="When did optional become necessary?";
   discovery="You gave "+hours(work)+" to an optional request, but called your choice necessary. Maybe it was. What made it feel non-negotiable?";
   question="What would actually happen if you said no to that request?";
   curiosity="Is the necessity about consequences, commitments, or someone's expectations?";
   unease="Which part of calling this work 'necessary' still doesn't fit?";
   basis="The scenario calls the work optional; you spent "+hours(work)+" on it and chose 'necessary'.";
 } else if(motivation==="expected"&&work>0){
   kind="outside_expectation";
   headline="Who was this evening really for?";
   discovery="You gave "+hours(work)+" to optional work and said an expectation influenced you. That pressure may be reasonable—but whose priority was it?";
   question="Would you have given work the same time if nobody had asked?";
   curiosity="Whose expectation mattered most, and why?";
   unease="Which part of that expectation is hardest to refuse?";
   basis="You assigned "+hours(work)+" to optional work and identified another person's expectation.";
 } else if(motivation==="necessary"){
   kind="felt_necessity";
   headline="What made this choice non-negotiable?";
   discovery="You described your allocation as necessary. The hours show what you protected, not why it felt impossible to choose differently.";
   question="What might change if one part of this commitment were negotiable?";
   curiosity="Was the necessity practical, moral, or simply familiar?";
   unease="Which part of this decision still feels unsettled?";
   basis="You selected 'necessary' for a three-hour allocation; there is no evidence the work request controlled it.";
 } else if(motivation==="expected"){
   kind="priority_under_expectation";
   headline="Whose expectations shaped your choice?";
   discovery="You described the evening as influenced by others. That doesn't make your choices meaningless; it leaves the source of the pressure worth examining.";
   question="Which part would you still choose if those expectations disappeared?";
   curiosity="Can an expectation also express something you genuinely value?";
   unease="Which expectation feels least like your own?";
   basis="You selected the 'someone expected it' motivation, but did not allocate time to optional work.";
 } else if(workDominates){
   kind="chosen_work_cost";
   headline="What was work worth giving up?";
   discovery="You chose "+hours(work)+" of optional work freely. That may be meaningful. The hidden part of any choice is what you willingly set aside.";
   question="What made this work worth more of your evening than the alternatives?";
   curiosity="At what point would this freely chosen work stop feeling worth its cost?";
   unease="Which alternative was hardest to leave out?";
   basis="You gave most of the three hours to work and explicitly said you wanted that.";
 } else if(friend===3){
   kind="chosen_relationship";
   headline="What was worth being there for?";
   discovery="You kept the entire evening for your friend. The other possibilities still had value—but not enough to displace this one tonight.";
   question="What about being with this person made the sacrifice worthwhile?";
   curiosity="Would you have made the same choice if this were your only free evening this week?";
   unease="What did setting aside work and solitude cost you?";
   basis="You allocated all three hours to a friend and described the allocation as your choice.";
 } else if(thought===3){
   kind="chosen_reflection";
   headline="What are you making room to hear?";
   discovery="You protected the entire evening for reflection. You chose absence of other demands, though that time could mean many different things.";
   question="What was worth hearing in the quiet that the other plans might have drowned out?";
   curiosity="When does quiet reflection help you live differently, rather than simply delay action?";
   unease="Is there something you're hoping reflection will resolve?";
   basis="You allocated all three hours to quiet reflection and said you wanted that.";
 } else{
   kind="chosen_balance";
   headline="What were you unwilling to leave out?";
   discovery="You made room for more than one purpose. Sharing time can honor competing values, but it doesn't erase the cost of each half-hour.";
   question="Which part of this evening would you defend if one hour had to disappear?";
   curiosity="Does dividing time protect your values—or keep you from choosing among them?";
   unease="Which part of the split felt least like a free choice?";
   basis="You shared the available three hours across activities and called the choice your own.";
 }
 return {
   tension:{kind,statement:discovery,evidence:[basis],counterfactual:question,
     philosophicalRelation:packet.insight.conceptualRelation,
     limit:"A scenario allocation does not establish real obligations, emotions, moral worth or the meaning of an entire life."},
   relevance:{category:motivation==="chosen"?"self_directed":
       motivation==="expected"?"reported_expectation":"claimed_necessity",
     basis,emotionalState:"not_inferred",canCloseWithoutFurtherProbe:true},
   draft:{headline,discovery,connection:
     "Seneca asks whether time is deliberately lived, not whether work or rest is always better."},
   questionCandidates:{primary:headline,deeper:question,curious:curiosity,unsettled:unease},
   visualization:packet.visual
 };
}
function woolfStages(packet){
 const {resource,barrier,action}=packet.observation;
 if(!Object.hasOwn(works,resource)||!Object.hasOwn(obstacles,barrier)||!Object.hasOwn(moves,action))
   throw new TypeError("Observed Woolf selections are invalid");
 const same=resource===barrier;
 const gain=works[resource],block=obstacles[barrier],act=moves[action];
 const basis="You changed '"+gain+"' but left '"+block+"' in the scenario, then chose '"+act+"'.";
 const kind=same?"fragile_improvement":barrier==="access"?"structural_gatekeeping":"separate_constraint";
 let headline,discovery,question;
 if(same){
   headline="What if the improvement doesn't last?";
   discovery="The condition improved, yet you marked it as a remaining obstacle. An opening isn't necessarily a lasting opportunity.";
   question="What would make this improvement reliable instead of temporary?";
 }else if(resource==="income"&&barrier==="space"){
   headline="Can money buy the time to create?";
   discovery="She has her own income, but people still interrupt her. More resources may widen her choices without protecting a single quiet hour.";
   question="What would her money actually change if she still can't work uninterrupted?";
 }else if(resource==="space"&&barrier==="income"){
   headline="Is a room enough if she can't afford the time?";
   discovery="She finally has a room, yet bills still demand her attention. Space makes writing possible only if she can use it.";
   question="How much freedom does a room give someone who still has to work to survive?";
 }else if(barrier==="access"){
   headline="Who still gets to decide if she's heard?";
   discovery="One opportunity improved, but editors still control access. Her persistence alone cannot guarantee a fair hearing.";
   question="When does a private struggle become a problem with the rules?";
 }else if(barrier==="income"){
   headline="What can she do with time she can't afford?";
   discovery="Something important changed, yet financial insecurity remains. A possibility is not the same as the means to pursue it.";
   question="Who can exercise a freedom that costs more than they have?";
 }else{
   headline="Who gets to interrupt her freedom?";
   discovery="A door has opened for her, but uninterrupted space remains fragile. The obstacle is not simply a lack of determination.";
   question="What conditions would have to change before writing becomes a real option?";
 }
 const curiosity=action==="challenge"?
   "Who can change the gatekeeping conditions rather than asking her to try harder?":
   action==="protect"?"What would make a small opportunity last beyond one lucky day?":
   "Does beginning to write remove the barrier—or show how much she must work around it?";
 const unease=barrier==="access"?
   "Why should someone else decide whether her work deserves a hearing?":
   "Which unresolved condition would most change the opportunities she actually has?";
 const map=[
   {id:"root",label:"She wants to write",kind:"start",
     note:"Her talent is not being tested. The question is what opportunities society makes available."},
   {id:"gain",label:gain,kind:"gain",note:mapNotes.gain[resource]},
   {id:"barrier",label:block,kind:"obstacle",note:mapNotes.barrier[barrier]},
   {id:"action",label:act,kind:"action",note:mapNotes.action[action]},
   {id:"possibility",label:"More room to try",kind:"possibility",
     note:"This pathway may enlarge the writer's options, but it is not a prediction."},
   {id:"uncertainty",label:"Other limits remain",kind:"uncertainty",
     note:"No set of these three choices establishes that a book will be written or published."}
 ];
 return {
   tension:{kind,statement:discovery,evidence:[basis],counterfactual:question,
     philosophicalRelation:packet.insight.conceptualRelation,
     limit:"This is a historically informed hypothetical case, not a prediction of a particular writer's talent, feelings or success."},
   relevance:{category:action==="challenge"?"institutional_question":
       action==="protect"?"stability_question":"individual_action_with_constraints",
     basis,emotionalState:"not_inferred",canCloseWithoutFurtherProbe:true,
     scenarioNotBiography:true},
   draft:{headline,discovery,connection:
     "Woolf links the freedom to write to material and social conditions—not just determination."},
   questionCandidates:{primary:headline,deeper:question,curious:curiosity,unsettled:unease},
   visualization:{type:"mindmap",nodes:map,
     edges:[["root","gain"],["root","barrier"],["gain","action"],["barrier","action"],["action","possibility"],["action","uncertainty"]],
     implication:"conditional_not_deterministic"}
 };
}
export function reasonToQuestion(packet,{reaction="unanswered"}={}){
 sourceCheck(packet);
 if(!REACTIONS.includes(reaction))throw new RangeError("Unsupported optional feedback category");
 const facts=observation(packet);
 const stages=packet.mechanism==="tradeoff"&&packet.quote.id===49?senecaStages(packet):
   packet.mechanism==="decision_map"&&packet.quote.id===28?woolfStages(packet):
   null;
 if(!stages)throw new TypeError("Mechanism / quote mismatch");
 const {tension,relevance,draft,questionCandidates,visualization}=stages;
 const acknowledged=reaction==="settled";
 const question=reaction==="curious"?questionCandidates.curious:
   reaction==="unsettled"?questionCandidates.unsettled:questionCandidates.primary;
 const result={
   version:QUESTION_REASONER_VERSION,
   quoteId:packet.quote.id,
   scenarioId:packet.scenarioId,
   observation:facts,
   philosophicalTension:tension,
   personalRelevance:{
     ...relevance,
     reactionSource:reaction==="unanswered"?"not_provided":"explicit_user_feedback",
     reaction:reaction,
     emotionalState:reaction==="unanswered"?"not_inferred":
       reaction==="settled"?"explicitly_comfortable":
       reaction==="curious"?"explicitly_curious":"explicitly_unresolved"
   },
   questionSelection:{
     decision:acknowledged?"close":"offer_question",
     question:acknowledged?null:question,
     candidates:questionCandidates,
     rationale:acknowledged?
       "User explicitly said the discovery feels settled; do not force another challenge.":
       "Follow-up is grounded in the reported choice, visible tension, and philosophical qualifier.",
     optional:true,
     mayFinishWithoutAnswer:true,
     selectionRule:tension.kind+":"+reaction
   },
   expressionDraft:{
     headline:clampCopy(draft.headline,115,"headline"),
     discovery:clampCopy(draft.discovery,240,"discovery"),
     sourceConnection:clampCopy(draft.connection,165,"connection"),
     positiveClosing:"You feel settled with this interpretation. It's fine to leave the question here."
   },
   visual:visualization,
   provenance:packet.trace.sourceReferences,
   flags:{editorialStatus:"draft",emotionalInference:false,philosophicalTruthVerdict:false,productionEligible:false}
 };
 if(result.questionSelection.question!==null)clampCopy(result.questionSelection.question,180,"question");
 return result;
}
