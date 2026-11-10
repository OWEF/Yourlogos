import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reasonSeneca,reasonWoolf} from "../philosophy-engine/encounter/experience-reasoners-v01.js";
import {reasonToQuestion,REACTIONS} from "../philosophy-engine/encounter/question-selection-v02.js";
import {expressEncounterV02} from "../philosophy-engine/encounter/expression-engine-v02.js";
import {buildQuestionLabStandalone} from "../scripts/build-question-lab-v03.mjs";

const allocations=[];
for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++)allocations.push([a,b,6-a-b]);
const motives=["chosen","expected","necessary"];
const resources=["income","space","access"];
const actions=["write","protect","challenge"];

test("five-stage model works for 84 Seneca input combinations × four optional reaction categories",()=>{
 let count=0;
 for(const ticks of allocations)for(const motivation of motives){
   const packet=reasonSeneca({ticks,motivation});
   for(const reaction of REACTIONS){
     const analysis=reasonToQuestion(packet,{reaction});
     const view=expressEncounterV02(packet,{reaction});
     assert.equal(analysis.quoteId,49);
     assert.equal(analysis.observation.inferredFeeling,false);
     assert.ok(analysis.observation.evidence.length>0);
     assert.ok(analysis.philosophicalTension.evidence.length>0);
     assert.ok(analysis.philosophicalTension.philosophicalRelation.length>0);
     assert.ok(analysis.personalRelevance.category.length>0);
     assert.equal(analysis.flags.productionEligible,false);
     assert.equal(analysis.flags.philosophicalTruthVerdict,false);
     assert.equal(analysis.flags.emotionalInference,false);
     assert.equal(view.visual.type,"segments");
     assert.equal(view.summary,analysis.expressionDraft.discovery);
     assert.equal(view.sourceLine,analysis.expressionDraft.sourceConnection);
     assert.ok(view.debug.sourceReferences.length>0);
     assert.equal(view.feedbackIsOptional,true);
     if(reaction==="settled"){
       assert.equal(analysis.questionSelection.decision,"close");
       assert.equal(analysis.questionSelection.question,null);
       assert.equal(view.selectedQuestion,null);
       assert.equal(view.questionMode,"close");
       assert.ok(view.closingNote);
     }else{
       assert.equal(analysis.questionSelection.decision,"offer_question");
       assert.match(view.selectedQuestion,/\?$/);
       assert.equal(view.title,analysis.questionSelection.question);
     }
     count++;
   }
 }
 assert.equal(count,336);
});

test("five-stage model works for 27 Woolf paths × four optional reaction categories",()=>{
 let count=0;
 for(const resource of resources)for(const barrier of resources)for(const action of actions){
   const packet=reasonWoolf({resource,barrier,action});
   for(const reaction of REACTIONS){
     const analysis=reasonToQuestion(packet,{reaction}),view=expressEncounterV02(packet,{reaction});
     assert.equal(analysis.quoteId,28);
     assert.equal(analysis.personalRelevance.scenarioNotBiography,true);
     assert.equal(analysis.visual.type,"mindmap");
     assert.equal(analysis.visual.nodes.length,6);
     assert.equal(analysis.visual.edges.length,6);
     assert.ok(analysis.visual.nodes.every(n=>n.note.length>15));
     assert.equal(view.visual.type,"mindmap");
     assert.equal(view.debug.fiveLayers.questionSelection.decision,
       reaction==="settled"?"close":"offer_question");
     assert.equal(view.debug.fiveLayers.personalRelevance.emotionalState,
       reaction==="unanswered"?"not_inferred":
       reaction==="settled"?"explicitly_comfortable":
       reaction==="curious"?"explicitly_curious":"explicitly_unresolved");
     if(reaction==="settled")assert.equal(view.selectedQuestion,null);
     if(reaction!=="settled")assert.match(view.title,/\?/);
     count++;
   }
 }
 assert.equal(count,108);
});

test("strongly positive feedback leads to closure, not pressure or another question",()=>{
 for(const p of [
   reasonSeneca({ticks:[6,0,0],motivation:"necessary"}),
   reasonWoolf({resource:"space",barrier:"income",action:"write"})
 ]){
   const before=expressEncounterV02(p);
   const done=expressEncounterV02(p,{reaction:"settled"});
   assert.match(before.title,/\?/);
   assert.equal(done.selectedQuestion,null);
   assert.match(done.closingNote,/feel settled/);
   assert.equal(done.questionMode,"close");
   assert.equal(done.debug.fiveLayers.personalRelevance.reactionSource,"explicit_user_feedback");
 }
});

