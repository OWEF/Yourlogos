// All numerical inputs use discrete units declared by the scenario.
const natural=n=>Number.isSafeInteger(n)&&n>=0;
const unique=items=>new Set(items).size===items.length;
const declined=reason=>({version:"reasoning/1.1",status:"unsupported",classification:"unsupported",reason});

export function mechanismFit(context,mechanism=context?.mechanism){
 if(!context?.source?.url || !context.quote || !context.author || !context.relation || !context.limit ||
    !context.operations?.includes(mechanism))return {status:"unsupported",reason:"Missing source or mechanism warrant."};
 if(mechanism!==context.mechanism)return {status:"unsupported",reason:"Scenario model does not supply this mechanism."};
 const s=context.model;
 const allowedOps={tradeoff:["conversion","complementarity","scarcity"],decision_map:["agency","information","path_dependence"]};
 if(!allowedOps[mechanism]?.includes(context.operation))return {status:"unsupported",reason:"Context has no supported structural operation."};
 if(mechanism==="tradeoff"){
  if(!Array.isArray(s?.choices) || !s.choices.length || !Array.isArray(s.resources) || !s.resources.length || s.choices.some(c=>!c)||s.resources.some(r=>!r)||!unique(s.choices.map(c=>c.id)) || !unique(s.resources.map(r=>r.id)) ||
     !s.choices.every(c=>c&&natural(c.max)&&c.max>0&&c.cost?.length===s.resources.length&&c.cost.every(natural)&&c.cost.some(Boolean)) ||
     !s.resources.every(r=>r&&natural(r.min)&&natural(r.max)&&r.min<=r.max&&["exact","cap"].includes(r.type)&&s.choices.some(c=>c.cost[s.resources.indexOf(r)]>0)) ||
     !s.resources.some((r,i)=>s.choices.filter(c=>c.cost[i]>0).length>=2 && s.choices.reduce((n,c)=>n+c.max*c.cost[i],0)>r.min))
    return {status:"unsupported",reason:"No valid shared scarcity constraint."};
  if(context.operation==="conversion"&&s.metric?.op!=="sum" || context.operation==="complementarity"&&
     (s.metric?.op!=="minimum" || s.metric.weights?.filter(w=>w>0).length<2))return {status:"unsupported",reason:"Scenario lacks the required cost or joint-output relation."};
  if(s.metric && (!["sum","minimum"].includes(s.metric.op)||s.metric.weights?.length!==s.choices.length||!s.metric.weights.every(natural)||!s.metric.weights.some(Boolean)))return {status:"unsupported",reason:"Invalid consequence measure."};
 }else if(mechanism==="decision_map"){
  if(!s?.nodes || !Object.hasOwn(s.nodes,s.start) || !Object.values(s.nodes).every(n=>n&&Array.isArray(n.options)&&n.options.length>0&&n.options.every(o=>o&&typeof o.id==="string"&&typeof o.label==="string"&&["requires","closes","reveal"].every(k=>o[k]===undefined||Array.isArray(o[k])&&o[k].every(v=>typeof v==="string")))&&unique(n.options.map(o=>o.id))&&n.options.every(o=>o.next===null||Object.hasOwn(s.nodes,o.next))))return {status:"unsupported",reason:"Incomplete decision structure."};
  const seen=new Set(),open=new Set();
  function acyclic(id){
   if(id===null||seen.has(id))return true;
   if(open.has(id))return false;
   open.add(id);
   if(!s.nodes[id].options.every(o=>acyclic(o.next)))return false;
   open.delete(id);seen.add(id);return true;
  }
  if(!acyclic(s.start)||![...seen].some(id=>s.nodes[id].options.length>1))return {status:"unsupported",reason:"A finite branching route is required."};
  if(context.operation==="information" && !Object.values(s.nodes).some(n=>n.options.some(o=>o.reveal?.length)))return {status:"unsupported",reason:"No change in available evidence."};
 }else return {status:"unsupported",reason:"No supported reasoning operation."};
 return {status:context.assumptions?.length?"conditional":"applicable",assumptions:context.assumptions||[]};
}

export function allocationFacts(model,amounts,budgets){
 if(!Array.isArray(amounts)||amounts.length!==model.choices.length||!Array.isArray(budgets)||budgets.length!==model.resources.length||
    !Array.from(amounts).every((n,i)=>natural(n)&&n<=model.choices[i].max)||
    !Array.from(budgets).every((n,i)=>natural(n)&&n>=model.resources[i].min&&n<=model.resources[i].max)) return null;
 const spent=budgets.map((_,i)=>amounts.reduce((n,q,j)=>n+q*model.choices[j].cost[i],0));
 const slack=budgets.map((n,i)=>n-spent[i]);
 if(slack.some((n,i)=>n<0 || model.resources[i].type==="exact"&&n!==0))return null;
 const metric=model.metric;
 const components=metric?amounts.map((n,i)=>n*metric.weights[i]).filter((_,i)=>metric.weights[i]>0):[];
 return {spent,slack,measure:metric?(metric.op==="minimum"?Math.min(...components):components.reduce((a,b)=>a+b,0)):null};
}

