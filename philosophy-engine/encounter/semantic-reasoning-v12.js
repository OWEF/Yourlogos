import {mechanismFit,tradeoffStructure,decisionStructure} from './reasoning-kernel-v11.js';
import {traceSourcePassage} from './source-passage-witness-v19.js';
// Semantic consequences are data, never callbacks or quote-ID dispatch.
const reject=reason=>({version:'meaning/1.2',status:'incompatible',reason});
const stable=x=>JSON.stringify(Object.entries(x||{}).sort(([a],[b])=>a.localeCompare(b)));
export function constructScenario(source,scenario){
 if(!source?.quote||!source.source?.url||!source.semantic?.relation||!source.semantic?.concepts?.length)return reject('A sourced relation and concepts are required.');
 return {...source,...scenario,semantic:source.semantic,source:source.source,quote:source.quote};
}
export function validateTension(context){
 const fit=mechanismFit(context);
 if(fit.status==='unsupported')return reject(fit.reason);
 const s=context.semantic,m=context.model;
 if(!s?.relation||!s.concepts?.length||!s.boundary)return reject('Missing semantic warrant or interpretive boundary.');
 if(context.mechanism==='tradeoff'&&m.comparison){
  const comparison=m.comparison;
  if(comparison.kind!=='switching_generalists'||Object.hasOwn(comparison,'baselineMeasure')||
   !Number.isSafeInteger(comparison.staffing)||comparison.staffing<1||
   !Number.isSafeInteger(comparison.minutesPerWorker)||comparison.minutesPerWorker<1||
   !Number.isSafeInteger(comparison.switchingMinutesPerWorker)||comparison.switchingMinutesPerWorker<0||
   comparison.switchingMinutesPerWorker>=comparison.minutesPerWorker||
   !Number.isSafeInteger(comparison.minutesPerUnit)||comparison.minutesPerUnit<1||
   !Number.isSafeInteger(comparison.staffing*comparison.minutesPerWorker)||
   !m.resources?.some(r=>r.id===comparison.resourceId&&r.type==='exact'&&r.min===comparison.staffing&&r.max===comparison.staffing)||
   m.metric?.op!=='minimum'||typeof comparison.explanation!=='string'||comparison.explanation.length<40)
   return reject('The hypothetical switching-team comparator is incomplete or lacks a comparable shared budget.');
 }
 const a=s.admission;
 if(!a||a.sourceUrl!==context.source?.url||a.sourceWork!==context.source?.work||
    a.mechanism!==context.mechanism||a.operation!==context.operation||
    !a.centralClaim?.trim()||!a.scenarioBridge?.trim()||
    !Array.isArray(a.allowedClaimKinds)||!a.allowedClaimKinds.length||
    !Array.isArray(a.requiredPremiseIds)||!a.requiredPremiseIds.length||
    !['curated_provisional','human_approved'].includes(a.reviewStatus)||
    !Array.isArray(context.premiseIds)||
    !a.requiredPremiseIds.every(x=>context.premiseIds.includes(x))||
    !Array.isArray(context.assumptions)||!context.assumptions.length)
   return reject('Source-to-scenario editorial admission or required premises are missing or inconsistent.');
 if(context.mechanism==='decision_map'){
  if(m.agency&&m.variables?.[m.agency.externalVariable]?.owner!=='external')return reject('Agency requires a declared externally owned outcome.');
  for(const node of Object.values(m.nodes)){
   if(node.options.some(o=>!o.action && !o.label))return reject('An observable action is required.');
   for(const o of node.options){
    for(const [field,value] of Object.entries(o.effects||{})){
     const variable=m.variables?.[field];
     if(!variable||variable.owner!=='self')return reject('A chosen action cannot assign an external or undeclared variable.');
     if(variable.kind==='event'&&value!==true)return reject('An occurred event cannot be erased by a later action.');
    }
   }
   for(const o of node.options)for(const [field,value] of Object.entries(o.commitments||{})){
    if(!m.commitmentDomains?.[field]?.states?.includes(value))return reject('Commitment state lacks a declared semantic domain.');
   }
  }
 }
 const sourceTrace=traceSourcePassage(a,context.quote);
 if(sourceTrace.status==='mismatch')return reject(sourceTrace.reason);
 return {status:'supported',fit,sourceTrace};
}

/**
 * Apply a source-authored, explicitly announced hypothetical change.
 * It can restrict an available budget or a choice capacity, never invent a
 * user's motive or alter the first decision. It is not a claim of source truth.
 */
export function developedTradeoffModel(context,developmentId){
 const d=context?.development,m=context?.model;
 if(context?.mechanism!=='tradeoff'||!d?.id||d.id!==developmentId||
    typeof d.label!=='string'||!d.label.trim()||d.kind!=='hypothetical_constraint'||
    !m?.resources||!m?.choices)return null;
 const resources=m.resources.map(r=>({...r})),choices=m.choices.map(c=>({...c}));
 let tightened=0;
 const resourceCaps=d.resourceCaps||{},choiceCaps=d.choiceCaps||{};
 if(!Object.keys(resourceCaps).length&&!Object.keys(choiceCaps).length)return null;
 for(const [id,cap] of Object.entries(resourceCaps)){
  const r=resources.find(x=>x.id===id);
  if(!r||!Number.isSafeInteger(cap)||cap<r.min||cap>=r.max||r.type!=='cap')return null;
  r.max=cap;tightened++;
 }
 for(const [id,cap] of Object.entries(choiceCaps)){
  const c=choices.find(x=>x.id===id);
  if(!c||!Number.isSafeInteger(cap)||cap<0||cap>=c.max)return null;
  c.max=cap;tightened++;
 }
 return tightened?{...m,resources,choices}:null;
}

