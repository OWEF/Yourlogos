/**
 * CZ-128 B2.5 isolated consumer Encounter server.
 * One server-side source-aware six-peer selection. The normal journey picks
 * the first eligible game automatically; explicit peer choice exists ONLY
 * in the separate ?qa=1 inspection surface.
 *
 * No public route, signup, storage, DB, paid service or external model.
 */
import http from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {DILLARD_V21,KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases}
 from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {GAME_IDS}
 from "../philosophy-engine/content/content-contract-v21.js";
import {B23_SOURCE_CONTRACTS}
 from "./yl-b23-founder-six-peer.mjs";
import {B25_BALANCE_CONTRACTS}
 from "./yl-b25-authored-scenarios.mjs";
import {selectMiniGameB25,runSelectedEncounterB25}
 from "./yl-b25-encounter.mjs";
export const B25_BROWSER_VERSION="source-driven-encounter-preview/2.5.0";
const items=[
 {key:"dillard",source:DILLARD_V21,kind:"allocation",
  title:"How your days add up",
  intro:"Three imagined uses of an evening, repeated across a few days.",
  sourceMode:"legacy"},
 {key:"kierkegaard_map",source:KIERKEGAARD_V21,kind:"branch",
  title:"A choice without certainty",
  intro:"Choose what to do before the whole story becomes clear.",
  sourceMode:"legacy"},
 {key:"thoreau_balance",source:B25_BALANCE_CONTRACTS[0],kind:"balance",
  title:"What does a price cost in life?",
  intro:B25_BALANCE_CONTRACTS[0].editorial.intro,sourceMode:"b25"},
 {key:"kierkegaard_future",source:B23_SOURCE_CONTRACTS[1],kind:"future",
  title:"What can the future really tell us?",
  intro:"The next event is a fictional possibility—not your doing.",
  sourceMode:"b23"},
 {key:"thoreau_weekend",source:B25_BALANCE_CONTRACTS[1],kind:"balance",
  title:"The price of a weekend",
  intro:B25_BALANCE_CONTRACTS[1].editorial.intro,sourceMode:"b25"},
 {key:"dillard_pattern",source:B25_BALANCE_CONTRACTS[2],kind:"balance",
  title:"When one evening becomes four",
  intro:B25_BALANCE_CONTRACTS[2].editorial.intro,sourceMode:"b25"}
];
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const blocked=(code,reason)=>({status:"blocked",code,reason,
  publicationAllowed:false,productionPlayable:false});
