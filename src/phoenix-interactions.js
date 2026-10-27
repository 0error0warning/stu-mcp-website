// Hit regions describe anatomy; reactions describe the whole character.
// Keep interaction semantics outside the renderer and joint catalogue.
export function resolvePhoenixInteraction(part) {
  if (part.id === 'cheek-left' || part.id === 'cheek-right') {
    return {
      behavior: 'affection',
      parameters: { direction: part.id === 'cheek-left' ? 1 : -1 },
    };
  }
  return { behavior: part.behavior, parameters: {} };
}
