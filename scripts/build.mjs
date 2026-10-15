import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { preflight } from '../src/lib/preflight.ts';
import { writeMediaManifest } from '../src/lib/media-assets.ts';
import { inside } from '../src/lib/asset-graph.ts';

export async function buildSite(root) {
  const absolute = await fs.realpath(root);
  const output = path.resolve(absolute, 'dist');
  if (!inside(absolute, output) || path.dirname(output) !== absolute || path.basename(output) !== 'dist') {
    throw new Error(`Unsafe build output: ${output}`);
  }
  const { graph } = await preflight(absolute);
  await writeMediaManifest(absolute, graph);
  try {
    const stat = await fs.lstat(output);
    if (stat.isSymbolicLink() || !stat.isDirectory() || await fs.realpath(output) !== output) {
      throw new Error(`Build output must be an owned regular directory: ${output}`);
    }
    await fs.rm(output, { recursive: true });
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const require = createRequire(import.meta.url);
  const packageFile = require.resolve('astro/package.json');
  const manifest = JSON.parse(await fs.readFile(packageFile, 'utf8'));
  const astro = path.resolve(path.dirname(packageFile), manifest.bin.astro);
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [astro, 'build', '--root', absolute], { cwd: absolute, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Astro build failed (${code})`)));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildSite(process.cwd());
