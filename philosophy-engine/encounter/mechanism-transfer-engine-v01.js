/**
 * CZ-116 Mechanism transfer test harness.
 *
 * Reuses the already-tested 3-hour zero-sum allocator and invokes original
 * Seneca/Woolf reasoners as reference controls. New candidates are interpreted
 * using one parameterized mechanism kernel and declarative source-linked cases.
 * What transfers is explicitly labelled; no source or generality claim implied.
 */
import {reallocateEvening, reasonSeneca, reasonWoolf} from "./experience-reasoners-v01.js";
import {getMechanismCase,optionsFor,sourceTrace,candidateFitAudit} from "./mechanism-transfer-cases-v01.js";
import {ATLAS_PILOT_V01} from "../context-atlas/pilot-records-v01.js";

export {reallocateEvening};
const validHalfHour=x=>Number.isInteger(x)&&x>=0&&x<=6;
export const MOTIVATIONS=Object.freeze(["chosen","expected","necessary"]);
const uses=(input)=>Array.isArray(input?.ticks)&&input.ticks.length===3&&input.ticks.every(validHalfHour)&&
 input.ticks.reduce((a,b)=>a+b,0)===6;

function quoteDetails(spec){
 if(spec.quote){
   return {id:spec.quoteId,text:spec.quote,author:spec.author,work:spec.citationSource};
 }
 const record=ATLAS_PILOT_V01.find(r=>r.id===spec.quoteId);
 if(!record||record.quote.author!==spec.author)throw new Error("Control identity mismatch");
 return {id:spec.quoteId,text:record.quote.text,author:record.quote.author,work:record.sourcePassage.work};
}
function assertExperimental(spec){
 if(!["baseline_control","conditional_transfer","stress_test_ui_only"].includes(spec.role))
  throw new Error("Mechanism was deliberately rejected or not curated for transfer");
}
function common(spec,inputs,rules){
 return {
  quote:quoteDetails(spec),
  caseId:spec.id,
  role:spec.role,
  mechanism:spec.family,
  semanticModel:spec.semanticModel||null,
  scenario:spec.scenario||spec.startingPoint,
  context:spec.context,
  sourceRelation:spec.sourceRelation,
  sourceReferences:sourceTrace(spec.id),
  rules,
  guard:spec.guard,
  provisional:true,
  productionEligible:false,
  input:inputs,
  warning:spec.role==="stress_test_ui_only"?
   "The three-fork UI can illustrate this temporal question, but the enabling-condition decision reasoner has NOT transferred. Future outcomes are not determined.":
   spec.role==="conditional_transfer"?
   "Research transfer hypothesis only. Mechanism fit and interpretation need independent editorial validation.":
   "Existing quotation-specific prototype used as a control."
 };
}
export function evaluateTradeoffCase(id,input){
 const spec=getMechanismCase(id);
 assertExperimental(spec);
 if(spec.family!=="tradeoff")throw new RangeError("Not a Trade-Off case");
 if(!uses(input)||!MOTIVATIONS.includes(input.motivation))throw new TypeError("Exactly 3 free hours in half-hour steps and a valid influence are required");
 const hours=input.ticks.map(n=>n/2),max=Math.max(...hours),leaders=hours.filter(n=>n===max).length;
 const omitted=hours.map((n,i)=>n===0?spec.categories[i]:null).filter(Boolean);
 const observation=spec.categories.map((name,i)=>name+": "+hours[i]+"h").join(" · ");
 const fields={
  mechanism:"tradeoff",
  budget:3,
  hours,
  observation,
  pattern:max===3?"one_activity":leaders>1?"balanced_maxima":"uneven_allocation",
  alternativesOmitted:omitted,
  influence:input.motivation,
  conditionalFiveWeekdays:spec.timeFrame==="hypothetical_repeated_five_weekdays"?
   hours.map(n=>n*5):null
 };
 const sourceRelation=spec.timeFrame==="hypothetical_repeated_five_weekdays"?
  spec.sourceRelation+" Five identical hypothetical evenings would give "+
  fields.conditionalFiveWeekdays.map((h,i)=>spec.categories[i]+" "+h+"h").join(", ")+
  " across a five-day week; the user's real routine is unknown.":
  spec.sourceRelation+" This is a *single* imagined evening, not an inference about an actual life.";
 const rules=["fixed_budget:180_minutes","half_hour_zero_sum","observed_pattern:"+fields.pattern,
   "self_declared_motivation:"+input.motivation,"no_moral_optimization",
   spec.timeFrame==="hypothetical_repeated_five_weekdays"?"conditional_repetition_not_empirical":"single_evening_no_lifetime_inference"];
 const base=common(spec,{ticks:[...input.ticks],motivation:input.motivation},rules);
 const reference=spec.role==="baseline_control"?reasonSeneca(input):null;
 return {...base,fields,interpretation:sourceRelation,referenceInsight:reference?.insight||null,
  semanticTransfer:spec.role==="baseline_control"?"reference_quote_specific_adapter":"conditional_constraint_kernel_transfer"};
}
export function reachableDecisionRoutes(caseId){
 const spec=getMechanismCase(caseId);
 assertExperimental(spec);
 if(spec.family!=="decision_map")throw new RangeError("Not a Decision Map case");
 const paths=[];
 for(const first of optionsFor(spec,"resource",null)){
  for(const second of optionsFor(spec,"barrier",first.id)){
   for(const third of optionsFor(spec,"action",second.id)){
    paths.push({resource:first.id,barrier:second.id,action:third.id});
   }
  }
 }
 return paths;
}
export function evaluateDecisionCase(id,input){
 const spec=getMechanismCase(id);
 assertExperimental(spec);
 if(spec.family!=="decision_map")throw new RangeError("Not a Decision Map case");
 const required=["resource","barrier","action"];
 if(!input||typeof input!=="object"||required.some(k=>typeof input[k]!=="string"))
  throw new TypeError("All three explicitly chosen decision forks are required");
 const selected=[];
 let predecessor=null;
 for(const key of required){
  const choices=optionsFor(spec,key,predecessor);
  const matching=choices.find(choice=>choice.id===input[key]);
  if(!matching)throw new RangeError("Incompatible choice "+key+" = "+input[key]+" (previous: "+predecessor+")");
  selected.push({key,id:matching.id,label:matching.label,detail:matching.detail});
  predecessor=matching.id;
 }
 const [improvement,obstacle,response]=selected;
 const rules=["first_fork:"+improvement.id,"second_fork_depends_on_first:"+obstacle.id,
   "third_fork_depends_on_second:"+response.id,"no_deterministic_future"];
 const base=common(spec,{...input},rules);
 const reference=spec.role==="baseline_control"?reasonWoolf(input):null;
 const temporal=spec.semanticModel==="temporal_information_asymmetry";
 const result={
  ...base,
  selected,
  observation:selected.map(n=>n.label).join(" → "),
  interpretation:temporal?
   "At the time of the first step, the later uncertainty was not known. Looking back may change the account of that decision, but this simulation cannot reveal what truly would have happened otherwise.":
   improvement.label+" changes one condition. "+obstacle.label+" still limits the path. "+response.label+
   " is a possible response—not a guarantee of independence or achievement.",
  referenceInsight:reference?.insight||null,
  semanticTransfer:temporal?"UI_only_temporal_asymmetry_needs_new_kernel":
   spec.role==="baseline_control"?"reference_quote_specific_adapter":"conditional_enabling_condition_kernel_transfer",
  futureKnownAtChoice:false,
  outcomePredicted:false
 };
 return result;
}
export function evaluateTransferCase(id,input){
 const spec=getMechanismCase(id);
 if(spec.role==="reject_incompatible")return {
  caseId:id,blocked:true,mechanism:spec.requestedMechanism,reason:spec.guard,
  quote:quoteDetails(spec),sourceReferences:sourceTrace(id),productionEligible:false
 };
 return spec.family==="tradeoff"?evaluateTradeoffCase(id,input):evaluateDecisionCase(id,input);
}
export function fitMatrix(){
 return candidateFitAudit();
}
