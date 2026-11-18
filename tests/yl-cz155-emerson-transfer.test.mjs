import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {fingerprintB25} from "../experiments/yl-b25-authored-scenarios.mjs";
import {makeUniversalRegistry} from "../experiments/yl-cz147-engines.mjs";
import {startEncounter,chooseAction,replayEncounter,EVENT_SCHEMA}
 from "../experiments/yl-cz155-director.mjs";
import {resolvePilot,runPilot} from "../experiments/yl-cz155-pilot.mjs";
import {EMERSON_SCENARIO as scenario,EMERSON_RECORD as record}
 from "../experiments/yl-cz155-emerson.mjs";

const quote=B27_APP_QUOTES[55];
const entry={quoteId:55,quoteText:quote[0],quoteAuthor:quote[1],
 quoteWork:quote[3],b27DevelopmentOnly:false,cz155Preview:true};
const source=resolvePilot(entry);
const paths=[
 ["publish_initial_support",scenario.externalEvent.id,"maintain_merits"],
 ["publish_initial_support",scenario.externalEvent.id,"maintain_image"]
];
const execute=(path,registry=null)=>{
 const start=registry?registry.resolve(entry):source;
 return registry?registry.run({...entry,sourceVersionHash:start.sourceVersionHash,
  canonicalInput:{path}}):
 runPilot({...entry,sourceVersionHash:start.sourceVersionHash,canonicalInput:{path}});
};
const countWords=expression=>expression.sections.flatMap(section=>
 section.text.trim().split(/\s+/)).length;
const meaning=result=>({
 claim:result.fullMeaning.meaning.selectedClaim,
 strategy:result.emotion.strategy,
 compact:result.compact.sections.slice(1).map(x=>x.text),
 full:result.fullExpression.sections.slice(1).map(x=>x.text),
 question:result.compact.sections[2].text
});

test("Emerson is admitted only as an exact-source, explicitly isolated Director author preview",()=>{
 assert.equal(source.status,"ready",JSON.stringify(source));
 assert.equal(source.record.philosophicalOperation.kind,"independent_judgment");
 assert.equal(source.record.director.operation,"independent_judgment");
 assert.equal(source.record.director.version,"last-bus-present-judgment/1");
 assert.equal(source.publicationAllowed,false);
 assert.equal(resolvePilot({...entry,cz155Preview:false}),null);
 assert.equal(resolvePilot({...entry,quoteId:56}),null);
 assert.equal(resolvePilot({...entry,quoteText:"a different Emerson quote"}).status,"blocked");
});

