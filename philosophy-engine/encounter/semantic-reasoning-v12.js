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
 if(context.mechanism==='decision_map'){
  for(const node of Object.values(m.nodes)){
   if(node.options.some(o=>!o.action && !o.label))return reject('An observable action is required.');
   for(const o of node.options)for(const [field,value] of Object.entries(o.commitments||{})){
    if(!m.commitmentDomains?.[field]?.states?.includes(value))return reject('Commitment state lacks a declared semantic domain.');
   }
  }
 }
 return {status:'supported',fit};
}
export function reasonSemantically(context,input){
 const tension=validateTension(context);if(tension.status!=='supported')return tension;
 const trade=context.mechanism==='tradeoff';
 const structure=trade?tradeoffStructure(context.model,input):decisionStructure(context.model,input?.path);
 if(!structure||!trade&&structure.at!==null)return reject('Incomplete or infeasible selections.');
 const claims=[];
 const add=(kind,text,classification='conditional',evidence={})=>claims.push({kind,text,classification,evidence,assumptions:context.assumptions||[]});
 if(trade){
  const choices=context.model.choices;
  add('allocation',choices.map((c,i)=>`${input.amounts[i]} ${c.label}`).join(', '),'necessary',{amounts:input.amounts});
  const intentions=input.intentions||{};
  for(const [id,target] of Object.entries(intentions)){
   const i=choices.findIndex(c=>c.id===id);
   if(i<0||!Number.isSafeInteger(target)||target<0)return reject('Invalid stated intention.');
   if(input.amounts[i]<target)add('intention_gap',`Your allocation to ${choices[i].label} falls below your stated target.`, 'necessary',{id,target,actual:input.amounts[i]});
  }
  if(input.repetitions!==undefined){
   if(!Number.isSafeInteger(input.repetitions)||input.repetitions<2||input.repetitions>1000)return reject('Invalid repetition horizon.');
   add('repetition',`Repeating this allocation ${input.repetitions} times repeats its resource demands; it does not establish a habit.`, 'conditional',{totals:structure.spent.map(n=>n*input.repetitions)});
  }
  const better=context.model.metric?.op==='minimum'?structure.alternatives.find(a=>a.delta>0):null;
  if(better)add('complementarity',`Reallocating one unit can increase the modeled result from ${structure.measure} to ${better.measure}.`,'conditional',better);
  else if(structure.alternatives.length)add('opportunity',structure.slack.every(n=>n===0)?'A feasible increase here requires releasing resources elsewhere.':'Unused capacity permits a change without displacing every existing allocation.','conditional',structure.alternatives[0]);
  if(structure.measure!==null)add('conversion',`This allocation corresponds to ${structure.measure} ${context.model.metric.unit}.`,'conditional',{measure:structure.measure,unit:context.model.metric.unit});
 }else{
  const last=structure.steps.at(-1);if(!last)return reject('No decision selected.');
  add('decision',`Your final choice was to ${last.label.toLowerCase()}.`,'necessary',{choice:last.choice});
  const ledger={},changes=[],events=[];
  for(const step of structure.steps){
   const option=context.model.nodes[step.node].options.find(o=>o.id===step.choice);
   const event={action:option.action||option.label,intention:option.intention||null,before:step.before,externalInformation:step.revealed,relationships:[]};
   for(const [field,value] of Object.entries(option.commitments||{})){
    const prior=ledger[field],domain=context.model.commitmentDomains[field];
    if(prior!==undefined&&prior!==value){
     if(domain.oppositions?.some(pair=>pair.includes(prior)&&pair.includes(value))){
      const change={field,from:prior,to:value,at:events.length,evidenceAvailable:step.before};changes.push(change);event.relationships.push('genuine_revision');
     }else event.relationships.push('unresolved_relationship');
    }else if(prior===value)event.relationships.push('compatible_continuation');
    ledger[field]=value;
   }
   if(!Object.keys(option.commitments||{}).length)event.relationships.push('action_succession');
   events.push(event);
  }
  structure.semanticEvents=events;structure.semanticRevisions=changes;
  if(changes.length)add('revision','You explicitly changed a commitment; this does not establish that the earlier decision was mistaken.','necessary',{changes,events});
  if(structure.locked.length)add('closure','An earlier act closed alternatives; editing the scenario does not make that act reversible within it.','necessary',{locked:structure.locked});
  if(structure.known.length>(context.model.initial||[]).length)add('information','Later information changes the basis for another decision without proving the earlier decision mistaken.','necessary',{steps:structure.steps});
  const control=context.model.agency;
  if(control?.external&&control?.own)add('agency',`You chose to ${events.map(e=>e.action.toLowerCase()).join(', then ')}; ${control.external} remains outside those choices.`, 'conditional',{action:last.label,own:control.own,external:control.external,events});
  if(context.model.assentField&&Object.hasOwn(ledger,context.model.assentField))add('assent',changes.length?'You changed your stated position on the claim.':'You maintained your stated position on the claim.','necessary',{commitments:ledger,changes,events,position:ledger[context.model.assentField]});
  add('uncertainty','An unchosen route remains a possibility, not an observed outcome.','conditional',{steps:structure.steps});

 }
 if(trade&&context.model.metric?.op==='minimum')add('dependency',`The arrangement completes ${structure.measure} ${structure.measure===1?(context.model.metric.singular||context.model.metric.unit):context.model.metric.unit}; completion depends on all required stages.`, 'conditional',{measure:structure.measure,components:input.amounts.map((n,i)=>n*context.model.metric.weights[i]),alternative:structure.alternatives.find(a=>a.delta>0)||null});
 const contract=context.semantic.selection;
 if(!contract?.central?.length)return reject('No source-sensitive meaning warrant supplied.');
 const selectionTrace=claims.map(c=>({kind:c.kind,sourceFidelity:contract.central.includes(c.kind)?'central':contract.alternatives?.includes(c.kind)?'secondary':'observation_only',pathRelevant:Object.keys(c.evidence).length>0,evidentialWarrant:c.classification!=='unsupported',conceptualRelationship:context.semantic.relation,educationalPurpose:contract.purpose,uncertainty:c.assumptions}));
 const eligible=claims.filter(c=>contract.central.includes(c.kind)&&Object.keys(c.evidence).length);
 const secondary=claims.filter(c=>contract.alternatives?.includes(c.kind)&&Object.keys(c.evidence).length);
 const candidates=eligible.length?eligible:secondary;
 if(candidates.length!==1)return reject(candidates.length?'Several source-relevant meanings require editorial disambiguation.':'No source-relevant consequence is warranted.');
 const meaning=candidates[0];
 if(!meaning)return reject('No justified philosophical tension detected.');
 return {version:'meaning/1.2',status:'ready',quote:context.quote,author:context.author,source:context.source,semantic:context.semantic,structure,claims,meaning,selectionTrace,limitations:[context.semantic.boundary],assumptions:context.assumptions||[]};
}
const frames={reflective:'Consider the distinction.',surprising:'Notice what changes.',playful:'Turn the situation around.',challenging:'Test the distinction carefully.'};
const questions={intention_gap:'What would need to change for the allocation to meet the intention?',revision:'What could you reasonably have known before the later evidence arrived?',complementarity:'Which dependency makes the alternative possible?',closure:'Which earlier commitment limited the later alternatives?',information:'What changes when you separate earlier reasons from later knowledge?',conversion:'What becomes visible when the same choice is described in another measure?',repetition:'What would repeating this arrangement preserve or crowd out?',opportunity:'Which competing claim would bear the cost of a change?',uncertainty:'What remains unsettled after you have chosen?'};
export function expressSemantic(packet,mode='reflective'){
 if(packet?.version!=='meaning/1.2'||packet.status!=='ready'||!packet.claims.includes(packet.meaning)||!frames[mode])return null;
 const m=packet.meaning;
 if(!['necessary','conditional'].includes(m.classification))return null;
 const headline=m.classification==='conditional'?'Under the scenario assumptions, '+m.text[0].toLowerCase()+m.text.slice(1):m.text;
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
 const experience=composed.experience;
 const interpretation=composed.interpretation+' '+packet.assumptions.join(' ')+' '+packet.limitations.join(' ');
 const proactiveQuestion=composed.question;
 const text=[headline,experience,interpretation,proactiveQuestion].join(' ');
 const wordCount=text.split(/\s+/).length;
 // Never truncate a caveat or silently add padding to satisfy a length target.
 if(wordCount>160)return {status:'needs_editorial_review',wordCount,reason:'Reading exceeds the safety ceiling; editorial shortening is required.'};
 return {status:'ready',mode,headline,experience,interpretation,proactiveQuestion,wordCount,evidence:m.evidence,classification:m.classification};
}
