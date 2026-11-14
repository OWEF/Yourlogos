import {test} from 'node:test';
import assert from 'node:assert/strict';
import {semanticCases} from '../philosophy-engine/encounter/semantic-cases-v12.js';
import {reasonSemantically,expressSemantic} from '../philosophy-engine/encounter/semantic-reasoning-v12.js';

const versions=['reflective','surprising','playful','challenging'];
const packets=Object.entries(semanticCases).map(([id,scenario])=>({
 id,packet:reasonSemantically(scenario,scenario.initial)
}));

test('v1.9 meaning-first headings are readable and do not conflate editorial assumptions with observed facts',()=>{
 for(const {id,packet} of packets){
  assert.equal(packet.status,'ready',id+': '+packet.reason);
  const modes=versions.map(mode=>expressSemantic(packet,mode));
  for(const output of modes){
   assert.equal(output.status,'ready',id+': '+JSON.stringify(output));
   assert.ok(output.headline.split(/\s+/).length<=14,id+': overlong heading '+output.headline);
   assert.doesNotMatch(output.headline,/under the scenario assumptions/i);
   assert.ok(output.interpretation.includes(packet.sourceAdmission.centralClaim),id+' source argument absent');
   assert.ok(output.interpretation.includes(packet.sourceAdmission.scenarioBridge),id+' source analogy absent');
   assert.ok(output.interpretation.includes(packet.limitations[0]),id+' uncertainty absent');
   assert.ok(output.wordCount<=160,id+': exceeds safety ceiling');
   assert.equal(output.classification,packet.meaning.classification);
   assert.deepEqual(output.evidence,packet.meaning.evidence);
  }
  assert.ok(new Set(modes.map(x=>x.experience+' '+x.proactiveQuestion)).size>=3,id+' voices became identical');
 }
});

test('initial and revised tradeoff choices have distinct comprehensible reading even with same ending',()=>{
 const scenario=semanticCases.money;
 const first={amounts:[1,2,1],budgets:[8]};
 const changed=reasonSemantically(scenario,{first,developmentId:scenario.development.id,
  amounts:[1,1,1],budgets:[6]});
 const retained=reasonSemantically(scenario,{first:{amounts:[1,1,1],budgets:[8]},developmentId:scenario.development.id,
  amounts:[1,1,1],budgets:[6]});
 for(const packet of [changed,retained])assert.equal(packet.status,'ready');
 const changedText=expressSemantic(changed),retainedText=expressSemantic(retained);
 assert.equal(changedText.status,'ready');
 assert.equal(retainedText.status,'ready');
 assert.notEqual(changedText.headline,retainedText.headline);
 assert.notEqual(changedText.experience,retainedText.experience);
 assert.match(changedText.experience,/extra working hours/);
 assert.match(changedText.experience,/earlier plan no longer fit/);
 assert.match(retainedText.experience,/kept the original quantities/);
});

test('repetition is neither a prediction of habit nor a claim about the participant',()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[1,2,3],budgets:[6],repetitions:5});
 const rendered=expressSemantic(p);
 assert.equal(rendered.status,'ready');
 assert.match(rendered.experience,/imagined evenings/);
 assert.match(rendered.experience,/hours for writing your story/);
 assert.doesNotMatch(rendered.experience,/half-hour slots/);
 assert.match(rendered.experience,/does not establish your actual habits/);
});

test('an unchosen Kierkegaard route is never treated as an experienced future',()=>{
 const p=reasonSemantically(semanticCases.kierkegaard,{path:['stay','missed','reflect']});
 const rendered=expressSemantic(p);
 assert.equal(rendered.status,'ready');
 assert.match(rendered.experience,/imagined scenario/);
 assert.doesNotMatch(rendered.experience,/chose to you |learn you /i);
 assert.match(rendered.experience,/outcome of the unchosen path is still unknown/);
});


test('v1.9.1 RED: stable source thesis receives a distinct path-grounded explanation',()=>{
 const source=semanticCases.money;
 const zero=expressSemantic(reasonSemantically(source,{amounts:[0,0,0],budgets:[8]}));
 const paid=expressSemantic(reasonSemantically(source,{amounts:[1,2,1],budgets:[8]}));
 assert.equal(zero.status,'ready');assert.equal(paid.status,'ready');
 assert.notEqual(zero.interpretation,paid.interpretation,
  'Section II cannot consist solely of identical source-level boilerplate');
});


