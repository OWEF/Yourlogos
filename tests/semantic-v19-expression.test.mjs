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
  console.log('CZ13-P0-AGENCY '+JSON.stringify({path,idea:o.headline+' '+o.experience,philosopher:o.interpretation,question:o.proactiveQuestion,words:o.wordCount}));
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
 for(const [name,out] of [['absent',absent],['balanced',balanced],['majority',majority]])console.log('CZ13-P0-REPETITION '+JSON.stringify({name,idea:out.headline+' '+out.experience,philosopher:out.interpretation,question:out.proactiveQuestion,words:out.wordCount}));
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
 console.log('CZ13-P0-REPETITION '+JSON.stringify({name:'reversed',idea:rev.headline+' '+rev.experience,philosopher:rev.interpretation,question:rev.proactiveQuestion,words:rev.wordCount}));
 assert.doesNotMatch(rev.interpretation,/other activities remain present|alongside the other activities/i,'absent activity must not be described as still present');
 assert.match(rev.interpretation,/running.*(?:no allocation|absent|no time|excluded)|(?:absent|excluded).*running/i,'zero allocation must be explicitly recognized');
 assert.doesNotMatch(rev.proactiveQuestion,/make room|give way|yield|should|ought|prioriti[sz]/i);
 assert.match(rev.proactiveQuestion,/running|caring|resting|pattern|repeated|preserv|exclud/i);
 const goal=evaluate([0,3,3],{[c.model.choices[0].id]:2});
 console.log('CZ13-P0-REPETITION '+JSON.stringify({name:'explicit-target',idea:goal.headline+' '+goal.experience,philosopher:goal.interpretation,question:goal.proactiveQuestion,words:goal.wordCount}));
 assert.match(goal.proactiveQuestion,/stated|declared|target|intention|planned/i);
 assert.notEqual(goal.proactiveQuestion,absent.proactiveQuestion,'a declared intention changes the warranted reflection');
});


// CZ-13 v1.9.4 independent QA reproductions, committed red before engine edits.
// They become known regressions and must not be presented as independent blind holdouts.
test('v1.9.4 P0-1 RED: explicit weekly recurrence uses machine-readable validated periods',()=>{
 const c=structuredClone(semanticCases.dillard);
 c.model.repetitionPeriod='week';
 c.model.unitHours=2; // Six two-hour blocks in each hypothetical week
 c.model.resources[0].label='Two-hour blocks available in a week';
 const p=reasonSemantically(c,{amounts:[2,2,2],budgets:[6],repetitions:5});
 assert.equal(p.status,'ready',p.reason);
 const o=expressSemantic(p);assert.equal(o.status,'ready',o.reason);
 console.log('CZ13-194-BEFORE-WEEK '+JSON.stringify({packet:p.meaning.evidence,idea:o.headline+' '+o.experience,philosopher:o.interpretation,question:o.proactiveQuestion,words:o.wordCount}));
 assert.equal(p.meaning.evidence.period,'week');
 assert.match(o.experience,/5 imagined weeks/);
 assert.doesNotMatch(o.experience,/evenings|mornings|sessions/);
 assert.match(o.experience,/20 hours/);
 assert.ok(o.wordCount>=80&&o.wordCount<=120);
 const unknown=structuredClone(c);delete unknown.model.repetitionPeriod;
 const q=reasonSemantically(unknown,{amounts:[2,2,2],budgets:[6],repetitions:5});
 assert.equal(q.status,'ready',q.reason);
 const neutral=expressSemantic(q);assert.equal(neutral.status,'ready',neutral.reason);
 assert.match(neutral.experience,/repeated cycles|imagined cycles/i);
 assert.doesNotMatch(neutral.experience,/evenings|weeks|sessions/i);
 const invalid=structuredClone(c);invalid.model.repetitionPeriod='unverified_custom_period';
 const denial=reasonSemantically(invalid,{amounts:[2,2,2],budgets:[6],repetitions:5});
 assert.equal(denial.status,'incompatible','Invalid period cannot silently acquire a label');
});

