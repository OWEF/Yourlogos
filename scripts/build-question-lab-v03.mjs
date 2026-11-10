/**
 * Produce the actual CZ-112 standalone HTML from the six exact source
 * modules + the approved mobile UI. No mock rule copies are maintained.
 *
 * node scripts/build-question-lab-v03.mjs
 * node scripts/build-question-lab-v03.mjs --check
 */
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source="experiments/two-encounter-question-lab-v03.html";
const destination="experiments/two-encounter-question-lab-v03-standalone.html";
const modules=[
 "philosophy-engine/context-atlas/pilot-records-v01.js",
 "philosophy-engine/context-atlas/grammar-v01.js",
 "philosophy-engine/encounter/insight-packet-v01.js",
 "philosophy-engine/encounter/experience-reasoners-v01.js",
 "philosophy-engine/encounter/question-selection-v02.js",
 "philosophy-engine/encounter/expression-engine-v02.js"
];
const read=path=>readFileSync(resolve(root,path),"utf8");
function removeImportsAndExports(text,label){
 const stripped=text.replace(/^import [^\n]+;\s*$/gm,"").replace(/^export /gm,"");
 if(/(^|\n)(?:import\s|export\s)/m.test(stripped))
   throw Error("Unexpected import or export syntax: "+label);
 if(/<\/script/i.test(stripped))
   throw Error("Disallowed embedded script delimiter in "+label);
 return stripped;
}
export function buildQuestionLabStandalone(){
 const html=read(source);
 const open='<script type="module">';
 if(html.split(open).length!==2||html.split("</script>").length!==2)
   throw Error("Expected exactly one application module script");
 const frontend=html.split(open)[1].split("</script>")[0];
 const bundledModules=modules.map(file=>
   "\n/* SOURCE MODULE: "+file+" */\n"+removeImportsAndExports(read(file),file)
 ).join("\n");
 const compiled="<script>\n"+bundledModules+
   "\n/* ORIGINAL APP UI */\n"+removeImportsAndExports(frontend,source)+"\n</script>";
 return html.replace(/<script type="module">[\s\S]*?<\/script>/,compiled);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const built=buildQuestionLabStandalone();
 if(process.argv.includes("--check")){
   if(read(destination)!==built)throw Error("Standalone HTML diverges from original modules; run build script");
   process.stdout.write("CZ-112 exact source parity: PASS\n");
 }else{
   writeFileSync(resolve(root,destination),built,"utf8");
   process.stdout.write("Created "+destination+" ("+built.length+" characters)\n");
 }
}
