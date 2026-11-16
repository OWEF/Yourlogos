/**
 * CZ-141 B2.6 — isolated localhost FOUR-family real Encounter preview.
 * A single source registry and ONE exact four-family selection boundary.
 * No public routing, persistence, account changes or paid generation.
 */
import http from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {DILLARD_V21,KIERKEGAARD_V21,HEGEL_NO_FIT_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
import {B23_SOURCE_CONTRACTS}
 from "./yl-b23-founder-six-peer.mjs";
import {B25_BALANCE_CONTRACTS}
 from "./yl-b25-authored-scenarios.mjs";
import {catalogueB25}
 from "./yl-b25-encounter-server.mjs";
import {PAIR_SOURCE_RECORDS}
 from "./yl-b26-relations.mjs";
import {assessInteractionFamiliesB26,INTERACTION_FAMILIES}
 from "./yl-b26-four-family-contract.mjs";
import {runFourFamilyEncounterB26}
 from "./yl-b26-encounter.mjs";
export const B26_PREVIEW_VERSION="source-grounded-four-tactile-families/2.6.0";
const base=catalogueB25();
const catalogueMap={
 dillard:DILLARD_V21,
 kierkegaard_map:KIERKEGAARD_V21,
 thoreau_balance:B25_BALANCE_CONTRACTS[0].recordId,
 kierkegaard_future:B23_SOURCE_CONTRACTS[1].recordId,
 thoreau_weekend:B25_BALANCE_CONTRACTS[1].recordId,
 dillard_pattern:B25_BALANCE_CONTRACTS[2].recordId,
 epictetus_relations:PAIR_SOURCE_RECORDS[0].recordId,
 smith_relations:PAIR_SOURCE_RECORDS[1].recordId,
 hegel_no_fit:HEGEL_NO_FIT_V21
};
const refs=Object.freeze(catalogueMap);
const relations=[
 {key:"epictetus_relations",title:"What belongs to your choice?",
  intro:"Connect choices and outcomes without confusing control with prediction",
  contract:PAIR_SOURCE_RECORDS[0]},
 {key:"smith_relations",title:"How do separate parts work together?",
  intro:"Connect the contributions in an imagined bookmaking workshop",
  contract:PAIR_SOURCE_RECORDS[1]}
];
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const block=(code,reason)=>({status:"blocked",code,reason,
 publicationAllowed:false,productionPlayable:false});
const name={
 balance_move:"Balance & Move",decision_cards:"Decision Cards",
 tap_pair:"Tap & Pair",flip_reveal:"Flip & Reveal"
};
function modelOf(desc){
 if(desc.kind==="allocation"){
  const capacity=desc.capacity;
  return {resourceCapacity:capacity,resourceType:"exact",
   choices:desc.choices.map(c=>({id:c.id,label:c.label})),
   initial:[2,2,capacity-4],repetitions:desc.repetitions,
   unitName:"half-hour slots",
   lenses:[],sourceCapacityMode:"exact"};
 }
 if(desc.kind==="balance"){
  const record=B25_BALANCE_CONTRACTS.find(c=>c.recordId===
   (typeof refs[desc.key]==="string"?refs[desc.key]:null));
  const cap=record.scenario.capacity;
  return {resourceCapacity:cap,resourceType:record.context.model.resources[0].type,
   choices:desc.choices.map(c=>({id:c.id,label:c.label})),
   initial:[...record.context.initial.amounts],
   repetitions:record.scenario.repetitions,
   unitName:record.scenario.unitName,
   lenses:desc.lenses??[],sourceCapacityMode:record.scenario.capacityMode};
 }
 return null;
}
function contentsForSource(row){
 const ref=refs[row.key],capability=assessInteractionFamiliesB26(ref);
 const family=capability.selectedFamilyId??null;
 // Older B2.5 curated records store the text under record.source;
 // newer authored scenarios already expose text at the catalogue layer.
 // Never substitute authored display prose for a missing source quote.
 const trustedSource=typeof ref==="object"&&ref?.source?.author&&ref?.source?.quote?
  ref.source:null;
 return {
  key:row.key,title:row.title,intro:row.intro,
  familyId:family,familyLabel:family?name[family]:null,
  sourceStatus:capability.status,sourceFingerprint:capability.sourceVersionHash??null,
  author:trustedSource?.author??row.author,
  work:trustedSource?.work??row.work,
  quote:trustedSource?.quote??row.quote,
  sourceUrl:trustedSource?.referenceUrl??row.sourceUrl??null,
  sourceReview:"founder_provisional_not_independently_source_verified",
  selectionTrace:capability.selectionTrace??null,
  eligibleFamilies:INTERACTION_FAMILIES.map(id=>({
   id,eligible:Boolean(capability.eligibleFamilies?.some(x=>x.id===id)),
   reason:capability.eligibleFamilies?.find(x=>x.id===id)?.reason||
    capability.excludedFamilies?.find(x=>x.id===id)?.reason||
    "This source is not admitted for that interaction"
  })),
  allocation:modelOf(row),
  timeline:row.routes??null,relation:null,
  publicationAllowed:false
 };
}
export function catalogueB26({qa=false}={}){
 const list=base.map(contentsForSource);
 for(const item of relations){
  const cap=assessInteractionFamiliesB26(item.contract.recordId);
  list.push({
   key:item.key,title:item.title,intro:item.intro,
   familyId:cap.selectedFamilyId??null,familyLabel:name.tap_pair,
   sourceStatus:cap.status,sourceFingerprint:cap.sourceVersionHash,
   author:item.contract.source.author,work:item.contract.source.work,
   quote:item.contract.source.quote,
   sourceUrl:item.contract.source.referenceUrl,
   sourceReview:"founder_provisional_not_independently_source_verified",
   selectionTrace:cap.selectionTrace??null,
   eligibleFamilies:INTERACTION_FAMILIES.map(id=>({
    id,eligible:id==="tap_pair",
    reason:id==="tap_pair"?"Authored source-evidenced relations":"No source-supported matching operator"
   })),
   allocation:null,timeline:null,
   relation:{title:item.contract.scenario.title,
    prompt:item.contract.scenario.description,
    cards:item.contract.cards.map(({id,label,role,glyph,detail})=>({
     id,label,role,glyph,detail
    })),
    edges:item.contract.edges.map(({aId,bId,relationId,label})=>({
     aId,bId,relationId,label
    })),
    maximumPairs:2,minimumPairs:1,
    noCorrectMatch:true,sourceMeaningOperation:item.contract.operation},
   publicationAllowed:false
  });
 }
 if(qa){
  const no=assessInteractionFamiliesB26(HEGEL_NO_FIT_V21);
  list.push({key:"hegel_no_fit",title:"An idea not suited to these games",
   intro:"This source has no faithful game representation yet; reading is appropriate.",
   familyId:null,familyLabel:null,sourceStatus:no.status,
   author:HEGEL_NO_FIT_V21.source.author,work:HEGEL_NO_FIT_V21.source.work,
   quote:HEGEL_NO_FIT_V21.source.quote,sourceUrl:null,
   sourceReview:"catalogue_only",selectionTrace:null,
   eligibleFamilies:INTERACTION_FAMILIES.map(id=>({id,eligible:false,
    reason:"No warranted interaction from the source"})),
   allocation:null,timeline:null,relation:null,publicationAllowed:false});
 }
 return list;
}
const files={
 "/":"yl-b26-encounter.html",
 "/yl-b26-encounter.html":"yl-b26-encounter.html",
 "/yl-b26-encounter.js":"yl-b26-encounter.js",
 "/yl-b26-encounter.css":"yl-b26-encounter.css",
 "/philosopher-portraits.js":"../philosopher-portraits.js",
 "/philosopher-featured-art.js":"../philosopher-featured-art.js"
};
function json(res,status,payload){
 res.writeHead(status,{"content-type":"application/json; charset=utf-8",
  "cache-control":"no-store","x-content-type-options":"nosniff",
  "content-security-policy":"default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'",
  "referrer-policy":"no-referrer"});
 res.end(JSON.stringify(payload));
}
export async function createB26PreviewServer({port=0}={}){
 if(!Number.isSafeInteger(port)||port<0||port>65535)throw Error("Invalid local port");
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url||"/","http://localhost"),path=url.pathname;
  if(req.method==="GET"&&path==="/api/catalogue")
   return json(res,200,{
    version:B26_PREVIEW_VERSION,
    families:[...INTERACTION_FAMILIES],
    sources:catalogueB26({qa:url.searchParams.get("qa")==="1"}),
    normalMode:"automatic_source_selection",
    qaMode:"explicit_qa_only",
    productionAllowed:false,independentScholarlyApproval:false
   });
  if(req.method==="POST"&&(path==="/api/run"||path==="/api/run/qa")){
   try{
    let text="",bytes=0;
    for await(const chunk of req){
     bytes+=chunk.length;
     if(bytes>16000)return json(res,413,block("oversize","Too much data"));
     text+=chunk;
    }
    const message=JSON.parse(text);
    if(!isObj(message)||Object.keys(message).sort().join(",")!==
       "familyId,input,recordKey"||
       typeof message.recordKey!=="string"||
       typeof message.familyId!=="string"||!isObj(message.input))
     return json(res,422,block("invalid_input","Record, family and typed input required"));
    const ref=refs[message.recordKey];
    if(!ref)return json(res,422,block("unknown_record","Unregistered source"));
    const selected=assessInteractionFamiliesB26(ref);
    if(selected.status!=="research_selected")
     return json(res,422,block("no_fit","No source-warranted tactile game is available"));
    const qa=path==="/api/run/qa";
    if(!qa&&message.familyId!==selected.selectedFamilyId)
     return json(res,422,block("manual_qa_only",
      "Only the source-selected family is available in the consumer journey"));
    const chosen=qa?assessInteractionFamiliesB26(ref,{preferredFamilyId:message.familyId}):selected;
    if(chosen.status!=="research_selected"||
       chosen.selectedFamilyId!==message.familyId)
     return json(res,422,block("unsupported_family","Source refuses this game family"));
    const result=runFourFamilyEncounterB26(ref,chosen,message.input);
    if(result.status!=="ready")return json(res,422,result);
    return json(res,200,{
     status:"ready",selectedFamilyId:result.selectedFamilyId,
     sourceRecordId:result.sourceRecordId,
     sourceVersionHash:result.sourceVersionHash,
     sourceReview:result.sourceReview,
     canonical_choice:result.canonical_choice,
     meaningKind:result.selectedFamilyId==="tap_pair"?
       result.meaning?.meaning?.kind:result.meaning?.meaning?.kind||null,
     expressionVersion:result.expression.version,
     expressionVerification:result.expressionVerification,
     sections:result.expression.sections,
     wordCount:result.expression.wordCount,
     sectionWordCounts:result.expression.sectionWordCounts||null,
     provenance:result.provenance,
     publicationAllowed:false,productionPlayable:false,
     accountSaved:false
    });
   }catch(e){return json(res,400,block("malformed_request","Invalid preview request"));}
  }
  if(req.method==="GET"&&Object.hasOwn(files,path)){
   const file=files[path],fp=fileURLToPath(new URL("./"+file,import.meta.url));
   try{
    const data=await readFile(fp);
    const type=file.endsWith(".html")?"text/html":
      file.endsWith(".css")?"text/css":"text/javascript";
    res.writeHead(200,{"content-type":type+"; charset=utf-8",
     "cache-control":"no-store","x-content-type-options":"nosniff",
     "content-security-policy":"default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'"});
    return res.end(data);
   }catch{return json(res,404,block("missing_local_asset","Local file unavailable"));}
  }
  return json(res,404,block("not_found","Not found"));
 });
 await new Promise((ok,fail)=>server.once("error",fail).listen(port,"127.0.0.1",ok));
 return {url:"http://127.0.0.1:"+server.address().port,
  close:()=>new Promise((ok,fail)=>server.close(e=>e?fail(e):ok()))};
}
