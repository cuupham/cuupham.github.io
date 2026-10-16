import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { buildSite } from './build.mjs';
import { inside } from '../src/lib/asset-graph.ts';

const repository = fileURLToPath(new URL('../', import.meta.url));

export async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cpm-contract-'));
  async function write(relative, value) {
    const file = path.join(root, relative);
    if (!inside(root, path.resolve(file))) throw new Error('Fixture write escapes workspace');
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, value);
    return file;
  }
  for (const entry of ['src', 'scripts', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json']) {
    await fs.cp(path.join(repository, entry), path.join(root, entry), {recursive: true});
  }
  // Published content in this sandbox is explicitly seeded, never copied from the owner.
  const posts = path.resolve(root, 'src/content/posts');
  if (!inside(root, posts) || path.basename(posts) !== 'posts') throw new Error('Unsafe fixture posts directory');
  await fs.rm(posts, {recursive: true});
  await fs.mkdir(posts, {recursive: true});
  await fs.symlink(path.join(repository, 'node_modules'), path.join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await write('.cpm-test-workspace', JSON.stringify({kind: 'cpm-acceptance'}));
  async function cleanup() {
    const absolute = path.resolve(root);
    if (path.dirname(absolute) !== path.resolve(os.tmpdir()) || !path.basename(absolute).startsWith('cpm-contract-')) throw new Error('Unsafe fixture cleanup');
    const modules = path.join(absolute, 'node_modules');
    const stat = await fs.lstat(modules).catch((error) => { if (error.code !== 'ENOENT') throw error; });
    if (stat) {
      if (!stat.isSymbolicLink()) throw new Error('Fixture node_modules must be the owned junction');
      await fs.unlink(modules);
    }
    await fs.rm(absolute, {recursive: true, force: true});
  }
  return {root, write, cleanup};
}

export async function seedPosts(workspace, count, { full = true } = {}) {
  for (let index = 1; index <= count; index++) {
    const id = `cpm-acceptance-fixture-${String(index).padStart(2, '0')}`;
    const mdx = index === 3;
    const language = index === 3 ? 'ja' : index === 4 ? 'en' : 'vi';
    let extra = '';
    let body = `## Nội dung\n\nĐây là nội dung kiểm thử riêng trong thư mục tạm. ID ${id}.`;
    if (index === 1 && full) {
      extra = `description: Nội dung chỉ phục vụ nghiệm thu local.\ncover: { image: ../../assets/artwork/collection-observatory.png, alt: Artwork CPM trong fixture }\ngallery: [{ image: ../../assets/artwork/hero-creator.png, alt: Nhân vật nam }, { image: ../../assets/artwork/hero-creator-female.png, alt: Nhân vật nữ }]\nmedia:\n  - { kind: audio, src: ../../assets/acceptance/tone.wav, title: Âm thanh kiểm thử }\n  - { kind: embed, url: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ', title: Big Buck Bunny }\nactions: [{label: GitHub, href: 'https://github.com/cuupham'}]\n`;
      body += '\n\n![Artwork](../../assets/artwork/collection-observatory.png)\n\n[Âm thanh](../../assets/acceptance/tone.wav)\n\n[Nguồn](https://github.com/cuupham)\n\n<script>alert("escaped")</script>\n\n```html\n<iframe>code only</iframe>\n```';
      const samples = 4000;
      const wave = Buffer.alloc(44 + samples * 2);
      wave.write('RIFF'); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8);
      wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
      wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34);
      wave.write('data', 36); wave.writeUInt32LE(samples * 2, 40);
      for (let i = 0; i < samples; i++) wave.writeInt16LE(Math.round(Math.sin(i / 8000 * 440 * 2 * Math.PI) * 3000), 44 + i * 2);
      await workspace.write('src/assets/acceptance/tone.wav', wave);
    }
    if (mdx && full) body = 'import "../../assets/acceptance/theme.css"\n\n## Nội dung MDX\n\n日本語の本文はUIを切り替えても変わりません。\n\n![Artwork](../../assets/artwork/collection-observatory.png)\n\n[GitHub](https://github.com/cuupham)';
    await workspace.write(`src/content/posts/${id}.${mdx ? 'mdx' : 'md'}`, `---\nlanguage: ${language}\ntitle: Bài kiểm thử ${index}\npublishedAt: '2026-10-15'\n${extra}---\n\n${body}\n`);
  }
  if (full && count >= 3) await workspace.write('src/assets/acceptance/theme.css', '.fixture-prose { color: inherit }');
  await workspace.write('drafts/posts/private.md', 'not valid published metadata');
  await workspace.write('drafts/assets/private.txt', 'CPM_PRIVATE_DRAFT_SENTINEL');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {values} = parseArgs({options: {count: {type: 'string', default: '13'}}});
  const count = Number(values.count);
  if (!Number.isInteger(count) || count < 0 || count > 25) throw new Error('Fixture count must be an integer from 0 to 25');
  const workspace = await createWorkspace();
  await seedPosts(workspace, count);
  try {
    await buildSite(workspace.root);
    console.log(JSON.stringify({root: workspace.root, output: path.join(workspace.root, 'dist'), fixture: true}));
  } catch (error) { await workspace.cleanup(); throw error; }
}