test('v1.9.1 adversarial: Kierkegaard hindsight uses the later event, never pre-existing uncertainty',()=>{
 const p=reasonSemantically(semanticCases.kierkegaard,{path:['stay','missed','reflect']});
 assert.equal(p.status,'ready');
 const reading=expressSemantic(p);
 assert.equal(reading.status,'ready');
 assert.match(reading.interpretation,/keep wondering about the offer/i);
 assert.match(reading.proactiveQuestion,/keep wondering about the offer/i);
 assert.doesNotMatch(reading.interpretation,/later situation.*cannot see the other future/i);
});

test('v1.9.1 adversarial: Dillard uncertainty is stated without repeating the same habit disclaimer',()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[0,3,3],budgets:[6],repetitions:5});
 const reading=expressSemantic(p);
 assert.equal(reading.status,'ready');
 const notes=(reading.interpretation.match(/(?:not records of actual habits|not a record of your life)/gi)||[]);
 assert.ok(notes.length<=1,'repeated habit disclaimers bury the philosophical explanation');
});


// CZ-13 v1.9.2 adversarial RED fixtures: implementation-authored regression tests,
// never a substitute for independently authored, post-freeze blind holdouts.
test('v1.9.2 A: a different admitted conversion source must not inherit purchases, Thoreau or wages',()=>{
 const c=structuredClone(semanticCases.money);
 c.id='effort-conversion'; c.author='Editorial Converter'; c.quote='Every choice carries an effort cost.';
 c.source={work:'Illustrative conversion editorial fixture',url:'https://example.org/editorial-conversion'};
 c.scenario='Choose how many repairs, service calls and checks fit an assumed effort budget.';
 c.assumptions=['Units of effort are hypothetical, not measured personal time.'];
 c.semantic.boundary='Hypothetical effort is not observed personal labor or moral worth.';
 c.semantic.admission.sourceUrl=c.source.url;
 c.semantic.admission.sourceWork=c.source.work;
 c.semantic.admission.centralClaim='The illustrative text relates counted activities to modeled effort.';
 c.semantic.admission.scenarioBridge='Each activity has an assumed effort rate; this is not observed reality.';
 c.model.metric.unit='effort units';
 c.model.choices[0].label='equipment repairs';c.model.choices[0].singular='equipment repair';
 c.model.choices[1].label='inspection calls';c.model.choices[1].singular='inspection call';
 c.model.choices[2].label='safety checks';c.model.choices[2].singular='safety check';
 const p=reasonSemantically(c,{amounts:[1,0,1],budgets:[8]});
 assert.equal(p.status,'ready',p.reason);
 const o=expressSemantic(p);
 assert.equal(o.status,'ready',o.reason);
 const all=[o.headline,o.experience,o.interpretation,o.proactiveQuestion].join(' ');
 assert.doesNotMatch(all,/Thoreau|purchase|wage|earnings|working hours|reading lamp/i);
 assert.match(o.proactiveQuestion,/effort|allocation|activity|choice/i);
});

test('v1.9.2 B: repeated contact does not create forgiveness or person-specific agency claims',()=>{
 const c=structuredClone(semanticCases.apology);
 c.scenario='You may contact an independent selection committee about an application.';
 c.assumptions=['A request cannot determine the committee selection.'];
 c.semantic.boundary='No request determines the selection outcome or character of an applicant.';
 c.semantic.admission.scenarioBridge='Requesting consideration and controlling selection are different matters.';
 c.model.agency={externalVariable:'selection',own:'whether to contact the committee',external:'the committee selection decision'};
 c.model.variables={requestSent:{kind:'event',owner:'self'},selection:{kind:'observation',owner:'external'}};
 c.model.initial=['The committee chooses independently.'];
 for(const [i,node] of [c.model.nodes.first,c.model.nodes.later].entries()){
  node.prompt=i?'A response has not arrived.':'How will you proceed?';
  node.options=[{id:'contact',label:'Contact the committee',action:'Contact the committee',next:i?null:'later',effects:{requestSent:true}},
   {id:'wait',label:'Wait without contacting',action:'Wait without contacting',next:i?null:'later'}];
 }
 const p=reasonSemantically(c,{path:['contact','contact']});
 assert.equal(p.status,'ready',p.reason);
 const o=expressSemantic(p);
 assert.equal(o.status,'ready',o.reason);
 assert.doesNotMatch([o.headline,o.experience,o.interpretation,o.proactiveQuestion].join(' '),/forgiv|friend|apolog|other person/i);
 assert.match(o.proactiveQuestion,/committee|selection|request|contact|external/i);
});

