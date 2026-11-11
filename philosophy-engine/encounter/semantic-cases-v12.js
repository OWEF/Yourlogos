import {transferContexts} from './kernel-contexts-v11.js';
import {constructScenario} from './semantic-reasoning-v12.js';
export const semanticSources={
 thoreau:{...transferContexts.thoreau,semantic:{concepts:['price','life exchanged'],relation:'the temporal cost carried by a monetary choice',boundary:transferContexts.thoreau.limit}},
 smith:{...transferContexts.smith,semantic:{concepts:['divided tasks','joint production'],relation:'the dependence of completed work on coordinated contributions',boundary:transferContexts.smith.limit}},
 epictetus:{...transferContexts.epictetus,semantic:{concepts:['our actions','external outcomes'],relation:'the limits of what a chosen action can settle',boundary:transferContexts.epictetus.limit}},
 descartes:{...transferContexts.descartes,semantic:{concepts:['considering','assenting'],relation:'the need for grounds before accepting a claim',boundary:transferContexts.descartes.limit}}
};
// Generate a two-stage commitment graph from options and subsequent information.
// No philosopher or quotation identity is consulted by the constructor.
export function commitmentScenario({prompt,field,actions,development,initial=[]}){
 const options=actions.map(a=>({...a,sets:{[field]:a.commitment},next:'later',reveal:[development]}));
 const later=actions.map(a=>({...a,sets:{[field]:a.commitment},next:null}));
 return {start:'first',initial,nodes:{first:{prompt,options},later:{prompt:development,options:later}}};
}
export const semanticCases={
 money:constructScenario(semanticSources.thoreau,{model:transferContexts.thoreau.model,initial:{amounts:[1,0,1],budgets:[8],intentions:{lamp:1},repetitions:5}}),
 workshop:constructScenario(semanticSources.smith,{model:transferContexts.smith.model,initial:{amounts:[3,1],budgets:[4]}}),
 apology:constructScenario(semanticSources.epictetus,{scenario:'You have hurt a friend. Decide whether to offer an apology; their response remains theirs.',model:commitmentScenario({prompt:'What will you do?',field:'response',initial:['Your friend decides whether to forgive.'],development:'Your friend asks for space; forgiveness remains unknown.',actions:[{id:'offer',label:'Offer an apology',commitment:'offer'},{id:'space',label:'Give space without another message',commitment:'defer'}]}),initial:{path:['offer','space']}}),
 evidence:constructScenario(semanticSources.descartes,{scenario:'A historical exhibition contains an uncertain attribution. Decide whether to endorse it as new evidence arrives.',model:commitmentScenario({prompt:'What can the label claim?',field:'assent',initial:['The attribution is disputed.'],development:'An independent archive contradicts the attribution; the dispute remains unresolved.',actions:[{id:'endorse',label:'Endorse the attribution',commitment:'assent'},{id:'suspend',label:'Suspend judgment',commitment:'withhold'}]}),initial:{path:['endorse','suspend']}})
};
