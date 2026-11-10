import {encounterDistinction,encounterWorldThread} from "./encounter-distinction-v13.js";
import {quotationEnding} from "./quotation-return-v12.js";
import {evaluateTradeoffCase, evaluateDecisionCase} from "./mechanism-transfer-engine-v02.js";

// A warrant relates two concepts under explicit premises. Everyday wording is
// attached to the warranted relation; the UI never chooses an interpretation.
function distinction(kind, concepts, premises, warrant, open, discovery, question = null) {
  return {kind, concepts, premises, warrant, open, discovery, question};
}

function eveningDistinction(facts) {
  const {hours:[writing,messages,rest], declaredInfluence, hypotheticalFiveEvenings} = facts;
  const premises = {writing,messages,rest,declaredInfluence, repeatedWritingHours:hypotheticalFiveEvenings[0]};
  if (rest > 1.5 && declaredInfluence === "planned") {
    return distinction("chosen-rest", ["a pause in one project","a positive place in a routine"], premises,
      "A declared plan gives most of the finite evening to rest. Repetition would give rest a regular place even if the story advances slowly.",
      "The reason for resting and any effect on later writing are unknown.",
      "You gave rest the largest place in a planned evening. Repeat that choice and rest becomes something your week makes room for in its own right. You need no claim about tomorrow’s writing to see what tonight provides.");
  }
  if (writing === 0) {
    if (declaredInfluence === "planned") return distinction("deliberate-pause",["a deferral","a recurring exclusion"],premises,
      "One planned deferral keeps a later session possible. Repeating the same allocation provides zero writing sessions.",
      "A different evening may already be set aside.",
      "You can leave the story for another evening on purpose. If every evening follows this plan, the promised later session never arrives.");
    if (declaredInfluence === "interrupted" && messages > 0) return distinction("requests-without-writing",["individual replies","a collective claim on time"],premises,
      "The participant reports disruption, gives time to replies and allocates none to writing. The aggregate can exclude writing without any single request doing so.",
      "The model cannot assign the lost writing time to a particular request.",
      "Each message could have been worth answering. Taken together with the rest of this evening, those choices leave the story waiting. Repeating them could settle its place in your week without a separate decision about the story.");
    return distinction("exception-repeated",["a reason for this evening","a place for a recurring commitment"],premises,
      "Explaining the allocation leaves open where writing can occur when no session is scheduled.",
      "We cannot identify a particular obstacle or judge the relative value of these activities.",
      "You can have a reason for every hour and still have no answer to when the story gets written. Repeating this evening would carry both things forward.");
  }
  if (declaredInfluence === "interrupted" && messages > 1.5 && writing > 0) {
    // Countermodels: reserve w ticks then fill the rest, or fill the other
    // activities first. Both obey the same budget and leave the observed w.
    const extraReply = 0.5;
    premises.counterfactual = {
      assumption:"Suppose an extra half-hour reply is accepted within the same three hours.",
      protectedWriting:rest >= extraReply ? {writing, messages:messages+extraReply, rest:rest-extraReply} : null,
      displacedWriting:{writing:writing-extraReply, messages:messages+extraReply, rest},
      protectionWhenRestUnavailable:"Keeping the full writing session would require deferring a reply.",
      observedOrdering:null
    };
    return distinction("protected-or-remainder",["having writing time","having a claim on writing time"],premises,
      "Both scheduling orders produce the observed writing time. Replies take a strict majority and demands reportedly changed the plan; the order matters if another request arrives.",
      "The allocation records duration only. It cannot establish which time was reserved or which request displaced anything.",
      "Even with replies taking most of the evening, you made time for the story. Those same minutes could be the first ones you protected or the last ones left over. One more message would put the difference to the test.",
      "If one more reply took half an hour, which part of the evening would give way?");
  }
  if (writing === 3) return distinction("exclusive-evening",["protecting one session","repeating an entire evening"],premises,
    "Writing occupies the whole budget. Replicating the whole allocation would require another occasion for rest and replies.",
    "Nothing establishes whether that other time is available.",
    "You made a whole evening available to the story. Making this evening repeatable would require a second arrangement: somewhere else for the rest and replies to go.");
  if (declaredInfluence === "planned" && writing > 1.5) return distinction("writing-sets-budget",["time given to a project","limits placed on competing uses"],premises,
    "A deliberate majority allocation leaves less than half for the other two uses combined. More time for either must come from the fixed budget.",
    "The model cannot show the order in which hours were booked.",
    "Your plan gives the story most of the evening. That choice also sets a limit on what you can offer everything else. Keeping the writing time would mean honoring that limit when another claim arrives.");
  if (declaredInfluence === "planned" && messages > 1.5 && messages > writing)
    return distinction("planned-replies-majority",["planning to protect time","what the planned distribution actually permits"],premises,
      "The participant reports an intention to protect time, but the planned evening allocates a majority to replies. The distribution establishes the uses, not which hour was reserved first.",
      "We do not know which replies were necessary or whether writing had a reserved minimum.",
      "You intended to protect your time, yet replies occupy most of this particular plan. A schedule can express an intention without showing which activity has priority when the plan meets another demand. Repeating it would give the replies the larger recurring share.",
      "Which part of this plan would stay unchanged if another request arrived?");
  if (declaredInfluence === "planned" && rest > 0) return distinction("room-for-both",["competing for an extra hour","being able to coexist"],premises,
    "An increase in one activity must displace another, yet the chosen schedule already admits both writing and rest.",
    "Neither the adequacy of the rest nor the quality of the writing is known.",
    "An extra half-hour has to come from somewhere. Yet in the plan you made, writing and rest already coexist. You only have to choose between them when you ask for more time than the evening holds.");
  if (declaredInfluence === "obligations" && messages > writing && messages >= rest)
    return distinction("obligations-visible-replies",["reasons for an evening","where its hours actually go"],premises,
      "The participant cites obligations and allocates more time to replies than to writing. This establishes a recurring distribution if repeated, not the moral worth or necessity of any reply.",
      "The selected motivation does not tell us which messages were duties.",
      "Other things needed doing, and in this evening replying takes more time than writing. That is a fact about how the hours are arranged, not a verdict on whether any reply was worth sending. If repeated, the arrangement would give answering people a regular place in your days.",
      "Which recurring demand would you most want to make room for on purpose?");
  if (declaredInfluence === "obligations" && rest > writing && rest >= messages)
    return distinction("obligations-visible-rest",["having demands to meet","making room for recovery"],premises,
      "The participant reports obligations, while rest receives a larger allocation than writing or messages. Both demands and recovery can feature in a planned recurring day.",
      "Nothing identifies the motive for resting, or whether the rest was sufficient.",
      "Even with other things to get done, your evening gives more time to rest than to the story or messages. Repeating such an evening would make recovery part of the pattern of days, not simply an absence of progress on the story.",
      "If this pattern returned tomorrow, what would it make room for?");
  if (declaredInfluence === "obligations" && writing >= messages && writing >= rest)
    return distinction("obligations-visible-writing",["having multiple claims on time","still making a place for the story"],premises,
      "With obligations reported, writing receives at least as much time as either alternative. Repeating the allocation would give writing a regular sitting, without showing whether it was protected first.",
      "We cannot tell whether the writing session was reserved or merely fit the other commitments.",
      "You reported other obligations, yet the story still receives one of the evening's largest shares. An individual sitting doesn't establish a habit, but returning to a similar arrangement could give writing a recurring place alongside those demands.",
      "What would make this particular arrangement possible again?");
  if (declaredInfluence === "interrupted" && messages === 0)
    return distinction("interrupted-without-replies",["demands arriving","demands receiving time"],premises,
      "The participant reports interruptions but allocates no time to replies. An interruption and a response are different events; the allocated time cannot identify how much attention the interruption consumed.",
      "The nature and duration of the interruptions remain unknown.",
      "You reported interruptions, but assigned no time to replying. A buzzing phone is one kind of demand; giving it part of your schedule is another. If this evening repeated, the pattern of how you responded—not merely the arrival of demands—would shape its place in your days.",
      "If the same interruption came tomorrow, what would you choose to repeat?");
  return distinction("recurring-foothold",["an amount of writing time","the terms on which it recurs"],premises,
    "Positive writing time accumulates under repetition; neither duration nor the broad influence identifies what would preserve it.",
    "We cannot infer a protected minimum, an ordering, or progress on the story.",
    "You found time for the story tonight. A week of such evenings would give you several sittings; tonight alone leaves open what would make the next one happen.");
}

