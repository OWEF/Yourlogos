/**
 * Source-to-content research intake for already admitted, frozen meaning/1.2
 * contexts. Uses source identity and model shapes; NEVER author-name routing.
 * New / unverified contexts abstain until editorial admission into a trusted
 * source-context registry. Does not mutate frozen v2.0 modules or publish data.
 */
import {semanticCases} from "../encounter/semantic-cases-v12.js";
import {CONTENT_VERSION,GAME_IDS,contentFingerprintV21,validateContentRecordV21}
 from "./content-contract-v21.js";
import {assessAllSixPeerGames} from "./content-capabilities-v211.js";
export const INTAKE_VERSION="source-to-content-research/2.1.1";
const reject=reason=>({status:"needs_source_review",reason});
export function researchContentFromTrustedContextV211(context){
 if(!Object.values(semanticCases).includes(context))
   return reject("The source context is not an unchanged, previously admitted frozen research source.");
 const a=context?.semantic?.admission,m=context?.model,s=context?.source;
 if(!a||a.reviewStatus!=="curated_provisional"||!a.sourceUrl||
    a.sourceUrl!==s?.url||!a.centralClaim||!a.scenarioBridge||
    !Array.isArray(a.allowedClaimKinds)||!a.allowedClaimKinds.length||
    !Array.isArray(context?.assumptions)||!context.assumptions.length||
    !Array.isArray(m?.choices)||!m.choices.length)
   return reject("Source identity, central warrant, claims or authored context are incomplete.");
 if(context.mechanism!=="tradeoff"||!Array.isArray(m.resources)||m.resources.length!==1||
    !["exact","cap"].includes(m.resources[0].type))
   return reject("This versioned intake supports one validated finite resource, not other unproven mechanisms.");
 const budget=context.initial?.budgets?.[0]??m.initial?.budgets?.[0];
 if(!Number.isSafeInteger(budget)||budget<m.resources[0].min||budget>m.resources[0].max||
    !m.choices.every(c=>Array.isArray(c.cost)&&c.cost.length===1&&
      Number.isSafeInteger(c.cost[0])&&c.cost[0]>0))
   return reject("A trusted, feasible one-resource budget and choice costs are required.");
 const r={
  version:CONTENT_VERSION,
  id:"research:source:"+s.url,
  source:{author:context.author,work:s.work,quote:context.quote,
   locator:"Research edition / exact passage review pending",referenceUrl:s.url,
   reviewState:"curated_provisional",reviewSignoff:null,verifiedSourceUrl:null,
   translationEdition:"Independent primary-edition review pending"},
  editorialState:"research_only",editorialSignoff:null,route:"selector_pending",
  dilemma:context.scenario,
  argument:{thesis:a.centralClaim,sourceWarrant:a.centralClaim,
   accessibleInsight:context.semantic?.selection?.purpose||context.semantic?.relation,
   originalArgument:context.semantic?.relation,uncertaintyLimit:context.semantic?.boundary},
  scenario:{id:"reviewed-model:"+s.url,
   variables:{resource:m.resources[0].id,unit:m.resources[0].label,metric:m.metric?.unit||"unscored"},
   choices:m.choices.map(c=>({id:c.id,label:c.label})),
   constraints:{kind:"finite_budget",capacity:budget,capacityMode:m.resources[0].type,
     costs:m.choices.map(c=>c.cost[0]),unitHours:m.unitHours??null,
     repetitions:context.initial?.repetitions??null},
   consequences:{warrant:a.scenarioBridge,unknowns:[context.semantic.boundary]}},
  emotionalEligibility:{enabled:true,allowedStrategies:["contemplative"],
   groundedTensions:[context.semantic.relation]},
  engineAdapter:{packetVersion:"meaning/1.2",operation:context.operation},
  gameCompatibility:[]
 };
 const results=assessAllSixPeerGames(r,GAME_IDS);
 r.gameCompatibility=results.map(({id,eligible,reason})=>({
  id,eligible,evidenceOrRejection:reason,
  requirements:eligible?["source-authorized-model","canonical-choice-parity"]:[]
 }));
 r.versionHash=contentFingerprintV21(r);
 const v=validateContentRecordV21(r);
 if(v.status!=="valid_research_record")
   return {status:"needs_source_review",reason:"The generated source contract is not admissible.",errors:v.errors};
 return {status:"ready",version:INTAKE_VERSION,record:r};
}
