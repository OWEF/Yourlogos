/**
 * CZ-125 · founder-supplied A–H human-study record validator.
 * Reads ONLY researcher-provided private files (never network or GitHub).
 * Validation is structural: JSON bytes and scores do NOT prove a human exists.
 * It NEVER determines philosophical correctness or authorizes study acceptance.
 */
import {readFileSync,readdirSync} from "node:fs";
import {resolve,join} from "node:path";

export const STUDY=Object.freeze({
  originalDocId:"bf106341-8403-4c88-a71a-67d414f2972d",
  sourceCommentId:"cc99ce7c-4037-44a6-b199-760698937258",
  sourceProvenance:"founder_supplied_full_A_H_transcription",
  fullFounderTranscriptionRecovered:true,nativeDocumentRead:false,
  schema:"cz125-two-games-session/1.0",
  protocolVersion:"cz125-founder-ah-transcription/1.0",
  prototypeSha:"73849bff27fc73db97d5fb015c57f45323e18f30",
  enrollmentAuthorized:false,methodReleaseApproved:false,
  participants:5,observations:10,perGameObservations:5,
  assignedOrder:Object.freeze({
    P01:["dillard","kierkegaard"],P02:["kierkegaard","dillard"],
    P03:["dillard","kierkegaard"],P04:["kierkegaard","dillard"],
    P05:["dillard","kierkegaard"]
  }),
  phaseNames:["baseline","immediate","delayed"],
  followupHours:{min:20,max:28},
  dimensions:[
    "interaction_comprehension_0_2",
    "philosophical_comprehension_baseline_post_0_4",
    "source_grounded_correctness_pass_review_block",
    "counterexample_understanding_0_2",
    "delayed_recall_0_2",
    "qualitative_engagement_verbatim"
  ],
  thresholds:Object.freeze({
    interactionFullPerGame:4,interactionPossiblePerGame:5,
    philosophyPostAtLeast3PerGame:4,philosophyPossiblePerGame:5,
    nonRegressingImprovers:3,improverPossible:5,minImprovementOneGame:1,
    counterexampleFullPerGame:4,counterexamplePossiblePerGame:5,
    validFollowups:4,followupPossible:5,
    bothIdeasFullDelayed:3,delayedPossible:5,
    sourceReviewerBothRequired:true,noUnresolvedP0:true
  }),
  originalCorrectOptionsResearcherOnly:{dillard:"A",kierkegaard:"B"}
});

const validTime=x=>typeof x==="string"&&x!==""&&Number.isFinite(Date.parse(x));
const text=x=>typeof x==="string"&&x.trim().length>0;
const nullableScore=(x,max)=>x===null||(Number.isInteger(x)&&x>=0&&x<=max);
const canonicalMatches=(choice,game)=>{
  if(!choice||typeof choice!=="object"||Array.isArray(choice)||choice.gameId!==game)return false;
  if(game==="token_studio"){
    return Array.isArray(choice.amounts)&&choice.amounts.length===3&&
      choice.amounts.every(x=>Number.isInteger(x)&&x>=0&&x<=6)&&
      choice.amounts.reduce((a,b)=>a+b,0)===6&&choice.repetitions===5;
  }
  return Array.isArray(choice.path)&&choice.path.length===3&&
    choice.path.every(x=>typeof x==="string"&&/^[a-z][a-z0-9_-]{0,40}$/.test(x));
};
const asError=(where,reason)=>({where,reason});
const keys=Object.freeze({
  dillard:{condition:"token_studio",source:"research:dillard:time-v1"},
  kierkegaard:{condition:"swipe_decision",source:"research:kierkegaard:future-v1"}
});

/**
 * Return structured validation results. This function reports only that a
 * self-reported JSON is shaped like the A-H instrument, NOT that the person
 * exists or understands anything. No participant response text is returned.
 */
