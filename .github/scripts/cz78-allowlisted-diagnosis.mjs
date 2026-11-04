// CZ-78: safe, bounded, read-only D specialist handoff.
// No model prose, raw tools, prompts, stderr or arbitrary paths may be published.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const CLASSES = Object.freeze({
  RANKING_OVERRIDE_RISK: "The source ranks multiple candidate quotes against preferences, potentially overriding the full-cycle rotation. Repetition risk is plausible, not yet reproduced.",
  PERSISTED_DAILY_RECORD: "An existing saved quote for the local date can override fresh selection. Verify persisted state before treating a repeated quote as a new pick.",
  NORMAL_DECK_WRAP: "The seeded quote deck wraps after one full cycle. Repetition at that boundary is expected.",
  INSUFFICIENT_EVIDENCE: "The available source and supplied evidence do not isolate why a quote repeats. No defect is confirmed."
});
export const REPROS = Object.freeze({
  MULTIDAY_STRONG_PREFERENCES: "Create an isolated, deterministic test with strong saved-theme preferences and simulate consecutive local dates; assert no premature repeat.",
  SAVED_DAY_RECORD: "Test the same date with and without existing data.practice[date].quoteId; distinguish persisted re-use from a new daily pick.",
  FULL_DECK_CYCLE: "Simulate at least one complete DAILY_FEATURE_IDS rotation using deterministic dates and compare expected wraparound.",
  MISSING_RUNTIME_DATA: "Ask for reproducible date/history fixtures before claiming a runtime defect. Do not request private user data in public GitHub comments."
});
const matchEnum = (text, field, choices) => {
  const pattern = new RegExp("(?:^|\\n)" + field + "=([A-Z_]+)(?:\\r?\\n|$)", "g");
  const values = [];
  let m;
  while ((m = pattern.exec(text)) !== null) values.push(m[1]);
  return values.length === 1 && Object.hasOwn(choices, values[0]) ? values[0] : null;
};
export function classifyAssistantStream(raw) {
  let final = "";
  let assistantMessages = 0, toolCalls = 0, malformed = 0;
  const lines = String(raw).split("\n").slice(0, 30000);
  for (const line of lines) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { malformed++; continue; }
    if (!event || typeof event !== "object" || Array.isArray(event)) { malformed++; continue; }
    if (event.role !== "assistant") continue;
    assistantMessages++;
    if (Array.isArray(event.tool_calls) && event.tool_calls.length) {
      toolCalls += Math.min(event.tool_calls.length, 100);
      continue;
    }
    if (typeof event.content === "string") final = event.content;
  }
  const diagnostic = matchEnum(final, "CZ17_CLASS", CLASSES);
  const reproduction = matchEnum(final, "CZ17_REPRO", REPROS);
  return {
    schema: "cz78-allowlisted-debugging-v1",
    valid: diagnostic !== null && reproduction !== null && malformed === 0,
    diagnostic: diagnostic ?? "INSUFFICIENT_EVIDENCE",
    reproduction: reproduction ?? "MISSING_RUNTIME_DATA",
    assistantMessages: Math.min(assistantMessages, 30000),
    toolCalls: Math.min(toolCalls, 30000),
    malformedLines: Math.min(malformed, 30000),
    usage: "not_verified"
  };
}
export function reportMarkdown(result) {
  if (!result || !result.valid || !Object.hasOwn(CLASSES,result.diagnostic) ||
      !Object.hasOwn(REPROS,result.reproduction) || result.usage !== "not_verified") {
    throw Error("No validated, allowlisted diagnosis");
  }
  return [
    "### CZ-78 · Kimi D read-only debugging pilot",
    "",
    "**Classification (hypothesis, not a reproduced defect):** " + result.diagnostic,
    "",
    CLASSES[result.diagnostic],
    "",
    "**Cheapest deterministic next check:** " + result.reproduction,
    "",
    REPROS[result.reproduction],
    "",
    "**Safety:** Source-only read access; no file edits, API changes, app release or automatic retries. Raw agent responses and tool outputs were not published. Kimi provider token/quota consumption is unverified. Independent tech-lead review required before engineering action.",
    ""
  ].join("\n");
}
function runCli() {
  const [rawPath, jsonPath, markdownPath] = process.argv.slice(2);
  if (!rawPath || !jsonPath || !markdownPath) process.exit(2);
  // The runner creates the file; only 512 KiB max processed to bound memory.
  const raw = readFileSync(rawPath);
  if (raw.length > 512 * 1024) throw Error("Model output too large: withhold diagnosis");
  const result = classifyAssistantStream(raw.toString("utf8"));
  writeFileSync(jsonPath, JSON.stringify(result,null,2) + "\n", {mode:0o600});
  if (!result.valid) throw Error("Missing or invalid allowlisted classification; withhold public report");
  writeFileSync(markdownPath, reportMarkdown(result), {mode:0o600});
  console.log("CZ-78 fixed-enum handoff created; no model prose published");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runCli();
