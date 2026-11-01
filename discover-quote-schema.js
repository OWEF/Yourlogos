// Discover quote contract v1 — shared by editorial, AI prompting and visuals.
// The source phrase is checked against the curated record; draft != published.
import {CURATED,resolveTension} from "./tension-engine.js";
import {VISUAL_BY_QUOTE,VISUAL_KINDS} from "./discover-concept-grammar.js";
import {BUNDLED_INTERPRETATION_ROWS,PILOT_ENCOUNTERS} from "./discover-quote-editorial.js";
import {getDragExercise,validateDragExercise} from "./discover-quote-drag.js";

export const DISCOVER_SPEC_VERSION=1;
export const REVIEW_CHECKS=["source","philosophy","lenses","visual","journey","accessibility"];
export const reviewState=()=>Object.fromEntries(REVIEW_CHECKS.map(x=>[x,false]));
const safeString=(v,max=360)=>typeof v==="string"?v.trim().slice(0,max):"";
const slug=(s)=>safeString(s,80).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"perspective";

function normalizeQuote(quote,id){
 const q=Array.isArray(quote)?{text:quote[0],author:quote[1],theme:quote[2],source:quote[3]}:quote||{};
 return {id,text:safeString(q.text,500),author:safeString(q.author,120),theme:safeString(q.theme,80),source:safeString(q.source,250)};
}

export function getBundledDiscoverSpec(quote,id){
 const row=BUNDLED_INTERPRETATION_ROWS[id];
 const record=resolveTension(Array.isArray(quote)?quote:[quote?.text],id);
 if(!row||row.id!==id||!record)return null;
 const q=normalizeQuote(quote,id),pilot=PILOT_ENCOUNTERS[id];
 const options=pilot?.options?.map(x=>({...x}))||row.options.map((label,i)=>({
   key:slug(label)+"-"+i,label,focus:label,insight:null
 }));
 const visual=pilot?.visual?{...pilot.visual}:{template:VISUAL_BY_QUOTE[id],
   left:record.poles[0],right:record.poles[1],
   background:row.motif,symbol:row.motif.split("-")[0],
   motion:"none"};
 return {
   schemaVersion:DISCOVER_SPEC_VERSION,kind:"bundled",id,quote:q,
   provenance:{catalogueMatch:record.match,editorialStatus:pilot?"pilot-review":"draft",
     sourceTextReviewed:false},
   philosophy:{claim:record.claim,warrant:record.warrant,poles:[...record.poles],
     friction:record.friction,interpretationStatus:"editorial-reconstruction"},
   encounter:{bridge:pilot?.bridge||null,scene:pilot?.scene||null,
     question:pilot?.question||null,options,freeText:true},
   reflection:{question:pilot?.reflection||null,saveRequiresAction:true},
   visual,conceptualExercise:{kind:"drag-substitution",variants:[0,1,2].map(i=>getDragExercise(id,i))},review:reviewState()
 };
}

export function createFutureDiscoverDraft({id,quote,philosophy={},encounter={},visual={}}={}){
 const q=normalizeQuote(quote,id);
 return {schemaVersion:DISCOVER_SPEC_VERSION,kind:"future",id,quote:q,
   provenance:{catalogueMatch:null,editorialStatus:"draft",
     sourceTextReviewed:false},
   philosophy:{claim:safeString(philosophy.claim),warrant:safeString(philosophy.warrant),
     poles:Array.isArray(philosophy.poles)?philosophy.poles.slice(0,2):[],
     friction:safeString(philosophy.friction),interpretationStatus:"needs-review"},
   encounter:{bridge:safeString(encounter.bridge,85)||null,
     scene:safeString(encounter.scene,210)||null,
     question:safeString(encounter.question,120)||null,
     options:Array.isArray(encounter.options)?encounter.options.slice(0,3).map((x,i)=>
       typeof x==="string"?{key:slug(x)+"-"+i,label:x,focus:x,insight:null}:x):[],
     freeText:true},
   reflection:{question:null,saveRequiresAction:true},
   visual:{template:visual.template||null,left:visual.left||"",right:visual.right||"",
     background:visual.background||"",symbol:visual.symbol||"",motion:visual.motion||"none"},
   conceptualExercise:{kind:"drag-substitution",variants:[]},review:reviewState()};
}

export function validateDiscoverSpec(spec,{publish=false}={}){
 const errors=[];
 if(!spec||spec.schemaVersion!==DISCOVER_SPEC_VERSION)return ["Unsupported Discover schema version"];
 if(!Number.isInteger(spec.id)||spec.id<0)errors.push("Stable numeric quote ID required");
 if(!spec.quote?.text||!spec.quote?.author)errors.push("Text and attributed author required");
 if(!spec.philosophy?.claim||!spec.philosophy?.warrant||
   spec.philosophy?.poles?.length!==2||!spec.philosophy.poles.every(Boolean))
   errors.push("Source-specific claim, warrant and two conceptual poles required");
 const opts=spec.encounter?.options||[];
 if(opts.length!==3||opts.some(x=>!x?.label||!x?.key||!x?.focus)||
   new Set(opts.map(x=>safeString(x.label).toLowerCase())).size!==3||
   new Set(opts.map(x=>safeString(x.key).toLowerCase())).size!==3)
   errors.push("Exactly three distinct interpretable perspectives required");
 if(!VISUAL_KINDS.includes(spec.visual?.template))errors.push("Reviewed visual grammar kind required");
 if(!spec.visual?.left||!spec.visual?.right||!spec.visual?.background)
   errors.push("Meaningful visual relation and background motif required");
 if(spec.kind==="bundled"&&!CURATED.some(r=>r.id===spec.id&&r.match===spec.provenance.catalogueMatch))
   errors.push("Bundled quote must match curated catalogue");
 if(publish){
   if(!spec.quote.source)errors.push("Traceable source or translation required");
   if(!spec.encounter.bridge||spec.encounter.bridge.length>85||
      !spec.encounter.scene||!spec.encounter.question)
     errors.push("Reviewed short bridge, scene and clear question required");
   if(!spec.conceptualExercise||spec.conceptualExercise.kind!=="drag-substitution"||
      spec.conceptualExercise.variants?.length!==3||
      spec.conceptualExercise.variants.some(x=>validateDragExercise(x).length))
     errors.push("Three valid, quote-specific mobile fill-in exercises required");
   if(opts.some(x=>!x.insight||!x.sceneMeaning||!x.quoteConnection||
      !x.sceneLeft||!x.sceneRight||!x.relation))
     errors.push("Each lens needs a readable scene meaning and an explicit link back to the quote");
   if(!spec.reflection?.question)errors.push("An optional closing question required");
   const incomplete=REVIEW_CHECKS.filter(key=>spec.review?.[key]!==true);
   if(incomplete.length)errors.push("Review gates not cleared: "+incomplete.join(", "));
 }
 return errors;
}
export const canPublishDiscoverSpec=(spec)=>validateDiscoverSpec(spec,{publish:true}).length===0;
