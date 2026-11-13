import {semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
const samples=Object.entries(semanticCases).map(([id,context])=>({id,context,input:context.initial}));
for(const [id,input] of [
 ['money',{amounts:[1,1,1],budgets:[6],first:{amounts:[1,2,1],budgets:[8]},developmentId:'essential-bill'}],
 ['workshop',{amounts:[2,2],budgets:[4],first:{amounts:[3,1],budgets:[4]},developmentId:'press-maintenance'}],
 ['kierkegaard',{path:['stay','missed','reflect']}],
 ['dillard',{amounts:[0,4,2],budgets:[6],repetitions:5}]
])samples.push({id:id+'-counterfactual',context:semanticCases[id],input});
for(const sample of samples){
 const result=reasonSemantically(sample.context,sample.input);
 if(result.status!=='ready')throw Error(sample.id+': '+result.reason);
 const e=expressSemantic(result);
 if(e.status!=='ready')throw Error(sample.id+': '+e.reason);
 process.stdout.write('CZ13-EDITORIAL '+JSON.stringify({id:sample.id,kind:result.meaning.kind,
  sourceStatus:result.sourceAdmission.reviewStatus,
  words:e.wordCount,heading:e.headline,experience:e.experience,
  interpretation:e.interpretation,reflection:e.proactiveQuestion})+'\n');
}
