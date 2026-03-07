export function findPageItems<T>(page: Record<string, unknown>): T[] | readonly T[] | null {
  const key = Object.keys(page).find(
    (candidate) => candidate !== "links" && Array.isArray(page[candidate]),
  );

  if (!key) {
    return null;
  }

  return page[key] as T[] | readonly T[];
}
