import test from "node:test";
import assert from "node:assert/strict";
import {EPICTETUS_SCENARIO as scenario} from "../experiments/yl-cz155-epictetus.mjs";
import {chooseAction,derivePath,replayEncounter,startEncounter} from "../experiments/yl-cz155-director.mjs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {resolvePilot,runPilot} from "../experiments/yl-cz155-pilot.mjs";

const quote=B27_APP_QUOTES[47];
const request={quoteId:47,quoteText:quote[0],quoteAuthor:quote[1],
  quoteWork:quote[3],b27DevelopmentOnly:false,cz155Preview:true};
const resolved=resolvePilot(request);
const run=(first,second)=>runPilot({...request,sourceVersionHash:resolved.sourceVersionHash,
  canonicalInput:{path:[first,scenario.externalEvent.id,second]}});
const all=()=>scenario.openingChoices.flatMap(first=>
  scenario.followUps[first.id].map(second=>({first,second,state:derivePath(scenario,[first.id,second.id]),
    output:run(first.id,second.id)})));
const masked=x=>({
  claim:x.output.fullMeaning.meaning.selectedClaim,
  strategy:x.output.emotion.strategy,
  section2:x.output.fullExpression.sections[1].text,
  compact2:x.output.compact.sections[1].text,
  question:x.output.compact.sections[2].text,
  basis:x.output.fullMeaning.meaning.choiceAnalysis.refinementBasis
});

test("R4-A: independent future meeting is received after the sent message, never caused by it",()=>{
  const journeys=all();
  assert.equal(journeys.length,6);
  assert.equal(scenario.version,"public-laughter/2");
  assert.match(scenario.externalEvent.text,/tomorrow/i);
  assert.match(scenario.externalEvent.observed[2],/independently announces/);
  for(const {first,state,output} of journeys){
    assert.equal(state.history.events.length,3);
    const [choice,event,followUp]=state.history.events;
    assert.equal(choice.id,first.id);
    assert.equal(event.origin,"independent_fiction");
    assert.equal(event.id,scenario.externalEvent.id);
    assert.equal(event.preconditions.phase,"after_opening");
    assert.equal(Object.hasOwn(event,"causedBy"),false);
    assert.deepEqual(event.observed,scenario.externalEvent.observed);
    assert.equal(followUp.origin,"participant");
    assert.match(state.reconsiderationQuestion,/tomorrow/i);
    assert.ok(!/what am i asking.*reply.*prove|you fear|you need forgiveness/i
      .test(state.reconsiderationQuestion));
    assert.equal(output.status,"ready",JSON.stringify(output));
  }
});

test("R4-A: six different histories contain only participant-owned actions, not futures",()=>{
  const states=all().map(x=>x.state);
  assert.equal(new Set(states.map(x=>JSON.stringify(x.effects))).size,6);
  const ids=states.map(x=>x.secondAction.id);
  assert.equal(new Set(ids).size,6);
  for(const state of states){
    assert.equal(state.facts.friendForgave,undefined);
    assert.equal(state.facts.meetingOccurred,undefined);
    assert.ok(state.history.events.every(x=>!Object.hasOwn(x,"unchosenOutcomes")));
    assert.ok(!state.history.events.some(x=>x.origin==="friend"));
    assert.deepEqual(replayEncounter(scenario,structuredClone(state.history)),state);
  }
  const publicPromise=derivePath(scenario,["request","name_harm"]);
  const writtenPlan=derivePath(scenario,["acknowledge","correct"]);
  const preparedQuestion=derivePath(scenario,["explain","prepare_question"]);
  assert.equal(publicPromise.facts.publicCommitmentCommunicated,true);
  assert.equal(writtenPlan.facts.plannedPublicCorrection,true);
  assert.equal(preparedQuestion.facts.preparedListeningQuestion,true);
  assert.equal(publicPromise.facts.plannedPublicCorrection,false);
  assert.ok(!publicPromise.history.events.some(x=>x.medium==="public_statement"));
  assert.ok(!writtenPlan.history.events.some(x=>x.medium==="public_statement"));
});

test("R4-A: interpretation equivalence and divergence survive action-recap masking",()=>{
  const by=(first,second)=>all().find(x=>x.first.id===first&&x.second.id===second);
  const publicA=masked(by("request","name_harm"));
  const publicB=masked(by("explain","unqualified"));
  const privateA=masked(by("acknowledge","correct"));
  const privateB=masked(by("explain","prepare_question"));
  const invited=masked(by("acknowledge","invite"));
  const deferred=masked(by("request","leave_request"));
  assert.deepEqual(publicA,publicB);
  assert.deepEqual(privateA,privateB);
  assert.equal(new Set([publicA,privateA,invited,deferred].map(x=>x.claim)).size,4);
  assert.match(publicA.claim,/promise is a present act.*performance/i);
  assert.match(privateA.claim,/Preparing a step is an act.*happened or succeeded/i);
  assert.match(invited.claim,/another person.s answer.*public conduct remain open/i);
  assert.match(deferred.claim,/Waiting now does not settle/i);
  for(const x of [publicA,privateA,invited,deferred])
    assert.doesNotMatch(x.claim,/must apologize twice|forgive you|you want approval|should feel guilty/i);
});

test("R4-A: source and full/compact expression gates, no invented motives or moral verdict",()=>{
  assert.equal(resolved.status,"ready");
  for(const {first,second,output} of all()){
    const reasoning=output.fullMeaning.meaning.choiceAnalysis;
    assert.equal(output.status,"ready",first.id+"/"+second.id);
    for(const [expression,min,max] of [[output.compact,40,65],[output.fullExpression,80,120]]){
      assert.equal(expression.sections.length,3);
      const n=expression.sections.map(x=>x.text.trim().split(/\s+/).length);
      assert.ok(n.reduce((a,b)=>a+b,0)>=min&&n.reduce((a,b)=>a+b,0)<=max,
        first.id+"/"+second.id+" "+JSON.stringify(n));
    }
    assert.ok(reasoning.sourceWarrantIds.every(w=>Object.hasOwn(scenario.source.warrants,w)));
    assert.deepEqual(reasoning.history.events[1].observed,scenario.externalEvent.observed);
    const allText=output.fullExpression.sections.map(x=>x.text).join(" ");
    assert.match(allText,/Epictetus/);
    assert.doesNotMatch(allText,/you needed validation|you feared rejection|they will forgive|the meeting succeeded/i);
    assert.match(output.fullMeaning.meaning.limitation??output.fullMeaning.meaning.limitations,/reply|judgment/i);
  }
});

test("R4-A: positive and absent replies are analytical counterfactuals only; old drafts fail safely",()=>{
  const mid=derivePath(scenario,["acknowledge"]);
  assert.equal(mid.revision,2);
  for(const hypothetical of ["Your friend replies positively.",
    "No reply ever arrives."]){
    const forged=structuredClone(mid.history);
    forged.events[1].observed.push(hypothetical);
    assert.throws(()=>replayEncounter(scenario,forged),/events do not replay/);
  }
  const prior=structuredClone(mid.history);
  prior.version="public-laughter/1";
  assert.throws(()=>replayEncounter(scenario,prior),/stale or incompatible/);
  assert.equal(chooseAction(scenario,startEncounter(scenario).history,
    {choiceId:"acknowledge",expectedRevision:0}).history.events[1].origin,"independent_fiction");
  assert.equal(resolvePilot({...request,quoteAuthor:"Another philosopher"}).status,"blocked");
});
