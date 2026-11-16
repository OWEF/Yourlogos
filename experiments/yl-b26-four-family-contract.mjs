/**
 * CZ-141 / B2.6 — FOUR user-facing families over accepted source contracts.
 * Stage A ONLY: source-authenticated compatibility projection.
 *
 * Not an interactive build, a new reasoning adapter or production selector.
 * The accepted B2.5 selector is consulted once as the authoritative
 * source-capability provider; this projection groups its six historical
 * internal game IDs into FOUR presentation families.
 *
 * In particular tap_pair has NO positive semantic operator yet; it is
 * deliberately held closed rather than pretending allocation/branch
 * results prove a philosophical concept relationship.
 */
import {selectMiniGameB25}
  from "./yl-b25-encounter.mjs";
import {inspectPairSource}
  from "./yl-b26-relations.mjs";

export const B26_VERSION = "source-driven-four-family-foundation/2.6.0";
export const INTERACTION_FAMILIES = Object.freeze([
  "balance_move", "decision_cards", "tap_pair", "flip_reveal"
]);
export const LEGACY_GAME_FAMILY = Object.freeze({
  trade_off: "balance_move",
  token_studio: "balance_move",
  balance_of_values: "balance_move",
  decision_map: "decision_cards",
  swipe_decision: "decision_cards",
  future_reveal: "flip_reveal"
});
export const FAMILY_CONTRACTS = Object.freeze({
  balance_move: Object.freeze({
    key: "balance_move",
    interaction: "one canonical resource state with slider and movable tokens",
    reasoningKinds: Object.freeze(["conversion", "repetition", "allocation"]),
    choiceKind: "canonical_allocation",
    publicationAllowed: false
  }),
  decision_cards: Object.freeze({
    key: "decision_cards",
    interaction: "short tap-driven source-authored branch choices",
    reasoningKinds: Object.freeze(["sequential_branch"]),
    choiceKind: "canonical_branch_path",
    publicationAllowed: false
  }),
  tap_pair: Object.freeze({
    key: "tap_pair",
    interaction: "at most six source-authored concept cards, pair to form a relation",
    reasoningKinds: Object.freeze(["source_warranted_relation"]),
    choiceKind: "source_warranted_pairs",
    requiresNewMeaningAdapter: true,
    publicationAllowed: false
  }),
  flip_reveal: Object.freeze({
    key: "flip_reveal",
    interaction: "tap-to-flip source-authored hypothetical scenes",
    reasoningKinds: Object.freeze(["sequential_branch"]),
    choiceKind: "canonical_authored_timeline",
    publicationAllowed: false
  })
});

const invalid = (code, reason) => ({
  status: "blocked", version: B26_VERSION, code, reason,
  publicationAllowed: false, productionPlayable: false
});
const checkPreferred = id => id === null || INTERACTION_FAMILIES.includes(id);
const friendly = family => FAMILY_CONTRACTS[family].interaction;

/**
 * Retains the ONE accepted source/capability evaluation. The returned
 * preferred family is an optional QA-only inspection request, not a
 * second interactive mechanic routing step in the normal UX.
 */
