import {transferContexts} from './kernel-contexts-v11.js';
import {constructScenario} from './semantic-reasoning-v12.js';
import {getMechanismCase} from './mechanism-transfer-cases-v02.js';
const dillardSpec=getMechanismCase('dillard'),kierkegaardSpec=getMechanismCase('kierkegaard');
export const semanticSources={
 thoreau:{...transferContexts.thoreau,semantic:{concepts:['price','life exchanged'],relation:'the temporal cost carried by a monetary choice',selection:{central:['conversion'],changeCentral:['transition'],alternatives:[],purpose:'Understand possessions through life exchanged'},boundary:transferContexts.thoreau.limit}},
 smith:{...transferContexts.smith,semantic:{concepts:['divided tasks','joint production'],relation:'the dependence of completed work on coordinated contributions',selection:{central:['dependency'],changeCentral:['transition'],alternatives:[],purpose:'Understand joint production through dependence'},boundary:transferContexts.smith.limit}},
 epictetus:{...transferContexts.epictetus,semantic:{concepts:['our actions','external outcomes'],relation:'the limits of what a chosen action can settle',selection:{central:['agency'],alternatives:[],purpose:'Separate chosen action from external outcome'},boundary:'No path establishes forgiveness, indifference, or a reader’s character.'}},
 descartes:{...transferContexts.descartes,semantic:{concepts:['considering','assenting'],relation:'the need for grounds before accepting a claim',selection:{central:['assent'],alternatives:[],purpose:'Distinguish considering a claim from accepting it'},boundary:transferContexts.descartes.limit}},
 dillard:{
  id:'dillard',author:dillardSpec.author,quote:dillardSpec.quote,
  source:{work:'The Writing Life (excerpt; source review pending)',url:dillardSpec.sourceUrl},
  scenario:dillardSpec.scenario,mechanism:'tradeoff',operations:['tradeoff'],operation:'scarcity',
  assumptions:['Five identical evenings are a thought experiment, not observed behavior.'],
  relation:dillardSpec.sourceRelation,limit:dillardSpec.guard,
  semantic:{concepts:['one evening','a repeated schedule'],
   relation:'a hypothetical pattern of daily allocations accumulates across days without proving a person’s actual habits',
   selection:{central:['repetition'],alternatives:[],purpose:'Understand how repeated days can shape a life'},
   boundary:dillardSpec.guard}
 },
 kierkegaard:{
  id:'kierkegaard',author:kierkegaardSpec.author,
  quote:'Life can only be understood backwards; but it must be lived forwards.',
  source:{work:'Journal JJ:167 (shortened quotation; wording review pending)',url:kierkegaardSpec.sourceUrl},
  scenario:kierkegaardSpec.scenario,mechanism:'decision_map',operations:['decision_map'],operation:'information',
  assumptions:['Later branches are imagined events, not predictions of this user’s life.'],
  relation:kierkegaardSpec.sourceRelation,limit:kierkegaardSpec.guard,
  semantic:{concepts:['acting forward','understanding backward'],
   relation:'later perspective can illuminate what happened without providing the unchosen future or retroactive certainty',
   selection:{central:['information'],alternatives:[],purpose:'Distinguish reasons available at choice time from later interpretation'},
   boundary:kierkegaardSpec.guard}
 }
};
function recurringScheduleModel(spec){
 return {resources:[{id:'evening',label:'Half-hours in this evening',min:6,max:6,type:'exact'}],
  choices:spec.categories.map((label,i)=>({id:'activity-'+i,label,cost:[1],max:6})),
  unitLabel:'half-hour slots'};
}
function temporalDecisionModel(spec){
 const nodes={};
 function expand(i,prior,name){
  const stage=spec.steps[i],options=Array.isArray(stage.options)?stage.options:stage.options[prior];
  if(!Array.isArray(options)||!options.length)throw Error('Invalid curated temporal choices');
  nodes[name]={prompt:stage.prompt,options:options.map(o=>{
   const next=i+1<spec.steps.length?name+'/'+o.id:null;
   if(next)expand(i+1,o.id,next);
   return {id:o.id,label:o.label,action:o.label,next,...(i===1?{reveal:[o.label]}:{})};
  })};
 }
 expand(0,null,'first');
 return {start:'first',initial:['The unchosen path remains unobserved'],nodes};
}
// Generate a two-stage commitment graph from options and subsequent information.
// No philosopher or quotation identity is consulted by the constructor.
export function commitmentScenario({prompt,field,actions,development,initial=[],domain=null,agency=null,assentField=null,variables={}}){
 const options=actions.map(a=>({...a,action:a.label,...(domain?{commitments:{[field]:a.commitment}}:{}),next:'later',reveal:[development]}));
 const later=actions.map(a=>({...a,action:a.label,...(domain?{commitments:{[field]:a.commitment}}:{}),next:null}));
 return {start:'first',initial,agency,assentField,variables,commitmentDomains:domain?{[field]:domain}:null,nodes:{first:{prompt,options},later:{prompt:development,options:later}}};
}
export const semanticCases={
 money:constructScenario(semanticSources.thoreau,{model:transferContexts.thoreau.model,development:{id:'essential-bill',kind:'hypothetical_constraint',label:'An essential bill limits the remaining furnishing budget to six $20 tokens.',resourceCaps:{money:6}},initial:{amounts:[1,0,1],budgets:[8],intentions:{lamp:1},repetitions:5}}),
 workshop:constructScenario(semanticSources.smith,{model:transferContexts.smith.model,development:{id:'press-maintenance',kind:'hypothetical_constraint',label:'A safety inspection limits the press to two volunteers for this shift.',choiceCaps:{press:2}},initial:{amounts:[3,1],budgets:[4]}}),
 apology:constructScenario(semanticSources.epictetus,{assumptions:['Choosing a response cannot determine another person’s forgiveness.'],scenario:'You have hurt a friend. Decide whether to offer an apology; their response remains theirs.',model:commitmentScenario({prompt:'What will you do?',field:'response',variables:{apologyOffered:{kind:'event',owner:'self'},forgiveness:{kind:'observation',owner:'external'}},agency:{externalVariable:'forgiveness',own:'whether and when to contact the friend',external:'the friend’s forgiveness'},initial:['Your friend decides whether to forgive.'],development:'Your friend asks for space; forgiveness remains unknown.',actions:[{id:'offer',label:'Offer an apology',commitment:'offer',effects:{apologyOffered:true}},{id:'space',label:'Give space without another message',commitment:'defer'}]}),initial:{path:['offer','space']}}),
 evidence:constructScenario(semanticSources.descartes,{assumptions:['The new archive is relevant but does not settle the disputed attribution.'],scenario:'A historical exhibition contains an uncertain attribution. Decide whether to endorse it as new evidence arrives.',model:commitmentScenario({prompt:'What can the label claim?',field:'assent',assentField:'assent',domain:{states:['assent','withhold'],oppositions:[['assent','withhold']]},initial:['The attribution is disputed.'],development:'An independent archive contradicts the attribution; the dispute remains unresolved.',actions:[{id:'endorse',label:'Endorse the attribution',commitment:'assent'},{id:'suspend',label:'Suspend judgment',commitment:'withhold'}]}),initial:{path:['endorse','suspend']}}),
 dillard:constructScenario(semanticSources.dillard,{model:recurringScheduleModel(dillardSpec),initial:{amounts:[2,2,2],budgets:[6],repetitions:5}}),
 kierkegaard:constructScenario(semanticSources.kierkegaard,{model:temporalDecisionModel(kierkegaardSpec),initial:{path:['change','risk','continue']}})
};
