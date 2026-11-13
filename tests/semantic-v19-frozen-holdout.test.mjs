// Independently authored after freezing the six-source core at
// 7a9640d9bc152ca2c5ace6cb4b01c0b804a33874. This fixture is never a
// justification to modify the kernel and keep calling the same fixture unseen.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {constructScenario,reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';
import {semanticSources,commitmentScenario} from '../philosophy-engine/encounter/semantic-cases-v12.js';

const seneca={
 id:'holdout-seneca',author:'Seneca',
 quote:'We do not have a very short time assigned to us, but we lose a great deal of it.',
 source:{work:'On the Shortness of Life, chapter 1 (Aubrey Stewart translation)',url:'https://thestoiclibrary.com/shortness-of-life/1'},
 mechanism:'tradeoff',operations:['tradeoff'],operation:'scarcity',
 assumptions:['These six free half-hour slots are an imagined discretionary interval after necessary obligations.'],
 relation:'Seneca questions how deliberately finite time is used, not whether a particular kind of work is intrinsically worthwhile.',
 limit:'No allocation of one imagined interval establishes a whole life wasted, a habit, or the moral worth of any activity.',
 premiseIds:['finite_discretionary_time'],
 semantic:{concepts:['finite discretionary time','competing claims'],relation:'one feasible use displaces another when the available time is fully allocated',
  boundary:'A hypothetical interval cannot diagnose the reader or prove a life has been wasted.',
  selection:{central:['opportunity'],alternatives:[],purpose:'Consider what is displaced under an explicitly finite time constraint'},
  admission:{
   sourceUrl:'https://thestoiclibrary.com/shortness-of-life/1',
   sourceWork:'On the Shortness of Life, chapter 1 (Aubrey Stewart translation)',
   mechanism:'tradeoff',operation:'scarcity',
   centralClaim:'Seneca distinguishes the number of years lived from whether their time is put to deliberate use.',
   scenarioBridge:'Giving one imagined leisure activity more time must take time from another; neither choice diagnoses a whole life.',
   requiredPremiseIds:['finite_discretionary_time'],allowedClaimKinds:['opportunity'],reviewStatus:'curated_provisional'
  }},
 model:{resources:[{id:'discretionary',label:'Free half-hours',min:6,max:6,type:'exact'}],
   choices:[{id:'read',label:'reading',max:6,cost:[1]},{id:'walk',label:'walking',max:6,cost:[1]}]}
};

test('NEW SOURCE holdout: Seneca transfers through generic scarcity operations without any philosopher dispatch',()=>{
 const a=reasonSemantically(seneca,{amounts:[4,2],budgets:[6]});
 const b=reasonSemantically(seneca,{amounts:[2,4],budgets:[6]});
 for(const packet of [a,b]){
  assert.equal(packet.status,'ready',packet.reason);
  assert.equal(packet.meaning.kind,'opportunity');
  assert.equal(expressSemantic(packet).status,'ready');
  assert.match(expressSemantic(packet).interpretation,/Seneca/);
  assert.equal(packet.sourceAdmission.independentlySourceVerified,false);
 }
 assert.notDeepEqual(a.structure.amounts,b.structure.amounts);
 assert.notDeepEqual(a.meaning.evidence,b.meaning.evidence);
 assert.equal(reasonSemantically(seneca,{amounts:[7,-1],budgets:[6]}).status,'incompatible');
 const lacking=structuredClone(seneca);lacking.premiseIds=[];
 assert.equal(reasonSemantically(lacking,{amounts:[4,2],budgets:[6]}).status,'incompatible');
});

test('UNSEEN SCENARIO holdout: owned request and external committee decision never become the same agency',()=>{
 const model=commitmentScenario({prompt:'How do you respond?',field:'contact',
  variables:{requestSent:{kind:'event',owner:'self'},selection:{kind:'observation',owner:'external'}},
  agency:{externalVariable:'selection',own:'whether to contact the committee',external:'the committee’s selection decision'},
  initial:['The committee selects applicants independently.'],
  development:'The selection committee has not decided.',
  actions:[{id:'contact',label:'Send a request',commitment:'contact',effects:{requestSent:true}},
           {id:'pause',label:'Pause further contact',commitment:'pause'}]});
 const c=constructScenario(semanticSources.epictetus,{model,initial:{path:['contact','pause']}});
 const a=reasonSemantically(c,{path:['contact','pause']});
 const b=reasonSemantically(c,{path:['pause','pause']});
 assert.equal(a.status,'ready',a.reason);
 assert.equal(b.status,'ready',b.reason);
 assert.equal(a.meaning.kind,'agency');
 assert.equal(a.structure.occurred.requestSent,true);
 assert.equal(b.structure.occurred.requestSent,undefined);
 assert.notEqual(expressSemantic(a).headline,expressSemantic(b).headline);
 const invalid=structuredClone(c);
 invalid.model.nodes.later.options[1].effects={requestSent:false};
 assert.equal(reasonSemantically(invalid,{path:['contact','pause']}).status,'incompatible');
});
