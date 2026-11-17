/** CZ-149: real three-engine philosophical discrimination, no demo meaning(). */
import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {CZ147_SOURCE_RECORDS} from "../experiments/yl-cz147-sources.mjs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {makeUniversalRegistry} from "../experiments/yl-cz147-engines.mjs";
const registry=makeUniversalRegistry(CZ147_SOURCE_RECORDS,B27_APP_QUOTES);
function run(id,choice){
 const rec=CZ147_SOURCE_RECORDS.find(x=>x.quoteId===id);
 assert.ok(rec);
 const request={quoteId:id,quoteText:rec.source.text,quoteAuthor:rec.source.author,
  quoteWork:rec.source.work,b27DevelopmentOnly:rec.developmentOnly};
 const admitted=registry.resolve(request);
 assert.equal(admitted.status,"ready");
 const result=registry.run({...request,sourceVersionHash:admitted.sourceVersionHash,
  canonicalInput:choice});
 assert.equal(result.status,"ready",JSON.stringify({id,choice,result}).slice(0,800));
 assert.equal(result.fullMeaning.status,"ready");
 assert.equal(result.emotion.status,"ready");
 assert.equal(result.fullExpression.status,"ready");
 assert.equal(result.compact.status,"ready");
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.deepEqual(result.fullExpression.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.equal(result.fullMeaning.meaning.centralClaim,rec.sourceThesis);
 assert.ok(result.compact.sections[1].text.includes(rec.sourceThesis));
 assert.equal(result.emotion.inferredActualEmotion,false);
 assert.equal(result.emotion.inferredMoralRank,false);
 assert.equal(result.publicationAllowed,false);
 return result;
}
const alloc=amounts=>({amounts,budgets:[8],touched:true});
const flip=(a,b,c)=>({actions:[{type:"choose_start",optionId:a},
 {type:"explore_authored",sceneId:b},
 {type:"choose_response",optionId:c},
 {type:"read_retrospective"}]});
test("Seneca: all study, all scrolling, all rest, and shared time lead to distinct deliberate-life questions",()=>{
 const cases=[
  {tag:"study",amounts:[8,0,0],question:/study/i,distinction:/purpose|busy|meaningful|chosen/i},
  {tag:"scrolling",amounts:[0,8,0],question:/scrolling/i,distinction:/enjoyment|unnoticed|occupy|attention/i},
  {tag:"rest",amounts:[0,0,8],question:/rest/i,distinction:/recovery|pause|produce|justify/i},
  {tag:"shared",amounts:[3,2,3],question:/study|rest|time/i,distinction:/shared|sharing|divide|between|intentional|pattern/i}
 ];
 const evidence=[];
 for(const c of cases){
  const out=run(49,alloc(c.amounts));
  const q=out.compact.sections[2].text;
  assert.match(q,c.question,"Question must refer to the selected activity or actual division");
  assert.match(q,c.distinction,"Question must reflect the philosophical meaning, not just replace a noun");
  assert.doesNotMatch(q,/you are lazy|you are virtuous|you have no discipline/i);
  evidence.push({case:c.tag,canonical:out.canonical_choice,meaning:out.fullMeaning,
   emotion:out.emotion,full:out.fullExpression,compact:out.compact});
 }
 assert.equal(new Set(evidence.map(x=>x.compact.sections[2].text)).size,4);
 mkdirSync("qa-evidence-cz149",{recursive:true});
 writeFileSync("qa-evidence-cz149/four-seneca-deliberate-life-contrasts.json",
  JSON.stringify(evidence,null,2));
});
test("Epictetus: Reasoning packet distinguishes external authored event from chosen response",()=>{
 const source=run(48,flip("prepare","silence","respond"));
 assert.match(source.fullMeaning.meaning.selectedClaim,/externally? |external event/i);
 assert.doesNotMatch(source.fullMeaning.meaning.selectedClaim,/unchosen life/i);
 assert.equal(source.fullMeaning.meaning.choiceAnalysis.development.causedByInitialChoice,false);
 assert.match(source.compact.sections[1].text,/event|response|control/i);
 assert.doesNotMatch(source.compact.sections[1].text,/unchosen life/i);
 assert.match(source.fullMeaning.meaning.choiceAnalysis.response.label,/specific follow-up question/i);
 const alternative=run(48,flip("listen","delay","try"));
 assert.match(alternative.fullMeaning.meaning.choiceAnalysis.response.label,/invite another conversation later/i);
 assert.doesNotMatch(alternative.fullExpression.sections[0].text,/attend to your response/i);
});
test("Emerson: independent judgment concerns present reasons rather than generic uncertainty",()=>{
 const one=run(55,{path:["maintain","details","consider"]});
 const other=run(55,{path:["revisit","critique","consider"]});
 assert.match(one.fullMeaning.meaning.selectedClaim,/present reasons/i);
 assert.match(other.fullMeaning.meaning.selectedClaim,/present reasons/i);
 assert.notEqual(one.fullMeaning.meaning.selectedClaim,other.fullMeaning.meaning.selectedClaim);
 assert.match(other.compact.sections[1].text,/present judgment|independent judgment|past words/i);
 const retainQuestion=one.compact.sections[2].text;
 const reviseQuestion=other.compact.sections[2].text;
 assert.notEqual(retainQuestion,reviseQuestion,
  "Maintaining versus revising must produce distinct questions, not a change of fictional event only");
 assert.match(retainQuestion,/keep|keeping|support|considered/i);
 assert.match(reviseQuestion,/revis|revision/i);
});
test("Wollstonecraft: human educational dilemma, no fabricated stereotype or causal dominance",()=>{
 const r=CZ147_SOURCE_RECORDS.find(x=>x.quoteId===23);
 assert.match(r.intro,/woman|relative|education/i);
 assert.match(r.intro,/advice|help/i);
 assert.match(r.intro,/final say|choice/i);
 assert.doesNotMatch(r.intro,/community group|girls' rights debated|power over men/i);
 assert.match(r.sourceThesis,/governing themselves/i);
 const out=run(23,{pairs:[{aId:"education",bId:"judgment",relationId:"support"}]});
 assert.match(out.compact.sections[1].text,/independent judgment/i);
 assert.doesNotMatch(out.compact.sections[2].text,/girls' education causes domination/i);
 assert.doesNotMatch(r.epistemicLimits,/group debate/i,
  "The source uncertainty contract must match the new educational situation");
 assert.doesNotMatch(out.fullExpression.sections[1].text,/group debate/i);
 const contrast=run(23,{pairs:[{aId:"dominance",bId:"agency",relationId:"contrast"}]});
 assert.match(contrast.compact.sections[2].text,/decision|control|self-government/i);
 assert.match(contrast.fullMeaning.meaning.selectedClaim,/subjects for her.*advising/i);
 assert.match(contrast.fullExpression.sections[1].text,/subjects|advising|judgment/i);
 assert.doesNotMatch(contrast.compact.sections[2].text,/what does this leave open/i,
  "Contrast must invite a concrete question, not a generic unresolved-place placeholder");
});
