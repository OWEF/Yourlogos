// Regression: reducing motion mid-session must cancel pending autonomous
// timers and keep the pet static; returning to no-preference resumes one.
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../little-logo-presence.js", import.meta.url), "utf8");

function makePet() {
  const classes = new Set(["yl-logo-pet", "yl-logo-pet-idle"]);
  return {
    isConnected: true,
    dataset: {},
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
    },
    get className() { return [...classes].join(" "); },
    closest: () => ({ classList: { contains: () => false } }),
  };
}

function boot() {
  const pet = makePet();
  let timers = new Map();
  let nextId = 0;
  let motionListener = null;
  const sandbox = {
    console,
    setTimeout: (fn) => { const id = ++nextId; timers.set(id, fn); return id; },
    clearTimeout: (id) => { timers.delete(id); },
    MutationObserver: class { constructor(cb) { this.cb = cb; } observe() {} },
    document: {
      readyState: "complete",
      hidden: false,
      getElementById: () => ({}),
      addEventListener: () => {},
      querySelector: (sel) => (sel.endsWith(".yl-logo-pet") ? pet : null),
    },
    window: {
      matchMedia: () => ({
        get matches() { return sandbox.__reduced; },
        addEventListener: (type, fn) => { motionListener = fn; },
      }),
    },
    __reduced: false,
  };
  vm.runInNewContext(src, sandbox);
  return {
    pet,
    pending: () => timers.size,
    flush: () => { const fns = [...timers.values()]; timers.clear(); fns.forEach((f) => f()); },
    reduceMotion: (v) => { sandbox.__reduced = v; motionListener(); },
  };
}

test("motion reduction cancels timers; return resumes a single schedule", () => {
  const h = boot();
  assert.equal(h.pending(), 1, "initial attach schedules idle timer");
  assert.ok(h.pet.classList.contains("yl-logo-autonomous"));

  h.reduceMotion(true);
  assert.equal(h.pending(), 0, "reduce cancels pending clock/revert timers");

  h.flush();
  assert.equal(h.pet.dataset.lilAmbient, undefined, "pet stays static while reduced");

  h.reduceMotion(false);
  assert.equal(h.pending(), 1, "return to no-preference resumes at most one schedule");

  h.flush();
  assert.equal(h.pet.dataset.lilAmbient, "curious", "first spontaneous mood applies after resume");
  assert.ok(h.pending() >= 1, "perform reschedules autonomous cycle");
});