test('v1.9.2 C: stage bottleneck comes from capacities, not identical worker counts',()=>{
 const c=structuredClone(semanticCases.workshop);
 c.scenario='Four workers build devices across fabrication and inspection stages; all rates are invented.';
 c.model.choices[0]={...c.model.choices[0],label:'fabricators',singular:'fabricator'};
 c.model.choices[1]={...c.model.choices[1],label:'inspectors',singular:'inspector'};
 c.model.metric.weights=[3,1]; c.model.metric.unit='finished devices'; c.model.metric.singular='finished device';
 const p=reasonSemantically(c,{amounts:[2,2],budgets:[4]});
 assert.equal(p.status,'ready',p.reason);
 const o=expressSemantic(p);
 assert.equal(o.status,'ready',o.reason);
 assert.match(o.interpretation+' '+o.proactiveQuestion,/inspectors|inspection/i);
 assert.doesNotMatch(o.proactiveQuestion,/Smith|booklet|press operator/i);
 const n=reasonSemantically(c,{amounts:[1,3],budgets:[4]});
 assert.equal(n.status,'ready',n.reason);
 const v=expressSemantic(n);
 assert.equal(v.status,'ready',v.reason);
 assert.doesNotMatch(v.proactiveQuestion,/thinner stage|equal workers|press operator/i);
 const dep=structuredClone(c);delete dep.model.comparison;
 const dp=reasonSemantically(dep,{amounts:[2,2],budgets:[4]});
 assert.equal(dp.status,'ready',dp.reason);
 assert.equal(dp.meaning.kind,'dependency');
 assert.match(expressSemantic(dp).proactiveQuestion,/inspectors|inspection/i);
});

test('v1.9.2 D: a non-writing repeated schedule cannot invent a story or writing goal',()=>{
 const c=structuredClone(semanticCases.dillard);
 c.id='rhythms'; c.author='Editorial Routine Source';c.quote='Repeated intervals shape what gets sustained.';
 c.source={work:'Illustrative recurrence editorial fixture',url:'https://example.org/editorial-recurrence'};
 c.scenario='Allocate time among training, visiting family and resting.';
 c.semantic.admission.sourceUrl=c.source.url;
 c.semantic.admission.sourceWork=c.source.work;
 c.semantic.admission.centralClaim='The illustrative passage proposes that repeated routines preserve activity patterns.';
 c.semantic.admission.scenarioBridge='Five identical imagined evenings model recurrence rather than real behavior.';
 const names=['training','visiting family','resting'];
 c.model.choices.forEach((x,i)=>{x.label=names[i];x.readingLabel=names[i]});
 const p=reasonSemantically(c,{amounts:[0,3,3],budgets:[6],repetitions:5});
 assert.equal(p.status,'ready',p.reason);
 const o=expressSemantic(p);assert.equal(o.status,'ready',o.reason);
 const all=[o.headline,o.experience,o.interpretation,o.proactiveQuestion].join(' ');
 assert.doesNotMatch(all,/Dillard|writing|story|messages|replies/i);
 assert.match(o.proactiveQuestion,/train|family|rest|schedule|pattern|routine/i);
});

