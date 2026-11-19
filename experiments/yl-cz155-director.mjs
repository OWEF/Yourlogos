// The caller supplies a reviewed, version-pinned scenario from the server registry.
// This module is shared by the client projection and the authoritative server replay.
export const EVENT_SCHEMA = "encounter-events/1";

/** @typedef {{type:"choose", origin:"participant", revision:number, id:string,
 * preconditions:{phase:string,revision:number,after:string|null}, label:string, literal:string,
 * medium:string, recap:string, selfEffect:string, factsEstablished:string[],
 * commitment:string, possibleRationale:string, explicitMotive:string|null,
 * unchosenIds:string[], warrantIds:string[]}} ChoiceEvent */
/** @typedef {{type:"observe", origin:"independent_fiction", revision:number,
 * id:string, preconditions:{phase:string}, text:string, observed:string[],
 * unknowns:string[], warrantIds:string[]}} ObservationEvent */
/** @typedef {{schema:string, scenarioId:string, version:string, sourceFingerprint:string,
 * scenarioFingerprint:string, events:Array<ChoiceEvent|ObservationEvent>}} EncounterHistory */

function invalid(reason) {
  throw new TypeError("Encounter history: " + reason);
}

function exactKeys(object, keys) {
  return object !== null && typeof object === "object" && !Array.isArray(object) &&
    Object.keys(object).length === keys.length && keys.every(key => Object.hasOwn(object, key));
}

function sameValue(left, right) {
  if (left === right) return true;
  if (Array.isArray(left)) return Array.isArray(right) && left.length === right.length &&
    left.every((value, index) => sameValue(value, right[index]));
  if (left === null || typeof left !== "object" || Array.isArray(right)) return false;
  return exactKeys(right, Object.keys(left)) &&
    Object.keys(left).every(key => sameValue(left[key], right[key]));
}

