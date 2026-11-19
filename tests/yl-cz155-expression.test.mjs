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
      assert.match(expression.sections[1].text,/public|responsib|reconcil|reply|response|meeting/i);
    }
    assert.equal(emotion.inferredActualEmotion,false);
    assert.equal(result.publicationAllowed,false);
    assert.equal(result.compact.philosopher.sourceUrl,scenario.source.referenceUrl);
    assert.equal(result.provenance.directorTranscript.firstMessage,first.literal);
    assert.equal(result.provenance.directorTranscript.secondAction,second.literal);
    evidence.push({path,firstMessage:first.literal,observed:scenario.externalEvent.text,
      reconsideration:scenario.reconsiderationQuestions[first.id],secondAction:second.literal,
      canonical:result.canonical_choice,reasoning:fullMeaning,emotion,compact,full:fullExpression});
  }
  assert.equal(evidence.length,6);
  const root=process.env.YL_CZ155_EVIDENCE;
  if(root){
    mkdirSync(root,{recursive:true});
    writeFileSync(root+"/epictetus-six-paths.json",
      JSON.stringify({sourceHash:start.sourceVersionHash,scenarioHash:scenario.scenarioFingerprint,paths:evidence},null,2)+"\n");
    const lines=[
      "# CZ-155 · Literal six-path audit from the unchanged three-engine runtime",
      "",
      "This is generated from runPilot on the exact test checkout, not written as production results.",
      "The Source, Reasoning, Emotion Strategy, full Expression and compact Expression are computed for each of six paths.",
      ""
    ];
    for(const item of evidence){
      lines.push("## "+item.path.join(" → "),"",
        "**First literal message:** "+item.firstMessage,
        "",
        "**Independent observation:** "+item.observed,
        "",
        "**Second literal action:** "+item.secondAction,
        "",
        "**Reasoning selected claim:** "+item.reasoning.meaning.selectedClaim,
        "",
        "**Emotion Strategy:** "+item.emotion.strategy,
        "",
        "**Source warrant IDs:** "+item.reasoning.meaning.choiceAnalysis.sourceWarrantIds.join(", "),
        "",
        "**Refinement basis:** "+JSON.stringify(item.reasoning.meaning.choiceAnalysis.refinementBasis),
        "",
        "**Compact ("+item.compact.visibleWordCount+" words):**",
        ...item.compact.sections.map(section=>"- "+section.label+": "+section.text),
        "",
        "**Full ("+item.full.wordCount+" words):**",
        ...item.full.sections.map(section=>"- "+section.label+": "+section.text),
        "");
    }
    writeFileSync(root+"/epictetus-six-paths-literal.md",lines.join("\n")+"\n");
  }
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

test("Semantic comparison masks action recaps and groups only equivalent action-status claims",()=>{
  const result=(first,second)=>run([first,"delivered_no_reply",second]);
  const interpretation=r=>({
    claim:r.fullMeaning.meaning.selectedClaim, strategy:r.emotion.strategy,
    compact:r.compact.sections.slice(1).map(x=>x.text),
    full:r.fullExpression.sections.slice(1).map(x=>x.text),
    question:r.compact.sections[2].text,
    basis:r.fullMeaning.meaning.choiceAnalysis.refinementBasis
  });
  const publicFromRequest=interpretation(result("request","name_harm"));
  const publicFromExplanation=interpretation(result("explain","unqualified"));
  const privatePublicPlan=interpretation(result("acknowledge","correct"));
  const privateListeningPlan=interpretation(result("explain","prepare_question"));
  const invitation=interpretation(result("acknowledge","invite"));
  const deferred=interpretation(result("request","leave_request"));
  assert.deepEqual(publicFromRequest,publicFromExplanation,
    "Equivalent communicated commitments may rightly converge");
  assert.deepEqual(privatePublicPlan,privateListeningPlan,
    "Equivalent not-yet-executed preparation may rightly converge");
  assert.match(publicFromRequest.claim,/promise is a present act.*performance/i);
  assert.match(privatePublicPlan.claim,/Preparing a step is an act.*happened or succeeded/i);
  assert.match(invitation.claim,/invitation is yours.*public conduct remain open/i);
  assert.match(deferred.claim,/Waiting now does not settle.*publicly tomorrow/i);
  assert.equal(new Set([publicFromRequest,privatePublicPlan,invitation,deferred]
    .map(x=>JSON.stringify([x.claim,x.strategy,x.question]))).size,4);
  for(const x of [publicFromRequest,privatePublicPlan,invitation,deferred])
    for(const section of x.compact)
      assert.doesNotMatch(section,/read receipt|forgiven you|caused the silence|you feared rejection/i);
});
