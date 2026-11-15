/** CZ-130 representative records are ISOLATED / PROVISIONAL ONLY. Never imported to public Discover. */
import {semanticCases} from "../encounter/semantic-cases-v12.js";
import {CONTENT_VERSION,GAME_IDS,contentFingerprintV21} from "./content-contract-v21.js";
import {graphPathsFromContext} from "./content-capabilities-v211.js";
const finalize=x=>Object.freeze({...x,versionHash:contentFingerprintV21(x)});
const decision=(eligible,evidenceOrRejection,requirements=[])=>({eligible,evidenceOrRejection,requirements});
const six=byId=>GAME_IDS.map(id=>({id,...byId[id]}));
const NO_FIT_REJECTIONS=Object.freeze({
 trade_off:"The Preface's claim about mediated totality supplies no finite rival-resource allocation or measured competing outcomes.",
 decision_map:"This proposition supplies no source-authored chain of a person's decisions, actions and dependent consequences.",
 token_studio:"No source-grounded divisible resource, quantitative common unit or token allocation represents this philosophical claim.",
 balance_of_values:"The claim supplies no defensible commensurable metric for ranking separate personal values against each other.",
 swipe_decision:"No supported first personal decision, externally authored development and later user response arise from this proposition.",
 future_reveal:"The passage provides no hypothetical timeline with defined milestones; inventing a future would misstate its argument."
});
const researchSource=(context,locator)=>({
 author:context.author,work:context.source.work,quote:context.quote,
 locator,referenceUrl:context.source.url,verifiedSourceUrl:null,
 reviewState:"curated_provisional",reviewSignoff:null,
 translationEdition:"Edition/translation pending qualified review"
});
export const DILLARD_V21=finalize({
 version:CONTENT_VERSION,id:"research:dillard:time-v1",versionHash:"dillard-time-research-2026-11-15",
 source:researchSource(semanticCases.dillard,"The Writing Life, scheduling passage; exact original passage review pending"),
 editorialState:"research_only",editorialSignoff:null,route:"selector_pending",
 dilemma:"You have three hours this evening. How will you share six half-hour slots among writing, messages and rest?",
 argument:{
  thesis:"Ordinary decisions about time can accumulate into an imagined pattern across repeated evenings.",
  sourceWarrant:semanticCases.dillard.semantic.admission.centralClaim,
  accessibleInsight:"A life is not simply decided once; repeated days matter.",
  originalArgument:"Dillard's reflection concerns the repeated shape of ordinary days, not a numerical ranking of activities.",
  uncertaintyLimit:"Five evenings are hypothetical, not your observed behavior; we cannot know your motives or rank the value of rest, writing or relationships."
 },
 scenario:{id:"finite-evening-v1",variables:{unit:"half-hour",availableHours:3,period:"evening"},
  choices:[{id:"activity-0",label:"Write your story"},{id:"activity-1",label:"Answer messages"},{id:"activity-2",label:"Rest and recharge"}],
  constraints:{kind:"finite_budget",capacity:6,costs:[1,1,1],unitHours:0.5,repetitions:5},
  consequences:{warrant:"The chosen arrangement adds up across five imagined repeated evenings; an unchosen outcome is not inferred.",unknowns:["what happens in real life","what a reader truly values"]}},
 gameCompatibility:six({
  trade_off:decision(true,"Six-slot shared scarcity is mathematically conserved.",["finite_budget","authored_allocation_effect"]),
  decision_map:decision(false,"No authored dependent branch structure.",["authored_branch_consequences"]),
  token_studio:decision(true,"Discrete half-hour allocation among three activities.",["finite_budget","allocatable_discrete_units"]),
  balance_of_values:decision(false,"No warranted moral commensurability between activities.",["legitimate_common_scale"]),
  swipe_decision:decision(false,"No source-supported sequential consequence choices.",["short_sequential_choices"]),
  future_reveal:decision(false,"Repetitions are imagined totals, not a conditional authored timeline.",["authored_timeline_milestones"])
 }),
 emotionalEligibility:{enabled:true,allowedStrategies:["contemplative","warm","playful"],groundedTensions:["time allocation","hypothetical repetition"]},
 engineAdapter:{contextKey:"dillard",operation:"tradeoff",packetVersion:"meaning/1.2"}
});
export const KIERKEGAARD_V21=finalize({
 version:CONTENT_VERSION,id:"research:kierkegaard:future-v1",versionHash:"kierkegaard-branch-research-2026-11-15",
 source:researchSource(semanticCases.kierkegaard,"Journal JJ:167; shortened quotation wording review pending"),
 editorialState:"research_only",editorialSignoff:null,route:"selector_pending",
 dilemma:"You can take a new job or stay. What can you decide before knowing how it will feel later?",
 argument:{
  thesis:"Choices must be lived forward; later interpretation does not reveal the path not chosen.",
  sourceWarrant:semanticCases.kierkegaard.semantic.admission.centralClaim,
  accessibleInsight:"You must act without a view of the whole future.",
  originalArgument:"Reflective understanding follows lived experience and never grants the standpoint of a completed alternative life.",
  uncertaintyLimit:"Developments are explicitly authored possibilities, not forecasts or hidden insight into a reader's future."
 },
 scenario:{id:"forward-choice-v1",variables:{domain:"imagined job choice",futureKnown:false},
  choices:semanticCases.kierkegaard.model.nodes.first.options.map(o=>({id:o.id,label:o.label})),
  constraints:{kind:"authored_branch",routes:graphPathsFromContext(semanticCases.kierkegaard).map(steps=>({
   path:steps.map(s=>s.id),
   authoredDevelopments:steps[1]?.reveal||[],
   agencyRoles:["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"],
   unchosenOutcomeKnown:false
  }))},
  consequences:{warrant:"Later imagined evidence informs the chosen path but does not establish the unchosen future.",unknowns:["actual results","unchosen job future"]}},
 gameCompatibility:six({
  trade_off:decision(false,"No shared quantifiable resource.",["finite_budget"]),
  decision_map:decision(true,"Source-grounded dependent decision path.",["authored_branch_consequences"]),
  token_studio:decision(false,"Resource tokens would introduce unsupported scarcity.",["allocatable_discrete_units"]),
  balance_of_values:decision(false,"No source-warranted numerical scale for life paths.",["legitimate_common_scale"]),
  swipe_decision:decision(true,"Short sequential authored choices with later hypothetical revelation.",["short_sequential_choices"]),
  future_reveal:decision(false,"No endorsed scrub timeline milestones in this record.",["authored_timeline_milestones"])
 }),
 emotionalEligibility:{enabled:true,allowedStrategies:["contemplative","provocative"],groundedTensions:["acting ahead of knowledge","unobserved alternative"]},
 engineAdapter:{contextKey:"kierkegaard",operation:"decision_map",packetVersion:"meaning/1.2"}
});
export const HEGEL_NO_FIT_V21=finalize({
 version:CONTENT_VERSION,id:"catalogue:hegel:whole-v1",versionHash:"hegel-preface-unverified-2026-11-15",
 source:{author:"G. W. F. Hegel",work:"Phenomenology of Spirit, Preface (translation varies)",
 quote:"The true is the whole.",locator:"Preface, exact passage/translation verification pending",
 reviewState:"catalogue_only",reviewSignoff:null},
 editorialState:"research_only",editorialSignoff:null,route:"no_fit",
 gameCompatibility:six(Object.fromEntries(GAME_IDS.map(id=>[id,decision(false,
  NO_FIT_REJECTIONS[id],[])]))),
 noFitReason:"The quote's claim about a mediated and developing whole cannot be faithfully reduced to available game choices."
});
export const RESEARCH_FIXTURES_V21=Object.freeze([DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21]);
