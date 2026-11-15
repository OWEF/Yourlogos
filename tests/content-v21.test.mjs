import {test} from "node:test";
import assert from "node:assert/strict";
import {GAME_IDS,CONTENT_VERSION,validateContentRecordV21,validateChoiceV21,canRunIsolatedResearchV21,canPublishEncounterV21,contentFingerprintV21} from "../philosophy-engine/content/content-contract-v21.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21} from "../philosophy-engine/content/research-fixtures-v21.js";
const clone=x=>structuredClone(x);
const research={isolated:true,publicVisibility:false,provisionalDisclosure:true};
test("versioned record and exactly six games without a pre-router",()=>{
 assert.equal(CONTENT_VERSION,"philosophical-content/2.1.0");
 assert.deepEqual(GAME_IDS,["trade_off","decision_map","token_studio","balance_of_values","swipe_decision","future_reveal"]);
 for(const r of [DILLARD_V21,KIERKEGAARD_V21]){
  assert.equal(validateContentRecordV21(r).status,"valid_research_record");
  assert.equal(r.gameCompatibility.length,6);
  assert.equal(canRunIsolatedResearchV21(r,research),true);
  assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true}),false);
 }
 assert.equal(validateContentRecordV21(HEGEL_NO_FIT_V21).status,"inventory_no_fit");
 assert.equal(canRunIsolatedResearchV21(HEGEL_NO_FIT_V21,research),false);
});
test("conserve six safe half-hours; yield actual canonical evidence packet",()=>{
 const r=validateChoiceV21(DILLARD_V21,{amounts:[3,1,2],repetitions:5,gameId:"token_studio"});
 assert.equal(r.status,"ready");assert.deepEqual(r.canonical,{amounts:[3,1,2],budgets:[6],repetitions:5});
 assert.equal(r.unitHours,0.5);
 for(const a of [[6,0,0],[0,6,0],[0,0,6],[1,2,3]])assert.equal(validateChoiceV21(DILLARD_V21,{amounts:a,repetitions:5,gameId:"token_studio"}).status,"ready");
});
test("reject overspend, underspend, negative, fractional slots, NaN, wrong horizon and wrong arity",()=>{
 for(const amounts of [[7,0,0],[1,1,1],[-1,7,0],[1.5,2,2.5],[NaN,3,3],[1,5],[1,4,2],[Infinity,0,0]])
  assert.equal(validateChoiceV21(DILLARD_V21,{amounts,repetitions:5,gameId:"token_studio"}).status,"rejected",String(amounts));
 assert.equal(validateChoiceV21(DILLARD_V21,{amounts:[3,1,2],repetitions:1,gameId:"token_studio"}).status,"rejected");
});
test("Kierkegaard only complete authored paths, no knowledge of the alternative",()=>{
 assert.deepEqual(validateChoiceV21(KIERKEGAARD_V21,{path:["change","risk","continue"],gameId:"swipe_decision"}).canonical,{path:["change","risk","continue"]});
 assert.equal(validateChoiceV21(KIERKEGAARD_V21,{path:["stay","missed","reflect"],gameId:"swipe_decision"}).status,"ready");
 assert.equal(validateChoiceV21(KIERKEGAARD_V21,{path:["change","unwritten","return"],gameId:"swipe_decision"}).status,"rejected");
 assert.equal(validateChoiceV21(KIERKEGAARD_V21,{path:["change"],gameId:"swipe_decision"}).status,"rejected");
});
test("fail closed on missing source, fabricated game, invalid budget and no-fit promotion",()=>{
 const cases=[x=>{x.source.quote="";},x=>{x.source.referenceUrl="";},
  x=>{x.gameCompatibility.pop();},x=>{x.gameCompatibility[0].id="fake_game";},
  x=>{x.scenario.constraints.capacity=-1;},x=>{x.scenario.constraints.unitHours=0;},
  x=>{x.scenario.constraints.costs=[1,1];},x=>{x.scenario.choices[0].id=x.scenario.choices[1].id;},
  x=>{x.editorialState="public_approved";},x=>{x.source.reviewState="source_verified";},
  x=>{x.version="newer_schema";}];
 for(const change of cases){const r=clone(DILLARD_V21);change(r);assert.equal(validateContentRecordV21(r).status,"invalid",String(change));}
 const h=clone(HEGEL_NO_FIT_V21);h.gameCompatibility[0].eligible=true;
 assert.equal(validateContentRecordV21(h).status,"invalid");
});
test("provisional research never leaks to public on flags or badge spoofing",()=>{
 for(const env of [{},{isolated:true,publicVisibility:true,provisionalDisclosure:true},
   {isolated:true,publicVisibility:false,provisionalDisclosure:false}])
  assert.equal(canRunIsolatedResearchV21(DILLARD_V21,env),false);
 const r=clone(DILLARD_V21);
 r.source.badge="verified";r.editorialState="public_approved";
 r.editorialSignoff={reviewer:"fake",reviewedAt:"yesterday",versionHash:r.versionHash};
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true}),false);
});
test("source verified alone is insufficient for public release",()=>{
 const r=clone(DILLARD_V21);
 r.source.reviewState="source_verified";
 r.source.verifiedSourceUrl="https://example.org/primary";
 r.source.translationEdition="Edition A";
 r.versionHash=contentFingerprintV21(r);
 r.source.reviewSignoff={reviewer:"Independent editor",reviewedAt:"2026-11-15",versionHash:r.versionHash,translationEdition:"Edition A",passageLocation:"p. 1"};
 assert.equal(validateContentRecordV21(r).status,"valid_research_record");
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true}),false);
 r.editorialState="public_approved";
 r.editorialSignoff={reviewer:"Editorial approver",reviewedAt:"2026-11-15",versionHash:r.versionHash};
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:false,publicFeatureFlag:true}),false);
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:false}),false);
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true}),false,"No trusted release hash allowlist, no public approval");
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true,approvedRecordFingerprints:[r.versionHash]}),true);
 r.argument.thesis="Edited after scholarly review";
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true,approvedRecordFingerprints:[r.versionHash]}),false);
});
test("incompatible game submissions fail even with mathematically valid choices",()=>{
 assert.equal(validateChoiceV21(DILLARD_V21,{amounts:[3,1,2],repetitions:5,gameId:"future_reveal"}).status,"rejected");
 assert.equal(validateChoiceV21(DILLARD_V21,{amounts:[3,1,2],repetitions:5,gameId:"swipe_decision"}).status,"rejected");
 assert.equal(validateChoiceV21(DILLARD_V21,{amounts:[3,1,2],repetitions:5}).status,"rejected");
 assert.equal(validateChoiceV21(KIERKEGAARD_V21,{path:["change","risk","continue"],gameId:"token_studio"}).status,"rejected");
 assert.equal(validateChoiceV21(KIERKEGAARD_V21,{path:["change","risk","continue"],gameId:"decision_map"}).status,"ready");
});
test("Hegel cannot enter reasoner by invented allocation",()=>{
 assert.equal(validateChoiceV21(HEGEL_NO_FIT_V21,{amounts:[3,3],repetitions:5}).status,"rejected");
});
