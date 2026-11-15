import {test} from "node:test";
import assert from "node:assert/strict";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {contentFingerprintV21,validateChoiceV21,canPublishEncounterV21,GAME_IDS}
 from "../philosophy-engine/content/content-contract-v21.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {reasonSemantically} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {authoritativeContextForRecord}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {
 SIX_PEER_GAMES,selectMiniGameV21,runSelectedEncounterResearchV21,SELECTION_VERSION
} from "../philosophy-engine/content/mini-game-selection-v21.js";
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const clone=structuredClone;
const res=ctx=>{
 const x=researchContentFromTrustedContextV211(ctx);
 assert.equal(x.status,"ready",JSON.stringify(x));
 return x.record;
};
const auth=x=>assert.equal(x.status,"ready",JSON.stringify(x));
const signed=x=>(x.versionHash=contentFingerprintV21(x),x);
const ids=xs=>xs.map(x=>x.id);
test("one complete six-peer registry with explicit research implementation and no production claims",()=>{
 assert.equal(SELECTION_VERSION,"single-six-peer-selection/2.1.0");
 assert.deepEqual(ids(SIX_PEER_GAMES),GAME_IDS);
 assert.equal(new Set(ids(SIX_PEER_GAMES)).size,6);
 assert.ok(SIX_PEER_GAMES.every(g=>
  g.requiredFields.length&&g.allowedReasoningOperations.length&&
  g.contraindications.length&&g.accessibilityFallback&&
  g.choiceSchema&&g.implementationStatus&&g.editorialStatus==="research_only"&&
  g.productionPlayable===false));
 assert.deepEqual(SIX_PEER_GAMES.filter(g=>g.browserPrototypeAvailable).map(g=>g.id),
  ["token_studio","swipe_decision"]);
 assert.deepEqual(SIX_PEER_GAMES.filter(g=>!g.executableInResearch).map(g=>g.id),
  ["balance_of_values","future_reveal"]);
});
test("Dillard six peer trace selects prototype Token Studio; explicit preference can choose research-only Trade-Off",()=>{
 const selected=selectMiniGameV21(DILLARD_V21);
 assert.equal(selected.status,"research_selected",JSON.stringify(selected));
 assert.equal(selected.selected_game_id,"token_studio");
 assert.equal(selected.selected_game.browserPrototypeAvailable,true);
 assert.equal(selected.selected_game.productionPlayable,false);
 assert.deepEqual(selected.selection_trace.evaluatedPeerIds,GAME_IDS);
 assert.equal(selected.selection_trace.candidates.length,6);
 assert.deepEqual(ids(selected.eligible_games),["token_studio","trade_off"]);
 assert.deepEqual(ids(selected.rejected_games),
  ["decision_map","balance_of_values","swipe_decision","future_reveal"]);
 assert.ok(selected.rejected_games.every(x=>x.reason.length>=25));
 assert.ok(selected.rejected_games.find(x=>x.id==="swipe_decision").reason.includes("graph"));
 assert.equal(selected.canonical_choice_contract.kind,"finite_budget_allocation");
 assert.equal(selected.canonical_choice_contract.budget.capacity,6);
 assert.deepEqual(selected.canonical_choice_contract.budget.costs,[1,1,1]);
 assert.equal(selected.canonical_choice_contract.budget.unitHours,0.5);
 const alt=selectMiniGameV21(DILLARD_V21,{preferredGameId:"trade_off"});
 assert.equal(alt.selected_game_id,"trade_off");
 assert.equal(alt.selected_game.browserPrototypeAvailable,false);
 assert.equal(alt.selected_game.productionPlayable,false);
 assert.equal(alt.canonical_choice_contract.input.gameId,"trade_off");
 assert.deepEqual(selectMiniGameV21(DILLARD_V21),selected,"same source has exact deterministic selection");
 const noUI=selectMiniGameV21(DILLARD_V21,{mode:"prototype"});
 assert.equal(noUI.selected_game_id,"token_studio");
 assert.deepEqual(ids(noUI.eligible_games),["token_studio"]);
 assert.ok(noUI.rejected_games.some(x=>x.id==="trade_off"&&/browser prototype/.test(x.reason)));
 console.log("CZ131-DILLARD "+JSON.stringify({selected:selected.selected_game_id,
  eligible:ids(selected.eligible_games),rejected:ids(selected.rejected_games),
  researchAlternative:alt.selected_game_id,public:false}));
});
test("Kierkegaard selects the authored-stage Swipe prototype with readable source events, no event chosen by user",()=>{
 const selected=selectMiniGameV21(KIERKEGAARD_V21);
 assert.equal(selected.status,"research_selected",JSON.stringify(selected));
 assert.equal(selected.selected_game_id,"swipe_decision");
 assert.deepEqual(ids(selected.eligible_games),["swipe_decision","decision_map"]);
 assert.deepEqual(selected.canonical_choice_contract.stages.map(x=>x.role),
  ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
 assert.equal(selected.canonical_choice_contract.stages[1].control,"source_authored_scenario");
 assert.match(selected.canonical_choice_contract.externalEventPolicy,/never expose stage 1 event selection as a user action/i);
 const paths=selected.canonical_choice_contract.sourceAuthoredRoutes;
 assert.equal(paths.length,8);
 for(const p of paths){
  assert.deepEqual(p.agencyRoles,["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
  assert.equal(p.unchosenOutcomeKnown,false);
  assert.ok(p.authoredDevelopments.length>=1);
 }
 const alt=selectMiniGameV21(KIERKEGAARD_V21,{preferredGameId:"decision_map"});
 assert.equal(alt.selected_game_id,"decision_map");
 assert.equal(alt.selected_game.browserPrototypeAvailable,false);
 const performed=runSelectedEncounterResearchV21(KIERKEGAARD_V21,selected,
  {gameId:"swipe_decision",path:["change","risk","continue"]},env);
 assert.equal(performed.status,"ready",JSON.stringify(performed));
 assert.equal(performed.publicationAllowed,false);
 assert.deepEqual(performed.canonical_choice.path,["change","risk","continue"]);
 assert.match(performed.expression.sections.map(x=>x.text).join(" "),/imagined|unknown/i);
 assert.equal(performed.stages.length,7);
 console.log("CZ131-KIERKEGAARD "+JSON.stringify({selected:selected.selected_game_id,
  eligible:ids(selected.eligible_games),paths:paths.length,
  meaningKind:performed.meaning.meaning.kind,copyStatus:performed.expression.status}));
});
test("Dillard same canonical choices through distinct peer presentations yield IDENTICAL frozen meaning",()=>{
 const choices=[{gameId:"token_studio",amounts:[3,1,2],repetitions:5},
  {gameId:"trade_off",amounts:[3,1,2],repetitions:5}];
 const a=selectMiniGameV21(DILLARD_V21);
 const b=selectMiniGameV21(DILLARD_V21,{preferredGameId:"trade_off"});
 const outA=runSelectedEncounterResearchV21(DILLARD_V21,a,choices[0],env);
 const outB=runSelectedEncounterResearchV21(DILLARD_V21,b,choices[1],env);
 assert.equal(outA.status,"ready",JSON.stringify(outA));
 assert.equal(outB.status,"ready",JSON.stringify(outB));
 assert.deepEqual(outA.canonical_choice,outB.canonical_choice);
 assert.deepEqual(outA.meaning,outB.meaning);
 assert.deepEqual(outA.expression.sections,outB.expression.sections);
 assert.equal(outA.meaning.meaning.kind,"repetition");
 assert.equal(outA.emotion.strategy,outB.emotion.strategy);
 assert.equal(outA.productionPlayable,false);
});
test("Kierkegaard same canonical path in Swipe and Decision Map yields IDENTICAL meaning, unknown future",()=>{
 const input={path:["stay","surprise","adapt"]};
 const swipe=selectMiniGameV21(KIERKEGAARD_V21);
 const map=selectMiniGameV21(KIERKEGAARD_V21,{preferredGameId:"decision_map"});
 const a=runSelectedEncounterResearchV21(KIERKEGAARD_V21,swipe,
  {...input,gameId:"swipe_decision"},env);
 const b=runSelectedEncounterResearchV21(KIERKEGAARD_V21,map,
  {...input,gameId:"decision_map"},env);
 assert.equal(a.status,"ready",JSON.stringify(a));
 assert.equal(b.status,"ready",JSON.stringify(b));
 assert.deepEqual(a.canonical_choice,b.canonical_choice);
 assert.deepEqual(a.meaning,b.meaning);
 assert.deepEqual(a.expression.sections,b.expression.sections);
 assert.match(a.epistemicLimits.join(" "),/unknown|imagined|unchosen/i);
});
test("Thoreau and Smith existing, source-distinct research only: eligible tradeoff without a false browser prototype claim",()=>{
 for(const [name,ctx,input] of [
  ["Thoreau",semanticCases.money,{gameId:"trade_off",amounts:[1,0,1],repetitions:5}],
  ["Smith",semanticCases.workshop,{gameId:"trade_off",amounts:[3,1]}]
 ]){
  const record=res(ctx),s=selectMiniGameV21(record);
  assert.equal(s.status,"research_selected",JSON.stringify(s));
  assert.equal(s.selected_game_id,"trade_off");
  assert.equal(s.selected_game.browserPrototypeAvailable,false);
  assert.equal(s.selected_game.productionPlayable,false);
  const p=runSelectedEncounterResearchV21(record,s,input,env);
  assert.equal(p.status,"ready",JSON.stringify(p));
  assert.equal(p.expression.status,"ready");
  assert.equal(p.expression.source_url,ctx.source.url);
  assert.equal(p.expression.source_warrant,ctx.semantic.admission.centralClaim);
  const noUI=selectMiniGameV21(record,{mode:"prototype"});
  assert.equal(noUI.status,"no_available_game");
  assert.equal(noUI.selected_game_id,null);
  assert.equal(noUI.eligible_games.length,0);
  console.log("CZ131-SOURCE-DISTINCT "+JSON.stringify({
   name,selected:s.selected_game_id,output:p.status,
   browserPrototypeAvailable:p.browserPrototypeAvailable,modeled:p.meaning.meaning.kind,
   noBrowserAvailable:noUI.status}));
 }
});
test("Hegel source-specific reviewed six-peer no-fit never becomes a selectable game",()=>{
 const s=selectMiniGameV21(HEGEL_NO_FIT_V21);
 assert.equal(s.status,"no_fit",JSON.stringify(s));
 assert.equal(s.no_fit_status,"source_no_fit");
 assert.equal(s.selected_game_id,null);
 assert.equal(s.eligible_games.length,0);
 assert.equal(s.rejected_games.length,6);
 assert.equal(new Set(s.rejected_games.map(x=>x.reason)).size,6);
 assert.match(s.fallback_reason,/mediated and developing whole/i);
 assert.equal(runSelectedEncounterResearchV21(HEGEL_NO_FIT_V21,s,
  {gameId:"token_studio",amounts:[1,2]},env).status,"needs_source_review");
});
test("unseen source, malformed input and false author/source identity fail closed across all six peers",()=>{
 const unknown=structuredClone(DILLARD_V21);
 unknown.id="research:new:unreviewed";
 unknown.source.author="Invented philosopher";unknown.versionHash=contentFingerprintV21(unknown);
 const s=selectMiniGameV21(unknown);
 assert.equal(s.status,"needs_source_review");
 assert.equal(s.selected_game_id,null);
 assert.equal(s.rejected_games.length,6);
 assert.equal(s.eligible_games.length,0);
 const sourceSpoof=signed(structuredClone(DILLARD_V21));
 sourceSpoof.source.author="Aristotle";signed(sourceSpoof);
 assert.equal(selectMiniGameV21(sourceSpoof).status,"needs_source_review");
 for(const bad of [null,undefined,{},[],{gameCompatibility:{}},0,"an input"]){
  const v=selectMiniGameV21(bad);
  assert.notEqual(v.status,"research_selected",String(bad));
  assert.equal(v.selected_game_id,null);
 }
 for(const request of [
  {mode:"production"},{preferredGameId:"unknown"},
  {accessibility:{screenReaderRequired:"yes"}},
  {accessibility:{invented:true}},
  {featureFlag:true}
 ])assert.equal(selectMiniGameV21(DILLARD_V21,request).status,"invalid_request");
});
test("peer evaluation is stable by game ID even when valid source peer arrays arrive reordered",()=>{
 const canonical=selectMiniGameV21(DILLARD_V21);
 const shuffled=structuredClone(DILLARD_V21);
 shuffled.gameCompatibility.reverse();
 shuffled.versionHash=contentFingerprintV21(shuffled);
 const newOrder=selectMiniGameV21(shuffled);
 assert.equal(newOrder.status,"research_selected",JSON.stringify(newOrder));
 assert.equal(newOrder.selected_game_id,canonical.selected_game_id);
 assert.deepEqual(ids(newOrder.eligible_games),ids(canonical.eligible_games));
 assert.deepEqual(ids(newOrder.rejected_games),ids(canonical.rejected_games));
 const chosen=runSelectedEncounterResearchV21(shuffled,newOrder,
  {gameId:"token_studio",amounts:[3,1,2],repetitions:5},env);
 assert.equal(chosen.status,"ready",JSON.stringify(chosen));
});
test("accessibility constraints and malicious preferences cannot silently claim a playable browser interaction",()=>{
 const a=selectMiniGameV21(DILLARD_V21,{
  preferredGameId:"balance_of_values"});
 assert.equal(a.selected_game_id,"token_studio");
 assert.equal(a.selection_trace.preferenceHonored,false);
 assert.ok(a.rejected_games.some(x=>x.id==="balance_of_values"));
 const b=selectMiniGameV21(KIERKEGAARD_V21,{
  accessibility:{screenReaderRequired:true}});
 assert.equal(b.status,"needs_accessible_interaction");
 assert.equal(b.selected_game_id,null);
 assert.equal(b.eligible_games.length,0);
 const c=selectMiniGameV21(DILLARD_V21,{
  mode:"prototype",accessibility:{reducedMotionRequired:true}});
 assert.equal(c.status,"needs_accessible_interaction");
 assert.equal(c.selected_game_id,null);
});
test("caller cannot change selected game, trace, source hash, external event or canonical outcomes",()=>{
 const record=KIERKEGAARD_V21,selected=selectMiniGameV21(record);
 const valid={gameId:"swipe_decision",path:["change","risk","continue"]};
 const modified=clone(selected);modified.selected_game_id="future_reveal";
 assert.equal(runSelectedEncounterResearchV21(record,modified,valid,env).status,"rejected_selection");
 const edited=clone(selected);edited.selection_trace.candidates[3].selectionEligible=true;
 assert.equal(runSelectedEncounterResearchV21(record,edited,valid,env).status,"rejected_selection");
 assert.equal(runSelectedEncounterResearchV21(record,selected,
  {gameId:"future_reveal",path:valid.path},env).status,"rejected_choice");
 assert.equal(runSelectedEncounterResearchV21(record,selected,
  {gameId:"swipe_decision",path:["change","never_happened","continue"]},env).status,"rejected_choice");
 assert.equal(runSelectedEncounterResearchV21(record,selected,
  {gameId:"swipe_decision",path:["change","risk","imagined_forever"]},env).status,"rejected_choice");
 const noPublish=runSelectedEncounterResearchV21(record,selected,valid,
  {...env,publicVisibility:true});
 assert.equal(noPublish.status,"needs_source_review");
 assert.equal(canPublishEncounterV21(record,{founderAuthorized:true}),false);
});
test("negative and zero workbench meaning remain supported in a single headless research selection",()=>{
 const r=res(semanticCases.workshop);
 const s=selectMiniGameV21(r);
 for(const [amounts,delta] of [[[2,2],1],[[3,1],0],[[4,0],-1]]){
  const o=runSelectedEncounterResearchV21(r,s,{gameId:"trade_off",amounts},env);
  assert.equal(o.status,"ready",JSON.stringify(o));
  assert.equal(o.meaning.meaning.evidence.delta,delta);
  assert.match(o.expression.sections[1].text,
   delta===0?/no improvement/i:delta>0?/more booklet/i:/fewer booklet/i);
  assert.ok(o.expression.wordCount>=80&&o.expression.wordCount<=120);
 }
});
