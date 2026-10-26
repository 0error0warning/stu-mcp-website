// Opt-in only. A future button can call setHeroCharactersEnabled(true).
// This module deliberately imports no physics, React, or rendering code.
let enabled = false;
const listeners = new Set();

export const heroCharactersEnabled = () => enabled;
export function subscribeHeroCharacters(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function setHeroCharactersEnabled(next = true) {
  const value = Boolean(next);
  if (enabled === value) return;
  enabled = value;
  listeners.forEach(listener => listener());
}
