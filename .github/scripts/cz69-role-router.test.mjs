import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateRegistry, inspectProfile, selectRole } from "./cz69-role-router.mjs";

const registry = JSON.parse(readFileSync(".github/kimi/role-routing.json", "utf8"));
const read = path => readFileSync(path, "utf8");
const file = ".github/kimi/profiles/";

test("four specialist profiles validate offline without credentials or model calls", () => {
  const profiles = validateRegistry(registry, read);
  assert.deepEqual(Object.keys(profiles).sort(), ["frontend-ux", "backend-apis", "testing-qa", "debugging"].sort());
  for (const item of Object.values(profiles)) {
    assert.ok(!item.tools.includes("Bash"));
    assert.ok(item.disallowedTools.includes("Agent"));
    assert.ok(item.disallowedTools.includes("AgentSwarm"));
    assert.equal(item.subagentCount, 0);
  }
});

test("explicit selection is deterministic and denies invented roles", () => {
  assert.equal(selectRole(registry, "frontend-ux"), file + "frontend-ux.md");
  assert.equal(selectRole(registry, "testing-qa"), file + "testing-qa.md");
  assert.throws(() => selectRole(registry, "../../secrets"), /allowlisted/);
  assert.throws(() => selectRole(registry, "any"), /allowlisted/);
});

test("read-only debugging cannot gain writes", () => {
  const content = read(file + "debugging.md");
  assert.ok(!inspectProfile(content, "debugging").tools.includes("Write"));
  assert.throws(() => inspectProfile(content.replace("  - Glob\n", "  - Glob\n  - Write\n"), "debugging"), /read-only/);
});

test("Bash and delegation are forbidden for every profile", () => {
  const content = read(file + "frontend-ux.md");
  assert.throws(() => inspectProfile(content.replace("  - Write\n", "  - Write\n  - Bash\n"), "frontend-ux"), /Unapproved/);
  assert.throws(() => inspectProfile(content.replace("subagents: []", "subagents: [coder]"), "frontend-ux"), /disabled/);
  assert.throws(() => inspectProfile(content.replace("  - AgentSwarm\n", ""), "frontend-ux"), /denial/);
  assert.throws(() => inspectProfile(content.replace("override: false", "override: true"), "frontend-ux"), /override/i);
});

test("registry cannot silently add agents or concurrent model sessions", () => {
  const altered = structuredClone(registry);
  altered.maxConcurrentKimiSessions = 4;
  assert.throws(() => validateRegistry(altered, read), /Unsafe/);
  const extra = structuredClone(registry);
  extra.roles.fifth = {profile:file + "fifth.md",requiresReview:true,tier:"scoped"};
  assert.throws(() => validateRegistry(extra, read), /exactly four/);
  const pathInjection = structuredClone(registry);
  pathInjection.roles["frontend-ux"].profile = "../../untrusted.md";
  assert.throws(() => validateRegistry(pathInjection, read), /Unapproved profile path/);
});

test("each profile preserves the base instructions and human release authority", () => {
  for (const key of Object.keys(registry.roles)) {
    const content = read(registry.roles[key].profile);
    assert.match(content, /\$\{base_prompt\}/);
    assert.match(content, /Never merge, deploy/);
    assert.match(content, /independent review/i);
  }
});