test("optional and necessary conflict is detected only if user actually chose optional work",()=>{
 const strong=reasonSeneca({ticks:[6,0,0],motivation:"necessary"});
 const question=expressEncounterV02(strong);
 assert.equal(question.title,"When did optional become necessary?");
 assert.equal(question.debug.fiveLayers.philosophicalTension.kind,"optional_necessary_tension");
 assert.match(question.summary,/Maybe it was/);
 const noWork=reasonSeneca({ticks:[0,3,3],motivation:"necessary"});
 const noWorkView=expressEncounterV02(noWork);
 assert.notEqual(noWorkView.debug.fiveLayers.philosophicalTension.kind,"optional_necessary_tension");
 assert.doesNotMatch(noWorkView.summary,/gave .* to an optional request/);
 const chosen=expressEncounterV02(reasonSeneca({ticks:[6,0,0],motivation:"chosen"}));
 assert.notEqual(chosen.title,question.title);
 assert.equal(chosen.debug.fiveLayers.personalRelevance.emotionalState,"not_inferred");
});

test("question selection changes based on voluntary follow-up without inferring fear or shame",()=>{
 const p=reasonSeneca({ticks:[6,0,0],motivation:"necessary"});
 const primary=expressEncounterV02(p);
 const curious=expressEncounterV02(p,{reaction:"curious"});
 const uneasy=expressEncounterV02(p,{reaction:"unsettled"});
 assert.notEqual(primary.title,curious.title);
 assert.notEqual(curious.title,uneasy.title);
 assert.match(curious.title,/consequences|commitments|expectations/);
 assert.equal(uneasy.debug.fiveLayers.personalRelevance.reactionSource,"explicit_user_feedback");
 assert.equal(primary.debug.fiveLayers.personalRelevance.reactionSource,"not_provided");
 assert.throws(()=>reasonToQuestion(p,{reaction:"sad"}),/Unsupported optional feedback/);
});

test("Woolf mind map shows meaningful multiple branches without assuming guaranteed outcome",()=>{
 const p=reasonWoolf({resource:"income",barrier:"space",action:"challenge"});
 const view=expressEncounterV02(p);
 assert.equal(view.visual.type,"mindmap");
 const names=Object.fromEntries(view.visual.nodes.map(n=>[n.id,n.label]));
 assert.equal(names.gain,"She earns her own money");
 assert.equal(names.barrier,"People still interrupt her");
 assert.equal(names.action,"She challenges the rules");
 assert.match(names.possibility,/More room/);
 assert.match(names.uncertainty,/limits remain/);
 assert.match(view.title,/\?/);
 assert.doesNotMatch(view.summary,/guarantee.*publish|will publish/);
 assert.equal(view.visual.implication,"conditional_not_deterministic");
 const s=expressEncounterV02(reasonWoolf({resource:"space",barrier:"income",action:"protect"}));
 assert.notEqual(s.title,view.title);
 assert.equal(s.visual.nodes.find(n=>n.id==="gain").label,"She gets a room to write");
});

test("exact standalone mobile artifact is reproducible from six modules and no network dependency",()=>{
 const file=readFileSync(new URL("../experiments/two-encounter-question-lab-v03-standalone.html",import.meta.url),"utf8");
 assert.equal(file,buildQuestionLabStandalone());
 assert.match(file,/function reasonToQuestion/);
 assert.match(file,/function expressEncounterV02/);
 assert.match(file,/class="mindmap"/);
 assert.match(file,/const ATLAS_PILOT_V01/);
 assert.doesNotMatch(file,/<script[^>]+src=/);
 assert.doesNotMatch(file,/\bfetch\s*\(|\bXMLHttpRequest\b|\blocalStorage\b|\bsessionStorage\b/);
 assert.doesNotMatch(file,/^import\s/m);
 const plain=readFileSync(new URL("../experiments/two-encounter-question-lab-v03.html",import.meta.url),"utf8");
 assert.match(plain,/She earns her own money/);
 assert.match(plain,/People keep interrupting her/);
 assert.doesNotMatch(plain,/data-route="aristotle"/);
});
