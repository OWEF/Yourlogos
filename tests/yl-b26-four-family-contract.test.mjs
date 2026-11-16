import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  INTERACTION_FAMILIES, LEGACY_GAME_FAMILY, FAMILY_CONTRACTS,
  assessInteractionFamiliesB26
} from "../experiments/yl-b26-four-family-contract.mjs";
import {
  DILLARD_V21, KIERKEGAARD_V21, HEGEL_NO_FIT_V21
} from "../philosophy-engine/content/research-fixtures-v21.js";
import {B23_SOURCE_CONTRACTS}
  from "../experiments/yl-b23-founder-six-peer.mjs";
import {B25_BALANCE_CONTRACTS}
  from "../experiments/yl-b25-authored-scenarios.mjs";
import {selectMiniGameB25}
  from "../experiments/yl-b25-encounter.mjs";

test("founder approved exactly four USER families, preserving six private legacy operations", () => {
  assert.deepEqual(INTERACTION_FAMILIES,
    ["balance_move", "decision_cards", "tap_pair", "flip_reveal"]);
  assert.equal(Object.keys(LEGACY_GAME_FAMILY).length, 6);
  assert.deepEqual(new Set(Object.values(LEGACY_GAME_FAMILY)),
    new Set(["balance_move", "decision_cards", "flip_reveal"]));
  assert.equal(FAMILY_CONTRACTS.tap_pair.requiresNewMeaningAdapter, true);
  for (const value of Object.values(FAMILY_CONTRACTS))
    assert.equal(value.publicationAllowed, false);
});

test("the same author-neutral family adapter handles historical and two new source variants", () => {
  const examples = [
    [DILLARD_V21, "balance_move"],
    [KIERKEGAARD_V21, "decision_cards"],
    [B23_SOURCE_CONTRACTS[0], "balance_move"],
    [B23_SOURCE_CONTRACTS[1], "flip_reveal"],
    ...B25_BALANCE_CONTRACTS.map(x => [x, "balance_move"])
  ];
  for (const [record, expectedFamily] of examples) {
    const historical = selectMiniGameB25(record);
    assert.equal(historical.status, "research_selected");
    const result = assessInteractionFamiliesB26(record);
    assert.equal(result.status, "research_selected");
    assert.equal(result.selectedFamilyId, expectedFamily);
    assert.equal(result.internalLegacyGameId, historical.selected_game_id);
    assert.equal(result.sourceVersionHash, historical.recordVersionHash);
    assert.equal(result.eligibleFamilies.length + result.excludedFamilies.length, 4);
    assert.deepEqual(result.selectionTrace.evaluatedFamilies, INTERACTION_FAMILIES);
    assert.equal(result.selectionTrace.noSecondUserFacingSelection, true);
    assert.equal(result.productionPlayable, false);
    assert.equal(result.publicationAllowed, false);
  }
});

test("incompatible source is never forced into a game, nor can a preference invent source authority", () => {
  assert.equal(assessInteractionFamiliesB26(HEGEL_NO_FIT_V21).status, "no_fit");
  assert.equal(assessInteractionFamiliesB26({author: "Made-up", quote: "A fake source"}).status, "blocked");
  assert.equal(assessInteractionFamiliesB26(DILLARD_V21,
    {preferredFamilyId: "flip_reveal"}).status, "no_fit");
  assert.equal(assessInteractionFamiliesB26(KIERKEGAARD_V21,
    {preferredFamilyId: "balance_move"}).status, "no_fit");
  assert.equal(assessInteractionFamiliesB26(DILLARD_V21,
    {preferredFamilyId: "fifth_magic_puzzle"}).code, "invalid_family");
  const tamper = {
    ...B25_BALANCE_CONTRACTS[1],
    source: {...B25_BALANCE_CONTRACTS[1].source, quote: "We forged the quotation."}
  };
  assert.notEqual(assessInteractionFamiliesB26(tamper).status, "research_selected");
});

test("Tap & Pair remains capability research, never fake-ready until real relation semantics exist", () => {
  for (const record of [DILLARD_V21, KIERKEGAARD_V21,
    B23_SOURCE_CONTRACTS[1], B25_BALANCE_CONTRACTS[2]]) {
    const result = assessInteractionFamiliesB26(record,
      {preferredFamilyId: "tap_pair"});
    assert.equal(result.status, "capability_research");
    assert.equal(result.publicationAllowed, false);
    assert.ok(result.excludedFamilies.some(row =>
      row.id === "tap_pair" && /relation operator/.test(row.reason)));
  }
  const source = readFileSync(
    new URL("../experiments/yl-b26-four-family-contract.mjs", import.meta.url),
    "utf8");
  for (const suspicious of ["Henry David Thoreau", "Annie Dillard",
    "Kierkegaard", "invented $20", "exactly eight hours"])
    assert.equal(source.includes(suspicious), false);
});
