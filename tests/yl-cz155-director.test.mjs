import test from "node:test";
import assert from "node:assert/strict";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {fingerprintB25} from "../experiments/yl-b25-authored-scenarios.mjs";
import {EPICTETUS_SCENARIO as scenario} from "../experiments/yl-cz155-epictetus.mjs";
import {chooseAction, derivePath, replayEncounter, startEncounter} from "../experiments/yl-cz155-director.mjs";

test("dossier and all authored beats are pinned; inherited and development quotations have different identities", () => {
  const {scenarioFingerprint, ...record} = scenario;
  assert.equal(scenarioFingerprint, fingerprintB25(record));
  assert.equal(scenario.sourceFingerprint, fingerprintB25(scenario.source));
  assert.equal(scenario.source.quoteId, 47);
  assert.equal(scenario.source.text, B27_APP_QUOTES[47][0]);
  assert.equal(scenario.source.author, B27_APP_QUOTES[47][1]);
  assert.match(B27_APP_QUOTES[47][3], /George Long/);
  assert.notEqual(scenario.source.text, B27_APP_QUOTES[92][0]);
  assert.match(B27_APP_QUOTES[92][3], /Carter/);
  assert.equal(scenario.source.publicationAllowed, false);
});

test("all six paths preserve origin, scope, observed facts and path-specific commitments", () => {
  const initial = startEncounter(scenario);
  assert.equal(initial.history.schema, "encounter-events/1");
  assert.equal(initial.phase, "opening");
  assert.deepEqual(initial.history.events, []);
  assert.equal(initial.observation, null);
  const effects = new Set();
  const externalEvents = [];
  for (const first of initial.options) {
    const mid = chooseAction(scenario, initial.history, {choiceId: first.id, expectedRevision: 0});
    assert.equal(mid.phase, "reconsider");
    assert.equal(mid.options.length, 2);
    assert.equal(mid.revision, 2);
    const [sent, observation] = mid.history.events;
    assert.equal(sent.literal, first.literal);
    assert.equal(sent.possibleRationale, first.possibleRationale);
    assert.equal(sent.explicitMotive, first.explicitMotive);
    assert.notEqual(sent.possibleRationale, sent.explicitMotive);
    assert.equal(sent.unchosenIds.length, 2);
    assert.equal(sent.origin, "participant");
    assert.equal(observation.origin, "independent_fiction");
    assert.equal(observation.unknowns.length, 3);
    assert.equal(Object.hasOwn(observation, "causedBy"), false);
    externalEvents.push(observation);
    for (const second of mid.options) {
      const state = chooseAction(scenario, mid.history, {choiceId: second.id, expectedRevision: mid.revision});
      const completed = state.history.events[2];
      assert.equal(state.phase, "complete");
      assert.deepEqual(state.options, []);
      assert.equal(completed.origin, "participant");
      assert.deepEqual(completed.preconditions, {phase: "reconsider", revision: 2, after: first.id});
      assert.equal(completed.commitment, second.commitment);
      assert.deepEqual(completed.unchosenIds, mid.options.filter(option => option.id !== second.id).map(option => option.id));
      assert.deepEqual(state.canonicalInput, {path: [first.id, observation.id, second.id]});
      for (const event of state.history.events)
        assert.ok(event.warrantIds.every(id => Object.hasOwn(scenario.source.warrants, id)));
      const resumed = replayEncounter(scenario, JSON.parse(JSON.stringify(state.history)));
      assert.deepEqual(resumed, state);
      assert.deepEqual(derivePath(scenario, [first.id, second.id]), state);
      assert.equal(state.history.events.filter(event => event.origin === "independent_fiction").length, 1);
      effects.add(JSON.stringify(state.effects));
    }
  }
  assert.equal(effects.size, 6);
  for (const observation of externalEvents) assert.deepEqual(observation, externalEvents[0]);
  assert.deepEqual(initial.history.events, []);
});

test("request paths differ in actual acknowledgment under identical externally owned evidence", () => {
  const deferred = derivePath(scenario, ["request", "leave_request"]);
  const acknowledged = derivePath(scenario, ["request", "name_harm"]);
  assert.deepEqual(deferred.observation, acknowledged.observation);
  assert.equal(deferred.facts.acknowledged, false);
  assert.equal(deferred.facts.deferredAcknowledgment, true);
  assert.equal(acknowledged.facts.acknowledged, true);
  assert.equal(acknowledged.facts.deferredAcknowledgment, false);
  assert.equal(deferred.secondAction.medium, "commitment");
  assert.equal(acknowledged.secondAction.medium, "message");
});

test("idempotent retries preserve decisions and reject stale and incompatible inputs", () => {
  const first = {choiceId: "request", expectedRevision: 0};
  const second = {choiceId: "leave_request", expectedRevision: 2};
  const initial = startEncounter(scenario);
  const mid = chooseAction(scenario, initial.history, first);
  const final = chooseAction(scenario, mid.history, second);
  for (const state of [mid, final]) assert.deepEqual(chooseAction(scenario, state.history, first), state);
  assert.deepEqual(chooseAction(scenario, final.history, second), final);
  for (const [history, command] of [
    [mid.history, {choiceId: "acknowledge", expectedRevision: 0}],
    [initial.history, second],
    [mid.history, {choiceId: "correct", expectedRevision: 2}],
    [final.history, {choiceId: "name_harm", expectedRevision: 2}],
    [mid.history, {choiceId: "name_harm", expectedRevision: 1}],
    [initial.history, {...first, reply: "I forgive you"}],
    [initial.history, {...first, effects: ["friendReadMessage"]}],
    [initial.history, {choiceId: "delivered_no_reply", expectedRevision: 0}]
  ]) assert.throws(() => chooseAction(scenario, history, command), TypeError);
  assert.throws(() => derivePath(scenario, ["request", "name_harm", "accept"]), TypeError);
});

test("tampered origins, observations, action effects, unchosen futures and version substitutions fail closed", () => {
  const complete = derivePath(scenario, ["request", "name_harm"]).history;
  const mutations = [
    history => { history.events[1].causedBy = "request"; },
    history => { history.events[1].text = "The wording made your friend withhold a reply."; },
    history => { history.events[1].observed.push("Your friend read it."); },
    history => { history.events[0].factsEstablished.push("forgiven"); },
    history => { history.events[0].unchosenOutcomes = ["They would have forgiven you."]; },
    history => { history.events[0].explicitMotive = "You just wanted approval."; },
    history => { history.events[1].origin = "participant"; },
    history => { history.events.reverse(); },
    history => { history.events = history.events.slice(0, 1); },
    history => { history.sourceFingerprint = "different edition"; },
    history => { history.scenarioFingerprint = "different choices"; },
    history => { history.version = "changed"; },
    history => { history.schema = "encounter-events/2"; },
    history => { history.scenarioId = "different-work"; }
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(complete);
    mutate(copy);
    assert.throws(() => replayEncounter(scenario, copy), TypeError);
  }
  const invalidScenario = structuredClone(scenario);
  invalidScenario.openingChoices[0].establishes.push("forgiven");
  assert.throws(() => derivePath(invalidScenario, ["acknowledge"]), /outside participant authority/);
});