function readEvening(result) {
  const f=result.fields;
  const evidence={hours:f.hours,declaredInfluence:f.influence,hypotheticalFiveEvenings:f.conditionalFiveWeekdays};
  const relation=eveningDistinction(evidence);
  return {rule:relation.kind, relation, evidence, observation:f.observation+" · "+f.influenceLabel,
    consequence:"Five evenings exactly like this would give the story "+f.conditionalFiveWeekdays[0]+" hours.",
    connection:"Dillard asks what a schedule makes possible when one day follows another.",
    limits:["The evening and its repetition are hypothetical.","A duration supplies no measure of an activity’s worth."]};
}

// An event supplies evidence only about the lived branch. Each response uses
// that evidence differently: inquiry about the past, adaptation, or waiting.
function routeDistinction(facts) {
  const {eventKind,responseKind} = facts;
  const premises={choice:facts.choice, knownThen:facts.atChoice, learnedLater:facts.imaginedLater, next:facts.subsequentResponse};
  if (eventKind === "unobserved-alternative") {
    if (responseKind === "reflect") return distinction("reasons-and-alternatives",["recoverable reasons","unobserved outcomes"],premises,
      "Reflection can revisit a reason held at the deadline; it supplies no observations from the city the participant never moved to.",
      "How the other job would have turned out is unknowable here.",
      "You can go back over why you stayed. Even a perfect account of those reasons leaves a gap: you still have only one career to look back on.");
    return distinction("commitment-without-comparison",["settling what to do","settling which future was better"],premises,
      "Renewing attention to the chosen job is possible while the comparative question remains unresolved.",
      "Continuing reveals no ranking of the two jobs.",
      "You can give the job you kept your full attention while the offer still interests you. Committing to the next day of work requires a choice you can make; proving which job was better would require a life you never lived.");
  }
  if (responseKind === "adapt" || responseKind === "revisit") {
    if (eventKind === "experienced-distance") return distinction("new-reason-for-action",["evidence for a next step","evidence of an earlier error"],premises,
      "The concrete experience of distance first enters after moving; the new plan acts on it. Its later availability cannot establish a neglected fact at the deadline.",
      "Distance could be anticipated. Its felt significance and the merits of staying were unavailable for comparison.",
      "Missing your friends gives you a reason to change how you keep in touch. That reason became clear through moving. You can take it seriously now while leaving open whether moving was a mistake.",
      "What do you owe those friendships now that distance has become part of them?");
    if (eventKind === "changed-setting") return distinction("continuity-of-place",["keeping a job","keeping its conditions"],premises,
      "A team change on the stay branch separates the chosen job from conditions beyond the initial choice. Adaptation acts on the changed setting.",
      "We cannot infer that stability motivated staying.",
      "The team change uncovers a limit to what staying could secure. You could choose the familiar job; you could never choose on your colleagues’ behalf that it would stay familiar. Your new plan starts from that boundary.");
    return distinction("terms-open-to-revision",["accepting an offer","accepting every later cost"],premises,
      "The unexpected cost enters after acceptance. Asking to adjust the hours makes the current terms a new practical decision.",
      "Whether the employer agrees is unknown.",
      "Accepting the offer settled where you would work. Discovering its cost in evenings gives you grounds to reopen the hours. Asking for different terms can make sense even if accepting made sense then.");
  }
  if (eventKind === "changed-setting") return distinction("successive-decisions",["the original stay","staying again after change"],premises,
    "Choosing to continue after the team changes adds a second commitment made with different evidence.",
    "The later outcome cannot be attributed solely to either decision.",
    "You stayed twice: once for the job as you knew it, then again after the team changed. A future account that begins and ends with ‘I chose to stay’ would hide the second choice.");
  if (eventKind === "experienced-distance") return distinction("feeling-and-forecast",["a present cost","a prediction about the life ahead"],premises,
    "The participant selects a current loss and gives the move time. No later trajectory has been observed.",
    "Nothing establishes that the feeling will ease or persist.",
    "Missing your friends tells you something real about the move already. Giving it time leaves a different question open: how much this feeling tells you about the life you are still making there.");
  return distinction("cost-of-learning",["waiting for evidence","living through its cost"],premises,
    "Learning whether hard hours become manageable requires additional time under the very conditions being evaluated.",
    "Waiting promises neither improvement nor certainty.",
    "To find out whether these hours become bearable, you have to spend more evenings working them. Waiting for a clearer view is itself a choice with a cost.");
}

