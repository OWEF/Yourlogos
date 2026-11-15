/**
 * CZ-130 / independently reviewed RESEARCH EDITORIAL ADMISSION v2.1.2.
 *
 * A content hash is a byte/version identifier, NOT editorial authority.
 * Source-attached interpretations, prompts, hypothetical consequences and
 * no-fit rationales are admitted only when identical to code-reviewed
 * provisional editorial assertions for the trusted source/model. The limited
 * literal research annotations below are EDITORIAL DATA, never philosopher-
 * dependent engine routing. This is not scholarly verification or publication.
 *
 * Unregistered sources/interpretations abstain for independent source review.
 */
import {semanticCases} from "../encounter/semantic-cases-v12.js";
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=(field,reason)=>({ok:false,field,reason});
const ok={ok:true};
const review=(actual,expected,field)=>eq(actual,expected)?ok:
 fail(field,"Value differs from the trusted, source-linked provisional editorial assertion; independent review is required.");
const fixed={
 "research:dillard:time-v1":{
  context:semanticCases.dillard,
  locator:"The Writing Life, scheduling passage; exact original passage review pending",
  dilemma:"You have three hours this evening. How will you share six half-hour slots among writing, messages and rest?",
  argument:{
   thesis:"Ordinary decisions about time can accumulate into an imagined pattern across repeated evenings.",
   accessibleInsight:"A life is not simply decided once; repeated days matter.",
   originalArgument:"Dillard's reflection concerns the repeated shape of ordinary days, not a numerical ranking of activities.",
   uncertaintyLimit:"Five evenings are hypothetical, not your observed behavior; we cannot know your motives or rank the value of rest, writing or relationships."
  },
  scenario:{
   id:"finite-evening-v1",
   variables:{unit:"half-hour",availableHours:3,period:"evening"},
   consequences:{warrant:"The chosen arrangement adds up across five imagined repeated evenings; an unchosen outcome is not inferred.",unknowns:["what happens in real life","what a reader truly values"]}
  },
  emotion:{enabled:true,allowedStrategies:["contemplative","warm","playful"],groundedTensions:["time allocation","hypothetical repetition"]},
  adapter:{contextKey:"dillard",operation:"tradeoff",packetVersion:"meaning/1.2"}
 },
 "research:kierkegaard:future-v1":{
  context:semanticCases.kierkegaard,
  locator:"Journal JJ:167; shortened quotation wording review pending",
  dilemma:"You can take a new job or stay. What can you decide before knowing how it will feel later?",
  argument:{
   thesis:"Choices must be lived forward; later interpretation does not reveal the path not chosen.",
   accessibleInsight:"You must act without a view of the whole future.",
   originalArgument:"Reflective understanding follows lived experience and never grants the standpoint of a completed alternative life.",
   uncertaintyLimit:"Developments are explicitly authored possibilities, not forecasts or hidden insight into a reader's future."
  },
  scenario:{
   id:"forward-choice-v1",
   variables:{domain:"imagined job choice",futureKnown:false},
   consequences:{warrant:"Later imagined evidence informs the chosen path but does not establish the unchosen future.",unknowns:["actual results","unchosen job future"]}
  },
  emotion:{enabled:true,allowedStrategies:["contemplative","provocative"],groundedTensions:["acting ahead of knowledge","unobserved alternative"]},
  adapter:{contextKey:"kierkegaard",operation:"decision_map",packetVersion:"meaning/1.2"}
 }
};
const noFitEvidence=Object.freeze({
 trade_off:"The Preface's claim about mediated totality supplies no finite rival-resource allocation or measured competing outcomes.",
 decision_map:"This proposition supplies no source-authored chain of a person's decisions, actions and dependent consequences.",
 token_studio:"No source-grounded divisible resource, quantitative common unit or token allocation represents this philosophical claim.",
 balance_of_values:"The claim supplies no defensible commensurable metric for ranking separate personal values against each other.",
 swipe_decision:"No supported first personal decision, externally authored development and later user response arise from this proposition.",
 future_reveal:"The passage provides no hypothetical timeline with defined milestones; inventing a future would misstate its argument."
});
const noFitReference=Object.freeze({
 id:"catalogue:hegel:whole-v1",
 source:{
  author:"G. W. F. Hegel",work:"Phenomenology of Spirit, Preface (translation varies)",
  quote:"The true is the whole.",
  locator:"Preface, exact passage/translation verification pending"
 },
 reason:"The quote's claim about a mediated and developing whole cannot be faithfully reduced to available game choices.",
 rejection:noFitEvidence
});
function sourceParity(record,context,locator){
 const s=record.source,ref=context?.source;
 if(!ref||s?.author!==context.author||s?.work!==ref.work||
    s?.quote!==context.quote||s?.referenceUrl!==ref.url||
    s?.locator!==locator)
  return fail("source","Author, work, quotation, locator and source URL must agree with one trusted source identity.");
 return ok;
}
function compareFields(record,fields){
 for(const [field,expected] of fields){
  const keys=field.split("."),actual=keys.reduce((x,k)=>x?.[k],record);
  const result=review(actual,expected,field);
  if(!result.ok)return result;
 }
 return ok;
}
function fixedRecord(record,entry){
 const context=entry.context;
 const sp=sourceParity(record,context,entry.locator);
 if(!sp.ok)return sp;
 const args=entry.argument;
 return compareFields(record,[
  ["dilemma",entry.dilemma],
  ["argument",{
   thesis:args.thesis,sourceWarrant:context.semantic.admission.centralClaim,
   accessibleInsight:args.accessibleInsight,originalArgument:args.originalArgument,
   uncertaintyLimit:args.uncertaintyLimit
  }],
  ["scenario.id",entry.scenario.id],
  ["scenario.variables",entry.scenario.variables],
  ["scenario.consequences",entry.scenario.consequences],
  ["emotionalEligibility",entry.emotion],
  ["engineAdapter",entry.adapter]
 ]);
}
function generatedResearchRecord(record,context){
 const source=context.source,ad=context.semantic?.admission,m=context.model;
 if(!ad||context.mechanism!=="tradeoff"||!Array.isArray(m?.resources)||m.resources.length!==1)
  return fail("source","The proposed research source has no admitted, supported frozen model.");
 const s=sourceParity(record,context,"Research edition / exact passage review pending");
 if(!s.ok)return s;
 const budget=context.initial?.budgets?.[0]??m.initial?.budgets?.[0];
 const result=compareFields(record,[
  ["dilemma",context.scenario],
  ["argument",{
   thesis:ad.centralClaim,sourceWarrant:ad.centralClaim,
   accessibleInsight:context.semantic.selection?.purpose||context.semantic.relation,
   originalArgument:context.semantic.relation,
   uncertaintyLimit:context.semantic.boundary
  }],
  ["scenario.id","reviewed-model:"+source.url],
  ["scenario.variables",{
   resource:m.resources[0].id,unit:m.resources[0].label,
   metric:m.metric?.unit||"unscored"
  }],
  ["scenario.constraints",{
   kind:"finite_budget",capacity:budget,capacityMode:m.resources[0].type,
   costs:m.choices.map(c=>c.cost[0]),unitHours:m.unitHours??null,
   repetitions:context.initial?.repetitions??null
  }],
  ["scenario.consequences",{
   warrant:ad.scenarioBridge,unknowns:[context.semantic.boundary]
  }],
  ["emotionalEligibility",{
   enabled:true,allowedStrategies:["contemplative"],groundedTensions:[context.semantic.relation]
  }],
  ["engineAdapter",{packetVersion:"meaning/1.2",operation:context.operation}]
 ]);
 return result;
}
function noFitRecord(record,ids){
 const s=record?.source;
 if(record.id!==noFitReference.id||!s||!eq({
  author:s.author,work:s.work,quote:s.quote,locator:s.locator
 },noFitReference.source))
  return fail("noFit.source","No-fit passage identity lacks an admitted, independently reviewable source record.");
 if(record.source.reviewState!=="catalogue_only")
  return fail("noFit.source.reviewState","Unverified no-fit text remains catalogue-only.");
 if(record.noFitReason!==noFitReference.reason)
  return fail("noFitReason","No-fit conclusion is not the approved, source-specific interpretation.");
 if(!Array.isArray(record.gameCompatibility)||record.gameCompatibility.length!==ids.length)
  return fail("gameCompatibility","Six source-and-capability-specific rejection attestations are required.");
 for(const id of ids){
  const g=record.gameCompatibility.find(x=>x?.id===id);
  if(!g||g.eligible!==false||g.evidenceOrRejection!==noFitReference.rejection[id]||
     !eq(g.requirements,[]))
   return fail("gameCompatibility."+id,"Free-text rejection length cannot replace an independently reviewed no-fit assertion.");
 }
 return ok;
}
export function trustedEditorialAdmissionV212(record,gameIds){
 if(record?.route==="no_fit")return noFitRecord(record,gameIds);
 const fixedEntry=fixed[record?.id];
 if(fixedEntry)return fixedRecord(record,fixedEntry);
 const match=Object.values(semanticCases).filter(ctx=>
  ctx?.source?.url&&record?.id==="research:source:"+ctx.source.url&&
  record?.source?.referenceUrl===ctx.source.url&&
  ctx.semantic?.admission?.reviewStatus==="curated_provisional");
 if(match.length!==1)
  return fail("source","No trusted, source-linked research assertion exists for this interpretation.");
 return generatedResearchRecord(record,match[0]);
}
