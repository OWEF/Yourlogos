// CZ-103: versioned classification contract. Not yet integrated with the live Discover UI.
export const INTERACTION_ROUTE_VERSION = 1;
export const INTERACTION_TYPES = Object.freeze([
  'tradeoff_slider', 'decision_map', 'concept_builder', 'evidence_lens',
  'counterexample', 'perspective_switch', 'reflection_only'
]);
export const INTELLECTUAL_OPERATIONS = Object.freeze([
  'allocate', 'choose_and_trace', 'construct_argument',
  'weigh_evidence', 'test_universal_claim', 'reinterpret', 'reflect'
]);
const routeTypes = new Set(INTERACTION_TYPES);
const routeOperations = new Set(INTELLECTUAL_OPERATIONS);
const sources = new Set(['founder_proposal', 'ai_proposal', 'editorial']);
const reviewStates = new Set(['proposed', 'approved', 'rejected']);
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateInteractionRoute(route) {
  const errors = [];
  if (!plainObject(route)) return ['Route must be an object'];
  if (route.route_version !== INTERACTION_ROUTE_VERSION) errors.push('Route version must match');
  if (!Number.isInteger(route.quote_id) || route.quote_id < 0) errors.push('Stable non-negative quote ID required');
  if (!routeTypes.has(route.interaction_type)) errors.push('Unknown interaction type');
  if (!routeOperations.has(route.intellectual_operation)) errors.push('Unknown intellectual operation');
  if (!reviewStates.has(route.review_status)) errors.push('Unknown review status');
  if (!sources.has(route.proposal_source)) errors.push('Unknown proposal source');
  if (typeof route.rationale !== 'string' || !route.rationale.trim() || route.rationale.length > 900)
    errors.push('Quote-specific editorial rationale required (max 900 characters)');
  if (!plainObject(route.config)) errors.push('Interaction config must be an object');
  if (route.review_status === 'approved') {
    if (route.source_context_verified !== true) errors.push('Source context must be verified before approval');
    if (route.interaction_type !== 'reflection_only' && !route.config?.schemaVersion)
      errors.push('Approved interactive mechanic requires a versioned configuration');
  }
  return errors;
}

// Fail closed: an AI/editorial proposal cannot silently override a reviewed interaction.
export function selectApprovedInteraction(quoteId, route) {
  if (!route || route.quote_id !== quoteId || route.review_status !== 'approved') return null;
  return validateInteractionRoute(route).length === 0 ? route.interaction_type : null;
}