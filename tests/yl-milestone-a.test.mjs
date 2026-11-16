import {test} from "node:test";
import assert from "node:assert/strict";
import {createMilestoneAServer,MILESTONE_A_VERSION}
 from "../experiments/yl-milestone-a-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {SELECTION_VERSION,SIX_PEER_GAMES}
 from "../experiments/yl-milestone-a-selector.mjs";
const withServer=async f=>{
 const server=await createMilestoneAServer();
 try{await f(server);}finally{await server.close();}
};
async function request(app,url,body){
 const response=await fetch(app.url+url,{
  method:"POST",headers:{"content-type":"application/json",origin:app.url},
  body:JSON.stringify(body)
 });
 return {code:response.status,data:await response.json()};
}
async function selected(app,recordId,preferredGameId){
 return request(app,"/api/research/select",{recordId,...(preferredGameId?{preferredGameId}:{})});
}
async function run(app,record,choice,preferredGameId){
 return request(app,"/api/research/run",{recordId:record.id,versionHash:record.versionHash,
  preferredGameId,choice});
}
test("same accepted frozen engines; versioned ONE selector admits exactly four browser games",async()=>{
 assert.equal(SELECTION_VERSION,"single-six-peer-selection/2.2.0");
 assert.equal(MILESTONE_A_VERSION,"research-four-game-shell/1.0.0");
 assert.deepEqual(SIX_PEER_GAMES.filter(g=>g.browserPrototypeAvailable).map(g=>g.id),
  ["trade_off","decision_map","token_studio","swipe_decision"]);
 assert.equal(SIX_PEER_GAMES.length,6);
 assert.equal(SIX_PEER_GAMES.every(g=>g.productionPlayable===false),true);
 await withServer(async app=>{
  const r=await fetch(app.url+"/api/research/catalogue");
  const b=await r.json();
  assert.equal(b.status,"ready");assert.equal(b.records.length,5);
  assert.equal(b.games.length,6);assert.equal(b.publicationAllowed,false);
  const html=await (await fetch(app.url)).text();
  assert.match(html,/id="start"/);
  assert.match(html,/id="game-content"/);
  assert.match(html,/Your Choice\./);
  const script=await (await fetch(app.url+"/yl-milestone-a-ui.js")).text();
  assert.match(script,/Finish & Save/); // disabled: truthful preview cannot persist
  assert.doesNotMatch(html,/Supabase|localStorage|<script src="https:/i);
 });
});
test("finite-resource choices are canonical-equivalent across Token Studio and Trade-Off",async()=>{
 await withServer(async app=>{
  const trade=await selected(app,DILLARD_V21.id,"trade_off");
  const token=await selected(app,DILLARD_V21.id,"token_studio");
  for(const [x,id] of [[trade,"trade_off"],[token,"token_studio"]]){
   assert.equal(x.code,200);assert.equal(x.data.selection.selected_game_id,id);
   assert.equal(x.data.selection.selection_trace.evaluatedPeerIds.length,6);
   assert.equal(x.data.adapter.available,true);
  }
  const choice={amounts:[3,1,2],repetitions:5};
  const a=await run(app,DILLARD_V21,{gameId:"trade_off",...choice},"trade_off");
  const b=await run(app,DILLARD_V21,{gameId:"token_studio",...choice},"token_studio");
  assert.equal(a.code,200,JSON.stringify(a.data));
  assert.equal(b.code,200,JSON.stringify(b.data));
  for(const x of [a.data,b.data]){
   assert.equal(x.status,"ready");assert.equal(x.result.expression.sections.length,3);
   assert.ok(x.result.expression.wordCount>=80&&x.result.expression.wordCount<=120);
   assert.equal(x.publicationAllowed,false);
   assert.deepEqual(x.result.canonical_choice,{amounts:[3,1,2],budgets:[6],repetitions:5});
  }
  assert.deepEqual(a.data.result.meaning,b.data.result.meaning,
   "Compatible games must not alter the source-derived factual reasoning.");
 });
});
test("Decision Map and Swipe Decision preserve same authored event path and agency",async()=>{
 await withServer(async app=>{
  for(const game of ["decision_map","swipe_decision"]){
   const selection=await selected(app,KIERKEGAARD_V21.id,game);
   assert.equal(selection.code,200);
   assert.equal(selection.data.selection.selected_game_id,game);
   assert.equal(selection.data.adapter.available,true);
   assert.deepEqual(selection.data.selection.canonical_choice_contract.stages.map(x=>x.role),
    ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
   assert.equal(selection.data.presentation.routes.length,8);
  }
  const path=["change","surprise","adapt"];
  const a=await run(app,KIERKEGAARD_V21,{gameId:"decision_map",path},"decision_map");
  const b=await run(app,KIERKEGAARD_V21,{gameId:"swipe_decision",path},"swipe_decision");
  assert.equal(a.code,200,JSON.stringify(a.data));
  assert.equal(b.code,200,JSON.stringify(b.data));
  assert.deepEqual(a.data.result.canonical_choice.path,path);
  assert.deepEqual(a.data.result.meaning,b.data.result.meaning);
  assert.deepEqual(a.data.result.expression.sections.map(s=>s.text),
   b.data.result.expression.sections.map(s=>s.text));
 });
});
test("no-fit, game spoof, source mismatch and unreviewed authored events fail closed",async()=>{
 await withServer(async app=>{
  const noFit=await selected(app,HEGEL_NO_FIT_V21.id);
  assert.equal(noFit.data.status,"no_fit");
  assert.equal(noFit.data.adapter.available,false);
  const spoof=await run(app,DILLARD_V21,
   {gameId:"swipe_decision",path:["change","surprise","adapt"]},"trade_off");
  assert.equal(spoof.code,422);
  const bad=(await request(app,"/api/research/run",{
   recordId:DILLARD_V21.id,versionHash:"wrong",
   preferredGameId:"trade_off",
   choice:{gameId:"trade_off",amounts:[3,1,2],repetitions:5}
  }));
  assert.equal(bad.code,422);assert.equal(bad.data.status,"needs_source_review");
  const invented=await run(app,KIERKEGAARD_V21,{
   gameId:"decision_map",path:["change","invented_event","adapt"]
  },"decision_map");
  assert.equal(invented.code,422);
  const invalid=await run(app,DILLARD_V21,{
   gameId:"trade_off",amounts:[100,0,0],repetitions:5
  },"trade_off");
  assert.equal(invalid.code,422);
  const cors=await fetch(app.url+"/api/research/select",{
   method:"POST",headers:{"content-type":"application/json",origin:"https://example.invalid"},
   body:JSON.stringify({recordId:DILLARD_V21.id})});
  assert.equal(cors.status,403);
 });
});