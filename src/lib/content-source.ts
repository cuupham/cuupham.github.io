import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { postSchema, sortPosts, validateId, type SourcePost } from './content-contract';

export async function inventoryPosts(root: string): Promise<string[]> {
  const base = path.resolve(root, 'src/content/posts');
  const files: string[] = [];
  const ids = new Set<string>();
  // Check every parent as well as each entry; a junction at posts/ is not safe.
  let parent = path.resolve(root);
  for (const segment of ['src', 'content', 'posts']) {
    parent = path.join(parent, segment);
    try {
      const stat = await fs.lstat(parent);
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Invalid content directory: ${parent}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }
  async function walk(folder: string) {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      const stat = await fs.lstat(file);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error(`Non-regular content source: ${file}`);
      if (stat.isDirectory()) { await walk(file); continue; }
      if (entry.name === '.gitkeep') continue;
      if (!/\.mdx?$/i.test(entry.name)) throw new Error(`Unexpected file in posts: ${file}`);
      if (folder !== base) throw new Error(`Nested article is forbidden: ${file}`);
      const id = validateId(entry.name.replace(/\.mdx?$/i, ''));
      if (!/\.mdx?$/.test(entry.name)) throw new Error(`Use lowercase extension: ${file}`);
      if (ids.has(id)) throw new Error(`Duplicate ID before loader: ${id}`);
      ids.add(id);
      files.push(file);
    }
  }
  await walk(base);
  return files.sort();
}

export function assertInventory(accepted: readonly string[], consumed: readonly string[]) {
  const a = [...accepted].map((file) => path.resolve(file)).sort();
  const b = [...consumed].map((file) => path.resolve(file)).sort();
  if (a.length !== b.length || a.some((file, i) => file !== b[i])) throw new Error('Loader/inventory file-set mismatch');
}

export async function readPosts(root: string): Promise<SourcePost[]> {
  const files = await inventoryPosts(root);
  const posts: SourcePost[] = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const frontmatter = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
      if (!frontmatter) throw new Error('YAML frontmatter is required');
      const body = raw.slice(frontmatter[0].length);
      if (!body.trim() || !body.replace(/<!--[\s\S]*?-->/g, '').trim()) throw new Error('Body must not be empty');
      posts.push({ id: path.basename(file).replace(/\.mdx?$/, ''), file, body, data: postSchema.parse(parseYaml(frontmatter[1]!, { uniqueKeys: true, maxAliasCount: 0 })) });
    } catch (error) { throw new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`, { cause: error }); }
  }
  return sortPosts(posts);
}