export function reasonSemantically(context,input){
 const tension=validateTension(context);if(tension.status!=='supported')return tension;
 const trade=context.mechanism==='tradeoff';
 let transition=null;
 const isSecondMoment=input?.first!==undefined||input?.developmentId!==undefined;
 if(isSecondMoment&&!trade)return reject('Second-moment allocation belongs to Trade-Off only.');
 let structure;
 if(isSecondMoment){
  const developed=developedTradeoffModel(context,input?.developmentId);
  const initial=tradeoffStructure(context.model,input?.first);
  if(!developed||!initial)return reject('The first allocation or declared changed condition is invalid.');
  structure=tradeoffStructure(developed,input);
  if(!structure)return reject('The revised allocation does not fit the changed constraints.');
  const externallyAvailable=initial.budgets.map((budget,i)=>Math.min(budget,developed.resources[i].max));
  const oldChoiceStillFits=Boolean(tradeoffStructure(developed,{amounts:input.first.amounts,budgets:externallyAvailable}));
  const deltaAmounts=structure.amounts.map((n,i)=>n-initial.amounts[i]);
  const deltaSpent=structure.spent.map((n,i)=>n-initial.spent[i]);
  const amountsChanged=deltaAmounts.some(Boolean);
  transition={
   development:{id:context.development.id,label:context.development.label,kind:context.development.kind},
   metricUnit:context.model.metric?.unit||null,
   initial:{amounts:[...initial.amounts],budgets:[...initial.budgets],spent:[...initial.spent],measure:initial.measure},
   revised:{amounts:[...structure.amounts],budgets:[...structure.budgets],spent:[...structure.spent],measure:structure.measure},
   deltaAmounts,deltaSpent,changedChoices:context.model.choices.map((choice,i)=>({
    label:choice.label,id:choice.id,from:initial.amounts[i],to:structure.amounts[i],delta:deltaAmounts[i]
   })).filter(change=>change.delta!==0),
   deltaMetric:initial.measure===null||structure.measure===null?null:structure.measure-initial.measure,
   amountsChanged,originalSelectionStillFeasible:oldChoiceStillFits,
   reallocationRequired:!oldChoiceStillFits
  };
  structure.transition=transition;
 }else{
  structure=trade?tradeoffStructure(context.model,input):decisionStructure(context.model,input?.path);
 }
 if(!structure||!trade&&structure.at!==null)return reject('Incomplete or infeasible selections.');
 const claims=[];
 const add=(kind,text,classification='conditional',evidence={})=>claims.push({kind,text,classification,evidence,assumptions:context.assumptions||[]});
 if(trade){
  const choices=context.model.choices;
  if(transition){
   const unit=context.model.metric?.unit;
   const firstMeasure=transition.initial.measure,secondMeasure=transition.revised.measure;
   const metrics=unit&&firstMeasure!==null&&secondMeasure!==null?
    ' The modeled result moves from '+firstMeasure+' to '+secondMeasure+' '+unit+'.':'';
   const decision=transition.amountsChanged?
    (transition.originalSelectionStillFeasible?
     'Your previous quantities would still fit; this new allocation is a further choice.':
     'Your previous quantities no longer fit; the allocation had to be reconsidered.'):
    'You kept your original quantities despite the new condition.';
   add('transition','In this imagined scenario, '+context.development.label+' '+decision+metrics,
    'conditional',{...transition});
  }
  add('allocation',choices.map((c,i)=>`${input.amounts[i]} ${c.label}`).join(', '),'necessary',{amounts:input.amounts});
  const intentions=input.intentions||{};
  for(const [id,target] of Object.entries(intentions)){
   const i=choices.findIndex(c=>c.id===id);
   if(i<0||!Number.isSafeInteger(target)||target<0)return reject('Invalid stated intention.');
   if(input.amounts[i]<target)add('intention_gap',`Your allocation to ${choices[i].label} falls below your stated target.`, 'necessary',{id,target,actual:input.amounts[i]});
  }
  if(input.repetitions!==undefined){
   if(!Number.isSafeInteger(input.repetitions)||input.repetitions<2||input.repetitions>1000)return reject('Invalid repetition horizon.');
   if(context.model.unitHours!==undefined&&(!Number.isFinite(context.model.unitHours)||context.model.unitHours<=0))
    return reject('The scenario has an invalid time conversion.');
   const cumulative=choices.map((c,i)=>({label:c.readingLabel||c.label,units:input.amounts[i]*input.repetitions}));
   const slots=context.model.unitLabel||'resource units';
   add('repetition','If this exact arrangement were repeated '+input.repetitions+' times, it would reserve '+
    cumulative.map(c=>c.units+' '+slots+' for '+c.label).join(', ')+
    '. This is a conditional pattern, not evidence that you will adopt it.', 'conditional',
    {totals:structure.spent.map(n=>n*input.repetitions),cumulative,repetitions:input.repetitions,unitHours:context.model.unitHours||null});
  }
  const better=context.model.metric?.op==='minimum'?structure.alternatives.find(a=>a.delta>0):null;
  if(better)add('complementarity',`Reallocating one unit can increase the modeled result from ${structure.measure} to ${better.measure}.`,'conditional',better);
  else if(structure.alternatives.length)add('opportunity',structure.slack.every(n=>n===0)?'A feasible increase here requires releasing resources elsewhere.':'Unused capacity permits a change without displacing every existing allocation.','conditional',structure.alternatives[0]);
  if(structure.measure!==null)add('conversion',`This allocation corresponds to ${structure.measure} ${context.model.metric.unit}.`,'conditional',{measure:structure.measure,unit:context.model.metric.unit});
 }else{
  const last=structure.steps.at(-1);if(!last)return reject('No decision selected.');
  add('decision',`Your final choice was to ${last.label.toLowerCase()}.`,'necessary',{choice:last.choice});
  const ledger={},changes=[],events=[],unresolved=[],occurred={};
  for(const step of structure.steps){
   const option=context.model.nodes[step.node].options.find(o=>o.id===step.choice);
   Object.assign(occurred,option.effects||{});
   const event={action:option.action||option.label,intention:option.intention||null,before:step.before,externalInformation:step.revealed,occurred:{...occurred},relationships:[]};
   for(const [field,value] of Object.entries(option.commitments||{})){
    const prior=ledger[field],domain=context.model.commitmentDomains[field];
    if(prior!==undefined&&prior!==value){
     if(domain.oppositions?.some(pair=>pair.includes(prior)&&pair.includes(value))){
      const change={field,from:prior,to:value,at:events.length,evidenceAvailable:step.before};changes.push(change);event.relationships.push('genuine_revision');
     }else {event.relationships.push('unresolved_relationship');unresolved.push({field,from:prior,to:value});}
    }else if(prior===value)event.relationships.push('compatible_continuation');
    ledger[field]=value;
   }
   if(!Object.keys(option.commitments||{}).length)event.relationships.push('action_succession');
   events.push(event);
  }
  structure.semanticEvents=events;structure.semanticRevisions=changes;structure.occurred=occurred;
  if(changes.length)add('revision','You explicitly changed a commitment; this does not establish that the earlier decision was mistaken.','necessary',{changes,events});
  if(structure.locked.length)add('closure','An earlier act closed alternatives; editing the scenario does not make that act reversible within it.','necessary',{locked:structure.locked});
  if(structure.known.length>(context.model.initial||[]).length){
   const first=structure.steps[0],last=structure.steps.at(-1);
   const revelations=structure.steps.flatMap(step=>step.revealed||[]);
   const report=revelations[0]||'new information';
   const next=first===last?'the decision ended there':'you then chose to '+last.label.toLowerCase();
   add('information','You first chose to '+first.label.toLowerCase()+'. Later in this imagined route, '+report[0].toLowerCase()+report.slice(1)+
    '; '+next+'. That later perspective does not prove your original choice mistaken or disclose the unchosen future.',
    'conditional',{steps:structure.steps,events,firstChoice:first.choice,lastChoice:last.choice,revelations});
  }
  const control=context.model.agency;
  if(control?.external&&control?.own)add('agency',`You chose to ${events.map(e=>e.action.toLowerCase()).join(', then ')}; ${control.external} remains outside those choices.`, 'conditional',{action:last.label,own:control.own,external:control.external,events});
  const assentChanges=changes.filter(c=>c.field===context.model.assentField);
  const assentDeclarations=structure.steps.filter(step=>Object.hasOwn(context.model.nodes[step.node].options.find(o=>o.id===step.choice).commitments||{},context.model.assentField));
  if(context.model.assentField&&Object.hasOwn(ledger,context.model.assentField)&&!unresolved.some(c=>c.field===context.model.assentField))add('assent',`You chose to ${assentDeclarations.map(step=>step.label.toLowerCase()).join(', then ')}. ${assentDeclarations.length===1?'This states your position; it does not settle the claim.':assentChanges.length?'This changes your stated position; it does not prove the claim false.':'Your stated position remained the same.'}`,'necessary',{commitments:ledger,changes:assentChanges,events,position:ledger[context.model.assentField]});
  add('uncertainty','An unchosen route remains a possibility, not an observed outcome.','conditional',{steps:structure.steps});

 }
 if(trade&&context.model.metric?.op==='minimum')add('dependency',`The arrangement completes ${structure.measure} ${structure.measure===1?(context.model.metric.singular||context.model.metric.unit):context.model.metric.unit}; completion depends on all required stages.${structure.alternatives.some(a=>a.delta>0)?' Moving one assignment can raise completion to '+structure.alternatives.find(a=>a.delta>0).measure+' without adding resources.':''}`, 'conditional',{measure:structure.measure,components:input.amounts.map((n,i)=>n*context.model.metric.weights[i]),stageCapacities:context.model.choices.map((choice,i)=>({label:choice.label,capacity:structure.amounts[i]*context.model.metric.weights[i]})).filter((_,i)=>context.model.metric.weights[i]>0),alternative:structure.alternatives.find(a=>a.delta>0)||null});
 if(trade&&context.model.comparison){
  const c=context.model.comparison;
  const baseline=Math.floor(c.staffing*(c.minutesPerWorker-c.switchingMinutesPerWorker)/c.minutesPerUnit);
  const delta=structure.measure-baseline;
  const reading=delta>0?'The specialized arrangement produces '+delta+' more modeled unit'+(delta===1?'':'s')+'.':
   delta===0?'The specialized allocation does not outperform the rotating team in this scenario.':
   'The specialized allocation produces '+Math.abs(delta)+' fewer modeled units under these assumptions.';
  add('specialization_effect','The stipulated rotating team finishes '+baseline+
   ' units; your dedicated-stage assignment finishes '+structure.measure+' units. '+reading+
   ' Neither figure is historical evidence.','conditional',
   {baseline,specialized:structure.measure,delta,staffing:c.staffing,assignments:context.model.choices.map((choice,i)=>({id:choice.id,label:choice.label,singular:choice.singular||null,amount:structure.amounts[i]})),
    stageCapacities:context.model.choices.map((choice,i)=>({label:choice.label,capacity:structure.amounts[i]*context.model.metric.weights[i]})).filter((_,i)=>context.model.metric.weights[i]>0),
    generalistCalculation:{staffing:c.staffing,minutesPerWorker:c.minutesPerWorker,switchingMinutesPerWorker:c.switchingMinutesPerWorker,minutesPerUnit:c.minutesPerUnit},
    explanation:c.explanation,unit:context.model.metric.unit,singular:context.model.metric.singular});
 }
 const contract=context.semantic.selection;
 if(!contract?.central?.length)return reject('No source-sensitive meaning warrant supplied.');
 if(transition&&!contract.changeCentral?.length)return reject('The changed condition lacks a source-authored philosophical warrant.');
 const centralKinds=transition?contract.changeCentral:contract.central;
 const selectionTrace=claims.map(c=>({kind:c.kind,sourceFidelityProvenance:'curated source contract, not independently proved',sourceFidelity:centralKinds.includes(c.kind)?'central':contract.alternatives?.includes(c.kind)?'secondary':'observation_only',pathRelevant:Object.keys(c.evidence).length>0,evidentialWarrant:c.classification!=='unsupported',conceptualRelationship:context.semantic.relation,educationalPurpose:contract.purpose,uncertainty:c.assumptions}));
 const eligible=claims.filter(c=>centralKinds.includes(c.kind)&&Object.keys(c.evidence).length);
 const secondary=claims.filter(c=>contract.alternatives?.includes(c.kind)&&Object.keys(c.evidence).length);
 const candidates=eligible.length?eligible:secondary;
 if(candidates.length!==1)return reject(candidates.length?'Several source-relevant meanings require editorial disambiguation.':'No source-relevant consequence is warranted.');
 const meaning=candidates[0];
 if(!meaning)return reject('No justified philosophical tension detected.');
 const admission=context.semantic.admission;
 if(!admission.allowedClaimKinds.includes(meaning.kind))
  return reject('The selected inference lacks the declared source-to-scenario warrant.');
 const claimPremises=admission.claimPremiseIds?.[meaning.kind]||[];
 if(!Array.isArray(claimPremises)||!claimPremises.every(id=>context.premiseIds.includes(id)))
  return reject('The selected claim requires a scenario premise that was not declared.');
 const allowedSecondary=new Set(contract.secondaryObservations||[]);
 const selectedSecondary=claims.find(c=>allowedSecondary.has(c.kind)&&c.kind!==meaning.kind&&
  Object.keys(c.evidence||{}).length&&c.classification!=='unsupported');
 const secondaryObservations=selectedSecondary?[selectedSecondary]:[];
 const selectedChoices=trade?context.model.choices.map((c,i)=>({id:c.id,label:c.label,singular:c.singular||null,amount:structure.amounts[i]})):
  structure.steps.map(step=>({id:step.choice,label:step.label,node:step.node}));
 return {version:'meaning/1.2',status:'ready',quote:context.quote,author:context.author,source:context.source,semantic:context.semantic,structure,claims,meaning,selectionTrace,secondaryObservations,selectedChoices,
  sourceAdmission:{sourceUrl:admission.sourceUrl,sourceWork:admission.sourceWork,centralClaim:admission.centralClaim,
   scenarioBridge:admission.scenarioBridge,requiredPremiseIds:[...admission.requiredPremiseIds],
   claimPremiseIds:[...claimPremises],
   reviewStatus:admission.reviewStatus,independentlySourceVerified:false,
   claimTraceStatus:tension.sourceTrace.status,passageExcerpt:tension.sourceTrace.excerpt||null},
  limitations:[context.semantic.boundary],assumptions:context.assumptions||[]};
}
const frames={reflective:'Consider the distinction.',surprising:'Notice what changes.',playful:'Turn the situation around.',challenging:'Test the distinction carefully.'};
const questions={agency:'What could your response decide, and what still belonged to the other person?',assent:'What changed in your judgment without settling the claim’s truth?',specialization_effect:'Under the invented rates, what would have to change for specialized work to increase what the team finishes?',transition:'Which part of the difference came from the changed conditions, and which part from your own revised choice?',intention_gap:'What would need to change for the allocation to meet the intention?',revision:'What could you reasonably have known before the later evidence arrived?',complementarity:'Which dependency makes the alternative possible?',closure:'Which earlier commitment limited the later alternatives?',information:'What changes when you separate earlier reasons from later knowledge?',conversion:'What becomes visible when the same choice is described in another measure?',repetition:'What would repeating this arrangement preserve or crowd out?',opportunity:'Which competing claim would bear the cost of a change?',uncertainty:'What remains unsettled after you have chosen?'};
// The short heading is derived from validated consequences, never philosopher IDs.
function meaningHeadline(kind,evidence={}){
 switch(kind){
  case 'transition':
   return evidence.amountsChanged?
    evidence.reallocationRequired?'The new constraint ruled out your first plan.':'You changed a plan that still could have worked.':
    'Your first allocation still works under the new condition.';
  case 'conversion': return 'This choice corresponds to '+evidence.measure+' '+evidence.unit+'.';
  case 'dependency': return 'The least-supplied stage limits what gets finished.';
  case 'specialization_effect': return evidence.specialized>evidence.baseline?
   'The specialized assignment increases modeled output.':
   evidence.specialized===evidence.baseline?'Specialization alone did not increase modeled output.':
   'This specialized assignment produces less in the comparison.';
  case 'agency': return '“'+(evidence.events?.[0]?.action||'Your first response')+
   '” came first; '+(evidence.external||'the outcome')+' stayed outside your control.';
  case 'assent': return evidence.changes?.length?'Revising your judgment does not disprove the claim.':
   'Your judgment and the claim’s truth are separate questions.';
  case 'repetition': {
   const c=evidence.cumulative||[],total=c.reduce((n,x)=>n+x.units,0),first=c[0];
   if(!first||!Number.isFinite(total))return 'Repeated intervals form a hypothetical pattern.';
   if(first.units===0)return 'One activity is absent from this repeated allocation.';
   if(first.units===total)return 'One activity fills the entire imagined interval.';
   if(first.units>=total/2)return 'One activity receives much of the modeled time.';
   return 'Several activities share this imagined schedule.';
  }
  case 'information': {
   const news=evidence.revelations?.[0];
   return news?'In this imagined route, '+news[0].toLowerCase()+news.slice(1).replace(/[.!?]+$/,'')+'.':
    'Later knowledge cannot go back into the first choice.';
  }
  default: return null;
 }
}
function meaningExperience(packet,m){
 const e=m.evidence||{};
 if(m.kind==='transition'){
  const quantities=e.amountsChanged?'You changed the allocation.':'You kept the original quantities.';
  const feasibility=e.reallocationRequired?'The earlier plan no longer fit.':'The earlier plan could still fit.';
  const measured=e.initial?.measure!==null&&e.initial?.measure!==undefined&&e.revised?.measure!==null&&e.revised?.measure!==undefined&&packet.structure?.measure!==null?
   ' The modeled result moves from '+e.initial.measure+' to '+e.revised.measure+' '+(e.metricUnit||'modeled units')+'.':'';
  return 'A new condition appears: '+e.development.label+' '+feasibility+' '+quantities+measured;
 }
 if(m.kind==='specialization_effect'){
  const quantity=n=>n+' '+(n===1?(e.singular||'unit'):(e.unit||'units'));
  const roles=(e.assignments||[]).map(a=>a.amount+' '+(a.amount===1&&a.singular?a.singular:a.label)).join(' and ');
  return 'Your assignment: '+roles+'. The invented rotating-team baseline produces '+quantity(e.baseline)+
   '; your split produces '+quantity(e.specialized)+'. Rates are hypothetical, not historical evidence.';

 }
 if(m.kind==='dependency'){
  const changed=e.alternative&&e.alternative.delta>0?
   ' An allowed reassignment could raise that to '+e.alternative.measure+'.':'';
  return 'With your chosen assignment, the team finishes '+e.measure+' modeled '+(e.measure===1?'unit':'units')+'. Both stages are needed.'+changed;
 }
 if(m.kind==='conversion')return 'This conversion follows the scenario’s assumptions, not observations of your actual life.';
 if(m.kind==='repetition'){
  const display=n=>e.unitHours?
   (n*e.unitHours)+' '+(n*e.unitHours===1?'hour':'hours'):
   n+' modeled units';
  return 'Across '+e.repetitions+' imagined evenings, the same plan would give '+
   (e.cumulative||[]).map(c=>display(c.units)+' for '+c.label).join(', ')+
   '. This does not establish your actual habits.';
 }
 if(m.kind==='information'){
  const steps=e.steps||[]; const first=steps[0],last=steps.at(-1);
  const choice=label=>label?.startsWith('You ')?'You chose to '+label.slice(4,5).toLowerCase()+label.slice(5):
   'You chose to '+String(label||'act').toLowerCase();
  const event=e.revelations?.[0]||'something new occurs';
  const later=event[0].toLowerCase()+event.slice(1);
  const following=choice(last?.label);
  return choice(first?.label)+'. Later in the imagined scenario, '+following[0].toLowerCase()+following.slice(1)+
   '. The outcome of the unchosen path is still unknown.';
 }
 return m.text;
}
// A bounded source-to-experience bridge. All branches read the already validated
// meaning/1.2 consequence, never source IDs or a text-generated premise.
// Generic expression only consumes evidence admitted by meaning/1.2; it must
// not infer source identity, future outcomes, activities, or stage capacities.
function stageCapacityEvidence(e){
 const stages=e?.stageCapacities;
 if(!Array.isArray(stages)||stages.length<2||stages.some(s=>
   !s||typeof s.label!=='string'||!s.label.trim()||
   !Number.isSafeInteger(s.capacity)||s.capacity<0))return null;
 const minimum=Math.min(...stages.map(s=>s.capacity));
 const limiting=stages.filter(s=>s.capacity===minimum);
 return {stages,minimum,limiting,allEqual:limiting.length===stages.length};
}
function repeatedActivityEvidence(e){
 const a=e?.cumulative;
 if(!Array.isArray(a)||a.length<2||a.some(x=>
   !x||typeof x.label!=='string'||!x.label.trim()||
   !Number.isSafeInteger(x.units)||x.units<0)||!Number.isSafeInteger(e.repetitions)||
   e.repetitions<2)return null;
 const total=a.reduce((n,x)=>n+x.units,0);
 if(!Number.isSafeInteger(total)||!total)return null;
 return {first:a[0],activities:a,total};
}
function meaningBridge(packet){
 const m=packet.meaning,e=m.evidence||{},secondary=packet.secondaryObservations||[];
 switch(m.kind){
  case 'conversion':
   if(!Number.isFinite(e.measure)||typeof e.unit!=='string')return null;
   if(e.measure===0)return 'This selection produces no modeled conversion cost; its other consequences remain unknown.';
   if(secondary.some(x=>x.kind==='intention_gap'))
    return 'The unmet stated target exposes a difference between intended quantities and their modeled cost.';
   if(packet.structure?.slack?.every(x=>x===0))
    return 'The full allowance is committed, making the modeled cost visible without judging its worth.';
   return 'The chosen quantities carry a modeled cost, whose significance the numbers cannot determine.';
  case 'specialization_effect':{
   const stages=stageCapacityEvidence(e);
   if(!stages||!Number.isFinite(e.delta))return null;
   const limiting=stages.limiting.map(s=>s.label).join(' and ');
   if(stages.minimum===0)return 'Without a required contribution from '+limiting+', no complete modeled unit can emerge.';
   if(e.delta<0)return 'The specialized arrangement finishes less than the declared comparison, so assigning roles alone proves no advantage.';
   if(e.delta===0)return 'The declared arrangements finish equally; a productivity advantage remains unshown.';
   if(stages.allEqual)return 'Required stages have equal modeled capacity, and this arrangement outperforms the assumed comparison.';
   return 'The modeled gain is constrained by '+limiting+', the stage with the lower output capacity.';
  }
  case 'agency':{
   const events=e.events||[],external=String(e.external||'').trim();
   if(events.length<2||!external)return null;
   const first=events[0],last=events.at(-1);
   const acted=x=>x&&Object.values(x.occurred||{}).some(Boolean);
   if(acted(first)&&first.action!==last.action)
    return 'An earlier action stays performed even if the next decision changes; '+external+' remains external.';
   if(acted(first))return 'Repeating your action still cannot determine '+external+'.';
   if(acted(last))return 'The later action changes your conduct, but not '+external+'.';
   if(!first?.action||!last?.action)return null;
   // Without declared occurrence effects, selected actions still form a meaningful
   // order. Describe that order, never treat a selection as an accomplished act.
   if(first.action===last.action)
    return 'You selected '+first.action+' at both moments; repeating a decision does not confirm that it occurred or determine '+external+'.';
   return 'Your chosen response shifted from '+first.action+' to '+last.action+
    '; the sequence records decisions, not confirmed acts or control over '+external+'.';
  }
  case 'assent':
   if(e.changes?.length&&e.position==='withhold')
    return 'Revising assent after more evidence does not establish that the claim is false.';
   if(e.changes?.length)return 'A revised judgment does not by itself establish the truth of the claim.';
   if(e.position==='withhold')return 'Maintained suspension keeps belief separate from the evidence currently available.';
   return 'Maintained acceptance does not settle a disputed claim beyond the available grounds.';
  case 'repetition':{
   const a=repeatedActivityEvidence(e);
   if(!a)return null;
   const firstLabel=a.first.label[0].toUpperCase()+a.first.label.slice(1);
   if(a.first.units===0)return firstLabel+' has no place in these imagined repeated intervals.';
   if(a.first.units===a.total)return firstLabel+' fills the modeled pattern; other activities receive no allocation.';
   if(a.first.units>=a.total/2)return firstLabel+' has a prominent place while other activities remain present.';
   return firstLabel+' receives a modeled share alongside the other activities.';
  }
  case 'information':{
   const later=String(e.revelations?.[0]||'').replace(/[.!?]+$/,'');
   if(!later)return null;
   return 'Only afterward does this imagined route show that '+later[0].toLowerCase()+later.slice(1)+'.';
  }
  case 'transition':
   if(e.reallocationRequired)return 'Because the old plan no longer fit, changing it answered a new constraint.';
   if(e.amountsChanged)return 'Because the old plan still fit, revising it was an additional choice.';
   return 'Keeping the plan shows that a changed constraint need not change every choice.';
  case 'dependency':{
   const a=stageCapacityEvidence(e);
   if(!a)return null;
   if(a.allEqual)return 'All required stages share the same modeled capacity; none alone limits completion.';
   return 'The limiting stage is '+a.limiting.map(s=>s.label).join(' and ')+', based on output capacity rather than worker counts.';
  }
  case 'opportunity':
   return 'Allocating limited time here means that another feasible use goes without it.';
  default:return null;
 }
}
function pathQuestion(packet){
 const m=packet.meaning,e=m.evidence||{};
 switch(m.kind){
  case 'conversion':{
   if(!Number.isFinite(e.measure)||typeof e.unit!=='string')return null;
   if(e.measure===0)return 'If this choice has no modeled cost, what different allocation would make a sacrifice visible?';
   const gap=(packet.secondaryObservations||[]).find(x=>x.kind==='intention_gap');
   if(gap){
    const label=packet.selectedChoices?.find(x=>x.id===gap.evidence?.id)?.label;
    if(!label)return null;
    return 'If your allocation for '+label+' falls short of your stated target, what justifies the modeled cost?';
   }
   if(packet.structure?.slack?.every(x=>x===0))
    return 'When this allocation uses the full allowance, which possible alternative might matter more?';
   return 'What would make these modeled '+e.unit+' worth accepting instead of another use?';
  }
  case 'specialization_effect':{
   const a=stageCapacityEvidence(e);if(!a||!Number.isFinite(e.delta))return null;
   const limiting=a.limiting.map(s=>s.label).join(' and ');
   if(a.minimum===0)
    return 'What change could restore the missing contribution from '+limiting+' to the joint process?';
   if(e.delta<0)
    return 'Which modeled constraint would need changing before these specialized roles could produce more?';
   if(e.delta===0)
    return 'With no gain in the model, what additional evidence could justify claiming that specialized roles improve productivity?';
   if(a.allEqual)
    return 'Does this modeled gain establish why productivity increased, or only that output was greater?';
   return 'How might changing the capacity of '+limiting+' affect this modeled productivity gain?';
  }
  case 'agency':{
   const ev=e.events||[],first=ev[0],last=ev.at(-1),external=String(e.external||'').trim();
   if(ev.length<2||!external)return null;
   const acted=x=>x&&Object.values(x.occurred||{}).some(Boolean);
   if(acted(first)&&first.action===last.action)
    return 'Does choosing to '+first.action.toLowerCase()+' again extend your control over '+external+'?';
   if(acted(first))
    return 'What can your later action change without undoing the one already performed?';
   if(acted(last))
    return 'How does acting now differ from earlier restraint while '+external+' remains independent?';
   if(!first?.action||!last?.action)return null;
   if(first.action===last.action)
    return 'What does selecting '+first.action+' again clarify about your choices without confirming an act or deciding '+external+'?';
   return 'What changes when you select '+last.action+' after '+first.action+
    ', without proving that either choice was carried out or that '+external+' was decided?';
  }
  case 'assent':
   if(e.changes?.length&&e.position==='withhold')
    return 'What did the new evidence justify revising without establishing the original claim as false?';
   if(e.changes?.length)
    return 'What further grounds would justify moving from suspension toward assent?';
   if(e.position==='withhold')
    return 'Why might continued suspension respect the limits of the currently available evidence?';
   return 'What would justify maintaining assent when the available grounds remain disputed?';
  case 'repetition':{
   const a=repeatedActivityEvidence(e);if(!a)return null;
   // An intention is evidence only when the participant explicitly supplied a
   // target that was validated by the generic allocation parser.
   const gap=packet.claims?.find(c=>c.kind==='intention_gap'&&
    c.classification==='necessary'&&c.evidence?.id);
   if(gap){
    const named=packet.selectedChoices?.find(c=>c.id===gap.evidence.id);
    if(!named)return null;
    return 'How does your stated target for '+named.label+
     ' compare with the pattern you selected across these imagined intervals?';
   }
   const absent=a.activities.filter(x=>x.units===0);
   const present=a.activities.filter(x=>x.units>0);
   const joining=xs=>xs.map(x=>x.label).join(' and ');
   const ranked=[...present].sort((x,y)=>y.units-x.units);
   if(absent.length){
    const missing=joining(absent);
    if(present.length===1)
     return 'With '+missing+' absent, what does repeatedly allocating time only to '+
      present[0].label+' sustain or exclude?';
    if(present.every(x=>x.units===present[0].units))
     return 'With '+missing+' absent while '+joining(present)+
      ' share time, what does the repeated pattern preserve?';
    return 'With '+missing+' absent and '+ranked[0].label+
     ' receiving the larger share, what does the repeated pattern preserve?';
   }
   if(a.activities.every(x=>x.units===a.activities[0].units))
    return 'With '+joining(a.activities)+' allotted equal time, what does repeating this balance preserve?';
   if(ranked[0].units>a.total/2)
    return 'When '+ranked[0].label+
     ' receives most modeled time, what do the other activities retain in this repeated pattern?';
   if(ranked[0].units===ranked[1].units)
    return 'With '+joining(ranked.slice(0,2))+
     ' sharing the largest allocation, what does repeating this pattern preserve?';
   return 'With '+ranked[0].label+' receiving the largest share, what does the recurring allocation leave for '+
    ranked.at(-1).label+'?';
  }
  case 'information':{
   const later=String(e.revelations?.[0]||'').replace(/[.!?]+$/,'');
   const last=String(e.steps?.at(-1)?.label||'').replace(/^You\s+/i,'').toLowerCase();
   if(!later||!last)return null;
   return 'When '+later[0].toLowerCase()+later.slice(1)+', what does choosing to '+last+
    ' clarify about your earlier decision?';
  }
  case 'transition':
   if(e.reallocationRequired)return 'Which consequence arose from the new constraint rather than from your preferred allocation?';
   if(e.amountsChanged)return 'When the old plan remained possible, what does your revision reveal about choosing again?';
   return 'If the original allocation still fits, what does keeping it reveal about a new constraint?';
  case 'opportunity':
   return 'Which activity would have to surrender time if you increased the other one?';
  case 'dependency':{
   const a=stageCapacityEvidence(e);if(!a)return null;
   if(a.allEqual)return 'What would have to change in each required stage to increase completed output?';
   return 'What would need to change about '+a.limiting.map(s=>s.label).join(' and ')+
    ' before more joint work could be finished?';
  }
  case 'revision':
   return 'What could you reasonably know before the later evidence changed your position?';
  case 'closure':
   return 'Which already completed action cannot be undone by changing your later response?';
  default:return null;
 }
}
function readableSummary(packet){
 if(!packet.selectedChoices?.length)return '';
 const choices=packet.selectedChoices;
 return packet.structure?.amounts?
  'You selected '+choices.map(c=>c.amount+' '+(c.amount===1&&c.singular?c.singular:c.label)).join(', ')+'.':
  '';
}
function boundedSecondary(packet){
 const next=packet.secondaryObservations?.[0];
 if(!next)return '';
 if(next.kind==='intention_gap')return next.text;
 if(next.kind==='revision')return 'The changed commitment is explicit; it does not make the earlier judgment wrong.';
 if(next.kind==='closure')return 'An earlier action closed an option in this imagined path.';
 if(next.kind==='complementarity')return 'A different assignment could increase output without extra workers.';
 return '';
}
const words=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
/**
 * Founder policy 2026-11-14: 80–120 words total across generated I, II, III;
 * excludes literal philosopher quotation, fixed labels, accessibility controls
 * and founder-only QA. Earlier 45–70 word overall goal is superseded.
 * Never silently cut the source claim or caveats to game a count.
 */
