/**
 * CZ-105 — philosophical model v1.
 * This is a provisional educational reconstruction, not an authenticated
 * scholarly edition or a production-approved interpretation of Seneca.
 */
export const PHILOSOPHICAL_MODEL_SCHEMA_VERSION = 1;

export const SENECA_TIME_TRADEOFF_V1 = Object.freeze({
  schemaVersion: PHILOSOPHICAL_MODEL_SCHEMA_VERSION,
  id: "seneca-time-tradeoff-v1",
  mechanism: "tradeoff",
  editorial: {
    reviewStatus: "proposed",
    productionEligible: false,
    sourceContextVerified: false,
    interpretationKind: "educational_reconstruction",
    existingCatalogue: "tension-catalogue-d.js quote 49",
  },
  quote: {
    legacyId: 49,
    author: "Seneca",
    text: "Life is long if you know how to use it.",
    work: "On the Shortness of Life",
    wordingStatus: "bundled_translation_varies",
  },
  claim: {
    id: "seneca-time-use",
    text: "The quality of a life depends partly on how time is attended to and used, not merely its duration.",
    status: "interpretive_reconstruction",
    scope: "time_and_deliberate_living",
  },
  premises: [
    { id: "p-finite", text: "Time available for any particular activity is finite." },
    { id: "p-attention", text: "Attention to one's use of time matters to the appraisal of a life." },
  ],
  concepts: [
    { id: "finite_time", label: "Finite time" },
    { id: "allocation", label: "Allocation of time" },
    { id: "opportunity_cost", label: "Excluded alternatives" },
    { id: "deliberate_attention", label: "Deliberate attention" },
    { id: "meaningful_use", label: "Meaningful use of time" },
    { id: "rest", label: "Rest" },
    { id: "obligations", label: "Obligations" },
    { id: "reflection", label: "Reflection" },
  ],
  relations: [
    {
      id: "rel-finite-budget",
      type: "constrains",
      from: "finite_time",
      to: "allocation",
      warrant: "Within a fixed block, increasing one activity reduces the time available to others.",
      epistemicStatus: "scenario_necessity",
    },
    {
      id: "rel-forgone-alternatives",
      type: "entails",
      from: "allocation",
      to: "opportunity_cost",
      warrant: "A fixed allocation leaves mutually exclusive alternatives unchosen during that same block.",
      epistemicStatus: "scenario_necessity",
    },
    {
      id: "rel-deliberateness",
      type: "may_support",
      from: "deliberate_attention",
      to: "meaningful_use",
      warrant: "Purposeful reflection about how time is lived can illuminate the value of its use.",
      epistemicStatus: "interpretive_possibility",
    },
  ],
  scenario: {
    id: "eight-hour-thought-exercise",
    kind: "fixed_resource",
    budget: 8,
    unit: "hours",
    categories: [
      { id: "rest", label: "Rest" },
      { id: "obligations", label: "Obligations" },
      { id: "reflection", label: "Reflection" },
    ],
    description: "A hypothetical eight-hour block of mutually exclusive activities, not an entire daily schedule.",
    status: "invented_educational_scenario",
  },
  strainConditions: [
    { id: "exclusive", description: "One activity occupies the entire hypothetical block; others get no time in it." },
    { id: "neglected", description: "An activity gets no time inside this block, potentially raising a question about other commitments." },
    { id: "repeated", description: "Repeated choices may have different consequences from a one-off retreat." },
  ],
  interpretiveBoundaries: [
    "No allocation ratio is endorsed by Seneca as objectively optimal.",
    "Allocation alone cannot establish whether the user's life is meaningful or whether the allocation is deliberate.",
    "Zero rest inside this block does not mean the user gets zero sleep in an entire day.",
    "An extreme allocation is not proof of bad judgment, psychological condition, or personal beliefs.",
    "The educational scenario is not a historical statement or quotation from Seneca.",
    "Possible consequences must not be described as logically necessary outcomes.",
  ],
});

const nonEmpty = s => typeof s === "string" && s.trim().length > 0;
const isObject = o => o !== null && typeof o === "object" && !Array.isArray(o);

export function validatePhilosophicalModel(model) {
  const errors = [];
  if (!isObject(model)) return ["Model must be a non-null object"];
  if (model.schemaVersion !== PHILOSOPHICAL_MODEL_SCHEMA_VERSION)
    errors.push("Unsupported philosophical model schema");
  if (!nonEmpty(model.id) || model.mechanism !== "tradeoff")
    errors.push("Model ID and supported mechanism required");
  if (!nonEmpty(model.claim?.id) || !nonEmpty(model.claim?.text))
    errors.push("A source-aware philosophical claim is required");
  if (!Number.isInteger(model.quote?.legacyId) || !nonEmpty(model.quote?.text) ||
      !nonEmpty(model.quote?.author) || !nonEmpty(model.quote?.work))
    errors.push("Quote identity and work required");
  if (!isObject(model.editorial) || !["proposed", "approved", "rejected"].includes(model.editorial.reviewStatus))
    errors.push("Editorial review state required");
  if (model.editorial?.productionEligible &&
      (model.editorial.reviewStatus !== "approved" || model.editorial.sourceContextVerified !== true))
    errors.push("Unverified model cannot be production eligible");
  for (const [key, required] of [["premises", 1], ["concepts", 2], ["relations", 1],
                                  ["strainConditions", 1], ["interpretiveBoundaries", 1]]) {
    if (!Array.isArray(model[key]) || model[key].length < required)
      errors.push("Missing model " + key);
  }
  const ids = new Set();
  for (const c of model.concepts || []) {
    if (!nonEmpty(c.id) || !nonEmpty(c.label) || ids.has(c.id))
      errors.push("Invalid/duplicate concept");
    ids.add(c.id);
  }
  for (const p of model.premises || [])
    if (!nonEmpty(p.id) || !nonEmpty(p.text)) errors.push("Invalid premise");
  for (const r of model.relations || [])
    if (!nonEmpty(r.id) || !nonEmpty(r.type) || !nonEmpty(r.warrant) ||
        !ids.has(r.from) || !ids.has(r.to) ||
        !["scenario_necessity", "interpretive_possibility"].includes(r.epistemicStatus))
      errors.push("Invalid philosophical relation");
  const s = model.scenario;
  if (!isObject(s) || s.kind !== "fixed_resource" || !Number.isFinite(s.budget) || s.budget <= 0 ||
      !Array.isArray(s.categories) || s.categories.length < 2 ||
      s.categories.some(c => !nonEmpty(c.id) || !ids.has(c.id)) ||
      new Set(s.categories.map(c => c.id)).size !== s.categories.length)
    errors.push("Invalid finite-allocation scenario");
  if ((model.interpretiveBoundaries || []).some(x => !nonEmpty(x)))
    errors.push("Blank interpretive boundary");
  return errors;
}
