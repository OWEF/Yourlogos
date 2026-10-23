import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT)||3000;
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".webmanifest":"application/manifest+json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8"};
const blocked=(name)=>name.startsWith(".")||name.includes("secret")||name.includes("server.")||name.includes("package-lock")||name.includes("/scripts/")||name.includes("/supabase/")||name.includes(".md");
createServer(async(req,res)=>{
  const raw=(req.url||"/").split("?")[0];let pathname;
  try{pathname=decodeURIComponent(raw)}catch{res.writeHead(400);res.end();return}
  if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405);res.end();return}
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
}).listen(PORT,"0.0.0.0",()=>console.log("YourLogos listening on "+PORT));
