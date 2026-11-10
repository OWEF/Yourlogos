/**
 * Produces a zero-network, iPhone Files-compatible edition of the actual
 * CZ-110 Context Atlas + CZ-117 Insight Packet/Reasoner/Expression modules.
 * Source parity is enforced by --check in PR CI.
 *
 * node scripts/build-scenario-transfer-lab-v02.mjs
 * node scripts/build-scenario-transfer-lab-v02.mjs --check
 */
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source="experiments/mechanism-parallel-transfer-lab-v02.html";
const destination="experiments/mechanism-parallel-transfer-lab-v02-standalone.html";
const modules=[
  "philosophy-engine/context-atlas/pilot-records-v01.js",
  "philosophy-engine/context-atlas/grammar-v01.js",
  "philosophy-engine/encounter/insight-packet-v01.js",
  "philosophy-engine/encounter/experience-reasoners-v01.js",
  "philosophy-engine/encounter/mechanism-transfer-cases-v02.js",
  "philosophy-engine/encounter/mechanism-transfer-engine-v02.js"
];
const read=path=>readFileSync(resolve(root,path),"utf8");
function removeImportsAndExports(text,label){
  const stripped=text.replace(/^import [^\n]+;\s*$/gm,"").replace(/^export /gm,"");
  if (/(^|\n)(?:import\s|export\s)/m.test(stripped))
    throw Error("Unexpected module syntax in "+label);
  if (/<\/script/i.test(stripped))
    throw Error("Unsafe HTML-script sequence in "+label);
  return stripped;
}
export function buildScenarioTransferStandalone(){
  const html=read(source);
  const open="<script type=\"module\">";
  if(html.split(open).length!==2||html.split("</script>").length!==2)
    throw Error("Expected a single application module script");
  const frontend=html.split(open)[1].split("</script>")[0];
  const bundledModules=modules.map(file=>
    "\n/* EXACT RESEARCH MODULE: "+file+" */\n"+removeImportsAndExports(read(file),file)
  ).join("\n");
  const script="<script>\n"+bundledModules+"\n/* ORIGINAL LAB UI */\n"+
    removeImportsAndExports(frontend,source)+"\n</script>";
  return html.replace(/<script type="module">[\s\S]*?<\/script>/,script);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const expected=buildScenarioTransferStandalone();
  if(process.argv.includes("--check")){
    if(read(destination)!==expected)throw Error("Standalone output differs from exact source modules and UI");
    process.stdout.write("CZ-117 standalone source parity PASS\n");
  }else{
    writeFileSync(resolve(root,destination),expected,"utf8");
    process.stdout.write("Wrote "+destination+" ("+expected.length+" characters)\n");
  }
}
