/**
 * CZ-128 — loopback-only research integration bridge. Version verified.
 * Selection, canonical choice validation, Reasoning, Emotion and Expression
 * all execute through the ACCEPTED CZ-131 Node modules, never browser copies.
 * Original PR #182 gameplay UI is obtained by immutable Git blob identity.
 *
 * Run: node experiments/cz128-research-server.mjs
 * First fetch the exact PR #182 Git commit if not in your local Git history.
 */
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {selectMiniGameV21,runSelectedEncounterResearchV21,SELECTION_VERSION,SIX_PEER_GAMES}
 from "../philosophy-engine/content/mini-game-selection-v21.js";
import {canPublishEncounterV21}
 from "../philosophy-engine/content/content-contract-v21.js";

export const INTEGRATION_VERSION="encounter-local-learning/1.0.0";
export const ENGINE_SHA="b18a3e6bcce8acbcf5bbd199d27d36cd390bb1da";
export const SOURCE_UI_SHA="b3b2662ce7034a67a2ef0cf6a7b4d4eb4b13d6a8";
export const SOURCE_UI_GIT_BLOB="90ab4781728947b91dac3a3b7b4a30283ef8ca87";
export const SOURCE_UI_PATH="experiments/encounter-v21-progressive.html";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const git=(...args)=>execFileSync("git",args,{cwd:root,encoding:"utf8",
  maxBuffer:3*1024*1024,stdio:["ignore","pipe","pipe"]}).trim();
