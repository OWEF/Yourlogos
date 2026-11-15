/**
 * CZ-130 independent adversarial DESK review. These passing tests intentionally
 * reproduce real acceptance gaps. A green run means "defects reproducible",
 * NOT content contract accepted. Do not merge into development work.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {
 validateContentRecordV21,validateChoiceV21,contentFingerprintV21,canPublishEncounterV21
} from "../philosophy-engine/content/content-contract-v21.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21} from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {renderEncounterV20} from "../philosophy-engine/encounter/encounter-v20.js";
const clone=x=>structuredClone(x),refingerprint=x=>{x.versionHash=contentFingerprintV21(x);return x;};
test("P0 repro A: an unsourced eligible Swipe Decision in Dillard's budget passes content schema and input",()=>{
 const forged=clone(DILLARD_V21);
 const g=forged.gameCompatibility.find(g=>g.id==="swipe_decision");
 g.eligible=true;
 g.evidenceOrRejection="Scenario author asserts this is suitable despite no dependent branch.";
 refingerprint(forged);
 assert.equal(validateContentRecordV21(forged).status,"valid_research_record");
 const admitted=validateChoiceV21(forged,{gameId:"swipe_decision",amounts:[3,1,2],repetitions:5});
 assert.equal(admitted.status,"ready");
 assert.deepEqual(admitted.canonical,{amounts:[3,1,2],budgets:[6],repetitions:5});
 console.log("CZ130-ADVERSARIAL A: FALSE GAME ELIGIBILITY ADMITTED; free-text assertions aren't capability proofs.");
});
test("P0 repro B: an invented branching outcome is admitted to content contract but refused by frozen reasoner",()=>{
 const forged=clone(KIERKEGAARD_V21);
 forged.scenario.constraints.routes.push({
  path:["change","risk","guaranteed-success"],authoredDevelopments:[],
  unchosenOutcomeKnown:false
 });
 refingerprint(forged);
 assert.equal(validateContentRecordV21(forged).status,"valid_research_record");
 assert.equal(validateChoiceV21(forged,{gameId:"swipe_decision",path:["change","risk","guaranteed-success"]}).status,"ready");
 const reasoning=reasonSemantically(semanticCases.kierkegaard,{path:["change","risk","guaranteed-success"]});
 assert.notEqual(reasoning.status,"ready","Frozen source-authored model correctly blocks invented terminal path.");
 console.log("CZ130-ADVERSARIAL B: CONTENT PATH/REASONER GRAPH INCONSISTENT; no source-backed node consistency enforced.");
});
test("P0 design boundary C: public authorization fields are untrusted plain caller-controlled data",()=>{
 const forged=clone(DILLARD_V21);
 forged.source.reviewState="source_verified";
 forged.source.verifiedSourceUrl="https://example.org/claimed-original";
 forged.source.translationEdition="Edition A";
 refingerprint(forged);
 forged.source.reviewSignoff={reviewer:"fake-id",reviewedAt:"2026-11-15",versionHash:forged.versionHash,translationEdition:"Edition A",passageLocation:"p.1"};
 forged.editorialState="public_approved";
 forged.editorialSignoff={reviewer:"fake-id",reviewedAt:"2026-11-15",versionHash:forged.versionHash};
 assert.equal(validateContentRecordV21(forged).status,"valid_research_record");
 assert.equal(canPublishEncounterV21(forged,{
  founderAuthorized:true,publicFeatureFlag:true,
  approvedRecordFingerprints:[forged.versionHash]
 }),true);
 console.log("CZ130-ADVERSARIAL C: FAKE SIGNOFF+CALLER RELEASE FLAGS PRODUCE TRUE; requires independent server-owned authority, not this library boolean.");
});
test("P1 repro D: early no-fit return does not require all six justified peer rejections",()=>{
 const malformed=clone(HEGEL_NO_FIT_V21);
 malformed.gameCompatibility=[];refingerprint(malformed);
 assert.equal(validateContentRecordV21(malformed).status,"inventory_no_fit");
 console.log("CZ130-ADVERSARIAL D: NO-FIT RECORD WITH ZERO PEER-REJECTION EVIDENCE ADMITTED.");
});
test("architecture transfer gate E: prior meaning-ready mechanism is not yet supported by frozen v2 expression",()=>{
 const r=semanticCases.money;
 const p=reasonSemantically(r,{amounts:[1,0,1],budgets:[8]});
 assert.equal(p.status,"ready","The existing reasoner should handle the already-authored Thoreau case.");
 const out=renderEncounterV20(p);
 assert.notEqual(out.status,"ready","Frozen v2.0 composer lacks general source admission and strategy for this separate source.");
 console.log("CZ130-ADVERSARIAL E: READY meaning/1.2 source distinct from three curated v2 pilots still cannot obtain v2.0 READY expression; universal new sources are NOT achieved by six-peer selector alone.");
});
