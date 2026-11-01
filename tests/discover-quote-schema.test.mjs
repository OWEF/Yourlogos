import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getBundledDiscoverSpec,createFutureDiscoverDraft,validateDiscoverSpec,canPublishDiscoverSpec,DISCOVER_SPEC_VERSION,REVIEW_CHECKS} from "../discover-quote-schema.js";
import {CURATED} from "../tension-engine.js";
import {BUNDLED_INTERPRETATION_ROWS} from "../discover-quote-editorial.js";

const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const quotes=[...app.matchAll(/^\s*\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)","([^"]+)","((?:[^"\\]|\\.)*)"/gm)]
 .map(m=>m.slice(1,5).map(x=>x.replace(/\\\"/g,'"')));

test("91 bundled quotes have unique tailored lens sets and structurally valid draft specs",()=>{
 assert.equal(DISCOVER_SPEC_VERSION,1);
 assert.equal(quotes.length,91);
 assert.equal(BUNDLED_INTERPRETATION_ROWS.length,quotes.length);
 for(let id=0;id<quotes.length;id++){
   const spec=getBundledDiscoverSpec(quotes[id],id);
   assert.ok(spec,"Missing quote-specific contract "+id);
   assert.deepEqual(validateDiscoverSpec(spec),[],"Malformed draft "+id);
   assert.equal(spec.encounter.options.length,3);
   assert.equal(spec.visual.background,BUNDLED_INTERPRETATION_ROWS[id].motif);
   assert.equal(canPublishDiscoverSpec(spec),false,"Do not auto-publish unreviewed "+id);
 }
});
test("Pilot quotes contain distinct full experiences and choice-dependent meanings",()=>{
 for(const id of [0,31,70]){
   const spec=getBundledDiscoverSpec(quotes[id],id);
   assert.ok(spec.encounter.bridge.length<=85);
   assert.ok(spec.encounter.scene&&spec.encounter.question&&spec.reflection.question);
   assert.equal(new Set(spec.encounter.options.map(x=>x.insight)).size,3);
   assert.ok(spec.encounter.options.every(x=>x.insight&&x.focus&&x.key&&x.sceneMeaning&&x.quoteConnection&&x.sceneLeft&&x.sceneRight&&x.relation));
   assert.ok(!canPublishDiscoverSpec(spec),"Pilot content still needs human sign-off");
 }
});
test("Future-quote draft requires three independently chosen lenses and full review to publish",()=>{
 const draft=createFutureDiscoverDraft({id:91,
   quote:{text:"A new hypothetical quotation.",author:"A future author",source:"Reference, work and page"},
   philosophy:{claim:"A specific claim",warrant:"Its rationale",poles:["Concept A","Concept B"],friction:"A fair question"},
   visual:{template:"lens",left:"Concept A",right:"Concept B",background:"new-scene"}});
 assert.ok(validateDiscoverSpec(draft).some(x=>x.includes("three")));
 assert.equal(canPublishDiscoverSpec(draft),false);
 const complete={...draft,
   encounter:{bridge:"Here is a familiar moment:",scene:"A situation anyone can picture.",question:"How would you see it?",
     freeText:true,options:[{key:"a",label:"One reading",focus:"A",insight:"A precise insight",sceneMeaning:"A concrete explanation a",quoteConnection:"An explicit quote link a",sceneLeft:"One detail a",sceneRight:"Another detail a",relation:"helps explain"},
       {key:"b",label:"Another reading",focus:"B",insight:"Another insight",sceneMeaning:"A concrete explanation b",quoteConnection:"An explicit quote link b",sceneLeft:"One detail b",sceneRight:"Another detail b",relation:"helps explain"},
       {key:"c",label:"Third reading",focus:"C",insight:"Third insight",sceneMeaning:"A concrete explanation c",quoteConnection:"An explicit quote link c",sceneLeft:"One detail c",sceneRight:"Another detail c",relation:"helps explain"}]},
   reflection:{question:"What would you reconsider?",saveRequiresAction:true},
   review:Object.fromEntries(REVIEW_CHECKS.map(k=>[k,true]))};
 assert.deepEqual(validateDiscoverSpec(complete,{publish:true}),[]);
 assert.equal(canPublishDiscoverSpec(complete),true);
});
test("Mismatched quote-ID pair fails closed; quote source not silently substituted",()=>{
 assert.equal(getBundledDiscoverSpec(quotes[31],0),null);
 assert.equal(getBundledDiscoverSpec(["A fake quotation","Author","Theme","Source"],31),null);
 assert.equal(CURATED.length,91);
});
