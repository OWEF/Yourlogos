import {test} from "node:test";
import assert from "node:assert/strict";
import {B23_SOURCE_CONTRACTS,selectMiniGameB23,runSelectedEncounterB23}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {runSelectedEncounterB24}
 from "../experiments/yl-b24-encounter.mjs";
import {B24_BRIDGE_VERSION,renderConversionEncounterB24,
 validateConversionEncounterB24}
 from "../experiments/yl-b24-conversion-bridge.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {reasonSemantically}
 from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {browserCatalogueB24} from "../experiments/yl-b24-encounter-server.mjs";
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
function validateSections(result){
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,450));
 assert.equal(result.publicationAllowed,false);
 assert.equal(result.productionPlayable,false);
 const e=result.expression,labels=["Your Choice","Back to the Philosopher","One Last Thing…"];
 assert.deepEqual(e.sections.map(s=>s.label),labels);
 const counts=e.sections.map(s=>count(s.text)),total=counts.reduce((a,b)=>a+b,0);
 assert.ok(total>=80&&total<=120,JSON.stringify({counts,total}));
 assert.deepEqual(counts.every((x,i)=>x>=[10,18,9][i]&&x<=[48,65,26][i]),true);
 assert.equal(e.wordCount,total);
 assert.match(e.sections[1].text,/Thoreau|Kierkegaard|Dillard/);
}
test("B2.4 conversion bridge is versioned, source-authenticated, truly v2-compatible and no v1.2 fallback",()=>{
 const c=B23_SOURCE_CONTRACTS[0],sel=selectMiniGameB23(c);
 const results=[];
 for(let hours=0;hours<=8;hours++){
  for(const focus of ["life_exchanged","time_kept"]){
   const r=runSelectedEncounterB24(c,sel,{leftSlots:hours,touched:true,focus});
   validateSections(r);
   assert.equal(r.expressionVerification,B24_BRIDGE_VERSION);
   assert.equal(r.expression.version,"encounter-output-v2-compatible/2.4.0");
   assert.equal(r.expression.brief.version,"emotion-strategy-v2-compatible/2.4.0");
   assert.equal(r.expression.brief.inferredReaderEmotion,false);
   assert.deepEqual(r.canonical_choice.amounts,[hours,8-hours]);
   assert.equal(r.meaning.meaning.evidence.measure,hours);
   assert.equal(r.provenance.moralValueScoreInferred,false);
   assert.equal(r.provenance.actualPurchaseInferred,false);
   assert.equal(r.expression.evidenceTrace.contractFingerprint,c.contentFingerprint);
   assert.match(r.expression.sections[1].text,/invented/i);
   assert.match(r.expression.sections[1].text,/cannot rank/i);
   assert.match(r.expression.sections[1].text,/life exchanged/i);
   assert.doesNotMatch(JSON.stringify(r),/semantic-expression\/1\.2|frozen_v12_semantic_not_v20/);
   results.push(r);
  }
 }
 assert.equal(results.length,18);
 for(let i=0;i<18;i+=2){
  assert.deepEqual(results[i].meaning,results[i+1].meaning,
   "The user-selected emphasis must not alter one canonical philosophical inference");
  assert.notEqual(results[i].expression.sections[1].text,
   results[i+1].expression.sections[1].text,"Different focus should alter educational interpretation");
 }
 assert.notDeepEqual(results[0].meaning,results[16].meaning,
  "Different hour allocation must change a bounded source-grounded consequence");
});
test("B2.4 forbids forged source, moral score, unsupported focus and altered meaning claims",()=>{
 const c=B23_SOURCE_CONTRACTS[0],sel=selectMiniGameB23(c),input={leftSlots:2,touched:true,focus:"life_exchanged"};
 const good=runSelectedEncounterB24(c,sel,input);
 validateSections(good);
 const duplicate=runSelectedEncounterB24(c.recordId,sel,input);
 validateSections(duplicate);
 assert.deepEqual(good.expression,duplicate.expression);
 for(const bad of [
  {leftSlots:-1,touched:true,focus:"life_exchanged"},
  {leftSlots:9,touched:true,focus:"life_exchanged"},
  {leftSlots:0.5,touched:true,focus:"life_exchanged"},
  {leftSlots:2,touched:false,focus:"life_exchanged"},
  {leftSlots:2,touched:true,focus:"moral_score"},
  {leftSlots:2,touched:true,focus:"life_exchanged",sourceApproved:true},
  {leftSlots:2,touched:true,focus:"life_exchanged",virtue:999}
 ])assert.equal(runSelectedEncounterB24(c,sel,bad).status,"blocked");
 assert.equal(runSelectedEncounterB24({...c,source:{...c.source,quote:"fabricated"}},sel,input).status,"blocked");
 assert.equal(runSelectedEncounterB24(c,{...sel,selected_game_id:"trade_off"},input).status,"blocked");
 const reasoning=reasonSemantically(c.context,{amounts:[2,6],budgets:[8]});
 const output=renderConversionEncounterB24(reasoning,c,{amounts:[2,6],budgets:[8]});
 assert.equal(output.status,"ready");
 assert.equal(validateConversionEncounterB24(reasoning,c,{amounts:[2,6],budgets:[8]},
   "life_exchanged",{...output,wordCount:999}).status,"needs_editorial_review");
 const modified={...reasoning,sourceAdmission:{...reasoning.sourceAdmission,centralClaim:"Something else"}};
 assert.equal(renderConversionEncounterB24(modified,c,{amounts:[2,6],budgets:[8]}).status,
  "needs_editorial_review");
});
test("Genuinely unfamiliar source records and structurally incompatible cases abstain",()=>{
 const c=B23_SOURCE_CONTRACTS[0],sel=selectMiniGameB23(c);
 const novel={...c,recordId:"unreviewed:unknown-author-v1",
  source:{author:"Unknown test writer",work:"Invented essay",quote:"An invented source excerpt",
   referenceUrl:"https://example.test/unreviewed",reviewState:"founder_provisional"}};
 assert.equal(selectMiniGameB23(novel).status,"blocked");
 assert.equal(runSelectedEncounterB24(novel,sel,{leftSlots:4,touched:true}).status,"blocked");
 const incompatible=HEGEL_NO_FIT_V21;
 assert.equal(selectMiniGameB23(incompatible).status,"no_fit");
 assert.equal(runSelectedEncounterB24(incompatible,sel,{leftSlots:4,touched:true}).status,"blocked");
 const moneyThoreau={...c,context:{...c.context,model:{
  ...c.context.model,resources:[{id:"money",min:8,max:8,type:"cap"}]}}};
 assert.equal(runSelectedEncounterB24(moneyThoreau,sel,{leftSlots:4,touched:true}).status,"blocked");
 const catalogue=browserCatalogueB24();
 assert.equal(catalogue.length,4);
 assert.ok(catalogue.every(x=>x.games.length===6));
 assert.ok(catalogue.every(x=>x.sourceUrl&&x.quote));
});
test("Four original games retain identical canonical meanings and three sections",()=>{
 for(const [record,game,choice] of [
  [DILLARD_V21,"trade_off",{amounts:[1,3,2],repetitions:5}],
  [DILLARD_V21,"token_studio",{amounts:[1,3,2],repetitions:5}],
  [KIERKEGAARD_V21,"decision_map",{path:["stay","surprise","continue"]}],
  [KIERKEGAARD_V21,"swipe_decision",{path:["stay","surprise","continue"]}]
 ]){
  const sel=selectMiniGameB23(record,{preferredGameId:game});
  const actual=runSelectedEncounterB24(record,sel,choice);
  validateSections(actual);
  assert.equal(actual.selected_game_id,game);
  const historical=runSelectedEncounterB23(record,sel,choice);
  assert.equal(historical.status,"ready");
  assert.equal(actual.expressionVerification,historical.expressionVerification);
  assert.deepEqual(actual.meaning,historical.meaning);
  assert.deepEqual(actual.expression,historical.expression);
 }
});
test("Future Reveal preserves all eight authored paths, no predictions, and native v2 emotion",()=>{
 const c=B23_SOURCE_CONTRACTS[1],sel=selectMiniGameB23(c);
 let n=0;
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [first,fiction,last]=route.path;
  const r=runSelectedEncounterB24(c,sel,{actions:[
   {type:"choose_start",optionId:first},
   {type:"explore_authored",sceneId:fiction},
   {type:"choose_response",optionId:last},
   {type:"read_retrospective"}
  ]});
  validateSections(r);
  assert.equal(r.expressionVerification,"frozen_v20");
  assert.equal(r.provenance.authoredEventCausedByReader,false);
  assert.equal(r.provenance.unchosenFutureKnown,false);
  n++;
 }
 assert.equal(n,8);
});
