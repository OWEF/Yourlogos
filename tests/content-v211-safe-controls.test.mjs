import {test} from "node:test";
import assert from "node:assert/strict";
import {
 validateContentRecordV21,validateChoiceV21,contentFingerprintV21,
 canPublishEncounterV21,GAME_IDS
} from "../philosophy-engine/content/content-contract-v21.js";
import {assessAllSixPeerGames,sourceBoundBranchParity,authoritativeContextForRecord}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
const clone=x=>structuredClone(x);
const stamp=x=>{x.versionHash=contentFingerprintV21(x);return x;};
test("Known A RED→GREEN: false 'swipe_decision' eligibility cannot manufacture a Dillard decision map",()=>{
 const x=clone(DILLARD_V21),g=x.gameCompatibility.find(y=>y.id==="swipe_decision");
 g.eligible=true;g.evidenceOrRejection="Research claims two directional decisions but no authored path exists.";
 stamp(x);
 const check=validateContentRecordV21(x);
 assert.equal(check.status,"invalid");
 assert.match(check.errors.map(e=>e.reason).join(" "),/machine-checkable|three-stage|source/i);
 assert.equal(validateChoiceV21(x,{gameId:"swipe_decision",amounts:[3,1,2],repetitions:5}).status,"rejected");
 assert.deepEqual(assessAllSixPeerGames(DILLARD_V21,GAME_IDS).filter(x=>x.eligible).map(x=>x.id),
   ["trade_off","token_studio"]);
});
test("Known B RED→GREEN: fabricated Kierkegaard route rejected BEFORE canonical acceptance",()=>{
 const x=clone(KIERKEGAARD_V21);
 x.scenario.constraints.routes.push({path:["change","risk","guaranteed-success"],
   authoredDevelopments:[],agencyRoles:["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"],
   unchosenOutcomeKnown:false});
 stamp(x);
 assert.equal(validateContentRecordV21(x).status,"invalid");
 assert.equal(validateChoiceV21(x,{gameId:"swipe_decision",path:["change","risk","guaranteed-success"]}).status,"rejected");
 assert.equal(sourceBoundBranchParity(KIERKEGAARD_V21,authoritativeContextForRecord(KIERKEGAARD_V21)).ok,true);
 for(const path of KIERKEGAARD_V21.scenario.constraints.routes.map(x=>x.path)){
  assert.equal(validateChoiceV21(KIERKEGAARD_V21,{gameId:"swipe_decision",path}).status,"ready",JSON.stringify(path));
  assert.equal(reasonSemantically(semanticCases.kierkegaard,{path}).status,"ready",JSON.stringify(path));
 }
 const x2=clone(KIERKEGAARD_V21),r=x2.scenario.constraints.routes[0];
 r.agencyRoles=["USER_DECISION","USER_DECISION","USER_DECISION"];stamp(x2);
 assert.equal(validateContentRecordV21(x2).status,"invalid","Forging event agency is rejected");
 const x3=clone(KIERKEGAARD_V21);
 x3.scenario.constraints.routes=x3.scenario.constraints.routes.slice(0,-1);stamp(x3);
 assert.equal(validateContentRecordV21(x3).status,"invalid","Missing terminal graph path rejected");
});
test("Known C RED→GREEN: falsified signoff, arbitrary release booleans and forged digest NEVER publish",()=>{
 const r=clone(DILLARD_V21);
 r.source.reviewState="source_verified";r.source.verifiedSourceUrl="https://example.org/claimed-primary";
 r.source.translationEdition="Edition A";stamp(r);
 r.source.reviewSignoff={reviewer:"forged",reviewedAt:"2026-11-15",versionHash:r.versionHash,
   translationEdition:"Edition A",passageLocation:"p1"};
 r.editorialState="public_approved";
 r.editorialSignoff={reviewer:"forged",reviewedAt:"2026-11-15",versionHash:r.versionHash};
 assert.equal(validateContentRecordV21(r).status,"valid_research_record",
  "An otherwise valid record is NOT proof of editorial authority.");
 assert.equal(canPublishEncounterV21(r,{approvedRecordFingerprints:[r.versionHash],
  publicFeatureFlag:true,founderAuthorized:true}),false);
 assert.equal(canPublishEncounterV21(DILLARD_V21,{}),false);
});
test("Known D RED→GREEN: no-fit record without six substantive rejection traces rejected",()=>{
 const r=clone(HEGEL_NO_FIT_V21);r.gameCompatibility=[];stamp(r);
 assert.equal(validateContentRecordV21(r).status,"invalid");
 const r2=clone(HEGEL_NO_FIT_V21);r2.gameCompatibility[0].evidenceOrRejection="";stamp(r2);
 assert.equal(validateContentRecordV21(r2).status,"invalid");
 assert.equal(validateContentRecordV21(HEGEL_NO_FIT_V21).status,"inventory_no_fit");
 assert.equal(HEGEL_NO_FIT_V21.gameCompatibility.length,6);
});
test("No author-name router and no author-name override: source identity/warrant is strict",()=>{
 const x=clone(KIERKEGAARD_V21);x.source.work="Fabricated journal edition";stamp(x);
 assert.equal(validateContentRecordV21(x).status,"invalid");
 const y=clone(DILLARD_V21);y.argument.sourceWarrant="A made-up claim";stamp(y);
 assert.equal(validateContentRecordV21(y).status,"invalid");
 assert.equal(assessAllSixPeerGames(KIERKEGAARD_V21,GAME_IDS).filter(x=>x.eligible).map(x=>x.id).join(","),
 "decision_map,swipe_decision");
});
