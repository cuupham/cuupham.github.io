import { describe, it, expect, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root } from 'mdast';
import { calendarDate, validateId, safeUrl, postSchema, sortPosts, formatDate } from '../../src/lib/content-contract';
import { readPosts, assertInventory } from '../../src/lib/content-source';
import { escapeMarkdownHtml, excerpt } from '../../src/lib/markdown';
import { fixture } from '../helpers/content-fixture';

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { for (const fn of cleanup.splice(0)) await fn(); });
async function setup() { const f = await fixture(); cleanup.push(f.cleanup); return f; }
const data = { language: 'vi', title: 'Bài viết', publishedAt: '2026-10-15' };

describe('article metadata', () => {
  it.each(['page', 'Upper', 'tiếng-việt', 'a_b', '-first', 'two--dashes', ''])('rejects unsafe ID %j', (id) => expect(() => validateId(id)).toThrow());
  it.each(['2026-02-29', '2024-02-30', '2026-13-01', '2026-01-00', '2026-1-1', '0000-01-01', '2026-01-01T00:00:00Z'])('rejects date %s', (date) => expect(() => calendarDate(date)).toThrow());
  it('accepts leap days and formats without local timezone shifts', () => {
    expect(calendarDate('2024-02-29')).toBe('2024-02-29');
    expect(formatDate('2026-10-15', 'en-US')).toBe('Oct 15, 2026');
  });
  it('accepts a language outside UI registry and optional fields only when supplied', () => {
    expect(postSchema.parse({ ...data, language: 'ja-jp' })).toEqual({ ...data, language: 'ja-JP' });
    expect(postSchema.parse({ ...data, actions: [{ label: 'Nguồn', href: 'https://example.com' }] }).actions?.[0]?.kind).toBeUndefined();
  });
  it.each([
    { title: ' ' }, { slug: 'override' }, { cover: { image: '../../assets/a.png', alt: '' } },
    { gallery: [{ image: '../../assets/a.png' }] }, { actions: [{ label: '', href: 'https://example.com' }] },
    { media: [{ kind: 'embed', title: 'Video', url: '/vi/' }] },
    { media: [{ kind: 'audio', src: '../../assets/a.mp3' }] }, { publishedAt: new Date() },
  ])('rejects malformed nested/required metadata %j', (invalid) => expect(() => postSchema.parse({ ...data, ...invalid })).toThrow());
  it('sorts future dates without filtering, uses ASCII tie order and does not mutate input', () => {
    const posts = [{ id: 'z', data: { publishedAt: '2026-10-15' } }, { id: 'a', data: { publishedAt: '2026-10-15' } }, { id: 'future', data: { publishedAt: '2099-01-01' } }];
    expect(sortPosts(posts).map((post) => post.id)).toEqual(['future', 'a', 'z']);
    expect(posts[0]?.id).toBe('z');
  });
});

describe('shared URL policy', () => {
  it.each(['javascript:alert(1)', 'data:text/html,x', 'file:///secret', '//example.com', '/%2fexample.com', 'https://u:p@example.com', 'https://example.com/%0a', '/%250d', 'https://example.com/%5csecret', '/%255csecret', 'https://example.com/\u0001', 'https:\\example.com', 'https://example.com/%zz', ' https://example.com'])('rejects %j', (url) => expect(() => safeUrl(url)).toThrow());
  it('normalizes internal and external paths with queries and fragments', () => {
    expect(safeUrl('/vi/../en/?q=1#main')).toBe('/en/?q=1#main');
    expect(safeUrl('HTTPS://EXAMPLE.COM:443/a')).toBe('https://example.com/a');
    expect(safeUrl('https://example.com/a%20b')).toBe('https://example.com/a%20b');
    expect(safeUrl('https://example.com/a%25')).toBe('https://example.com/a%25');
  });
  it.each(['https://u:p@example.com', 'https://example.com/%0a', 'https://example.com/%5c', 'https://example.com\n'])('applies the same parser to embeds %s', (url) => {
    expect(() => postSchema.parse({ ...data, media: [{ kind: 'embed', title: 'Source', url }] })).toThrow();
  });
});

describe('raw inventory before Astro', () => {
  it.each([0, 1, 3, 4, 12, 13, 24, 25])('reads and sorts a real isolated inventory of %i posts', async (count) => {
    const f = await setup();
    const ids = Array.from({ length: count }, (_, i) => `entry-${i + 1}`);
    for (const id of [...ids].reverse()) await f.post(id);
    expect((await readPosts(f.root)).map((post) => post.id)).toEqual([...ids].sort());
  });
  it('ignores drafts and returns an empty production set', async () => {
    const f = await setup();
    await f.write('drafts/posts/bad.md', 'not a valid article');
    expect(await readPosts(f.root)).toEqual([]);
  });
  it('fails duplicate md/mdx IDs before a collection can deduplicate them', async () => {
    const f = await setup(); await f.post('same'); await f.post('same', '', 'Body', 'mdx');
    await expect(readPosts(f.root)).rejects.toThrow('Duplicate ID');
  });
  it('discovers and rejects nested articles', async () => {
    const f = await setup(); await f.post('nested/hidden');
    await expect(readPosts(f.root)).rejects.toThrow('Nested article');
  });
  it.each(['Upper', 'page', 'tiếng-việt'])('does not silently normalize %s', async (id) => {
    const f = await setup(); await f.post(id); await expect(readPosts(f.root)).rejects.toThrow('ID');
  });
  it('rejects slug overrides, duplicate YAML keys and empty bodies with file context', async () => {
    const f = await setup(); const file = await f.post('entry', 'slug: override\n');
    await expect(readPosts(f.root)).rejects.toThrow('entry.md');
    await f.post('entry', 'title: duplicate\n'); await expect(readPosts(f.root)).rejects.toThrow('unique');
    await f.post('entry', '', '<!-- nothing -->'); await expect(readPosts(f.root)).rejects.toThrow('Body');
    await fs.unlink(file);
  });
  it('requires exact loader/inventory equality including duplicate consumption', () => {
    const file = path.resolve('entry.md');
    expect(() => assertInventory([file], [file])).not.toThrow();
    expect(() => assertInventory([file], [])).toThrow('mismatch');
    expect(() => assertInventory([file], [file, file])).toThrow('mismatch');
  });
});

describe('Markdown policy and real excerpts', () => {
  it('escapes script/iframe/event HTML but retains fenced code', async () => {
    const processor = unified().use(remarkParse).use(escapeMarkdownHtml);
    const tree = await processor.run(processor.parse('<script>alert(1)</script>\n\n<iframe src="x"></iframe>\n\n<img src=x onerror=alert(1)>\n\n```html\n<script>example</script>\n```')) as Root;
    expect(JSON.stringify(tree)).not.toContain('"type":"html"');
    expect(tree.children.at(-1)?.type).toBe('code');
    expect(JSON.stringify(tree)).toContain('onerror');
  });
  it('extracts prose, excludes code/images/URLs and caps Unicode code points', () => {
    expect(excerpt('# Heading\n\nRead [this](https://example.com) now.\n\n```js\nsecret code\n```\n\n![alt](x.png)')).toBe('Read this now.');
    expect(Array.from(excerpt('😀'.repeat(170)))).toHaveLength(160);
    expect(excerpt('```js\ncode only\n```')).toBe('');
  });
});