test('v1.9.2 E: contradictory source metadata refuses with an explicit reason',()=>{
 const mismatched=structuredClone(semanticCases.money);
 mismatched.semantic.admission.centralClaim='The quotation asserts all purchases are categorically immoral.';
 const denied=reasonSemantically(mismatched,mismatched.initial);
 assert.equal(denied.status,'incompatible');
 assert.match(denied.reason,/claim|source|passage|mismatch/i);
 const incomplete=structuredClone(semanticCases.workshop);
 incomplete.semantic.admission.requiredPremiseIds.push('premise-never-supplied');
 const denial=reasonSemantically(incomplete,incomplete.initial);
 assert.equal(denial.status,'incompatible');
 assert.match(denial.reason,/premise|admission|missing/i);
});


test('v1.9.2 editorial RED: repeated actions and deficits are phrased grammatically across sources',()=>{
 const conv=reasonSemantically(semanticCases.money,{amounts:[1,0,1],budgets:[8],intentions:{lamp:2}});
 assert.equal(conv.status,'ready',conv.reason);
 assert.match(expressSemantic(conv).proactiveQuestion,/If your allocation for reading lamps falls short/i);
 assert.doesNotMatch(expressSemantic(conv).proactiveQuestion,/^If reading lamps falls short/i);
 const e=reasonSemantically(semanticCases.apology,{path:['offer','offer']});
 assert.equal(e.status,'ready',e.reason);
 assert.match(expressSemantic(e).proactiveQuestion,/choosing to offer an apology again/i);
 assert.doesNotMatch(expressSemantic(e).proactiveQuestion,/repeating offer an apology/i);
});
test('v1.9.2 editorial RED: repeated schedules exclude absent activities without contradicting their source bridge',()=>{
 const e=reasonSemantically(semanticCases.dillard,{amounts:[0,3,3],budgets:[6],repetitions:5});
 assert.equal(e.status,'ready',e.reason);
 const text=expressSemantic(e).interpretation;
 assert.match(text,/Writing your story has no place/);
 assert.doesNotMatch(text,/gives its selected activities a regular place/i);
 assert.match(text,/including omissions|absent|excluded|not assigned|no place/i);
});


test('v1.9.2 adversarial agency: missing event effects do not imply that chosen actions were waiting',()=>{
 const c=structuredClone(semanticCases.apology);
 c.scenario='Two active steps in an application process; neither step guarantees selection.';
 c.semantic.boundary='The applicant’s selected activities cannot determine an independent selection decision.';
 c.semantic.admission.scenarioBridge='The chosen acts and the committee’s decision have different owners.';
 c.model.agency={externalVariable:'selection',own:'attend and submit',external:'the independent selection decision'};
 c.model.variables={selection:{kind:'observation',owner:'external'}};
 c.model.initial=['The committee selects independently.'];
 for(const node of Object.values(c.model.nodes)){
  for(const opt of node.options){
   opt.label=opt.id==='offer'?'Attend the hearing':'Submit supporting documents';
   opt.action=opt.label; delete opt.effects;
  }
 }
 const packet=reasonSemantically(c,{path:['offer','space']});
 assert.equal(packet.status,'ready',packet.reason);
 const out=expressSemantic(packet);assert.equal(out.status,'ready',out.reason);
 assert.doesNotMatch(out.interpretation+' '+out.proactiveQuestion,/\bwaiting\b|\bchoosing to wait\b/i);
 assert.match(out.interpretation+' '+out.proactiveQuestion,/decision|agency|external|independent/i);
});


