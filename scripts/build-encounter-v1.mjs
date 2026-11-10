import {readFileSync, writeFileSync} from "node:fs";
import {buildScenarioTransferStandalone} from "./build-scenario-transfer-lab-v02.mjs";

const html = buildScenarioTransferStandalone("experiments/encounter-v1.html", [
  "philosophy-engine/encounter/encounter-distinction-v13.js",
  "philosophy-engine/encounter/quotation-return-v12.js",
  "philosophy-engine/encounter/expression-engine-v1.js",
  "philosophy-engine/encounter/consequence-v1.js"
]);
const editions=[
  ["encounter-v1-standalone.html",html],
  ["encounter-expression-qa.html",html.replace("</head>",'<meta name="expression-lab" content="founder"></head>')]
];
for(const [filename,contents] of editions){
  const destination=new URL("../experiments/"+filename,import.meta.url);
  if(process.argv.includes("--check")){
    if(readFileSync(destination,"utf8")!==contents) throw Error("Stale bundle: "+filename);
  } else writeFileSync(destination,contents);
}
