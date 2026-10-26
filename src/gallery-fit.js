import { fanDefaults, fanLayout, fanPose } from './components/reactdrops/fan-layout.ts';

const galleryOptions = {
  ...fanDefaults,
  aspectRatio: 0.78,
  spacing: 0.55,
  curve: 0.2,
  tilt: 8,
  spread: 0.08,
};

// The upstream layout fits the resting fan. A selected card also pushes its
// neighbors outward, so reserve space for every selection before choosing size.
export function galleryFanBounds(hostWidth, cardWidth, lift) {
  const layout = fanLayout(hostWidth, 3, { ...galleryOptions, cardWidth, lift });
  const states = [];
  for (let active = -1; active < 3; active++) {
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (let index = 0; index < 3; index++) {
      const pose = fanPose(index, 3, layout.options, active);
      const radians = pose.rotation * Math.PI / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const halfWidth = (cos * layout.width + sin * layout.height) / 2;
      const halfHeight = (sin * layout.width + cos * layout.height) / 2;
      const x = layout.originX + pose.x * layout.fit;
      const y = layout.originY + pose.y * layout.fit;
      left = Math.min(left, x - halfWidth);
      right = Math.max(right, x + halfWidth);
      top = Math.min(top, y - halfHeight);
      bottom = Math.max(bottom, y + halfHeight);
    }
    states.push({ active, left, right, top, bottom });
  }
  return { states, stageHeight: layout.stageHeight };
}

export function fitGalleryCardWidth(hostWidth, preferredWidth, lift) {
  if (hostWidth <= 0) return 40;
  const margin = Math.min(24, Math.max(16, hostWidth * 0.035));
  const fits = (cardWidth) => galleryFanBounds(hostWidth, cardWidth, lift).states.every(
    state => state.left >= margin && state.right <= hostWidth - margin,
  );
  if (fits(preferredWidth)) return preferredWidth;
  let low = 40;
  let high = Math.max(low, preferredWidth);
  for (let i = 0; i < 20; i++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return Math.floor(low * 2) / 2;
}
