/**
 * CZ-123 INDEPENDENT CZ-131 HOLDOUT ACCEPTANCE — QA ONLY.
 *
 * This file is developed after freezing the actual candidate's exact HEAD,
 * and is NEVER present in the implementation branch. The two source-distinct
 * philosophical dilemmas and the no-fit case were privately reserved in the
 * earlier CZ-123 acceptance protocol BEFORE the CZ-131 implementation.
 *
 * Philosophical expectations, not new source admissions:
 * H1 Sartre: stay to care for mother or depart to join resistance. Possible
 *    sourced decision analysis; no numeric moral ranks, actual war forecasts
 *    or invented second-stage source events. Needs independent source admission.
 * H2 Plato, Crito 49–50: escape vs refusing to return a wrong; issue concerns
 *    justice, agreement and laws, NOT calculated prison costs or universal
 *    infallibility of positive law. Possible authored decision analysis, but
 *    no source-authorized branching has yet been admitted.
 * H3 Wittgenstein, Tractatus 5.6–5.62: logical boundary of sense, not a
 *    personal binary decision or "learn words to make your world grow".
 *    Genuine conceptual NO-FIT, but the present candidate must refrain from
 *    declaring an independently admitted no-fit until qualified review.
 *
 * Text references (public primary passages; editions require CZ-121 review):
 * Sartre: marxists.org/reference/archive/sartre/works/exist/sartre.htm
 * Plato: atlas.perseus.tufts.edu/library/passage/...tlg003.perseus-eng2:49-50/
 * Wittgenstein: wittgensteinproject.org/.../Tractatus_Logico-Philosophicus
 *
 * These QA cases challenge source-independent abstention. They deliberately
 * DO NOT add names, routes or exceptions to the product selector.
 */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {GAME_IDS,CONTENT_VERSION,contentFingerprintV21,validateContentRecordV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {selectMiniGameV21,runSelectedEncounterResearchV21,SIX_PEER_GAMES}
 from "../philosophy-engine/content/mini-game-selection-v21.js";
const clone=structuredClone;
const stamp=r=>(r.versionHash=contentFingerprintV21(r),r);
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const preapprovedSourceUrls=new Set(Object.values(semanticCases).map(x=>x.source?.url));
const quoteCases=[
 {id:"qa:sealed-h1",author:"Jean-Paul Sartre",
  work:"Existentialism Is a Humanism (lecture)",
  quote:"He had the choice between going to England to join the Free French Forces or of staying near his mother.",
  locator:"Example of the student torn between duties",url:"https://www.marxists.org/reference/archive/sartre/works/exist/sartre.htm",
  dilemma:"Stay and care for his mother or leave for the Free French Forces; neither outcome is certain.",
  claim:"Responsibility for commitment arises without a moral algorithm that decides his singular choice.",
  reviewExpectation:"possible_decision_map_after_authored_source_admission"},
 {id:"qa:sealed-h2",author:"Plato",
  work:"Crito, 49–50",quote:"Then we ought neither to requite wrong with wrong nor to do evil to anyone.",
  locator:"Crito, 49c–50c (Fowler translation)",
  url:"https://atlas.perseus.tufts.edu/library/passage/urn%3Acts%3AgreekLit%3Atlg0059.tlg003.perseus-eng2%3A49-50/",
  dilemma:"Escape Socrates's sentence or avoid what he argues would violate justice and the laws.",
  claim:"Requiting a wrong with another wrong is not justified merely by the original injustice.",
  reviewExpectation:"possible_normative_decision_map_after_authored_source_admission"},
 {id:"qa:sealed-h3",author:"Ludwig Wittgenstein",
  work:"Tractatus Logico-Philosophicus, 5.6–5.62",
  quote:"The limits of my language mean the limits of my world.",
  locator:"Propositions 5.6–5.62",url:"https://wittgensteinproject.org/w/index.php/Tractatus_Logico-Philosophicus_%28English%29",
  dilemma:"A conceptual thesis about the limits of logic, representation and meaningful language; no personal action exists.",
  claim:"Logical limits of sense cannot be observed from outside them; it is not a vocabulary growth exercise.",
  reviewExpectation:"source_grounded_no_fit_pending_qualified_review"}
];
function provisionalUnadmitted({id,author,work,quote,locator,url,dilemma,claim}){
 const record={
  version:CONTENT_VERSION,id,source:{
   author,work,quote,locator,referenceUrl:url,
   reviewState:"catalogue_only",reviewSignoff:null,
   verifiedSourceUrl:null,translationEdition:"Edition/signoff NOT independently admitted"
  },
  editorialState:"research_only",editorialSignoff:null,
  route:"selector_pending",
  dilemma,argument:{
   thesis:claim,sourceWarrant:claim,accessibleInsight:claim,
   originalArgument:claim,
   uncertaintyLimit:"No actual future, motive or unchosen result can be inferred."
  },
  scenario:{id:"unsupported:review-needed",variables:{concept:"source-review-required"},
   choices:[{id:"option-a",label:"An invented route is not authorized."}],
   constraints:{kind:"authored_branch",routes:[]},
   consequences:{warrant:"No source-approved consequences are admitted.",
    unknowns:["unreviewed intended meaning","unstated future"]}},
  gameCompatibility:GAME_IDS.map(id=>({
   id,eligible:false,requirements:[],
   evidenceOrRejection:"No source-reviewed game capability has been admitted for this passage."
  })),
  emotionalEligibility:{enabled:false,allowedStrategies:[],groundedTensions:[]},
  engineAdapter:{packetVersion:"meaning/1.2",operation:"unadmitted"}
 };
 return stamp(record);
}
test("INDEPENDENT H1/H2 — two truly unseen, source-distinct dilemmas abstain instead of author-specific forced game",()=>{
 const found=[];
 for(const holdout of quoteCases.slice(0,2)){
  assert.equal(preapprovedSourceUrls.has(holdout.url),false,
    "Holdout cannot be an already admitted frozen source.");
  const r=provisionalUnadmitted(holdout);
  const s=selectMiniGameV21(r,{preferredGameId:"decision_map"});
  assert.equal(s.status,"needs_source_review",JSON.stringify(s));
  assert.equal(s.no_fit_status,"needs_source_review");
  assert.equal(s.selected_game_id,null);
  assert.equal(s.eligible_games.length,0);
  assert.equal(s.selection_trace.evaluatedPeerIds.length,6);
  assert.deepEqual(s.selection_trace.evaluatedPeerIds,GAME_IDS);
  assert.equal(s.rejected_games.length,6);
  assert.ok(s.rejected_games.every(x=>/not independently admitted|not admitted|Source not admitted/i.test(x.reason)));
  const r2=clone(r);
  r2.source.reviewState="source_verified";
  r2.source.verifiedSourceUrl=r2.source.referenceUrl;
  r2.source.reviewSignoff={reviewer:"Fake editor",reviewedAt:"2026-11-15",
   translationEdition:"claimed",passageLocation:r2.source.locator};
  stamp(r2);r2.source.reviewSignoff.versionHash=r2.versionHash;
  assert.equal(selectMiniGameV21(r2).status,"needs_source_review",
   "Caller-recomputed hash and forged signature cannot admit the holdout.");
  assert.notEqual(runSelectedEncounterResearchV21(r,s,
   {gameId:"decision_map",path:["option-a"]},env).status,"ready");
  found.push({id:holdout.id,author:holdout.author,
   predicted:holdout.reviewExpectation,observed:s.status,
   selected:s.selected_game_id,reason:s.fallback_reason});
 }
 console.log("CZ123-CZ131-HOLDOUT-2-SOURCES "+JSON.stringify(found));
});
test("INDEPENDENT H3 — authentic conceptual no-fit abstains before review, not falsely published as six-peer certified no-fit",()=>{
 const h=quoteCases[2];
 assert.equal(preapprovedSourceUrls.has(h.url),false);
 const record=provisionalUnadmitted(h);
 record.route="no_fit";
 record.noFitReason="The philosophical claim concerns limits of logical sense; its truth conditions do not provide a personal resource, decision, proportional value or authored future.";
 stamp(record);
 const result=selectMiniGameV21(record);
 assert.equal(result.status,"needs_source_review",JSON.stringify(result));
 assert.equal(result.selected_game_id,null);
 assert.equal(result.eligible_games.length,0);
 assert.equal(result.rejected_games.length,6);
 assert.notEqual(result.status,"no_fit",
  "A philosopher's conceptual no-fit is not certified without independently reviewed source-level six-peer rejection.");
 assert.equal(selectMiniGameV21(HEGEL_NO_FIT_V21).status,"no_fit",
  "Previously admitted no-fit remains actionable as inventory, never as gameplay.");
 console.log("CZ123-CZ131-HOLDOUT-NOFIT "+JSON.stringify({
  author:h.author,expected:h.reviewExpectation,observed:result.status,
  admittedComparison:"Hegel=no_fit",public:false}));
});
test("INDEPENDENT peer order and contradiction attacks — machine evidence not attacker field order or fictional game claims",()=>{
 const baseline=selectMiniGameV21(DILLARD_V21);
 const permuted=clone(DILLARD_V21);
 permuted.gameCompatibility=[...permuted.gameCompatibility].sort((a,b)=>b.id.localeCompare(a.id));
 stamp(permuted);
 assert.equal(validateContentRecordV21(permuted).status,"valid_research_record");
 const s=selectMiniGameV21(permuted);
 assert.equal(s.selected_game_id,baseline.selected_game_id);
 assert.deepEqual(s.eligible_games,baseline.eligible_games);
 const forged=clone(DILLARD_V21);
 const future=forged.gameCompatibility.find(g=>g.id==="future_reveal");
 future.eligible=true;
 future.evidenceOrRejection="The world guarantees the future from this imaginary allocation.";
 stamp(forged);
 assert.equal(selectMiniGameV21(forged).status,"needs_source_review");
 const fakeNoFit=clone(HEGEL_NO_FIT_V21);
 fakeNoFit.noFitReason="The passage is a numerical resource allocation in disguise.";
 stamp(fakeNoFit);
 assert.equal(selectMiniGameV21(fakeNoFit).status,"needs_source_review");
});
test("INDEPENDENT fixed canonical facts across eligible views and all six peers assessed identically",()=>{
 const f=selectMiniGameV21(DILLARD_V21);
 const g=selectMiniGameV21(DILLARD_V21,{preferredGameId:"trade_off"});
 assert.deepEqual(f.selection_trace.evaluatedPeerIds,g.selection_trace.evaluatedPeerIds);
 const a=runSelectedEncounterResearchV21(DILLARD_V21,f,
  {gameId:"token_studio",amounts:[2,2,2],repetitions:5},env);
 const b=runSelectedEncounterResearchV21(DILLARD_V21,g,
  {gameId:"trade_off",amounts:[2,2,2],repetitions:5},env);
 assert.equal(a.status,"ready");
 assert.equal(b.status,"ready");
 assert.deepEqual(a.canonical_choice,b.canonical_choice);
 assert.deepEqual(a.meaning,b.meaning);
 assert.deepEqual(a.expression.sections,b.expression.sections);
 const k=selectMiniGameV21(KIERKEGAARD_V21);
 const km=selectMiniGameV21(KIERKEGAARD_V21,{preferredGameId:"decision_map"});
 const ka=runSelectedEncounterResearchV21(KIERKEGAARD_V21,k,
  {gameId:"swipe_decision",path:["change","surprise","adapt"]},env);
 const kb=runSelectedEncounterResearchV21(KIERKEGAARD_V21,km,
  {gameId:"decision_map",path:["change","surprise","adapt"]},env);
 assert.equal(ka.status,"ready");
 assert.equal(kb.status,"ready");
 assert.deepEqual(ka.meaning,kb.meaning);
 assert.deepEqual(k.canonical_choice_contract.stages.map(x=>x.role),
  ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"]);
 assert.equal(k.canonical_choice_contract.stages[1].control,"source_authored_scenario");
 assert.equal(k.canonical_choice_contract.sourceAuthoredRoutes.length,8);
});
test("INDEPENDENT spoof of selection trace and game availability never upgrades to production or bypasses reasoning",()=>{
 const s=selectMiniGameV21(DILLARD_V21);
 const trace=clone(s);
 trace.selection_trace.candidates.find(x=>x.id==="future_reveal").selectionEligible=true;
 assert.equal(runSelectedEncounterResearchV21(DILLARD_V21,trace,
  {gameId:"token_studio",amounts:[2,2,2],repetitions:5},env).status,
  "rejected_selection");
 assert.equal(runSelectedEncounterResearchV21(DILLARD_V21,s,
  {gameId:"future_reveal",amounts:[2,2,2],repetitions:5},env).status,
  "rejected_choice");
 assert.equal(runSelectedEncounterResearchV21(DILLARD_V21,s,
  {gameId:"token_studio",amounts:[99,0,0],repetitions:5},env).status,
  "rejected_choice");
 assert.ok(SIX_PEER_GAMES.every(x=>x.productionPlayable===false));
 assert.equal(selectMiniGameV21(DILLARD_V21,{
  accessibility:{screenReaderRequired:true}}).status,"needs_accessible_interaction");
 const code=readFileSync(new URL("../philosophy-engine/content/mini-game-selection-v21.js",import.meta.url),"utf8");
 for(const holdout of quoteCases)
  assert.equal(code.includes(holdout.author),false,
   "The implementation must not contain QA holdout author routing.");
});

test("DIAGNOSTIC: all eight admitted Kierkegaard paths report READY or explicit editorial abstention, never fabricated conclusions",()=>{
 const s=selectMiniGameV21(KIERKEGAARD_V21);
 const cases=KIERKEGAARD_V21.scenario.constraints.routes.map(route=>{
  const result=runSelectedEncounterResearchV21(KIERKEGAARD_V21,s,
   {gameId:"swipe_decision",path:route.path},env);
  assert.ok(["ready","needs_editorial_review"].includes(result.status));
  if(result.status==="ready"){
   assert.deepEqual(result.canonical_choice,{path:route.path});
   assert.match(result.epistemicLimits.join(" "),/unknown|imagined|unchosen/i);
  }
  return {path:route.path,status:result.status,reason:result.reason??null};
 });
 console.log("CZ123-CZ131-PATH-COVERAGE "+JSON.stringify(cases));
});

test("DIAGNOSTIC: frozen v2.0 allowed-tone re-render feasibility for two safe-abstained branches",async()=>{
 const {renderEncounterV20}=await import("../philosophy-engine/encounter/encounter-v20.js");
 const {reasonSemantically}=await import("../philosophy-engine/encounter/semantic-reasoning-v12.js");
 for(const path of [["change","surprise","adapt"],["change","surprise","continue"]]){
  const packet=reasonSemantically(semanticCases.kierkegaard,{path});
  const cases=["contemplative","provocative","warm","playful"].map(tone=>{
   const r=renderEncounterV20(packet,{tone});
   return {tone,status:r.status,strategy:r.brief?.strategy,reason:r.reason??null};
  });
  console.log("CZ123-CZ131-TONE-DIAG "+JSON.stringify({path,cases}));
 }
});
