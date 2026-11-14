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
 if(trade&&context.model.metric?.op==='minimum')add('dependency',`The arrangement completes ${structure.measure} ${structure.measure===1?(context.model.metric.singular||context.model.metric.unit):context.model.metric.unit}; completion depends on all required stages.${structure.alternatives.some(a=>a.delta>0)?' Moving one assignment can raise completion to '+structure.alternatives.find(a=>a.delta>0).measure+' without adding resources.':''}`, 'conditional',{measure:structure.measure,components:input.amounts.map((n,i)=>n*context.model.metric.weights[i]),alternative:structure.alternatives.find(a=>a.delta>0)||null});
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
   'Balancing the specialized stages increases modeled output.':
   evidence.specialized===evidence.baseline?'Specialization alone did not increase modeled output.':
   'This specialized assignment produces less in the comparison.';
  case 'agency': return '“'+(evidence.events?.[0]?.action||'Your first response')+
   '” came first; '+(evidence.external||'the outcome')+' stayed outside your control.';
  case 'assent': return evidence.changes?.length?'Revising your judgment does not disprove the claim.':
   'Your judgment and the claim’s truth are separate questions.';
  case 'repetition': {
   const first=evidence.cumulative?.[0],hours=first&&evidence.unitHours?
    first.units*evidence.unitHours:null;
   return first&&hours!==null?'Your repeated plan reserves '+hours+' hours for '+first.label+' across '+evidence.repetitions+' imagined evenings.':
    'Repeated evenings can form a pattern, not a prediction.';
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
  return 'Your assignment: '+roles+'. The invented rotating-team baseline finishes '+quantity(e.baseline)+
   '; your split finishes '+quantity(e.specialized)+'. Rates are hypothetical, not historical evidence.';

 }
 if(m.kind==='dependency'){
  const changed=e.alternative&&e.alternative.delta>0?
   ' An allowed reassignment could raise that to '+e.alternative.measure+'.':'';
  return 'With your chosen assignment, the team finishes '+e.measure+' modeled '+(e.measure===1?'unit':'units')+'. Both stages are needed.'+changed;
 }
 if(m.kind==='conversion')return 'This estimate uses the imagined wage, not your actual earnings.';
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
function meaningBridge(packet){
 const m=packet.meaning,e=m.evidence||{},items=packet.selectedChoices||[];
 const secondary=packet.secondaryObservations||[];
 switch(m.kind){
  case 'conversion':
   if(e.measure===0)return 'No purchase was modeled, so this path required no additional work hours.';
   if(secondary.some(x=>x.kind==='intention_gap'))
    return 'The unmet target sits alongside the modeled life-time cost of your purchases.';
   if(packet.structure?.slack?.every(x=>x===0))
    return 'The full allowance is committed, exposing modeled working time without judging its worth.';
   return 'These purchases have a modeled time cost beyond their monetary price.';
  case 'specialization_effect':{
   const missing=e.assignments?.find(a=>a.amount===0);
   if(missing)return 'With no '+missing.label+', an indispensable stage is absent: specialist labels alone complete nothing.';
   if(e.delta<0)return 'Here divided roles finish less than the hypothetical rotating arrangement.';
   if(e.delta===0)return 'Here dedicated roles only match rotation; a productivity benefit remains unshown.';
   if(e.assignments?.length===2&&e.assignments[0].amount===e.assignments[1].amount)
    return 'With both stages staffed equally, their coordination yields a modeled gain, not historical evidence.';
   return 'Both stages contribute, but the thinner stage still constrains further completion.';
  }
  case 'agency':{
   const events=e.events||[],started=Object.values(events[0]?.occurred||{}).some(Boolean);
   const ended=Object.values(events.at(-1)?.occurred||{}).some(Boolean);
   if(started&&events[0]?.action!==events.at(-1)?.action)
    return 'An earlier action remains performed even when your later choice is restraint.';
   if(started)return 'Repeating an action does not make the other person’s decision yours.';
   if(ended)return 'Your later action changes your conduct, not the other person’s decision.';
   return 'Refraining is also your action; it does not determine the external response.';
  }
  case 'assent':{
   if(e.changes?.length&&e.position==='withhold')
    return 'Withdrawing assent after new evidence leaves the disputed claim unresolved.';
   if(e.changes?.length)
    return 'New assent remains a judgment, not proof of the disputed claim.';
   if(e.position==='withhold')
    return 'Continued suspension preserves the distinction between evidence and certainty.';
   return 'Maintaining assent does not make the disputed record clearly known.';
  }
  case 'repetition':{
   const vals=(e.cumulative||[]).map(x=>x.units||0),writing=vals[0]||0,total=vals.reduce((a,b)=>a+b,0);
   if(!writing)return 'The imagined repetition gives the story no scheduled place at all.';
   if(writing===total)return 'Writing fills every modeled evening; the pattern excludes other activities here.';
   if(writing>=total/2)return 'Writing has a substantial place in these modeled days alongside other claims.';
   return 'Writing shares the imagined routine with competing activities rather than filling it.';
  }
  case 'information':{
   const first=e.events?.[0]?.intention,late=e.events?.[1]?.intention;
   if(!first||!late)return null;
   return 'The later situation — '+late.toLowerCase()+' — adds hindsight unavailable when you chose.';
  }
  case 'transition':
   if(e.reallocationRequired)return 'Because the old plan no longer fit, changing it answered a new constraint.';
   if(e.amountsChanged)return 'Because the old plan still fit, revising it was an additional choice.';
   return 'Keeping the plan shows that a changed constraint need not change every choice.';
  case 'dependency':
   return 'Finishing work depends on every indispensable stage, not specialist titles alone.';
  case 'opportunity':
   return 'Allocating limited time here means that another feasible use goes without it.';
  default:return null;
 }
}
// Philosophical questions are conditioned on consequence shape, not only
// quantities or replaced labels. They preserve the source's uncertainty.
function pathQuestion(packet){
 const m=packet.meaning,e=m.evidence||{},path=packet.selectedChoices||[];
 switch(m.kind){
  case 'conversion':
   if(e.measure===0)return 'If no modeled working time was exchanged, when would Thoreau’s cost-of-life test become relevant?';
   if((packet.secondaryObservations||[]).some(x=>x.kind==='intention_gap'))
    return 'If a purchase falls short of your own target, what could justify its time cost?';
   if(packet.structure?.slack?.every(x=>x===0))
    return 'When the whole budget is spent, which alternative use of that working time remains unseen?';
   return 'What would make the modeled hours behind these purchases worth exchanging?';
  case 'specialization_effect':{
   const assignments=e.assignments||[];
   if(assignments.some(x=>x.amount===0))
    return 'If one indispensable stage receives no workers, what has specialization failed to coordinate?';
   if(e.delta<0)return 'What does producing less show about specialization without coordination?';
   if(e.delta===0)
    return 'If specialized roles show no gain, which additional mechanism in Smith’s argument still needs evidence?';
   if(assignments.length===2&&assignments[0].amount===assignments[1].amount)
    return 'Does this modeled gain show Smith’s dexterity or machinery mechanisms, or only coordinated completion?';
   return 'Despite a modeled gain, which stage now limits the next finished booklet?';
  }
  case 'agency':{
   const events=e.events||[],first=events[0],last=events.at(-1);
   const happened=ev=>Object.values(ev?.occurred||{}).some(Boolean);
   if(happened(first)&&first?.action===last?.action)
    return 'Does repeating your action expand control over forgiveness, or merely repeat what you can choose?';
   if(happened(first))
    return 'After an action already occurred, what can later restraint change without undoing it?';
   if(happened(last))
    return 'What did acting later place within your control that earlier restraint did not?';
   return 'Can choosing not to act exercise agency without determining the other person’s response?';
  }
  case 'assent':
   if(e.changes?.length&&e.position==='withhold')
    return 'What did the conflicting evidence justify revising without proving the original claim false?';
   if(e.changes?.length)
    return 'What additional grounds could justify moving from suspension to assent?';
   if(e.position==='withhold')
    return 'Why might continued suspension be more faithful to limited evidence than confident acceptance?';
   return 'What would justify maintaining assent when the records still conflict?';
  case 'repetition':{
   const vals=(e.cumulative||[]).map(x=>x.units||0),writing=vals[0]||0,total=vals.reduce((a,b)=>a+b,0);
   const msgs=vals[1]||0,rest=vals[2]||0;
   if(writing===0&&msgs===0)
    return 'If rest filled every imagined evening, how could writing enter the pattern without dismissing rest?';
   if(writing===0&&msgs===rest)
    return 'If messages and rest divide each evening, what would need rearranging for writing to recur?';
   if(writing===0)
    return 'When other activities leave no scheduled writing, what would stop a pause becoming a pattern?';
   if(writing===total)
    return 'What would need room elsewhere for such a writing-only schedule to be repeatable?';
   if(writing>=total/2)
    return 'Which boundary around competing demands would make this substantial writing time sustainable?';
   return 'What would keep writing’s smaller place deliberate if these imagined evenings continued?';
  }
  case 'information':{
   const ev=e.events||[],first=ev[0]?.intention,late=ev[1]?.intention,last=ev.at(-1)?.intention;
   if(!first||!late||!last)return null;
   const response=String(ev.at(-1)?.action||'act').replace(/^You\s+/i,'').toLowerCase();
   return 'Since '+late.toLowerCase()+', how does choosing to '+response+
    ' change your retrospective understanding?';
  }
  case 'transition':
   if(e.reallocationRequired)return 'Which consequence arose from the new constraint rather than from your preferred allocation?';
   if(e.amountsChanged)return 'When the old plan remained possible, what does your revision reveal about choosing again?';
   return 'If the original allocation still fits, what does keeping it reveal about a new constraint?';
  case 'opportunity':
   return 'Which activity would have to surrender time if you increased the other one?';
  case 'dependency':
   return 'What makes having specialist roles insufficient when one required stage is missing?';
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