export function tradeoffStructure(model,input){
 const current=allocationFacts(model,input?.amounts,input?.budgets);
 if(!current)return null;
 const alternatives=[];
 // Compare one additional choice with either spare capacity or one unit
 // released elsewhere. Never treat an infeasible alternative as available.
 for(let add=0;add<model.choices.length;add++)for(let remove=-1;remove<model.choices.length;remove++){
  if(remove===add)continue;
  const next=input.amounts.slice();next[add]++;if(remove>=0)next[remove]--;
  const fact=allocationFacts(model,next,input.budgets);
  if(fact)alternatives.push({add,remove,amounts:next,measure:fact.measure,delta:fact.measure===null?null:fact.measure-current.measure});
 }
 return {...current,amounts:[...input.amounts],budgets:[...input.budgets],alternatives};
}

export function decisionStructure(model,path){
 if(!Array.isArray(path))return null;
 let at=model.start;
 const commitments={},revisions=[];
 const known=new Set(model.initial||[]),locked=new Set(),steps=[],visited=new Set();
 for(const id of path){
  if(at===null||!Object.hasOwn(model.nodes,at)||visited.has(at))return null;
  visited.add(at);
  const node=model.nodes[at];
  const available=node.options.filter(o=>(o.requires||[]).every(k=>known.has(k))&&!locked.has(o.id));
  const option=available.find(o=>o.id===id);
  if(!option)return null;
  steps.push({node:at,choice:id,label:option.label,before:[...known],revealed:option.reveal||[],
    alternatives:available.filter(o=>o!==option).map(o=>o.label),closed:option.closes||[]});
  for(const [field,value] of Object.entries(option.sets||{})){
   if(Object.hasOwn(commitments,field)&&commitments[field]!==value)revisions.push({field,from:commitments[field],to:value});
   commitments[field]=value;
  }
  for(const k of option.reveal||[])known.add(k);
  for(const k of option.closes||[])locked.add(k);
  at=option.next;
 }
 if(at!==null&&visited.has(at))return null;
 const available=at===null?[]:model.nodes[at].options.filter(o=>(o.requires||[]).every(k=>known.has(k))&&!locked.has(o.id));
 return {steps,commitments,revisions,known:[...known],locked:[...locked],at,available};
}

export function evaluateKernel(context,input){
 const fit=mechanismFit(context);
 if(fit.status==="unsupported")return declined(fit.reason);
 const allocation=context.mechanism==="tradeoff";
 const structure=allocation?tradeoffStructure(context.model,input):decisionStructure(context.model,input?.path);
 if(!structure || !allocation&&(structure.at!==null||!structure.steps.length))return declined("The choices are incomplete or incompatible with this scenario.");
 let observed,discovery,condition,headline,question=context.question;
 if(allocation){
  const m=context.model,unit=m.metric?.unit;
  const named=(n,c)=>n+" "+(n===1&&c.singular?c.singular:c.label);
  const measured=n=>n+" "+(n===1&&m.metric?.singular?m.metric.singular:unit);
  const amounts=m.choices.map((c,i)=>named(input.amounts[i],c));
  observed="You chose "+(amounts.length>1?amounts.slice(0,-1).join(", ")+" and "+amounts.at(-1):amounts[0])+".";
  const better=structure.alternatives.reduce((best,a)=>a.delta>0&&(!best||a.delta>best.delta)?a:best,null);
  const next=(m.metric?.op==="minimum"&&better)||structure.alternatives.find(a=>a.remove===-1)||structure.alternatives[0];
  if(next){
   const gain=m.choices[next.add],released=m.choices[next.remove];
   const exchange=released?"exchanged one "+(released.singular||"unit of "+released.label)+" for one "+(gain.singular||"unit of "+gain.label):
    "added one "+(gain.singular||"unit of "+gain.label)+" from the unused budget";
   condition="If you "+exchange+", "+(unit?"the total would be "+measured(next.measure):"the arrangement would still fit")+".";
  }
  discovery=structure.measure===null?"The unused capacity is "+structure.slack.join(", ")+".":"That works out to "+measured(structure.measure)+" under the scenario’s assumptions.";
  if(m.metric?.op==="minimum")headline=better&&better.remove>=0?"One more "+(m.choices[better.add].singular||"unit here")+" could change what the whole group finishes.":
    "What can be finished depends on the least supplied step.";
  else if(m.metric?.op==="sum")headline=structure.measure?"What you chose would cost "+measured(structure.measure)+".":"An unused budget leaves its underlying cost unclaimed.";
  else headline=structure.slack.every(n=>n===0)?"Another claim would need room from somewhere.":"There is still room before another choice has to give way.";
  if(m.metric?.op==="minimum" && better)question=context.questions?.gain||question;
  if(m.metric?.op==="sum" && structure.measure===0)question=context.questions?.zero||question;
 }else{
  const lowerFirst=t=>t[0].toLowerCase()+t.slice(1);
  const actions=structure.steps.map(s=>lowerFirst(s.label));
  observed="You chose to "+actions.join(", then ")+".";

  const last=structure.steps.at(-1);

  condition=last.alternatives.length?"Another option still open then was to "+lowerFirst(last.alternatives[0])+".":null;
  const evidence=last.before.at(-1);
  discovery=evidence?"At that moment, "+lowerFirst(evidence)+".":"No further evidence had arrived.";
  if(last.revealed.length)discovery+=" Only afterward did you learn the result: "+lowerFirst(last.revealed.at(-1))+".";
  headline=structure.revisions.length?"You revised a commitment while it was still yours to change.":
    context.operation==="agency"&&context.control?context.control.action+" was your decision. The verdict belonged elsewhere.":
    last.before.length>(context.model.initial||[]).length?"You made the later choice with evidence the earlier one lacked.":
    last.revealed.length?"The consequence became visible after the choice.":"You could decide what to do while the claim itself stayed unsettled.";
  if(structure.revisions.length)question=context.questions?.revision||question;


 }
 const claims=[{classification:"necessary",text:observed,basis:"validated selections"},
   {classification:fit.assumptions.length?"conditional":"necessary",text:discovery,basis:"scenario model",assumptions:fit.assumptions},
   ...(condition?[{classification:"conditional",text:condition,basis:"feasible alternative",assumptions:[...fit.assumptions,"The alternative is chosen."]}]:[]),
   {classification:"unsupported",text:context.limit,basis:"outside scenario"}];
 claims.push({role:"discovery",classification:fit.assumptions.length?"conditional":"necessary",text:headline,basis:"evaluated structure",assumptions:fit.assumptions});
 claims.push({role:"interpretation",classification:"conditional",text:context.relation,basis:context.source.url,assumptions:[...fit.assumptions,"The curated analogy is accepted."]});
 return {version:"reasoning/1.1",status:"ready",quote:{id:context.id,text:context.quote,author:context.author,work:context.source.work},
  source:context.source,mechanism:context.mechanism,fit,structure,claims,distinction:context.distinction,
  headline,relation:context.relation,question,limitations:[context.limit],selections:allocation?{amounts:structure.amounts,budgets:structure.budgets}:{path:[...input.path]}};
}