test('v1.9.4 P0-2 RED: partial-capacity repetition separates allocated, available and unused slots',()=>{
 const c=structuredClone(semanticCases.dillard);
 c.model.resources[0]={...c.model.resources[0],type:'cap',min:0,max:6};
 c.model.repetitionPeriod='session';
 const testCase=(amounts,tag,intentions=null)=>{
  const p=reasonSemantically(c,{amounts,budgets:[6],repetitions:5,...(intentions?{intentions}:{})});
  assert.equal(p.status,'ready',tag+' '+p.reason);
  const o=expressSemantic(p);assert.equal(o.status,'ready',tag+' '+o.reason);
  console.log('CZ13-194-BEFORE-CAP '+JSON.stringify({tag,amounts,packet:p.meaning.evidence,idea:o.headline+' '+o.experience,philosopher:o.interpretation,question:o.proactiveQuestion,words:o.wordCount}));
  assert.ok(o.wordCount>=80&&o.wordCount<=120,tag+' words: '+o.wordCount);
  assert.equal((o.proactiveQuestion.match(/\?/g)||[]).length,1,tag);
  return {p,o};
 };
 const partial=testCase([2,0,0],'partial');
 assert.equal(partial.p.meaning.evidence.perIntervalCapacity,6);
 assert.equal(partial.p.meaning.evidence.perIntervalAllocated,2);
 assert.equal(partial.p.meaning.evidence.perIntervalUnallocated,4);
 assert.equal(partial.p.meaning.evidence.repetitions,5);
 assert.doesNotMatch(partial.o.headline+' '+partial.o.interpretation,/fills the entire imagined interval|fills the modeled pattern/i);
 assert.match(partial.o.experience,/unallocat|unused/i);
 assert.match(partial.o.proactiveQuestion,/unallocat|unused|left open|not assigned/i);
 const zero=testCase([0,0,0],'zero');
 assert.equal(zero.p.meaning.evidence.perIntervalAllocated,0);
 assert.equal(zero.p.meaning.evidence.perIntervalUnallocated,6);
 assert.doesNotMatch([zero.o.headline,zero.o.interpretation,zero.o.proactiveQuestion].join(' '),/fills|rest as|leisure|spending your time/i);
 const full=testCase([6,0,0],'full');
 assert.equal(full.p.meaning.evidence.perIntervalUnallocated,0);
 assert.match(full.o.headline+' '+full.o.interpretation,/fills the entire|fills the modeled pattern/i);
 assert.doesNotMatch(full.o.experience,/unallocated|unused/i);
 const target=testCase([2,0,0],'explicit-target',{[c.model.choices[1].id]:2});
 assert.match(target.o.proactiveQuestion,/stated|target|intention/i);
 assert.notEqual(target.o.proactiveQuestion,partial.o.proactiveQuestion);
 // 28 exact-capacity compositions; all must respect the 80–120 word and single-question rules.
 let cases=0;
 for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++){
  const d=6-a-b, input={amounts:[a,b,d],budgets:[6],repetitions:5};
  const p=reasonSemantically(semanticCases.dillard,input);
  assert.equal(p.status,'ready','exact '+JSON.stringify(input)+' '+p.reason);
  const o=expressSemantic(p);assert.equal(o.status,'ready','exact '+JSON.stringify(input)+' '+o.reason);
  assert.ok(o.wordCount>=80&&o.wordCount<=120,JSON.stringify(input)+' words '+o.wordCount);
  assert.equal((o.proactiveQuestion.match(/\?/g)||[]).length,1);
  cases++;
 }
 assert.equal(cases,28);
 const reorder=structuredClone(c);reorder.model.choices.reverse();
 const p=reasonSemantically(reorder,{amounts:[0,0,2],budgets:[6],repetitions:5});
 assert.equal(p.status,'ready',p.reason);
 const result=expressSemantic(p);assert.equal(result.status,'ready',result.reason);
 assert.doesNotMatch(result.headline+' '+result.interpretation,/fills the entire imagined interval|fills the modeled pattern/i);
 assert.match(result.experience,/unallocat|unused/i);
});