const sourceRef=item=>item.sourceMode==="legacy"?item.source:item.source.recordId;
function authoredRoutes(){
 const model=semanticCases.kierkegaard.model,start=model.nodes[model.start];
 return KIERKEGAARD_V21.scenario.constraints.routes.map(route=>{
  const [startId,sceneId,responseId]=route.path;
  const s=start.options.find(o=>o.id===startId);
  const scene=model.nodes[s.next].options.find(o=>o.id===sceneId);
  const response=model.nodes[scene.next].options.find(o=>o.id===responseId);
  return {startId,sceneId,responseId,startLabel:s.label,
   sceneLabel:scene.label,responseLabel:response.label,
   authoredText:[...route.authoredDevelopments],
   causedByReader:false,predictedRealFuture:false,readerAction:"EXPLORE_ONLY"};
 });
}
export function catalogueB25(){
 return items.map(item=>{
  const source=item.sourceMode==="legacy"?
    item.source:item.source.source;
  const selection=selectMiniGameB25(sourceRef(item));
  const rows=selection.selection_trace?.rows||[];
  const balance=item.kind==="balance";
  const choices=balance?item.source.context.model.choices.map((c,i)=>({
   id:c.id,label:item.source.editorial.useLabels[i]
  })):item.kind==="allocation"?item.source.scenario.choices:null;
  return {key:item.key,kind:item.kind,title:item.title,intro:item.intro,
   author:source.author,quote:source.quote,work:source.work,
   sourceUrl:source.referenceUrl,
   sourceReview:"founder_provisional_unverified_for_publication",
   defaultGameId:selection.status==="research_selected"?
    selection.selected_game_id:null,
   games:GAME_IDS.map(id=>({id,eligible:rows.find(x=>x.id===id)?.eligible===true})),
   capacity:balance?item.source.scenario.capacity:
    item.kind==="allocation"?item.source.scenario.constraints.capacity:null,
   unitName:balance?item.source.scenario.unitName:null,
   repetitions:balance?item.source.scenario.repetitions:
    item.kind==="allocation"?item.source.scenario.constraints.repetitions:null,
   lenses:balance?item.source.editorial.lenses.map(l=>({id:l.id,label:l.label})):null,
   marginalPrompt:balance?item.source.editorial.prompt:null,
   choices,routes:["future","branch"].includes(item.kind)?authoredRoutes():null,
   productDataAuthority:"single_source_selection_only",
   publicationAllowed:false};
 });
}
const fileMap={
 "/":"yl-b25-encounter.html",
 "/yl-b25-encounter.html":"yl-b25-encounter.html",
 "/yl-b25-encounter.css":"yl-b25-encounter.css",
 "/yl-b25-encounter.js":"yl-b25-encounter.js",
 "/philosopher-portraits.js":"../philosopher-portraits.js",
 "/philosopher-featured-art.js":"../philosopher-featured-art.js"
};
function response(res,status,data){
 res.writeHead(status,{"content-type":"application/json; charset=utf-8",
  "cache-control":"no-store","x-content-type-options":"nosniff",
  "content-security-policy":"default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'"});
 res.end(JSON.stringify(data));
}
export async function createB25PreviewServer({port=0}={}){
 if(!Number.isSafeInteger(port)||port<0||port>65535)throw Error("Invalid localhost port");
 const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url||"/","http://localhost").pathname;
  if(req.method==="GET"&&path==="/api/catalogue")return response(res,200,{
    version:B25_BROWSER_VERSION,peerIds:[...GAME_IDS],
    sources:catalogueB25(),productionAllowed:false,
    normalSelectionMode:"automatic",manualSelectionMode:"qa_only"});
  if(req.method==="POST"&&path==="/api/run"){
   try{
    let payload="",n=0;
    for await(const chunk of req){
     n+=chunk.length;
     if(n>12000)return response(res,413,blocked("too_large","Encounter request too large"));
     payload+=chunk;
    }
    const input=JSON.parse(payload);
    if(!isObj(input)||!["gameId,input,qaMode,recordKey","gameId,input,recordKey"].includes(
      Object.keys(input).sort().join(","))||
      typeof input.recordKey!=="string"||typeof input.gameId!=="string"||
      !isObj(input.input)||![true,false,undefined].includes(input.qaMode))
     return response(res,422,blocked("untyped","Unsupported request shape"));
    const item=items.find(x=>x.key===input.recordKey);
    if(!item)return response(res,422,blocked("unknown_source","Unknown source record"));
    const auto=selectMiniGameB25(sourceRef(item));
    if(auto.status!=="research_selected")
     return response(res,422,blocked("no_fit","The source does not warrant a game"));
    if(input.qaMode!==true&&input.gameId!==auto.selected_game_id)
     return response(res,422,blocked("qa_only_manual_selection",
       "The consumer journey uses its single automatically chosen game"));
    const selected=selectMiniGameB25(sourceRef(item),
      {preferredGameId:input.gameId});
    if(selected.status!=="research_selected")
     return response(res,422,blocked("no_fit","This game is incompatible with the source"));
    const result=runSelectedEncounterB25(sourceRef(item),selected,input.input);
    if(result.status!=="ready")return response(res,422,result);
    return response(res,200,{
      status:"ready",selected_game_id:result.selected_game_id,
      expressionVersion:result.expression.version,
      expressionVerification:result.expressionVerification,
      sourceReview:result.sourceReview,
      sections:result.expression.sections,
      wordCount:result.expression.wordCount,
      sectionWordCounts:result.expression.sectionWordCounts||null,
      canonical_choice:result.canonical_choice,
      meaningKind:result.meaning.meaning?.kind||null,
      provenance:result.provenance||null,
      publicationAllowed:false,productionPlayable:false,accountSaved:false
    });
   }catch{return response(res,400,blocked("malformed","Malformed request"));}
  }
  if(req.method==="GET"&&Object.hasOwn(fileMap,path)){
   const file=fileMap[path],filePath=fileURLToPath(new URL("./"+file,import.meta.url));
   try{
    const payload=await readFile(filePath);
    const type=file.endsWith(".html")?"text/html":
     file.endsWith(".css")?"text/css":"text/javascript";
    res.writeHead(200,{"content-type":type+"; charset=utf-8",
     "cache-control":"no-store","x-content-type-options":"nosniff",
     "content-security-policy":"default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'"});
    return res.end(payload);
   }catch{return response(res,404,blocked("missing_file","File unavailable"));}
  }
  return response(res,404,blocked("not_found","No such route"));
 });
 await new Promise((resolve,reject)=>server.once("error",reject).listen(port,"127.0.0.1",resolve));
 return {url:"http://127.0.0.1:"+server.address().port,
  close:()=>new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))};
}