// Follow-up availability is a function of independently OBSERVED world facts
// and already-chosen participant facts, never of the first choice's ID.
// `worldEvidence` ties each positive world predicate to a literal observation
// in the immutable external event. Missing or forged evidence must fail closed.
const owned = (obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
function isObject(x){return x!==null&&typeof x==="object"&&!Array.isArray(x);}
const uniqueKeys=xs=>Array.isArray(xs)&&new Set(xs).size===xs.length&&
 xs.every(x=>typeof x==="string"&&x.length>0);
function eligiblePredicate(predicate, facts, world){
 return predicate.requiresSelf.every(x=>facts[x]===true)&&
  predicate.forbidsSelf.every(x=>facts[x]!==true)&&
  predicate.requiresWorld.every(x=>world.includes(x))&&
  predicate.forbidsWorld.every(x=>!world.includes(x));
}
export function validateFollowUpAuthoring(scenario){
 if(!scenario?.followUpActions)return scenario?.followUps!==undefined;
 const allowed=["requiresSelf","forbidsSelf","requiresWorld","forbidsWorld"];
 const world=scenario.worldEvidence;
 if(!isObject(world)||!Object.keys(world).length||
  !Object.values(world).every(x=>typeof x==="string"&&
   scenario.externalEvent?.observed?.includes(x)))return false;
 const actions=scenario.followUpActions;
 if(!Array.isArray(actions)||actions.length<2||actions.length>12||
  new Set(actions.map(x=>x?.id)).size!==actions.length)return false;
 const check=x=>isObject(x)&&allowed.every(k=>uniqueKeys(x[k]))&&
  x.requiresSelf.every(k=>scenario.selfFacts.includes(k))&&
  x.forbidsSelf.every(k=>scenario.selfFacts.includes(k))&&
  x.requiresWorld.every(k=>owned(world,k))&&
  x.forbidsWorld.every(k=>owned(world,k))&&
  !x.requiresSelf.some(k=>x.forbidsSelf.includes(k))&&
  !x.requiresWorld.some(k=>x.forbidsWorld.includes(k));
 const validText=["label","literal","recap","commitment","possibleRationale","effect","medium"];
 return actions.every(a=>isObject(a)&&typeof a.id==="string"&&a.id.length>0&&
  validText.every(k=>typeof a[k]==="string"&&a[k].length>0)&&
  uniqueKeys(a.establishes)&&a.establishes.every(k=>scenario.selfFacts.includes(k))&&
  uniqueKeys(a.warrantIds)&&a.warrantIds.every(k=>owned(scenario.source.warrants,k))&&
  check(a.eligibility)&&Array.isArray(a.contexts)&&a.contexts.length<=6&&
  a.contexts.every(c=>isObject(c)&&check(c.when)&&isObject(c.wording)&&
   Object.keys(c.wording).length>0&&Object.keys(c.wording).every(k=>
    validText.includes(k)||["establishes","warrantIds"].includes(k))&&
   Object.entries(c.wording).every(([k,v])=>
    k==="establishes"?uniqueKeys(v)&&v.every(t=>scenario.selfFacts.includes(t)):
    k==="warrantIds"?uniqueKeys(v)&&v.every(t=>owned(scenario.source.warrants,t)):
    typeof v==="string"&&v.length>0)));
}
function observedWorld(scenario,observation){
 return Object.keys(scenario.worldEvidence??{}).filter(k=>
  observation?.observed?.includes(scenario.worldEvidence[k]));
}
export function eligibleFollowUps(scenario,state){
 if(state.phase!=="reconsider")return [];
 if(!scenario.followUpActions)return structuredClone(scenario.followUps[state.firstAction.id]);
 if(!validateFollowUpAuthoring(scenario))invalid("invalid or ungrounded follow-up preconditions");
 return scenario.followUpActions.filter(a=>eligiblePredicate(a.eligibility,state.facts,state.worldFacts))
  .map(a=>{
   const contexts=a.contexts.filter(c=>eligiblePredicate(c.when,state.facts,state.worldFacts));
   if(contexts.length>1)invalid("ambiguous context-specific action wording");
   const {eligibility,contexts:variants,...base}=a;
   return structuredClone({...base,...(contexts[0]?.wording??{})});
  });
}

/** A fresh derived view; events are the only resumable state. */
export function startEncounter(scenario) {
  if (!scenario?.id || !scenario.version || !scenario.sourceFingerprint || !scenario.scenarioFingerprint)
    invalid("missing scenario version or source identity");
  return {
    history: {
      schema: EVENT_SCHEMA, scenarioId: scenario.id, version: scenario.version,
      sourceFingerprint: scenario.sourceFingerprint, scenarioFingerprint: scenario.scenarioFingerprint,
      events: []
    },
    revision: 0, phase: "opening", opening: scenario.opening,
    options: structuredClone(scenario.openingChoices), firstAction: null, secondAction: null,
    observation: null, reconsiderationQuestion: scenario.reconsiderationQuestion,
    effects: [], facts: Object.fromEntries(scenario.selfFacts.map(key => [key, false])),
    worldFacts: [],
    canonicalInput: null
  };
}

// Only a choice ID can select a self-authored action. Event facts and effects
// come from distinct records. A participant command has no event/effect fields.
function advance(scenario, state, choiceId) {
  const choice = state.options.find(option => option.id === choiceId);
  if (!choice) invalid("choice unavailable at this beat");
  const event = {
    type: "choose", origin: "participant", revision: state.revision + 1, id: choice.id,
    preconditions: {
      phase: state.phase, revision: state.revision, after: state.firstAction?.id ?? null
    },
    label: choice.label, literal: choice.literal, medium: choice.medium, recap: choice.recap,
    selfEffect: choice.effect, factsEstablished: [...choice.establishes],
    commitment: choice.commitment, possibleRationale: choice.possibleRationale,
    explicitMotive: choice.explicitMotive, warrantIds: [...choice.warrantIds],
    unchosenIds: state.options.filter(option => option.id !== choice.id).map(option => option.id)
  };
  for (const fact of choice.establishes) {
    if (!scenario.selfFacts.includes(fact)) invalid("effect outside participant authority");
    state.facts[fact] = true;
  }
  state.effects.push(choice.effect);
  state.history.events.push(event);
  if (state.phase === "opening") {
    state.firstAction = choice;
    const authored = scenario.externalEvent;
    state.observation = {
      id: authored.id, text: authored.text, observed: [...authored.observed],
      unknowns: [...authored.unknowns], warrantIds: [...authored.warrantIds]
    };
    state.history.events.push({
      type: "observe", origin: "independent_fiction", revision: 2,
      preconditions: {phase: "after_opening"}, ...structuredClone(state.observation)
    });
    state.phase = "reconsider";
    state.worldFacts = observedWorld(scenario,state.observation);
    // Source-authored question reflects the chosen action without attributing a motive.
    // Scenarios without this optional map preserve their established question contract.
    state.reconsiderationQuestion = scenario.reconsiderationQuestions?.[choice.id] ?? scenario.reconsiderationQuestion;
    state.options = eligibleFollowUps(scenario,state);
  } else {
    state.secondAction = choice;
    state.canonicalInput = {path: [state.firstAction.id, state.observation.id, choice.id]};
    state.phase = "complete";
    state.options = [];
  }
  state.revision = state.history.events.length;
  return state;
}

/** Purely derive the stage from zero, one, or two source-bound participant choices. */
export function derivePath(scenario, actionIds) {
  if (!Array.isArray(actionIds) || actionIds.length > 2) invalid("invalid action sequence");
  const state = startEncounter(scenario);
  for (const id of actionIds) advance(scenario, state, id);
  return state;
}

/** Validate the complete stored ledger against the current server-owned fiction.
 * The independent development and first action form one atomic transition.
 * @param {object} scenario @param {EncounterHistory} history */
export function replayEncounter(scenario, history) {
  const identity = startEncounter(scenario).history;
  if (!exactKeys(history, Object.keys(identity)) ||
      Object.keys(identity).some(key => key !== "events" && history[key] !== identity[key]))
    invalid("stale or incompatible source, scenario or schema");
  if (!Array.isArray(history.events) || ![0, 2, 3].includes(history.events.length))
    invalid("incomplete or oversized event sequence");
  const ids = history.events.filter(event => event?.type === "choose").map(event => event.id);
  const state = derivePath(scenario, ids);
  if (!sameValue(state.history.events, history.events)) invalid("events do not replay");
  return state;
}

/** An exact retry returns the current view without logging a second action.
 * A different choice at an already consumed revision is a stale input. */
export function chooseAction(scenario, history, command) {
  if (!exactKeys(command, ["choiceId", "expectedRevision"]) ||
      typeof command.choiceId !== "string" || !Number.isSafeInteger(command.expectedRevision))
    invalid("expected one versioned choice");
  const state = replayEncounter(scenario, history);
  if (command.expectedRevision !== state.revision) {
    const previouslyApplied = state.history.events.some(event => event.type === "choose" &&
      event.id === command.choiceId && event.preconditions.revision === command.expectedRevision);
    if (previouslyApplied) return state;
    invalid("stale command");
  }
  return advance(scenario, state, command.choiceId);
}
