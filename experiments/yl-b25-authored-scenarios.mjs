/**
 * CZ-128 B2.5 source-authored Value Balance variants.
 *
 * Two genuinely NEW source-authored hypothetical records are added:
 *  - Thoreau: twelve discretionary hours, no fixed eight-hour amount,
 *    an invented $15 net per extra hour rather than $20;
 *  - Dillard: ten half-hour slots over four hypothetical evenings,
 *    no monetary rate, with repetition rather than a conversion claim.
 *
 * Both use exact quotations ALREADY present in semanticSources-v12.
 * These are founder-provisional teaching records, not scholarly signoffs.
 */
import {createHash} from "node:crypto";
import {semanticSources}
 from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {constructScenario}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {B23_SOURCE_CONTRACTS}
 from "./yl-b23-founder-six-peer.mjs";
const isObject=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
export const stableB25=v=>Array.isArray(v)?"["+v.map(stableB25).join(",")+"]":
 isObject(v)?"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stableB25(v[k])).join(",")+"}":
 JSON.stringify(v);
export const fingerprintB25=v=>"sha256:"+
 createHash("sha256").update(stableB25(v)).digest("hex");
const model=(source,capacity,unit,first,second,metric,extras={})=>({
 resources:[{id:"fictional_discretionary_resource",label:unit,
  min:capacity,max:capacity,type:"exact"}],
 choices:[{id:first.id,label:first.label,readingLabel:first.label,
  singular:first.singular||first.label,cost:[1],max:capacity},
  {id:second.id,label:second.label,readingLabel:second.label,
   singular:second.singular||second.label,cost:[1],max:capacity}],
 unitLabel:unit,...(metric?{metric}:{}),...extras
});
function contract({id,source,capacity,unitName,model,scenario,editorial,initial,
 inputRepetitions=null}){
 const context=constructScenario(source,{id,scenario,model,initial,
  assumptions:[
   "All quantities and choices are invented for an educational thought experiment, not reported behaviour.",
   "Both choices use the same exact conserved resource; no revealed preference or moral rank follows.",
   ...(inputRepetitions!==null?
    ["Each imagined interval repeats the same allocation exactly "+inputRepetitions+" times."]:[])
  ]});
 if(context.status==="incompatible")throw Error("Invalid draft source context "+id);
 const info={
  recordId:id,version:"founder-provisional-scenario/2.5.0",
  gameId:"balance_of_values",meaningKind:source.semantic.selection.central[0],
  meaningModelVersion:"resource-allocation/2.5.0",
  source:{author:source.author,quote:source.quote,work:source.source.work,
   referenceUrl:source.source.url,reviewState:"founder_provisional"},
  scenario:{capacity,unitName,costs:[1,1],capacityMode:"exact",
   repetitions:inputRepetitions,choiceIds:model.choices.map(c=>c.id),
   invented:true,nonmoral:true},
  editorial,
  context,
  publicationAllowed:false,independentlyScholarlyApproved:false,
  editorialAuthority:"FOUNDER_POLICY_RESEARCH_ONLY"
 };
 return Object.freeze({...info,contentFingerprint:fingerprintB25(info)});
}
const inherited=B23_SOURCE_CONTRACTS[0];
const eight=contract({
 id:"b25:walden-eight-hour-cost",
 source:semanticSources.thoreau,capacity:8,unitName:"hours",
 model:inherited.context.model,
 scenario:inherited.context.scenario,initial:inherited.context.initial,
 editorial:{
  title:"The hours behind a price",
  situation:"imagined week",
  intro:"Eight invented hours; how much life might an optional purchase cost?",
  units:"hours",useLabels:["optional extra work","time kept for other uses"],
  lenses:[
   {id:"life_exchanged",label:"The hours exchanged",
    interpretation:"Every hour allocated to extra work has a corresponding cost in available life.",
    question:"What changes when a price is read as time from a finite life, not as a verdict on the thing?"},
   {id:"time_kept",label:"The possibilities kept",
    interpretation:"Hours not exchanged remain open to other uses whose worth this model cannot measure.",
    question:"Which possibilities remain open when an hour is kept, and why can no number rank all of them?"}
  ],
  qualification:"The wage and hours are invented; no purchase, virtue or real preference follows.",
  prompt:"Compare the time used and time kept. Nothing here decides which use is better."
 }
});
const twelve=contract({
 id:"b25:walden-twelve-hour-exchange",
 source:semanticSources.thoreau,capacity:12,unitName:"hours",
 model:model(semanticSources.thoreau,12,"fictional weekend hours",
  {id:"optional_paid_hours",label:"optional paid hours",singular:"hour of paid work"},
  {id:"free_hours",label:"hours reserved for other uses",singular:"hour kept"},
  {op:"sum",weights:[1,0],unit:"hypothetical paid hours",singular:"hypothetical paid hour"}),
 scenario:"Imagine twelve discretionary weekend hours. Extra voluntary work could be paid at an invented net rate of $15 per hour. The unworked hours remain available for other purposes.",
 initial:{amounts:[5,7],budgets:[12]},
 editorial:{
  title:"The price of a weekend",
  situation:"imagined weekend",
  intro:"Twelve discretionary hours; what does extra paid work leave available?",
  units:"hours",useLabels:["optional paid work","other possibilities"],
  lenses:[
   {id:"exchange",label:"Life given to an option",
    interpretation:"A hypothetical earning hour changes available time without proving a purchase worthwhile.",
    question:"If an extra shift opened a purchase option, what time would it also take away from this weekend?"},
   {id:"openness",label:"Time left uncommitted",
    interpretation:"Hours left outside paid work hold possibilities the invented pay rate cannot price.",
    question:"Which possible use of a free hour is absent from a wage calculation, even if the arithmetic is correct?"}
  ],
  qualification:"The twelve hours and $15 rate are fictional; neither preference nor virtue is established.",
  prompt:"A higher hypothetical wage changes money available, not the meaning of a life."
 }
});
const evenings=contract({
 id:"b25:dillard-four-fictional-evenings",
 source:semanticSources.dillard,capacity:10,unitName:"half-hour slots",
 model:model(semanticSources.dillard,10,"half-hour slots per evening",
  {id:"making",label:"time making a creative work",singular:"creative half-hour"},
  {id:"open",label:"unstructured time",singular:"open half-hour"},
  null,{unitHours:0.5,repetitionPeriod:"evening"}),
 scenario:"Imagine a fictional evening with ten half-hour slots. A reader can distribute them between an invented creative project and unstructured time. Consider the allocation repeated over four equally fictional evenings.",
 initial:{amounts:[4,6],budgets:[10],repetitions:4},
 inputRepetitions:4,
 editorial:{
  title:"How a pattern takes shape",
  situation:"imagined evening",
  intro:"Ten half-hour slots per evening, repeated four times. What does a pattern reveal?",
  units:"half-hour slots",
  useLabels:["making something","unstructured time"],
  lenses:[
   {id:"single_evening",label:"Tonight's small choice",
    interpretation:"One imagined evening shows a possible arrangement, not a diagnosis of your actual habits.",
    question:"What does one small evening choice reveal about a possible pattern without declaring who you are?"},
   {id:"repeated_pattern",label:"Four evenings together",
    interpretation:"Repeating the arrangement changes accumulated time while proving no habit will actually form.",
    question:"If this imagined pattern recurred, what would grow over four evenings, and what would remain unknown?"}
  ],
  qualification:"All four evenings are invented; neither a reader's habits nor an activity's moral rank is inferred.",
  prompt:"Repetition changes totals in a hypothetical schedule; it does not reveal the future."
 }
});
export const B25_BALANCE_CONTRACTS=Object.freeze([eight,twelve,evenings]);
const index=new Map(B25_BALANCE_CONTRACTS.map(c=>[c.recordId,c]));
export function inspectB25Contract(input){
 const key=typeof input==="string"?input:input?.recordId;
 const found=index.get(key);
 if(!found)return null;
 if(typeof input==="string")return found;
 return stableB25(found)===stableB25(input)&&
  found.contentFingerprint===fingerprintB25(Object.fromEntries(
   Object.entries(found).filter(([k])=>k!=="contentFingerprint")))?
   found:null;
}
