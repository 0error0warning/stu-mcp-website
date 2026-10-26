// The visible CSS ellipse is the physics ground's only geometry source.
// Map viewport rectangles into the engine's local layout coordinates, including
// fractional layout sizes at browser zoom levels.
export function heroGroundGeometry(hero, horizon, width, height) {
  if (!hero.width || !hero.height || !horizon.width || !horizon.height) return null;
  const scaleX = width / hero.width;
  const scaleY = height / hero.height;
  return {
    centerX: (horizon.left + horizon.width / 2 - hero.left) * scaleX,
    centerY: (horizon.top + horizon.height / 2 - hero.top) * scaleY,
    radiusX: horizon.width / 2 * scaleX,
    radiusY: horizon.height / 2 * scaleY,
  };
}

export function heroGroundY(ground, x) {
  const offset = (x - ground.centerX) / ground.radiusX;
  return ground.centerY - ground.radiusY * Math.sqrt(Math.max(0, 1 - offset * offset));
}
