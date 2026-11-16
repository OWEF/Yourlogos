/**
 * CZ-134 B2.3: isolated localhost six-peer browser research server.
 * No real users, cookies, storage, model calls or production DB writes.
 */
import http from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {DILLARD_V21,KIERKEGAARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {GAME_IDS} from "../philosophy-engine/content/content-contract-v21.js";
import {B23_SOURCE_CONTRACTS,selectMiniGameB23}
 from "./yl-b23-founder-six-peer.mjs";
import {runSelectedEncounterB24}
 from "./yl-b24-encounter.mjs";
export const B24_BROWSER_VERSION="coherent-source-eligible-encounter/2.4.0";
const descriptors=[
 {key:"dillard",source:DILLARD_V21,kind:"allocation",title:"Dillard · Repeated days",
  intro:"Try an imagined schedule across five evenings. Nothing here reports your real habits."},
 {key:"kierkegaard_map",source:KIERKEGAARD_V21,kind:"branch",title:"Kierkegaard · A job decision",
  intro:"An imagined decision is followed by one authored fictional development and your later response."},
 {key:"thoreau_balance",source:B23_SOURCE_CONTRACTS[0],kind:"balance",title:"Thoreau · A life-hours exchange",
  intro:"Eight invented discretionary hours. No real wage, purchase or moral ranking is inferred."},
 {key:"kierkegaard_future",source:B23_SOURCE_CONTRACTS[1],kind:"future",title:"Kierkegaard · Exploring the unknown",
  intro:"Explore a source-authored fictional possibility; you cannot cause, know or predict it."}
];
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const fail=(code,reason)=>({status:"blocked",code,reason,publicationAllowed:false});
const ref=d=>d.kind==="balance"||d.kind==="future"?d.source.recordId:d.source;
function authoredRoutes(){
 const model=semanticCases.kierkegaard.model,first=model.nodes[model.start];
 return KIERKEGAARD_V21.scenario.constraints.routes.map(route=>{
  const [startId,sceneId,responseId]=route.path;
  const firstOption=first.options.find(o=>o.id===startId);
  const scenes=model.nodes[firstOption.next].options;
  const chosenScene=scenes.find(o=>o.id===sceneId);
  const replyOptions=model.nodes[chosenScene.next].options;
  return {startId,sceneId,responseId,startLabel:firstOption.label,
   sceneLabel:chosenScene.label,responseLabel:replyOptions.find(o=>o.id===responseId).label,
   authoredText:[...route.authoredDevelopments],
   sceneRole:"AUTHORED_DEVELOPMENT",readerAction:"EXPLORE_ONLY",
   causedByReader:false,predictedRealFuture:false};
 });
}
export function browserCatalogueB24(){
 return descriptors.map(d=>{
  const source=d.source.source,inputs=d.source.scenario;
  const peers=GAME_IDS.map(id=>{
   const selection=selectMiniGameB23(ref(d),{preferredGameId:id});
   return {id,eligible:selection.status==="research_selected"&&
    selection.selected_game_id===id};
  });
  return {key:d.key,kind:d.kind,title:d.title,intro:d.intro,author:source.author,
   work:source.work,quote:source.quote,
   sourceUrl:source.referenceUrl,
   sourceLocator:source.locator,
   sourceReview:"FOUNDER_PROVISIONAL_NONPUBLIC",
   games:peers,choices:d.kind==="allocation"||d.kind==="balance"?
    (d.kind==="balance"?[
      {id:"paid_optional_furnishing",label:"Extra paid work (imagined)"},
      {id:"hours_kept",label:"Hours kept for other uses"}]:inputs.choices):null,
   capacity:d.kind==="allocation"?inputs.constraints.capacity:
    d.kind==="balance"?8:null,
   repetitions:d.kind==="allocation"?inputs.constraints.repetitions:null,
   routes:d.kind==="branch"||d.kind==="future"?authoredRoutes():null};
 });
}
const files={"/":"yl-b24-encounter.html","/yl-b24-encounter.html":"yl-b24-encounter.html",
 "/yl-b24-encounter.css":"yl-b24-encounter.css",
 "/yl-b24-encounter.js":"yl-b24-encounter.js",
 "/philosopher-portraits.js":"../philosopher-portraits.js",
 "/philosopher-featured-art.js":"../philosopher-featured-art.js"};
function respond(res,code,payload,extra={}){
 res.writeHead(code,{"content-type":"application/json; charset=utf-8",
  "cache-control":"no-store","x-content-type-options":"nosniff",
  "content-security-policy":"default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'",
  ...extra});
 res.end(JSON.stringify(payload));
}
export async function createB24ResearchServer({port=0}={}){
 if(!Number.isSafeInteger(port)||port<0||port>65535)throw Error("Invalid port");
 const server=http.createServer(async(req,res)=>{
  const path=(req.url||"").split("?")[0];
  if(req.method==="GET"&&path==="/api/catalogue")
   return respond(res,200,{version:B24_BROWSER_VERSION,
    peerIds:[...GAME_IDS],sources:browserCatalogueB24(),productionAllowed:false,
    sourceAuthority:"founder_research_only_not_independently_scholarly_approved"});
  if(req.method==="POST"&&path==="/api/run"){
   try{
    let body="",bytes=0;
    for await(const piece of req){
     bytes+=piece.length;
     if(bytes>12000)return respond(res,413,fail("oversized","Request too large"));
     body+=piece;
    }
    const input=JSON.parse(body);
    if(!isObj(input)||Object.keys(input).sort().join(",")!=="gameId,input,recordKey"||
       typeof input.recordKey!=="string"||typeof input.gameId!=="string"||
       !isObj(input.input))
     return respond(res,422,fail("invalid_payload","Typed record, peer and input required"));
    const d=descriptors.find(x=>x.key===input.recordKey);
    if(!d)return respond(res,422,fail("unknown_source","Source not in isolated research catalogue"));
    const sel=selectMiniGameB23(ref(d),{preferredGameId:input.gameId});
    if(sel.status!=="research_selected")
     return respond(res,422,fail("no_fit","This source does not authorize the selected game"));
    const result=runSelectedEncounterB24(ref(d),sel,input.input);
    if(result.status!=="ready")return respond(res,422,result);
    return respond(res,200,{status:"ready",selected_game_id:result.selected_game_id,
     sourceReview:result.sourceReview,expressionVerification:result.expressionVerification||null,
     expressionVersion:result.expression.version,
     emotionStrategy:result.expression.brief?.strategy||"neutral",
     sections:result.expression.sections,
     wordCount:result.expression.wordCount,
     sectionWordCounts:result.expression.sectionWordCounts||null,
     canonical_choice:result.canonical_choice,
     provenance:result.provenance||null,
     publicationAllowed:false,productionPlayable:false,
     accountSaved:false});
   }catch(e){return respond(res,400,fail("bad_request","Malformed research request"));}
  }
  if(req.method==="GET"&&Object.hasOwn(files,path)){
   const name=files[path],pathOnDisk=fileURLToPath(new URL("./"+name,import.meta.url));
   try{
    const content=await readFile(pathOnDisk);
    const type=name.endsWith(".html")?"text/html":
     name.endsWith(".css")?"text/css":"text/javascript";
    res.writeHead(200,{"content-type":type+"; charset=utf-8","cache-control":"no-store",
     "x-content-type-options":"nosniff",
     "content-security-policy":"default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'"});
    return res.end(content);
   }catch{return respond(res,404,fail("missing_file","Research file unavailable"));}
  }
  return respond(res,404,fail("not_found","No route"));
 });
 await new Promise((resolve,reject)=>server.once("error",reject).listen(port,"127.0.0.1",resolve));
 const address=server.address();
 return {url:"http://127.0.0.1:"+address.port,
  close:()=>new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))};
}
