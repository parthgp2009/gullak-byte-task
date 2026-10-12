import { Item } from '../types';

/**
 * Performs a case-insensitive search across title, content, url, and tags.
 * Query is split into terms; an item matches if every term is found in at least
 * one of the item's fields.
 */
export function filterItemsBySearch(items: Item[], query: string): Item[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return items;
  }

  const queryTerms = trimmed.split(/\s+/).filter(Boolean);

  return items.filter((item) => {
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();

    const searchableText = `${title} ${content} ${url} ${tags}`;

    return queryTerms.every((term) => searchableText.includes(term));
  });
}
