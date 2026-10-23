// YourLogos — pure operations for a discovery feed that excludes kept thoughts.
// Only IDs are filtered: historical daily practice, reactions and Library saves remain intact.
export function availableThoughts(fullDayOrder, savedIds) {
  const kept = new Set(Array.isArray(savedIds) ? savedIds : []);
  return fullDayOrder.filter(id => !kept.has(id));
}
export function quoteAt(queue, cursor) {
  if (!queue.length) return null;
  return queue[((cursor % queue.length) + queue.length) % queue.length];
}
// Select what would have followed the kept item in the pre-save order.
// This is critical when removing from the middle of a deterministic daily deck.
export function followingThought(before, keptId, savedIds) {
  const available = availableThoughts(before, savedIds);
  if (!available.length) return { id: null, cursor: 0 };
  const current = before.indexOf(keptId);
  if (current < 0) return { id: available[0], cursor: 0 };
  for (let step = 1; step <= before.length; step++) {
    const candidate = before[(current + step) % before.length];
    const cursor = available.indexOf(candidate);
    if (cursor >= 0) return { id: candidate, cursor };
  }
  return { id: available[0], cursor: 0 };
}
