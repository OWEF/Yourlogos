/**
 * CZ-145 B2.7 source-diverse editorial admissions, revision 1.
 * One exact quote-id entry per proposed adaptation. No author/theme routing.
 * "playable" means an isolated source-bound prototype, NOT published or
 * independently scholarly approved. Other statuses MUST stay reading-first.
 */
import {B27_APP_QUOTES,B27_INHERITED_COUNT} from "./yl-b27-quote-ledger.mjs";
export const B27_EDITORIAL_VERSION="b27-editorial-admission/1";
const playable=[
 {quoteId:12,key:"dillard",operation:"repeated_resource_pattern",familyId:"balance_move",status:"playable",provenance:"The Writing Life; inherited DILLARD_V21",editorialStatus:"founder_provisional_development_only"},
 {quoteId:34,key:"kierkegaard_map",operation:"sequential_choice_under_uncertainty",familyId:"decision_cards",status:"playable",provenance:"Journals 1843; inherited KIERKEGAARD_V21",editorialStatus:"founder_provisional_development_only"},
 {quoteId:91,key:"smith_human",operation:"coordinated_complementary_contributions",familyId:"tap_pair",status:"playable",provenance:"Wealth of Nations I.i; inherited Smith relation source; new human scenario",editorialStatus:"founder_provisional_development_only"},
 {quoteId:92,key:"epictetus_relations",operation:"agency_vs_external_response",familyId:"tap_pair",status:"playable",provenance:"Enchiridion §1; inherited Epictetus relation source",editorialStatus:"founder_provisional_development_only"},
 {quoteId:93,key:"thoreau_weekend",operation:"finite_life_as_resource_cost",familyId:"balance_move",status:"playable",provenance:"Walden Economy; inherited B25 source-authored record",editorialStatus:"founder_provisional_development_only"},
 {quoteId:94,key:"kierkegaard_hindsight",operation:"authored_future_and_retrospective_limits",familyId:"flip_reveal",status:"playable",provenance:"Kierkegaard JJ:167 excerpt with independently stored edition relationship; source identity not assumed by English wording alone",editorialStatus:"founder_provisional_development_only"}
];
// A new candidate is NOT admitted by superficial similarities to a playable
// quote or by sharing its author. Consider two distinct adaptations and record
// why the attractive but unfaithful one must not become a game.
const candidates=[
 {quoteId:21,status:"awaiting_reasoning_capability",operation:"argument_and_counterargument",gap:"adversarial_argument_reconstruction",consideredAdaptations:[
  {scenario:"Two colleagues debate a policy and identify a missing opposing argument",verdict:"CANDIDATE_REQUIRES_OPERATOR"},
  {scenario:"Count who agrees with you",verdict:"REJECTED",reason:"Agreement count does not test the quality of Mill's opposing case"}]},
 {quoteId:28,status:"awaiting_source_review",operation:"material_preconditions_for_creative_freedom",gap:"edition_and_context_check",consideredAdaptations:[
  {scenario:"An imagined writer needs uninterrupted space and resources",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"Buy a luxury desk to become a better writer",verdict:"REJECTED",reason:"Confuses material independence with product advice"}]},
 {quoteId:31,status:"no_fit",operation:"mediated_totality",gap:"mediation_across_the_whole",consideredAdaptations:[
  {scenario:"Relational historical reconstruction, not finite token balancing",verdict:"REQUIRES_NEW_CAPABILITY"},
  {scenario:"Pair two objects and call them the whole",verdict:"REJECTED",reason:"Mediation cannot be reduced to matching objects"}]},
 {quoteId:43,status:"awaiting_reasoning_capability",operation:"virtue_as_sustained_activity",gap:"practical_reason_and_virtue",consideredAdaptations:[
  {scenario:"A sustained pattern of choices rather than one pleasant moment",verdict:"CANDIDATE_REQUIRES_OPERATOR"},
  {scenario:"Rank pleasant moments as morally superior",verdict:"REJECTED",reason:"Pleasure scoring misrepresents the source's account of flourishing"}]},
 {quoteId:47,status:"awaiting_source_review",operation:"agency_vs_external_response",gap:"alternate_translation_and_source_identity",consideredAdaptations:[
  {scenario:"An apology that cannot determine forgiveness",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"Your optimism guarantees the other's response",verdict:"REJECTED",reason:"Outcomes are not under the speaker's control"}]},
 {quoteId:53,status:"awaiting_source_review",operation:"simplification_of_living",gap:"walden_context_check",consideredAdaptations:[
  {scenario:"Reduce an imagined week's commitments while preserving necessities",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"Always discard possessions",verdict:"REJECTED",reason:"Source is not a universal minimalist shopping rule"}]},
 {quoteId:56,status:"awaiting_reasoning_capability",operation:"belief_proportioned_to_evidence",gap:"epistemic_evidence_updating",consideredAdaptations:[
  {scenario:"Update confidence as qualified evidence arrives",verdict:"CANDIDATE_REQUIRES_OPERATOR"},
  {scenario:"Choose the popular opinion",verdict:"REJECTED",reason:"Popularity is not proportionate evidence"}]},
 {quoteId:63,status:"awaiting_source_review",operation:"retrospective_historical_comprehension",gap:"hegelian_history_not_personal_hindsight",consideredAdaptations:[
  {scenario:"An institution becomes intelligible after an era",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"A person's job choice proves the historical Spirit",verdict:"REJECTED",reason:"Individual career hindsight is not historical conceptual reconciliation"}]},
 {quoteId:69,status:"no_fit",operation:"logical_facts_and_world",gap:"logical_propositions_and_facts",consideredAdaptations:[
  {scenario:"Examine a proposition and the fact it purports to state",verdict:"REQUIRES_NEW_CAPABILITY"},
  {scenario:"Move objects into a box and call that the world",verdict:"REJECTED",reason:"Things alone are not the proposition/fact distinction"}]},
 {quoteId:70,status:"awaiting_source_review",operation:"public_use_of_reason",gap:"enlightenment_public_reason_context",consideredAdaptations:[
  {scenario:"Choose whether to voice a reasoned public criticism",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"Never listen to anyone else",verdict:"REJECTED",reason:"Thinking independently is not rejecting all testimony"}]},
 {quoteId:71,status:"awaiting_reasoning_capability",operation:"universalizable_maxim",gap:"formal_universalization",consideredAdaptations:[
  {scenario:"Formulate a maxim then test the possibility of universal adoption",verdict:"CANDIDATE_REQUIRES_OPERATOR"},
  {scenario:"Match one action to a secret correct answer",verdict:"REJECTED",reason:"A binary morality quiz cannot substitute for Kant's consistency test"}]},
 {quoteId:76,status:"awaiting_source_review",operation:"limits_of_local_perspective",gap:"allegory_context_and_translation",consideredAdaptations:[
  {scenario:"Revisit a confident judgement after a horizon expands",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"Mock someone who has limited experience",verdict:"REJECTED",reason:"The allegory is not a license to shame a person"}]},
 {quoteId:77,status:"awaiting_source_review",operation:"study_and_reflection",gap:"analects_translation_review",consideredAdaptations:[
  {scenario:"A person alternates studying and reflecting on a difficult question",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"Pair every study card with one correct thought",verdict:"REJECTED",reason:"The source does not supply a hidden card answer key"}]},
 {quoteId:88,status:"awaiting_source_review",operation:"embodied_material_support",gap:"woolf_context_review",consideredAdaptations:[
  {scenario:"Recognize what a hungry writer cannot simply think away",verdict:"CANDIDATE_SOURCE_REVIEW"},
  {scenario:"A meal guarantees creative brilliance",verdict:"REJECTED",reason:"Preconditions do not guarantee an outcome"}]},
 {quoteId:90,status:"awaiting_reasoning_capability",operation:"incipient_compassion",gap:"moral_sprouts_and_development",consideredAdaptations:[
  {scenario:"Notice immediate concern before constructing a reasoned moral judgment",verdict:"CANDIDATE_REQUIRES_OPERATOR"},
  {scenario:"Award empathy stars for clicking rescue",verdict:"REJECTED",reason:"A game click cannot measure the person's compassion"}]}
];
const entries=[...playable,...candidates];
if(new Set(entries.map(x=>x.quoteId)).size!==entries.length)throw Error("Duplicate editorial quote identity");
if(entries.some(x=>!B27_APP_QUOTES[x.quoteId]))throw Error("Editorial row lacks exact catalogue quote");
const normalized=entries.map(x=>Object.freeze({...x,
 quoteText:B27_APP_QUOTES[x.quoteId][0],author:B27_APP_QUOTES[x.quoteId][1],
 work:B27_APP_QUOTES[x.quoteId][3],version:B27_EDITORIAL_VERSION,
 sourceStatus:x.status==="playable"?"founder_provisional_development_only":x.status,
 publicationAllowed:false}));
export const B27_EDITORIAL_RECORDS=Object.freeze(normalized);
const byQuote=new Map(normalized.map(x=>[x.quoteId,x]));
export function editorialB27(quoteId){return byQuote.get(quoteId)||null;}
export function reportB27Coverage(){
 const counts={playable:0,reading_first:0,awaiting_source_review:0,
  awaiting_reasoning_capability:0,no_fit:0};
 const rows=B27_APP_QUOTES.map((quote,id)=>{
  const admission=byQuote.get(id);
  const status=admission?.status||"reading_first";
  counts[status]++;
  return {quoteId:id,status,author:quote[1],work:quote[3],
   sourceReview:admission?.sourceStatus||"catalogue_not_admitted",
   operation:admission?.operation||null,
   gap:admission?.gap||"source_specific_semantic_admission",
   developmentOnly:id>=B27_INHERITED_COUNT};
 });
 return {version:B27_EDITORIAL_VERSION,total:rows.length,
  original:B27_INHERITED_COUNT,developmentOnly:rows.length-B27_INHERITED_COUNT,
  counts,rows,independentScholarlyApproval:false,productionPlayable:false};
}
