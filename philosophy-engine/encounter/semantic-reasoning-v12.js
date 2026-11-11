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
   const signatures=new Set();
   for(const o of node.options){
    if(!o.sets||!Object.keys(o.sets).length)return reject('Every option must declare a commitment.');
    const key=stable(o.sets);
    if(signatures.has(key))return reject('Options repeat the same commitment.');
    signatures.add(key);
   }
   // There must be an incompatible assignment, not merely different labels.
   if(node.options.length>1&&!node.options.some((a,i)=>node.options.slice(i+1).some(b=>Object.keys(a.sets).some(k=>k in b.sets&&a.sets[k]!==b.sets[k]))))return reject('Options are compatible rather than a philosophical fork.');
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
  if(structure.measure!==null)add('conversion',`This allocation corresponds to ${structure.measure} ${context.model.metric.unit}.`,'conditional',{measure:structure.measure});
 }else{
  const last=structure.steps.at(-1);if(!last)return reject('No decision selected.');
  add('decision',`Your final choice was to ${last.label.toLowerCase()}.`,'necessary',{choice:last.choice});
  if(structure.revisions.length)add('revision','Your later commitment differs from an earlier one; the intervening information cannot retrospectively become earlier knowledge.','necessary',structure.revisions);
  else if(structure.locked.length)add('closure','An earlier act closed alternatives; editing the scenario does not make that act reversible within it.','necessary',{locked:structure.locked});
  else if(structure.known.length>(context.model.initial||[]).length)add('information','Later information changes the basis for another decision without proving the earlier decision mistaken.','necessary',{steps:structure.steps});
  else add('uncertainty','You made a commitment without resolving every uncertainty; an unchosen route remains a possibility, not an observed outcome.','conditional',{steps:structure.steps});
 }
 const priority=['intention_gap','revision','complementarity','closure','information','conversion','repetition','opportunity','uncertainty'];
 const meaning=priority.map(k=>claims.find(c=>c.kind===k)).find(Boolean);
 if(!meaning)return reject('No justified philosophical tension detected.');
 return {version:'meaning/1.2',status:'ready',quote:context.quote,author:context.author,source:context.source,semantic:context.semantic,structure,claims,meaning,limitations:[context.semantic.boundary],assumptions:context.assumptions||[]};
}
const frames={reflective:'Consider the distinction.',surprising:'Notice what changes.',playful:'Turn the situation around.',challenging:'Test the distinction carefully.'};
const questions={intention_gap:'What would need to change for the allocation to meet the intention?',revision:'What could you reasonably have known before the later evidence arrived?',complementarity:'Which dependency makes the alternative possible?',closure:'Which earlier commitment limited the later alternatives?',information:'What changes when you separate earlier reasons from later knowledge?',conversion:'What becomes visible when the same choice is described in another measure?',repetition:'What would repeating this arrangement preserve or crowd out?',opportunity:'Which competing claim would bear the cost of a change?',uncertainty:'What remains unsettled after you have chosen?'};
export function expressSemantic(packet,mode='reflective'){
 if(packet?.version!=='meaning/1.2'||packet.status!=='ready'||!packet.claims.includes(packet.meaning)||!frames[mode])return null;
 const m=packet.meaning;
 if(!['necessary','conditional'].includes(m.classification))return null;
 const headline=(m.classification==='conditional'?'Under the scenario assumptions, ':'')+m.text;
 const experience=frames[mode];
 const interpretation=`Through ${packet.author}’s distinction between ${packet.semantic.concepts.join(' and ')}, this illustrates ${packet.semantic.relation}.`;
 const proactiveQuestion=questions[m.kind];
 const text=[headline,experience,interpretation,proactiveQuestion].join(' ');
 const wordCount=text.split(/\s+/).length;
 // Never truncate a caveat or silently add padding to satisfy a length target.
 if(wordCount<45||wordCount>70)return {status:'needs_editorial_review',wordCount,reason:'Semantic labels exceed the concise composition budget.'};
 return {status:'ready',mode,headline,experience,interpretation,proactiveQuestion,wordCount,evidence:m.evidence,classification:m.classification};
}
