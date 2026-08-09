/**
 * Deduplicates an array of objects in memory by a specified property (e.g., 'id' or 'tmdbId').
 */
export function deduplicateByProperty<T, K extends keyof T>(items: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  return items.filter((item) => {
    const value = item[key];
    if (value === undefined || value === null) return true;
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Deduplicates primitive value arrays (e.g., list of category strings or tag IDs).
 */
export function deduplicatePrimitives<T extends string | number>(items: T[]): T[] {
  return Array.from(new Set(items));
}
