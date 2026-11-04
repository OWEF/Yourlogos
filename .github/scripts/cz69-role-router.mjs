// CZ-69 Phase 2 — offline role selection, not an AI/model invocation.
import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const ROLE_KEYS = Object.freeze(["frontend-ux", "backend-apis", "testing-qa", "debugging"]);
const PROFILE_ROOT = ".github/kimi/profiles/";
const ALLOWED_TOOLS = new Set(["Read", "Grep", "Glob", "ReadMediaFile", "Edit", "Write"]);
const FORBIDDEN_TOOLS = ["Bash", "Agent", "AgentSwarm"];

function matchField(source, key) {
  const re = new RegExp("^" + key + ":\\s*(.+)$", "m");
  return source.match(re)?.[1]?.trim() || "";
}
function listField(source, key) {
  const re = new RegExp("^" + key + ":\\s*\\n((?:  - [^\\n]+\\n?)+)", "m");
  const text = source.match(re)?.[1] || "";
  return text.split("\n").map(x => x.trim()).filter(Boolean).map(x => x.replace(/^- /, ""));
}
export function inspectProfile(content, roleKey) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw Error("Invalid profile frontmatter: " + roleKey);
  const front = m[1];
  const name = matchField(front, "name");
  if (name !== "yl-" + roleKey) throw Error("Profile name mismatch: " + roleKey);
  if (!matchField(front, "description")) throw Error("Description missing: " + roleKey);
  if (matchField(front, "override") !== "false") throw Error("Built-in override forbidden: " + roleKey);
  if (matchField(front, "subagents") !== "[]") throw Error("Subagents must be disabled: " + roleKey);
  const tools = listField(front, "tools");
  const denied = listField(front, "disallowedTools");
  if (!tools.length || tools.some(x => !ALLOWED_TOOLS.has(x))) {
    throw Error("Unapproved agent tool: " + roleKey);
  }
  for (const x of FORBIDDEN_TOOLS) {
    if (!denied.includes(x)) throw Error("Missing tool denial: " + roleKey + "/" + x);
  }
  if (roleKey === "debugging" && tools.some(x => x === "Edit" || x === "Write")) {
    throw Error("Debugging must be read-only");
  }
  if (!content.includes("$" + "{base_prompt}")) {
    throw Error("Default project instruction context missing: " + roleKey);
  }
  if (content.includes("override: true")) throw Error("Override forbidden");
  return { name, tools, disallowedTools: denied, subagentCount: 0 };
}
export function validateRegistry(registry, readProfile) {
  if (!registry || registry.schema !== "cz69-role-router-v1" ||
      registry.mode !== "explicit-one-at-a-time" ||
      registry.maxConcurrentKimiSessions !== 1 ||
      registry.automaticSubagents !== false ||
      registry.automaticRetries !== false ||
      registry.automaticRelease !== false) throw Error("Unsafe router configuration");
  if (!registry.roles || Object.keys(registry.roles).sort().join("|") !== [...ROLE_KEYS].sort().join("|")) {
    throw Error("Expected exactly four role keys");
  }
  const result = {};
  for (const key of ROLE_KEYS) {
    const role = registry.roles[key];
    if (!role || !role.requiresReview || !["scoped", "restricted", "read-only"].includes(role.tier)) {
      throw Error("Invalid role policy: " + key);
    }
    const expected = PROFILE_ROOT + key + ".md";
    if (role.profile !== expected) throw Error("Unapproved profile path: " + key);
    result[key] = inspectProfile(readProfile(role.profile), key);
  }
  return result;
}
export function selectRole(registry, key) {
  if (!ROLE_KEYS.includes(key)) throw Error("Role not explicitly allowlisted");
  return registry.roles[key].profile;
}
function main() {
  const root = process.cwd();
  const config = JSON.parse(readFileSync(resolve(root, ".github/kimi/role-routing.json"), "utf8"));
  const allowed = resolve(root, PROFILE_ROOT);
  const profiles = validateRegistry(config, path => {
    const file = resolve(root, path);
    if (!file.startsWith(allowed + sep) && file !== allowed) throw Error("Invalid profile location");
    return readFileSync(file, "utf8");
  });
  const selected = process.argv[2];
  if (selected && selected !== "--check") {
    process.stdout.write(selectRole(config, selected) + "\n");
  } else {
    process.stdout.write("CZ-69 role validation passed: " + Object.keys(profiles).length +
      " explicit profiles; no model invocation.\n");
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
