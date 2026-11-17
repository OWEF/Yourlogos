import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";
import {CZ147_SOURCE_RECORDS,CZ147_RESEARCH_MATRIX} from "../experiments/yl-cz147-sources.mjs";
import {makeUniversalRegistry,sealUniversalSource,reasonUniversal,emotionUniversal,
 expressUniversal} from "../experiments/yl-cz147-engines.mjs";
import {resolveQuoteB27,runQuoteEncounterB27,CZ147_APP_ADMITTED_IDS}
 from "../experiments/yl-b27-route.mjs";
const registry=makeUniversalRegistry(CZ147_SOURCE_RECORDS,B27_APP_QUOTES);
const request=(r,input)=>({quoteId:r.quoteId,quoteText:r.source.text,
 quoteAuthor:r.source.author,quoteWork:r.source.work,
 b27DevelopmentOnly:r.developmentOnly,canonicalInput:input});
function choices(r){
 if(r.familyId==="balance_move"){
  const max=r.allocation.resourceCapacity;
  const values=[];
  for(let a=0;a<=max;a++)for(let b=0;b<=max-a;b++){
   const arr=r.allocation.choices.length===2?
    (a+b===max?[a,b]:null):[a,b,max-a-b];
   if(arr)values.push({amounts:arr,budgets:[max],touched:true,
    ...(r.allocation.repetitions===null?{}:{repetitions:r.allocation.repetitions})});
  }
  return values;
 }
 if(r.familyId==="tap_pair"){
  const edges=r.relation.edges,p=e=>({aId:e.aId,bId:e.bId,relationId:e.relationId});
  const result=edges.map(e=>({pairs:[p(e)]}));
  for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++)
   result.push({pairs:[p(edges[i]),p(edges[j])]});
  return result;
 }
 return r.timeline.map(t=>r.familyId==="decision_cards"?
  {path:[t.startId,t.sceneId,t.responseId]}:
  {actions:[{type:"choose_start",optionId:t.startId},
    {type:"explore_authored",sceneId:t.sceneId},
    {type:"choose_response",optionId:t.responseId},
    {type:"read_retrospective"}]});
}
function assertReady(r,input,out){
 assert.equal(out.status,"ready",JSON.stringify({id:r.quoteId,choice:input,
  status:out.status,reason:out.reason,code:out.code}).slice(0,1250));
 assert.equal(out.sourceVersionHash,sealUniversalSource(r).sourceFingerprint);
 assert.equal(out.fullMeaning.meaning.centralClaim,r.sourceThesis);
 assert.equal(out.fullExpression.sections.length,3);
 assert.equal(out.compact.sections.length,3);
 assert.deepEqual(out.compact.sections.map(x=>x.label),
  ["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.ok(out.fullExpression.wordCount>=80&&out.fullExpression.wordCount<=120);
 assert.ok(out.compact.visibleWordCount>=40&&out.compact.visibleWordCount<=65);
 assert.equal(out.compact.fullWordCount,out.fullExpression.wordCount);
 assert.equal(out.emotion.inferredActualEmotion,false);
 assert.equal(out.emotion.inferredMoralRank,false);
 assert.equal(out.provenance.unchosenFutureKnown,false);
 assert.equal(out.publicationAllowed,false);
}
test("Universal source-first schema: eight genuine records, four operations, independent no-fit queue",()=>{
 assert.equal(CZ147_SOURCE_RECORDS.length,8);
 assert.equal(new Set(CZ147_SOURCE_RECORDS.map(r=>r.source.author)).size>=6,true);
 assert.equal(new Set(CZ147_SOURCE_RECORDS.map(r=>r.familyId)).size,4);
 assert.equal(registry.size,8);
 assert.equal(CZ147_RESEARCH_MATRIX.length>=12,true);
 assert.deepEqual([...CZ147_APP_ADMITTED_IDS].sort((a,b)=>a-b),[23,48,49,55]);
 for(const r of CZ147_SOURCE_RECORDS){
  assert.deepEqual([r.source.text,r.source.author,r.source.work],
   [B27_APP_QUOTES[r.quoteId][0],B27_APP_QUOTES[r.quoteId][1],
    B27_APP_QUOTES[r.quoteId][3]]);
  assert.notEqual(sealUniversalSource(r).status,"blocked",r.recordId);
  assert.equal(r.publicationAllowed,false);
  assert.ok(r.prohibitedInferences.length>=4);
 }
 for(const [id,status] of [[21,"capability_research"],[28,"source_review"],
  [56,"capability_research"],[71,"capability_research"],[63,"no_fit"]]){
  assert.equal(CZ147_RESEARCH_MATRIX.find(r=>r.quoteId===id).status,status);
  const [quote,author,,work]=B27_APP_QUOTES[id];
  assert.equal(resolveQuoteB27({quoteId:id,quoteText:quote,
   quoteAuthor:author,quoteWork:work,b27DevelopmentOnly:false}).status,"no_fit");
 }
});
test("Every reachable canonical state across all source/authored families has complete natural output",()=>{
 const evidence=[];
 for(const r of CZ147_SOURCE_RECORDS){
  const src=registry.resolve(request(r,null));
  assert.equal(src.status,"ready");
  const seen=new Set();
  for(const input of choices(r)){
   const out=registry.run({...request(r,input),sourceVersionHash:src.sourceVersionHash});
   assertReady(r,input,out);
   const signature=JSON.stringify(out.canonical_choice);
   assert.ok(!seen.has(signature),"Each choice must be a unique canonical meaning "+signature);
   seen.add(signature);
   assert.ok(!/chose You\b/.test(out.compact.sections[0].text));
   assert.ok(out.compact.sections[1].text.includes(r.sourceThesis));
   assert.ok(out.compact.sections[1].text.includes(r.compactLimit));
   for(const phrase of ["you are a good person","you must feel","your true personality"]){
    assert.ok(!JSON.stringify(out).toLowerCase().includes(phrase));
   }
   if(r.familyId==="tap_pair"){
    const cards=new Map(r.relation.cards.map(c=>[c.id,c.label]));
    for(const edge of out.canonical_choice.pairs)
     assert.ok(out.compact.sections[0].text.includes(cards.get(edge.aId))&&
      out.compact.sections[0].text.includes(cards.get(edge.bId)));
   }
   if(r.familyId==="balance_move"){
    const words=out.compact.sections[0].text,positive=input.amounts.filter(n=>n>0);
    for(let i=0;i<input.amounts.length;i++){
     const n=input.amounts[i],label=r.allocation.choices[i].label;
     assert.ok(words.includes(label),"Every activity must appear: "+label);
     if(n>0)assert.ok(positive.length===1?
      words.includes("all "+r.allocation.resourceCapacity):
      words.includes(n+" for "+label));
     else assert.match(words,/none for/);
    }
   }
   if(seen.size===1) evidence.push({quoteId:r.quoteId,source:r.source,
    family:r.familyId,choice:input,meaning:out.fullMeaning,
    emotion:out.emotion,full:out.fullExpression,
    compact:out.compact,sourceHash:out.sourceVersionHash});
  }
  assert.equal(seen.size,choices(r).length);
 }
 mkdirSync("qa-evidence-cz147",{recursive:true});
 writeFileSync("qa-evidence-cz147/source-capability-matrix.json",
  JSON.stringify(CZ147_RESEARCH_MATRIX,null,2));
 writeFileSync("qa-evidence-cz147/source-engine-examples.json",
  JSON.stringify(evidence,null,2));
 assert.equal(evidence.length,8);
});
test("Only admitted original quotes enter the existing quote-first consumer route",()=>{
 for(const r of CZ147_SOURCE_RECORDS.filter(x=>x.exposeInApp)){
  const src=resolveQuoteB27(request(r,null));
  assert.equal(src.status,"ready");
  assert.equal(src.record.familyId,r.familyId);
  assert.equal(src.quoteId,r.quoteId);
  const input=choices(r)[0];
  assertReady(r,input,runQuoteEncounterB27({...request(r,input),
   sourceVersionHash:src.sourceVersionHash}));
  assert.notEqual(resolveQuoteB27({...request(r,null),
   quoteText:r.source.text+" forged"}).status,"ready");
 }
 for(const r of CZ147_SOURCE_RECORDS.filter(x=>!x.exposeInApp)){
  assert.equal(CZ147_APP_ADMITTED_IDS.includes(r.quoteId),false);
 }
});
test("Equivalent pair choice order has exact semantic parity; different choices have different output",()=>{
 const r=CZ147_SOURCE_RECORDS.find(x=>x.quoteId===23);
 const src=registry.resolve(request(r,null));
 const e=r.relation.edges;
 const link=x=>({aId:x.aId,bId:x.bId,relationId:x.relationId});
 const a={pairs:[link(e[0]),link(e[1])]},b={pairs:[
  {aId:e[1].bId,bId:e[1].aId,relationId:e[1].relationId},link(e[0])]};
 const run=input=>registry.run({...request(r,input),sourceVersionHash:src.sourceVersionHash});
 const x=run(a),y=run(b),z=run({pairs:[link(e[0])]});
 assertReady(r,a,x);assertReady(r,b,y);assertReady(r,{pairs:[link(e[0])]},z);
 assert.deepEqual(x.canonical_choice,y.canonical_choice);
 assert.equal(x.saveKey,y.saveKey);
 assert.deepEqual(x.compact.sections,y.compact.sections);
 assert.notEqual(x.saveKey,z.saveKey);
 assert.notEqual(x.compact.sections[0].text,z.compact.sections[0].text);
 assert.equal(x.emotion.strategy,y.emotion.strategy);
});
test("Emotion Strategy actually changes rhetorical framing without altering the source's meaning",()=>{
 const r=CZ147_SOURCE_RECORDS.find(x=>x.quoteId===49);
 const input=amounts=>({amounts,budgets:[8],touched:true});
 const src=registry.resolve(request(r,null));
 const a=registry.run({...request(r,input([0,0,8])),sourceVersionHash:src.sourceVersionHash});
 const b=registry.run({...request(r,input([2,2,4])),sourceVersionHash:src.sourceVersionHash});
 assertReady(r,input([0,0,8]),a);assertReady(r,input([2,2,4]),b);
 assert.equal(a.emotion.strategy,"choice_awareness");
 assert.equal(b.emotion.strategy,"tradeoff_attention");
 assert.notEqual(a.compact.sections[1].text,b.compact.sections[1].text);
 assert.match(a.compact.sections[1].text,/Seneca's emphasis:/);
 assert.match(b.compact.sections[1].text,/Seneca's trade-off:/);
 for(const x of [a,b]){
  assert.equal(x.fullMeaning.meaning.centralClaim,r.sourceThesis);
  assert.equal(x.emotion.inferredActualEmotion,false);
  assert.ok(x.compact.sections[1].text.includes(r.compactLimit));
 }
});
test("Strict source boundary and rhetorical abstention block forgery without judging real people",()=>{
 const r=CZ147_SOURCE_RECORDS.find(x=>x.quoteId===49),src=sealUniversalSource(r);
 assert.notEqual(sealUniversalSource({...r,sourceThesis:""}).status,"ready");
 const packet=reasonUniversal(src,choices(r)[0]);
 assert.equal(packet.status,"ready");
 const neutral=emotionUniversal(packet,{...src,affordances:[]});
 assert.equal(neutral.strategy,"neutral_reflection");
 assert.equal(neutral.rhetoricSupported,false);
 assert.equal(neutral.inferredActualEmotion,false);
 const output=expressUniversal(packet,neutral,src);
 assert.equal(output.status,"ready");
 const forged={...src,sourceThesis:"A fabricated unrelated promise"};
 assert.equal(reasonUniversal(forged,choices(r)[0]).status,"blocked");
 const live=registry.resolve(request(r,null));
 for(const input of [
  {...choices(r)[0],amounts:[-1,4,5]},
  {...choices(r)[0],budgets:[100]},
  {...choices(r)[0],score:10},
  {amounts:[4,4],budgets:[8],touched:true}
 ])assert.notEqual(registry.run({...request(r,input),
  sourceVersionHash:live.sourceVersionHash}).status,"ready");
});
