/**
 * CZ-125 evidence inventory — SOURCE-OF-TRUTH ACCESS HOLD.
 *
 * This script intentionally refuses to validate or score submissions from
 * the obsolete two-phase PR #193 form. The original six-dimensional Linear
 * study document is not fully retrievable; it would be unsound to infer its
 * questionnaire, denominators or approval from any JSON file contents.
 *
 * It never opens participants' answer text, never prints sensitive data,
 * never certifies a respondent as human and never returns study PASS.
 */
import {readdirSync} from "node:fs";
import {resolve} from "node:path";

export const APPROVAL=Object.freeze({
  preregistrationApproved:false,
  enrollmentAuthorized:false,
  originalLinearDocumentId:"bf106341-8403-4c88-a71a-67d414f2972d",
  originalFullBodyInspected:false,
  originalCommentId:"80458715-2441-4492-bcb7-945eaf3246a8",
  prototypeSha:"73849bff27fc73db97d5fb015c57f45323e18f30",
  phaseNames:["baseline","immediate","delayed"],
  originallyCommentedDelayedHours:{min:20,max:28},
  learningDimensions:{reportedCount:6,verifiedDefinitions:0},
  thresholdsVerifiedInComment:true,
  originalDenominatorsResolved:false,
  confirmedStudySampleSize:null,
  conditionalPerGameMinimum:5,
  conditionalTwoGameTotal:10
});
const report={
  gate:"CZ-125",status:"PROTOCOL_UNAPPROVED",enrollmentAuthorized:false,
  prototypeSha:APPROVAL.prototypeSha,
  originalDocumentFullBodyInspected:false,
  verifiedGenuineParticipants:0,verifiedBaseline:0,
  verifiedImmediate:0,verifiedDelayed:0,
  verifiedPairedPrePost:0,verifiedCounterexample:0,verifiedTransfer:0,
  verifiedSixDimensionScores:0,verifiedLearningGain:0,
  phaseNames:APPROVAL.phaseNames,delayedTargetHours:APPROVAL.originallyCommentedDelayedHours,
  denominatorResolved:false,conditionedMinimumPerGame:5,
  observedPrivateJsonFileCount:0,
  notes:[
    "The original complete Linear preregistration has not been inspected; study approval and enrollment remain blocked.",
    "The earlier two-phase PR #193 answers cannot establish baseline gain, counterexample/transfer competence or six-dimension scores.",
    "Any existing private JSON files are neither authenticated human submissions nor protocol-valid data; do not interpret them until methodology is approved.",
    "Do not put raw participant responses in GitHub or Linear. No automatic philosophical scoring or human authenticity claims."
  ],
  errors:[]
};
if(process.argv[2]){
 try{
  report.observedPrivateJsonFileCount=readdirSync(resolve(process.argv[2]),{withFileTypes:true})
   .filter(entry=>entry.isFile()&&/\.json$/i.test(entry.name)).length;
  if(report.observedPrivateJsonFileCount>0){
   report.notes.push("Files exist in private directory but are NOT counted as participant evidence under unapproved study.");
  }
 }catch(e){
  report.errors.push("Cannot enumerate supplied directory (no participant data read): "+e.message);
 }
}
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=2;
// Crucially never compute threshold successes, learning gain or a PASS status.
