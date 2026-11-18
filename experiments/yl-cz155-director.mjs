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
    state.options = structuredClone(scenario.followUps[choice.id]);
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