const deny=reason=>{throw new Error("CZ-128 refuses unsafe research startup: "+reason);};
const stable=x=>Array.isArray(x)?x.map(stable):object(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const object=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const researchEnv=Object.freeze({isolated:true,publicVisibility:false,provisionalDisclosure:true});
const jsFile=fileURLToPath(new URL("./cz128-browser-integration.js",import.meta.url));
const cssFile=fileURLToPath(new URL("./cz128-research-style.css",import.meta.url));

export function verifyPinnedEngine(){
 try{git("merge-base","--is-ancestor",ENGINE_SHA,"HEAD");}
 catch{deny("exact accepted CZ-131 commit is not an ancestor of this checkout");}
 for(const directory of ["philosophy-engine/content","philosophy-engine/encounter"]){
  if(git("diff","--name-only",ENGINE_SHA,"HEAD","--",directory))
   deny("content or philosophical engine differs from accepted pinned commit");
 }
 for(const file of [
  "philosophy-engine/content/mini-game-selection-v21.js",
  "philosophy-engine/content/content-contract-v21.js",
  "philosophy-engine/content/trusted-editorial-v212.js",
  "philosophy-engine/content/source-grounded-composer-v211.js",
  "philosophy-engine/encounter/semantic-reasoning-v12.js",
  "philosophy-engine/encounter/encounter-v20.js"
 ]){
  if(git("rev-parse",ENGINE_SHA+":"+file)!==git("hash-object",file))
   deny("unreviewed working-tree modification to "+file);
 }
 return {acceptedEngineSha:ENGINE_SHA,selectorVersion:SELECTION_VERSION};
}
export function exactPrototypeHtml(){
 let buffer;
 try{buffer=execFileSync("git",["show",SOURCE_UI_SHA+":"+SOURCE_UI_PATH],
  {cwd:root,maxBuffer:2*1024*1024,stdio:["ignore","pipe","pipe"]});}
 catch{deny("missing audited PR #182 Git object; fetch commit "+SOURCE_UI_SHA);}
 const hash=createHash("sha1").update("blob "+buffer.length+"\0").update(buffer).digest("hex");
 if(hash!==SOURCE_UI_GIT_BLOB)deny("original PR #182 HTML blob hash mismatch");
 const content=buffer.toString("utf8");
 if(!content.includes('id="choose-token"')||
    !content.includes('id="development-explorer"')||
    !content.includes('id="reveal-next"')||
    !content.includes("window.__YL_CZ140_TEST"))
  deny("pinned PR #182 missing required gameplay and agency controls");
 return content;
}
export function integratedHtml(){
 const original=exactPrototypeHtml();
 const chooser='<section id="cz128-chooser" aria-label="Automatically selected philosophical Encounter">'+
 '<label for="cz128-source">Choose a philosophical passage</label>'+
 '<select id="cz128-source" disabled><option>Checking accepted source records…</option></select>'+
 '<p id="cz128-status" role="status" aria-live="polite">Verifying the six-peer research selector…</p>'+
 '<p id="cz128-selection-summary"></p>'+
 '<details id="cz128-peer-trace"><summary>Why this game? See all six peer decisions</summary>'+
 '<div id="cz128-peer-reasons" role="list"></div></details>'+
 '<p id="cz128-no-fit" class="hidden" role="status"></p></section>';
 const remember='<section id="cz128-remember" class="hidden" aria-label="Remember the argument">'+
 '<p class="eyebrow">REMEMBER · YOUR OWN WORDS</p><h3>What became clearer?</h3>'+
 '<p>Try recalling the argument without looking back. These words remain only in this browser tab; no responses are sent, saved or scored.</p>'+
 '<label for="cz128-recall-choice">What did your imagined choice change?</label>'+
 '<textarea id="cz128-recall-choice" autocomplete="off"></textarea>'+
 '<label for="cz128-recall-thesis">What is the philosopher’s central argument?</label>'+
 '<textarea id="cz128-recall-thesis" autocomplete="off"></textarea>'+
 '<label for="cz128-recall-limits">What remains hypothetical or unknown?</label>'+
 '<textarea id="cz128-recall-limits" autocomplete="off"></textarea>'+
 '<p class="quiet">For research with five actual readers, gather responses and consent outside this page. No automatic comprehension score is inferred.</p></section>';
 if(!original.includes('<nav class="game-picker"')||
    !original.includes('<button id="try-again" class="cta"')||
    !original.includes("</body></html>"))deny("unexpected original HTML insertion points");
 return original.replace("</head>",'<link rel="stylesheet" href="/cz128-research-style.css"></head>')
  .replace('<nav class="game-picker"',
    chooser+'<nav class="game-picker" aria-hidden="true" style="display:none"')
  .replace('<button id="try-again" class="cta"',remember+'<button id="try-again" class="cta"')
  .replace('Two hand-picked research scenarios · the universal six-game selector is not implemented.',
   'One version-verified six-peer selector chooses a source-compatible game. Only two isolated browser games are currently playable.')
  .replace("Why isn't Future Reveal playable yet?",
   'Which games are actually available?')
  .replace('Neither research record includes a source-authorized sequence of timed milestones. Inventing outcomes to fill a timeline would distort the philosophy. Future Reveal remains a separate six-peer candidate with an explicit <strong>no-fit for this pilot</strong>, not a hidden third game.',
   'The six-peer selector evaluates every game and shows source-specific reasons above. Token Studio and Swipe Decision have isolated browser prototypes; Trade-Off and Decision Map are headless research adapters; Balance of Values and Future Reveal are not implemented. No game is production-playable.')
  .replace("Encounter v2.1 · local research prototype · no tracking, no external requests",
    "Encounter v2.1 · localhost research · no tracking or external services")
  .replace("</body></html>",'<script src="/cz128-browser-integration.js"></script>\n</body></html>');
}
function recordCatalogue(){
 const others=[semanticCases.money,semanticCases.workshop].map(ctx=>{
  const result=researchContentFromTrustedContextV211(ctx);
  if(result.status!=="ready")deny("accepted source model intake failed");
  return result.record;
 });
 const all=[DILLARD_V21,KIERKEGAARD_V21,...others,HEGEL_NO_FIT_V21];
 const map=new Map(all.map(record=>[record.id,record]));
 if(map.size!==all.length)deny("duplicate canonical source identifiers");
 return map;
}
function publicRecord(r){
 return {id:r.id,versionHash:r.versionHash,route:r.route,
  source:{author:r.source.author,work:r.source.work,quote:r.source.quote,
   locator:r.source.locator,reviewState:r.source.reviewState},
  dilemma:r.dilemma??null,
  accessibleInsight:r.argument?.accessibleInsight??null,
  uncertaintyLimit:r.argument?.uncertaintyLimit??null,
  scenario:r.scenario?{choices:r.scenario.choices,variables:r.scenario.variables,
   constraints:r.scenario.constraints}:null};
}
/** Source-to-widget adapter compatibility, NOT philosopher-to-game selection. */
function compatibleWidget(r,s){
 if(s.status!=="research_selected"||s.selected_game?.browserPrototypeAvailable!==true)
  return {available:false,reason:s.fallback_reason||
   "No existing browser game supports this admitted philosophical scenario."};
 const c=s.canonical_choice_contract;
 if(s.selected_game_id==="token_studio"){
  const original=DILLARD_V21;
  const sourceMatches=r.id===original.id&&r.versionHash===original.versionHash;
  const schemaMatches=c?.budget?.capacity===6&&c?.budget?.unitHours===0.5&&
   c?.budget?.repetitions===5&&same(c?.budget?.costs,[1,1,1])&&
   same(c?.choices?.map(x=>({id:x.id,label:x.label})),original.scenario.choices);
  return sourceMatches&&schemaMatches?
   {available:true,widgetId:"token",reason:"The existing six-token UI exactly matches the approved source allocation contract."}:
   {available:false,reason:"The current Token Studio UI cannot represent these canonical labels, slot costs or source identity."};
 }
 if(s.selected_game_id==="swipe_decision"){
  const original=KIERKEGAARD_V21;
  const sourceMatches=r.id===original.id&&r.versionHash===original.versionHash;
  const schemaMatches=same(r.scenario.choices,original.scenario.choices)&&
   same(c?.sourceAuthoredRoutes,original.scenario.constraints.routes)&&
   c?.sourceAuthoredRoutes?.length===8;
  return sourceMatches&&schemaMatches?
   {available:true,widgetId:"swipe",reason:"The existing three-stage UI matches the complete approved source-authored decision graph."}:
   {available:false,reason:"The existing Swipe UI does not match the source-authored graph or agency boundary."};
 }
 return {available:false,reason:"This selected research game has no browser adapter."};
}
function choose(byId,id){
 const r=byId.get(id);
 if(!r)return {status:"needs_source_review",reason:"Unknown or unadmitted research record."};
 const selection=selectMiniGameV21(r,{mode:"prototype"});
 return {status:selection.status,record:publicRecord(r),selection,
  adapter:{...compatibleWidget(r,selection),productionPlayable:false},
  publicationAllowed:canPublishEncounterV21(r)};
}
async function readBody(req){
 if(req.headers["content-type"]?.split(";")[0].trim()!=="application/json")
  throw Error("JSON requests only");
 let length=0,raw="";
 for await(const chunk of req){
  length+=chunk.length;
  if(length>32768)throw Error("Request exceeds 32 KiB");
  raw+=chunk.toString("utf8");
 }
 const data=JSON.parse(raw);
 if(!object(data))throw Error("A JSON object is required");
 return data;
}
const nocache={"cache-control":"no-store","x-content-type-options":"nosniff"};
const send=(res,status,payload)=>{
 res.writeHead(status,{"content-type":"application/json; charset=utf-8",...nocache});
 res.end(JSON.stringify(payload));
};
export async function createIntegratedResearchServer({port=0}={}){
 if(!Number.isSafeInteger(port)||port<0||port>65535)
  throw new TypeError("Invalid loopback port");
 const verification=verifyPinnedEngine();
 if(SIX_PEER_GAMES.some(g=>g.productionPlayable))
  deny("research selector falsely declares a production-playable game");
 const html=integratedHtml(),byId=recordCatalogue();
 const js=readFileSync(jsFile),css=readFileSync(cssFile);
 const server=createServer(async(req,res)=>{
  const request=new URL(req.url||"/","http://127.0.0.1");
  const origin="http://127.0.0.1:"+server.address().port;
  if(req.headers.host!=="127.0.0.1:"+server.address().port)
   return send(res,403,{status:"forbidden",reason:"Loopback-only host"});
  if(req.headers.origin&&req.headers.origin!==origin)
   return send(res,403,{status:"forbidden",reason:"Cross-origin browser access denied"});
  res.setHeader("referrer-policy","no-referrer");
  res.setHeader("x-frame-options","DENY");
  res.setHeader("content-security-policy",
   "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  try{
   if(req.method==="GET"&&request.pathname==="/"){
    res.writeHead(200,{"content-type":"text/html; charset=utf-8",...nocache});
    return res.end(html);
   }
   if(req.method==="GET"&&request.pathname==="/cz128-browser-integration.js"){
    res.writeHead(200,{"content-type":"text/javascript; charset=utf-8",...nocache});
    return res.end(js);
   }
   if(req.method==="GET"&&request.pathname==="/cz128-research-style.css"){
    res.writeHead(200,{"content-type":"text/css; charset=utf-8",...nocache});
    return res.end(css);
   }
   if(req.method==="GET"&&request.pathname==="/api/research/catalogue"){
    return send(res,200,{status:"ready",integrationVersion:INTEGRATION_VERSION,
     engineSha:ENGINE_SHA,sourceUiSha:SOURCE_UI_SHA,selectorVersion:SELECTION_VERSION,
     records:[...byId.values()].map(publicRecord),
     games:SIX_PEER_GAMES.map(g=>({id:g.id,label:g.label,
      implementationStatus:g.implementationStatus,
      browserPrototypeAvailable:g.browserPrototypeAvailable,
      productionPlayable:false})),publicationAllowed:false});
   }
   if(req.method==="POST"&&request.pathname.startsWith("/api/research/")){
    if(req.headers.origin!==origin)
     return send(res,403,{status:"forbidden",reason:"Same-origin browser POST required"});
    const input=await readBody(req);
    if(request.pathname==="/api/research/select"){
     if(typeof input.recordId!=="string"||
        Object.keys(input).some(k=>k!=="recordId"))
      return send(res,400,{status:"invalid_request",reason:"Choose only an admitted source ID"});
     return send(res,200,choose(byId,input.recordId));
    }
    if(request.pathname==="/api/research/run"){
     if(typeof input.recordId!=="string"||typeof input.versionHash!=="string"||
       !object(input.choice)||Object.keys(input).some(k=>
        !["recordId","versionHash","choice"].includes(k)))
      return send(res,400,{status:"rejected_choice",reason:"Malformed canonical choice"});
     const record=byId.get(input.recordId);
     if(!record)return send(res,422,{status:"needs_source_review",reason:"Unknown research source"});
     const current=choose(byId,input.recordId);
     if(!current.adapter.available||current.selection.status!=="research_selected"||
        input.versionHash!==record.versionHash)
      return send(res,422,{status:"rejected_selection",reason:"Selection no longer matches an approved, playable research adapter"});
     const result=runSelectedEncounterResearchV21(record,current.selection,input.choice,researchEnv);
     if(result.status!=="ready")
      return send(res,422,{status:result.status,reason:result.reason,
       publicationAllowed:false});
     return send(res,200,{status:"ready",version:INTEGRATION_VERSION,
      engineSha:ENGINE_SHA,selectorVersion:SELECTION_VERSION,
      sourceVersionHash:record.versionHash,
      selectedGameId:current.selection.selected_game_id,
      result,publicationAllowed:false});
    }
    return send(res,404,{status:"not_found"});
   }
   return send(res,404,{status:"not_found"});
  }catch(error){
   return send(res,400,{status:"invalid_request",reason:error.message,
    publicationAllowed:false});
  }
 });
 await new Promise((resolve,reject)=>{
  server.once("error",reject);server.listen(port,"127.0.0.1",resolve);
 });
 return {server,url:"http://127.0.0.1:"+server.address().port,
  verification,recordCount:byId.size,
  close:()=>new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes("--build")){
  verifyPinnedEngine();
  const file=path.resolve(root,"artifacts","cz128-integrated-learning-local.html");
  mkdirSync(path.dirname(file),{recursive:true});
  writeFileSync(file,integratedHtml());
  console.log(JSON.stringify({status:"built",file,engineSha:ENGINE_SHA,sourceUiSha:SOURCE_UI_SHA,
   requiresLocalResearchServer:true}));
 }else{
  const app=await createIntegratedResearchServer({port:Number(process.env.CZ128_PORT||0)});
  console.log(JSON.stringify({status:"local_research_ready",url:app.url,
   acceptedEngineSha:ENGINE_SHA,sourceUiSha:SOURCE_UI_SHA,
   publicationAllowed:false,records:app.recordCount,
   note:"Open the loopback URL in this computer's browser; no public hosting or live product"}));
 }
}
