/**
 * CZ-123 independent known-controls rerun.
 * HEAD under test: 25834a8e57a2efe662a4a03b901373face21b2fc.
 * QA branch adds ONLY tests/workflow, no implementation edits.
 * A passing run means original A-E probes are resolved within tested scope.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {
  CONTENT_VERSION,GAME_IDS,contentFingerprintV21,
  validateContentRecordV21,validateChoiceV21,canPublishEncounterV21
} from "../philosophy-engine/content/content-contract-v21.js";
import {assessAllSixPeerGames,authoritativeContextForRecord}
  from "../philosophy-engine/content/content-capabilities-v211.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
  from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {renderEncounterV20} from "../philosophy-engine/encounter/encounter-v20.js";
import {researchContentFromTrustedContextV211}
  from "../philosophy-engine/content/source-intake-research-v211.js";
import {renderSourceGroundedResearchV211,validateSourceGroundedResearchV211}
  from "../philosophy-engine/content/source-grounded-composer-v211.js";
const clone=structuredClone;
const stamp=x=>(x.versionHash=contentFingerprintV21(x),x);
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const reported=(caseId,result)=>console.log("CZ123-INDEPENDENT-"+caseId+" "+JSON.stringify(result));
test("A: claim Swipe eligibility for non-branching Dillard is invalid, even with lengthy explanation",()=>{
 const r=clone(DILLARD_V21);
 const swipe=r.gameCompatibility.find(g=>g.id==="swipe_decision");
 swipe.eligible=true;
 swipe.evidenceOrRejection="Reader navigates branches despite no authored future or subsequent decisions in the schedule.";
 stamp(r);
 const v=validateContentRecordV21(r);
 reported("A",{contentStatus:v.status,reason:v.errors.find(e=>e.field.includes("swipe"))?.reason,choiceStatus:validateChoiceV21(r,{gameId:"swipe_decision",amounts:[3,1,2],repetitions:5}).status,peers:assessAllSixPeerGames(DILLARD_V21,GAME_IDS).filter(g=>g.eligible).map(g=>g.id)});
 assert.equal(v.status,"invalid");
 assert.equal(validateChoiceV21(r,{gameId:"swipe_decision",amounts:[3,1,2],repetitions:5}).status,"rejected");
});
test("B: fake terminal path, omitted terminal and agency inversion are invalid; all 8 real routes reach reasoning READY",()=>{
 const counterfeit=clone(KIERKEGAARD_V21);
 counterfeit.scenario.constraints.routes.push({
  path:["change","risk","guaranteed-success"],authoredDevelopments:[],
  agencyRoles:["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"],unchosenOutcomeKnown:false});
 stamp(counterfeit);
 const badRoute=validateContentRecordV21(counterfeit);
 assert.equal(badRoute.status,"invalid");
 assert.equal(validateChoiceV21(counterfeit,{gameId:"swipe_decision",path:["change","risk","guaranteed-success"]}).status,"rejected");
 const wrongAgency=clone(KIERKEGAARD_V21);
 wrongAgency.scenario.constraints.routes[0].agencyRoles[1]="USER_DECISION";
 stamp(wrongAgency);assert.equal(validateContentRecordV21(wrongAgency).status,"invalid");
 const incomplete=clone(KIERKEGAARD_V21);
 incomplete.scenario.constraints.routes.pop();stamp(incomplete);
 assert.equal(validateContentRecordV21(incomplete).status,"invalid");
 const observed=KIERKEGAARD_V21.scenario.constraints.routes.map(r=>{
  const contract=validateChoiceV21(KIERKEGAARD_V21,{gameId:"swipe_decision",path:r.path});
  return {path:r.path,roles:r.agencyRoles,contract:contract.status,engine:reasonSemantically(semanticCases.kierkegaard,{path:r.path}).status};
 });
 reported("B",{fabricated:badRoute.status,wrongAgency:validateContentRecordV21(wrongAgency).status,missingBranch:validateContentRecordV21(incomplete).status,realPaths:observed});
 assert.equal(observed.length,8);
 assert.ok(observed.every(x=>x.contract==="ready"&&x.engine==="ready"&&
   x.roles.join("|")==="USER_DECISION|AUTHORED_DEVELOPMENT|USER_DECISION"));
});
test("C: fake signatures, spoofed release flags, recomputed hash cannot grant publication",()=>{
 const r=clone(DILLARD_V21);
 r.source.reviewState="source_verified";
 r.source.verifiedSourceUrl="https://forged.invalid/primary";
 r.source.translationEdition="Edition Q";
 stamp(r);
 r.source.reviewSignoff={reviewer:"malicious",reviewedAt:"2026-11-15",
   versionHash:r.versionHash,translationEdition:"Edition Q",passageLocation:"1"};
 r.editorialState="public_approved";
 r.editorialSignoff={reviewer:"malicious",reviewedAt:"2026-11-15",versionHash:r.versionHash};
 const release={founderAuthorized:true,publicFeatureFlag:true,approvedRecordFingerprints:[r.versionHash]};
 const result=canPublishEncounterV21(r,release);
 reported("C",{record:validateContentRecordV21(r).status,release:result});
 assert.equal(result,false);
});
test("D: missing six-peer trace and missing reason must fail, while complete Hegel entry remains inventory no-fit",()=>{
 const a=clone(HEGEL_NO_FIT_V21);a.gameCompatibility=[];stamp(a);
 const b=clone(HEGEL_NO_FIT_V21);b.gameCompatibility[2].evidenceOrRejection="";stamp(b);
 const c=clone(HEGEL_NO_FIT_V21);c.noFitReason="";stamp(c);
 reported("D",{empty:validateContentRecordV21(a).status,blankPeer:validateContentRecordV21(b).status,blankNoFit:validateContentRecordV21(c).status,complete:validateContentRecordV21(HEGEL_NO_FIT_V21).status});
 for(const r of [a,b,c])assert.equal(validateContentRecordV21(r).status,"invalid");
 assert.equal(validateContentRecordV21(HEGEL_NO_FIT_V21).status,"inventory_no_fit");
});
test("E: two different source-grounded research evidence types support bounded expression; malformed result fails integrity",()=>{
 const cases=[{name:"conversion",key:"money",choice:{gameId:"trade_off",amounts:[1,0,1],repetitions:5}},
 {name:"specialization_effect",key:"workshop",choice:{gameId:"trade_off",amounts:[3,1]}}];
 for(const t of cases){
  const intake=researchContentFromTrustedContextV211(semanticCases[t.key]);
  assert.equal(intake.status,"ready");
  const canonical=validateChoiceV21(intake.record,t.choice);
  assert.equal(canonical.status,"ready");
  const m=reasonSemantically(authoritativeContextForRecord(intake.record),canonical.canonical);
  assert.equal(m.status,"ready");
  assert.equal(m.meaning.kind,t.name);
  assert.notEqual(renderEncounterV20(m).status,"ready");
  const out=renderSourceGroundedResearchV211(intake.record,t.choice,env);
  assert.equal(out.status,"ready",JSON.stringify(out));
  assert.ok(out.wordCount>=80&&out.wordCount<=120);
  assert.deepEqual(out.sections.map(s=>s.label),["Your Choice","Back to the Philosopher","One Last Thing…"]);
  assert.equal(out.source_url,m.source.url);
  assert.equal(out.source_work,m.source.work);
  assert.equal(out.source_review,"curated_provisional");
  assert.equal(out.brief.strategy,"contemplative");
  const forged=clone(out);forged.sections[1].text="The model proves that one path is objectively morally superior.";
  assert.notEqual(validateSourceGroundedResearchV211(intake.record,t.choice,env,forged).status,"ready");
  reported("E-"+t.name,{record:validateContentRecordV21(intake.record).status,choice:canonical.status,meaning:m.status,copy:out.status,words:out.wordCount,sectionWords:out.sectionWordCounts,source:out.source_work,frozen:renderEncounterV20(m).status});
 }
});
