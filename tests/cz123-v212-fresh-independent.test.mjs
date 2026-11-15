/**
 * INDEPENDENT CZ-123 v2.1.2 exact-SHA post-remediation adversarial suite.
 * No implementation or frozen engine changes are present on this QA branch.
 * The eight original tests copied byte-for-byte from PR #185 stay unchanged.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {contentFingerprintV21,validateContentRecordV21,validateChoiceV21,canPublishEncounterV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {renderSourceGroundedResearchV211,validateSourceGroundedResearchV211}
 from "../philosophy-engine/content/source-grounded-composer-v211.js";
const c=structuredClone,stamp=x=>(x.versionHash=contentFingerprintV21(x),x);
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const get=ctx=>{
 const x=researchContentFromTrustedContextV211(ctx);
 assert.equal(x.status,"ready",JSON.stringify(x));
 return x.record;
};
test("FRESH-1: source splicing and author-swapping across valid sources cannot obtain provenance admission",()=>{
 const d=c(DILLARD_V21);
 d.source.author=KIERKEGAARD_V21.source.author;stamp(d);
 assert.equal(validateContentRecordV21(d).status,"invalid");
 const k=c(KIERKEGAARD_V21);
 k.source.locator=DILLARD_V21.source.locator;stamp(k);
 assert.equal(validateContentRecordV21(k).status,"invalid");
 const t=c(get(semanticCases.money));
 t.source.author="Different source";
 stamp(t);
 assert.equal(validateContentRecordV21(t).status,"invalid");
 const w=c(get(semanticCases.workshop));
 w.argument.sourceWarrant=semanticCases.money.semantic.admission.centralClaim;
 stamp(w);
 assert.equal(validateContentRecordV21(w).status,"invalid");
 console.log("CZ123-V212-QA source identity splicing: 4/4 adversarial invalid");
});
test("FRESH-2: rearranging six plausible but wrong no-fit explanations cannot pass editorial authority",()=>{
 const base=HEGEL_NO_FIT_V21;
 assert.equal(validateContentRecordV21(base).status,"inventory_no_fit");
 assert.equal(new Set(base.gameCompatibility.map(x=>x.evidenceOrRejection)).size,6,
   "Six separate mechanic-specific reasons required, not one copied generic line.");
 const r=c(base);
 [r.gameCompatibility[0].evidenceOrRejection,r.gameCompatibility[1].evidenceOrRejection]=
 [r.gameCompatibility[1].evidenceOrRejection,r.gameCompatibility[0].evidenceOrRejection];
 stamp(r);
 assert.equal(validateContentRecordV21(r).status,"invalid","Plausible but wrong peer-specific reasoning not allowed.");
 const empty=c(base);
 empty.gameCompatibility[2].evidenceOrRejection="A reasonable explanation that was not independently reviewed and approved.";
 stamp(empty);
 assert.equal(validateContentRecordV21(empty).status,"invalid");
 console.log("CZ123-V212-QA no-fit wrong-peer and long unreviewed rationale: invalid");
});
test("FRESH-3: forbidden tones and false positive/no-fit pathways abstain without editing the frozen composer",()=>{
 const r=get(semanticCases.money),input={gameId:"trade_off",amounts:[1,0,1],repetitions:5};
 const modified=c(r);
 modified.emotionalEligibility.allowedStrategies=["playful"];
 stamp(modified);
 assert.equal(validateContentRecordV21(modified).status,"invalid");
 assert.notEqual(renderSourceGroundedResearchV211(modified,input,env).status,"ready");
 const other=c(r);
 other.emotionalEligibility.enabled=false;stamp(other);
 assert.equal(validateContentRecordV21(other).status,"invalid");
 assert.notEqual(renderSourceGroundedResearchV211(other,input,env).status,"ready");
 assert.notEqual(renderSourceGroundedResearchV211(HEGEL_NO_FIT_V21,input,env).status,"ready");
 assert.equal(canPublishEncounterV21(r,{founderAuthorized:true,publicFeatureFlag:true}),false);
});
test("FRESH-4: fabricated quantitative introduction and explicit certainty claims rejected regardless of hash",()=>{
 for(const fn of [
  r=>r.scenario.variables.availableHours=27,
  r=>r.dilemma="Twenty-seven hours are available tonight.",
  r=>r.argument.accessibleInsight="This character's moral worth is already proven.",
  r=>r.scenario.consequences.unknowns=["No real outcomes remain unknown"],
  r=>r.argument.uncertaintyLimit="All readers will behave exactly this way."
 ]){
  const r=c(DILLARD_V21);
  fn(r);stamp(r);
  assert.equal(validateContentRecordV21(r).status,"invalid",fn.toString());
 }
 const r=c(get(semanticCases.workshop));
 r.scenario.variables.metric="guaranteed real historical data";stamp(r);
 assert.equal(validateContentRecordV21(r).status,"invalid");
});
test("FRESH-5: source-grounded expression distinguishes conversion costs without asserting moral ranking",()=>{
 const r=get(semanticCases.money);
 const a=renderSourceGroundedResearchV211(r,{gameId:"trade_off",amounts:[1,0,1],repetitions:5},env);
 const b=renderSourceGroundedResearchV211(r,{gameId:"trade_off",amounts:[2,0,0],repetitions:5},env);
 assert.equal(a.status,"ready");assert.equal(b.status,"ready");
 assert.match(a.sections[1].text,/4 extra working hours/);
 assert.match(b.sections[1].text,/2 extra working hours/);
 assert.notEqual(a.sections[1].text,b.sections[1].text);
 for(const [out,choice] of [[a,{gameId:"trade_off",amounts:[1,0,1],repetitions:5}],
    [b,{gameId:"trade_off",amounts:[2,0,0],repetitions:5}]]){
  assert.match(out.sections[1].text,/life exchanged/i);
  assert.match(out.sections[1].text,/cost alone does not establish their worth/i);
  assert.equal(validateSourceGroundedResearchV211(r,choice,env,out).status,"ready");
  assert.ok(out.wordCount>=80&&out.wordCount<=120);
 }
});
test("FRESH-6: Smith positive, zero, negative outcomes are explicit and grammatical; no future is invented",()=>{
 const r=get(semanticCases.workshop);
 for(const [amounts,delta,pattern] of [
  [[2,2],1,/finishes 1 more booklet, a conditional modeled gain/i],
  [[3,1],0,/no improvement: both arrangements finish the same number/i],
  [[4,0],-1,/finishes 1 fewer booklet, so specialization does not improve/i]
 ]){
  const input={gameId:"trade_off",amounts};
  const out=renderSourceGroundedResearchV211(r,input,env);
  assert.equal(out.status,"ready",JSON.stringify(out));
  assert.equal(out.evidence.find(x=>x.id==="meaning:central")?.evidence?.delta,delta);
  assert.match(out.sections[1].text,pattern);
  assert.doesNotMatch(out.sections.map(x=>x.text).join(" "),/1 (?:more|fewer) booklets|1 finished booklets/i);
  assert.match(out.sections[1].text,/invented/i);
  assert.equal(validateSourceGroundedResearchV211(r,input,env,out).status,"ready");
 }
});
test("FRESH-7: fixture-backed research and graphical agency paths are still structurally compatible",()=>{
 assert.equal(validateContentRecordV21(DILLARD_V21).status,"valid_research_record");
 assert.equal(validateContentRecordV21(KIERKEGAARD_V21).status,"valid_research_record");
 const paths=KIERKEGAARD_V21.scenario.constraints.routes;
 assert.equal(paths.length,8);
 for(const p of paths){
  assert.deepEqual(p.agencyRoles,["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
  assert.equal(validateChoiceV21(KIERKEGAARD_V21,{gameId:"swipe_decision",path:p.path}).status,"ready");
 }
});
test("FRESH-8: the corrected implementation remains code-isolated from frozen v2.0 engine edits",()=>{
 const source=readFileSync(new URL("../philosophy-engine/content/source-grounded-composer-v211.js",import.meta.url),"utf8");
 assert.match(source,/renderEncounterV20\(packet\)/,"Frozen approved composer is not deleted.");
 const novel=c(semanticCases.money);
 novel.id="not-in-authorized-registry";
 assert.equal(researchContentFromTrustedContextV211(novel).status,"needs_source_review");
});