export function assessInteractionFamiliesB26(
  sourceRef, {preferredFamilyId = null} = {}
) {
  if (!checkPreferred(preferredFamilyId))
    return invalid("invalid_family", "Only the four registered interaction families exist");

  // Pair source-authored relationships are a distinct kind of source contract.
  // They are not admitted through a fake allocation/branch compatibility flag.
  const relation = inspectPairSource(sourceRef);
  if(relation){
    const eligible=[{id:"tap_pair",eligible:true,candidateLegacyGameIds:[],
      reason:"Exact authored relation evidence and typed canonical pair contract",
      requiredChoiceKind:"source_warranted_pairs"}];
    const excluded=INTERACTION_FAMILIES.filter(id=>id!=="tap_pair").map(id=>({
      id,reason:"Source has no resource or sequential branch warrant"
    }));
    if(preferredFamilyId && preferredFamilyId!=="tap_pair")
      return {status:"no_fit",version:B26_VERSION,requestedFamilyId:preferredFamilyId,
        reason:"The source warrants relationships, not the requested unrelated operation",
        eligibleFamilies:eligible,excludedFamilies:excluded,publicationAllowed:false};
    return {
      status:"research_selected",version:B26_VERSION,
      sourceRecordId:relation.recordId,sourceVersionHash:relation.sourceFingerprint,
      selectedFamilyId:"tap_pair",familyChoiceKind:"source_warranted_pairs",
      internalLegacyGameId:null,
      eligibleFamilies:eligible,excludedFamilies:excluded,
      selectionTrace:{evaluatedFamilies:[...INTERACTION_FAMILIES],
       sourceReasoningOperation:"source_warranted_relation",
       sourceWarrantIds:[...relation.warrant.evidenceIds],
       sourceRelation:relation.warrant.sourceRelation,
       noSecondUserFacingSelection:true,tapPairBlockedUntilRelationAdapterExists:false,
       derivedFromCertifiedSource:true},
      sourceReview:"founder_provisional_not_scholar_verified",
      publicationAllowed:false,productionPlayable:false
    };
  }
  const certified = selectMiniGameB25(sourceRef);
  if (certified.status !== "research_selected")
    return {
      status: certified.status,
      version: B26_VERSION,
      reason: certified.reason || "The accepted source registry has no authorized gameplay",
      sourceStatus: certified.status,
      publicationAllowed: false,
      productionPlayable: false,
      excludedFamilies: INTERACTION_FAMILIES.map(id => ({
        id, reason: "No source-authenticated interaction"
      }))
    };

  const sourceRows = certified.selection_trace?.rows;
  if (!Array.isArray(sourceRows) || sourceRows.length !== 6)
    return invalid("invalid_capability_trace", "No replayable six-operation source evidence");

  const groups = INTERACTION_FAMILIES.map(id => {
    if (id === "tap_pair")
      return {
        id, eligible: false, candidateLegacyGameIds: [],
        reason: "capability_research: source-warranted relation operator not yet implemented",
        requiredChoiceKind: FAMILY_CONTRACTS[id].choiceKind
      };
    const candidates = sourceRows.filter(row =>
      row.eligible === true && LEGACY_GAME_FAMILY[row.id] === id
    ).map(row => row.id);
    return {
      id, eligible: candidates.length > 0,
      candidateLegacyGameIds: candidates,
      reason: candidates.length > 0
        ? friendly(id) : "Source does not warrant this family",
      requiredChoiceKind: FAMILY_CONTRACTS[id].choiceKind
    };
  });

  const eligible = groups.filter(row => row.eligible);
  const excluded = groups.filter(row => !row.eligible);
  const defaultFamilyId = LEGACY_GAME_FAMILY[certified.selected_game_id];
  if (!defaultFamilyId || !eligible.some(x => x.id === defaultFamilyId))
    return invalid("source_selector_inconsistency",
      "An accepted internal game has no equivalent family");

  if (preferredFamilyId === "tap_pair")
    return {
      status: "capability_research", version: B26_VERSION,
      requestedFamilyId: "tap_pair",
      reason: "Needs a source-authored relation contract and genuine reasoning adapter",
      eligibleFamilies: eligible, excludedFamilies: excluded,
      publicationAllowed: false, productionPlayable: false
    };

  if (preferredFamilyId && !eligible.some(row => row.id === preferredFamilyId))
    return {
      status: "no_fit", version: B26_VERSION,
      requestedFamilyId: preferredFamilyId,
      reason: "The source's authenticated meaning cannot support this interaction",
      eligibleFamilies: eligible, excludedFamilies: excluded,
      publicationAllowed: false, productionPlayable: false
    };

  // Existing selector's default already includes its own source adjudication.
  // Only an explicit family preference from isolated QA may override it.
  const selectedFamilyId = preferredFamilyId || defaultFamilyId;
  const selectedRow = groups.find(row => row.id === selectedFamilyId);
  const legacyGameId = selectedFamilyId === defaultFamilyId
    ? certified.selected_game_id
    : selectedRow.candidateLegacyGameIds[0];

  return {
    status: "research_selected", version: B26_VERSION,
    sourceRecordId: certified.recordId,
    sourceVersionHash: certified.recordVersionHash,
    selectedFamilyId,
    familyChoiceKind: FAMILY_CONTRACTS[selectedFamilyId].choiceKind,
    internalLegacyGameId: legacyGameId,
    eligibleFamilies: eligible,
    excludedFamilies: excluded,
    selectionTrace: {
      evaluatedFamilies: [...INTERACTION_FAMILIES],
      inheritedSourceCapabilityTrace: certified.selection_trace,
      derivedFromCertifiedSource: true,
      noSecondUserFacingSelection: true,
      tapPairBlockedUntilRelationAdapterExists: true
    },
    sourceReview: certified.sourceReview,
    publicationAllowed: false,
    productionPlayable: false
  };
}
