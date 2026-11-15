/**
 * CZ-140 — progressive pilot standalone exporter.
 * Copies only the frozen, already self-contained engine script from the
 * CZ-138 standalone proof (whose own source-integrity builder is checked in CI).
 * Adds one new isolated shell. Never touches a shipped app or engine module.
 */
import {readFileSync,writeFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const source=new URL("../experiments/encounter-v21-playable.html",import.meta.url);
const shellPath=new URL("../experiments/encounter-v21-progressive-shell.html",import.meta.url);
const target=new URL("../experiments/encounter-v21-progressive.html",import.meta.url);
const old=readFileSync(source,"utf8"),shell=readFileSync(shellPath,"utf8");
const needle='<script>\n(function(){\n"use strict";\nconst __yl_modules=Object.create(null);';
const start=old.indexOf(needle);
if(start<0||old.indexOf(needle,start+1)>=0)throw Error("Frozen module bundle not found exactly once.");
const end=old.indexOf("\n</script>",start);
if(end<0||end-start<100000)throw Error("Frozen module bundle incomplete.");
const engineScript=old.slice(start,end+"\n</script>".length);
const marker="<!-- ENGINE_BUNDLE_V21 -->";
if(shell.split(marker).length!==2)throw Error("One pinned engine injection point required.");
const html=shell.replace(marker,engineScript);
if(!html.includes("window.YL_ENCOUNTER_ENGINE")||!html.includes("window.__YL_CZ140_TEST"))
 throw Error("Missing the validated reasoning bridge or the progressive research controller.");
if(process.argv.includes("--check")){
 if(readFileSync(target,"utf8")!==html)throw Error("Progressive HTML out of sync with checked-in research shell+frozen engine.");
}else writeFileSync(target,html);
console.log("CZ140-BUNDLE "+JSON.stringify({mode:process.argv.includes("--check")?"verified":"written",htmlBytes:Buffer.byteLength(html),frozenEngineBytes:Buffer.byteLength(engineScript),newShellBytes:Buffer.byteLength(shell)}));
