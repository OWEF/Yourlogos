/** Review-only preview of the four-layer grammar and real CZ-105 bridge. */
import {ATLAS_PILOT_V01} from "../philosophy-engine/context-atlas/pilot-records-v01.js";
import {evaluatePhilosophicalGrammar, summarizeAtlasPilot, auditLegacyReasoningResult}
  from "../philosophy-engine/context-atlas/grammar-v01.js";
import {analyzeTradeoff} from "../philosophy-engine/tradeoff-reasoner.js";

const summary=summarizeAtlasPilot();
console.log("CZ-110 | Philosophical Context Atlas v0.1");
console.log("Number of quotes:",summary.count);
console.log("Candidate mechanic distribution:",JSON.stringify(summary.candidates));
console.log("Source-passage linked (not fully verified):",summary.sourceLinked);
console.log("Production eligible:",summary.readyForProduction);
console.log("No-fit quote IDs:",summary.notSuitable.join(", "));
console.log("\nQUOTE ID | CANDIDATE | SAFETY GATE | SOURCE STATUS");
for (const r of ATLAS_PILOT_V01){
 const g=evaluatePhilosophicalGrammar(r);
 console.log(
   String(r.id).padStart(3," "),"|",
   g.interactiveRealization.candidate.padEnd(14," "),"|",
   g.interactiveRealization.eligibility.padEnd(32," "),"|",
   g.sourceContext.evidenceType
 );
}
console.log("\nAGAINST THE EXISTING CZ-105 SENECA REASONER:");
for (const n of [[8,0,0],[5,2,1],[3,3,2]]) {
 const result=analyzeTradeoff({allocation:Object.fromEntries(["rest","obligations","reflection"].map((k,i)=>[k,n[i]]))});
 const audit=auditLegacyReasoningResult(ATLAS_PILOT_V01.find(x=>x.id===49),result,"eight-hour-thought-exercise");
 console.log(n.join("/"),"=>",audit.outcome,"|",audit.blockers.join(" ; "));
}
console.log("\nInterpretations are hypotheses; abstention is a successful, expected result.");
