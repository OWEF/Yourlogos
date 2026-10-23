import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const app=read("app.js"),world=read("world-view.js"),cosmos=read("cosmos-v2.html");
const auth=read("auth-client.js"),config=read("auth-config.js"),sw=read("sw.js"),html=read("index.html");
for(const [name,source] of [["app",app],[ "world",world],["auth",auth]]){
  new vm.Script(source.replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,""),{filename:name});
}
const embedded=cosmos.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(embedded,"Cosmos should have inline JavaScript");
new vm.Script(embedded[1],{filename:"cosmos-inline.js"});

const quoteSnippet=app.slice(app.indexOf("const QUOTES="),app.indexOf("const THEMES="));
assert.ok(quoteSnippet.startsWith("const QUOTES="));
const QUOTES=new Function(quoteSnippet.replace("const QUOTES=","return "))();
assert.equal(QUOTES.length,91);
assert.equal(new Set(QUOTES.map(q=>q[0])).size,QUOTES.length,"Curated quote text must be distinct");
assert.equal(QUOTES[0][1],"Friedrich Nietzsche");
assert.equal(QUOTES[19][1],"Albert Einstein");
assert.equal(QUOTES[31][1],"G. W. F. Hegel");
const seed=read("supabase/yourlogos_quotes_seed.sql");
const seedPayload=JSON.parse(seed.split("$quotes$\n")[1].split("\n$quotes$")[0]);
assert.deepEqual(seedPayload.map(x=>x.legacy_id),Array.from({length:42},(_,i)=>i));
assert.deepEqual(seedPayload.map(x=>x.author),QUOTES.slice(0,42).map(x=>x[1]));

const start=app.indexOf("const dayIndexFor="),end=app.indexOf("const esc=",start);
const mockData={practice:{},saved:[],themes:[]};
const model=new Function("data","localStorage","KEY",
  quoteSnippet+'\nconst today=()=>"2026-10-23";\n'+app.slice(start,end)+
  "\nreturn {QUOTES,dailyPick,shiftDate,ensureDailyFeature,activeQuote};"
)(mockData,{setItem(){}},"test");
const days=Array.from({length:168},(_,i)=>model.shiftDate("2026-10-23",i));
const chosen=days.map(d=>model.dailyPick(d));
for(let i=0;i<=chosen.length-QUOTES.length;i++){
  assert.equal(new Set(chosen.slice(i,i+QUOTES.length)).size,QUOTES.length,
    "Expected no repeats in a "+QUOTES.length+" day featured-quote cycle");
}
assert.equal(model.ensureDailyFeature(),model.activeQuote(),"Quote should remain stable on same date");
assert.ok(app.includes('["today","Encounter"],["library","Library"],["profile","My World"]'));
assert.ok(app.includes("class=\"settings-layer\""));
assert.ok(app.includes("data-action=\"daily-arrive\""));
assert.ok(app.includes("preview-tomorrow"));
assert.ok(app.includes('document.body.appendChild(replacementNav)'),"Navigation dock must persist outside content root");
assert.ok(app.includes('body > .mobile-tabs .dock-glass'),"Live dock indicator remains the same DOM element");
assert.ok(app.includes('document.addEventListener("pointerdown"'),"Important taps respond at pointer-down");
assert.ok(app.includes('motion-tab-entry'),"Tabs animate directional content arrival");
const motion=read("motion.css");
assert.ok(motion.includes("prefers-reduced-motion:reduce"),"Reduced motion must be supported");
assert.ok(motion.includes(".dock-indicator"),"Active dock indicator must have continuous feedback");
assert.ok(html.includes('href="/motion.css"')&&sw.includes('"/motion.css"'),"Motion CSS is loaded and cached");
assert.ok(cosmos.includes("if(!explored.length)return;"),"Personal lines require recorded link evidence");
const mapped=cosmos.match(/const legacyConceptByIndex=\[([^\]]*)\]/);
assert.equal(mapped?.[1]?.split(",").length,42,"Existing personal sky mappings preserve original quote IDs");
assert.ok(cosmos.includes("yourlogos-quote-theme-map"),"Additional quote themes must be supported through metadata fallback");
assert.ok(world.includes("THE PHILOSOPHER’S MIRROR"));
assert.ok(world.includes("ready:saved.length>=3"),"A match must have minimum personal evidence");
assert.ok(config.includes("/api/public-config"),"Auth configuration is loaded from server runtime");
assert.ok(read("server.mjs").includes("YOURLOGOS_SUPABASE_PUBLISHABLE_KEY"),"Server reads publishable key only");
assert.ok(auth.includes("writeAccountData")&&auth.includes("readAccountData"),"Account snapshot supports explicit save and restore");
assert.ok(app.includes("cloud-confirm")&&app.includes("cloud-cancel"),"Cloud transfers require confirmation");
for(const path of ["/world-view.js","/world.css","/daily-arrival.css","/library-atmosphere.css","/auth-client.js","/auth-config.js"]){
 assert.ok(sw.includes('"'+path+'"'),"Offline cache should precache "+path);
}
for(const sheet of ["/world.css","/daily-arrival.css"])assert.ok(html.includes(sheet));
for(const table of ["quotes","profiles","user_state","user_links"])
 assert.ok(read("supabase/yourlogos_schema.sql").includes("alter table public."+table+" enable row level security;"));
console.log("YourLogos V2.5: static syntax, 91-day fresh quotes, data indices, auth boundary and RLS checks PASS.");
