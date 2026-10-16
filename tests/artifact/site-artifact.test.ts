import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { describe, it, expect } from 'vitest';
import { parse } from 'parse5';
import { createWorkspace, seedPosts } from '../../scripts/acceptance-fixture.mjs';
import { attr, elements, text, checkArtifact } from '../../scripts/check-artifact.mjs';

async function command(root: string, args: string[]) {
  return new Promise<{code: number | null; output: string}>((resolve, reject) => {
    const child = spawn(process.execPath, args, {cwd: root, shell: false, env: {...process.env, ASTRO_TELEMETRY_DISABLED: '1'}});
    let output = '';
    const timer = setTimeout(() => { child.kill(); }, 100000);
    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { output += data.toString(); });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('exit', (code) => { clearTimeout(timer); resolve({code, output}); });
  });
}
async function htmlFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  async function walk(relative = '') {
    for (const entry of await fs.readdir(path.join(root, relative), {withFileTypes: true})) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (file.endsWith('.html')) found.push(file.split(path.sep).join('/'));
    }
  }
  await walk(); return found.sort();
}
function expectedPages(count: number, languages = ['vi', 'en']) {
  const expected = ['index.html', '404.html'];
  for (const language of languages) {
    expected.push(`${language}/index.html`);
    if (count) expected.push(`${language}/content/index.html`);
    if (count > 12) expected.push(`${language}/content/page/2/index.html`);
    for (let index = 1; index <= count; index++) expected.push(`${language}/content/cpm-acceptance-fixture-${String(index).padStart(2, '0')}/index.html`);
  }
  return expected.sort();
}
async function page(root: string, relative: string) { return parse(await fs.readFile(path.join(root, 'dist', relative), 'utf8'), {scriptingEnabled: false}); }

