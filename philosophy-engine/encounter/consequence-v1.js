import {evaluateTradeoffCase, evaluateDecisionCase} from "./mechanism-transfer-engine-v02.js";

// In each row the condition is evaluated against the validated mechanism result.
// The projection is always conditional on repeating the entire evening.
function readEvening(result) {
  const [writing, messages, rest] = result.fields.hours;
  const motive = result.fields.influence;
  const projected = result.fields.conditionalFiveWeekdays;
  let rule, discovery, question;
  if (writing === 0 && messages > 0 && motive === "interrupted") {
    rule = "requests-without-writing";
    discovery = "A message can decide when the story gets written without anyone ever deciding to put the story off.";
    question = "If evenings like this kept coming, when would the story get a turn?";
  } else if (writing === 0 && motive === "planned") {
    rule = "deliberate-pause";
    discovery = "You can deliberately leave the story for another evening. Repeat this exact plan, though, and that other evening never arrives.";
    question = "What would make tonight a pause in the story?";
  } else if (writing === 0) {
    rule = "exception-repeated";
    discovery = "An evening can be fully accounted for and still leave a promise to yourself without a time of its own.";
    question = "Where in a week of evenings like this could the story begin again?";
  } else if (writing === 3) {
    rule = "exclusive-evening";
    discovery = "One evening given wholly to the story is possible. Making that evening your routine would also mean finding another time for rest and replies.";
    question = "Which part of tonight could you repeat tomorrow?";
  } else if (motive === "interrupted") {
    rule = "partial-shelter";
    discovery = "Demands changed your plan, yet the story still got some time. An interrupted evening can still be part of a writing practice.";
    question = "What would have to survive the next interruption for this to become a routine?";
  } else if (rest > 0 && writing > 0 && motive === "planned") {
    rule = "room-for-both";
    discovery = "In the routine you designed, resting does not require abandoning the story. Both already have a place before the evening begins.";
    question = "Which part of this plan would be easiest to lose if you left it unscheduled?";
  } else {
    rule = "recurring-foothold";
    discovery = "The story can acquire a place in your week one ordinary sitting at a time, even when the evening also belongs to something else.";
    question = "Would you choose this evening again as a way of making time for the story?";
  }
  return {rule, observation:result.fields.observation + " · " + result.fields.influenceLabel,
    tension:"Tonight’s intention and the pattern made by repeating tonight.",
    evidence:{hours:result.fields.hours, declaredInfluence:motive, hypotheticalFiveEvenings:projected},
    consequence:"Five evenings exactly like this would set aside " + projected[0] + " hours for the story.",
    discovery, question, connection:"Dillard looks at what a schedule makes room for over many days. This evening becomes a pattern only if you repeat it.",
    limits:["An imagined evening supplies no evidence of a habit.", "Hours allocated do not establish pages written, duties fulfilled, or the value of an activity."]};
}

// The same barrier ID can describe different events after moving and staying.
const temporalReadings = {
  change: {
    risk: {
      continue:["Giving the hours another week makes waiting part of the decision. You can learn how the hours feel only by spending more evenings in them.","How long would you wait before treating this first impression as dependable?"],
      revisit:["Knowing the hours are hard gives you grounds to ask for a change today. The answer to that request was unavailable when you accepted.","Which question belongs to the employer now, and which belonged to you before the move?"]
    },
    surprise: {
      adapt:["Before moving, you could imagine missing friends. Only after moving did you have this particular distance to plan around.","Does making room for those friendships now change how you understand the move?"],
      continue:["You can miss your friends and still give the move time. The feeling tells you something about life here while leaving open how life here might change.","What would you need to experience before calling the move a mistake?"]
    }
  },
  stay: {
    missed: {
      reflect:["Looking back can recover your reasons for staying. Even a perfectly clear memory of them cannot tell you what the other job would have been like.","Could your reasons have been sound even if the offer still interests you?"],
      continue:["Putting your attention back into this job shapes what staying becomes. The life you might have led elsewhere remains outside the comparison.","What can you learn by staying that comparing imagined futures cannot settle?"]
    },
    surprise: {
      adapt:["You chose a familiar job, yet a team change now calls for a new plan. Staying put gave you continuity of place without guaranteeing continuity of work.","Which part of the familiar job did you think you were choosing?"],
      continue:["Giving the changed team time adds a second decision to the first. How things turn out will depend partly on what happens after you chose to stay.","When you look back later, which decision will you be judging?"]
    }
  }
};
function readRoute(result) {
  const [choice,event,response] = result.selected;
  const [discovery,question] = temporalReadings[choice.id][event.id][response.id];
  return {rule:[choice.id,event.id,response.id].join("/"), observation:result.observation,
    evidence:{atChoice:["A familiar job","An offer requiring relocation","A decision this week"], choice:choice.label,
      imaginedLater:event.label, subsequentResponse:response.label, unchosenOutcome:null},
    tension:"Reasons available when choosing and evidence available afterward.",
    consequence:event.label + ". " + response.label + ".",
    discovery,question,connection:"Kierkegaard’s journal asks how we can look back on a life we are still living. Your response to this imagined turn is already another step forward.",
    limits:["The second fork selects an imagined circumstance.", "The other future and the final worth of either decision remain unknown."]};
}

export function encounterConsequence(id, input) {
  if (!["dillard","kierkegaard"].includes(id)) return {status:"declined",reason:"No reviewed pilot rule for this case."};
  let result;
  try {
    if (id === "dillard" && Array.from(input?.ticks ?? []).some(tick => !Number.isInteger(tick)))
      throw new TypeError("Incomplete time allocation");
    result = id === "dillard" ? evaluateTradeoffCase(id,input) : evaluateDecisionCase(id,input);
  } catch (error) {
    if (!(error instanceof TypeError || error instanceof RangeError)) throw error;
    return {status:"declined",reason:error.message};
  }
  const reading = id === "dillard" ? readEvening(result) : readRoute(result);
  return {status:"ready", schema:"encounter-consequence/1", caseId:id, quote:result.quote,
    input:result.input, mechanism:result.mechanism, ...reading,
    trace:[...result.rules,reading.rule], sources:result.sourceReferences,
    editorialStatus:"provisional", fingerprintEvidence:null};
}

// Surface projection only. All interpretive text originates in a fired rule.
export function expressConsequence(packet) {
  if (packet?.status !== "ready") return null;
  const {discovery,consequence,connection,question} = packet;
  return {discovery,consequence,connection,question};
}
