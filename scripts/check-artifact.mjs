import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { parse } from 'parse5';
import postcss from 'postcss';
import values from 'postcss-value-parser';
import { fileURLToPath } from 'node:url';
import { preflight } from '../src/lib/preflight.ts';
import { inside } from '../src/lib/asset-graph.ts';
import { SITE, safeUrl, decodeReference } from '../src/lib/content-contract.ts';
import { locales, defaultLocale } from '../src/lib/locales.ts';
import { routePath } from '../src/lib/routes.ts';

/**
 * @param {import('parse5').DefaultTreeAdapterMap['node']} node
 * @param {(node: import('parse5').DefaultTreeAdapterMap['element']) => boolean} [predicate]
 * @returns {import('parse5').DefaultTreeAdapterMap['element'][]}
 */
export function elements(node, predicate = () => true) {
  const result = [];
  function walk(current) {
    if (current.tagName && predicate(current)) result.push(current);
    for (const child of current.childNodes ?? []) walk(child);
    // noscript is parsed with scripting disabled, so its anchors are real elements here.
  }
  walk(node);
  return result;
}
/** @param {import('parse5').DefaultTreeAdapterMap['element'] | undefined} node @param {string} name */
export function attr(node, name) { return node?.attrs?.find((item) => item.name === name)?.value; }
export function text(node) { return node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join(''); }
function assert(value, message) { if (!value) throw new Error(message); }

