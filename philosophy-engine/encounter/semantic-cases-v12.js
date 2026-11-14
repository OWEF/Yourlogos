import {transferContexts} from './kernel-contexts-v11.js';
import {constructScenario} from './semantic-reasoning-v12.js';
import {getMechanismCase} from './mechanism-transfer-cases-v02.js';
const dillardSpec=getMechanismCase('dillard'),kierkegaardSpec=getMechanismCase('kierkegaard');
export const semanticSources={
 thoreau:{...transferContexts.thoreau,semantic:{concepts:['price','life exchanged'],relation:'the temporal cost carried by a monetary choice',selection:{central:['conversion'],changeCentral:['transition'],secondaryObservations:['intention_gap'],alternatives:[],purpose:'Understand possessions through life exchanged'},boundary:transferContexts.thoreau.limit}},
 smith:{...transferContexts.smith,semantic:{concepts:['divided tasks','joint production'],relation:'the dependence of completed work on coordinated contributions',selection:{central:['specialization_effect'],changeCentral:['transition'],secondaryObservations:['complementarity'],alternatives:['dependency'],purpose:'Understand joint production through dependence'},boundary:transferContexts.smith.limit}},
 epictetus:{...transferContexts.epictetus,semantic:{concepts:['our actions','external outcomes'],relation:'the limits of what a chosen action can settle',selection:{central:['agency'],secondaryObservations:['closure'],alternatives:[],purpose:'Separate chosen action from external outcome'},boundary:'No path establishes forgiveness, indifference, or a reader’s character.'}},
 descartes:{...transferContexts.descartes,semantic:{concepts:['considering','assenting'],relation:'the need for grounds before accepting a claim',selection:{central:['assent'],secondaryObservations:['revision','closure'],alternatives:[],purpose:'Distinguish considering a claim from accepting it'},boundary:transferContexts.descartes.limit}},
 dillard:{
  id:'dillard',author:dillardSpec.author,quote:dillardSpec.quote,
  source:{work:'The Writing Life (excerpt; source review pending)',url:dillardSpec.sourceUrl},
  scenario:dillardSpec.scenario,mechanism:'tradeoff',operations:['tradeoff'],operation:'scarcity',
  assumptions:['Five identical evenings are a thought experiment, not observed behavior.'],
  relation:dillardSpec.sourceRelation,limit:dillardSpec.guard,
  semantic:{concepts:['one evening','a repeated schedule'],
   relation:'a hypothetical pattern of daily allocations accumulates across days without proving a person’s actual habits',
   selection:{central:['repetition'],secondaryObservations:[],alternatives:[],purpose:'Understand how repeated days can shape a life'},
   boundary:'The repeated schedule is imagined, not a record of your life or a ranking of activities.'}
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
   selection:{central:['information'],secondaryObservations:[],alternatives:[],purpose:'Distinguish reasons available at choice time from later interpretation'},
   boundary:'These later events are imagined; the unchosen future remains unknown.'}
 }
};
function recurringScheduleModel(spec){
 return {resources:[{id:'evening',label:'Half-hours in this evening',min:6,max:6,type:'exact'}],
  choices:spec.categories.map((label,i)=>({id:'activity-'+i,label,
   readingLabel:['writing your story','answering messages','resting and recharging'][i]||label,
   cost:[1],max:6})),
  unitLabel:'half-hour slots',unitHours:0.5};
}
function temporalDecisionModel(spec){
 const nodes={};
 function expand(i,prior,name){
  const stage=spec.steps[i],options=Array.isArray(stage.options)?stage.options:stage.options[prior];
  if(!Array.isArray(options)||!options.length)throw Error('Invalid curated temporal choices');
  nodes[name]={prompt:stage.prompt,options:options.map(o=>{
   const next=i+1<spec.steps.length?name+'/'+o.id:null;
   if(next)expand(i+1,o.id,next);
   return {id:o.id,label:o.label,action:o.label,intention:o.detail||null,next,...(i===1?{reveal:[o.label]}:{})};
  })};
 }
 expand(0,null,'first');
 return {start:'first',initial:['The unchosen path remains unobserved'],nodes};
}
// Explicit editorial admission data: provisional, not philosophical proof.
const sourceAdmissions={
 thoreau:{premiseIds:['extra_labor_constant_wage'],
  centralClaim:'Thoreau asks us to consider the life exchanged to obtain a possession, not merely its price.',
  scenarioBridge:'Working hours here depend on an imagined extra-shift wage.',
  allowedClaimKinds:['conversion','transition']},
 smith:{premiseIds:['joint_required_stages','invented_shift_rates'],
  centralClaim:'Smith explains productivity gains from dividing and specializing labour, not simply a numerical bottleneck.',
  scenarioBridge:'The invented rotating-team comparison assumes switching costs; it does not prove specialization increases productivity beyond the model.',
  allowedClaimKinds:['specialization_effect','dependency','transition'],claimPremiseIds:{specialization_effect:['hypothetical_switching_baseline']}},
 epictetus:{premiseIds:['own_response_external_forgiveness'],
  centralClaim:'Epictetus distinguishes choices and judgments within rational agency from outcomes that depend on others.',
  scenarioBridge:'Choosing whether to apologize is distinct from determining a friend’s forgiveness.',
  allowedClaimKinds:['agency']},
 descartes:{premiseIds:['ordinary_documentary_evidence_not_certainty'],
  centralClaim:'Descartes cautions against assent that exceeds what is clearly and distinctly understood.',
  scenarioBridge:'Ordinary archival evidence illustrates assent but does not establish clear-and-distinct knowledge.',
  allowedClaimKinds:['assent']},
 dillard:{premiseIds:['repeated_schedule_hypothetical'],
  centralClaim:'Dillard draws attention to the way the arrangement of days accumulates into a life.',
  scenarioBridge:'Repetition is imagined; these are not records of actual habits.',
  allowedClaimKinds:['repetition']},
 kierkegaard:{premiseIds:['later_events_imagined'],
  centralClaim:'A life must be lived forward even though an account of it is formed retrospectively, never from outside time.',
  scenarioBridge:'Later imagined events inform choices without revealing alternative futures.',
  allowedClaimKinds:['information']}
};
for(const [id,entry] of Object.entries(sourceAdmissions)){
 const source=semanticSources[id];
 if(!source?.source?.url||!source?.source?.work)throw Error('Missing source context for '+id);
 source.premiseIds=[...entry.premiseIds];
 source.semantic.admission={
  sourceUrl:source.source.url,sourceWork:source.source.work,
  mechanism:source.mechanism,operation:source.operation,
  centralClaim:entry.centralClaim,scenarioBridge:entry.scenarioBridge,
  requiredPremiseIds:[...entry.premiseIds],allowedClaimKinds:[...entry.allowedClaimKinds],
  reviewStatus:'curated_provisional',
  claimPremiseIds:entry.claimPremiseIds||{}
 };
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
 workshop:constructScenario(semanticSources.smith,{
  scenario:transferContexts.smith.scenario+' For comparison, imagine all four volunteers rotating between both tasks: with an invented time penalty for switching, they finish one booklet this shift.',
  assumptions:[...transferContexts.smith.assumptions,'The all-purpose rotating team loses thirty minutes per volunteer changing jobs; the one-booklet baseline is calculated from these invented times.'],
  premiseIds:[...semanticSources.smith.premiseIds,'hypothetical_switching_baseline'],
  model:{...transferContexts.smith.model,
   comparison:{kind:'switching_generalists',staffing:4,resourceId:'team',minutesPerWorker:60,switchingMinutesPerWorker:30,minutesPerUnit:90,
    explanation:'Each of four volunteers hypothetically has sixty minutes; switching costs thirty minutes each, and a complete booklet needs ninety total work minutes.'}},
  development:{id:'press-maintenance',kind:'hypothetical_constraint',label:'A safety inspection limits the press to two volunteers for this shift.',choiceCaps:{press:2}},
  initial:{amounts:[3,1],budgets:[4]}}),
 apology:constructScenario(semanticSources.epictetus,{assumptions:['Choosing a response cannot determine another person’s forgiveness.'],scenario:'You have hurt a friend. Decide whether to offer an apology; their response remains theirs.',model:commitmentScenario({prompt:'What will you do?',field:'response',variables:{apologyOffered:{kind:'event',owner:'self'},forgiveness:{kind:'observation',owner:'external'}},agency:{externalVariable:'forgiveness',own:'whether and when to contact the friend',external:'the friend’s forgiveness'},initial:['Your friend decides whether to forgive.'],development:'Your friend asks for space; forgiveness remains unknown.',actions:[{id:'offer',label:'Offer an apology',commitment:'offer',effects:{apologyOffered:true}},{id:'space',label:'Give space without another message',commitment:'defer'}]}),initial:{path:['offer','space']}}),
 evidence:constructScenario(semanticSources.descartes,{assumptions:['The new archive is relevant but does not settle the disputed attribution.'],scenario:'A historical exhibition contains an uncertain attribution. Decide whether to endorse it as new evidence arrives.',model:commitmentScenario({prompt:'What can the label claim?',field:'assent',assentField:'assent',domain:{states:['assent','withhold'],oppositions:[['assent','withhold']]},initial:['The attribution is disputed.'],development:'An independent archive contradicts the attribution; the dispute remains unresolved.',actions:[{id:'endorse',label:'Endorse the attribution',commitment:'assent'},{id:'suspend',label:'Suspend judgment',commitment:'withhold'}]}),initial:{path:['endorse','suspend']}}),
 dillard:constructScenario(semanticSources.dillard,{model:recurringScheduleModel(dillardSpec),initial:{amounts:[2,2,2],budgets:[6],repetitions:5}}),
 kierkegaard:constructScenario(semanticSources.kierkegaard,{model:temporalDecisionModel(kierkegaardSpec),initial:{path:['change','risk','continue']}})
};
