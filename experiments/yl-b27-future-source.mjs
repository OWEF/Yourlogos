/**
 * CZ-145 B2.7 authentic JOURNAL JJ:167 alternate excerpt (Hong / Princeton).
 * Its distinct, longer temporal-limit sentence supports the source-authored
 * Flip & Reveal demonstration. The unchanged B2.6 meaning runs against the
 * SAME original JJ:167, not a newly invented Kierkegaard doctrine.
 * No publisher source verification/translation equivalence is asserted:
 * provisional DEVELOPMENT source contract only. No production admission.
 */
import {B23_SOURCE_CONTRACTS}
 from "./yl-b23-founder-six-peer.mjs";
import {fingerprintB25,stableB25}
 from "./yl-b25-authored-scenarios.mjs";
export const KIERKEGAARD_HINDSIGHT_VERSION="jj167-hindsight-limit-alternative/2.7.0";
export const KIERKEGAARD_EXCERPT=
 "The more one thinks through this clause, the more one concludes that life in temporality never becomes properly understandable…";
const raw=B23_SOURCE_CONTRACTS[1];
if(raw?.gameId!=="future_reveal"||
   raw?.source?.author!=="Søren Kierkegaard"||
   !/JJ:167/.test(raw?.source?.locator||""))throw Error("Frozen JJ:167 source unavailable");
const sourceRecord={
 recordId:"b27:kierkegaard-limits-of-hindsight-quoted-excerpt",
 version:KIERKEGAARD_HINDSIGHT_VERSION,
 familyId:"flip_reveal",
 source:{
  author:"Søren Kierkegaard",
  quote:KIERKEGAARD_EXCERPT,
  work:"The Essential Kierkegaard · Early Journal Entries, p. 12 (Hong & Hong, 2000; JJ:167 excerpt)",
  referenceUrl:"https://api.pageplace.de/preview/DT0400.9781400847174_A48880044/preview-9781400847174_A48880044.pdf",
  sourceLocation:"Early Journal Entries, p. 12; Journal JJ:167 / Pap. IV A 164 (1843)",
  reviewState:"founder_provisional_for_development",
  exactExcerptEllipsis:true,
  noIndependentScholarlySignoff:true
 },
 sourceRelation:{
  originalSourceRecordId:raw.recordId,
  unchangedMeaningContractFingerprint:raw.contentFingerprint,
  originalSourceQuote:raw.source.quote,
  sameJournalEntry:"JJ:167",
  alternateEnglishTranslation:"Hong & Hong / Princeton University Press English excerpt",
  limitation:"The shorter inherited rendering and this longer published excerpt are NOT treated as identical words; both illustrate the same 1843 journal argument."
 },
 centralThesis:"A person never stands outside time with full retrospective mastery of a lived alternative.",
 humanTension:"What would you choose knowing that no future version of you can see every possible life?",
 scenario:{
  title:"After a choice, the future is still unfinished",
  description:"Imagine deciding whether to change work or stay. Flip one author-written possibility to explore what hindsight might illuminate—and what it cannot establish.",
  readerAgency:"Choose an action, explore ONE authored fictional possibility, then choose your response.",
  assumptions:["Every future scene is fictional, not a prediction",
   "No imagined external event is caused by the reader's click",
   "No unchosen outcome is known"],
  noFitAlternative:"If the original journal is not admitted for gameplay, return source-linked reading rather than an invented prediction."
 },
 editorialReview:"FOUNDERS_PROVISIONAL_DEVELOPMENT_ONLY",
 publicationAllowed:false,independentlyScholarlyApproved:false
};
export const B27_KIERKEGAARD_HINDSIGHT=Object.freeze({
 ...sourceRecord,contentFingerprint:fingerprintB25(sourceRecord)
});
export function inspectB27Hindsight(input){
 const canonical=B27_KIERKEGAARD_HINDSIGHT;
 if(typeof input==="string")return input===canonical.recordId?canonical:null;
 if(!input||stableB25(input)!==stableB25(canonical))return null;
 const {contentFingerprint,...fields}=canonical;
 return fingerprintB25(fields)===contentFingerprint?canonical:null;
}
export function replayB27HindsightBase(){
 const c=B27_KIERKEGAARD_HINDSIGHT;
 const authoritative=B23_SOURCE_CONTRACTS[1];
 return authoritative.recordId===c.sourceRelation.originalSourceRecordId&&
  authoritative.contentFingerprint===c.sourceRelation.unchangedMeaningContractFingerprint&&
  authoritative.gameId==="future_reveal"&&
  authoritative.source.quote===c.sourceRelation.originalSourceQuote?
  authoritative:null;
}