export async function fixtureMode(root) {
  try {
    const marker = JSON.parse(await fs.readFile(path.join(root, '.cpm-test-workspace'), 'utf8'));
    const real = await fs.realpath(root);
    const temp = await fs.realpath(os.tmpdir());
    assert(inside(temp, real) && path.basename(real).startsWith('cpm-contract-') && marker.kind === 'cpm-acceptance', 'Invalid fixture workspace');
    return true;
  } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

export async function checkArtifact(root, { output = path.join(root, 'dist') } = {}) {
  const fixture = await fixtureMode(root);
  const { posts, routes } = await preflight(root);
  const expected = new Set(['/', '/404.html', ...routes.map((route) => route.path)]);
  const files = [];
  async function walk(folder) {
    for (const entry of await fs.readdir(folder)) {
      const file = path.join(folder, entry);
      assert(!entry.startsWith('.'), `Hidden artifact path: ${path.relative(output, file)}`);
      const stat = await fs.lstat(file);
      assert(!stat.isSymbolicLink(), `Artifact contains symlink: ${file}`);
      if (stat.isDirectory()) await walk(file);
      else { assert(stat.isFile(), `Artifact non-regular file: ${file}`); files.push(file); }
    }
  }
  await walk(output);
  const pages = new Map();
  const fileSet = new Set(files.map((file) => path.resolve(file)));
  for (const file of files) {
    const relative = path.relative(output, file).split(path.sep).join('/');
    assert(!/^(?:src|drafts|docs|mockups|plans|tests|content-templates|node_modules)\//i.test(relative), `Forbidden artifact directory: ${relative}`);
    assert(!/\.(?:mdx?|tsx?|astro|py|map)$/i.test(relative), `Source file emitted: ${relative}`);
    if (!relative.endsWith('.html')) continue;
    const url = relative === 'index.html' ? '/' : relative.endsWith('/index.html') ? `/${relative.slice(0, -10)}` : `/${relative}`;
    assert(expected.has(url), `Unexpected HTML route: ${url}`);
    const html = await fs.readFile(file, 'utf8');
    assert(fixture || !html.includes('cpm-acceptance-fixture-'), `Fixture content in production: ${url}`);
    assert(!html.includes('CPM_PRIVATE_DRAFT_SENTINEL'), `Draft sentinel emitted: ${url}`);
    const dom = parse(html, { scriptingEnabled: false });
    const nodes = elements(dom);
    const ids = nodes.flatMap((node) => attr(node, 'id') ? [attr(node, 'id')] : []);
    assert(new Set(ids).size === ids.length, `Duplicate HTML IDs: ${url}`);
    pages.set(url, { dom, nodes, ids, html });
  }
  assert(pages.size === expected.size && [...expected].every((url) => pages.has(url)), 'Artifact route set differs from content manifest');
  function targetFile(url) {
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { throw new Error(`Bad artifact URL: ${url.href}`); }
    const relative = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const file = path.resolve(output, `.${relative}`);
    assert(inside(path.resolve(output), file) && fileSet.has(file), `Broken local target: ${url.href}`);
    return file;
  }
  function checkReference(raw, from) {
    decodeReference(raw);
    const url = new URL(raw, new URL(from, SITE));
    if (url.origin !== SITE) { safeUrl(url.href); return; }
    safeUrl(url.href);
    targetFile(url);
    if (url.hash) {
      const target = pages.get(url.pathname.endsWith('/index.html') ? url.pathname.slice(0, -10) : url.pathname);
      if (target) assert(target.ids.includes(decodeURIComponent(url.hash.slice(1))), `Missing fragment: ${url.href}`);
    }
  }
  for (const [url, page] of pages) {
    const { nodes } = page;
    const canonicals = nodes.filter((node) => node.tagName === 'link' && attr(node, 'rel') === 'canonical');
    const alternates = nodes.filter((node) => node.tagName === 'link' && attr(node, 'rel') === 'alternate');
    const noindex = nodes.some((node) => node.tagName === 'meta' && attr(node, 'name') === 'robots' && attr(node, 'content')?.includes('noindex'));
    assert(fixture || !nodes.some((node) => node.tagName === 'meta' && attr(node, 'name') === 'cpm-fixture'), `Fixture marker in production: ${url}`);
    const route = routes.find((entry) => entry.path === url);
    assert(nodes.filter((node) => node.tagName === 'h1').length === (url === '/' ? 0 : 1), `Expected one heading: ${url}`);
    if (url === '/404.html') {
      assert(canonicals.length === 0 && alternates.length === 0 && noindex, '404 metadata mismatch');
      assert(!nodes.some((node) => node.tagName === 'a' && attr(node, 'aria-current') === 'page'), '404 must not claim an active home page');
    }
    else {
      const canonicalPath = !route ? `/${defaultLocale.segment}/` : route.context.kind === 'detail' ? routePath(defaultLocale.segment, route.context) : url;
      assert(canonicals.length === 1 && attr(canonicals[0], 'href') === new URL(canonicalPath, SITE).href, `Canonical mismatch: ${url}`);
      const expectedAlternates = route ? locales.map((locale) => `${locale.language}|${new URL(routePath(locale.segment, route.context), SITE).href}`).sort() : [];
      assert(JSON.stringify(alternates.map((node) => `${attr(node, 'hreflang')}|${attr(node, 'href')}`).sort()) === JSON.stringify(expectedAlternates), `Alternates mismatch: ${url}`);
      assert(noindex === (url === '/'), `Index policy mismatch: ${url}`);
    }
    if (url === '/') {
      assert(nodes.some((node) => node.tagName === 'meta' && attr(node, 'http-equiv') === 'refresh' && attr(node, 'content') === `0;url=/${defaultLocale.segment}/`), 'Root redirect missing');
      assert(nodes.some((node) => node.tagName === 'a' && attr(node, 'href') === `/${defaultLocale.segment}/`), 'Root fallback link missing');
    }
    if (route) {
      const locale = locales.find((locale) => locale.segment === route.locale);
      assert(attr(nodes.find((node) => node.tagName === 'html'), 'lang') === locale.language, `Document language mismatch: ${url}`);
      for (const node of nodes.filter((node) => attr(node, 'data-href') !== undefined || attr(node, 'data-locale-link') !== undefined)) {
        const href = attr(node, 'data-href') ?? attr(node, 'href');
        assert(locales.some((locale) => routePath(locale.segment, route.context) === href), `Locale context mismatch: ${url}`);
      }
      if (route.context.kind === 'detail') {
        const post = posts.find((post) => post.id === route.context.id);
        const article = nodes.find((node) => node.tagName === 'article');
        assert(article && attr(article, 'lang') === post.data.language && attr(article, 'data-post-id') === post.id, `Article identity mismatch: ${url}`);
        assert(text(nodes.find((node) => node.tagName === 'h1')) === post.data.title, `Article title changed: ${url}`);
      }
    }
    for (const node of nodes) {
      assert(node.tagName !== 'iframe', `Eager iframe: ${url}`);
      if (node.tagName === 'img') {
        assert(attr(node, 'alt') !== undefined && Number(attr(node, 'width')) > 0 && Number(attr(node, 'height')) > 0, `Image semantics/dimensions missing: ${url}`);
        assert(attr(node, 'srcset') && attr(node, 'sizes'), `Responsive image missing: ${url}`);
      }
      if (node.tagName === 'video' || node.tagName === 'audio') assert(attr(node, 'autoplay') === undefined && attr(node, 'controls') !== undefined && attr(node, 'preload') === 'none', `Media behavior mismatch: ${url}`);
      if (node.tagName === 'a' && attr(node, 'href')) {
        safeUrl(new URL(attr(node, 'href'), new URL(url, SITE)).href);
        if (new URL(attr(node, 'href'), SITE).origin !== SITE) assert(attr(node, 'target') === '_blank' && /\bnoopener\b/.test(attr(node, 'rel') ?? '') && /\bnoreferrer\b/.test(attr(node, 'rel') ?? ''), `Unsafe external link: ${url}`);
      }
      for (const key of ['href', 'src', 'poster', 'data-href']) {
        const value = attr(node, key);
        if (value) checkReference(value, url);
      }
      for (const src of (attr(node, 'srcset') ?? '').split(',').filter(Boolean)) checkReference(src.trim().split(/\s+/)[0], url);
    }
  }
  for (const file of files.filter((file) => file.endsWith('.css'))) {
    const css = postcss.parse(await fs.readFile(file, 'utf8'));
    const from = `/${path.relative(output, file).split(path.sep).join('/')}`;
    css.walk((node) => {
      const raw = node.type === 'decl' ? node.value : node.type === 'atrule' ? node.params : '';
      if (node.type === 'atrule' && node.name === 'import') {
        const first = values(raw).nodes[0];
        if (first?.type === 'string') checkReference(first.value, from);
      }
      values(raw).walk((part) => {
        if (part.type === 'function' && part.value.toLowerCase() === 'url') checkReference(values.stringify(part.nodes).replace(/^['"]|['"]$/g, ''), from);
      });
    });
  }
  return { pages: pages.size, files: files.length, fixture };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(await checkArtifact(process.cwd()));
