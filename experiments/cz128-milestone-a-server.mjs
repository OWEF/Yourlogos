/**
 * CZ-128 Milestone A: four-game, loopback-only research service.
 * The content/meaning/emotion/expression modules from accepted PR #191 remain
 * unchanged. This is a versioned successor of ONE existing peer selector.
 * Run: node experiments/cz128-milestone-a-server.mjs
 */
import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {verifyPinnedEngine,ENGINE_SHA} from "./cz128-research-server.mjs";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {authoritativeContextForRecord,graphPathsFromContext}
 from "../philosophy-engine/content/content-capabilities-v211.js";
import {GAME_IDS,canPublishEncounterV21} from "../philosophy-engine/content/content-contract-v21.js";
import {selectMiniGameV22,runSelectedEncounterResearchV22,
 SELECTION_VERSION,SIX_PEER_GAMES} from "./cz128-mini-game-selection-v22.mjs";

export const MILESTONE_A_VERSION="research-four-game-shell/1.0.0";
const dir=path.dirname(fileURLToPath(import.meta.url));
const researchEnv=Object.freeze({isolated:true,publicVisibility:false,provisionalDisclosure:true});
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const known=x=>typeof x==="string"&&GAME_IDS.includes(x);
const frozen=x=>JSON.parse(JSON.stringify(x));
const fail=(status,reason)=>({status,reason,publicationAllowed:false});
const staticFiles=Object.freeze({
 "/":"cz128-milestone-a.html",
 "/cz128-milestone-a.css":"cz128-milestone-a.css",
 "/cz128-milestone-a-ui.js":"cz128-milestone-a-ui.js"
});
const mimeFor=x=>x.endsWith(".css")?"text/css; charset=utf-8":
 x.endsWith(".js")?"text/javascript; charset=utf-8":"text/html; charset=utf-8";

