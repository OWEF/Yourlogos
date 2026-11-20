/**
 * CZ-154 M3 R1 — PUBLIC authoring-side prerequisite triage.
 *
 * This module is not imported by the app or source registry. It never fills in
 * missing evidence, never changes a source hash, and never changes the strict
 * sealUniversalSource validator. Sealed QA dossiers do not belong here.
 */
import {OPERATION_FAMILIES,sealUniversalSource} from "./yl-cz147-engines.mjs";

const has=(x,key)=>x!==null&&typeof x==="object"&&Object.hasOwn(x,key);
const read=(root,path)=>path.split(".").reduce((node,key)=>
 node!==null&&typeof node==="object"&&has(node,key)?node[key]:undefined,root);
const missingValue=v=>v===undefined||v===null||
 typeof v==="string"&&v.trim()===""||Array.isArray(v)&&v.length===0;
const fail=(code,reason)=>({status:"blocked",code,reason,publicationAllowed:false});
const noFit=(code,reason,extra={})=>({status:"no_fit",code,reason,
 ...extra,publicationAllowed:false});
const evidence=(path,why,sourceEvidence)=>({path,why,sourceEvidence});
const def=(path,type,why,sourceEvidence)=>({path,type,why,sourceEvidence});
const BASE=[
 def("quoteId","integer","A stable catalogue identity must bind authoring to an immutable quotation.","Catalogue quote ID and authenticated quotation witness"),
 def("recordId","string","The contract must have an unambiguous authoring identity.","A stable editorial record ID"),
 def("version","string","Changes to authored premises need versioned re-review.","Editorial record version"),
 def("status","string","Only an explicitly provisional record can enter this isolated authoring process.","Development-provisional review status"),
 def("familyId","string","A supported presentation family is needed to validate the philosophical operation.","Supported consumer game family"),
 def("title","string","The encounter must identify its authored scope.","Reviewed encounter title"),
 def("intro","string","A scene cannot be inferred from the source quotation.","Reviewed fictional situation"),
 def("humanTension","string","Human stakes must be authored, not fabricated at runtime.","Reviewed human tension"),
 def("sourceThesis","string","The argument must be grounded in the authenticated philosophical passage.","A claim with source passage and editorial justification"),
 def("evidenceClaim","string","The stated application of the source requires an editorial warrant.","Source-to-scenario evidence claim"),
 def("epistemicLimits","string","Unknown real or fictional outcomes must remain unknown.","Specific limits of the available evidence"),
 def("compactLimit","string","A short response cannot silently omit its epistemic qualification.","Source-and-scenario compact qualification"),
 def("counterexample","string","The interpretation needs a grounded limiting case.","Specific source-supported counterexample"),
 def("readerAgency","string","Reader agency cannot be invented from editorial notes.","Source-authored account of available choices"),
 def("reflectionQuestion","string","The reflection must be tied to a warranted tension.","A source-grounded reconsideration question"),
 def("source.text","string","The quote must not be reconstructed from general recollection.","Verbatim authenticated source text"),
 def("source.author","string","Source attribution is required before any READY interpretation.","Authenticated author attribution"),
 def("source.work","string","The quoted work must be identifiable and version-matched.","Authenticated work and translation/edition identity"),
 def("source.referenceUrl","string","A traceable passage must be available to independent source review.","Direct bibliographic source or original passage URL"),
 def("philosophicalOperation.kind","string","An unsupported operation cannot be replaced by a generic philosophical fallback.","Explicit operation supported by the universal engine"),
 def("philosophicalOperation.focus","string","An operation without a warranted focus cannot determine meaning.","Source-authored philosophical focus"),
 def("philosophicalOperation.contrast","string","A meaningful operation needs a source-specific contrast.","Evidence-backed philosophical contrast"),
 def("philosophicalOperation.sourceWarrantIds","array","Each operation must cite existing record warrants.","Exact source warrant IDs"),
 def("evidenceIds","array","The engine must not invent citation keys.","Reviewed source and scenario evidence IDs"),
 def("affordances","array","Available rhetorical strategies need explicit editorial authorization.","Permitted emotion-strategy affordances"),
 def("supportedConclusions","array","The engine requires a bounded set of permitted inferences.","Source-authored supported conclusions"),
 def("prohibitedInferences","array","Unsupported conclusions must be explicitly prohibited.","Known inference boundaries"),
 def("developmentOnly","boolean","A preview record must declare its scope explicitly.","Development admission flag"),
 def("publicationAllowed","boolean","Publication authorization cannot be inferred.","Explicit false publication flag")
];
const DIRECTOR=[
 def("director.version","string","Director replay requires a versioned scenario.","Scenario ledger version"),
 def("director.operation","string","The Director operation must match the philosophical source.","Source-compatible operation"),
 def("director.source.quoteId","integer","Director source identity must match the clicked quote.","Same authenticated quote ID"),
 def("director.source.text","string","An authored scenario needs the exact source text.","Same authenticated source passage"),
 def("director.source.author","string","An authored scenario needs the same source author.","Same authenticated author"),
 def("director.source.work","string","An authored scenario needs the exact source work.","Same authenticated edition/work"),
 def("director.source.referenceUrl","string","An authored scenario needs its source URL.","Original passage URL"),
 def("director.source.warrants","object","Source-based deductions need declared, attributable warrants.","Warrant ID to authenticated passage explanation"),
 def("director.sourceFingerprint","string","Runtime source identity must be reproducible.","Computed source fingerprint, not a guessed value"),
 def("director.scenarioFingerprint","string","Scenario replay must be deterministic and tamper-evident.","Computed scenario fingerprint"),
 def("director.openingChoices","array","Participant alternatives must be source-authored.","Exact first actions and their grounded effects"),
 def("director.selfFacts","array","The Director cannot infer new personal facts.","Reviewed deterministic self-fact vocabulary"),
 def("director.externalEvent.id","string","Independent external evidence must be traceable.","Authored event identity"),
 def("director.externalEvent.text","string","The event cannot be inferred from the participant's wording.","Reviewed independent event literal"),
 def("director.externalEvent.observed","array","External observed facts must be explicit.","Independent event observations"),
 def("director.externalEvent.unknowns","array","Unobserved outcomes must remain unknown.","Unknowable external facts"),
 def("decisionWarrant.fact","string","Philosophical judgment must be tied to a replayed participant fact.","Recorded fact and matching source warrant"),
 def("decisionWarrant.warrantId","string","A claim without a source warrant cannot be used.","Authenticated source warrant ID"),
 def("decisionWarrant.established.inference","string","The established route needs a supported claim.","Grounded inference for established fact"),
 def("decisionWarrant.outstanding.inference","string","The outstanding route cannot copy the established claim.","Grounded inference for missing fact")
];
const ARGUMENT=[
 def("sourceArgument.version","string","Authored argumentative reasons must be versioned.","source-argument/1"),
 def("sourceArgument.warrantId","string","An explanatory WHY cannot be ungrounded.","Authenticated source warrant for the reason"),
 def("sourceArgument.anchor","string","An identifiable passage must support the argument.","Exact evidence excerpt from the authenticated source"),
 def("sourceArgument.compactThesis","string","The compact WHAT needs source wording.","Concise central distinction"),
 def("sourceArgument.compactReason","string","The compact WHY needs source reasoning.","Concise source-supported argumentative reason"),
 def("sourceArgument.fullThesis","string","The full WHAT needs source wording.","Central source distinction"),
 def("sourceArgument.fullReason","string","The full WHY needs source reasoning.","Source-supported argumentative reason")
];
function safeData(value){
 const active=new WeakSet();let entries=0;
 function visit(v,depth){
  if(v===null||typeof v==="boolean")return true;
  if(typeof v==="string")return v.length<=10000;
  if(typeof v==="number")return Number.isFinite(v);
  if(typeof v!=="object"||depth>24||active.has(v))return false;
  active.add(v);
  const proto=Object.getPrototypeOf(v);
  if(Array.isArray(v)){if(v.length>250)return false;}
  else if(proto!==Object.prototype&&proto!==null)return false;
  const descriptors=Object.getOwnPropertyDescriptors(v);
  const keys=Reflect.ownKeys(descriptors);
  if(keys.length>350||keys.some(k=>typeof k==="symbol"||
    ["__proto__","constructor","prototype"].includes(k)))return false;
  entries+=keys.length;if(entries>12000)return false;
  for(const k of keys){
   const d=descriptors[k];
   if(!("value" in d)||!visit(d.value,depth+1))return false;
  }
  active.delete(v); // Reused immutable arrays/objects are not cycles.
  return true;
 }
 try{return visit(value,0);}catch{return false;}
}
function acceptableType(v,type){
 switch(type){
  case "string":return typeof v==="string"&&v.trim().length>0;
  case "integer":return Number.isSafeInteger(v)&&v>=0;
  case "boolean":return typeof v==="boolean";
  case "array":return Array.isArray(v)&&v.length>0;
  case "object":return v!==null&&typeof v==="object"&&!Array.isArray(v);
  default:return false;
 }
}
/**
 * Authoring-only classification; never calls runtime resolve/run.
 * Returns ready only AFTER strict sealUniversalSource approves.
 *
 * No claims of source truth are automated. Valid source text and warrants
 * still require independent editorial authentication and sealed-source QA.
 */
