/**
 * CZ-152 authored narrative admission — exact source ledger, no fake quote data.
 * This is a lightweight source-contract gate. Visual/usability QA is separate.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {resolveQuoteB27,CZ147_APP_ADMITTED_IDS} from "./yl-b27-route.mjs";
import {B27_APP_QUOTES} from "./yl-b27-quote-ledger.mjs";
import {CZ152_BRIDGE_VERSION,validateCZ152Bridge,bridgeWordCount} from "./yl-cz152-bridge.mjs";

const cases=[
 [55,"Emerson","decision_cards",["public","doubt","consisten"]],
 [23,"Wollstonecraft","tap_pair",["education","control","advice"]],
 [49,"Seneca","balance_move",["half-hour","rest","scrolling"]],
 [48,"Epictetus","flip_reveal",["exchange","silent","approach"]],
 [34,"Kierkegaard","decision_cards",["work","path","know"]],
 [94,"Kierkegaard","flip_reveal",["work","later","choose"]],
 [12,"Dillard","balance_move",["half-hour","rest","pattern"]],
 [91,"Smith","tap_pair",["gift","friend","contributions"]],
 [92,"Epictetus","tap_pair",["argument","apology","forgives"]],
 [93,"Thoreau","balance_move",["weekend","pay","hours"]]
];
function quoteRequest(id){
 const q=B27_APP_QUOTES[id];
 assert.ok(q,"missing original source quote "+id);
 return {quoteId:id,quoteText:q[0],quoteAuthor:q[1],
  quoteWork:q[3],b27DevelopmentOnly:id>=91};
}
test("CZ-152 all admitted source-bound narratives carry source/scene/play beats",()=>{
 const seen=new Set();
 for(const [id,author,family,anchors] of cases){
  const q=quoteRequest(id);
  assert.match(q.quoteAuthor,new RegExp(author,"i"));
  const entry=resolveQuoteB27(q);
  assert.equal(entry.status,"ready",JSON.stringify(entry).slice(0,600));
  assert.equal(entry.selectedFamilyId,family);
  const record=entry.record,b=record.narrativeBridge;
  assert.ok(validateCZ152Bridge(record),"invalid narrative source contract "+id);
  assert.equal(b.version,CZ152_BRIDGE_VERSION);
  assert.ok(bridgeWordCount(b.bridgeFromSource)>=10&&bridgeWordCount(b.bridgeFromSource)<=20,
   "source tension overlong or too vague "+id+": "+b.bridgeFromSource);
  assert.ok(bridgeWordCount(b.situationHook)>=15&&bridgeWordCount(b.situationHook)<=30,
   "source scenario overlong or too vague "+id+": "+b.situationHook);
  assert.ok(bridgeWordCount(b.playPrompt)>=4&&bridgeWordCount(b.playPrompt)<=20);
  for(const anchor of anchors)assert.match(
   b.situationHook,new RegExp(anchor,"i"),"missing concrete dilemma anchor "+anchor+" for "+id);
  assert.ok(b.sourceWarrantIds.every(x=>record.sourceWarrantIds.includes(x)),
   "narrative cites unavailable source warrant "+id);
  assert.notEqual(b.situationHook,record.intro,"scenario should be explicitly authored short content "+id);
  assert.ok(record.intro.length>0&&record.epistemicLimits.length>0);
  assert.equal(entry.publicationAllowed,false);
  seen.add(id);
 }
 assert.equal(seen.size,10);
 for(const id of CZ147_APP_ADMITTED_IDS)assert.ok(seen.has(id),"generalized accepted source unreviewed "+id);
});
test("CZ-152 invalid, incomplete and tampered narratives cannot pass source contract",()=>{
 const r=structuredClone(resolveQuoteB27(quoteRequest(55)).record);
 const bad=[
  {bridgeFromSource:""},
  {situationHook:r.intro.repeat(8)},
  {playPrompt:""},
  {sourceWarrantIds:["source:central","invented:claim"]},
  {sourceWarrantIds:["scenario:fictional"]},
  {version:"outdated:version"}
 ];
 for(const patch of bad){
  const modified=structuredClone(r);
  Object.assign(modified.narrativeBridge,patch);
  assert.equal(validateCZ152Bridge(modified),false,JSON.stringify(patch));
 }
});
test("CZ-152 unsupported original quotation remains reading-first, not synthetic gameplay",()=>{
 for(const id of [31,63,69]){
  const result=resolveQuoteB27(quoteRequest(id));
  assert.equal(result.status,"no_fit",JSON.stringify(result));
  assert.equal(result.readingFirst,true);
  assert.equal(result.record,undefined);
  assert.equal(result.productionPlayable,false);
 }
});
