import test from "node:test";
import assert from "node:assert/strict";
import { CLASSES, REPROS, classifyAssistantStream, reportMarkdown } from "./cz78-allowlisted-diagnosis.mjs";

test("accepts only exact diagnostic and reproduction codes, never raw model text", () => {
  const secret = "sk-DO_NOT_COPY_12345678";
  const events = [
    JSON.stringify({role:"assistant",content:"Inspecting quote code, " + secret,
      tool_calls:[{function:{name:"Read",arguments:secret}}]}),
    JSON.stringify({role:"tool",content:"private path " + secret}),
    JSON.stringify({role:"assistant",content:"CZ17_CLASS=RANKING_OVERRIDE_RISK\nCZ17_REPRO=MULTIDAY_STRONG_PREFERENCES\n"})
  ].join("\n");
  const result=classifyAssistantStream(events);
  assert.equal(result.valid,true);
  assert.equal(result.diagnostic,"RANKING_OVERRIDE_RISK");
  assert.equal(result.reproduction,"MULTIDAY_STRONG_PREFERENCES");
  assert.equal(result.toolCalls,1);
  const all=JSON.stringify(result) + reportMarkdown(result);
  assert.ok(!all.includes(secret));
  assert.ok(!all.includes("private path"));
});

test("rejects unknown and injected categories without publishing them", () => {
  const x=classifyAssistantStream(JSON.stringify({role:"assistant",content:"CZ17_CLASS=SEND_SECRET\nCZ17_REPRO=MULTIDAY_STRONG_PREFERENCES\n"}));
  assert.equal(x.valid,false);
  assert.throws(()=>reportMarkdown(x),/No validated/);
});

test("rejects ambiguous duplicate choices, malformed streams or missing final reply", () => {
  const duplicate=classifyAssistantStream(JSON.stringify({role:"assistant",content:
    "CZ17_CLASS=RANKING_OVERRIDE_RISK\nCZ17_CLASS=PERSISTED_DAILY_RECORD\nCZ17_REPRO=MULTIDAY_STRONG_PREFERENCES\n"}));
  assert.equal(duplicate.valid,false);
  const malformed=classifyAssistantStream('not json\n'+JSON.stringify({role:"assistant",content:
    "CZ17_CLASS=RANKING_OVERRIDE_RISK\nCZ17_REPRO=MULTIDAY_STRONG_PREFERENCES\n"}));
  assert.equal(malformed.valid,false);
  const missing=classifyAssistantStream(JSON.stringify({role:"assistant",content:"No answer"}));
  assert.equal(missing.valid,false);
});

test("report is constructed entirely from code-owned, untrusted-input-free templates", () => {
  for (const category of Object.keys(CLASSES)) for (const repro of Object.keys(REPROS)) {
    const result=classifyAssistantStream(JSON.stringify({role:"assistant",content:
      "CZ17_CLASS="+category+"\nCZ17_REPRO="+repro+"\n"}));
    assert.equal(result.valid,true);
    const out=reportMarkdown(result);
    assert.match(out,/not a reproduced defect/);
    assert.match(out,/no file edits/i);
    assert.doesNotMatch(out,/https?:|<script>|sk-/);
  }
});
