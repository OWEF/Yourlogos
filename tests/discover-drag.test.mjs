import {test} from "node:test";
import assert from "node:assert/strict";
import {PILOT_DRAG_EXERCISES,getDragExercise,validateDragExercise,quoteDragExerciseHtml} from "../discover-quote-drag.js";
import {getBundledDiscoverSpec} from "../discover-quote-schema.js";
test("Nine pilot substitutions are fully structured and readable on mobile",()=>{
 for(const id of [0,31,70]){
  const variants=PILOT_DRAG_EXERCISES[id];
  assert.equal(variants.length,3);
  for(let i=0;i<3;i++){
   const x=getDragExercise(id,i);
   assert.deepEqual(validateDragExercise(x),[]);
   const html=quoteDragExerciseHtml(id,i);
   assert.match(html,/data-yl-quote-drag/);
   assert.equal((html.match(/data-exercise-slot=/g)||[]).length,2);
   assert.equal((html.match(/data-exercise-card=/g)||[]).length,2);
   assert.match(html,/Drag or tap to place/);
   assert.match(html,/data-exercise-reset/);
   assert.match(html,/Back to the quote/);
   assert.ok(!html.includes("<textarea"),"Cards are moveable, not written free text");
  }
 }
});
test("Future-quote schema exposes optional exercises and keeps unreviewed drafts closed",()=>{
 const quote=["He who has a why to live can bear almost any how.","Friedrich Nietzsche","Meaning"];
 const x=getBundledDiscoverSpec(quote,0);
 assert.equal(x.conceptualExercise.variants.length,3);
 assert.equal(x.conceptualExercise.kind,"drag-substitution");
 assert.equal(getDragExercise(91,0),null);
 assert.equal(quoteDragExerciseHtml(91,0),"");
 assert.equal(quoteDragExerciseHtml(0,-1),"");
 assert.equal(quoteDragExerciseHtml(0,null),"");
});
test("Every role must have a matching slot and every assignment a real relation",()=>{
 assert.deepEqual(validateDragExercise({slots:[{key:"why",hint:"Why",word:"The bills"}],parts:["hello"],connection:"X"}).length>0,true);
 assert.deepEqual(validateDragExercise({slots:[{key:"a",hint:"A",word:"One"},{key:"b",hint:"B",word:"Two"}],parts:[{slot:"a"},{slot:"a"}],connection:"X"}).length>0,true);
});
