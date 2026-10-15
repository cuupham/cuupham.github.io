import { z } from 'zod';
import { contentLanguage } from './locales';

export const SITE = 'https://cuupham.github.io';
export const LATEST_COUNT = 3;
export const PAGE_SIZE = 12;

export function validateId(id: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id === 'page') {
    throw new Error(`Invalid or reserved post ID: ${id}`);
  }
  return id;
}

export function calendarDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000') ||
    Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid calendar date (YYYY-MM-DD): ${value}`);
  }
  return value;
}

// Inspect repeated encodings before URL parsing can discard unsafe characters.
export function decodeReference(value: string): string {
  let decoded = value;
  for (let pass = 0; pass < 8; pass++) {
    if (/[\\\u0000-\u001f\u007f-\u009f]/.test(decoded)) {
      throw new Error('Unsafe URL/path characters');
    }
    let next: string;
    try { next = decodeURIComponent(decoded); } catch {
      if (pass > 0 && !/%[0-9a-f]{2}/i.test(decoded)) return decoded;
      throw new Error('Invalid URL encoding');
    }
    if (next === decoded) return decoded;
    decoded = next;
  }
  throw new Error('Excessive URL encoding');
}

export function safeUrl(value: string): string {
  if (!value || value !== value.trim()) throw new Error('Invalid URL');
  const decoded = decodeReference(value);
  if (decoded.startsWith('//')) throw new Error('Network-path URL forbidden');
  const internal = value.startsWith('/');
  let url: URL;
  try { url = new URL(value, SITE); } catch { throw new Error('Invalid URL'); }
  if (url.username || url.password || (internal ? url.origin !== SITE : !/^https:\/\//i.test(value))) {
    throw new Error('Expected same-origin path or HTTPS without credentials');
  }
  if (url.protocol !== 'https:') throw new Error('HTTPS required');
  return internal ? `${url.pathname}${url.search}${url.hash}` : url.href;
}

const nonEmpty = z.string().trim().min(1);
const date = z.string().transform((value, ctx) => {
  try { return calendarDate(value); } catch (error) { ctx.addIssue({ code: 'custom', message: String(error) }); return z.NEVER; }
});
const sourcePath = z.string().min(1).refine((value) => value === value.trim(), 'Source paths must not have surrounding whitespace');
const url = z.string().min(1).transform((value, ctx) => {
  try { return safeUrl(value); } catch (error) { ctx.addIssue({ code: 'custom', message: String(error) }); return z.NEVER; }
});
const language = nonEmpty.transform((value, ctx) => {
  try { return contentLanguage(value); } catch (error) { ctx.addIssue({ code: 'custom', message: String(error) }); return z.NEVER; }
});
const image = z.object({ image: sourcePath, alt: nonEmpty, caption: nonEmpty.optional() }).strict();

// Astro and raw preflight both consume this schema; neither maintains a copy.
export const postSchema = z.object({
  language, title: nonEmpty, publishedAt: date,
  description: nonEmpty.optional(), updatedAt: date.optional(),
  cover: image.optional(), gallery: z.array(image).optional(),
  media: z.array(z.discriminatedUnion('kind', [
    z.object({ kind: z.enum(['video', 'audio']), src: sourcePath, title: nonEmpty,
      poster: sourcePath.optional(), caption: nonEmpty.optional() }).strict(),
    z.object({ kind: z.literal('embed'), url: url.refine((value) => value.startsWith('https://'), 'External HTTPS embed required'), title: nonEmpty }).strict(),
  ])).optional(),
  actions: z.array(z.object({ kind: z.enum(['experience', 'download']).optional(), label: nonEmpty, href: url }).strict()).optional(),
  platform: nonEmpty.optional(), version: nonEmpty.optional(),
}).strict();

export type PostData = z.infer<typeof postSchema>;
export interface SourcePost { id: string; file: string; body: string; data: PostData }

export function sortPosts<T extends { id: string; data: { publishedAt: string } }>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => a.data.publishedAt === b.data.publishedAt
    ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    : a.data.publishedAt > b.data.publishedAt ? -1 : 1);
}

export function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(`${calendarDate(value)}T00:00:00Z`));
}
