/**
 * Builds a self-contained, no-network CZ-105 founder lab from the SAME engine,
 * philosophical model, and slider-control modules as the import-based lab.
 * Run: node scripts/build-cz105-lab-standalone.mjs [--check]
 * Pure bundling, no npm deps / API calls / production involvement.
 */
import {readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = path => readFileSync(resolve(root, path), "utf8");
const inputPath = "experiments/cz105-reasoning-lab.html";
const outputPath = "experiments/cz105-reasoning-lab-standalone.html";
const imports = [
  'import { analyzeTradeoff } from "../philosophy-engine/tradeoff-reasoner.js";',
  'import { SENECA_TIME_TRADEOFF_V1 } from "../philosophy-engine/models/seneca-time-v1.js";',
  'import { CATEGORY_IDS, INITIAL_TICKS, PRESETS, TOTAL_TICKS, reallocate, toAllocation } from "./cz105-lab-controls.js";',
].join("\n");

function sanitizeSource(source, name) {
  let text = source.replace(/^import\s*\{[\s\S]*?\}\s*from\s*"[^"]+";\s*/m, "");
  text = text.replace(/\bexport\s+(?=(?:const|function|class)\b)/g, "");
  if (/\bimport\s*\{|\bexport\s+(?:const|function|class)/.test(text))
    throw Error("Unresolved module import/export in " + name);
  if (/<\/script/i.test(text)) throw Error("Unsafe closing script sequence in " + name);
  return text;
}

export function buildStandalone() {
  const html = file(inputPath);
  if (!html.includes(imports)) throw Error("Unexpected lab imports: cannot prove source parity");
  const modules = [
    ["model", "philosophy-engine/models/seneca-time-v1.js"],
    ["reasoner", "philosophy-engine/tradeoff-reasoner.js"],
    ["controls", "experiments/cz105-lab-controls.js"],
  ];
  const bundled = modules.map(([name, path]) => "\n/* CZ-105 source: " + path + " */\n" +
    sanitizeSource(file(path), name)).join("\n");
  return html.replace(imports, "/* Offline edition — generated from real CZ-105 source. Do not manually edit this bundle. */\n" + bundled);
}
const launchedDirectly = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (launchedDirectly) {
  const check = process.argv.includes("--check");
  const expected = buildStandalone();
  if (check) {
    if (file(outputPath) !== expected) {
      process.stderr.write("Standalone lab differs from source modules. Run build script.\n");
      process.exit(1);
    }
    process.stdout.write("CZ-105 offline bundle matches original model, engine, controls and lab UI.\n");
  } else {
    writeFileSync(resolve(root, outputPath), expected, "utf8");
    process.stdout.write("Wrote " + outputPath + " (" + expected.length + " chars)\n");
  }
}