import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 contentFingerprintV21,validateContentRecordV21,validateChoiceV21,canPublishEncounterV21
} from "../philosophy-engine/content/content-contract-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {renderSourceGroundedResearchV211,validateSourceGroundedResearchV211}
 from "../philosophy-engine/content/source-grounded-composer-v211.js";
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const stamp=r=>(r.versionHash=contentFingerprintV21(r),r);
const research=ctx=>{
 const result=researchContentFromTrustedContextV211(ctx);
 assert.equal(result.status,"ready",JSON.stringify(result));
 return result.record;
};
test("positive: existing source/editorial/choice contracts remain admitted while immutable modules stay untouched",()=>{
 for(const r of [DILLARD_V21,KIERKEGAARD_V21])
  assert.equal(validateContentRecordV21(r).status,"valid_research_record");
 assert.equal(validateContentRecordV21(HEGEL_NO_FIT_V21).status,"inventory_no_fit");
 assert.equal(validateChoiceV21(DILLARD_V21,{gameId:"token_studio",amounts:[3,1,2],repetitions:5}).status,"ready");
 const valid=KIERKEGAARD_V21.scenario.constraints.routes;
 assert.equal(valid.length,8);
 for(const r of valid)
  assert.equal(validateChoiceV21(KIERKEGAARD_V21,{gameId:"swipe_decision",path:r.path}).status,"ready");
 for(const ctx of [semanticCases.money,semanticCases.workshop])
  assert.equal(validateContentRecordV21(research(ctx)).status,"valid_research_record");
 assert.equal(canPublishEncounterV21(DILLARD_V21,{founderAuthorized:true}),false);
});
test("negative: semantic identity, source attribution, consequence and scenario cannot be forged by rehash",()=>{
 for(const mutate of [
  r=>r.source.author="Aristotle",
  r=>r.source.locator="A fabricated primary page",
  r=>r.argument.thesis="This makes resting objectively immoral.",
  r=>r.argument.accessibleInsight="The reader is lazy.",
  r=>r.argument.originalArgument="The source proves the user's inner character.",
  r=>r.argument.uncertaintyLimit="All actual futures are known.",
  r=>r.scenario.consequences.unknowns=["We know everything"],
  r=>r.scenario.consequences.warrant="This determines how real people will behave.",
  r=>r.scenario.variables.availableHours=27,
  r=>r.dilemma="You have twenty-seven hours to distribute.",
  r=>r.emotionalEligibility.allowedStrategies=["playful"],
  r=>r.engineAdapter.operation="fabricated"
 ]){
  const r=structuredClone(DILLARD_V21);
  mutate(r);stamp(r);
  assert.equal(validateContentRecordV21(r).status,"invalid",mutate.toString());
 }
 for(const mutate of [
  r=>r.noFitReason="The passage proves the entire game is meaningless.",
  r=>r.gameCompatibility[0].evidenceOrRejection="An invented future is guaranteed.",
  r=>r.source.author="Not the original philosopher",
  r=>r.source.locator="Undocumented invented source"
 ]){
  const r=structuredClone(HEGEL_NO_FIT_V21);
  mutate(r);stamp(r);
  assert.equal(validateContentRecordV21(r).status,"invalid",mutate.toString());
 }
});
test("emotion: a single unsupported strategy fails closed, and an admitted strategy returns READY",()=>{
 const valid=research(semanticCases.money);
 const input={gameId:"trade_off",amounts:[1,0,1],repetitions:5};
 assert.equal(renderSourceGroundedResearchV211(valid,input,env).status,"ready");
 const wrong=structuredClone(valid);
 wrong.emotionalEligibility.allowedStrategies=["playful"];stamp(wrong);
 assert.equal(validateContentRecordV21(wrong).status,"invalid");
 assert.notEqual(renderSourceGroundedResearchV211(wrong,input,env).status,"ready");
});
test("signed modeled effects: positive, zero and negative Smith results remain conditional and grammatically correct",()=>{
 const r=research(semanticCases.workshop);
 for(const [amounts,delta,match] of [
  [[2,2],1,/more booklets|modeled gain/i],
  [[3,1],0,/no improvement|no modeled improvement|equal output/i],
  [[4,0],-1,/fewer booklets|does not improve/i]
 ]){
  const selection={gameId:"trade_off",amounts};
  const output=renderSourceGroundedResearchV211(r,selection,env);
  assert.equal(output.status,"ready",JSON.stringify({amounts,output}));
  assert.equal(output.evidence.find(e=>e.id==="meaning:central")?.evidence?.delta,delta);
  assert.match(output.sections[1].text,match,JSON.stringify({amounts,output}));
  assert.doesNotMatch(output.sections[0].text,/1 finished booklets/);
  assert.ok(output.wordCount>=80&&output.wordCount<=120);
  assert.ok(output.sectionWordCounts.every((n,i)=>n>=[10,18,9][i]&&n<=[48,65,26][i]));
  assert.equal(validateSourceGroundedResearchV211(r,selection,env,output).status,"ready");
  console.log("CZ130-V212-EFFECT "+JSON.stringify({amounts,delta,wordCount:output.wordCount,sections:output.sectionWordCounts,teaching:output.sections[1].text}));
 }
});
test("meaning-specific bridges describe choice-induced hour difference without moral ranking or personality inference",()=>{
 const r=research(semanticCases.money);
 const a=renderSourceGroundedResearchV211(r,{gameId:"trade_off",amounts:[1,0,1],repetitions:5},env);
 const b=renderSourceGroundedResearchV211(r,{gameId:"trade_off",amounts:[2,0,0],repetitions:5},env);
 for(const x of [a,b]){
  assert.equal(x.status,"ready",JSON.stringify(x));
  assert.match(x.sections[1].text,/life|working/i);
  assert.match(x.sections[1].text,/possessions/i);
  assert.match(x.sections[1].text,/worth|value/i);
  assert.doesNotMatch(x.sections.map(s=>s.text).join(" "),/you are lazy|you will work|immoral/i);
 }
 assert.notEqual(a.sections[1].text,b.sections[1].text);
 assert.match(a.sections[1].text,/4 extra working hours/);
 assert.match(b.sections[1].text,/2 extra working hours/);
});
test("developer never modifies the frozen v2.0 composer to satisfy this corrective research scope",()=>{
 const source=readFileSync(new URL("../philosophy-engine/content/source-grounded-composer-v211.js",import.meta.url),"utf8");
 assert.doesNotMatch(source,/\bif\s*\(\s*author\s*===\s*["']/);
});
