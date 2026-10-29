import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {handleDiscoverAI, discoverAIEnabled} from "./discover-ai-server.mjs";

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT)||3000;
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".webmanifest":"application/manifest+json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8"};
const blocked=(name)=>name.startsWith(".")||name.includes("secret")||name.includes("server.")||name.includes("package-lock")||name.includes("/scripts/")||name.includes("/supabase/")||name.includes(".md");
// Closed whitelist prevents the artwork cache becoming an open proxy.
// These historical references are editorial, never user-supplied URLs.
const ART_FILES={
 stoicism:"Marcus.aurelius.horse.statue.rome.arp.jpg",
 existentialism:"Caspar David Friedrich - Wanderer above the Sea of Fog.jpeg",
 nihilism:"The Abbey in the Oakwood.jpg",
 skepticism:"The Incredulity of Saint Thomas-Caravaggio (1601-2).jpg",
 daoism:"Xsxlt fankuan.jpg",
 buddhism:"Afghanistan, Gandhara, Hadda, late Kushan Period - Seated Buddha - 1967.39 - Cleveland Museum of Art.jpg"
};
const artCache=new Map(),artInflight=new Map();
async function artwork(id){
 if(artCache.has(id))return artCache.get(id);
 if(artInflight.has(id))return artInflight.get(id);
 const filename=ART_FILES[id];if(!filename)throw new Error("Unknown artwork");
 const pending=(async()=>{
   const url="https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(filename)+"?width=540";
   const response=await fetch(url,{signal:AbortSignal.timeout(10000),headers:{"User-Agent":"YourLogos/1.0 (philosophy educational app)"}});
   if(!response.ok)throw new Error("Upstream art unavailable");
   const mime=(response.headers.get("content-type")||"").split(";")[0].trim();
   if(!["image/jpeg","image/png","image/webp"].includes(mime))throw new Error("Unsupported art format");
   if(Number(response.headers.get("content-length")||0)>1500000)throw new Error("Artwork exceeds cache size");
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length>1500000)throw new Error("Artwork exceeds cache size");
   const result={bytes,mime};
   artCache.set(id,result);return result;
 })();
 artInflight.set(id,pending);
 try{return await pending}finally{artInflight.delete(id)}
}

const STUDIO_REPO="OWEF/Yourlogos";
// The repository is public. Keep its activity outside of Supabase's private planning data.
let studioFeedCache=null,studioFeedAt=0,studioFeedPending=null;
async function getStudioFeed(){
 if(studioFeedCache&&Date.now()-studioFeedAt<300000)return studioFeedCache;
 if(studioFeedPending)return studioFeedPending;
 studioFeedPending=(async()=>{
  const headers={"Accept":"application/vnd.github+json","User-Agent":"YourLogos-Studio/1.0"};
  const get=async(route)=>{
   const resp=await fetch("https://api.github.com/repos/"+STUDIO_REPO+"/"+route,{headers,signal:AbortSignal.timeout(8500)});
   if(!resp.ok)throw new Error("GitHub returned "+resp.status);
   const data=await resp.json();
   if(!Array.isArray(data))throw new Error("Unexpected GitHub response");
   return data;
  };
  try{
   const [commits,pulls]=await Promise.all([
    get("commits?per_page=75"),get("pulls?state=closed&sort=updated&direction=desc&per_page=60")
   ]);
   const clean={
    retrievedAt:new Date().toISOString(),
    repository:STUDIO_REPO,
    commits:commits.map(c=>({
      sha:String(c.sha||""),message:String(c.commit?.message||"").split("\n")[0].slice(0,200),
      date:c.commit?.committer?.date||c.commit?.author?.date||null,
      url:c.html_url||""
    })).filter(c=>c.sha&&c.date),
    pullRequests:pulls.map(p=>({
      number:p.number,title:String(p.title||"").slice(0,200),
      merged_at:p.merged_at||null,state:p.state,url:p.html_url||""
    })).filter(p=>p.number),
    production:{
      available:true,
      commit:process.env.RAILWAY_GIT_COMMIT_SHA||null,
      deploymentId:process.env.RAILWAY_DEPLOYMENT_ID||null
    }
   };
   studioFeedCache=clean;studioFeedAt=Date.now();return clean;
  }catch(error){
   if(studioFeedCache)return {...studioFeedCache,stale:true};
   throw error;
  }finally{studioFeedPending=null}
 })();
 return studioFeedPending;
}

