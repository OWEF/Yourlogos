import {readFileSync, writeFileSync} from "node:fs";
import {buildScenarioTransferStandalone} from "./build-scenario-transfer-lab-v02.mjs";

const bundled = buildScenarioTransferStandalone("experiments/encounter-v1.html", [
  "philosophy-engine/encounter/kernel-contexts-v11.js",
  "philosophy-engine/encounter/semantic-cases-v12.js",
  "philosophy-engine/encounter/source-passage-witness-v19.js",
  "philosophy-engine/encounter/semantic-reasoning-v12.js",
  "philosophy-engine/encounter/reasoning-kernel-v11.js",
  "philosophy-engine/encounter/encounter-distinction-v13.js",
  "philosophy-engine/encounter/quotation-return-v12.js",
  "philosophy-engine/encounter/expression-engine-v1.js",
  "philosophy-engine/encounter/consequence-v1.js"
]);
const portrait=readFileSync(new URL("../little-logo-hd-v2.jpg",import.meta.url)).toString("base64");
const html=bundled.replaceAll("../little-logo-hd-v2.jpg","data:image/jpeg;base64,"+portrait);
const editions=[
  ["encounter-v1-standalone.html",html],
  ["discover-v17.html",html.replace("</head>",'<meta name="semantic-discover" content="consumer"></head>')],
  ["discover-v17-qa.html",html.replace("</head>",'<meta name="semantic-discover" content="qa"><meta name="expression-lab" content="founder"></head>')],
  ["encounter-expression-qa.html",html.replace("</head>",'<meta name="expression-lab" content="founder"></head>')]
];
for(const [filename,contents] of editions){
  const destination=new URL("../experiments/"+filename,import.meta.url);
  if(process.argv.includes("--check")){
    if(readFileSync(destination,"utf8")!==contents) throw Error("Stale bundle: "+filename);
  } else writeFileSync(destination,contents);
}
