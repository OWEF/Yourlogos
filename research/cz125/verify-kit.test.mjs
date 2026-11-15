import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {Script} from "node:vm";

const base="73849bff27fc73db97d5fb015c57f45323e18f30";
const root=new URL("./",import.meta.url);
const load=name=>readFileSync(new URL(name,root),"utf8");

test("research kit is pinned to accepted immutable integrated candidate, not modified engine",()=>{
 for(const name of ["PROTOCOL.md","reader-response.html","PRIVATE-HTTPS-PREVIEW.md","SOURCE-REVIEW.md","FOUNDER-GATE.md"]){
  const doc=load(name);
  assert.ok(doc.includes(base),name+" must point to exact accepted prototype");
 }
});
test("exact four existing comprehension prompts are present and unguided for each phase",()=>{
 const html=load("reader-response.html");
 const protocol=load("PROTOCOL.md");
 for(const phrase of [
  "what did the choice you made change",
  "philosopher's central argument",
  "hypothetical, uncertain, or unknown",
  "final question or reflection"
 ]){
  assert.ok(html.toLowerCase().includes(phrase),phrase);
  assert.ok(protocol.toLowerCase().includes(phrase),phrase);
 }
 assert.match(html,/value="immediate"/);
 assert.match(html,/value="delayed"/);
 for(const id of ["q1","q2","q3","q4","consent"])
  assert.ok(html.includes('id="'+id+'"'));
 assert.ok(protocol.includes("18–30"));
 assert.match(protocol,/four 0–2|four 0-2|four-axis|0–2 axes/i);
});
test("answer collection is local-only and does not automatically claim human or score",()=>{
 const html=load("reader-response.html");
 assert.doesNotMatch(html,/<script[^>]*src=/i);
 assert.doesNotMatch(html,/<link[^>]*rel="stylesheet"[^>]*href=/i);
 assert.doesNotMatch(html,/\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/i);
 assert.doesNotMatch(html,/\b(?:localStorage|sessionStorage|indexedDB)\b/i);
 assert.match(html,/new Blob\(/);
 assert.match(html,/automaticScoring:false/);
 assert.doesNotMatch(html,/responseIsHumanReported\s*:\s*true/);
 assert.match(html,/required/);
 assert.doesNotMatch(html,/\bstyle\s*=\s*["'].*https?:\/\//i);
 const match=html.match(/<script>([\s\S]*?)<\/script>/i);
 assert.ok(match,"Self-contained offline browser code");
 new Script(match[1],{filename:"reader-response.html embedded script"});
});
test("private preview proposal does not treat a Tailscale proxy as functioning without Host/Origin review",()=>{
 const doc=load("PRIVATE-HTTPS-PREVIEW.md");
 assert.match(doc,/NOT DEPLOYED/);
 assert.match(doc,/403/);
 assert.match(doc,/Host\/Origin/);
 assert.match(doc,/no public|NOT DEPLOYED/i);
 assert.match(doc,/explicit.*approval|after explicit approval/i);
 assert.match(doc,/Funnel/);
});
test("founder package is honest: 0 human responses, separate actual iPhone and scholar gates",()=>{
 const doc=load("FOUNDER-GATE.md");
 assert.match(doc,/0 \/ 5/);
 assert.match(doc,/NOT VERIFIED/);
 assert.match(doc,/scholar/i);
 assert.match(doc,/iPhone/i);
 assert.match(doc,/BLOCK — NO HUMAN/);
});
test("local inventory with no real evidence prints NOT_VERIFIED, never PASS",()=>{
 const output=execFileSync(process.execPath,[new URL("audit-local-evidence.mjs",root).pathname],
  {encoding:"utf8"});
 const result=JSON.parse(output);
 assert.equal(result.reportedImmediate,0);
 assert.equal(result.reportedDelayed,0);
 assert.equal(result.pairedCodeCount,0);
 assert.equal(result.status,"NOT_VERIFIED");
 assert.ok(result.notes.some(x=>/human participant/.test(x)));
});
