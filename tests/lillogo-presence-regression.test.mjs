import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

// Exercise the actual controller in a fake DOM. No browser, secrets or network.
const source = readFileSync(new URL("../little-logo-presence.js", import.meta.url), "utf8");
function createScene({ hidden = false, reduced = false } = {}) {
  const pending = new Map();
  const classes = new Set(["yl-logo-pet", "yl-logo-pet-idle"]);
  let nextId = 0;
  const pet = {
    isConnected: true,
    className: "yl-logo-pet yl-logo-pet-idle",
    dataset: {},
    classList: {
      add: x => classes.add(x),
      remove: x => classes.delete(x),
      contains: x => classes.has(x)
    },
    closest: selector => selector === ".yl-logo-roam-stage"
      ? { classList: { contains: () => false } } : null
  };
  const document = {
    readyState: "complete",
    hidden,
    getElementById: id => id === "app" ? {} : null,
    addEventListener: () => {},
    querySelector: selector => selector.includes(".yl-logo-roam-stage .yl-logo-pet") ? pet : null
  };
  const win = { matchMedia: () => ({ matches: reduced, addEventListener: () => {} }) };
  const random = Object.create(Math);
  random.random = () => 0;
  runInNewContext(source, {
    document, window: win, Math: random, Date,
    MutationObserver: class { observe() {} },
    setTimeout(fn, delay) { const id = ++nextId; pending.set(id, { fn, delay }); return id; },
    clearTimeout(id) { pending.delete(id); }
  }, { filename: "little-logo-presence.js" });
  return { pet, pending, classes };
}

test("LilLogo automatically schedules ambient motion without any choice click", () => {
  const scene = createScene();
  assert.ok(scene.classes.has("yl-logo-autonomous"), "controller should attach on initial screen");
  const tasks = [...scene.pending.values()];
  assert.equal(tasks.length, 1, "initial ambient timer should exist");
  assert.ok(tasks[0].delay >= 4700, "should not spin continuously");
  tasks[0].fn();
  assert.equal(scene.pet.dataset.lilAmbient, "curious", "first ambient tick should update a real mood");
  assert.ok(scene.pending.size >= 2, "controller should schedule the return and next tick");
});

test("hidden documents and reduced-motion preference disable ambient scheduling", () => {
  const hidden = createScene({ hidden: true });
  assert.equal(hidden.pending.size, 0, "hidden tab must not animate");
  const reduced = createScene({ reduced: true });
  assert.equal(reduced.pending.size, 0, "reduced-motion must not animate");
  assert.ok(!reduced.classes.has("yl-logo-autonomous"));
});

test("public page loads LilLogo controller with mobile viewport support", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /name="viewport"[^>]*width=device-width/);
  assert.match(html, /src="\/little-logo-presence\.js\?/);
});