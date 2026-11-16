import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {B2_SOURCE_PROPOSALS,verifyNoB2Admission}
 from "../experiments/yl-b2-source-proposals.mjs";
import {SIX_PEER_GAMES,selectMiniGameV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {KIERKEGAARD_V21,DILLARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {listAuthoredPossibilities,normalizeFuture,inspectB1Source,QUALIFIED_WARRANTS}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
import {validateChoiceV21}
 from "../philosophy-engine/content/content-contract-v21.js";
const lab=readFileSync(new URL("../experiments/yl-milestone-b-lab.js",import.meta.url),"utf8");

test("B2.2 R0: original four peers still available; new two remain fail-closed",()=>{
 const enabled=SIX_PEER_GAMES.filter(x=>x.browserPrototypeAvailable).map(x=>x.id);
 assert.deepEqual(enabled,["trade_off","decision_map","token_studio","swipe_decision"]);
 assert.deepEqual(QUALIFIED_WARRANTS,[]);
 assert.equal(verifyNoB2Admission(),true);
 for(const r of [KIERKEGAARD_V21,DILLARD_V21,HEGEL_NO_FIT_V21]){
  const choice=selectMiniGameV22(r,{mode:"prototype",preferredGameId:"future_reveal"});
  assert.equal(choice.selection_trace.evaluatedPeerIds.length,6);
  for(const id of ["balance_of_values","future_reveal"])
   assert.equal(inspectB1Source(r,id).status,"blocked");
 }
});
test("B2.2 P1: Thoreau original model fundamentally differs from proposed two-hour-scale",()=>{
 const m=semanticCases.money.model;
 const p=B2_SOURCE_PROPOSALS.find(p=>p.gameId==="balance_of_values");
 assert.equal(m.resources[0].id,"money");
 assert.equal(m.resources[0].type,"cap");
 assert.equal(m.choices.length,3);
 assert.equal(p.scenario.resourceId,"fictional_discretionary_hours");
 assert.equal(p.scenario.capacityMode,"exact");
 assert.equal(p.scenario.choiceIds.length,2);
 assert.equal(p.scenario.capacity,8);
 assert.match(lab,/balance:3/,"B0 begins with a six-unit symmetric beam");
 assert.match(lab,/input\.max="6"|input\.max="6"|input\.max="6"|input\.max=\"6\"|input\.max=\"6\"/);
 assert.match(lab,/left:"Clarity",right:"Experimentation"/);
 assert.ok(!p.scenario.neverInfer.includes("preferred virtue"));
});
test("B2.2 P1: B0 Future Reveal is different narrative, not actual reviewed Kierkegaard graph",()=>{
 assert.match(lab,/join:\{label:"Join the project"/);
 assert.match(lab,/wait:\{label:"Wait and observe"/);
 assert.ok(!lab.includes('sceneId:"surprise"'));
 assert.match(lab,/Complete preview/);
 assert.match(lab,/NO ENGINE INFERENCE|philosophicalInference:false/);
 const starters=KIERKEGAARD_V21.scenario.choices.map(x=>x.id);
 assert.deepEqual(starters,["change","stay"]);
});
test("B2.2 R2: eight provisional paths valid; scene text context-bound and noncausal",()=>{
 const r=KIERKEGAARD_V21;
 assert.equal(r.scenario.constraints.routes.length,8);
 const seen=new Set();
 for(const route of r.scenario.constraints.routes){
  const [start,scene,reply]=route.path;
  assert.deepEqual(route.agencyRoles,["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
  const options=listAuthoredPossibilities(r,start);
  assert.equal(options.status,"research_options_only");
  const exact=options.options.find(x=>x.sceneId===scene);
  assert.ok(exact,"Only source-authored scene is exposed");
  assert.deepEqual(exact.authoredText,route.authoredDevelopments);
  assert.equal(exact.causedByReader,false);
  assert.equal(exact.readerAction,"EXPLORE_ONLY");
  const sequence=[{type:"choose_start",optionId:start},
   {type:"explore_authored",sceneId:scene},
   {type:"choose_response",optionId:reply},
   {type:"read_retrospective"}];
  const normalized=normalizeFuture(r,sequence);
  assert.equal(normalized.status,"normalized",JSON.stringify(route));
  assert.deepEqual(normalized.canonical.path,route.path);
  const canonical=validateChoiceV21(r,{gameId:"decision_map",path:route.path});
  assert.equal(canonical.status,"ready");
  assert.deepEqual(normalized.canonical,canonical.canonical);
  seen.add(JSON.stringify(route.path));
 }
 assert.equal(seen.size,8);
 const a=listAuthoredPossibilities(r,"change").options.find(x=>x.sceneId==="surprise");
 const b=listAuthoredPossibilities(r,"stay").options.find(x=>x.sceneId==="surprise");
 assert.ok(a&&b);
 assert.notDeepEqual(a.authoredText,b.authoredText,"Scene ID alone insufficient for attribution");
});
test("B2.2 R2: invalid source and unchosen fantasy remain impossible",()=>{
 const r=KIERKEGAARD_V21;
 assert.equal(normalizeFuture(r,[{type:"choose_start",optionId:"change"},
  {type:"reveal_authored"}]).code,"source_ambiguity");
 assert.equal(normalizeFuture(r,[{type:"choose_start",optionId:"change"},
  {type:"explore_authored",sceneId:"fabricated"},
  {type:"choose_response",optionId:"adapt"},{type:"read_retrospective"}]).code,"unapproved_scene");
 assert.equal(normalizeFuture(r,[{type:"choose_start",optionId:"change"},
  {type:"scrub",stage:4}]).code,"stage_locked");
 assert.equal(normalizeFuture(r,[{type:"choose_start",optionId:"change"},
  {type:"explore_authored",sceneId:"surprise"},
  {type:"choose_response",optionId:"adapt"},{type:"read_retrospective"},
  {type:"revise_start",optionId:"stay"},{type:"scrub",stage:4}]).code,"stage_locked");
});
