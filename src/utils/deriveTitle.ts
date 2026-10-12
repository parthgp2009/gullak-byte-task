import { ItemType } from '../types';
import { formatDate } from './formatDate';

/**
 * Automatically derives a title for an item if the title was left blank by the user.
 * - Note: First non-empty line of content, capped at 60 characters (or "Untitled Note")
 * - Link: Domain / hostname extracted from URL (e.g. "github.com")
 * - Image: "Image <date>"
 */
export function deriveTitle(
  type: ItemType,
  title: string,
  content: string,
  url?: string,
  createdAt?: string
): string {
  const trimmed = title.trim();
  if (trimmed) {
    return trimmed;
  }

  const dateString = formatDate(createdAt || new Date().toISOString());

  switch (type) {
    case 'note': {
      const firstLine = content
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.length > 0);

      if (!firstLine) {
        return 'Untitled Note';
      }
      return firstLine.length > 60 ? `${firstLine.substring(0, 57)}...` : firstLine;
    }

    case 'link': {
      if (url) {
        try {
          const formatted = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
          const parsed = new URL(formatted);
          const domain = parsed.hostname.replace(/^www\./i, '');
          if (domain) {
            return domain;
          }
        } catch {
          // If URL parsing fails, continue to fallback
        }
      }
      return `Link ${dateString}`;
    }

    case 'image': {
      return `Image ${dateString}`;
    }

    default:
      return 'Untitled';
  }
}
