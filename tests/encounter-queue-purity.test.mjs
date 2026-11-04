import {test} from "node:test";
import assert from "node:assert/strict";
import {availableThoughts,followingThought,quoteAt} from "../encounter-queue.js";

const DAY=["q1","q2","q3","q4","q5"];
const SAVED=["q2","q4"];

test("availableThoughts accepts frozen arrays, excludes saved IDs in original order",()=>{
 const day=Object.freeze([...DAY]);
 const saved=Object.freeze([...SAVED]);
 const result=availableThoughts(day,saved);
 assert.deepEqual(result,["q1","q3","q5"]);
 assert.deepEqual(day,DAY);
 assert.deepEqual(saved,SAVED);
 assert.ok(day.every(id=>DAY.includes(id)));
});

test("availableThoughts tolerates missing savedIds and non-array input",()=>{
 assert.deepEqual(availableThoughts(Object.freeze([...DAY]),undefined),DAY);
 assert.deepEqual(availableThoughts(Object.freeze([...DAY]),"q2"),DAY);
});

test("followingThought accepts frozen inputs and picks the next available thought",()=>{
 const before=Object.freeze([...DAY]);
 const saved=Object.freeze([...SAVED]);
 assert.deepEqual(followingThought(before,"q1",saved),{id:"q3",cursor:1});
 assert.deepEqual(followingThought(before,"q3",saved),{id:"q5",cursor:2});
 assert.deepEqual(before,DAY);
 assert.deepEqual(saved,SAVED);
});

test("queue operations are deterministic and quoteAt is pure",()=>{
 const day=Object.freeze([...DAY]);
 const saved=Object.freeze([...SAVED]);
 const first=availableThoughts(day,saved);
 for(let i=0;i<25;i++) assert.deepEqual(availableThoughts(day,saved),first);
 for(let i=0;i<25;i++) assert.deepEqual(followingThought(day,"q2",saved),{id:"q3",cursor:1});
 const queue=Object.freeze([...first]);
 assert.equal(quoteAt(queue,0),"q1");
 assert.equal(quoteAt(queue,3),"q1");
 assert.equal(quoteAt(queue,-1),"q5");
 assert.equal(quoteAt(Object.freeze([]),0),null);
 assert.deepEqual(queue,first);
});
