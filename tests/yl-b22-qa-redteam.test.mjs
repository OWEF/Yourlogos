/** CZ-123 independent QA-only R1/R2 at exact implementation SHA
 * a44fbfaa615210fc14edad3df41e1ae70680fb38.
 * This QA branch modifies NO source/selector/game implementation.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createMilestoneAServer} from "../experiments/yl-milestone-a-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {SIX_PEER_GAMES,selectMiniGameV22}
 from "../experiments/yl-milestone-a-selector.mjs";
import {listAuthoredPossibilities,normalizeFuture,inspectB1Source}
 from "../experiments/yl-b1-editorial-gated-adapters.mjs";
import {B2_SOURCE_PROPOSALS} from "../experiments/yl-b2-source-proposals.mjs";
import {validateChoiceV21} from "../philosophy-engine/content/content-contract-v21.js";

const doc=readFileSync(new URL("../research/cz121/B22-QUALIFIED-DECISIONS.md",import.meta.url),"utf8");
const plan=readFileSync(new URL("../research/cz134/B22-POST-APPROVAL-INTEGRATION.md",import.meta.url),"utf8");
const lab=readFileSync(new URL("../experiments/yl-milestone-b-lab.js",import.meta.url),"utf8");

async function submit(app,record,gameId,payload){
 const response=await fetch(app.url+"/api/research/run",{
  method:"POST",headers:{"content-type":"application/json",origin:app.url},
  body:JSON.stringify({recordId:record.id,versionHash:record.versionHash,
   preferredGameId:gameId,choice:{gameId,...payload}})});
 return {http:response.status,data:await response.json()};
}

test("CZ-123 R1: source case has no actual human review; no approval by textual signature",()=>{
 assert.equal(B2_SOURCE_PROPOSALS.length,2);
 const fingerprints=B2_SOURCE_PROPOSALS.map(p=>p.proposalFingerprint);
 for(const p of B2_SOURCE_PROPOSALS){
  assert.equal(p.gameSpecificApproval,"PENDING");
  assert.equal(p.independentQualifiedReviewer,null);
  assert.equal(p.independentApprovedAt,null);
  assert.equal(p.publicationAllowed,false);
  assert.ok(doc.includes(p.proposalFingerprint));
 }
 assert.equal(new Set(fingerprints).size,2);
 assert.match(doc,/NO QUALIFIED SIGNOFF RECEIVED/);
 assert.match(doc,/Human verdict specifically needed/);
 assert.match(doc,/You miss your old friends/);
 assert.match(plan,/two corrective cycles maximum|TWO corrective cycles maximum/i);
 assert.match(lab,/left:"Clarity",right:"Experimentation"/);
 assert.match(lab,/join:\{label:"Join the project"/);
 for(const source of [DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21]){
  for(const gameId of ["balance_of_values","future_reveal"])
   assert.equal(inspectB1Source(source,gameId).status,"blocked");
 }
});

test("CZ-123 R2: all EIGHT graph routes and reused surprise ID correctly source-owned",()=>{
 const all=KIERKEGAARD_V21.scenario.constraints.routes;
 assert.equal(all.length,8);
 const seen=new Set();
 for(const route of all){
  const [start,sceneId,answer]=route.path;
  assert.equal(route.unchosenOutcomeKnown,false);
  assert.deepEqual(route.agencyRoles,
   ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
  const menu=listAuthoredPossibilities(KIERKEGAARD_V21,start);
  assert.equal(menu.status,"research_options_only");
  const actual=menu.options.find(x=>x.sceneId===sceneId);
  assert.ok(actual);
  assert.deepEqual(actual.authoredText,route.authoredDevelopments);
  assert.equal(actual.readerAction,"EXPLORE_ONLY");
  assert.equal(actual.causedByReader,false);
  const events=[{type:"choose_start",optionId:start},
    {type:"explore_authored",sceneId},{type:"choose_response",optionId:answer},
    {type:"read_retrospective"}];
  const converted=normalizeFuture(KIERKEGAARD_V21,events);
  assert.equal(converted.status,"normalized",JSON.stringify(converted));
  assert.deepEqual(converted.canonical,
   validateChoiceV21(KIERKEGAARD_V21,{gameId:"decision_map",path:route.path}).canonical);
  seen.add(JSON.stringify(route.path));
 }
 assert.equal(seen.size,8);
 const a=listAuthoredPossibilities(KIERKEGAARD_V21,"change").options.find(x=>x.sceneId==="surprise");
 const b=listAuthoredPossibilities(KIERKEGAARD_V21,"stay").options.find(x=>x.sceneId==="surprise");
 assert.ok(a&&b);
 assert.notDeepEqual(a.authoredText,b.authoredText);
 assert.equal(normalizeFuture(KIERKEGAARD_V21,[
  {type:"choose_start",optionId:"change"},{type:"reveal_authored"}]).code,"source_ambiguity");
 assert.equal(normalizeFuture(KIERKEGAARD_V21,[
  {type:"choose_start",optionId:"stay"},{type:"explore_authored",sceneId:"unknown"}]).code,"unapproved_scene");
});

test("CZ-123 R0: existing four real engine games remain choice-sensitive and equivalent",async()=>{
 const app=await createMilestoneAServer();
 try{
  const allocations=[{amounts:[2,2,2],repetitions:5},{amounts:[4,1,1],repetitions:5}];
  const d=[];
  for(const choice of allocations){
   const a=await submit(app,DILLARD_V21,"trade_off",choice);
   const b=await submit(app,DILLARD_V21,"token_studio",choice);
   for(const r of [a,b]){
    assert.equal(r.http,200,JSON.stringify(r.data).slice(0,200));
    assert.equal(r.data.status,"ready");
    assert.equal(r.data.result.expression.sections.length,3);
    assert.ok(r.data.result.expression.wordCount>=80&&r.data.result.expression.wordCount<=120);
   }
   assert.deepEqual(a.data.result.meaning,b.data.result.meaning);
   d.push(a.data.result.meaning);
  }
  assert.notDeepEqual(d[0],d[1],"Different time allocations must have different meaning");

  const k=[];
  for(const path of [["change","risk","continue"],["stay","missed","reflect"]]){
   const a=await submit(app,KIERKEGAARD_V21,"decision_map",{path});
   const b=await submit(app,KIERKEGAARD_V21,"swipe_decision",{path});
   for(const r of [a,b]){
    assert.equal(r.http,200,JSON.stringify(r.data).slice(0,200));
    assert.equal(r.data.result.expression.sections.length,3);
    assert.ok(r.data.result.expression.wordCount>=80&&r.data.result.expression.wordCount<=120);
   }
   assert.deepEqual(a.data.result.meaning,b.data.result.meaning);
   k.push(a.data.result.meaning);
  }
  assert.notDeepEqual(k[0],k[1],"Distinct fictional routes must have different meaning");

  const selected=selectMiniGameV22(KIERKEGAARD_V21);
  assert.equal(selected.selection_trace.evaluatedPeerIds.length,6);
  assert.equal(selectMiniGameV22(HEGEL_NO_FIT_V21).status,"no_fit");
  for(const [record,id,payload] of [
   [DILLARD_V21,"balance_of_values",{amounts:[4,4]}],
   [KIERKEGAARD_V21,"future_reveal",{path:["change","surprise","adapt"]}]]){
   const rejected=await submit(app,record,id,payload);
   assert.equal(rejected.http,422);
  }
 }finally{await app.close();}
});