createServer(async(req,res)=>{
  const raw=(req.url||"/").split("?")[0];let pathname;
  try{pathname=decodeURIComponent(raw)}catch{res.writeHead(400);res.end();return}
  if(pathname==="/api/studio-feed"){
    if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405,{"Allow":"GET, HEAD"});res.end();return}
    try{
      const payload=await getStudioFeed();
      res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"});
      res.end(req.method==="HEAD"?undefined:JSON.stringify(payload));
    }catch(e){
      res.writeHead(503,{"Content-Type":"application/json","Cache-Control":"no-store"});
      res.end(JSON.stringify({error:"GitHub activity unavailable",commits:[],pullRequests:[]}));
    }
    return;
  }
  if(pathname==="/api/discover-ai"){
    if(req.method!=="POST"){res.writeHead(405,{"Allow":"POST"});res.end();return}
    await handleDiscoverAI(req,res);return;
  }
  if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405);res.end();return}
  if(pathname==="/api/discover-ai-config"){
    res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});
    res.end(JSON.stringify({enabled:discoverAIEnabled()}));return;
  }
  if(pathname.startsWith("/api/school-art/")){
    const id=pathname.slice("/api/school-art/".length);
    if(!Object.hasOwn(ART_FILES,id)){res.writeHead(404);res.end("Not found");return}
    try{
      const art=await artwork(id);
      res.writeHead(200,{"Content-Type":art.mime,"Cache-Control":"public,max-age=604800,immutable","X-Content-Type-Options":"nosniff"});
      if(req.method==="HEAD")res.end();else res.end(art.bytes);
    }catch{
      res.writeHead(503,{"Cache-Control":"no-store"});res.end("Art unavailable");
    }
    return;
  }
  if(pathname==="/api/health"){res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end('{"ok":true}');return}
  if(pathname==="/api/public-config"){
    const supabaseUrl=process.env.YOURLOGOS_SUPABASE_URL||"";
    const supabasePublishableKey=process.env.YOURLOGOS_SUPABASE_PUBLISHABLE_KEY||"";
    const safeUrl=/^https:\/\/[a-z0-9.-]+\.supabase\.co$/.test(supabaseUrl)?supabaseUrl:"";
    const safeKey=/^sb_publishable_[a-zA-Z0-9_-]+$/.test(supabasePublishableKey)?supabasePublishableKey:"";
    res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store, no-cache","X-Content-Type-Options":"nosniff"});
    res.end(JSON.stringify({supabaseUrl:safeUrl,supabasePublishableKey:safeKey}));return
  }
  const name=pathname==="/"?"/index.html":pathname;
  if(blocked(name)||!path.extname(name)){res.writeHead(404);res.end("Not found");return}
  const file=path.resolve(ROOT,"."+name);
  if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
  try{
    const info=await stat(file);if(!info.isFile())throw new Error("not file");
    const body=await readFile(file);
    res.writeHead(200,{"Content-Type":MIME[path.extname(file)]||"application/octet-stream","X-Content-Type-Options":"nosniff","Cache-Control":file.endsWith("sw.js")||file.endsWith("auth-config.js")?"no-cache":"public,max-age=60"});
    res.end(req.method==="HEAD"?undefined:body);
  }catch{res.writeHead(404);res.end("Not found")}
}).listen(PORT,"0.0.0.0",()=>{
 console.log("YourLogos listening on "+PORT);
 // Warm curated thumbnails after startup. No request must wait for prewarming.
 for(const id of Object.keys(ART_FILES))artwork(id).catch(()=>{});
});
