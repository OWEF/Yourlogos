/**
 * CZ-112: source-grounded personal relevance and question selection.
 *
 * Observation → philosophical tension → personal relevance → optional
 * question selection → expression; never diagnose a user's emotions.
 * A strongly positive self-report should end affirmatively, rather than
 * forcing a new challenge just to increase engagement.
 *
 * "positive" | "mixed" | "uncertain" | "unstated" is a one-tap,
 * OPTIONAL response, not a required survey or affective inference.
 */
import {validateInsightPacket} from "./insight-packet-v01.js";

export const DISCOVERY_VERSION=2;
export const ALLOWED_STANCES=Object.freeze(["positive","mixed","uncertain","unstated"]);
const validText=(v,max)=>typeof v==="string"&&v.trim().length>0&&v.length<=max;

const prompts={
 seneca:{
  expected:{
   positive:{
    title:"You chose to meet an expectation.",
    tension:"Outside expectations and personal priorities can overlap without cancelling either.",
    question:null,
    connection:"Seneca's question concerns how deliberately life is directed, not whether every request should be refused.",
    distinction:"Your sense of satisfaction is stated, not inferred from the time chart."
   },
   mixed:{
    title:"Whose expectation became your priority?",
    tension:"A request described as optional received time you also wanted for other purposes.",
    question:"If nobody expected this of you, would you still choose those same hours?",
    connection:"Seneca's concern is not that work is bad, but that demands can consume time without deliberate examination."
   },
   uncertain:{
    title:"When did an option start feeling like a duty?",
    tension:"The work was optional, but the expectation mattered enough to shape your evening.",
    question:"What would actually change if you chose not to do it?",
    connection:"Seneca invites examination of who directs our time; we cannot know whether this particular demand was avoidable."
   },
   unstated:{
    title:"Who was your evening really for?",
    tension:"Optional work was influenced by someone else's expectations.",
    question:"Would you make the same choice if no one else expected it?",
    connection:"Seneca distinguishes deliberate living from time absorbed by demands, without proving that this demand was meaningless."
   }
  },
  necessary:{
   positive:{
    title:"Sometimes responsibility is a choice you stand behind.",
    tension:"Optional work and felt responsibility can coexist when the purpose matters to you.",
    question:null,
    connection:"Seneca's challenge isn't to abandon duties. It's to examine whether they serve the life you mean to live."
   },
   mixed:{
    title:"When did optional become necessary?",
    tension:"You gave free time to an optional request, yet called the work necessary.",
    question:"What made saying no difficult, even though the request was optional?",
    connection:"Seneca's concern with deliberate time turns this into a question about necessity, not a judgment against work."
   },
   uncertain:{
    title:"When did optional become necessary?",
    tension:"Something described as optional occupied time that you felt you had to give.",
    question:"Is this a responsibility you chose, or one you haven't questioned yet?",
    connection:"Seneca asks how time is spent; the engine cannot tell whether this duty was essential in your circumstances."
   },
   unstated:{
    title:"When did optional become necessary?",
    tension:"You described an optional request as necessary. That difference deserves examination.",
    question:"What would happen if you declined the request?",
    connection:"Seneca does not deny meaningful responsibility; the question is how a demand became non-negotiable for you."
   }
  },
  chosen:{
   positive:{
    title:"A choice you can stand behind.",
    tension:"Choosing one purpose meant letting other possibilities wait.",
    question:null,
    connection:"For Seneca, deliberate attention to time matters more than finding the mathematically perfect allocation."
   },
   mixed:{
    title:"What did your chosen priority cost?",
    tension:"You chose the work willingly, and other possibilities received less of the evening.",
    question:"Which part of what you gave up would you most want back?",
    connection:"Seneca's concern with time invites attention to a freely chosen sacrifice, not guilt about choosing work."
   },
   uncertain:{
    title:"Was the trade-off worth it to you?",
    tension:"An intentional choice can still leave a question about what was forgone.",
    question:"What would you need to know to decide whether this was time well spent?",
    connection:"Seneca frames the issue as the quality of a life lived, not a simple rule against work."
   },
   unstated:{
    title:"What made this worth your evening?",
    tension:"A freely chosen priority still displaced other possibilities.",
    question:"What matters enough about this work to make the trade-off worthwhile?",
    connection:"Seneca is asking about deliberate use of time, not imposing one ideal schedule."
   }
  }
 },
 woolf:{
  positive:{
   title:"One opening can be worth protecting.",
   tension:"An improved condition can expand opportunity without eliminating every obstacle.",
   question:null,
   connection:"Woolf attends to the real conditions of creative opportunity. A promising step needn't solve everything at once."
  },
  mixed:{
   title:"What still stands between her and the page?",
   tension:"An improvement exists alongside a remaining material or institutional obstacle.",
   question:"Which remaining condition would most change what she can actually do next?",
   connection:"Woolf's argument concerns the practical conditions of writing, not a guarantee that one resource creates success."
  },
  uncertain:{
   title:"Does an open door mean she can walk through it?",
   tension:"Improving one resource is not the same as having an enduring opportunity.",
   question:"What would need to change for this possibility to become reliable?",
   connection:"Woolf points to the unequal conditions behind creative opportunity; uncertainty about outcomes remains."
  },
  unstated:{
   title:"What's still missing from this opportunity?",
   tension:"A useful condition improved, but a separate barrier may still constrain what happens next.",
   question:"If she could change only one more condition, which would matter most?",
   connection:"Woolf's material argument is about enabling conditions, not assigning success or failure to the writer."
  }
 }
};

