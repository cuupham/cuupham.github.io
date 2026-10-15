import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cpm-contract-'));
  for (const folder of ['src/content/posts', 'src/assets', 'drafts/posts', 'drafts/assets']) {
    await fs.mkdir(path.join(root, folder), { recursive: true });
  }
  await fs.writeFile(path.join(root, '.cpm-test-workspace'), JSON.stringify({kind: 'cpm-acceptance'}));
  async function write(relative: string, value: string | Buffer) {
    const target = path.join(root, relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, value);
    return target;
  }
  async function post(id: string, extra = '', body = 'Nội dung thật trong fixture kiểm thử.', extension = 'md') {
    return write(`src/content/posts/${id}.${extension}`, `---\nlanguage: vi\ntitle: Bài ${id}\npublishedAt: '2026-10-15'\n${extra}---\n\n${body}\n`);
  }
  async function cleanup() {
    const target = path.resolve(root);
    if (path.dirname(target) !== path.resolve(os.tmpdir()) || !path.basename(target).startsWith('cpm-contract-')) {
      throw new Error(`Refusing to clean outside the owned temp workspace: ${target}`);
    }
    await fs.rm(target, { recursive: true, force: true });
  }
  return { root, write, post, cleanup };
}
