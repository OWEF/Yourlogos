import {test} from "node:test";
import assert from "node:assert/strict";
import {ENCOUNTER_EVENT_TYPES, createEncounterEventBus} from "../encounter-events.js";

test("all allowed event types are published to their subscribers",()=>{
 const bus=createEncounterEventBus();
 const received=[];
 ENCOUNTER_EVENT_TYPES.forEach((type,i)=>{
  bus.subscribe(type,event=>received.push([i,event.type,event.payload]));
  assert.equal(bus.publish(type,{index:i}),1);
 });
 assert.deepEqual(received,ENCOUNTER_EVENT_TYPES.map((type,i)=>[i,type,{index:i}]));
});

test("subscribers only receive their own event type",()=>{
 const bus=createEncounterEventBus();
 const calls=[];
 bus.subscribe("lens.choose",event=>calls.push(event.type));
 bus.publish("lens.press",{});
 bus.publish("encounter.enter",{});
 bus.publish("lens.choose",{picked:1});
 assert.deepEqual(calls,["lens.choose"]);
});

test("unknown event names are rejected for subscribe and publish",()=>{
 const bus=createEncounterEventBus();
 assert.throws(()=>bus.subscribe("encounter.fake",()=>{}),TypeError);
 assert.throws(()=>bus.publish("insight.saved",{}),TypeError);
 assert.throws(()=>bus.publish("",{}),TypeError);
 assert.throws(()=>bus.publish(undefined,{}),TypeError);
});

test("handlers run in subscription order per event",()=>{
 const bus=createEncounterEventBus();
 const order=[];
 ["a","b","c"].forEach(name=>bus.subscribe("encounter.finish",()=>order.push(name)));
 bus.publish("encounter.finish",{});
 assert.deepEqual(order,["a","b","c"]);
});

test("unsubscribe stops delivery and is safe to call twice",()=>{
 const bus=createEncounterEventBus();
 const calls=[];
 const offA=bus.subscribe("insight.ready",()=>calls.push("a"));
 bus.subscribe("insight.ready",()=>calls.push("b"));
 offA();
 offA();
 assert.equal(bus.publish("insight.ready",{}),1);
 assert.deepEqual(calls,["b"]);
});

test("publishing with no subscribers is a no-op",()=>{
 const bus=createEncounterEventBus();
 assert.equal(bus.publish("exercise.place",{}),0);
 assert.equal(bus.publish("encounter.resume",{at:1}),0);
});

test("payload and envelope are not mutated by the bus; frozen input is accepted",()=>{
 const bus=createEncounterEventBus();
 const payload=Object.freeze({quoteId:7,lens:"doubt"});
 let seen;
 bus.subscribe("lens.press",event=>{seen=event});
 bus.publish("lens.press",payload);
 assert.equal(seen.payload,payload);
 assert.deepEqual(payload,{quoteId:7,lens:"doubt"});
 assert.ok(Object.isFrozen(seen));
 assert.throws(()=>{seen.type="hacked"},TypeError);
});

test("handler must be a function",()=>{
 const bus=createEncounterEventBus();
 assert.throws(()=>bus.subscribe("lens.press",null),TypeError);
 assert.throws(()=>bus.subscribe("lens.press","not a function"),TypeError);
});

test("importing the module has no global side effects",async()=>{
 const before=Object.getOwnPropertyNames(globalThis);
 await import("../encounter-events.js?v=side-effect-check");
 assert.deepEqual(Object.getOwnPropertyNames(globalThis),before);
 assert.equal(typeof globalThis.window,"undefined");
});
