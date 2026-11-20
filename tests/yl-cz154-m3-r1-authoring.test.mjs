import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {preflightUniversalAuthoring} from "../experiments/yl-cz147-authoring-preflight.mjs";
import {sealUniversalSource,makeUniversalRegistry} from "../experiments/yl-cz147-engines.mjs";
import {EMERSON_RECORD} from "../experiments/yl-cz155-emerson.mjs";
import {B27_APP_QUOTES} from "../experiments/yl-b27-quote-ledger.mjs";

const fresh=()=>structuredClone(EMERSON_RECORD);
const audit=[];
const collect=(name,result)=>audit.push({name,result});
test("public complete compatible source is eligible without bypassing strict sealing",()=>{
 const r=fresh();
 const pre=preflightUniversalAuthoring(r,{quoteLedger:B27_APP_QUOTES});
 collect("complete_source",pre);
 assert.equal(pre.status,"ready",JSON.stringify(pre));
 assert.equal(pre.code,"strict_seal_eligible");
 assert.equal(pre.sourceFingerprint,sealUniversalSource(r).sourceFingerprint);
 assert.equal(makeUniversalRegistry([r],B27_APP_QUOTES).size,1);
});
test("public compatible incomplete dossier asks exact independently grounded prerequisites",()=>{
 const r=fresh();
 delete r.source.work;
 delete r.director.externalEvent.unknowns;
 delete r.philosophicalOperation.focus;
 const pre=preflightUniversalAuthoring(r);
 collect("missing_prerequisites",pre);
 assert.equal(pre.status,"needs_source_metadata",JSON.stringify(pre));
 const paths=pre.missing.map(x=>x.path);
 for(const path of ["source.work","director.externalEvent.unknowns","philosophicalOperation.focus"])
  assert.ok(paths.includes(path),JSON.stringify(pre));
 for(const d of pre.missing){
  assert.ok(d.why.length>35&&d.sourceEvidence.length>15);
 }
 assert.equal(sealUniversalSource(r).status,"blocked",
  "Author preflight must never weaken strict source sealing");
});
test("public source with incompatible philosophical operation receives no_fit, not a missing-field request",()=>{
 const r=fresh();
 r.philosophicalOperation.kind="astral_prediction";
 const pre=preflightUniversalAuthoring(r);
 collect("unsupported_operation",pre);
 assert.equal(pre.status,"no_fit");
 assert.equal(pre.code,"unsupported_philosophical_operation");
 assert.match(pre.reason,/astral_prediction/);
 const m=fresh();
 m.familyId="tap_pair";
 const outcome=preflightUniversalAuthoring(m);
 collect("incompatible_family",outcome);
 assert.equal(outcome.status,"no_fit");
 assert.equal(outcome.code,"operation_family_incompatible");
});
test("specific incompatible Director operation cannot be misclassified as missing metadata",()=>{
 const r=fresh();
 r.director.operation="agency_vs_external_reply";
 const outcome=preflightUniversalAuthoring(r);
 collect("director_contradiction",outcome);
 assert.equal(outcome.status,"no_fit");
 assert.equal(outcome.code,"director_operation_incompatible");
});
test("philosopher-swapped argument has no Emerson warrant: reject unsupported transplantation",()=>{
 const r=fresh();
 r.sourceArgument={
  version:"source-argument/1",warrantId:"mistaken_dependency",
  anchor:"you will be hindered, you will lament, you will be disturbed",
  compactThesis:"Your acts are yours, not their assent",
  compactReason:"Depending on assent invites hindrance and disturbance",
  fullThesis:"Your acts are yours; another's assent isn't",
  fullReason:"Making their assent your measure exposes judgment to hindrance and disturbance"
 };
 const pre=preflightUniversalAuthoring(r);
 collect("unwarranted_source_transplant",pre);
 assert.equal(pre.status,"needs_source_metadata",JSON.stringify(pre));
 assert.ok(pre.missing.some(x=>x.path==="director.source.warrants.mistaken_dependency"));
 assert.equal(sealUniversalSource(r).status,"blocked");
});
test("missing argument source excerpt is a precise request, not fabricated source prose",()=>{
 const r=fresh();
 r.sourceArgument={
  version:"source-argument/1",warrantId:"present_judgment",
  compactThesis:"Judgment needs reasons from current evidence",
  compactReason:"Yesterday's statement cannot decide today's reasons",
  fullThesis:"Judgment needs reasons from current evidence",
  fullReason:"Yesterday's public statement cannot replace the evidence presented today"
 };
 const pre=preflightUniversalAuthoring(r);
 collect("missing_argument_excerpt",pre);
 assert.equal(pre.status,"needs_source_metadata",JSON.stringify(pre));
 assert.ok(pre.missing.some(x=>x.path==="sourceArgument.anchor"));
 assert.equal(sealUniversalSource(r).status,"blocked");
});
test("malformed, hostile, cyclical and dishonest authoring inputs fail closed",()=>{
 const cases=[
  null,[],{__proto__:null},
  Object.assign(Object.create(null),{constructor:"surprise"}),
  {get source(){throw Error("this accessor must never execute");}},
  (()=>{const o=fresh();o.self=o;return o;})(),
  (()=>{const o=fresh();o.source.text=()=>true;return o;})(),
  (()=>{const o=fresh();o.source.text="".padEnd(11000,"x");return o;})()
 ];
 for(const [i,c] of cases.entries()){
  const pre=preflightUniversalAuthoring(c);
  assert.equal(pre.status,"blocked","Case "+i+": "+JSON.stringify(pre));
 }
 const forged=fresh();
 forged.publicationAllowed=true;
 assert.equal(preflightUniversalAuthoring(forged).status,"blocked");
 const mismatched=fresh();
 mismatched.source.text="I am a different quotation";
 const identity=preflightUniversalAuthoring(mismatched,{quoteLedger:B27_APP_QUOTES});
 assert.equal(identity.status,"no_fit");
 assert.equal(identity.code,"source_identity_incompatible");
});
test("public preregistration-facing evidence only contains authored public fixtures",()=>{
 const root=process.env.YL_CZ155_EVIDENCE;
 if(root){
  mkdirSync(root,{recursive:true});
  writeFileSync(root+"/M3R1-public-authoring-preflight.json",
   JSON.stringify({fixtureClass:"PUBLIC_UNSEALED",sampleCount:audit.length,
    trials:audit},null,2)+"\n");
 }
});
