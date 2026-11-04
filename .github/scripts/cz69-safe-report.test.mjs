import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
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
  assert.equal(classifyExit("137"),"forced_stop_or_resource_limit");
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

test("CLI persists only sanitized evidence after a timed-out model", () => {
  const dir = mkdtempSync(join(tmpdir(), "cz69-report-"));
  const secret = "SHOULD_NEVER_REACH_PUBLIC_ARTIFACT";
  const stdout = join(dir, "raw.jsonl");
  const stderr = join(dir, "stderr.txt");
  const result = join(dir, "report.json");
  try {
    writeFileSync(stdout, JSON.stringify({
      role:"assistant", content:secret,
      tool_calls:[{function:{name:"Shell",arguments:"echo " + secret}}]
    }) + "\n");
    writeFileSync(stderr, "private tool trace " + secret + "\n");
    const proc=spawnSync(process.execPath,
      [new URL("./cz69-safe-report.mjs", import.meta.url).pathname,
       stdout, stderr, "124", "150", result],
      {encoding:"utf8", timeout:10000}
    );
    assert.equal(proc.status,0,proc.stderr);
    const safe=readFileSync(result,"utf8");
    assert.match(safe,/"exitClass": "timeout"/);
    assert.match(safe,/"toolRequests": 1/);
    assert.doesNotMatch(safe,/SHOULD_NEVER_REACH_PUBLIC_ARTIFACT/);
    assert.doesNotMatch(proc.stdout,/SHOULD_NEVER_REACH_PUBLIC_ARTIFACT/);
  } finally {
    rmSync(dir,{recursive:true,force:true});
  }
});
