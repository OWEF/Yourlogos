import {mechanismFit,tradeoffStructure,decisionStructure} from './reasoning-kernel-v11.js';
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
  if(comparison.kind!=='switching_generalists'||!Number.isSafeInteger(comparison.baselineMeasure)||
   comparison.baselineMeasure<0||!Number.isSafeInteger(comparison.staffing)||comparison.staffing<1||
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
 return {status:'supported',fit};
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
   deltaAmounts,deltaSpent,deltaMetric:initial.measure===null||structure.measure===null?null:structure.measure-initial.measure,
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
   const cumulative=choices.map((c,i)=>({label:c.label,units:input.amounts[i]*input.repetitions}));
   const slots=context.model.unitLabel||'resource units';
   add('repetition','If this exact arrangement were repeated '+input.repetitions+' times, it would reserve '+
    cumulative.map(c=>c.units+' '+slots+' for '+c.label).join(', ')+
    '. This is a conditional pattern, not evidence that you will adopt it.', 'conditional',
    {totals:structure.spent.map(n=>n*input.repetitions),cumulative,repetitions:input.repetitions});
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
    'conditional',{steps:structure.steps,firstChoice:first.choice,lastChoice:last.choice,revelations});
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
  const delta=structure.measure-c.baselineMeasure;
  const reading=delta>0?'The specialized arrangement produces '+delta+' more modeled unit'+(delta===1?'':'s')+'.':
   delta===0?'The specialized allocation does not outperform the rotating team in this scenario.':
   'The specialized allocation produces '+Math.abs(delta)+' fewer modeled units under these assumptions.';
  add('specialization_effect','The stipulated rotating team finishes '+c.baselineMeasure+
   ' units; your dedicated-stage assignment finishes '+structure.measure+' units. '+reading+
   ' Neither figure is historical evidence.','conditional',
   {baseline:c.baselineMeasure,specialized:structure.measure,delta,staffing:c.staffing,explanation:c.explanation});
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
 return {version:'meaning/1.2',status:'ready',quote:context.quote,author:context.author,source:context.source,semantic:context.semantic,structure,claims,meaning,selectionTrace,
  sourceAdmission:{sourceUrl:admission.sourceUrl,sourceWork:admission.sourceWork,centralClaim:admission.centralClaim,
   scenarioBridge:admission.scenarioBridge,requiredPremiseIds:[...admission.requiredPremiseIds],
   claimPremiseIds:[...claimPremises],
   reviewStatus:admission.reviewStatus,independentlySourceVerified:false},
  limitations:[context.semantic.boundary],assumptions:context.assumptions||[]};
}
const frames={reflective:'Consider the distinction.',surprising:'Notice what changes.',playful:'Turn the situation around.',challenging:'Test the distinction carefully.'};
const questions={specialization_effect:'Under the invented rates, what would have to change for specialized work to increase what the team finishes?',transition:'Which part of the difference came from the changed conditions, and which part from your own revised choice?',intention_gap:'What would need to change for the allocation to meet the intention?',revision:'What could you reasonably have known before the later evidence arrived?',complementarity:'Which dependency makes the alternative possible?',closure:'Which earlier commitment limited the later alternatives?',information:'What changes when you separate earlier reasons from later knowledge?',conversion:'What becomes visible when the same choice is described in another measure?',repetition:'What would repeating this arrangement preserve or crowd out?',opportunity:'Which competing claim would bear the cost of a change?',uncertainty:'What remains unsettled after you have chosen?'};
// The short heading is derived from validated consequences, never philosopher IDs.
function meaningHeadline(kind,evidence={}){
 switch(kind){
  case 'transition':
   return evidence.amountsChanged?
    evidence.reallocationRequired?'The new constraint ruled out your first plan.':'You changed a plan that still could have worked.':
    'Your first allocation still works under the new condition.';
  case 'conversion': return 'This choice corresponds to '+evidence.measure+' '+evidence.unit+'.';
  case 'dependency': return 'The least-supplied stage limits what gets finished.';
  case 'specialization_effect': return 'Dedicated stages finish '+evidence.specialized+' versus '+evidence.baseline+' in the invented comparison.';
  case 'agency': return (evidence.events?.[0]?.action||'Your first response')+
   ' came first; '+(evidence.external||'the outcome')+' stayed outside your control.';
  case 'assent': return evidence.changes?.length?'Revising your judgment does not disprove the claim.':
   'Your judgment and the claim’s truth are separate questions.';
  case 'repetition': return 'Repeated evenings can form a pattern, not a prediction.';
  case 'information': return 'Later knowledge cannot go back into the first choice.';
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
  const result=e.specialized>e.baseline?'more':e.specialized===e.baseline?'the same number of':'fewer';
  return 'The imagined all-purpose team produces '+e.baseline+' finished units. Your specialized assignments produce '+
   e.specialized+', or '+result+' units under the same fictional staffing. The comparison assumes a cost of switching tasks; it is not historical evidence.';
 }
 if(m.kind==='dependency'){
  const changed=e.alternative&&e.alternative.delta>0?
   ' An allowed reassignment could raise that to '+e.alternative.measure+'.':'';
  return 'With your chosen assignment, the team finishes '+e.measure+' modeled '+(e.measure===1?'unit':'units')+'. Both stages are needed.'+changed;
 }
 if(m.kind==='repetition'){
  return 'Across '+e.repetitions+' imagined evenings, the same plan would give '+
   (e.cumulative||[]).map(c=>c.units+' half-hour slots to '+c.label).join(', ')+
   '. This does not establish your actual habits.';
 }
 if(m.kind==='information'){
  const steps=e.steps||[]; const first=steps[0],last=steps.at(-1);
  return 'You first chose to '+(first?.label||'act').toLowerCase()+
   '. Only later in the imagined route did you learn '+(e.revelations?.[0]||'something new').toLowerCase()+
   '. You then chose to '+(last?.label||'respond').toLowerCase()+
   '; no outcome of the unchosen path was observed.';
 }
 return m.text;
}
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
 const experience=(mode==='reflective'?'':frames[mode]+' ')+meaningExperience(packet,m);
 const admission=packet.sourceAdmission;
 const interpretation=admission?.centralClaim&&admission?.scenarioBridge?
  admission.centralClaim+' '+admission.scenarioBridge+' '+packet.limitations.join(' '):
  composed.interpretation+' '+packet.assumptions.join(' ')+' '+packet.limitations.join(' ');
 const proactiveQuestion=mode==='reflective'||mode==='challenging'?(questions[m.kind]||composed.question):composed.question;
 const text=[headline,experience,interpretation,proactiveQuestion].join(' ');
 const wordCount=text.split(/\s+/).length;
 // Never truncate a caveat or silently add padding to satisfy a length target.
 if(wordCount>160)return {status:'needs_editorial_review',wordCount,reason:'Reading exceeds the safety ceiling; editorial shortening is required.'};
 return {status:'ready',mode,headline,experience,interpretation,proactiveQuestion,wordCount,evidence:m.evidence,classification:m.classification};
}