export function preflightUniversalAuthoring(record,{quoteLedger}={}){
 if(!safeData(record)||!record||Array.isArray(record)||
    typeof record!=="object")return fail("malformed_authoring_input",
     "Expected a finite, plain, JSON-compatible authoring record with no accessors or unsafe keys");
 if(quoteLedger!==undefined&&(!safeData(quoteLedger)||!Array.isArray(quoteLedger)))
  return fail("malformed_quote_ledger","The optional quote ledger must be a safe array");
 const op=read(record,"philosophicalOperation.kind");
 const family=read(record,"familyId");
 if(!missingValue(op)&&typeof op!=="string")
  return fail("invalid_operation_type","Operation must be an authored string");
 if(!missingValue(family)&&typeof family!=="string")
  return fail("invalid_family_type","Family must be a string");
 if(typeof op==="string"&&op.trim()!==""&&!Object.hasOwn(OPERATION_FAMILIES,op))
  return noFit("unsupported_philosophical_operation",
   "No authorized universal operation supports the claimed kind: "+op,
   {operation:op});
 if(typeof op==="string"&&typeof family==="string"&&
    Object.hasOwn(OPERATION_FAMILIES,op)&&
    ![].concat(OPERATION_FAMILIES[op]).includes(family))
  return noFit("operation_family_incompatible",
   "The claimed operation "+op+" does not support the authored family "+family,
   {operation:op,familyId:family});
 const spec=[...BASE];
 if(["agency_vs_external_reply","independent_judgment"].includes(op)||
    record.director!==undefined||record.decisionWarrant!==undefined){
  spec.push(...DIRECTOR);
  if(record.director?.followUps===undefined&&
     record.director?.followUpActions===undefined)
   spec.push(def("director.followUpActions","array",
    "An authored follow-up action set is required; do not infer decisions.",
    "Exact authored follow-up choices (or existing followUps keyed routes)"));
 }
 if(op==="deliberate_use"||op==="habitual_pattern"||op==="attention_evasion")
  spec.push(def("allocation","object","Finite allocations need reviewed data.","Capacity and choice schema"));
 if(["coordinated_work","self_governance","source_relation"].includes(op))
  spec.push(def("relation","object","Source relations require authored edges.","Reviewed relation cards and warrants"));
 if(["retrospective_limits","incremental_beginning","practical_commitment",
   "event_acceptance","anticipated_vs_actual","non_retaliation"].includes(op))
  spec.push(def("timeline","array","Timeline decisions need source-authorized branches.","Reviewed three-stage timelines"));
 if(record.sourceArgument!==undefined)spec.push(...ARGUMENT);
 const missing=[],invalid=[];
 for(const d of spec){
  const v=read(record,d.path);
  if(missingValue(v)){
   missing.push(evidence(d.path,d.why,d.sourceEvidence));
  }else if(!acceptableType(v,d.type)){
   invalid.push(d.path);
  }
 }
 if(invalid.length)return {...fail("invalid_authoring_types",
  "Fields have incompatible types; neither absence nor source incompatibility was established"),
  invalidPaths:invalid};
 // An explicit mismatch is established incompatibility, not missing material.
 if(typeof record.director?.operation==="string"&&typeof op==="string"&&
    record.director.operation!==op)
  return noFit("director_operation_incompatible",
   "The authored Director operation contradicts the source's declared operation",
   {operation:op,directorOperation:record.director.operation});
 if(record.sourceArgument&&typeof record.sourceArgument.warrantId==="string"){
  const id=record.sourceArgument.warrantId;
  if(!has(record.director?.source?.warrants,id)||
     missingValue(record.director.source.warrants[id]))
   missing.push(evidence("director.source.warrants."+id,
    "A reason without a source-warrant passage cannot become a READY statement.",
    "Exact authenticated passage and source-specific WHY warrant for "+id));
  if(Array.isArray(record.evidenceIds)&&!record.evidenceIds.includes(id))
   missing.push(evidence("evidenceIds."+id,
    "The proposed reason must be admitted to the reviewed evidence vocabulary.",
    "Source-editor-authorized warrant ID "+id));
 }
 if(missing.length)return {status:"needs_source_metadata",
  code:"missing_source_prerequisites",missing,publicationAllowed:false};
 if(record.status!=="development_provisional"||record.publicationAllowed!==false)
  return fail("unsafe_authoring_status","Only development-provisional, publication-disabled records may be preflighted");
 if(quoteLedger!==undefined){
  const q=quoteLedger[record.quoteId];
  if(!Array.isArray(q)||q[0]!==record.source.text||
     q[1]!==record.source.author||q[3]!==record.source.work)
   return noFit("source_identity_incompatible",
    "The authored quotation, author or work is inconsistent with the immutable quote ledger");
 }
 const sealed=sealUniversalSource(record);
 if(sealed.status==="blocked")return {...sealed,
  reason:"All named prerequisites are present, but the unchanged strict source seal rejected contradictory or invalid authoring: "+sealed.reason};
 return {status:"ready",code:"strict_seal_eligible",
  sourceFingerprint:sealed.sourceFingerprint,
  sourceRecordId:sealed.recordId,publicationAllowed:false};
}
