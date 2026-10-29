// A per-navigation escape hatch for graphics/compositor failures that a page
// cannot observe. It does not change browser settings or persist a preference.
export function staticEffectsRequested() {
  return new URLSearchParams(window.location.search).get('effects') === 'static';
}

// A valid WebGL readback cannot verify the browser's final canvas compositor.
// Use frames of the same product material on Gecko, where the owner observed
// black surfaces after successful draws. Other effects keep their own policy.
export function imageMaterialsPreferred() {
  return staticEffectsRequested() ||
    globalThis.CSS?.supports('-moz-appearance', 'none') ||
    /Firefox\//.test(navigator.userAgent);
}
