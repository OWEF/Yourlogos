import {test} from "node:test";
import assert from "node:assert/strict";
import {availableThoughts,quoteAt,followingThought} from "../encounter-queue.js";

const queue=["q1","q2","q3","q4","q5"];

test("quoteAt wraps and selects deterministically for a fixed queue",()=>{
  assert.equal(quoteAt(queue,0),"q1");
  assert.equal(quoteAt(queue,2),"q3");
  assert.equal(quoteAt(queue,5),"q1");
  assert.equal(quoteAt(queue,7),"q3");
  assert.equal(quoteAt(queue,-1),"q5");
  assert.equal(quoteAt([],0),null);
  assert.equal(quoteAt(queue,3),quoteAt(queue,8));
});

test("availableThoughts excludes saved IDs while preserving order",()=>{
  assert.deepEqual(availableThoughts(queue,["q2","q4"]),["q1","q3","q5"]);
  assert.deepEqual(availableThoughts(queue,[]),queue);
  assert.deepEqual(availableThoughts(queue,queue),[]);
  assert.deepEqual(availableThoughts(queue,null),queue);
  assert.deepEqual(availableThoughts(["a","b","a"],["a"]),["b"]);
});

test("followingThought moves to a valid unsaved next ID",()=>{
  const saved=["q2","q4"];
  const r=followingThought(queue,"q1",saved);
  assert.equal(r.id,"q3");
  assert.equal(r.cursor,1);
  assert.ok(!saved.includes(r.id));
});

test("followingThought skips consecutive saved IDs and falls back safely",()=>{
  assert.equal(followingThought(queue,"q1",["q2","q3"]).id,"q4");
  assert.deepEqual(followingThought(queue,"q5",queue),{id:null,cursor:0});
  assert.equal(followingThought(queue,"missing",["q2"]).id,"q1");
});