export function inspectResearchBundle(b,{allowQaTestOnly=false}={}){
  const errors=[];
  if(!b||typeof b!=="object"||Array.isArray(b))
    return {valid:false,errors:[asError("root","JSON object required")]};
  if(b.schema!==STUDY.schema||b.protocolVersion!==STUDY.protocolVersion||
     b.code_sha!==STUDY.prototypeSha||b.sourceCommentId!==STUDY.sourceCommentId)
    errors.push(asError("provenance","Exact schema/source transcription/prototype SHA mismatch"));
  if(!Object.hasOwn(STUDY.assignedOrder,b.participant_id||""))
    errors.push(asError("participant_id","Must be P01..P05 (not proof of identity)"));
  const order=STUDY.assignedOrder[b.participant_id]||[];
  if(!Array.isArray(b.order)||JSON.stringify(b.order)!==JSON.stringify(order))
    errors.push(asError("order","Within-subject assigned game order differs"));
  if(b.consent?.anonymous_written!==true||typeof b.consent?.recontact!=="boolean")
    errors.push(asError("consent","Explicit written and separately recorded recontact consent required"));
  if(b.automaticScoring!==false)
    errors.push(asError("scoring","No automatic grading allowed"));
  if(!Number.isInteger(b.progress)||b.progress<0||b.progress>7)
    errors.push(asError("progress","Must be completed phase number 0–7"));
  if(!Array.isArray(b.rows)||b.rows.length!==2)
    errors.push(asError("rows","Exactly two participant–game rows required"));
  let reportedBaseline=0,reportedGlance=0,reportedImmediate=0;
  let reportedDelayed=0,structurallyValidFollowup=false;
  const rows=Array.isArray(b.rows)?b.rows:[];
  for(let i=0;i<2;i++){
    const r=rows[i],which=order[i],q=keys[which];
    if(!r||!q){
      errors.push(asError("row["+i+"]","Missing or unrecognized paired game row"));continue;
    }
    if(r.participant_id!==b.participant_id||
       r.code_sha!==STUDY.prototypeSha||r.sequence_order!==i+1||
       r.condition!==q.condition||r.source_record_id!==q.source||
       r.consent?.anonymous_written!==true)
      errors.push(asError("row["+i+"]","Mismatch of participant/code/game/sequence/source/consent"));
    if(!nullableScore(r.interaction_score_0_2,2)||
       !nullableScore(r.comprehension_before_0_4,4)||
       !nullableScore(r.comprehension_after_0_4,4)||
       !nullableScore(r.counterexample_score_0_2,2)||
       !nullableScore(r.delayed_score_0_2,2))
      errors.push(asError("row["+i+"]","Human-score field out of bound; null is missing, not zero"));
    if(r.source_grounded_correctness!==null&&
       !["PASS","REVIEW","BLOCK"].includes(r.source_grounded_correctness))
      errors.push(asError("row["+i+"]","Source review must be PASS/REVIEW/BLOCK or null"));
    if(r.scorer_id!==null&&!text(r.scorer_id))
      errors.push(asError("row["+i+"]","Human scorer identity must be nonempty code or null"));
    const needBaseline=b.progress>i*3;
    const needGlance=b.progress>i*3+1;
    const needImmediate=b.progress>i*3+2;
    if(needBaseline){
      if(!text(r.baseline_verbatim)||!validTime(r.baseline_at))
        errors.push(asError("baseline["+i+"]","Required original before-play response and timestamp missing"));
      else reportedBaseline++;
    }
    if(needGlance){
      if(!text(r.first_glance_verbatim)||!validTime(r.first_glance_at))
        errors.push(asError("first_glance["+i+"]","Required pre-action first-glance answer missing"));
      else reportedGlance++;
    }
    if(needImmediate){
      const required=["post_verbatim","misconception_reason_verbatim",
        "transfer_answer_verbatim","qualitative_quote","interaction_observation",
        "intervention_notes"];
      const missing=required.filter(k=>!text(r[k]));
      if(missing.length||!canonicalMatches(r.chosen_canonical_path,q.condition)||
         !["A","B","C"].includes(r.misconception_choice)||
         !validTime(r.immediate_at)){
        errors.push(asError("immediate["+i+"]","Original C instrument incomplete (not inferred): "+
          missing.join(", ")));
      }else reportedImmediate++;
    }
    const recordedTimes=["baseline_at","first_glance_at","immediate_at"].map(k=>r[k]);
    if(needImmediate&&recordedTimes.every(validTime)){
      if(!(Date.parse(recordedTimes[0])<=Date.parse(recordedTimes[1])&&
         Date.parse(recordedTimes[1])<=Date.parse(recordedTimes[2])))
        errors.push(asError("ordering["+i+"]","Baseline must precede first glance and immediate"));
    }
    if(b.progress===7){
      if(!text(r.delayed_answer_verbatim)||!validTime(r.delayed_date_time))
        errors.push(asError("delayed["+i+"]","Delayed answer/date required at completed status"));
      else reportedDelayed++;
      if(r.delayed_score_0_2!==null&&r.delayed_missing===true)
        errors.push(asError("delayed["+i+"]","Missing recall cannot carry an observed score"));
    }
  }
  if(b.progress>=6&&!validTime(b.studyEndedAt))
    errors.push(asError("studyEndedAt","Second game completion timestamp required"));
  if(b.progress===7){
    if(!text(b.delayed?.answer)||!validTime(b.delayed?.at)||
       !validTime(b.studyEndedAt))
      errors.push(asError("delayed","Unprompted combined answer or timestamp missing"));
    else{
      const hours=(Date.parse(b.delayed.at)-Date.parse(b.studyEndedAt))/3600000;
      if(hours<0)errors.push(asError("delayed","Recall predates completion"));
      if(!Number.isFinite(b.delayed.hours)||Math.abs(b.delayed.hours-hours)>0.01)
        errors.push(asError("delayed","Elapsed time conflicts with two timestamps"));
      const inWindow=hours>=20&&hours<=28;
      if(b.delayed.validWindow!==inWindow)
        errors.push(asError("delayed","20–28h in-window flag inconsistent"));
      if(b.delayed.validIndependent===true&&!inWindow)
        errors.push(asError("delayed","Out-of-window recall cannot be marked valid"));
      if(rows.some(r=>r.delayed_answer_verbatim!==b.delayed.answer))
        errors.push(asError("delayed","One exact combined answer must be present in BOTH rows"));
      structurallyValidFollowup=inWindow&&b.delayed.validIndependent===true;
    }
  }
  if(!allowQaTestOnly&&b.testOnly===true)
    errors.push(asError("testOnly","QA fixtures cannot be imported as real evidence"));
  return {
    valid:errors.length===0,errors,reportedParticipantCode:b.participant_id??null,
    gameRows:rows.length,progress:b.progress??null,
    reportedBaseline,reportedFirstGlance:reportedGlance,
    reportedImmediate,reportedDelayed,structurallyValidFollowup,
    humanIdentityVerified:false,humanPhilosophicalScoresVerified:false
  };
}

