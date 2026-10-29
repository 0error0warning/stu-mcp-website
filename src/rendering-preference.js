// A per-navigation escape hatch for graphics/compositor failures that a page
// cannot observe. It does not change browser settings or persist a preference.
export function staticEffectsRequested() {
  return new URLSearchParams(window.location.search).get('effects') === 'static';
}
