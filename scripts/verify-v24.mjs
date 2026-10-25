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
const featureIds=new Function(quoteSnippet+"return DAILY_FEATURE_IDS;")();
assert.ok(featureIds.length>=50 && featureIds.length<QUOTES.length,"Daily first impressions are deliberately curated");
assert.ok(!featureIds.includes(11)&&!featureIds.includes(72),"Specialist Kant texts should not be selected as daily introductions");
assert.equal(new Set(featureIds).size,featureIds.length,"Daily quote IDs must be unique");
assert.ok(featureIds.every(id=>Number.isInteger(id)&&id>=0&&id<QUOTES.length),"Valid stable quote IDs required");
assert.ok(chosen.every(id=>featureIds.includes(id)),"Daily picks must stay within reviewed quote pool");
for(let i=0;i<=chosen.length-featureIds.length;i++){
  assert.equal(new Set(chosen.slice(i,i+featureIds.length)).size,featureIds.length,
    "Expected no repeats in a "+featureIds.length+" day featured-quote cycle");
}
assert.equal(model.ensureDailyFeature(),model.activeQuote(),"Quote should remain stable on same date");
assert.ok(app.includes('["today","Encounter"],["library","Library"],["profile","My World"]'));
assert.ok(app.includes('class="view settings-route"'),"Account controls must use a reliable app route");
assert.ok(app.includes('body > .sky-return'),"Universe back control must remain outside the iframe");
assert.ok(!app.includes('portal.showModal()'),"Avoid fragile modal top-layer handling");
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
assert.ok(app.includes("schoolBackdropHtml(current.id)"),"Each philosophy detail should use an independent image, not repeat the SVG icon");
assert.ok(app.includes("schoolArtCreditHtml(current.id)"),"Background artwork must be credited");
assert.ok(html.includes("/v29.css")&&sw.includes('"/v29.css"'),"New art CSS should be linked and cached");
assert.ok(read("ios/project.yml").includes("YourLogosQuoteWidget"),"Native project must embed WidgetKit extension");
assert.ok(read("ios/Widget/YourLogosQuoteWidget.swift").includes("yourlogos://save?quote="),"Keep widget control deep-links into installed app");
const nativeQuotes=JSON.parse(read("ios/Widget/widget-quotes.json"));
assert.equal(nativeQuotes.quotes.length,QUOTES.length,"Native widget quote library stays aligned with the web");
assert.deepEqual(nativeQuotes.order,(()=>{const ids=featureIds.slice();let seed=0x7a3f9201;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}return ids})(),"Native widget daily cycle must match web");
assert.deepEqual(nativeQuotes.quotes.map(x=>x.text),QUOTES.map(x=>x[0]),"Native widget quote IDs and text match the app");
const scenes=read("school-scenes.js");
assert.ok(scenes.includes("SCHOOL_SCENES")&&scenes.includes("stoicism")&&scenes.includes("buddhism"),"Every school has a visual encounter");
assert.ok(app.includes("schoolPlayHtml(current.id)"),"Library includes interactive visual lessons");
assert.ok(app.includes("data-school-choice")&&app.includes("data-school-scene"),"Interactive choices and scene navigation work");
assert.ok(app.includes("quote-dense"),"Long quotation has a readable responsive font size");
const api=read("server.mjs");
assert.ok(api.includes('"/api/school-art/"')&&api.includes("artCache"),"Optimized curated artwork served from same origin");
assert.ok(html.includes('/v30.css')&&sw.includes('"/v30.css"')&&sw.includes('"/school-scenes.js"'),"New interaction assets load offline");
const explore=read("explore-catalogue.js"),threads=read("thought-threads.js");
assert.ok(sw.includes('"/explore-catalogue.js"'),"Offline cache must include Explore content");
assert.ok(app.includes('case"thread-explore"')&&app.includes('case"thread-reflect"'),"One-tap Explore and optional reflection are reachable");
assert.ok(threads.includes("yl-explore-button")&&threads.includes("exploration.insight")&&threads.includes("exploration.reflection"),"Discover must reveal a meaningful insight before optional reflection");
assert.ok(!threads.includes("MOVES.map((_,i)=>gesture(i))"),"Old three-choice reaction entrance is removed");
console.log("YourLogos V3.0: source, native beta, routes, curated art, visual lessons and privacy checks PASS.");
