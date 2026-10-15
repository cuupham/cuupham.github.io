import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveSource, type AssetGraph } from './asset-graph';

export async function mediaSource(root: string, from: string, ref: string) {
  return resolveSource(root, from, ref);
}

export async function writeMediaManifest(root: string, graph: AssetGraph) {
  const folder = path.resolve(root, '.astro');
  await fs.mkdir(folder, { recursive: true });
  const imports: string[] = [];
  const entries: string[] = [];
  const imageImports: string[] = [];
  const imageEntries: string[] = [];
  for (const [i, file] of [...graph.assets].sort().filter((file) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(file)).entries()) {
    const relative = path.relative(folder, file).split(path.sep).join('/');
    imageImports.push(`import image${i} from ${JSON.stringify(relative)};`);
    imageEntries.push(`${JSON.stringify(path.relative(root, file).split(path.sep).join('/'))}: image${i}`);
  }
  // Only reachable non-image sources need ?url. Images use Astro's asset pipeline.
  for (const [i, file] of [...graph.assets].sort().filter((file) =>
    !/\.(png|jpe?g|gif|webp|avif|svg|css|m?[jt]sx?|astro)$/i.test(file) &&
    !file.startsWith(`${path.resolve(root, 'src/components')}${path.sep}`)).entries()) {
    const relative = path.relative(folder, file).split(path.sep).join('/');
    imports.push(`import asset${i} from ${JSON.stringify(`${relative}?url`)};`);
    const key = path.relative(root, file).split(path.sep).join('/');
    entries.push(`${JSON.stringify(key)}: asset${i}`);
  }
  await fs.writeFile(path.join(folder, 'media-manifest.mjs'),
    `${imports.join('\n')}\nexport default {${entries.join(',\n')}};\n`);
  await fs.writeFile(path.join(folder, 'image-manifest.mjs'), `${imageImports.join('\n')}\nexport default {${imageEntries.join(',\n')}};\n`);
  await fs.writeFile(path.join(folder, 'image-manifest.d.mts'), "import type { ImageMetadata } from 'astro';\ndeclare const images: Record<string, ImageMetadata>;\nexport default images;\n");
  await fs.writeFile(path.join(folder, 'media-manifest.d.mts'), 'declare const media: Record<string, string>;\nexport default media;\n');
}
