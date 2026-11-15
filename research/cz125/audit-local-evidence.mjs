/**
 * CZ-125 PRIVATE study inventory: never grades philosophical understanding,
 * never attests that a response comes from a real person.
 *
 * Run: node research/cz125/audit-local-evidence.mjs /private/consented-directory
 * Do NOT commit responses to GitHub, submit them to a model, or upload them.
 */
import {readdirSync,readFileSync} from "node:fs";
import {resolve} from "node:path";
const expected="73849bff27fc73db97d5fb015c57f45323e18f30";
const dir=process.argv[2]??null;
const report={gate:"CZ-125",candidateSha:expected,status:"NOT_VERIFIED",
  notes:["No human participant, consent, eligibility, philosophical score or delayed recall can be certified by this script.",
   "Only an independent researcher observing actual participants and scoring their verbatim answers can conclude this study."],
  sourceFileCount:0,reportedImmediate:0,reportedDelayed:0,
  reportedDistinctCodes:0,pairedCodeCount:0,errors:[]};
if(dir){
 try{
  const list=readdirSync(resolve(dir),{withFileTypes:true})
   .filter(x=>x.isFile()&&/\.json$/i.test(x.name)).map(x=>x.name);
  report.sourceFileCount=list.length;
  const codes=new Map();
  for(const name of list){
   let r;
   try{r=JSON.parse(readFileSync(resolve(dir,name),"utf8"));}
   catch{report.errors.push(name+": cannot parse JSON");continue;}
   if(r?.schema!=="cz125-real-reader-response/1.0"||
     r?.candidateSha!==expected||
     !/^R0[1-5]$/.test(r?.participantCode||"")||
     !["immediate","delayed"].includes(r?.phase)||
     !["research:dillard:time-v1","research:kierkegaard:future-v1"].includes(r?.sourceId)||
     r?.consent!==true||
     !Array.isArray(r?.answers)||r.answers.length!==4||
     !r.answers.every(x=>typeof x==="string")||
     !Number.isFinite(Date.parse(r?.recordedAt))){
    report.errors.push(name+": absent consent, source, exact SHA, phase or four transcribed answers");
    continue;
   }
   const current=codes.get(r.participantCode)??new Map();
   if(current.has(r.phase))report.errors.push(name+": duplicate phase for participant code");
   else current.set(r.phase,{recordedAt:r.recordedAt,sourceId:r.sourceId,
     answered:r.answers.filter(x=>x.trim().length>0).length});
   codes.set(r.participantCode,current);
  }
  report.reportedDistinctCodes=codes.size;
  for(const [code,phases] of codes){
   if(phases.has("immediate"))report.reportedImmediate++;
   if(phases.has("delayed"))report.reportedDelayed++;
   if(phases.size===2){
    const first=phases.get("immediate"),later=phases.get("delayed");
    const delayHours=(Date.parse(later.recordedAt)-Date.parse(first.recordedAt))/3600000;
    if(first.sourceId!==later.sourceId)report.errors.push(code+": source mismatched across phases");
    if(delayHours<0)report.errors.push(code+": delayed response predates immediate session");
    if(delayHours<18||delayHours>30)report.errors.push(code+": recall outside 18–30-hour target window ("+delayHours.toFixed(1)+" h)");
    report.pairedCodeCount++;
   }
  }
 }catch(e){report.errors.push("Unable to read private evidence directory: "+e.message);}
}
console.log(JSON.stringify(report,null,2));
// Never print answer text, never automatically issue human study PASS.
if(report.errors.length)process.exitCode=2;
