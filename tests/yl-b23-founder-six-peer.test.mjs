import {test} from "node:test";
import assert from "node:assert/strict";
import {B23_SOURCE_CONTRACTS,FOUNDER_SOURCE_POLICY,
 B23_SIX_PEERS,selectMiniGameB23,runSelectedEncounterB23}
 from "../experiments/yl-b23-founder-six-peer.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {inspectB1Source,QUALIFIED_WARRANTS}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";

test("founder replaces scholar for isolated development only, not public content",()=>{
 assert.equal(FOUNDER_SOURCE_POLICY.independentlyQualifiedScholarlyApproval,false);
 assert.equal(FOUNDER_SOURCE_POLICY.productionAllowed,false);
 assert.equal(FOUNDER_SOURCE_POLICY.positiveResearchAllowed,true);
 assert.equal(QUALIFIED_WARRANTS.length,0);
 assert.equal(B23_SIX_PEERS.length,6);
 assert.equal(B23_SOURCE_CONTRACTS.length,2);
 for(const p of B23_SOURCE_CONTRACTS){
  assert.equal(p.publicationAllowed,false);
  assert.equal(p.independentlyScholarlyApproved,false);
  assert.equal(p.contentEditoriallyVerified,false);
  assert.match(p.contentFingerprint,/^sha256:[a-f0-9]{64}$/);
  assert.equal(inspectB1Source(p,p.gameId).status,"blocked");
 }
});
test("six-peer single selection disallows forged sources, not author routing",()=>{
 for(const p of B23_SOURCE_CONTRACTS){
  const s=selectMiniGameB23(p);
  assert.equal(s.selected_game_id,p.gameId);
  assert.deepEqual(s.selection_trace.evaluatedPeerIds,
   ["trade_off","decision_map","token_studio","balance_of_values","swipe_decision","future_reveal"]);
  const wrong=selectMiniGameB23(p,{preferredGameId:p.gameId==="balance_of_values"?"future_reveal":"balance_of_values"});
  assert.equal(wrong.status,"no_fit");
  const fake={...p,source:{...p.source,quote:"Fake quote"}};
  assert.equal(selectMiniGameB23(fake).status,"blocked");
  const tamper={...s,selected_game_id:"trade_off"};
  assert.equal(runSelectedEncounterB23(p,tamper,{leftSlots:2,touched:true}).code,"forged_selector");
 }
 assert.equal(selectMiniGameB23(HEGEL_NO_FIT_V21).status,"no_fit");
});
test("Thoreau 8h preserved; two different meaningful READY paths, original models unchanged",()=>{
 const p=B23_SOURCE_CONTRACTS[0],s=selectMiniGameB23(p);
 const a=runSelectedEncounterB23(p,s,{leftSlots:2,touched:true});
 const b=runSelectedEncounterB23(p,s,{leftSlots:6,touched:true});
 for(const r of [a,b]){
  assert.equal(r.status,"ready",JSON.stringify(r).slice(0,400));
  assert.equal(r.publicationAllowed,false);
  assert.equal(r.canonical_choice.amounts.reduce((x,y)=>x+y),8);
  assert.equal(r.expression.sections.length,3);
  assert.ok(r.expression.wordCount>=80&&r.expression.wordCount<=120);
 }
 assert.notDeepEqual(a.meaning.meaning,b.meaning.meaning);
 assert.equal(a.canonical_choice.amounts[1],6);
 assert.equal(b.canonical_choice.amounts[1],2);
 for(const invalid of [{leftSlots:-1,touched:true},{leftSlots:9,touched:true},
  {leftSlots:0.5,touched:true},{leftSlots:2,touched:false},
  {leftSlots:2,touched:true,moralScore:999}]){
  assert.equal(runSelectedEncounterB23(p,s,invalid).status,"blocked");
 }
 assert.equal(inspectB1Source(DILLARD_V21,"balance_of_values").status,"blocked");
});
test("Future Reveal correctly SOURCE-OWNS all eight paths; unknown/locked/agency attacks blocked",()=>{
 const p=B23_SOURCE_CONTRACTS[1],sel=selectMiniGameB23(p);
 for(const route of KIERKEGAARD_V21.scenario.constraints.routes){
  const [start,sceneId,response]=route.path;
  const actions=[{type:"choose_start",optionId:start},
   {type:"explore_authored",sceneId},
   {type:"choose_response",optionId:response},
   {type:"read_retrospective"}];
  const result=runSelectedEncounterB23(p,sel,{actions});
  assert.equal(result.status,"ready",JSON.stringify({path:route.path,result}).slice(0,350));
  assert.deepEqual(result.canonical_choice.path,route.path);
  assert.equal(result.provenance.authoredEventCausedByReader,false);
  assert.equal(result.expression.sections.length,3);
  assert.ok(result.expression.wordCount>=80&&result.expression.wordCount<=120);
 }
 const invalid=[
  [{type:"choose_start",optionId:"change"},{type:"explore_authored",sceneId:"faked"}],
  [{type:"choose_start",optionId:"change"},{type:"scrub",stage:4}],
  [{type:"choose_start",optionId:"change"},{type:"reveal_authored"}],
  [{type:"choose_start",optionId:"change"},{type:"explore_authored",sceneId:"risk"},
   {type:"choose_response",optionId:"continue"},{type:"read_retrospective"},
   {type:"revise_start",optionId:"stay"},{type:"scrub",stage:4}]
 ];
 for(const actions of invalid)assert.equal(runSelectedEncounterB23(p,sel,{actions}).status,"blocked");
 assert.equal(inspectB1Source(KIERKEGAARD_V21,"future_reveal").status,"blocked");
});
test("original four games untouched through one single six-peer research selector",()=>{
 for(const [r,game,choice] of [
  [DILLARD_V21,"trade_off",{amounts:[2,2,2],repetitions:5}],
  [DILLARD_V21,"token_studio",{amounts:[2,2,2],repetitions:5}],
  [KIERKEGAARD_V21,"decision_map",{path:["change","risk","continue"]}],
  [KIERKEGAARD_V21,"swipe_decision",{path:["change","risk","continue"]}]
 ]){
  const s=selectMiniGameB23(r,{preferredGameId:game});
  assert.equal(s.status,"research_selected",game);
  assert.deepEqual(s.selection_trace.evaluatedPeerIds,B23_SIX_PEERS.map(p=>p.id));
  const out=runSelectedEncounterB23(r,s,choice);
  assert.equal(out.status,"ready",JSON.stringify(out).slice(0,400));
  assert.equal(out.expression.sections.length,3);
  assert.ok(out.expression.wordCount>=80&&out.expression.wordCount<=120);
  assert.equal(out.publicationAllowed,false);
 }
});
