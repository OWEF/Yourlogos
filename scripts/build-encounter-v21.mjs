/**
 * CZ-138 — deterministic dependency-free bundler for frozen research modules.
 * No engine modifications: rewrites only ES-module import/export bindings into
 * closure-local references, then embeds the exact source into a standalone HTML.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {posix as path} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const shellPath=path.join(root,"experiments/encounter-v21-shell.html");
const outputPath=path.join(root,"experiments/encounter-v21-playable.html");
const roots=[
 "philosophy-engine/encounter/semantic-cases-v12.js",
 "philosophy-engine/encounter/semantic-reasoning-v12.js",
 "philosophy-engine/encounter/emotion-strategy-v20.js",
 "philosophy-engine/encounter/encounter-v20.js",
 "philosopher-portraits.js"
];
const modules=new Map(),order=[];
const importPattern=/^[ \t]*import[ \t]+(\{[^}]+\})[ \t]+from[ \t]+["']([^"']+)["'];?[ \t]*$/gm;
function normalize(from,relative){
 if(!relative.startsWith("."))throw Error("External imports not permitted: "+relative);
 const dep=path.normalize(path.join(path.dirname(from),relative));
 if(dep.startsWith("../")||path.isAbsolute(dep)||!dep.endsWith(".js"))throw Error("Import out of repository: "+dep);
 return dep;
}
function collect(file){
 if(modules.has(file))return;
 const code=readFileSync(path.join(root,file),"utf8");
 const deps=[...code.matchAll(importPattern)].map(m=>normalize(file,m[2]));
 modules.set(file,{code,deps});
 deps.forEach(collect);
 order.push(file);
}
roots.forEach(collect);
function compile(file){
 const {code,deps}=modules.get(file);
 const exported=[...code.matchAll(/^[ \t]*export[ \t]+(?:async[ \t]+)?(?:function|const|let|class)[ \t]+([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);
 if(!exported.length)throw Error("Module without named exports: "+file);
 let built=code.replace(importPattern,(_full,names,ref)=>{
  const target=normalize(file,ref);
  const bindings=names.replace(/\bas\b/g,":");
  return "const "+bindings+"=__yl_modules["+JSON.stringify(target)+"];";
 });
 built=built.replace(/^([ \t]*)export[ \t]+(?=(?:async[ \t]+)?(?:function|const|let|class)\b)/gm,"$1");
 if(/^[ \t]*import[ \t]|^[ \t]*export[ \t]/m.test(built))throw Error("Unconverted module syntax: "+file);
 return "__yl_modules["+JSON.stringify(file)+"]=(function(){\n\"use strict\";\n"+built+
  "\nreturn {"+[...new Set(exported)].join(",")+"};\n})();\n";
}
const bundle="(function(){\n\"use strict\";\nconst __yl_modules=Object.create(null);\n"+
 order.map(compile).join("\n")+
 "window.YL_ENCOUNTER_ENGINE={semanticCases:__yl_modules[\"philosophy-engine/encounter/semantic-cases-v12.js\"].semanticCases,\n"+
 " reasonSemantically:__yl_modules[\"philosophy-engine/encounter/semantic-reasoning-v12.js\"].reasonSemantically,\n"+
 " adaptEncounterEvidence:__yl_modules[\"philosophy-engine/encounter/emotion-strategy-v20.js\"].adaptEncounterEvidence,\n"+
 " selectEmotionStrategy:__yl_modules[\"philosophy-engine/encounter/emotion-strategy-v20.js\"].selectEmotionStrategy,\n"+
 " renderEncounterV20:__yl_modules[\"philosophy-engine/encounter/encounter-v20.js\"].renderEncounterV20,\n"+
 " validateEncounterV20:__yl_modules[\"philosophy-engine/encounter/encounter-v20.js\"].validateEncounterV20,\n"+
 " philosopherPortrait:__yl_modules[\"philosopher-portraits.js\"].philosopherPortrait};\n})();";
const shell=readFileSync(shellPath,"utf8");
const marker="<!-- ENGINE_BUNDLE_V21 -->";
if(shell.split(marker).length!==2)throw Error("Shell must have exactly one bundle placeholder.");
const html=shell.replace(marker,"<script>\n"+bundle.replace(/<\/script/gi,"<\\/script")+"\n</script>");
if(process.argv.includes("--check")){
 if(readFileSync(outputPath,"utf8")!==html)throw Error("Standalone playable HTML does not match frozen engine+shell sources.");
}else writeFileSync(outputPath,html);
console.log("CZ138-BUNDLE "+JSON.stringify({mode:process.argv.includes("--check")?"verify":"write",modules:order.length,modulePaths:order,sourceBytes:bundle.length,htmlBytes:html.length}));