function contextualSeneca(packet,selected,stance){
 const hours=packet.observation.allocation?.[0];
 if(typeof hours!=="number")throw new TypeError("Missing optional-work allocation");
 // The motivation question was asked about the entire allocation, not just work.
 // A claim about optional work becoming obligatory requires exclusive focus.
 if(hours===3)return selected;
 if(packet.observation.motivation==="necessary")return {
   ...selected,
   title:stance==="positive"?"You made room for what felt important.":"Which commitment felt non-negotiable?",
   tension:"You described your overall evening as necessary, but the allocation alone doesn't tell us which commitment carried that necessity.",
   question:stance==="positive"?null:"Which part of tonight felt hardest to change, and why?",
   connection:"Seneca's question is whether time is deliberately directed. We cannot assume that optional work was what felt necessary."
 };
 if(packet.observation.motivation==="expected")return {
   ...selected,
   title:stance==="positive"?"You chose how to respond to others.":"Whose expectations shaped your evening?",
   tension:"You said expectations influenced your allocation, but your time chart doesn't show which particular commitment carried that pressure.",
   question:stance==="positive"?null:"Which part of the evening did you choose mainly because someone else expected it?",
   connection:"Seneca's concern with deliberate living can invite a question about expectations without proving any particular activity was imposed."
 };
 if(packet.observation.motivation==="chosen"&&hours===0)return {
   ...selected,
   title:stance==="positive"?"You made a choice you can stand behind.":"What made your chosen priorities worth it?",
   tension:"You freely protected time for commitments other than optional work, leaving that request aside for tonight.",
   question:stance==="positive"?null:"What made the priorities you kept worth saying no to the extra work?",
   connection:"For Seneca, the choice is about how time is directed, not whether refusing optional work is always the right thing."
 };
 return selected;
}
const woolfQuestions={
 income:{
   write:"If she starts writing, what might she have to sacrifice to afford the time?",
   protect:"How secure must her income be before she can reliably protect writing time?",
   challenge:"What could change the conditions that make writing so financially costly?"
 },
 space:{
   write:"What happens when her chance to write can be interrupted at any moment?",
   protect:"Who would need to respect her writing time for that protection to last?",
   challenge:"Who has the power to make uninterrupted space possible?"
 },
 access:{
   write:"How can she begin when other people still control whose work gets heard?",
   protect:"Can an opportunity last when gatekeepers can still close the door?",
   challenge:"Who decides whose writing deserves to be given a chance?"
 }
};
function contextualWoolfQuestion(packet,stance,defaultPrompt){
 if(stance==="positive")return null;
 const {resource,barrier,action}=packet.observation;
 if(!Object.hasOwn(woolfQuestions,barrier)||!Object.hasOwn(woolfQuestions[barrier],action))
   throw new TypeError("Incomplete material-condition path");
 if(resource===barrier)return "If this condition improved, why does it remain fragile—and what would make it last?";
 return woolfQuestions[barrier][action]||defaultPrompt;
}

export function selectDiscovery(packet,stance="unstated"){
 const errs=validateInsightPacket(packet);
 if(errs.length)throw new TypeError("Invalid Insight Packet: "+errs.join("; "));
 if(!ALLOWED_STANCES.includes(stance))throw new RangeError("Invalid optional user stance");
 const isSeneca=packet.mechanism==="tradeoff"&&packet.quote.id===49;
 const isWoolf=packet.mechanism==="decision_map"&&packet.quote.id===28;
 if(!isSeneca&&!isWoolf)throw new RangeError("Unsupported pilot pair");
 const base=isSeneca?prompts.seneca[packet.observation.motivation]?.[stance]:prompts.woolf[stance];
 if(!base)throw Error("No source-aware question selection for given evidence");
 const selected=isSeneca?contextualSeneca(packet,base,stance):base;
 const positive=stance==="positive";
 const question=positive?null:(isWoolf?
   contextualWoolfQuestion(packet,stance,selected.question):selected.question);
 const rationale=isSeneca?
  "The question responds to the user's declared motivation ('"+packet.observation.motivation+"'), which is evidence but not a diagnosis.":
  "The question addresses the user's material-condition path without presuming an author's fictional writer will succeed.";
 const relevance=positive?
  "The user explicitly reports feeling satisfied; there is no reason to force another challenge.":
  stance==="unstated"?
  "The user's emotional stance was not provided; ask only about the observable choice and its implications.":
  "The user explicitly reports "+(stance==="mixed"?"mixed feelings":"uncertainty")+"; a focused question can help clarify the tension.";
 const insight={
  version:DISCOVERY_VERSION,quoteId:packet.quote.id,mechanism:packet.mechanism,
  observation:packet.observation.text,
  tension:selected.tension,
  relevance:{category:stance,reason:relevance,source:"optional_user_input"},
  questionSelection:{
    prompt:question,
    action:question?"invite_optional_reflection":"complete_encounter",
    trigger:positive?"explicit_satisfaction":"conditional_reflection",
    reason:rationale
  },
  expression:{
    title:selected.title,summary:selected.tension,
    connection:selected.connection,question
  },
  visual:packet.visual,
  audit:{
    packetRule:packet.insight.ruleId,
    sourceTrace:packet.trace.sourceReferences,
    uncertainty:packet.insight.limit,
    note:"Provisional editorial interpretation, not psychological assessment or philosophical truth."
  }
 };
 if(!validText(insight.tension,260)||!validText(insight.expression.title,105)||
   !validText(insight.expression.connection,240)||!validText(insight.relevance.reason,250))
  throw new TypeError("Discovery exceeded v0.2 concise text budgets");
 if(question!==null&&!validText(question,190))throw new TypeError("Unsupported question copy");
 return insight;
}
