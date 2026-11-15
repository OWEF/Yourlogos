/**
 * CZ-123 NEW independent adversarial assertions, not supplied by CZ-130.
 * Tests expect safe rejection / meaningful source specificity. Any failing
 * test is a genuine acceptance gap; don't 'fix' the tests to obtain green.
 *
 * This QA-only file intentionally does not modify the candidate SHA.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {
  contentFingerprintV21,validateContentRecordV21,canPublishEncounterV21
} from "../philosophy-engine/content/content-contract-v21.js";
import {DILLARD_V21,HEGEL_NO_FIT_V21,KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {authoritativeContextForRecord}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {renderSourceGroundedResearchV211}
 from "../philosophy-engine/content/source-grounded-composer-v211.js";
const clone=structuredClone,stamp=r=>(r.versionHash=contentFingerprintV21(r),r);
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const money=()=>researchContentFromTrustedContextV211(semanticCases.money).record;
const print=(tag,v)=>console.log("CZ123-NOVEL-"+tag+" "+JSON.stringify(v));
test("P0 SOURCE ATTRIBUTION: changing only author with matching URL/work/quote MUST invalidate the content",()=>{
 const r=clone(DILLARD_V21);
 r.source.author="Aristotle";stamp(r);
 const v=validateContentRecordV21(r);
 const context=authoritativeContextForRecord(r);
 const generated=renderSourceGroundedResearchV211(r,{gameId:"token_studio",amounts:[3,1,2],repetitions:5},env);
 print("AUTHOR-SPOOF",{status:v.status,contextAuthor:context?.author,recordAuthor:r.source.author,outputAuthor:generated.author,copy:generated.status});
 assert.equal(v.status,"invalid","Exact author identity is part of the editorial source contract; SHA alone is self-generated.");
});
test("P0 PHILOSOPHICAL FALSE THESIS: long, nonempty contrary claim MUST NOT pass research admission",()=>{
 const r=clone(DILLARD_V21);
 r.argument.thesis="The source demonstrates conclusively that resting is morally inferior to writing and that this player's token schedule proves their character.";
 r.argument.accessibleInsight="People who rest are morally irresponsible; the six tokens identify immutable real personality.";
 stamp(r);
 const v=validateContentRecordV21(r);
 print("FALSE-THESIS",{status:v.status,sourceWarrant:r.argument.sourceWarrant,unsupportedThesis:r.argument.thesis});
 assert.equal(v.status,"invalid","A matching centralClaim doesn't validate contradictory editorial thesis and learning insight.");
});
test("P0 SCENARIO WARRANT: claim real outcomes or moral superiority in scenario.consequences MUST be rejected",()=>{
 const r=clone(DILLARD_V21);
 r.scenario.consequences.warrant="Six imagined slots prove the user's actual character and show that writing is morally superior to resting.";
 r.scenario.consequences.unknowns=["none, psychological traits are completely certain"];
 stamp(r);
 const v=validateContentRecordV21(r);
 print("FALSE-CONSEQUENCE",{status:v.status,warrant:r.scenario.consequences.warrant});
 assert.equal(v.status,"invalid","A content record cannot assert opposite certainty from its frozen epistemic boundary.");
});
test("P0 NO-FIT TRUTH: six lengthy but fabricated explanations MUST NOT become independently reviewed evidence",()=>{
 const r=clone(HEGEL_NO_FIT_V21);
 for(const g of r.gameCompatibility)
  g.evidenceOrRejection="This philosophical passage explicitly provides six half-hour tokens, a certified future prediction and three controllable actions.";
 r.noFitReason="The passage contains no proposition about philosophy and therefore cannot be studied.";
 stamp(r);
 const v=validateContentRecordV21(r);
 print("FALSE-NOFIT",{status:v.status,evidenceExample:r.gameCompatibility[0].evidenceOrRejection,reason:r.noFitReason});
 assert.equal(v.status,"invalid","Character-count checks are not source-grounded no-fit evidence.");
});
test("P0 EMOTION ALLOWLIST: a record allowing only playful cannot receive contemplative READY",()=>{
 const r=clone(money());
 r.emotionalEligibility.allowedStrategies=["playful"];
 stamp(r);
 const v=validateContentRecordV21(r);
 const out=renderSourceGroundedResearchV211(r,{gameId:"trade_off",amounts:[1,0,1],repetitions:5},env);
 print("EMOTION-BYPASS",{contract:v.status,allowed:r.emotionalEligibility.allowedStrategies,outputStatus:out.status,chosen:out.brief?.strategy});
 assert.ok(v.status==="invalid"||out.status!=="ready"||
  r.emotionalEligibility.allowedStrategies.includes(out.brief?.strategy),
  "A READY creative brief must obey the content's independently validated eligible strategy set.");
});
test("P1 SOURCE-SPECIFIC TEACHING: different quantitative choice consequences must alter the explanatory bridge",()=>{
 const r=money();
 const choices=[
  {gameId:"trade_off",amounts:[1,0,1],repetitions:5},
  {gameId:"trade_off",amounts:[2,0,0],repetitions:5}
 ];
 const outputs=choices.map(c=>renderSourceGroundedResearchV211(r,c,env));
 print("TEMPLATE-TEACHING",outputs.map((o,i)=>({
  choice:choices[i].amounts,result:o.status,copy:o.sections?.map(s=>s.text)
 })));
 assert.ok(outputs.every(o=>o.status==="ready"),"Both allocations must be supported to compare instructional specificity.");
 assert.notEqual(outputs[0].sections[0].text,outputs[1].sections[0].text,
   "The choice recap should distinguish the actual modeled consequences.");
 assert.notEqual(outputs[0].sections[1].text,outputs[1].sections[1].text,
   "Back to the Philosopher must connect the actual user's result to the argument, not repeat invariant boilerplate.");
});
test("P1 SCENARIO INTRO PARITY: fabricated hours in prompt/variables must not contradict trusted budget",()=>{
 const r=clone(DILLARD_V21);
 r.dilemma="You have twenty-seven free hours tonight, and this scenario proves that all hours are observed.";
 r.scenario.variables.availableHours=27;
 stamp(r);
 const v=validateContentRecordV21(r);
 print("INTRO-MISMATCH",{status:v.status,claimed:r.scenario.variables.availableHours,sourceBudget:authoritativeContextForRecord(r)?.model?.resources?.[0]?.max});
 assert.equal(v.status,"invalid","First-time reader must not be given contradictory task facts that the engine silently ignores.");
});
test("P0 SMITH CONDITIONALITY: when modeled gains are ZERO, teaching must explicitly reject a gain claim",()=>{
 const intake=researchContentFromTrustedContextV211(semanticCases.workshop);
 assert.equal(intake.status,"ready");
 const selected={gameId:"trade_off",amounts:[3,1]};
 const out=renderSourceGroundedResearchV211(intake.record,selected,env);
 const first=out.sections?.[0]?.text||"",teaching=out.sections?.[1]?.text||"";
 const e=out.evidence?.find(x=>x.id==="meaning:central")?.evidence;
 print("SMITH-ZERO-DELTA",{status:out.status,delta:e?.delta,baseline:e?.baseline,specialized:e?.specialized,first,teaching});
 assert.equal(out.status,"ready");
 assert.equal(e?.delta,0);
 assert.match(teaching,/no (?:modeled )?improvement|(?:do|does|did) not (?:outperform|increase|improve)|(?:same|equal|tie|identical) (?:output|result|production)|no (?:productivity )?gain/i,
   "Teaching that invokes specialization gains must address the observed ZERO uplift, not merely repeat a generic theorem.");
});
test("INTENDED ABSTENTION: completely new context is not automatically authorized; no forced game or publication",()=>{
 const novel=clone(semanticCases.money);
 novel.id="independent-review-only-new-domain";
 novel.author="Unauthenticated new source";
 const intake=researchContentFromTrustedContextV211(novel);
 print("NEW-CONTEXT-ABSTAIN",{status:intake.status,reason:intake.reason});
 assert.equal(intake.status,"needs_source_review");
 assert.equal(canPublishEncounterV21(DILLARD_V21,{founderAuthorized:true}),false);
});
