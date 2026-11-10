/**
 * CZ-115 Discovery Synthesis v0.1.
 *
 * Not a language model and not a universal quote interpreter. This first
 * research implementation transforms source-traceable Insight Packets and
 * OPTIONAL verified self-reports into a philosophical "because" discovery.
 *
 * Contract: observation -> tension -> inferred distinction -> conditional
 * personal relevance -> (optional) question -> expression.
 * "Discovery" must be more than a paraphrase of the user's selections.
 *
 * No storage, network, data collection, truth scoring, or psychological claims.
 */
import {validateInsightPacket} from "./insight-packet-v01.js";

export const DISCOVERY_SYNTHESIS_VERSION=1;

export const SENECA_DETAILS=Object.freeze({
 chosen:Object.freeze([
  {id:"intrinsic",title:"I genuinely wanted to do it",description:"The activity mattered to me in itself"},
  {id:"future",title:"It helps something I'm working toward",description:"I chose the longer-term benefit"},
  {id:"habit",title:"It was simply what I usually do",description:"I didn't actively compare the alternatives"}
 ]),
 expected:Object.freeze([
  {id:"disappoint",title:"I didn't want to disappoint someone",description:"Their reaction mattered to me"},
  {id:"consequences",title:"Saying no might have consequences",description:"It didn't feel entirely optional"},
  {id:"also_wanted",title:"I wanted it too",description:"Their expectation aligned with my own reasons"}
 ]),
 necessary:Object.freeze([
  {id:"deadline",title:"There was a real deadline",description:"The work had a time constraint"},
  {id:"consequences",title:"Refusing had a real cost",description:"The consequences made it hard to decline"},
  {id:"commitment",title:"I had made a promise",description:"Keeping my commitment mattered to me"}
 ])
});
const safeCodes={
 chosen:new Set(SENECA_DETAILS.chosen.map(x=>x.id)),
 expected:new Set(SENECA_DETAILS.expected.map(x=>x.id)),
 necessary:new Set(SENECA_DETAILS.necessary.map(x=>x.id))
};
const optionalWork={chosen:"You chose the work freely, but even a genuine preference displaces another possibility.",expected:"Outside expectations influenced your allocation. That alone does not show whether you agreed or felt pressured.",necessary:"The work request was optional, but you described allocating your evening as necessary. Those are two different senses of obligation."};