export const ENCOUNTER_WORD_POLICY=Object.freeze({
 sections:Object.freeze({idea:Object.freeze({min:10,max:48}),
 philosopher:Object.freeze({min:18,max:65}),
 question:Object.freeze({min:9,max:26})}),
 total:Object.freeze({min:80,max:120}),exclude:['original quotation','fixed section labels','QA controls']
});
export function expressSemantic(packet,mode='reflective'){
 if(packet?.version!=='meaning/1.2'||packet.status!=='ready'||!packet.claims.includes(packet.meaning)||!frames[mode])return null;
 const m=packet.meaning;
 if(!['necessary','conditional'].includes(m.classification))return null;
 const headline=meaningHeadline(m.kind,m.evidence)||m.text;
 const concepts=packet.semantic.concepts;
 const evidence=m.evidence;
 const anchor={conversion:`${evidence.measure} ${evidence.unit}`,dependency:`${evidence.measure} completed ${evidence.measure===1?'unit':'units'}`,agency:evidence.external,assent:`your decision to ${evidence.events?.at(-1)?.action.toLowerCase()}`,revision:'the explicitly changed commitment'}[m.kind]||'this consequence';
 const relationship=packet.semantic.relation;
 const compositions={
  reflective:{experience:`The distinction is between ${concepts.join(' and ')}.`,interpretation:`${packet.author} brings into view ${relationship}.`,question:`When you consider ${anchor}, what becomes visible about ${concepts[1]} through ${concepts[0]}?`},
  surprising:{experience:`The same decision can be read through ${concepts[1]}, as well as ${concepts[0]}.`,interpretation:`What ${packet.author} makes visible here is ${relationship}.`,question:`Does describing ${anchor} through ${concepts[1]} change what you notice?`},
  playful:{experience:`Try reading ${concepts[0]} through the lens of ${concepts[1]}.`,interpretation:`That shift opens ${packet.author}’s question of ${relationship}.`,question:`Keep ${anchor} in view: what changes when you switch those lenses?`},
  challenging:{experience:`A distinction remains: ${concepts[0]} and ${concepts[1]} are not interchangeable.`,interpretation:`${packet.author} asks us to examine ${relationship}.`,question:`What would you overlook about ${anchor} if you considered only ${concepts[0]}?`}
 };
 const composed=compositions[mode];
 let experience=(mode==='reflective'?'':frames[mode]+' ')+meaningExperience(packet,m);
 const secondary=boundedSecondary(packet);
 if(secondary&&words(headline+' '+experience+' '+secondary)<=ENCOUNTER_WORD_POLICY.sections.idea.max)
  experience+=' '+secondary;
 if(['conversion','opportunity'].includes(m.kind)){
  const summary=readableSummary(packet);
  if(summary&&words(headline+' '+experience+' '+summary)<=ENCOUNTER_WORD_POLICY.sections.idea.max)
   experience+=' '+summary;
 }
 const admission=packet.sourceAdmission;
 const bridge=meaningBridge(packet);
 if(admission?.centralClaim&&admission?.scenarioBridge&&!bridge)
  return {status:'needs_editorial_review',reason:'No supported source-to-experience bridge for this meaning.'};
 const interpretation=admission?.centralClaim&&admission?.scenarioBridge?
  admission.centralClaim+' '+admission.scenarioBridge+' '+bridge+' '+packet.limitations.join(' ')+
   (admission.claimTraceStatus==='unverified'?' This source interpretation is unverified.':''):
  composed.interpretation+' '+packet.assumptions.join(' ')+' '+packet.limitations.join(' ');
 const proactiveQuestion=pathQuestion(packet);
 if(!proactiveQuestion)return {status:'needs_editorial_review',reason:'No grounded final question available for this meaning.'};
 const text=[headline,experience,interpretation,proactiveQuestion].join(' ');
 const wordCount=text.split(/\s+/).length;
 // Never truncate a caveat or silently add padding to satisfy a length target.
 if(wordCount>160)return {status:'needs_editorial_review',wordCount,reason:'Reading exceeds the safety ceiling; editorial shortening is required.'};
 return {status:'ready',mode,headline,experience,interpretation,proactiveQuestion,wordCount,evidence:m.evidence,classification:m.classification};
}
