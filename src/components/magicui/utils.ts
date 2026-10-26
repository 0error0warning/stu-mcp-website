// Small class combiner for the adapted Magic UI components; no Tailwind runtime.
export function cn(...values: unknown[]): string {
  return values.flatMap(value => {
    if (!value) return [];
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return [cn(...value)];
    if (typeof value === 'object') return Object.entries(value).filter(([, enabled]) => enabled).map(([name]) => name);
    return [];
  }).join(' ');
}
