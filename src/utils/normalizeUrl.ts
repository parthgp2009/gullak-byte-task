/**
 * Normalizes and validates a URL string.
 * Auto-prepends https:// when the protocol scheme is missing.
 */
export function normalizeUrl(rawUrl: string): {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'URL cannot be empty',
    };
  }

  // Prepend https:// if no scheme is provided
  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);
    // Basic domain check: needs a valid hostname with at least one dot or localhost
    const hasValidHost =
      parsed.hostname === 'localhost' ||
      (parsed.hostname.includes('.') &&
        !parsed.hostname.startsWith('.') &&
        !parsed.hostname.endsWith('.'));

    if (!hasValidHost) {
      return {
        isValid: false,
        normalizedUrl: formatted,
        error: 'Please enter a valid domain (e.g. example.com)',
      };
    }

    return {
      isValid: true,
      normalizedUrl: formatted,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: formatted,
      error: 'Invalid URL format',
    };
  }
}