test("Identical outward action: different explicitly stated motives yield Emerson-specific interpretations",()=>{
 const outputs=paths.map(path=>execute(path));
 for(let i=0;i<outputs.length;i++){
  const out=outputs[i],analysis=out.fullMeaning?.meaning?.choiceAnalysis;
  assert.equal(out.status,"ready",JSON.stringify(out));
  assert.deepEqual(out.canonical_choice,{path:paths[i]});
  assert.equal(analysis.operation,"directed_decision");
  assert.equal(analysis.development.id,scenario.externalEvent.id);
  assert.equal(analysis.development.text,scenario.externalEvent.text);
  assert.equal(analysis.history.schema,EVENT_SCHEMA);
  assert.equal(analysis.history.events[1].origin,"independent_fiction");
  assert.deepEqual(analysis.history.events[1].observed,scenario.externalEvent.observed);
  assert.equal(analysis.initial.literal,scenario.openingChoices[0].literal);
  assert.equal(analysis.response.literal,scenario.followUps.publish_initial_support[i].literal);
  assert.equal(analysis.establishedFacts.maintainedProposal,true);
  assert.equal(out.publicationAllowed,false);
  assert.equal(out.emotion.inferredActualEmotion,false);
  assert.equal(out.compact.philosopher.sourceUrl,scenario.source.referenceUrl);
  for(const [expr,min,max] of [[out.compact,40,65],[out.fullExpression,80,120]]){
   assert.equal(expr.sections.length,3);
   assert.ok(countWords(expr)>=min&&countWords(expr)<=max,
    JSON.stringify({i,min,max,count:countWords(expr),sections:expr.sections}));
   assert.match(expr.sections[1].text,/judgment|departure|position|consisten/i);
   assert.match(expr.sections[1].text,/shuttle|declaration|previous|earlier|yesterday/i);
  }
 }
 const [merits,image]=outputs;
 const m=merits.fullMeaning.meaning.choiceAnalysis;
 const r=image.fullMeaning.meaning.choiceAnalysis;
 assert.equal(m.response.literal,r.response.literal);
 assert.equal(merits.provenance.directorTranscript.secondAction,
  image.provenance.directorTranscript.secondAction);
 assert.notEqual(m.response.explicitMotive,r.response.explicitMotive);
 assert.equal(m.establishedFacts.weighedBothEvidence,true);
 assert.equal(m.establishedFacts.avoidedInconsistency,false);
 assert.equal(r.establishedFacts.weighedBothEvidence,false);
 assert.equal(r.establishedFacts.avoidedInconsistency,true);
 assert.notDeepEqual(meaning(merits),meaning(image));
 assert.notEqual(merits.fullMeaning.meaning.selectedClaim,image.fullMeaning.meaning.selectedClaim);
 assert.notEqual(merits.emotion.strategy,image.emotion.strategy);
 assert.notEqual(merits.compact.sections[2].text,image.compact.sections[2].text);
 assert.match(merits.fullMeaning.meaning.selectedClaim,/independent present judgment/i);
 assert.match(image.fullMeaning.meaning.selectedClaim,/public declaration an authority/i);
 // A shallow string change to the public act cannot insert a new motive.
 assert.equal(execute(paths[0],null).fullMeaning.meaning.selectedClaim,
  merits.fullMeaning.meaning.selectedClaim);
 const root=process.env.YL_CZ155_EVIDENCE;
 if(root){
  mkdirSync(root,{recursive:true});
  const cases=outputs.map((out,i)=>({
   path:paths[i],source:scenario.source,sourceWarrants:out.fullMeaning.meaning.choiceAnalysis.sourceWarrantIds,
   first:scenario.openingChoices[0],external:scenario.externalEvent,
   finalAction:out.fullMeaning.meaning.choiceAnalysis.response,
   establishedFacts:out.fullMeaning.meaning.choiceAnalysis.establishedFacts,
   canonical:out.canonical_choice,reasoning:out.fullMeaning,
   emotion:out.emotion,compact:out.compact,fullExpression:out.fullExpression
  }));
  writeFileSync(root+"/emerson-two-paths.json",
   JSON.stringify({sourceVersionHash:source.sourceVersionHash,scenarioFingerprint:scenario.scenarioFingerprint,
    paths:cases},null,2)+"\n");
  const lines=[
   "# Emerson transfer · literal two-path packets through the CZ-155 Director","",
   "Same public first statement, same independent neighbor evidence, same outward final statement. Only the selected explicit grounds differ.",""
  ];
  for(const item of cases)lines.push(
   "## "+item.path.join(" → "),"",
   "**Source:** "+item.source.work+" — "+item.source.text,"",
   "**Initial statement:** "+item.first.literal,"",
   "**Independent development:** "+item.external.text,"",
   "**Final public statement:** "+item.finalAction.literal,"",
   "**Selected explicit reason:** "+item.finalAction.explicitMotive,"",
   "**Established facts:** "+JSON.stringify(item.establishedFacts),"",
   "**Canonical input:** "+JSON.stringify(item.canonical),"",
   "**Reasoning:** "+item.reasoning.meaning.selectedClaim,"",
   "**Warrant IDs:** "+item.sourceWarrants.join(", "),"",
   "**Emotion Strategy:** "+item.emotion.strategy,"",
   "**Compact ("+countWords(item.compact)+" words):**",
   ...item.compact.sections.map(s=>"- "+s.label+": "+s.text),"",
   "**Full ("+countWords(item.fullExpression)+" words):**",
   ...item.fullExpression.sections.map(s=>"- "+s.label+": "+s.text),""
  );
  writeFileSync(root+"/emerson-two-paths-literal.md",lines.join("\n")+"\n");
 }
});

test("Incidental wording and option order cannot alter source-warranted meaning",()=>{
 const variant=structuredClone(record);
 variant.director.followUps.publish_initial_support.reverse();
 variant.director.openingChoices[0].recap=
  "You publicly backed the proposed earlier departure.";
 variant.director.openingChoices[0].possibleRationale=
  "Aggregate numbers seemed to support moving the last bus earlier.";
 delete variant.director.scenarioFingerprint;
 variant.director.scenarioFingerprint=fingerprintB25(variant.director);
 const registry=makeUniversalRegistry([variant],B27_APP_QUOTES);
 assert.notEqual(registry.resolve(entry).sourceVersionHash,source.sourceVersionHash);
 for(const path of paths){
  const normal=execute(path),incidental=execute(path,registry);
  assert.equal(incidental.status,"ready",JSON.stringify(incidental));
  assert.deepEqual(incidental.canonical_choice,normal.canonical_choice);
  assert.equal(incidental.fullMeaning.meaning.selectedClaim,
   normal.fullMeaning.meaning.selectedClaim);
  assert.equal(incidental.emotion.strategy,normal.emotion.strategy);
  assert.deepEqual(incidental.compact.sections.slice(1),normal.compact.sections.slice(1));
  assert.deepEqual(incidental.fullExpression.sections.slice(1),
   normal.fullExpression.sections.slice(1));
 }
});

test("The same Director rejects source substitution, other reasons and duplicate/stale commands",()=>{
 assert.equal(execute(["publish_initial_support","invented_neighbor","maintain_merits"]).code,
  "unexpected_event");
 assert.equal(execute(["publish_initial_support",scenario.externalEvent.id,"forged_motive"]).code,
  "unsupported_path");
 let s=startEncounter(scenario);
 const opening={choiceId:"publish_initial_support",expectedRevision:0};
 s=chooseAction(scenario,s.history,opening);
 const repeated=chooseAction(scenario,s.history,opening);
 assert.deepEqual(repeated.history,s.history);
 assert.throws(()=>chooseAction(scenario,s.history,
  {choiceId:"maintain_image",expectedRevision:0}),/stale command/);
 const saved=structuredClone(s.history);
 saved.events[1].observed.push("The pilot was a proven success.");
 assert.throws(()=>replayEncounter(scenario,saved),/events do not replay/);
 assert.equal(source.record.director.source.text,B27_APP_QUOTES[55][0]);
});
