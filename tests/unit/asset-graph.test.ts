import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectAssets, resolveSource } from '../../src/lib/asset-graph';
import { readPosts } from '../../src/lib/content-source';
import { writeMediaManifest, mediaSource } from '../../src/lib/media-assets';
import { preflight } from '../../src/lib/preflight';
import { fixture } from '../helpers/content-fixture';

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { for (const fn of cleanup.splice(0)) await fn(); });
async function setup() { const f = await fixture(); cleanup.push(f.cleanup); return f; }

describe('reachable sources', () => {
  it('follows cover/gallery/poster/media/Markdown references/CSS and MDX imports, retaining only reachable files', async () => {
    const f = await setup();
    const shared = await f.write('src/assets/shared.png', 'image bytes');
    await f.write('src/assets/poster.png', 'poster');
    const audio = await f.write('src/assets/recording.mp3', 'audio');
    await f.write('src/assets/unused.mp4', 'not reachable');
    await f.write('src/assets/base.css', 'body { color: black }');
    await f.write('src/assets/theme.css', '@import "./base.css"; .art { background: url("./shared.png") }');
    await f.write('drafts/assets/secret.png', 'draft only');
    await f.post('first', 'cover: { image: ../../assets/shared.png, alt: Cover }\ngallery: [{ image: ../../assets/shared.png, alt: Gallery }]\nmedia: [{ kind: audio, src: ../../assets/recording.mp3, title: Audio, poster: ../../assets/poster.png }]\n', '![Inline][photo]\n\n[photo]: ../../assets/shared.png');
    await f.post('second', '', 'import "../../assets/theme.css"\n\nNội dung MDX.', 'mdx');
    const graph = await inspectAssets(f.root, await readPosts(f.root));
    expect([...graph.assets].map((file) => path.basename(file)).sort()).toEqual(['base.css', 'poster.png', 'recording.mp3', 'shared.png', 'theme.css']);
    await writeMediaManifest(f.root, graph);
    const manifest = await fs.readFile(path.join(f.root, '.astro/media-manifest.mjs'), 'utf8');
    expect(manifest).toContain('recording.mp3?url');
    expect(manifest).not.toContain('unused'); expect(manifest).not.toContain('drafts');
    expect(await mediaSource(f.root, path.join(f.root, 'src/content/posts/first.md'), '../../assets/recording.mp3')).toBe(audio);
    await fs.unlink(path.join(f.root, 'src/content/posts/first.md'));
    const remaining = await inspectAssets(f.root, await readPosts(f.root));
    expect(remaining.assets.has(shared)).toBe(true);
    expect(remaining.assets.has(audio)).toBe(false);
    await writeMediaManifest(f.root, remaining);
    expect(await fs.readFile(path.join(f.root, '.astro/media-manifest.mjs'), 'utf8')).not.toContain('recording.mp3');
  });
  it('accepts contained .. paths and handles cyclic CSS dependencies once', async () => {
    const f = await setup();
    await f.write('src/assets/a.css', '@import "./sub/../b.css";');
    await f.write('src/assets/b.css', '@import "./a.css";');
    await fs.mkdir(path.join(f.root, 'src/assets/sub'));
    await f.post('css', '', 'import "../../assets/a.css"\n\nBody', 'mdx');
    expect((await inspectAssets(f.root, await readPosts(f.root))).assets.size).toBe(2);
  });
  it('allows explicitly reviewed component imports and follows their dependencies', async () => {
    const f = await setup();
    await f.write('src/assets/shared.png', 'image');
    await f.write('src/components/content/note.tsx', 'import image from "../../assets/shared.png"; export default image;');
    await f.post('entry', '', 'import Note from "../../components/content/note.tsx"\n\nBody', 'mdx');
    const posts = await readPosts(f.root);
    await expect(inspectAssets(f.root, posts)).rejects.toThrow('unapproved');
    expect((await inspectAssets(f.root, posts, ['src/components/content/note.tsx'])).assets.size).toBe(2);
    await f.write('src/components/content/note.tsx', 'import image from "../../../drafts/assets/secret.png"; export default image;');
    await expect(inspectAssets(f.root, posts, ['src/components/content/note.tsx'])).rejects.toThrow('escapes');
  });
  it.each([
    ['cover', 'cover: { image: ../../../drafts/assets/secret.png, alt: Secret }\n', 'Body', 'md'],
    ['gallery', 'gallery: [{ image: ../../../drafts/assets/secret.png, alt: Secret }]\n', 'Body', 'md'],
    ['poster', 'media: [{ kind: video, title: Video, src: ../../assets/clip.mp4, poster: ../../../drafts/assets/secret.png }]\n', 'Body', 'md'],
    ['Markdown', '', '![secret](../../../drafts/assets/secret.png)', 'md'],
    ['MDX', '', 'import secret from "../../../drafts/assets/secret.png"\n\nBody', 'mdx'],
    ['CSS', '', 'import "../../assets/leak.css"\n\nBody', 'mdx'],
    ['JS transitively', '', 'import thing from "../../assets/module.js"\n\nBody', 'mdx'],
  ])('rejects draft exposure through %s', async (_kind, extra, body, ext) => {
    const f = await setup();
    await f.write('drafts/assets/secret.png', 'secret');
    await f.write('src/assets/clip.mp4', 'clip');
    await f.write('src/assets/leak.css', 'body { background: url("../../drafts/assets/secret.png") }');
    await f.write('src/assets/module.js', 'export { default } from "../../drafts/assets/secret.png";');
    await f.post('entry', extra, body, ext);
    await expect(inspectAssets(f.root, await readPosts(f.root))).rejects.toThrow('escapes');
  });
  it('rejects missing files and directory references', async () => {
    const f = await setup(); const post = await f.post('entry');
    await expect(resolveSource(f.root, post, '../../assets/missing.png')).rejects.toThrow();
    await fs.mkdir(path.join(f.root, 'src/assets/directory.png'));
    await expect(resolveSource(f.root, post, '../../assets/directory.png')).rejects.toThrow('regular');
  });
  it('rejects unsafe body links and missing route destinations before rendering', async () => {
    const f = await setup();
    await f.post('entry', '', '[bad](javascript:alert)');
    await expect(preflight(f.root)).rejects.toThrow();
    await f.post('entry', '', '[bad](/en/content/missing/)');
    await expect(preflight(f.root)).rejects.toThrow('unknown internal route');
    await f.post('entry', '', '[same](#heading)\n\n## Heading');
    const result = await preflight(f.root);
    expect(result.graph.links[0]?.url).toBe('/vi/content/entry/#heading');
  });
});