// CZ-13 v1.9.5 QA reproductions committed BEFORE any implementation edit.
// These become known RED-first regressions; NOT unseen independently authored holdouts.
test('v1.9.5 A RED: fractional time formatting is readable, accurate and never rounds small nonzero amounts to zero',()=>{
 const scenarios=[0.1,0.2,0.25,0.5,0.00000001];
 for(const unitHours of scenarios){
  const c=structuredClone(semanticCases.dillard);
  c.model.unitHours=unitHours;
  const p=reasonSemantically(c,{amounts:[1,2,3],budgets:[6],repetitions:3});
  assert.equal(p.status,'ready',p.reason);
  const out=expressSemantic(p);assert.equal(out.status,'ready',out.reason);
  console.log('CZ13-195-TIME-RED '+JSON.stringify({unitHours,reading:{idea:out.headline+' '+out.experience,interpretation:out.interpretation,question:out.proactiveQuestion,words:out.wordCount}}));
  assert.doesNotMatch(out.experience,/\d+\.\d{12,}/,'binary floating point tails must not reach participants');
  const displayed=[3,6,9].map(x=>x*unitHours);
  for(const value of displayed){
   const preferred=Number(value.toPrecision(12)).toString();
   assert.ok(out.experience.includes(preferred+' hour'),'must show nonzero exact-scale time '+preferred+' in '+out.experience);
  }
  assert.match(out.experience,/does not establish your actual habits/i);
 }
});
test('v1.9.5 B RED: six-activity readings obey the founder 80–120 total AND individual section bounds',()=>{
 const c=structuredClone(semanticCases.dillard);
 const names=['writing your story','answering messages','resting and recharging','gardening','walking','cooking'];
 const base=c.model.choices[0];
 c.model.choices=names.map((name,i)=>({...base,id:'activity-'+i,label:name,readingLabel:name,cost:[1],max:6}));
 const p=reasonSemantically(c,{amounts:[1,1,1,1,1,1],budgets:[6],repetitions:5});
 assert.equal(p.status,'ready',p.reason);
 const out=expressSemantic(p);assert.ok(out,'expression must provide result');
 console.log('CZ13-195-WORD-RED '+JSON.stringify({reading:{idea:(out.headline||'')+' '+(out.experience||''),interpretation:out.interpretation,question:out.proactiveQuestion,words:out.wordCount,status:out.status,reason:out.reason}}));
 if(out.status==='ready'){
  const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
  const total=count(out.headline+' '+out.experience+' '+out.interpretation+' '+out.proactiveQuestion);
  const sections=[count(out.headline+' '+out.experience),count(out.interpretation),count(out.proactiveQuestion)];
  assert.equal(total,out.wordCount);
  assert.ok(total>=80&&total<=120,'READY must never violate total word policy; saw '+total);
  assert.ok(sections[0]>=10&&sections[0]<=48,'Section I exceeded bounds: '+sections[0]);
  assert.ok(sections[1]>=18&&sections[1]<=65,'Section II exceeded bounds: '+sections[1]);
  assert.ok(sections[2]>=9&&sections[2]<=26,'Section III exceeded bounds: '+sections[2]);
 }else{
  assert.equal(out.status,'needs_editorial_review');
  assert.match(out.reason,/word|section|policy|length/i);
 }
});
test('v1.9.5 policy sweep: 3–6 activities, original source caveats and predecessor fixes remain protected',()=>{
 const names=['writing your story','answering messages','resting and recharging','gardening','walking','cooking'];
 let checked=0;
 for(let n=3;n<=6;n++){
  const c=structuredClone(semanticCases.dillard);
  const base=c.model.choices[0];
  c.model.choices=names.slice(0,n).map((label,i)=>({...base,id:'activity-'+i,label,readingLabel:label,cost:[1],max:6}));
  for(const amounts of [Array.from({length:n},(_,i)=>i===0?6:0),
                        Array.from({length:n},(_,i)=>i===0?0:i===n-1?6:0),
                        Array.from({length:n},(_,i)=>i<6%n?Math.floor(6/n)+1:Math.floor(6/n))]){
   const p=reasonSemantically(c,{amounts,budgets:[6],repetitions:5});
   assert.equal(p.status,'ready',p.reason);
   const out=expressSemantic(p);assert.ok(out);
   assert.ok(['ready','needs_editorial_review'].includes(out.status));
   if(out.status==='ready'){
    const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
    const sections=[count(out.headline+' '+out.experience),count(out.interpretation),count(out.proactiveQuestion)];
    assert.ok(out.wordCount>=80&&out.wordCount<=120,'unexpected READY length '+out.wordCount);
    assert.ok(sections[0]>=10&&sections[0]<=48);
    assert.ok(sections[1]>=18&&sections[1]<=65);
    assert.ok(sections[2]>=9&&sections[2]<=26);
    assert.match(out.interpretation,/does not rank any activity/i);
    assert.match(out.experience,/does not establish your actual habits/i);
   }else assert.match(out.reason,/word|section|policy|length/i);
   checked++;
  }
 }
 assert.equal(checked,12);
});


test('v1.9.5 protected editorial qualifications are never truncated to make an invalid reading READY',()=>{
 const p=reasonSemantically(semanticCases.dillard,{amounts:[2,2,2],budgets:[6],repetitions:5});
 assert.equal(p.status,'ready',p.reason);
 // Inject a deliberately uncompressible, safety-critical source qualification
 // *after* reasoning to isolate the Expression Engine length gate itself.
 const original=p.sourceAdmission.centralClaim;
 p.sourceAdmission.centralClaim=original+' '+Array.from({length:28},(_,i)=>
   'Qualification '+(i+1)+' must remain visible.').join(' ');
 const result=expressSemantic(p);
 assert.equal(result.status,'needs_editorial_review');
 assert.match(result.reason,/word|section|policy/i);
 assert.ok(result.sectionWordCounts.philosopher>65||result.wordCount>120,
  'overflow must be explicitly measured, never silently truncated');
});
