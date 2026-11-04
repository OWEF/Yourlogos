import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSafeReport, classifyExit, summarizeJsonl, summarizePaths
} from "./cz69-safe-report.mjs";

test("diagnostics recognize Kimi timeout without exposing prompt or API key", () => {
  const secret = "sk-VERY_PRIVATE_KEY_999";
  const events = [
    JSON.stringify({role: "assistant", content: "I found " + secret, tool_calls: [
      {type: "function", function: {name: "Shell", arguments: "print " + secret}}
    ]}),
    JSON.stringify({role: "tool", content: "secret=" + secret}),
    JSON.stringify({role: "assistant", content: "still working " + secret})
  ].join("\n");
  const report = buildSafeReport({
    stdout: events, stdoutBytes: events.length, stderrBytes: 984,
    exitCode: "124", elapsedSeconds: "300",
    paths: ["tests/daily-quote-freshness.test.mjs", "secret-" + secret + ".txt"]
  });
  assert.equal(report.exitClass, "timeout");
  assert.equal(report.exitCode, 124);
  assert.equal(report.elapsedSeconds, 300);
  assert.equal(report.streaming.assistantMessages, 2);
  assert.equal(report.streaming.toolRequests, 1);
  assert.equal(report.streaming.toolResults, 1);
  assert.equal(report.changes.testFileChanged, true);
  assert.equal(report.changes.unexpectedChangedCount, 1);
  assert.equal(report.usage, "not_verified");
  assert.ok(!JSON.stringify(report).includes(secret));
  assert.ok(!JSON.stringify(report).includes("print"));
});

test("malformed or partial stream lines never propagate raw content", () => {
  const secret = "example-private-password";
  const e = summarizeJsonl(
    JSON.stringify({role:"assistant", content:secret}) + "\n{incomplete:" + secret + "\n" +
    JSON.stringify({role:"tool", content:secret}) + "\n"
  );
  assert.equal(e.jsonMessages, 2);
  assert.equal(e.malformedLines, 1);
  assert.equal(e.finalEvent, "tool");
  assert.ok(!JSON.stringify(e).includes(secret));
});

test("only exact allowed file names are surfaced, all others are counted", () => {
  const result = summarizePaths([
    "tests/daily-quote-freshness.test.mjs",
    "app.js", "secrets.txt", "tests/evil\nfake.test.mjs"
  ]);
  assert.deepEqual(result, {
    testFileChanged:true, unexpectedChangedCount:3, pathInventory:"allowlist_only"
  });
  assert.ok(!JSON.stringify(result).includes("secrets.txt"));
});

test("status classifier distinguishes normal, timeout, termination and never-started", () => {
  assert.equal(classifyExit("0"),"success");
  assert.equal(classifyExit("124"),"timeout");
  assert.equal(classifyExit("137"),"timeout");
  assert.equal(classifyExit("143"),"terminated");
  assert.equal(classifyExit("1"),"failed");
  assert.equal(classifyExit("missing"),"not_started");
});

test("untrusted numeric fields are bounded and usage is never invented", () => {
  const r=buildSafeReport({
    stdout:JSON.stringify({role:"assistant",usage:{tokens:999999}}),
    exitCode:"1", elapsedSeconds:"-200", stderrBytes:Number.POSITIVE_INFINITY
  });
  assert.equal(r.exitClass,"failed");
  assert.equal(r.elapsedSeconds,0);
  assert.equal(r.streaming.stderrBytes,0);
  assert.equal(r.usage,"not_verified");
  assert.ok(!("tokens" in r));
});
