// YourLogos — state-driven Encounter semantic notifications.
// A minimal pub/sub bus only: it carries event semantics to subscribers and
// never owns application state. It does not save, persist, mark completion,
// grade choices, or infer what a user believes. Pure module: no global,
// window, network, storage, or DOM side effects.
export const ENCOUNTER_EVENT_TYPES = Object.freeze([
  "encounter.enter",
  "lens.press",
  "lens.choose",
  "insight.ready",
  "insight.error",
  "exercise.place",
  "exercise.complete",
  "encounter.finish",
  "encounter.resume"
]);
const ALLOWED = new Set(ENCOUNTER_EVENT_TYPES);
const assertType = type => {
  if (!ALLOWED.has(type)) {
    throw new TypeError("Unknown encounter event type: " + String(type));
  }
};
export function createEncounterEventBus() {
  const handlers = new Map(ENCOUNTER_EVENT_TYPES.map(type => [type, []]));
  return {
    subscribe(type, handler) {
      assertType(type);
      if (typeof handler !== "function") {
        throw new TypeError("Encounter event handler must be a function");
      }
      const list = handlers.get(type);
      list.push(handler);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        const index = list.indexOf(handler);
        if (index !== -1) list.splice(index, 1);
      };
    },
    publish(type, payload) {
      assertType(type);
      const list = handlers.get(type);
      // Snapshot so an unsubscribe during delivery does not reorder this pass.
      for (const handler of list.slice()) {
        handler(Object.freeze({type, payload}));
      }
      return list.length;
    }
  };
}
