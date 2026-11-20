/**
 * Exact-build evidence comparison. Fails CI if a narrative, warrant class,
 * event or word policy changes while inserting source-authored WHY.
 * This reads only visible/public Epictetus evidence generated independently
 * by node tests from the frozen and corrected repository worktrees.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import assert from "node:assert/strict";
const [beforeFile,afterFile,destination]=process.argv.slice(2);
if(!beforeFile||!afterFile||!destination)throw Error("before, after and evidence destination required");
const before=JSON.parse(readFileSync(beforeFile,"utf8"));
const after=JSON.parse(readFileSync(afterFile,"utf8"));
assert.equal(before.paths.length,18);
assert.equal(after.paths.length,18);
assert.equal(before.scenarioHash,after.scenarioHash,"Frozen narrative/scenario fingerprint must not change");
assert.notEqual(before.sourceHash,after.sourceHash,"Corrected source record must be newly sealed");
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
const digest=x=>x.sections.map(y=>y.text).join(" ");
const raw=[];
const lines=[
 "# CZ-154 M3 R1 — exact frozen M2 vs corrective SHA: 18 actual source/Expression traces",
 "",
 "**Before source fingerprint:** "+before.sourceHash,
 "**After source fingerprint:** "+after.sourceHash,
 "**Scenario fingerprint (identical):** "+after.scenarioHash,
 "",
 "Both sides were executed from their own exact GitHub commit worktree during CI. These are actual generated text, never hand-written substitutes. Compact and full sections are presented in their authored order.",
 ""
];
const warranted=new Set();
for(let i=0;i<18;i++){
 const a=before.paths[i],b=after.paths[i];
 assert.deepEqual(b.path,a.path);
 assert.equal(b.firstMessage,a.firstMessage);
 assert.equal(b.observed,a.observed);
 assert.equal(b.secondAction,a.secondAction);
 assert.deepEqual(b.canonical,a.canonical);
 assert.equal(b.reasoning.meaning.selectedClaim,a.reasoning.meaning.selectedClaim);
 assert.equal(b.emotion.strategy,a.emotion.strategy);
 assert.deepEqual(b.reasoning.meaning.choiceAnalysis.establishedFacts,
  a.reasoning.meaning.choiceAnalysis.establishedFacts);
 assert.deepEqual(b.reasoning.meaning.choiceAnalysis.history.events,
  a.reasoning.meaning.choiceAnalysis.history.events);
 assert.deepEqual(b.reasoning.meaning.choiceAnalysis.judgment,
  a.reasoning.meaning.choiceAnalysis.judgment);
 const witness=b.reasoning.meaning.choiceAnalysis.judgment.warrantId;
 warranted.add(witness);
 const data={path:b.path,refinement:witness};
 lines.push("## "+(i+1)+". "+b.path.join(" → "),"",
  "**Source warrant:** "+witness,
  "**Selected claim:** "+b.reasoning.meaning.selectedClaim,"",
  "**Unchanged first message:** "+b.firstMessage,
  "**Unchanged independent event:** "+b.observed,
  "**Unchanged second action:** "+b.secondAction,"");
 for(const mode of ["compact","full"]){
  const left=mode==="compact"?a.compact:a.full;
  const right=mode==="compact"?b.compact:b.full;
  const lcounts=left.sections.map(s=>count(s.text));
  const rcounts=right.sections.map(s=>count(s.text));
  const n=rcounts.reduce((x,y)=>x+y,0);
  const min=mode==="compact"?40:80,max=mode==="compact"?65:120;
  const low=mode==="compact"?[1,1,9]:[10,18,9];
  const high=[48,65,26];
  assert.equal(left.sections.length,3);
  assert.equal(right.sections.length,3);
  assert.ok(n>=min&&n<=max,b.path+" "+mode+" exceeds total policy: "+n);
  assert.ok(rcounts.every((x,j)=>x>=low[j]&&x<=high[j]),
   b.path+" "+mode+" exceeds section policy: "+rcounts);
  const why=right.sections[1].text;
  assert.match(why,/hindrance and disturbance/i);
  assert.match(why,/assent/i);
  assert.match(why,/Epictetus/i);
  const qualification=b.reasoning.meaning.choiceAnalysis.judgment;
  assert.ok(why.includes(mode==="compact"?qualification.compactLimit:qualification.qualification));
  if(mode==="full")assert.ok(why.includes(qualification.counterexample));
  assert.doesNotMatch(digest(right),/you feared|you felt guilty|you wanted approval|your message caused the silence|guarantees calm|has forgiven you/i);
  data[mode]={beforeCount:lcounts.reduce((x,y)=>x+y,0),afterCount:n,
   beforeSectionCounts:lcounts,afterSectionCounts:rcounts,
   beforeSections:left.sections.map(x=>({label:x.label,text:x.text})),
   afterSections:right.sections.map(x=>({label:x.label,text:x.text}))};
  lines.push("### "+mode.toUpperCase()+" — BEFORE ("+data[mode].beforeCount+
   " words; "+lcounts.join(" / ")+")","");
  for(const sec of left.sections)lines.push("- **"+sec.label+":** "+sec.text);
  lines.push("","### "+mode.toUpperCase()+" — AFTER ("+n+" words; "+
   rcounts.join(" / ")+")","");
  for(const sec of right.sections)lines.push("- **"+sec.label+":** "+sec.text);
  lines.push("");
 }
 raw.push(data);
}
assert.equal(warranted.size,5,"All five source-relevant interpretation classes must survive");
mkdirSync(destination,{recursive:true});
writeFileSync(destination+"/M3R1-eighteen-before-after-literal.md",lines.join("\n")+"\n");
writeFileSync(destination+"/M3R1-eighteen-before-after.json",
 JSON.stringify({beforeSha:"de940a15b32a6ad3ac3fbd082d6e64efbdf05441",
  beforeSourceHash:before.sourceHash,afterSourceHash:after.sourceHash,
  scenarioHash:after.scenarioHash,journeyCount:18,
  distinctWarrantClasses:[...warranted].sort(),paths:raw},null,2)+"\n");
console.log("M3 R1 18/18 exact before-after comparisons passed, 5 warranted classes retained, both word policies met.");