describe('filesystem link boundaries', () => {
  it.each(['cover', 'gallery', 'poster', 'media', 'Markdown', 'MDX', 'CSS'])('rejects a parent junction through %s', async (kind) => {
    const f = await setup();
    await f.write('drafts/assets/secret.png', 'secret');
    await f.write('src/assets/clip.mp4', 'video');
    await fs.symlink(path.join(f.root, 'drafts/assets'), path.join(f.root, 'src/assets/linked'), process.platform === 'win32' ? 'junction' : 'dir');
    const ref = '../../assets/linked/secret.png';
    const extra = kind === 'cover' ? `cover: { image: ${ref}, alt: Secret }\n`
      : kind === 'gallery' ? `gallery: [{ image: ${ref}, alt: Secret }]\n`
      : kind === 'poster' ? `media: [{ kind: video, src: ../../assets/clip.mp4, title: Video, poster: ${ref} }]\n`
      : kind === 'media' ? `media: [{ kind: audio, src: ${ref}, title: Audio }]\n` : '';
    const body = kind === 'Markdown' ? `![secret](${ref})` : kind === 'MDX' ? `import secret from "${ref}"\n\nBody`
      : kind === 'CSS' ? 'import "../../assets/leak.css"\n\nBody' : 'Body';
    await f.write('src/assets/leak.css', 'a { background: url("./linked/secret.png") }');
    await f.post('entry', extra, body, ['MDX', 'CSS'].includes(kind) ? 'mdx' : 'md');
    await expect(inspectAssets(f.root, await readPosts(f.root))).rejects.toThrow('Symlink/junction');
  });
  it('rejects content directory junctions', async () => {
    const f = await setup();
    await fs.rmdir(path.join(f.root, 'src/content/posts'));
    await fs.symlink(path.join(f.root, 'drafts/posts'), path.join(f.root, 'src/content/posts'), process.platform === 'win32' ? 'junction' : 'dir');
    await expect(readPosts(f.root)).rejects.toThrow('directory');
  });
  it('rejects a file symlink when this Windows account permits creating one', async (context) => {
    const f = await setup(); const secret = await f.write('drafts/assets/secret.png', 'secret');
    try { await fs.symlink(secret, path.join(f.root, 'src/assets/link.png'), 'file'); }
    catch (error) {
      if (['EPERM', 'EACCES'].includes((error as NodeJS.ErrnoException).code ?? '')) { context.skip(true, 'Account lacks file-symlink creation privilege'); return; }
      throw error;
    }
    const post = await f.post('entry');
    await expect(resolveSource(f.root, post, '../../assets/link.png')).rejects.toThrow('Symlink/junction');
  });
});
