export function matchesTargetNumber(
  targetNumber: string,
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return targetNumber.toLowerCase().includes(normalizedQuery);
}