export function milestoneACatalogue(){
 const other=Object.freeze([semanticCases.money,semanticCases.workshop].map(ctx=>{
  const out=researchContentFromTrustedContextV211(ctx);
  if(out.status!=="ready")throw Error("Accepted research source intake unavailable.");
  return out.record;
 }));
 const records=[DILLARD_V21,KIERKEGAARD_V21,...other,HEGEL_NO_FIT_V21];
 const ids=new Set(records.map(r=>r.id));
 if(ids.size!==records.length)throw Error("Duplicate content identifier.");
 return new Map(records.map(r=>[r.id,r]));
}
function viewRecord(r){
 return {id:r.id,versionHash:r.versionHash,route:r.route,
  source:{author:r.source.author,work:r.source.work,quote:r.source.quote,
   locator:r.source.locator,reviewState:r.source.reviewState},
  dilemma:r.dilemma??null,accessibleInsight:r.argument?.accessibleInsight??null,
  uncertaintyLimit:r.argument?.uncertaintyLimit??null,publicationAllowed:false};
}
/** Source-authorized labels for presentation ONLY: never generate a new route. */
function stagePresentation(r){
 const context=authoritativeContextForRecord(r);
 if(context?.mechanism!=="decision_map")return null;
 const paths=graphPathsFromContext(context);
 if(!Array.isArray(paths))return null;
 return {routes:paths.map(steps=>({
  path:steps.map(s=>s.id),
  stages:steps.map((s,i)=>({
   id:s.id,label:s.label,role:i===1?"AUTHORED_DEVELOPMENT":"USER_DECISION",
   hypothetical:i===1
  }))
 }))};
}
function selectionResult(byId,recordId,preferredGameId=null){
 const record=byId.get(recordId);
 if(!record)return fail("needs_source_review","Unknown source record.");
 const selection=selectMiniGameV22(record,{mode:"prototype",preferredGameId});
 const available=selection.status==="research_selected"&&
  ["trade_off","decision_map","token_studio","swipe_decision"].includes(selection.selected_game_id)&&
  selection.selected_game?.browserPrototypeAvailable===true;
 return {status:selection.status,record:viewRecord(record),selection,
  presentation:available?stagePresentation(record):null,
  adapter:{available,gameId:available?selection.selected_game_id:null,
   reason:available?"Source and canonical game contract admitted for isolated browser play.":
    selection.fallback_reason||selection.no_fit_status||"No source-supported browser game."},
  publicationAllowed:canPublishEncounterV21(record)};
}
async function jsonRequest(req){
 if(req.headers["content-type"]?.split(";")[0].trim()!=="application/json")
  throw Error("JSON requests only.");
 let size=0,data="";
 for await(const part of req){
  size+=part.length;
  if(size>32768)throw Error("Request too large.");
  data+=part.toString("utf8");
 }
 const obj=JSON.parse(data);
 if(!isObj(obj))throw Error("Request must be an object.");
 return obj;
}
const headers=Object.freeze({"cache-control":"no-store","x-content-type-options":"nosniff"});
function respond(res,code,data){
 res.writeHead(code,{"content-type":"application/json; charset=utf-8",...headers});
 res.end(JSON.stringify(data));
}
export async function createMilestoneAServer({port=0}={}){
 if(!Number.isSafeInteger(port)||port<0||port>65535)throw Error("Invalid port");
 const verification=verifyPinnedEngine();
 if(verification.acceptedEngineSha!==ENGINE_SHA)throw Error("Accepted engine mismatch");
 if(SIX_PEER_GAMES.filter(g=>g.browserPrototypeAvailable).length!==4||
    SIX_PEER_GAMES.some(g=>g.productionPlayable))
  throw Error("Milestone A registry must have four isolated peers and no production play.");
 const records=milestoneACatalogue();
 const assets=Object.fromEntries(Object.entries(staticFiles).map(([url,file])=>
  [url,readFileSync(path.join(dir,file))]));
 const server=createServer(async(req,res)=>{
  const origin="http://127.0.0.1:"+server.address().port;
  const url=new URL(req.url||"/",origin);
  if(req.headers.host!=="127.0.0.1:"+server.address().port)
   return respond(res,403,fail("forbidden","Loopback host only"));
  if(req.headers.origin&&req.headers.origin!==origin)
   return respond(res,403,fail("forbidden","Cross-origin request denied"));
  res.setHeader("content-security-policy",
   "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'");
  res.setHeader("referrer-policy","no-referrer");
  res.setHeader("x-frame-options","DENY");
  try{
   if(req.method==="GET"&&Object.hasOwn(assets,url.pathname)){
    res.writeHead(200,{"content-type":mimeFor(url.pathname),...headers});
    return res.end(assets[url.pathname]);
   }
   if(req.method==="GET"&&url.pathname==="/api/research/catalogue"){
    return respond(res,200,{status:"ready",version:MILESTONE_A_VERSION,
     engineSha:ENGINE_SHA,selectorVersion:SELECTION_VERSION,
     records:[...records.values()].map(viewRecord),
     games:SIX_PEER_GAMES.map(g=>({id:g.id,label:g.label,
      browserPrototypeAvailable:g.browserPrototypeAvailable,productionPlayable:false})),
     publicationAllowed:false});
   }
   if(req.method==="POST"&&url.pathname.startsWith("/api/research/")){
    if(req.headers.origin!==origin)
     return respond(res,403,fail("forbidden","Same-origin POST required"));
    const data=await jsonRequest(req);
    if(url.pathname==="/api/research/select"){
     if(typeof data.recordId!=="string"||
       !(data.preferredGameId===undefined||data.preferredGameId===null||known(data.preferredGameId))||
       Object.keys(data).some(k=>!["recordId","preferredGameId"].includes(k)))
      return respond(res,400,fail("invalid_request","Use only a known source and optional QA game preference."));
     return respond(res,200,selectionResult(records,data.recordId,data.preferredGameId??null));
    }
    if(url.pathname==="/api/research/run"){
     const keys=["recordId","versionHash","choice","preferredGameId"];
     if(typeof data.recordId!=="string"||typeof data.versionHash!=="string"||
        !isObj(data.choice)||Object.keys(data).some(k=>!keys.includes(k))||
        !(data.preferredGameId===undefined||data.preferredGameId===null||known(data.preferredGameId)))
      return respond(res,400,fail("invalid_request","Malformed choice envelope."));
     const record=records.get(data.recordId);
     if(!record||record.versionHash!==data.versionHash)
      return respond(res,422,fail("needs_source_review","Source identity/version mismatch."));
     const candidate=selectionResult(records,data.recordId,data.preferredGameId??null);
     if(!candidate.adapter?.available||candidate.selection.selected_game_id!==data.choice.gameId)
      return respond(res,422,fail("rejected_selection","Game not selected or unavailable for source."));
     const result=runSelectedEncounterResearchV22(record,candidate.selection,data.choice,researchEnv);
     if(result.status!=="ready")
      return respond(res,422,fail(result.status,result.reason));
     return respond(res,200,{status:"ready",version:MILESTONE_A_VERSION,
      engineSha:ENGINE_SHA,selectorVersion:SELECTION_VERSION,
      selectedGameId:candidate.selection.selected_game_id,sourceVersionHash:record.versionHash,
      result:frozen(result),publicationAllowed:false});
    }
   }
   return respond(res,404,fail("not_found","No research endpoint."));
  }catch(error){return respond(res,400,fail("invalid_request",String(error.message)));}
 });
 await new Promise((resolve,reject)=>{
  server.once("error",reject);server.listen(port,"127.0.0.1",resolve);
 });
 return {server,url:"http://127.0.0.1:"+server.address().port,verification,
  close:()=>new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=await createMilestoneAServer({port:Number(process.env.CZ128_PORT||0)});
 console.log(JSON.stringify({status:"research_only",url:app.url,
  version:MILESTONE_A_VERSION,engineSha:ENGINE_SHA,publicationAllowed:false,
  warning:"No public preview, no persistence, no paid services."}));
}