function insist(value,label,max=500){
 if(typeof value!=="string"||!value.trim()||value.length>max)throw new TypeError("Invalid "+label);
 return value;
}
function familyOf(packet){
 if(packet.mechanism==="tradeoff"&&packet.quote.id===49)return "seneca";
 if(packet.mechanism==="decision_map"&&packet.quote.id===28)return "woolf";
 throw new RangeError("No approved source-backed discovery adapter");
}
function relevanceFromFingerprint(packet,evidence){
 if(evidence==null)return null;
 if(typeof evidence!=="object"||Array.isArray(evidence)||!Array.isArray(evidence.events))
  throw new TypeError("Fingerprint evidence must be a verified event summary");
 const currentTheme=packet.quote.id===49?"Time":"Freedom";
 const related=evidence.events.filter(e=>e&&e.theme===currentTheme&&
   (e.source==="saved"||e.source==="encounter")&&
   (Number.isInteger(e.quoteId)||e.source==="encounter")&&
   e.quoteId!==packet.quote.id);
 // A prior saved quote and a prior encounter of the same quote may refer to
 // different observed activities; do not turn either into agreement.
 if(related.length<2)return null;
 return {
  status:"prior_exploration",
  theme:currentTheme,
  count:related.length,
  statement:"You've explored "+currentTheme.toLowerCase()+" in "+related.length+
    " earlier saved thoughts or encounters. This is a connection in your questions, not a claim about what you believe.",
  basis:related.map(e=>({source:e.source,quoteId:e.quoteId??null,theme:e.theme})),
  certainty:"observed_activity_only"
 };
}
const hours=n=>n===1?"one hour":n===2?"two hours":n===3?"three hours":String(n)+" hours";
function synthesizeSeneca(packet,detail){
 const values=packet.observation.allocation,motivation=packet.observation.motivation;
 if(!Array.isArray(values)||values.length!==3||!["chosen","expected","necessary"].includes(motivation))
  throw new TypeError("Missing Seneca observations");
 if(detail!==null && !safeCodes[motivation].has(detail))throw new TypeError("Detail is not a valid reason for selected motivation");
 const work=values[0],friend=values[1],quiet=values[2];
 let headline,tension,discovery,question;
 if(work===3){
  if(motivation==="necessary"){
   headline="When did optional become necessary?";
   tension="You gave all three free hours to an optional work request, yet described that evening as necessary.";
   discovery="The request was optional; your sense of necessity came from somewhere else. That difference matters because an external rule, a possible consequence, and a commitment you freely chose are not the same thing.";
   question="What made declining the work difficult in this particular situation?";
  } else if(motivation==="expected"){
   headline="Whose expectation became your evening?";
   tension="An optional work request took all three free hours while someone else's expectations influenced your choice.";
   discovery="An expectation can become a real demand on your time without being a formal requirement. The missing distinction is whether you endorsed that demand or felt unable to refuse it.";
   question="Would you still give it all three hours if nobody expected you to?";
  } else {
   headline="A free choice still has a price.";
   tension="You deliberately devoted your free evening to work and gave no time to your friend or quiet reflection.";
   discovery="Choosing work does not by itself mean surrendering your freedom. The trade-off is that a meaningful commitment and a forgone possibility can both be real at the same time.";
   question="What made the work worth those alternatives tonight?";
  }
 } else if(work===0){
  headline=motivation==="necessary"?"Where was the necessity?" : "What made the other possibilities worth protecting?";
  tension="You left optional work out and divided your free evening between "+(friend?"a friend":"no social time")+" and "+(quiet?"quiet reflection":"no quiet time")+".";
  discovery=motivation==="necessary"?
   "You described the overall evening as necessary, but did not give time to optional work. The perceived obligation may lie in something else; the allocation cannot tell us which commitment.":
   motivation==="expected"?
   "Other people's expectations shaped an evening without optional work. The source of that pressure is not visible in the time chart, so it would be wrong to assume it came from work.":
   "Leaving the optional request aside shows that choosing one commitment can mean actively declining another; it does not establish that this is always the better choice.";
  question=motivation==="necessary"?"Which of tonight's commitments felt non-negotiable, and why?":
   motivation==="expected"?"Whose expectation mattered to this decision?":
   "What mattered enough to make you leave optional work aside?";
 } else {
  headline="Choosing some work means choosing less of something else.";
  tension="You gave "+hours(work)+" to optional work and left "+hours(3-work)+" for other priorities.";
  discovery=motivation==="necessary"?
   "You described your whole evening as necessary, but the chart cannot tell which part felt unavoidable. A fixed amount of time does not mean every commitment carried the same kind of obligation.":
   motivation==="expected"?
   "An expectation influenced your choice, yet you reserved time for something beyond the optional work. The possibility worth examining is which demand you accepted and which boundary you kept.":
   "You made space for work and for something else. The philosophical issue isn't finding a perfect percentage; it's which commitments you were willing to let constrain one another.";
  question=motivation==="necessary"?"Which part of this split was a genuine requirement—and which part was your decision?":
   motivation==="expected"?"Which part of the split was yours to decide?":
   "Which trade-off would you gladly make again?";
 }
 const detailTexts={
  chosen:{
   intrinsic:["You said the activity mattered in itself, not just as an obligation.","You may have chosen the sacrifice because you valued the activity; that still leaves its opportunity cost visible.",null],
   future:["You described the choice as a step toward a longer-term aim.","The immediate cost and an intended future benefit belong to different time horizons; neither cancels the other.","How much of today would you choose to exchange for that future goal?"],
   habit:["You recognized that habit, rather than a fresh comparison, guided your decision.","A familiar choice can feel voluntary while escaping active examination. That is an invitation to notice the habit, not proof that it was wrong.","Would you make the same choice if this evening felt new?"]
  },
  expected:{
   disappoint:["You named the possibility of disappointing someone.","A person's disappointment can matter to you without automatically creating an obligation to give them all your time.","What would you owe them if you kept an hour for yourself?"],
   consequences:["You reported consequences for declining.","A request may be formally optional yet costly to refuse. That is why 'having a choice' and 'feeling free to choose' can diverge.","Which consequence is real, and which is only a possibility?"],
   also_wanted:["You said you also wanted to do it.","An outside expectation can coincide with a personal commitment; similarity of motives is not the same as coercion.",null]
  },
  necessary:{
   deadline:["You identified an actual deadline.","A deadline limits when a commitment can happen, but it does not alone settle who chose the commitment or whether it deserved the whole evening.","Was the deadline itself unavoidable, or the larger commitment behind it?"],
   consequences:["You identified a real cost of refusal.","An optional request can carry consequences that make the choice difficult in practice. This is a constraint to examine, not evidence that your decision was irrational.","Could you change the consequence, rather than simply accommodate it?"],
   commitment:["You said you had already made a promise.","Keeping a promise can be an expression of agency. The question isn't whether promises are bad; it's how freely the commitment was first made.","Was it a promise you would make again?"]
  }
 };
 const detailRow=detail?detailTexts[motivation][detail]:null;
 const observation="Optional work "+hours(work)+", a friend "+hours(friend)+", reflection "+hours(quiet)+". You selected '"+motivation+"' as the influence.";
 if(detailRow){
   // The explicit follow-up should deepen a supported distinction, never force
   // an emotion or claim to know what the user actually experiences.
   discovery=detailRow[1];
   question=detailRow[2];
   // Keep the original whole-evening context, even when the input is short.
 }
 const sourceConnection="Seneca examines how people's time is consumed by pursuits, obligations and unexamined demands. This example explores that tension, not an objectively correct schedule.";
 return {
  headline,observation,tension,discovery,
  selfReport:detailRow?detailRow[0]:null,
  question,sourceConnection,
  inferenceLimit:"A hypothetical evening and one stated reason cannot determine someone's personality, emotional state, or whether this work was objectively necessary.",
  support:["three-hour discretionary budget","chosen allocation","declared motive",...(detail?["optional stated reason:"+detail]:[])],
  sourceRule:packet.insight.ruleId
 };
}
function synthesizeWoolf(packet,detail){
 if(detail!==null)throw new TypeError("Decision Map already supplies enough branch evidence; do not add a generic feeling survey");
 const {resource,barrier,action}=packet.observation;
 const improve={income:"independent money",space:"a room to work",access:"more institutional access"};
 const remains={income:"financial insecurity",space:"unreliable quiet",access:"gatekeeping"};
 const contrasts={
  "income:space":["Money can create breathing room without creating uninterrupted time.","Financial freedom and actual privacy are different conditions of creative work."],
  "income:access":["Independent money does not make institutions willing to listen.","The ability to write and the power to have writing recognized are different kinds of opportunity."],
  "space:income":["A quiet room does not pay for the time needed to use it.","Having space and being able to sustain creative work are different conditions."],
  "space:access":["A room gives her somewhere to create, but cannot guarantee that anyone will hear her.","Creating privately and being heard publicly are not the same freedom."],
  "access:income":["A publisher's open door does not remove the cost of living.","Access to an audience and the ability to sustain the work are separate conditions."],
  "access:space":["Recognition does not automatically give her privacy in which to write.","Being invited in and being able to work are different conditions."]
 };
 const rule=contrasts[resource+":"+barrier];
 if(!rule)throw new TypeError("This pilot supports only distinct enabling conditions and barriers");
 const actionReadings={
  write:["She chose to begin under imperfect conditions.","Starting can be a real exercise of agency without proving that those conditions are fair or sustainable.","What could help her continue after the first page?"],
  protect:["She chose to protect what little opportunity exists.","An opportunity is not secure merely because it appears once. Protecting it can matter as much as obtaining it.","What would make that protection durable?"],
  challenge:["She chose to change the constraint rather than merely adapt.","Some obstacles lie in rules and institutions, not a writer's motivation. Changing those conditions is a different task from making do.","Who has the power to change the barrier she still faces?"]
 };
 const actionRow=actionReadings[action];if(!actionRow)throw new TypeError("Unsupported action");
 return {
  headline:action==="challenge"?"An open door can still lead to another locked one.":
    action==="protect"?"Getting an opportunity isn't the same as keeping it.":"Beginning isn't the same as being free to continue.",
  observation:"She gained "+improve[resource]+", still faced "+remains[barrier]+", and chose to "+actionRow[0].replace(/^She chose to /,"").replace(/\.$/,"")+".",
  tension:rule[0],
  discovery:rule[1]+" "+actionRow[1],
  selfReport:null,
  question:actionRow[2],
  sourceConnection:"Woolf examines how money, privacy, and social institutions shape women's opportunities to write. None of these decisions proves talent, publication, or a certain future.",
  inferenceLimit:"A fictional branch illustrates enabling conditions, not a historical prediction or a claim about the user's life.",
  support:["chosen improved condition:"+resource,"chosen remaining barrier:"+barrier,"chosen response:"+action],
  sourceRule:packet.insight.ruleId
 };
}
export function synthesizeDiscovery(packet,{reasonDetail=null,fingerprintEvidence=null}={}){
 const errors=validateInsightPacket(packet);
 if(errors.length)throw new TypeError("Unverified Insight Packet: "+errors.join("; "));
 const kind=familyOf(packet);
 const core=kind==="seneca"?synthesizeSeneca(packet,reasonDetail):synthesizeWoolf(packet,reasonDetail);
 const thread=relevanceFromFingerprint(packet,fingerprintEvidence);
 for(const k of ["headline","observation","tension","discovery","sourceConnection","inferenceLimit"])
  insist(core[k],k,650);
 if(core.question!==null)insist(core.question,"question",200);
 return {
  version:DISCOVERY_SYNTHESIS_VERSION,
  mechanism:packet.mechanism,
  quote:{...packet.quote},
  stages:{
   observation:core.observation,
   philosophicalTension:core.tension,
   personalRelevance:core.selfReport,
   discovery:core.discovery,
   questionSelection:{question:core.question,optional:true,reason:"grounded in selected branch and explicit input"},
   expression:{headline:core.headline,connection:core.sourceConnection}
  },
  visual:packet.visual,
  fingerprint:thread,
  qa:{
   supportingFacts:core.support,
   sourceRule:core.sourceRule,
   ruleTrace:packet.trace.rules,
   sourceReferences:packet.trace.sourceReferences,
   inferenceLimit:core.inferenceLimit,
   contextStatus:"provisional editorial interpretation",
   noTruthVerdict:true
  }
 };
}
