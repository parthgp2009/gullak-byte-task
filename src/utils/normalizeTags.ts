/**
 * Normalizes an array or string of tags:
 * - Trims whitespace
 * - Converts to lowercase
 * - Strips leading '#' if present
 * - Filters out empty strings
 * - Removes duplicates
 */
export function normalizeTags(input: string[] | string): string[] {
  let rawList: string[] = [];

  if (Array.isArray(input)) {
    rawList = input;
  } else if (typeof input === 'string') {
    rawList = input.split(/[,;\n\s]+/);
  }

  const cleaned = rawList
    .map((tag) => tag.trim().toLowerCase().replace(/^#+/, ''))
    .filter((tag) => tag.length > 0);

  return Array.from(new Set(cleaned));
}
