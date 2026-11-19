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
  assert.equal(scenario.version,"public-laughter/3");
  assert.match(scenario.externalEvent.text,/tomorrow/i);
  assert.match(scenario.externalEvent.observed[2],/separate group-thread notice/);
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
  const posted=derivePath(scenario,["explain","unqualified"]);
  assert.equal(posted.secondAction.medium,"public_statement");
  assert.equal(posted.facts.publicAcknowledgmentCompleted,true);
  assert.equal(posted.facts.publicCommitmentCommunicated,false);
  assert.equal(posted.history.events.at(-1).origin,"participant");
  assert.equal(posted.history.events.at(-1).selfEffect,"group_acknowledgment_posted");
  assert.doesNotMatch(posted.secondAction.commitment,/will post|will acknowledge/i);
  assert.match(posted.secondAction.commitment,/has been posted/i);
  assert.ok(!publicPromise.history.events.some(x=>x.medium==="public_statement"));
  assert.ok(!writtenPlan.history.events.some(x=>x.medium==="public_statement"));
});

test("R4-A: interpretation equivalence and divergence survive action-recap masking",()=>{
  const by=(first,second)=>all().find(x=>x.first.id===first&&x.second.id===second);
  const publicA=masked(by("request","name_harm"));
  const completedPost=masked(by("explain","unqualified"));
  const privateA=masked(by("acknowledge","correct"));
  const privateB=masked(by("explain","prepare_question"));
  const invited=masked(by("acknowledge","invite"));
  const deferred=masked(by("request","leave_request"));
  assert.notDeepEqual(publicA,completedPost,
    "Public post performed now must not collapse into a private future promise");
  assert.deepEqual(privateA,privateB);
  assert.equal(new Set([publicA,completedPost,privateA,invited,deferred].map(x=>x.claim)).size,5);
  assert.match(publicA.claim,/promise is sent privately.*has not occurred/i);
  assert.match(completedPost.claim,/group post is complete.*repair remain undecided/i);
  assert.match(privateA.claim,/prepared a step privately.*not been performed/i);
  assert.match(invited.claim,/sent an invitation.*remain undecided/i);
  assert.match(deferred.claim,/withheld another message.*listening has not happened/i);
  for(const x of [publicA,completedPost,privateA,invited,deferred])
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
  prior.version="public-laughter/2";
  assert.throws(()=>replayEncounter(scenario,prior),/stale or incompatible/);
  assert.equal(chooseAction(scenario,startEncounter(scenario).history,
    {choiceId:"acknowledge",expectedRevision:0}).history.events[1].origin,"independent_fiction");
  assert.equal(resolvePilot({...request,quoteAuthor:"Another philosopher"}).status,"blocked");
});

test("R4 R1: counterexample must be selected by warranted facts, not pasted globally",()=>{
  const paths=all();
  const counterexamples=new Map();
  for(const {second,output} of paths){
    assert.equal(output.status,"ready",second.id);
    const j=output.fullMeaning.meaning.choiceAnalysis.judgment;
    const full=output.fullExpression.sections[1].text;
    const compact=output.compact.sections[1].text;
    assert.ok(full.includes(j.counterexample));
    assert.ok(full.includes(j.qualification));
    assert.ok(compact.includes(j.compactLimit));
    assert.equal(full.includes("Posting now may spotlight the friend again"),
      second.id==="unqualified");
    assert.equal(full.includes("A promise can protect privacy today"),
      second.id==="name_harm");
    assert.equal(/An optional invitation can respect space/.test(full),
      second.id==="invite");
    assert.equal(/Preparation may avoid an unsolicited public post/.test(full),
      ["correct","prepare_question"].includes(second.id));
    assert.equal(/Not pressing for dialogue may respect privacy/.test(full),
      second.id==="leave_request");
    counterexamples.set(second.id,j.counterexample);
    assert.match(full,/Epictetus|judgment|agency|power|acts/i);
    assert.doesNotMatch(full,/must apologize|right answer|successfully repaired/i);
  }
  assert.equal(counterexamples.get("correct"),counterexamples.get("prepare_question"));
  assert.equal(new Set(counterexamples.values()).size,5);
});
test("R4 R1: the completed group post is agency, not a fabricated social outcome",()=>{
  const done=derivePath(scenario,["explain","unqualified"]);
  assert.equal(done.history.events.length,3);
  assert.equal(done.history.events[2].medium,"public_statement");
  assert.equal(done.history.events[2].factsEstablished.includes("publicAcknowledgmentCompleted"),true);
  assert.equal(done.facts.meetingOccurred,undefined);
  for(const hypothetical of ["The friend replied positively.", "No reply ever arrives."]){
    const forged=structuredClone(done.history);
    forged.events[1].unknowns.push(hypothetical);
    assert.throws(()=>replayEncounter(scenario,forged),/events do not replay/);
  }
  const stale=structuredClone(done.history);
  stale.version="public-laughter/2";
  assert.throws(()=>replayEncounter(scenario,stale),/stale or incompatible/);
});
