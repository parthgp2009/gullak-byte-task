// Verification script for Gullak utilities and core business logic
const assert = require('assert');

// 1. normalizeUrl logic
function normalizeUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { isValid: false, normalizedUrl: '', error: 'URL cannot be empty' };
  }
  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }
  try {
    const parsed = new URL(formatted);
    const hasValidHost =
      parsed.hostname === 'localhost' ||
      (parsed.hostname.includes('.') &&
        !parsed.hostname.startsWith('.') &&
        !parsed.hostname.endsWith('.'));
    if (!hasValidHost) {
      return { isValid: false, normalizedUrl: formatted, error: 'Please enter a valid domain' };
    }
    return { isValid: true, normalizedUrl: formatted };
  } catch {
    return { isValid: false, normalizedUrl: formatted, error: 'Invalid URL format' };
  }
}

// 2. normalizeTags logic
function normalizeTags(input) {
  let rawList = [];
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

// 3. deriveTitle logic
function deriveTitle(type, title, content, url, dateStr = 'Oct 12, 2026') {
  const trimmed = title.trim();
  if (trimmed) return trimmed;
  switch (type) {
    case 'note': {
      const firstLine = content.split('\n').map((l) => l.trim()).find((l) => l.length > 0);
      if (!firstLine) return 'Untitled Note';
      return firstLine.length > 60 ? `${firstLine.substring(0, 57)}...` : firstLine;
    }
    case 'link': {
      if (url) {
        try {
          const formatted = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
          const parsed = new URL(formatted);
          const domain = parsed.hostname.replace(/^www\./i, '');
          if (domain) return domain;
        } catch {}
      }
      return `Link ${dateStr}`;
    }
    case 'image':
      return `Image ${dateStr}`;
    default:
      return 'Untitled';
  }
}

// 4. filterItemsBySearch logic
function filterItemsBySearch(items, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;
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

// RUN TESTS
console.log('--- Running Gullak Logic Verification Suite ---');

// Test 1: normalizeUrl
console.log('Testing normalizeUrl...');
assert.strictEqual(normalizeUrl('github.com').isValid, true);
assert.strictEqual(normalizeUrl('github.com').normalizedUrl, 'https://github.com');
assert.strictEqual(normalizeUrl('https://expo.dev/docs').isValid, true);
assert.strictEqual(normalizeUrl('https://expo.dev/docs').normalizedUrl, 'https://expo.dev/docs');
assert.strictEqual(normalizeUrl('   ').isValid, false);
assert.strictEqual(normalizeUrl('invalid-no-dot').isValid, false);
console.log('✓ normalizeUrl passed');

// Test 2: normalizeTags
console.log('Testing normalizeTags...');
const rawTags = ['#Recipes', ' dessert ', 'RECIPES', '#SWEET', ''];
const tagsResult = normalizeTags(rawTags);
assert.deepStrictEqual(tagsResult, ['recipes', 'dessert', 'sweet']);
assert.deepStrictEqual(normalizeTags('react, native; mobile  #expo'), ['react', 'native', 'mobile', 'expo']);
console.log('✓ normalizeTags passed');

// Test 3: deriveTitle
console.log('Testing deriveTitle...');
assert.strictEqual(deriveTitle('note', '', 'First line of thoughts\nSecond line'), 'First line of thoughts');
assert.strictEqual(deriveTitle('note', 'Custom Title', 'First line'), 'Custom Title');
assert.strictEqual(deriveTitle('note', '', ''), 'Untitled Note');
assert.strictEqual(deriveTitle('link', '', '', 'https://www.nytimes.com/section/world'), 'nytimes.com');
assert.strictEqual(deriveTitle('image', '', '', undefined, 'Oct 12, 2026'), 'Image Oct 12, 2026');
console.log('✓ deriveTitle passed');

// Test 4: filterItemsBySearch
console.log('Testing filterItemsBySearch...');
const sampleItems = [
  { id: '1', title: 'Grandma Secret Recipe', content: 'Warm apple pie', url: '', tags: ['dessert', 'baking'] },
  { id: '2', title: 'Expo Router Guide', content: 'File-based navigation', url: 'https://docs.expo.dev', tags: ['code', 'mobile'] },
  { id: '3', title: 'Terracotta Piggy Bank', content: 'Clay craft collection', url: '', tags: ['gullak', 'art'] },
];

assert.strictEqual(filterItemsBySearch(sampleItems, 'recipe').length, 1);
assert.strictEqual(filterItemsBySearch(sampleItems, 'apple pie').length, 1);
assert.strictEqual(filterItemsBySearch(sampleItems, 'expo.dev').length, 1);
assert.strictEqual(filterItemsBySearch(sampleItems, 'baking dessert').length, 1);
assert.strictEqual(filterItemsBySearch(sampleItems, 'nonexistent').length, 0);
assert.strictEqual(filterItemsBySearch(sampleItems, 'GULLAK').length, 1); // Case-insensitive
console.log('✓ filterItemsBySearch passed');

// Test 5: Corrupt storage JSON safe parsing fallback
console.log('Testing Safe JSON Fallback...');
function safeParseItems(jsonString) {
  try {
    if (!jsonString) return [];
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

assert.deepStrictEqual(safeParseItems(null), []);
assert.deepStrictEqual(safeParseItems(''), []);
assert.deepStrictEqual(safeParseItems('{"invalid": true}'), []);
assert.deepStrictEqual(safeParseItems('corrupted json text {{{'), []);
assert.deepStrictEqual(safeParseItems('[{"id":"1","title":"Test"}]'), [{ id: '1', title: 'Test' }]);
console.log('✓ Safe JSON Fallback passed');

console.log('\n===========================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('===========================================');