/**
 * Never turn syntactic consistency into genuine study data or PASS.
 * Also distinguish observed missing delayed response from observed wrong (0).
 */
export function summarizePrivateDirectory(directory){
 const report={
  gate:"CZ-125",status:"METHOD_REVIEW_PENDING",
  enrollmentAuthorized:false,preregistrationSource:"FOUNDER_SUPPLIED_A_H_TRANSCRIPTION",
  sourceCommentId:STUDY.sourceCommentId,nativeDocumentDirectlyRead:false,
  prototypeSha:STUDY.prototypeSha,
  requiredDistinctAdults:STUDY.participants,requiredGameRows:STUDY.observations,
  declaredGameOrder:STUDY.assignedOrder,dimensions:STUDY.dimensions,
  thresholds:STUDY.thresholds,
  actualVerifiedHumanParticipants:0,actualVerifiedHumanGameRows:0,
  actualVerifiedBaseline:0,actualVerifiedImmediate:0,actualVerifiedDelayed:0,
  actualVerifiedPhilosophicalGains:0,
  structurallyValidPrivateBundles:0,structurallyReportedGameRows:0,
  structurallyReportedBaseline:0,structurallyReportedImmediate:0,
  structurallyReportedDelayed:0,structurallyInWindowFollowups:0,
  missingDelayedFlags:0,privateFileCount:0,errors:[],
  notes:[
    "No human participants are verified by code. Local file presence/JSON never certifies a real reader, scorer, or philosophical learning.",
    "Only genuine human interviews independently assessed under the recovered six original axes can count.",
    "No automatic philosophical correctness, efficacy threshold PASS, human testimonials or fabricated participant data.",
    "Missing delayed responses are missing (null), NOT observed wrong (0).",
    "No participant recruitment or export in committed form until independent methodology approval and separate release."
  ]
 };
 if(!directory)return report;
 try{
  const names=readdirSync(resolve(directory),{withFileTypes:true})
   .filter(x=>x.isFile()&&/\.json$/i.test(x.name)).map(x=>x.name);
  report.privateFileCount=names.length;
  const seen=new Set();
  for(const name of names){
    let item;
    try{
      const raw=readFileSync(join(resolve(directory),name));
      if(raw.length>262144)throw Error("file exceeds 256 KiB");
      item=JSON.parse(raw.toString("utf8"));
    }catch(e){report.errors.push(name+": unreadable JSON/size: "+e.message);continue;}
    const x=inspectResearchBundle(item);
    if(!x.valid){report.errors.push(name+": malformed study bundle: "+x.errors.map(z=>z.reason).join("; "));continue;}
    if(seen.has(x.reportedParticipantCode)){
      report.errors.push(name+": duplicate participant snapshot; select a single latest private file per anonymous code");
      continue;
    }
    seen.add(x.reportedParticipantCode);
    report.structurallyValidPrivateBundles++;
    report.structurallyReportedGameRows+=x.gameRows;
    report.structurallyReportedBaseline+=x.reportedBaseline;
    report.structurallyReportedImmediate+=x.reportedImmediate;
    report.structurallyReportedDelayed+=x.reportedDelayed;
    if(x.structurallyValidFollowup)report.structurallyInWindowFollowups++;
    if(x.progress===6)report.missingDelayedFlags++;
  }
 }catch(e){report.errors.push("Private folder could not be inspected: "+e.message);}
 return report;
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
 const report=summarizePrivateDirectory(process.argv[2]);
 console.log(JSON.stringify(report,null,2));
 if(report.errors.length)process.exitCode=2;
}
