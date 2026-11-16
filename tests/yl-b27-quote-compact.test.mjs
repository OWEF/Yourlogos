import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {B27_APP_QUOTES,B27_INHERITED_COUNT}
 from "../experiments/yl-b27-quote-ledger.mjs";
import {resolveQuoteB27,runQuoteEncounterB27}
 from "../experiments/yl-b27-route.mjs";
import {SMITH_HUMAN_CONTRACT,runSmithHumanEncounter}
 from "../experiments/yl-b27-human-content.mjs";
const q=id=>({quoteId:id,quoteText:B27_APP_QUOTES[id][0],
 quoteAuthor:B27_APP_QUOTES[id][1],quoteWork:B27_APP_QUOTES[id][3],
 b27DevelopmentOnly:id>=B27_INHERITED_COUNT});
const ready=id=>{
 const r=resolveQuoteB27(q(id));
 assert.equal(r.status,"ready",JSON.stringify(r).slice(0,600));
 assert.equal(r.quoteId,id);
 assert.ok(r.sourceVersionHash);
 assert.ok(r.record.sourceFingerprint===r.sourceVersionHash);
 assert.equal(r.record.quote,r.quote.text);
 return r;
};
const inspect=(id,input,family)=>{
 const selected=ready(id);
 const result=runQuoteEncounterB27({...q(id),
  sourceVersionHash:selected.sourceVersionHash,canonicalInput:input});
 assert.equal(result.status,"ready",JSON.stringify(result).slice(0,700));
 assert.equal(result.selectedFamilyId,family);
 assert.equal(result.fullExpression.sections.length,3);
 assert.ok(result.fullExpression.wordCount>=80&&result.fullExpression.wordCount<=120);
 assert.equal(result.compact.sections.length,3);
 assert.ok(result.compact.visibleWordCount>=40&&result.compact.visibleWordCount<=65);
 assert.equal(result.compact.fullWordCount,result.fullExpression.wordCount);
 assert.equal(result.compact.unchangedFullExpression,true);
 assert.equal(result.accountSaved,false);
 assert.equal(result.publicationAllowed,false);
 assert.equal(result.sourceVersionHash,selected.sourceVersionHash);
 return result;
};
test("91 immutable original app quote records, exactly three development source excerpts appended",()=>{
 assert.equal(B27_APP_QUOTES.length,95);
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const passage=app.slice(app.indexOf("const QUOTES=["),app.indexOf("];\n// Daily first"));
 const parsed=passage.split("\n").filter(x=>x.trim().startsWith("["))
  .map(x=>JSON.parse(x.trim().replace(/,$/,"")));
 assert.equal(parsed.length,91);
 assert.deepEqual(parsed,B27_APP_QUOTES.slice(0,91));
 assert.equal(new Set(B27_APP_QUOTES.map(q=>q[0])).size,95);
});
test("exact quote identity, author and source edition never guessed via author name",()=>{
 for(const id of [12,34,91,92,93,94])ready(id);
 for(const id of [12,34,91,92,93]){
  const base=q(id);
  for(const tamper of [
   {...base,quoteText:base.quoteText+" a"},
   {...base,quoteAuthor:"Fake author"},
   {...base,quoteWork:"another edition"},
   {...base,quoteId:12}
  ])if(JSON.stringify(tamper)!==JSON.stringify(base))
    assert.notEqual(resolveQuoteB27(tamper).status,"ready");
 }
 assert.equal(resolveQuoteB27({...q(91),b27DevelopmentOnly:false}).status,"blocked");
 const h=resolveQuoteB27(q(31));
 assert.equal(h.status,"no_fit");
 assert.equal(h.capabilityGap,"mediation_across_the_whole");
 assert.equal(h.readingFirst,true);
 const arbitrary=resolveQuoteB27(q(19));
 assert.equal(arbitrary.status,"no_fit");
 assert.ok(arbitrary.quote.question);
});
test("source-authored new Smith human analogy: true relations not friendship moral claim",()=>{
 const c=SMITH_HUMAN_CONTRACT;
 assert.equal(c.cards.length,4);
 assert.equal(c.edges.length,5);
 assert.equal(c.consideredAdaptations[0].verdict,"REJECTED");
 assert.match(c.consideredAdaptations[0].reason,/moral trust/);
 assert.equal(c.sourceOriginFingerprint.length>20,true);
 const one=inspect(91,{pairs:[{aId:"sketch",bId:"friend",
  relationId:"complementarity"}]},"tap_pair");
 assert.match(JSON.stringify(one.fullMeaning),/division|coordination|Smith|contribution/i);
 assert.match(JSON.stringify(one.compact),/gift|Smith/i);
 const two=inspect(91,{pairs:[{aId:"friend",bId:"gift",relationId:"dependence"},
  {aId:"assemble",bId:"gift",relationId:"dependence"}]},"tap_pair");
 assert.equal(two.canonical_choice.pairs.length,2);
 for(const bad of [
  {pairs:[{aId:"sketch",bId:"gift",relationId:"friendship_is_moral"}]},
  {pairs:[{aId:"deadline",bId:"gift",relationId:"dependence"}]},
  {pairs:[]}
 ])assert.notEqual(runSmithHumanEncounter(c,bad).status,"ready");
});
test("original Dillard, Kierkegaard and source-new Epictetus/Thoreau all reach compact from full replay",()=>{
 inspect(12,{amounts:[2,2,2],budgets:[6],repetitions:5,touched:true},"balance_move");
 inspect(34,{path:["change","risk","continue"]},"decision_cards");
 inspect(92,{pairs:[{aId:"apology",bId:"forgiveness",
  relationId:"agency_boundary"}]},"tap_pair");
 inspect(93,{amounts:[6,6],budgets:[12],focus:"openness",touched:true},"balance_move");
 const flip=inspect(94,{actions:[
  {type:"choose_start",optionId:"stay"},
  {type:"explore_authored",sceneId:"surprise"},
  {type:"choose_response",optionId:"continue"},
  {type:"read_retrospective"}
 ]},"flip_reveal");
 assert.equal(flip.provenance.alternateEnglishExcerptBindsSameJournal,"JJ:167");
 assert.equal(flip.provenance.authoredEventCausedByReader,false);
 assert.equal(flip.provenance.unchosenFutureKnown,false);
});
test("stale source and unsupported word/selection attempts fail without saving or fabrication",()=>{
 const src=ready(91),base=q(91);
 assert.equal(runQuoteEncounterB27({...base,sourceVersionHash:"tampered",
  canonicalInput:{pairs:[{aId:"sketch",bId:"friend",relationId:"complementarity"}]}}).code,
  "stale_source");
 assert.notEqual(runQuoteEncounterB27({...base,sourceVersionHash:src.sourceVersionHash,
  canonicalInput:{pairs:[{aId:"sketch",bId:"friend",relationId:"morality"}]}}).status,"ready");
 assert.equal(runQuoteEncounterB27({...q(31),sourceVersionHash:"irrelevant",
  canonicalInput:{amounts:[1],budgets:[1]}}).status,"no_fit");
});
