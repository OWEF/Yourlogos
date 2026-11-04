// CZ-69 Phase 1: bounded, allowlisted diagnostics only.
// This module must never serialize Kimi message content, tool arguments or stderr.
// The report is safe to put in a *public* GitHub Actions artifact.
import { closeSync, existsSync, fstatSync, openSync, readSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const MAX_SCAN_BYTES = 512 * 1024;
const ALLOWED_PATH = "tests/daily-quote-freshness.test.mjs";

function bounded(value, max = 1_000_000) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.trunc(n))) : 0;
}

export function classifyExit(value) {
  if (value === "" || value === undefined || value === null || value === "missing") return "not_started";
  const n = Number(value);
  if (n === 0) return "success";
  if (n === 124 || n === 137) return "timeout";
  if (n === 130 || n === 143) return "terminated";
  return "failed";
}

export function summarizeJsonl(source) {
  // Every field is fixed or numeric. Never retain any fields from the model.
  const result = {
    jsonMessages: 0,
    assistantMessages: 0,
    toolRequests: 0,
    toolResults: 0,
    malformedLines: 0,
    finalEvent: "none"
  };
  const lines = String(source ?? "").split("\n").slice(0, 30000);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    let event;
    try { event = JSON.parse(line); }
    catch { result.malformedLines++; continue; }
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      result.malformedLines++;
      continue;
    }
    result.jsonMessages++;
    if (event.role === "assistant") {
      result.assistantMessages++;
      if (Array.isArray(event.tool_calls)) {
        result.toolRequests += Math.min(event.tool_calls.length, 100);
      }
      result.finalEvent = "assistant";
    } else if (event.role === "tool") {
      result.toolResults++;
      result.finalEvent = "tool";
    } else {
      result.finalEvent = "other";
    }
  }
  return result;
}

function readTail(file, limit = MAX_SCAN_BYTES) {
  if (!file || !existsSync(file)) return { text: "", bytes: 0, truncated: false };
  let fd;
  try {
    fd = openSync(file, "r");
    const size = fstatSync(fd).size;
    const bytes = Math.min(size, limit);
    const start = Math.max(0, size - bytes);
    const data = Buffer.alloc(bytes);
    const actual = readSync(fd, data, 0, bytes, start);
    let text = data.subarray(0, actual).toString("utf8");
    if (start !== 0) text = text.slice(text.indexOf("\n") + 1);
    return { text, bytes: bounded(size, 1_000_000_000), truncated: start !== 0 };
  } catch {
    return { text: "", bytes: 0, truncated: false };
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

export function summarizePaths(pathEntries) {
  const allowed = new Set();
  let other = 0;
  for (const p of pathEntries) {
    if (p === ALLOWED_PATH) allowed.add(p);
    else other++;
  }
  return {
    testFileChanged: allowed.has(ALLOWED_PATH),
    unexpectedChangedCount: bounded(other),
    pathInventory: "allowlist_only"
  };
}

function changedPaths() {
  // Porcelain -z correctly handles whitespace and newline in filenames.
  // Never print or store arbitrary filenames from the model.
  try {
    const raw = execFileSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], {
      encoding: "utf8", maxBuffer: 1024 * 1024
    });
    const entries = raw.split("\0");
    const paths = [];
    for (let i = 0; i < entries.length; i++) {
      const row = entries[i];
      if (!row || row.length < 4) continue;
      const status = row.slice(0, 2);
      paths.push(row.slice(3));
      if (status.includes("R") || status.includes("C")) i++;
    }
    return { status: "ok", ...summarizePaths(paths) };
  } catch {
    return {
      status: "unavailable", testFileChanged: false,
      unexpectedChangedCount: 0, pathInventory: "allowlist_only"
    };
  }
}

export function buildSafeReport({ stdout = "", stdoutBytes = 0, stderrBytes = 0, truncated = false, exitCode = "missing", elapsedSeconds = 0, paths = [] }) {
  return {
    schema: "cz69-harness-diagnostics-v1",
    exitClass: classifyExit(exitCode),
    exitCode: exitCode === "missing" ? null : bounded(exitCode, 255),
    elapsedSeconds: bounded(elapsedSeconds, 3600),
    streaming: {
      ...summarizeJsonl(stdout),
      stdoutBytes: bounded(stdoutBytes, 1_000_000_000),
      stderrBytes: bounded(stderrBytes, 1_000_000_000),
      partialTail: Boolean(truncated)
    },
    changes: summarizePaths(paths),
    usage: "not_verified",
    safeFieldsOnly: true
  };
}

function runCli() {
  // Arguments are runner-generated local paths and bounded process counters.
  const [stdoutPath, stderrPath, exitCode = "missing", seconds = "0", target] = process.argv.slice(2);
  if (!stdoutPath || !stderrPath || !target) process.exit(2);
  const data = readTail(stdoutPath);
  let stderrBytes = 0;
  try { stderrBytes = statSync(stderrPath).size; } catch { /* missing on preflight failure */ }
  const report = buildSafeReport({
    stdout: data.text, stdoutBytes: data.bytes, stderrBytes,
    truncated: data.truncated, exitCode, elapsedSeconds: seconds
  });
  report.changes = changedPaths();
  writeFileSync(target, JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
  // No model text, shell commands, paths outside allowlist, or stderr emitted.
  console.log("CZ-69 safe diagnostics generated; model usage remains unverified");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runCli();
