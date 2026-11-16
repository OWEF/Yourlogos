/**
 * CZ-145 / B2.7 human-centered source-to-dilemma layer.
 * Research-only. Versioned source record, not a retroactive correction
 * of the frozen six-game/B2.6 contracts or a publisher's source signoff.
 *
 * Source thesis -> human tension -> fictional scenario -> actual user action
 * -> warranted relation -> epistemic limits. Reject sentimental
 * moral inferences from Adam Smith's division of labour.
 */
import {PAIR_SOURCE_RECORDS,validateCanonicalPairsB26}
 from "./yl-b26-relations.mjs";
import {fingerprintB25,stableB25}
 from "./yl-b25-authored-scenarios.mjs";
export const HUMAN_VERSION="source-to-human-dilemma/2.7.0";
const smith=PAIR_SOURCE_RECORDS.find(x=>x.source.author==="Adam Smith");
if(!smith)throw Error("Missing inherited Smith source warrant");
const authored={
 recordId:"b27:smith-gift-coordination",
 version:HUMAN_VERSION,familyId:"tap_pair",
 operation:"source_warranted_relation",
 source:{...smith.source},
 sourceOriginFingerprint:smith.sourceFingerprint,
 warrant:{...smith.warrant,
  authoredScenarioBridge:"Two fictional friends need to make one birthday gift by tomorrow. One person can keep the work entirely to themselves, or split making and assembly across both contributors. This is not an actual friendship or a claim about kindness.",
  limitations:"Smith's division of labour does not establish whether dividing this gift is wiser, kinder, more trustworthy or morally better. The deadline and friendship are invented narrative constraints."
 },
 humanTension:"Keeping control of your vision or depending on another contribution before tomorrow.",
 scenario:{
  title:"A gift due tomorrow",
  description:"You and a friend promised a birthday gift for tomorrow. Doing every part alone protects your original design; dividing the tasks could create a joint result, but it also means depending on both contributions.",
  question:"Which contribution becomes important when two people split the work, and what can this model never decide for you?",
  fictional:true,
  introducedHumanStakes:["deadline","personal control","shared responsibility"],
  assertedBySmith:["specialization of tasks","coordination","dependence in joint production"],
  notAssertedBySmith:["friendship virtue","trustworthiness","fairness","moral superiority","actual speedup"]
 },
 cards:[
  {id:"sketch",label:"Your design",role:"invented_design_stage",glyph:"pages",detail:"The first imagined contribution"},
  {id:"friend",label:"Friend's handiwork",role:"invented_making_stage",glyph:"hand",detail:"Another imagined contribution"},
  {id:"assemble",label:"Putting it together",role:"invented_assembly_stage",glyph:"link",detail:"A separate task"},
  {id:"gift",label:"The finished gift",role:"invented_completed_work",glyph:"book",detail:"The hypothetical joint result"}
 ],
 edges:[
  {aId:"sketch",bId:"friend",relationId:"complementarity",label:"Different contributions",
   claim:"In this invented gift, the design and the friend's handiwork can contribute different parts of one result.",
   warrantIds:["source:central","scenario:fictional"]},
  {aId:"friend",bId:"assemble",relationId:"coordination",label:"Linked tasks",
   claim:"The imagined friend's handiwork still needs assembly to become the shared gift.",
   warrantIds:["source:central","scenario:fictional"]},
  {aId:"sketch",bId:"gift",relationId:"dependence",label:"Design and result",
   claim:"The fictional completed gift depends partly on its design.",
   warrantIds:["source:central","scenario:fictional"]},
  {aId:"friend",bId:"gift",relationId:"dependence",label:"Contribution and result",
   claim:"The finished gift depends partly on the friend's imagined contribution if the work is divided.",
   warrantIds:["source:central","scenario:fictional"]},
  {aId:"assemble",bId:"gift",relationId:"dependence",label:"Finishing matters",
   claim:"The imagined gift is not complete until its separate contributions are put together.",
   warrantIds:["source:central","scenario:fictional"]}
 ],
 consideredAdaptations:[
  {scenario:"A friend shares private secrets to prove mutual trust",
   verdict:"REJECTED",reason:"Confuses Smith's productive division and coordinated tasks with moral trust and interpersonal virtue, which the source does not establish."},
  {scenario:"Two friends divide material work on a birthday gift",
   verdict:"PROVISIONAL_INTERNAL",reason:"Preserves distinct work stages and dependence of a combined result without asserting friendship, moral rank or historical productivity gains."}
 ],
 sourceThesis:smith.warrant.centralClaim,
 sourceWarrantIds:["source:central","scenario:fictional","source:boundary"],
 sourceLimits:smith.warrant.limitations,
 supportedFamilyIds:["tap_pair"],
 choiceSchema:"{pairs:[{aId,bId,relationId}]}",
 editorialReview:"founder_provisional_development_only",
 publicationAllowed:false,independentlyScholarlyApproved:false,
 alternativeScenario:"A small team splitting poster design and printing for a student event would illustrate distinct work stages but has weaker personal tension.",
 fallbackReason:"A reading-first route is required if source wording or constructed example fails editorial review."
};
export const SMITH_HUMAN_CONTRACT=Object.freeze({
 ...authored,contentFingerprint:fingerprintB25(authored)
});
export function inspectSmithHuman(input){
 const c=SMITH_HUMAN_CONTRACT;
 if(typeof input==="string")return input===c.recordId?c:null;
 return input&&stableB25(input)===stableB25(c)&&
  fingerprintB25(Object.fromEntries(
   Object.entries(c).filter(([key])=>key!=="contentFingerprint")
  ))===c.contentFingerprint?c:null;
}
const wordCount=s=>s.trim().split(/\s+/).filter(Boolean).length;
const caps=[[10,48],[18,65],[9,26]];
export function runSmithHumanEncounter(ref,input){
 const record=inspectSmithHuman(ref);
 if(!record)return {status:"no_fit",reason:"No exact authenticated human analogy"};
 const pair=validateCanonicalPairsB26(input,record);
 if(pair.status!=="valid")return pair;
 const evidence=pair.evidence;
 const meaning={
  status:"ready",version:"meaning:smith-human-relations/2.7.0",
  meaning:{kind:"source_warranted_relation",centralClaim:record.sourceThesis,
   selectedRelations:evidence,limitations:record.warrant.limitations},
  canonical:pair.canonical,source:record.source,
  authoredScenarioNotHistorical:true,personalMoralVerdict:false,
  unknowns:["what the friend will do","whether dividing the work is wise"],
  sourceFingerprint:record.contentFingerprint
 };
 const first="You connected "+evidence.map(e=>e.left+" with "+e.right).join("; ")+
  ". This was a connection you chose within a fictional gift-making situation, not a judgment of the actual people involved.";
 const second=record.sourceThesis+" "+
  evidence.map(e=>e.claim).join(" ")+" "+
  "The scenario illustrates a dependency, not a general rule about friends, virtue, or whether collaboration is best.";
 const third="What might you gain by sharing the work, and what remains beyond this imagined example's reach?";
 const contents=[first,second,third],counts=contents.map(wordCount),total=counts.reduce((a,b)=>a+b,0);
 if(total<80||total>120||counts.some((x,i)=>x<caps[i][0]||x>caps[i][1]))
  return {status:"needs_editorial_review",reason:"The source-grounded full expression cannot satisfy bounds without loss",counts,total};
 const emotion={status:"ready",version:"emotion:source-evidence/2.7.0",
  strategy:"curious_reflection",inferredActualEmotion:false,inferredMoralRank:false,
  evidenceIds:["source:central","scenario:fictional"]};
 const expression={
  status:"ready",version:"expression:smith-human-replay/2.7.0",
  sections:contents.map((text,i)=>({
   label:["Your Choice","Back to the Philosopher","One Last Thing…"][i],text,
   evidenceIds:i===0?["choice:pairs","scenario:fictional"]:["source:central","scenario:fictional","source:boundary"]
  })),wordCount:total,sectionWordCounts:counts,sourceFingerprint:record.contentFingerprint,
  author:record.source.author,quote:record.source.quote,sourceUrl:record.source.referenceUrl
 };
 return {
  status:"ready",version:HUMAN_VERSION,selectedFamilyId:"tap_pair",
  sourceRecordId:record.recordId,sourceVersionHash:record.contentFingerprint,
  canonical_choice:pair.canonical,meaning,emotion,expression,
  expressionVerification:"source-bound-human-pair-replay/2.7.0",
  sourceReview:"founder_provisional_not_scholarly_verified",
  provenance:{authoredAnalogyNotHistorical:true,sourceOriginFingerprint:record.sourceOriginFingerprint,
   authoredEventCausedByReader:false,unchosenFutureKnown:false,personalMoralVerdict:false},
  publicationAllowed:false,productionPlayable:false,accountPersistenceAllowed:false
 };
}
