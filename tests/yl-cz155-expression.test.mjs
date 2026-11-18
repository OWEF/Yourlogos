import test from "node:test";
import assert from "node:assert/strict";
import {mkdirSync, writeFileSync} from "node:fs";
import {EPICTETUS_SCENARIO as scenario} from "../experiments/yl-cz155-epictetus.mjs";
import {resolvePilot, runPilot} from "../experiments/yl-cz155-pilot.mjs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {resolveQuoteB27} from "../experiments/yl-b27-route.mjs";

const quote = B27_APP_QUOTES[47];
const entry = {quoteId:47, quoteText:quote[0], quoteAuthor:quote[1],
  quoteWork:quote[3], b27DevelopmentOnly:false, cz155Preview:true};
const start = resolvePilot(entry);
const run = (path, extra={}) => runPilot({...entry,sourceVersionHash:start.sourceVersionHash,
  canonicalInput:{path}, ...extra});

test("Six server-computed endings retain both the agency boundary and the open duty",()=>{
  const evidence=[];
  for(const first of scenario.openingChoices)for(const second of scenario.followUps[first.id]){
    const path=[first.id,scenario.externalEvent.id,second.id];
    const result=run(path);
    assert.equal(result.status,"ready",JSON.stringify(result));
    assert.deepEqual(result,run(path));
    const {emotion,fullMeaning,compact,fullExpression}=result;
    assert.deepEqual(fullMeaning.canonical_choice,{path});
    const facts=fullMeaning.meaning.choiceAnalysis;
    assert.equal(facts.establishedFacts.acknowledged,second.id!=="leave_request");
    assert.equal(facts.history.events[1].origin,"independent_fiction");
    assert.deepEqual(facts.history.events[1].observed,scenario.externalEvent.observed);
    assert.ok(compact.sections[1].text.includes(fullMeaning.meaning.selectedClaim));
    for(const [expression,min,max] of [[compact,40,65],[fullExpression,80,120]]){
      assert.equal(expression.sections.length,3);
      const words=expression.sections.flatMap(section=>section.text.trim().split(/\s+/)).length;
      assert.ok(words>=min&&words<=max);
      assert.match(expression.sections[1].text,/repair.*owe/i);
    }
    assert.equal(emotion.inferredActualEmotion,false);
    assert.equal(result.publicationAllowed,false);
    assert.equal(result.compact.philosopher.sourceUrl,scenario.source.referenceUrl);
    assert.equal(result.provenance.directorTranscript.firstMessage,first.literal);
    assert.equal(result.provenance.directorTranscript.secondAction,second.literal);
    evidence.push({path,firstMessage:first.literal,observed:scenario.externalEvent.text,
      reconsideration:scenario.reconsiderationQuestion,secondAction:second.literal,
      canonical:result.canonical_choice,reasoning:fullMeaning,emotion,compact,full:fullExpression});
  }
  assert.equal(evidence.length,6);
  const root=process.env.YL_CZ155_EVIDENCE;
  if(root){mkdirSync(root,{recursive:true});writeFileSync(root+"/epictetus-six-paths.json",
    JSON.stringify({sourceHash:start.sourceVersionHash,scenarioHash:scenario.scenarioFingerprint,paths:evidence},null,2)+"\n");}
});

test("Author preview is edition bound and rejects stale, forged and cross-opening choices",()=>{
  assert.equal(resolveQuoteB27(entry).status,"no_fit");
  assert.equal(resolvePilot({...entry,cz155Preview:false}),null);
  assert.equal(resolvePilot({...entry,quoteId:92}),null);
  assert.equal(resolvePilot({...entry,quoteWork:B27_APP_QUOTES[92][3]}).status,"blocked");
  assert.equal(run(["request","delivered_no_reply","name_harm"],{sourceVersionHash:"outdated"}).code,"stale_source");
  assert.equal(run(["request","forgiven","name_harm"]).code,"unexpected_event");
  assert.equal(run(["request","delivered_no_reply","invite"]).code,"unsupported_path");
  assert.equal(run(null,{canonicalInput:{path:["request","delivered_no_reply","name_harm"],motive:"prove sincerity"}}).status,"blocked");
});

test("Semantic comparison excludes click recap and retains only warranted distinctions",()=>{
  const result=(first,second)=>run([first,"delivered_no_reply",second]);
  const interpretation=r=>({
    claim:r.fullMeaning.meaning.selectedClaim, strategy:r.emotion.strategy,
    compact:r.compact.sections.slice(1).map(x=>x.text),
    full:r.fullExpression.sections.slice(1).map(x=>x.text),
    question:r.compact.sections[2].text,
    basis:r.fullMeaning.meaning.choiceAnalysis.refinementBasis
  });
  const invited=interpretation(result("acknowledge","invite"));
  const laterAcknowledged=interpretation(result("request","name_harm"));
  const writtenPlan=interpretation(result("acknowledge","correct"));
  const preparedQuestion=interpretation(result("explain","prepare_question"));
  const secondApology=interpretation(result("explain","unqualified"));
  const outstanding=interpretation(result("request","leave_request"));
  // Same *established* agency facts, different chronology or literal message:
  // differing recap is not a license to manufacture a new philosophical claim.
  assert.deepEqual(invited,laterAcknowledged);
  assert.deepEqual(writtenPlan,preparedQuestion);
  assert.equal(invited.strategy,"boundary_awareness");
  assert.equal(writtenPlan.strategy,"choice_awareness");
  assert.equal(outstanding.strategy,"choice_awareness");
  assert.match(writtenPlan.claim,/private plan.*untested until you act/i);
  assert.match(secondApology.claim,/second apology.*cannot determine/i);
  assert.match(invited.claim,/invitation.*reply/i);
  assert.match(outstanding.claim,/cannot acknowledge the harm/i);
  assert.equal(new Set([invited,writtenPlan,secondApology,outstanding]
    .map(x=>JSON.stringify([x.claim,x.strategy,x.question]))).size,4);
  for(const x of [invited,writtenPlan,secondApology,outstanding]){
    for(const section of x.compact)assert.ok(!/read receipt|forgiven you|caused the silence/i.test(section));
  }
});