// CZ-13 independent QA P0-1/P0-2 reproductions. These tests are published BEFORE
// the expression fix; therefore they are red-first regressions, not unseen holdouts.
test('v1.9.3 P0-1 RED: effect-free agency differentiates all four ordered decisions without inventing acts',()=>{
 const c=structuredClone(semanticCases.apology);
 c.scenario='An applicant can choose to contact a committee or wait. Selection belongs to the committee.';
 c.assumptions=['Selecting contact does not confirm that contact took place.'];
 c.semantic.boundary='No selected path proves contact occurred or establishes the independent selection result.';
 c.semantic.admission.scenarioBridge='The committee decides selection independently of which contact or wait options are chosen.';
 c.model.agency={externalVariable:'selection',own:'choosing to contact or wait',external:'the committee selection decision'};
 c.model.variables={selection:{kind:'observation',owner:'external'}};
 c.model.initial=['The committee decides independently.'];
 for(const [i,node] of [c.model.nodes.first,c.model.nodes.later].entries()){
  node.options=[
   {id:'contact',label:'Contact the committee',action:'Contact the committee',next:i?null:'later'},
   {id:'wait',label:'Wait without contacting',action:'Wait without contacting',next:i?null:'later'}
  ];
 }
 const paths=[['contact','contact'],['contact','wait'],['wait','contact'],['wait','wait']];
 const output=[];
 for(const path of paths){
  const p=reasonSemantically(c,{path});assert.equal(p.status,'ready',p.reason);
  assert.equal(p.meaning.kind,'agency');
  assert.ok(p.meaning.evidence.events.every(e=>Object.keys(e.occurred).length===0));
  const o=expressSemantic(p);assert.equal(o.status,'ready',JSON.stringify(o));
  assert.ok(o.wordCount>=80&&o.wordCount<=120,o.wordCount+' words '+path.join('/'));
  assert.equal((o.proactiveQuestion.match(/\?/g)||[]).length,1);
  assert.doesNotMatch([o.interpretation,o.proactiveQuestion].join(' '),/already performed|was sent|was made|irreversible|confirmed contact|forgiveness/i);
  assert.match(o.interpretation,/committee|selection|external/i);
  output.push(o);
 }
 assert.equal(new Set(output.map(x=>x.interpretation)).size,4,'Section II must reflect continuing, changing and delaying choices');
 assert.equal(new Set(output.map(x=>x.proactiveQuestion)).size,4,'Section III must reflect ordered actions');
 assert.notEqual(output[1].interpretation,output[2].interpretation,'reverse order must remain meaningful');
});

test('v1.9.3 P0-2 RED: repeated allocation is neutral across activity order unless a preference was stated',()=>{
 const c=structuredClone(semanticCases.dillard);
 const names=['running','caring for a friend','resting'];
 for(const [i,choice] of c.model.choices.entries())Object.assign(choice,{label:names[i],readingLabel:names[i]});
 const evaluate=(amounts,intentions)=>{
  const input={amounts,budgets:[6],repetitions:5,...(intentions?{intentions}:{})};
  const p=reasonSemantically(c,input);assert.equal(p.status,'ready',p.reason);
  const o=expressSemantic(p);assert.equal(o.status,'ready',JSON.stringify(o));
  assert.equal((o.proactiveQuestion.match(/\?/g)||[]).length,1);
  assert.ok(o.wordCount>=80&&o.wordCount<=120,o.wordCount+' '+amounts);
  return o;
 };
 const absent=evaluate([0,3,3]);
 const balanced=evaluate([2,2,2]);
 const majority=evaluate([0,1,5]);
 for(const out of [absent,balanced,majority]){
  assert.doesNotMatch(out.proactiveQuestion,/make room|give way|yield|secure a place|have to include|sacrifice|should|ought|prioriti[sz]/i);
  assert.match(out.proactiveQuestion,/pattern|repeated|recurr|preserv|exclud|sustain|possible/i);
 }
 assert.notEqual(absent.proactiveQuestion,balanced.proactiveQuestion);
 assert.notEqual(absent.proactiveQuestion,majority.proactiveQuestion);
 const reversed=structuredClone(c);
 reversed.model.choices.reverse();
 const p=reasonSemantically(reversed,{amounts:[3,3,0],budgets:[6],repetitions:5});
 assert.equal(p.status,'ready',p.reason);
 const rev=expressSemantic(p);assert.equal(rev.status,'ready',rev.reason);
 assert.doesNotMatch(rev.proactiveQuestion,/make room|give way|yield|should|ought|prioriti[sz]/i);
 assert.match(rev.proactiveQuestion,/running|caring|resting|pattern|repeated|preserv|exclud/i);
 const goal=evaluate([0,3,3],{[c.model.choices[0].id]:2});
 assert.match(goal.proactiveQuestion,/stated|declared|target|intention|planned/i);
 assert.notEqual(goal.proactiveQuestion,absent.proactiveQuestion,'a declared intention changes the warranted reflection');
});
