import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { checkArtifact } from './check-artifact.mjs';

const result = await checkArtifact(process.cwd());
if (result.fixture) throw new Error('Never release an acceptance fixture');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], {encoding: 'utf8'}).trim()) throw new Error('Release checkout must be clean');
if (!/^[a-f0-9]{40}$/.test(sha) || sha !== process.env.CPM_RELEASE_SHA) throw new Error('Approved SHA and checkout differ');
if (!/^\d+$/.test(process.env.CPM_RELEASE_RUN_ID ?? '')) throw new Error('Missing release run ID');
const files = [];
async function inventory(relative = '') {
  for (const entry of await fs.readdir(path.join('dist', relative), {withFileTypes: true})) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) await inventory(name);
    else {
      const bytes = await fs.readFile(path.join('dist', name));
      files.push({path: name.split(path.sep).join('/'), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')});
    }
  }
}
await inventory(); files.sort((a, b) => a.path < b.path ? -1 : 1);
const receipt = {sha, runId: process.env.CPM_RELEASE_RUN_ID, inventorySha256: createHash('sha256').update(JSON.stringify(files)).digest('hex'), files};
if (!process.argv[2]) throw new Error('Pass a receipt path outside production dist');
const target = path.resolve(process.argv[2]);
if (target.startsWith(`${path.resolve('dist')}${path.sep}`)) throw new Error('Receipt must not be deployed');
await fs.writeFile(target, JSON.stringify(receipt, null, 2));
