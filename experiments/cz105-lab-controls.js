/**
 * CZ-105 founder lab: discrete, zero-sum UI controls.
 * UI mathematics only. Philosophical conclusions come from the real
 * philosophy-engine/tradeoff-reasoner.js module.
 */
export const TICKS_PER_HOUR = 2;
export const TOTAL_TICKS = 16;
export const CATEGORY_IDS = Object.freeze(["rest", "obligations", "reflection"]);
export const INITIAL_TICKS = Object.freeze([6, 6, 4]);

export function validateTicks(ticks) {
  return Array.isArray(ticks) && ticks.length === CATEGORY_IDS.length &&
    ticks.every(n => Number.isInteger(n) && n >= 0 && n <= TOTAL_TICKS) &&
    ticks.reduce((sum, n) => sum + n, 0) === TOTAL_TICKS;
}

export function toAllocation(ticks) {
  if (!validateTicks(ticks)) throw new TypeError("Invalid zero-sum allocation");
  return Object.fromEntries(CATEGORY_IDS.map((id, i) => [id, ticks[i] / TICKS_PER_HOUR]));
}

export function reallocate(ticks, selectedIndex, desiredTicks) {
  if (!validateTicks(ticks)) throw new TypeError("Invalid original allocation");
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= ticks.length)
    throw new RangeError("Invalid selected category");
  if (!Number.isInteger(desiredTicks) || desiredTicks < 0 || desiredTicks > TOTAL_TICKS)
    throw new RangeError("Invalid requested allocation");
  if (ticks[selectedIndex] === desiredTicks) return [...ticks];

  const others = CATEGORY_IDS.map((_, i) => i).filter(i => i !== selectedIndex);
  const remaining = TOTAL_TICKS - desiredTicks;
  const previousTotal = others.reduce((sum, i) => sum + ticks[i], 0);
  const firstRatio = previousTotal > 0 ? ticks[others[0]] / previousTotal : 0.5;
  const firstTicks = Math.round(firstRatio * remaining);
  const result = [0, 0, 0];
  result[selectedIndex] = desiredTicks;
  result[others[0]] = firstTicks;
  result[others[1]] = remaining - firstTicks;
  if (!validateTicks(result)) throw new Error("Zero-sum allocation invariant violated");
  return result;
}

export const PRESETS = Object.freeze({
  balanced: [6, 6, 4],
  rest: [16, 0, 0],
  obligations: [0, 16, 0],
  reflection: [0, 0, 16],
  majority: [10, 4, 2],
  mixed: [8, 4, 4],
});