// Translate the established pilots' existing configuration rather than copying
// their case-specific motive, historical, or quotation-return rules.
export function pilotStructure(spec,result,input){
 const t=spec.family==="tradeoff";
 let model,selections;
 if(t){
  model={resources:[{id:"evening",min:6,max:6,type:"exact"}],choices:spec.categories.map((label,i)=>({id:i,label,max:6,cost:[1]}))};
  selections={amounts:input.ticks,budgets:[6]};
 }else{
  const nodes={};
  function expand(i,prior,name){
   const stage=spec.steps[i];
   const options=Array.isArray(stage.options)?stage.options:stage.options[prior];
   nodes[name]={prompt:stage.prompt,options:options.map(o=>{
    const next=i+1<spec.steps.length?name+"/"+o.id:null;
    if(next)expand(i+1,o.id,next);
    return {id:o.id,label:o.label,next,reveal:i===1?[o.label]:[]};
   })};
  }
  expand(0,null,"start");
  model={start:"start",nodes};selections={path:spec.steps.map(step=>input[step.key])};
 }
 const source=result.sourceReferences.find(s=>s.url?.startsWith("http"))||result.sourceReferences[0];
 return evaluateKernel({id:spec.id,quote:result.quote.text,author:spec.author,source:{...source,work:result.quote.work},
  model,operation:t?"scarcity":"path_dependence",operations:[spec.family],mechanism:spec.family,assumptions:["Within this imagined scenario."],relation:result.sourceRelation,
  distinction:result.sourceRelation,question:"Which condition makes this reading possible?",limit:spec.guard},selections);
}

// Fail closed at the expression boundary if claim status or its provenance
// has been lost while transporting a packet. Prose is emitted from claims.
export function validateKernelPacket(packet){
 if(packet?.version!=="reasoning/1.1"||packet.status!=="ready"||!packet.source?.url||!packet.quote?.text||
   !Array.isArray(packet.claims)||!packet.claims.length||!packet.question)return false;
 if(!packet.claims.every(c=>c&&["necessary","conditional","unsupported"].includes(c.classification)&&c.basis&&
   typeof c.text==="string"&&c.text.length&&(c.classification!=="conditional"||Array.isArray(c.assumptions)&&c.assumptions.length>0)))return false;
 const backed=(role,text)=>packet.claims.some(c=>c.role===role&&c.classification!=="unsupported"&&c.text===text);
 return backed("discovery",packet.headline)&&backed("interpretation",packet.relation)&&
   packet.claims.some(c=>c.basis==="validated selections"&&c.classification==="necessary");
}