function readRoute(result) {
  const [choice,event,response]=result.selected;
  const eventTypes={change:{risk:"workload",surprise:"experienced-distance"},stay:{missed:"unobserved-alternative",surprise:"changed-setting"}};
  const evidence={atChoice:["A familiar job","An offer requiring relocation","A decision this week"],choice:choice.label,
    imaginedLater:event.label,eventKind:eventTypes[choice.id][event.id],subsequentResponse:response.label,responseKind:response.id,
    originalVerdict:null,unchosenOutcome:null};
  // At the third fork the later event is already known, but the result of
  // responding has not been experienced on any reachable route.
  evidence.atNextChoice={observed:event.label,response:response.label,outcome:null};
  const relation=routeDistinction(evidence);
  evidence.retrospectiveInterpretation=relation.warrant;
  return {rule:[choice.id,event.id,response.id].join("/"),relation,evidence,observation:result.observation,
    consequence:event.label+". "+response.label+".",
    connection:"Kierkegaard’s journal leaves you looking back from inside a life that keeps moving.",
    limits:["The event is imagined.","Later evidence cannot settle the original decision or reveal the other future."]};
}

export function encounterConsequence(id, input, memory=null) {
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
  // Establish the quotation's source relation before interpreting this path.
  const centralPhilosophicalRelation=result.sourceRelation;
  const reading = id === "dillard" ? readEvening(result) : readRoute(result);
  const {relation,...fields}=reading;
  const {discovery,question,...reasoning}=relation;
  const hiddenRelationship={...reasoning,sourceInterpretation:result.sourceRelation,sourceReferences:result.sourceReferences};
  const ending=quotationEnding(result,reasoning.kind);
  const optionalWorldConnection=encounterWorldThread(memory,id);
  const visualDistinction=encounterDistinction(result,reasoning);
  let proactiveQuestion=ending.question;
  if(optionalWorldConnection && reasoning.kind==="feeling-and-forecast"){
    proactiveQuestion="Which uncertainty about staying longer could reflection settle, and which would take another lived evening?";
  }
  if(optionalWorldConnection && reasoning.kind==="protected-or-remainder"){
    proactiveQuestion="If this evening repeated, what would keep the next request from deciding when writing happens?";
  }
  return {status:"ready", schema:"encounter-consequence/1.3", caseId:id, quote:result.quote,
    input:result.input, mechanism:result.mechanism, ...fields, hiddenRelationship, discovery, question, tension:reasoning.concepts.join(" / "),
    centralPhilosophicalRelation, observedPath:result.input, scenarioConsequence:fields.consequence,
    sourceGroundedInterpretation:ending.interpretation, userFacingDiscovery:ending.headline,
    experience:ending.experience, optionalWorldConnection, visualDistinction,
    proactiveQuestion,
    trace:[...result.rules,reading.rule,reasoning.kind], sources:result.sourceReferences,
    editorialStatus:"provisional", fingerprintEvidence:null};
}

// Surface projection only. All interpretive text originates in a fired rule.
export function expressConsequence(packet) {
  if (packet?.status !== "ready") return null;
  const {discovery,consequence,connection,question} = packet;
  return {discovery,consequence,connection,question,headline:packet.userFacingDiscovery,
    experience:packet.experience,quote:packet.quote.text,interpretation:packet.sourceGroundedInterpretation,
    visual:packet.visualDistinction,world:packet.optionalWorldConnection,proactiveQuestion:packet.proactiveQuestion};

}
