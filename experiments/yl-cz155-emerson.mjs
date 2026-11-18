// CZ-147 source-authored transfer: same independent event and public act,
// expressly different grounds. Uses the exact CZ-155 Director, source-neutral
// Reasoning, Emotion and Expression; no Emerson-specific runtime hooks.
import {fingerprintB25} from "./yl-b25-authored-scenarios.mjs";
import {B27_APP_QUOTES} from "./yl-b27-quote-ledger.mjs";

const quote=B27_APP_QUOTES[55];
const source={
 id:"self-reliance-1841-inherited-excerpt",quoteId:55,
 author:quote[1],work:quote[3],text:quote[0],
 edition:"Essays: First Series, James Munroe & Company, Boston, 1841, Self-Reliance",
 referenceUrl:"https://anthology.lib.virginia.edu/work/Emerson/emerson-self-reliance",
 // The inherited display quote ends with a period where the first-edition
 // sentence continues after 'minds,'. No publication rewording is authorized.
 quotationStatus:"inherited_excerpt_punctuation_normalized",
 warrants:{
  present_judgment:"Emerson advises bringing past declarations before present judgment rather than treating yesterday's words as governing authority.",
  public_consistency:"Self-Reliance distinguishes self-trust from fear of appearing inconsistent to others.",
  thoughtful_retention:"The adjective 'foolish' limits the criticism: keeping a position after revisiting its merits can be independent judgment.",
  scenario_qualification:"Fictional transport facts, budget claims and proposed alternatives do not demonstrate real service outcomes or guarantee adequate mobility."
 },
 publicationAllowed:false,
 review:"development_transfer_only"
};
const first={
 id:"publish_initial_support",label:"Stand behind your earlier public support",
 medium:"public_statement",
 literal:"I support moving the final bus from 23:40 to 22:50.",
 recap:"You publicly supported the earlier bus departure.",
 effect:"public_support_reaffirmed",establishes:["publiclySupported"],
 commitment:"The earlier departure has public support; its merits can still be reconsidered.",
 possibleRationale:"The aggregate figures initially appear to support the proposal.",
 explicitMotive:null,warrantIds:["present_judgment","public_consistency"]
};
const publicDecision="I still support moving the final bus from 23:40 to 22:50.";
const followUps={
 publish_initial_support:[
  {
   id:"maintain_merits",label:"Maintain after weighing both needs and the funded alternative",
   medium:"public_statement",literal:publicDecision,
   recap:"You maintained it after weighing workers and a shuttle.",
   effect:"maintain_on_current_reasons",
   establishes:["maintainedProposal","weighedBothEvidence","identifiedCredibleAlternative"],
   commitment:"You will defend the proposal using present ridership and an accessible 23:45 shuttle pilot, whose adequacy is unproven.",
   possibleRationale:"An earlier fixed-route departure may remain defensible if the funded alternative actually serves the affected workers.",
   explicitMotive:"I weighed the aggregate ridership and the thirteen late-shift workers. A confirmed-budget, accessible 23:45 shuttle pilot with the same stops gives a credible but untested alternative. On those grounds I still support the proposal, subject to verification.",
   warrantIds:["present_judgment","thoughtful_retention","scenario_qualification"]
  },
  {
   id:"maintain_image",label:"Maintain because reversing would look inconsistent",
   medium:"public_statement",literal:publicDecision,
   recap:"You maintained it to seem consistent.",
   effect:"maintain_for_public_image",
   establishes:["maintainedProposal","avoidedInconsistency"],
   commitment:"You have kept the position publicly without assessing the neighbor's objection on its merits.",
   possibleRationale:"Earlier public support creates reputational pressure.",
   explicitMotive:"I have not weighed the late-shift evidence or the shuttle. I am keeping this position because people would think I am inconsistent if I reversed myself.",
   warrantIds:["public_consistency","scenario_qualification"]
  }
 ]
};
const seed={
 id:"last-bus-present-judgment",
 version:"last-bus-present-judgment/1",
 operation:"independent_judgment",
 source,sourceFingerprint:fingerprintB25(source),warrantIds:Object.keys(source.warrants),
 opening:"You publicly supported moving your neighborhood's last bus from 23:40 to 22:50. Aggregated ridership figures initially made that proposal look reasonable. A local meeting is now discussing the change.",
 reconsiderationQuestion:"Does keeping your published position follow from today's evidence or from how a reversal might look?",
 selfFacts:["publiclySupported","maintainedProposal","weighedBothEvidence",
  "identifiedCredibleAlternative","avoidedInconsistency"],
 openingChoices:[first],followUps,
 externalEvent:{
  id:"neighbor_shift_evidence",
  text:"A neighbor brings rosters showing thirteen late-shift workers rely on the 23:40 bus. The transit office confirms budget for an accessible 23:45 shuttle pilot serving the same stops, but it has not been tested.",
  observed:["Late-shift workers rely on the existing last bus.",
   "Aggregate ridership had initially appeared to support an earlier departure.",
   "A funded accessible shuttle pilot with the same stops is available to test."],
  unknowns:["Whether the pilot would adequately serve shift workers.",
   "Whether ridership would change after implementation.",
   "Whether either policy will ultimately be defensible."],
  warrantIds:["scenario_qualification","present_judgment"]
 }
};
function freeze(value){
 if(value&&typeof value==="object"&&!Object.isFrozen(value)){
  for(const member of Object.values(value))freeze(member);
  Object.freeze(value);
 }
 return value;
}
export const EMERSON_SCENARIO=freeze({
 ...seed,scenarioFingerprint:fingerprintB25(seed)
});
export const EMERSON_RECORD=freeze({
 version:"cz147-emerson-director-transfer/1",recordId:EMERSON_SCENARIO.id,
 quoteId:source.quoteId,status:"development_provisional",publicationAllowed:false,
 developmentOnly:false,exposeInApp:false,
 familyId:"decision_cards",title:"The last bus and your public position",
 intro:EMERSON_SCENARIO.opening,
 source:{text:source.text,author:source.author,work:source.work,
  referenceUrl:source.referenceUrl},
 sourceThesis:"Independent judgment requires present reasons, not merely consistency.",
 evidenceClaim:"Past declarations can exert public pressure, but neither a change nor a maintained view proves independent judgment on its own.",
 humanTension:"Keeping a public bus-policy position for present reasons or to avoid appearing inconsistent.",
 epistemicLimits:"The shuttle alternative is fictional and untested; the participant's chosen grounds do not prove the bus policy works.",
 compactLimit:"The shuttle remains untested.",
 counterexample:"A principled commitment can be retained after fresh scrutiny; novelty is not itself a virtue.",
 readerAgency:"Hear the neighbor's evidence, then select the explicit reason for the same outward public decision.",
 reflectionQuestion:EMERSON_SCENARIO.reconsiderationQuestion,
 narrativeBridge:{
  version:"cz152-narrative/1",
  bridgeFromSource:"Emerson questions loyalty to yesterday's words when today's judgment should be independent.",
  situationHook:"A neighborhood's last bus may depart earlier. Thirteen late-shift workers rely on the existing service; a funded accessible shuttle pilot may offer an alternative.",
  playPrompt:"The public position can stay the same while its reason changes.",
  sourceWarrantIds:["source:central","scenario:fictional"]
 },
 evidenceIds:["source:central","source:boundary","scenario:fictional",...EMERSON_SCENARIO.warrantIds],
 affordances:["revisability","choice_awareness"],
 prohibitedInferences:["Changing position is inherently virtuous",
  "Maintaining a position is inherently cowardly",
  "A fictional shuttle guarantees workers are served",
  "Outward public consistency proves private motivation"],
 supportedConclusions:["Identical public action can express different explicitly selected reasons"],
 philosophicalOperation:{kind:"independent_judgment",focus:"present evidence and reputation",
  contrast:"current merited judgment versus merely maintaining appearances",
  sourceWarrantIds:EMERSON_SCENARIO.warrantIds},
 director:EMERSON_SCENARIO,
 decisionWarrant:{
  fact:"weighedBothEvidence",oppositeFact:"avoidedInconsistency",
  warrantId:"present_judgment",
  established:{
   inference:"Weighing workers and a funded shuttle before maintaining the proposal can express independent present judgment.",
   question:"Would you keep this view without an audience, and what evidence could change it?",
   strategy:"revisability"
  },
  outstanding:{
   inference:"Keeping the proposal just to appear consistent makes yesterday's public declaration an authority over today's judgment.",
   question:"What evidence would justify this position if no one remembered yesterday's words?",
   strategy:"choice_awareness"
  },
  // The base proposition tests today's merits. Refinements attribute each
  // expressly selected ground to its distinct authenticated source warrant.
  // These do not change the interpretation; they make provenance exact.
  refinements:[
   {factsAll:["weighedBothEvidence"],warrantId:"thoughtful_retention",
    inference:"Weighing workers and a funded shuttle before maintaining the proposal can express independent present judgment.",
    question:"Would you keep this view without an audience, and what evidence could change it?",
    strategy:"revisability"},
   {factsAll:["avoidedInconsistency"],warrantId:"public_consistency",
    inference:"Keeping the proposal just to appear consistent makes yesterday's public declaration an authority over today's judgment.",
    question:"What evidence would justify this position if no one remembered yesterday's words?",
    strategy:"choice_awareness"}
  ]
 }
});
