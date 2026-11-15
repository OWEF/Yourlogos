import {test} from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createIntegratedResearchServer,verifyPinnedEngine,integratedHtml,
 ENGINE_SHA,SOURCE_UI_SHA,SOURCE_UI_GIT_BLOB} from "../experiments/cz128-research-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const withServer=async fn=>{
 const app=await createIntegratedResearchServer();
 try{await fn(app);}
 finally{await app.close();}
};
const read=async(res)=>({status:res.status,body:await res.json()});
const post=async(app,path,body,origin=app.url)=>{
 const res=await fetch(app.url+path,{
  method:"POST",headers:{"content-type":"application/json",origin},
  body:JSON.stringify(body)});
 return read(res);
};
test("strict pinned CZ-131 and byte-identical PR #182 browser preservation; version metadata is not user-forgeable",()=>{
 assert.equal(verifyPinnedEngine().acceptedEngineSha,ENGINE_SHA);
 assert.equal(ENGINE_SHA,"b18a3e6bcce8acbcf5bbd199d27d36cd390bb1da");
 assert.equal(SOURCE_UI_SHA,"b3b2662ce7034a67a2ef0cf6a7b4d4eb4b13d6a8");
 assert.equal(SOURCE_UI_GIT_BLOB,"90ab4781728947b91dac3a3b7b4a30283ef8ca87");
 const html=integratedHtml();
 for(const phrase of ['id="choose-token"','id="swipe-game"',
  'id="development-explorer"','id="cz128-source"','id="cz128-remember"',
  '/cz128-browser-integration.js'])
  assert.ok(html.includes(phrase),phrase);
 assert.match(html,/role="group" aria-label="Possible hypothetical situations/i);
 assert.doesNotMatch(html,/universal six-game selector is not implemented|Two hand-picked research scenarios/i);
 assert.match(html,/Only two isolated browser games are currently playable/);
});
test("GET catalogue and POST selection execute actual six-peer selector, not a handpicked philosopher map",async()=>{
 await withServer(async app=>{
  const {status,body}=await read(await fetch(app.url+"/api/research/catalogue"));
  assert.equal(status,200);
  assert.equal(body.status,"ready");
  assert.equal(body.engineSha,ENGINE_SHA);
  assert.equal(body.sourceUiSha,SOURCE_UI_SHA);
  assert.equal(body.selectorVersion,"single-six-peer-selection/2.1.0");
  assert.equal(body.publicationAllowed,false);
  assert.equal(body.games.length,6);
  assert.equal(body.records.length,5);
  assert.deepEqual(body.games.filter(g=>g.browserPrototypeAvailable).map(g=>g.id),
   ["token_studio","swipe_decision"]);
  const cases=[
   {recordId:DILLARD_V21.id,selected:"token_studio",adapter:"token"},
   {recordId:KIERKEGAARD_V21.id,selected:"swipe_decision",adapter:"swipe"}
  ];
  for(const entry of cases){
   const response=await post(app,"/api/research/select",{recordId:entry.recordId});
   assert.equal(response.status,200);
   assert.equal(response.body.status,"research_selected",JSON.stringify(response));
   assert.equal(response.body.selection.selected_game_id,entry.selected);
   assert.equal(response.body.adapter.widgetId,entry.adapter);
   assert.equal(response.body.adapter.available,true);
   assert.equal(response.body.selection.selection_trace.candidates.length,6);
   assert.equal(response.body.publicationAllowed,false);
   assert.deepEqual(response.body.selection.selection_trace.evaluatedPeerIds,body.games.map(g=>g.id));
  }
  for(const record of body.records.filter(r=>
   ![DILLARD_V21.id,KIERKEGAARD_V21.id].includes(r.id))){
   const x=await post(app,"/api/research/select",{recordId:record.id});
   assert.equal(x.status,200);
   assert.equal(x.body.adapter.available,false);
   assert.equal(x.body.selection.selected_game_id===null||
    x.body.selection.selected_game.browserPrototypeAvailable===false,true);
   assert.equal(x.body.publicationAllowed,false);
  }
 });
});
test("canonical allocation submitted by PR #182 Token Studio reaches selected Reasoning→Emotion→Expression, differs with actual choice",async()=>{
 await withServer(async app=>{
  const p1=await post(app,"/api/research/run",{
   recordId:DILLARD_V21.id,versionHash:DILLARD_V21.versionHash,
   choice:{gameId:"token_studio",amounts:[3,1,2],repetitions:5}
  });
  assert.equal(p1.status,200,JSON.stringify(p1.body));
  assert.equal(p1.body.status,"ready");
  assert.equal(p1.body.selectedGameId,"token_studio");
  assert.deepEqual(p1.body.result.canonical_choice,{amounts:[3,1,2],budgets:[6],repetitions:5});
  assert.equal(p1.body.result.meaning.meaning.kind,"repetition");
  assert.ok(p1.body.result.expression.wordCount>=80&&p1.body.result.expression.wordCount<=120);
  assert.deepEqual(p1.body.result.stages.map(x=>x.name),[
   "Content database","ONE mini-game selection","User interaction","Reasoning",
   "Emotion","Expression","Play–Discover–Remember"
  ]);
  assert.equal(p1.body.publicationAllowed,false);
  const p2=await post(app,"/api/research/run",{
   recordId:DILLARD_V21.id,versionHash:DILLARD_V21.versionHash,
   choice:{gameId:"token_studio",amounts:[0,0,6],repetitions:5}
  });
  assert.equal(p2.status,200,JSON.stringify(p2.body));
  assert.notEqual(p1.body.result.expression.sections[0].text,
   p2.body.result.expression.sections[0].text);
  assert.notEqual(p1.body.result.expression.sections[1].text,
   p2.body.result.expression.sections[1].text);
  assert.equal(p1.body.result.meaning.author,p2.body.result.meaning.author);
  assert.equal(p1.body.result.meaning.sourceAdmission.centralClaim,
   p2.body.result.meaning.sourceAdmission.centralClaim);
 });
});
test("canonical staged Swipe Decision makes all 8 paths available without forging an external user action",async()=>{
 await withServer(async app=>{
  const selection=(await post(app,"/api/research/select",{recordId:KIERKEGAARD_V21.id})).body;
  assert.equal(selection.adapter.available,true);
  const contract=selection.selection.canonical_choice_contract;
  assert.deepEqual(contract.stages.map(x=>x.role),
   ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
  assert.equal(contract.sourceAuthoredRoutes.length,8);
  for(const route of contract.sourceAuthoredRoutes){
   const output=await post(app,"/api/research/run",{
    recordId:KIERKEGAARD_V21.id,versionHash:KIERKEGAARD_V21.versionHash,
    choice:{gameId:"swipe_decision",path:route.path}
   });
   assert.equal(output.status,200,JSON.stringify({route,output}));
   assert.equal(output.body.status,"ready");
   assert.deepEqual(output.body.result.canonical_choice.path,route.path);
   assert.ok(KIERKEGAARD_V21.emotionalEligibility.allowedStrategies
    .includes(output.body.result.emotion.strategy));
   assert.equal(output.body.result.publicationAllowed,false);
  }
 });
});
test("source, game, agency, request and publication spoofing are rejected at local API boundary",async()=>{
 await withServer(async app=>{
  const failures=[
   {recordId:"research:unknown:source",versionHash:"spoof",choice:{gameId:"token_studio",amounts:[3,1,2]}},
   {recordId:DILLARD_V21.id,versionHash:"forged",choice:{gameId:"token_studio",amounts:[3,1,2],repetitions:5}},
   {recordId:DILLARD_V21.id,versionHash:DILLARD_V21.versionHash,choice:{gameId:"future_reveal",amounts:[3,1,2],repetitions:5}},
   {recordId:DILLARD_V21.id,versionHash:DILLARD_V21.versionHash,choice:{gameId:"token_studio",amounts:[99,1,2],repetitions:5}},
   {recordId:KIERKEGAARD_V21.id,versionHash:KIERKEGAARD_V21.versionHash,choice:{gameId:"swipe_decision",path:["change","invented","continue"]}},
   {recordId:KIERKEGAARD_V21.id,versionHash:KIERKEGAARD_V21.versionHash,choice:{gameId:"swipe_decision",path:["change","risk"]}}
  ];
  for(const request of failures){
   const response=await post(app,"/api/research/run",request);
   assert.notEqual(response.status,200,JSON.stringify(response));
   assert.notEqual(response.body.status,"ready");
  }
  const injected=await post(app,"/api/research/select",{
   recordId:DILLARD_V21.id,preferredGameId:"future_reveal"
  });
  assert.equal(injected.status,400);
  const hostile=await post(app,"/api/research/select",{recordId:DILLARD_V21.id},
   "https://hostile.example");
  assert.equal(hostile.status,403);
  const raw=await fetch(app.url+"/api/research/run",{
   method:"POST",headers:{"content-type":"application/json",origin:app.url},
   body:JSON.stringify({recordId:DILLARD_V21.id,versionHash:DILLARD_V21.versionHash,
    choice:{gameId:"token_studio",amounts:[3,1,2],repetitions:5},
    publish:true})});
  assert.equal(raw.status,400);
 });
});
