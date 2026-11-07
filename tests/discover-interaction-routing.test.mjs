import test from 'node:test';
import assert from 'node:assert/strict';
import {INTERACTION_TYPES, selectApprovedInteraction, validateInteractionRoute} from '../discover-interaction-routing.js';
const route = {
  route_version: 1, quote_id: 28, interaction_type: 'decision_map',
  intellectual_operation: 'choose_and_trace',
  rationale: 'Trace how money, time and private space shape the material conditions of writing.',
  proposal_source: 'founder_proposal', review_status: 'proposed',
  source_context_verified: false, config: {}
};
test('all seven mechanics have distinct identifiers', () => {
  assert.equal(new Set(INTERACTION_TYPES).size, 7);
});
test('an unreviewed route can be proposed but never selected', () => {
  assert.deepEqual(validateInteractionRoute(route), []);
  assert.equal(selectApprovedInteraction(28, route), null);
});
test('approval requires source review and a versioned interaction payload', () => {
  const premature = {...route, review_status:'approved'};
  assert.equal(validateInteractionRoute(premature).length, 2);
  assert.equal(selectApprovedInteraction(28, premature), null);
});
test('reviewed route can be selected only for its exact quote', () => {
  const reviewed = {...route, review_status:'approved', source_context_verified: true,
    config: {schemaVersion: 1, choices: ['income','privacy','time']}};
  assert.deepEqual(validateInteractionRoute(reviewed), []);
  assert.equal(selectApprovedInteraction(28, reviewed), 'decision_map');
  assert.equal(selectApprovedInteraction(88, reviewed), null);
});
test('unsupported type, array config and missing rationale are rejected', () => {
  assert.equal(validateInteractionRoute({...route, interaction_type:'word_scramble', config:[], rationale:''}).length, 3);
});