/**
 * M3 R4: exact frozen R1-to-R4 comparison of authentic engine-produced paths.
 * Read-only proof; no runtime, authoring or QA sealed-source dependencies.
 * Any deviation other than the two intended compact source-authored phrases
 * and version/fingerprint must fail CI.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import assert from "node:assert/strict";

const [baselineFile,afterFile,outDir]=process.argv.slice(2);
if(!baselineFile||!afterFile||!outDir) throw Error("Expected frozen-before.json corrected-after.json output-dir");
const before=JSON.parse(readFileSync(baselineFile,"utf8"));
const after=JSON.parse(readFileSync(afterFile,"utf8"));
const frozenSha="a2ed95a720a9a156c3003681b5fcf7a32cce5f41";
const oldText="Epictetus: Your acts are yours; assent isn't. Depending on assent invites hindrance and disturbance.";
const newText="Epictetus: Your choices cannot command another's reply. Depending on replies invites hindrance and disturbance.";
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
assert.equal(before.paths.length,18);
assert.equal(after.paths.length,18);
assert.equal(before.scenarioHash,after.scenarioHash,"The independently authored scenario must not change");
assert.notEqual(before.sourceHash,after.sourceHash,"Source fingerprint must change");
const rows=[],classes=new Map(),report=[
 "# M3 R4 — Actual frozen R1 versus corrected R4 18-path literal audit",
 "",
 "Frozen comparator: `"+frozenSha+"`",
 "Baseline source fingerprint: `"+before.sourceHash+"`",
 "Corrected source fingerprint: `"+after.sourceHash+"`",
 "Unchanged scenario fingerprint: `"+after.scenarioHash+"`",
 "",
 "Source-authored compact replacement:",
 "- BEFORE: "+oldText,
 "- AFTER: "+newText,
 "",
 "All 18 paths are run from their respective exact checkout and compared mechanically. Source copy and editorial warrant are distinct from fictional events.",
 ""
];
for(let i=0;i<18;i++){
 const a=before.paths[i],b=after.paths[i];
 const label=b.path.join(" → ");
 assert.deepEqual(b.path,a.path,label+" path changed");
 for(const key of ["firstMessage","observed","secondAction","canonical","reconsideration"]){
   assert.deepEqual(b[key],a[key],label+" "+key+" changed");
 }
 assert.deepEqual(b.reasoning,a.reasoning,label+" reasoning changed");
 assert.deepEqual(b.emotion,a.emotion,label+" emotion strategy changed");
 assert.deepEqual(b.full.sections,a.full.sections,label+" full expression changed");
 assert.equal(b.compact.sections.length,3);
 assert.equal(a.compact.sections.length,3);
 assert.deepEqual(b.compact.sections[0],a.compact.sections[0],label+" first section changed");
 assert.deepEqual(b.compact.sections[2],a.compact.sections[2],label+" third section changed");
 const expected=a.compact.sections[1].text.replace(oldText,newText);
 assert.notEqual(expected,a.compact.sections[1].text,label+" old argumentative phrase not found");
 assert.equal(b.compact.sections[1].text,expected,label+" changed beyond authorized WHAT/WHY source clause");
 const cls=b.reasoning.meaning.choiceAnalysis.refinementBasis?.warrantId ??
 b.reasoning.meaning.choiceAnalysis.judgment?.warrantId ??
 b.reasoning.meaning.choiceAnalysis.sourceWarrantIds?.at(-1);
 // The actual class is the refined selected warrant; only count strings.
 classes.set(cls,(classes.get(cls)??0)+1);
 const out={path:b.path,class:cls};
 report.push("## "+(i+1)+". "+label,"");
 for(const kind of ["compact","full"]){
  const prev=a[kind],next=b[kind],beforeParts=prev.sections.map(x=>count(x.text)),afterParts=next.sections.map(x=>count(x.text));
  const total=afterParts.reduce((x,y)=>x+y,0);
  const lo=kind==="compact"?40:80,hi=kind==="compact"?65:120;
  const mins=kind==="compact"?[1,1,9]:[10,18,9],maxs=[48,65,26];
  assert.ok(total>=lo&&total<=hi,label+" "+kind+" total "+total);
  assert.ok(afterParts.every((n,j)=>n>=mins[j]&&n<=maxs[j]),label+" "+kind+" sections "+afterParts);
  assert.match(next.sections[1].text,/hindrance and disturbance/);
  if(kind==="compact"){
   assert.match(next.sections[1].text,/another's reply/);
   assert.doesNotMatch(next.sections[1].text,/assent isn't|Depending on assent/);
  }else{
   assert.match(next.sections[1].text,/another's assent isn't/);
  }
  const qualification=b.reasoning.meaning.choiceAnalysis.judgment;
  assert.ok(next.sections[1].text.includes(kind==="compact"?qualification.compactLimit:qualification.qualification));
  if(kind==="full")assert.ok(next.sections[1].text.includes(qualification.counterexample));
  assert.doesNotMatch(next.sections.map(s=>s.text).join(" "),/you wanted approval|you feared rejection|your message caused the silence|you were forgiven|guaranteed calm/i);
  out[kind]={beforeSectionWordCounts:beforeParts,afterSectionWordCounts:afterParts,
   beforeWordCount:beforeParts.reduce((x,y)=>x+y,0),afterWordCount:total,
   beforeSections:prev.sections,afterSections:next.sections};
  report.push("### "+kind.toUpperCase()+" BEFORE — "+out[kind].beforeWordCount+" words ("+beforeParts.join(" / ")+")","");
  for(const s of prev.sections)report.push("- **"+s.label+"**: "+s.text);
  report.push("","### "+kind.toUpperCase()+" AFTER — "+total+" words ("+afterParts.join(" / ")+")","");
  for(const s of next.sections)report.push("- **"+s.label+"**: "+s.text);
  report.push("");
 }
 rows.push(out);
}
const unique=new Set(rows.map(x=>x.class));
assert.equal(unique.size,5,"Five warrant-sensitive interpretation classes must be preserved");
mkdirSync(outDir,{recursive:true});
const artifact={baselineSha:frozenSha,baselineSourceFingerprint:before.sourceHash,
 correctedSourceFingerprint:after.sourceHash,scenarioFingerprint:after.scenarioHash,
 pathsCompared:rows.length,classes:Object.fromEntries(classes),before:oldText,after:newText,paths:rows};
writeFileSync(outDir+"/M3R4-eighteen-before-after.json",JSON.stringify(artifact,null,2)+"\n");
writeFileSync(outDir+"/M3R4-eighteen-before-after-literal.md",report.join("\n")+"\n");
console.log("M3 R4: 18/18 exact source-copy-only paths, five warrant classes, full text unchanged, both word policies satisfied.");
