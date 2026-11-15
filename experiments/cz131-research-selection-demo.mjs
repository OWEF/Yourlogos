/**
 * CZ-131 research-only executable demonstration, no product UI and no network.
 * Usage: node experiments/cz131-research-selection-demo.mjs
 * All records are provisional; examples are NOT independent blind holdouts.
 */
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {selectMiniGameV21,runSelectedEncounterResearchV21}
 from "../philosophy-engine/content/mini-game-selection-v21.js";
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const tasks=[
 {name:"Dillard — two compatible resource games",record:DILLARD_V21,
  choice:{gameId:"token_studio",amounts:[3,1,2],repetitions:5}},
 {name:"Kierkegaard — first decision, authored development, response",record:KIERKEGAARD_V21,
  choice:{gameId:"swipe_decision",path:["change","risk","continue"]}},
 {name:"Thoreau — research-only source transfer",context:semanticCases.money,
  choice:{gameId:"trade_off",amounts:[1,0,1],repetitions:5}},
 {name:"Smith — research-only conditional productivity",context:semanticCases.workshop,
  choice:{gameId:"trade_off",amounts:[3,1]}},
 {name:"Hegel — authentic unsuitable passage",record:HEGEL_NO_FIT_V21,choice:null}
];
for(const entry of tasks){
 const record=entry.context?
  researchContentFromTrustedContextV211(entry.context).record:entry.record;
 const selected=selectMiniGameV21(record);
 const played=entry.choice?
  runSelectedEncounterResearchV21(record,selected,entry.choice,env):null;
 if(entry.choice&&played?.status!=="ready")throw new Error(entry.name+" "+JSON.stringify(played));
 console.log(JSON.stringify({
  case:entry.name,
  source:{author:record.source.author,work:record.source.work,
   review:record.source.reviewState},
  selection:{status:selected.status,selected_game_id:selected.selected_game_id,
   eligible:selected.eligible_games.map(x=>x.id),
   rejected:selected.rejected_games.map(x=>({id:x.id,reason:x.reason})),
   implementation:selected.selected_game?.implementationStatus??null,
   productionPlayable:false,no_fit:selected.no_fit_status},
  interaction:selected.canonical_choice_contract?.kind??null,
  agencyStages:selected.canonical_choice_contract?.stages??null,
  handoff:played?.status??"no_fit",
  underlyingMeaning:played?.meaning?.meaning?.kind??null,
  emotion:played?.emotion?.strategy??null,
  wordCount:played?.expression?.wordCount??null,
  sourceWarrant:played?.expression?.source_warrant??null,
  learningText:played?.expression?.sections?.map(x=>x.text)??[],
  public:false
 }));
}
