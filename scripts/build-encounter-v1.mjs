import {readFileSync, writeFileSync} from "node:fs";
import {buildScenarioTransferStandalone} from "./build-scenario-transfer-lab-v02.mjs";

const html = buildScenarioTransferStandalone("experiments/encounter-v1.html", [
  "philosophy-engine/encounter/quotation-return-v12.js",
  "philosophy-engine/encounter/consequence-v1.js"
]);
const destination = new URL("../experiments/encounter-v1-standalone.html", import.meta.url);
if (process.argv.includes("--check")) {
  if (readFileSync(destination, "utf8") !== html) throw Error("Stale Encounter bundle");
} else {
  writeFileSync(destination, html);
}