describe('independent site artifact oracle', () => {
  it('builds zero/draft-only/1/13/third-locale/remove-last and rejects invalid source/artifact inputs', async () => {
    const f = await createWorkspace();
    const build = () => command(f.root, ['--import', 'tsx', path.join(f.root, 'scripts/build.mjs')]);
    try {
      await seedPosts(f, 0);
      let result = await build(); expect(result.code, result.output).toBe(0);
      expect(await htmlFiles(path.join(f.root, 'dist'))).toEqual(expectedPages(0));
      for (const language of ['vi', 'en']) {
        const home = await page(f.root, `${language}/index.html`);
        expect(elements(home, (node) => attr(node, 'data-post-id') !== undefined)).toHaveLength(0);
        expect(elements(home, (node) => attr(node, 'href') === `/${language}/content/`)).toHaveLength(0);
      }
      await seedPosts(f, 1);
      result = await build(); expect(result.code, result.output).toBe(0);
      expect(await htmlFiles(path.join(f.root, 'dist'))).toEqual(expectedPages(1));
      const full = await page(f.root, 'en/content/cpm-acceptance-fixture-01/index.html');
      expect(elements(full, (node) => node.tagName === 'article').map((node) => attr(node, 'lang'))).toEqual(['vi']);
      expect(text(elements(full, (node) => node.tagName === 'h1')[0])).toBe('Bài kiểm thử 1');
      expect(elements(full, (node) => node.tagName === 'iframe')).toHaveLength(0);
      expect(elements(full, (node) => node.tagName === 'audio')).toHaveLength(1);
      expect(elements(full, (node) => node.tagName === 'script' && text(node).includes('alert'))).toHaveLength(0);
      expect(text(full)).toContain('<script>alert("escaped")</script>');
      expect(elements(full, (node) => node.tagName === 'a' && !!attr(node, 'href')?.endsWith('.wav')).length).toBeGreaterThan(0);
      await seedPosts(f, 13);
      result = await build(); expect(result.code, result.output).toBe(0);
      expect(await htmlFiles(path.join(f.root, 'dist'))).toEqual(expectedPages(13));
      for (const language of ['vi', 'en']) {
        const home = await page(f.root, `${language}/index.html`);
        const list = await page(f.root, `${language}/content/index.html`);
        const second = await page(f.root, `${language}/content/page/2/index.html`);
        expect(elements(home, (node) => attr(node, 'data-post-id') !== undefined)).toHaveLength(3);
        expect(elements(list, (node) => attr(node, 'data-post-id') !== undefined).map((node) => attr(node, 'data-post-id'))).toEqual(Array.from({length: 12}, (_, i) => `cpm-acceptance-fixture-${String(i + 1).padStart(2, '0')}`));
        expect(elements(second, (node) => attr(node, 'data-post-id') !== undefined).map((node) => attr(node, 'data-post-id'))).toEqual(['cpm-acceptance-fixture-13']);
        expect(elements(second, (node) => attr(node, 'data-locale-link') !== undefined).map((node) => attr(node, 'href'))).toEqual([`/${language === 'vi' ? 'en' : 'vi'}/content/page/2/`]);
        const minimal = await page(f.root, `${language}/content/cpm-acceptance-fixture-02/index.html`);
        expect(elements(minimal, (node) => node.tagName === 'figure' || ['gallery', 'article-action'].includes(attr(node, 'class') ?? ''))).toHaveLength(0);
        const japanese = await page(f.root, `${language}/content/cpm-acceptance-fixture-03/index.html`);
        expect(elements(japanese, (node) => node.tagName === 'article').map((node) => attr(node, 'lang'))).toEqual(['ja']);
        expect(text(japanese)).toContain('日本語の本文はUIを切り替えても変わりません。');
      }
      const localeFile = path.join(f.root, 'src/lib/locales.ts');
      const originalLocales = await fs.readFile(localeFile, 'utf8');
      await fs.writeFile(localeFile, originalLocales.replace("export const locales = validateLocales([", "export const locales = validateLocales([\n  { segment: 'fr', language: 'fr', label: 'Français', messages: en },"));
      result = await build(); expect(result.code, result.output).toBe(0);
      expect(await htmlFiles(path.join(f.root, 'dist'))).toEqual(expectedPages(13, ['vi', 'en', 'fr']));
      const third = await page(f.root, 'fr/content/cpm-acceptance-fixture-03/index.html');
      expect(elements(third, (node) => attr(node, 'rel') === 'alternate').map((node) => attr(node, 'hreflang')).sort()).toEqual(['en', 'fr', 'vi']);
      expect(attr(elements(third, (node) => attr(node, 'rel') === 'canonical')[0], 'href')).toBe('https://cuupham.github.io/vi/content/cpm-acceptance-fixture-03/');
      await fs.writeFile(localeFile, originalLocales);
      const postsDirectory = path.join(f.root, 'src/content/posts');
      for (const name of await fs.readdir(postsDirectory)) await fs.unlink(path.join(postsDirectory, name));
      await f.write('dist/stale.html', 'stale output');
      result = await build(); expect(result.code, result.output).toBe(0);
      expect(await htmlFiles(path.join(f.root, 'dist'))).toEqual(expectedPages(0));
      expect((await fs.readdir(path.join(f.root, 'dist/_astro'))).some((name) => name.includes('tone'))).toBe(false);
      expect((await fs.readdir(path.join(f.root, 'dist/_astro'))).some((name) => name.includes('hero-creator'))).toBe(true);
      await f.write('src/content/posts/entry.md', "---\nlanguage: vi\ntitle: Invalid date\npublishedAt: '2026-02-30'\n---\nBody");
      result = await build(); expect(result.code).not.toBe(0); expect(result.output).toContain('calendar date');
      await fs.unlink(path.join(postsDirectory, 'entry.md'));
      await seedPosts(f, 1, {full: false});
      await fs.copyFile(path.join(postsDirectory, 'cpm-acceptance-fixture-01.md'), path.join(postsDirectory, 'cpm-acceptance-fixture-01.mdx'));
      result = await build(); expect(result.code).not.toBe(0); expect(result.output).toContain('Duplicate ID');
      await fs.unlink(path.join(postsDirectory, 'cpm-acceptance-fixture-01.mdx'));
      await f.write('src/content/posts/cpm-acceptance-fixture-01.md', "---\nlanguage: vi\ntitle: Missing fragment\npublishedAt: '2026-10-15'\n---\n[Missing](#missing)");
      result = await build(); expect(result.code).not.toBe(0); expect(result.output).toContain('Missing fragment');
      await f.write('src/content/posts/nested/bad.md', 'bad source');
      const manifest = JSON.parse(await fs.readFile(path.join(f.root, 'node_modules/astro/package.json'), 'utf8'));
      result = await command(f.root, [path.join(f.root, 'node_modules/astro', manifest.bin.astro), 'build', '--root', f.root]);
      expect(result.code).not.toBe(0); expect(result.output).toContain('Nested article');
    } finally { await f.cleanup(); }
  }, 240000);

  it('detects stale routes, hidden paths, missing fragments, fixture leakage and incorrect canonical metadata in output', async () => {
    const f = await createWorkspace();
    try {
      await seedPosts(f, 1);
      const result = await command(f.root, ['--import', 'tsx', path.join(f.root, 'scripts/build.mjs')]);
      expect(result.code, result.output).toBe(0);
      for (const relative of ['.nojekyll', '_astro/.hidden.txt', '.github/config.json', '.well-known/entry.txt']) {
        const hidden = await f.write(`dist/${relative}`, 'must not be silently omitted from the Pages upload');
        await expect(checkArtifact(f.root)).rejects.toThrow('Hidden artifact path');
        await fs.unlink(hidden);
        if (relative.startsWith('.github/') || relative.startsWith('.well-known/')) {
          await fs.rmdir(path.dirname(hidden));
        }
      }
      const target = path.join(f.root, 'dist/en/content/cpm-acceptance-fixture-01/index.html');
      const original = await fs.readFile(target, 'utf8');
      await fs.writeFile(target, original.replace('rel="canonical"', 'rel="incorrect"'));
      await expect(checkArtifact(f.root)).rejects.toThrow('Canonical');
      await fs.writeFile(target, original.replace('href="#top"', 'href="#does-not-exist"'));
      await expect(checkArtifact(f.root)).rejects.toThrow('Missing fragment');
      await fs.writeFile(target, original);
      await f.write('dist/stale.html', '<html></html>');
      await expect(checkArtifact(f.root)).rejects.toThrow('Unexpected HTML');
      await fs.unlink(path.join(f.root, 'dist/stale.html'));
      await fs.unlink(path.join(f.root, '.cpm-test-workspace'));
      await expect(checkArtifact(f.root)).rejects.toThrow('Fixture');
    } finally { await f.cleanup(); }
  }, 120000);
});
