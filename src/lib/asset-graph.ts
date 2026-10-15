import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import values from 'postcss-value-parser';
import ts from 'typescript';
import { visit } from 'unist-util-visit';
import { decodeReference, safeUrl, type SourcePost } from './content-contract';
import { parseBody } from './markdown';
import { approvedMdxImports } from './mdx-components';

export interface AssetGraph {
  assets: Set<string>;
  links: { file: string; url: string }[];
  dependencies: Map<string, Set<string>>;
}

export function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function checkedFile(file: string, root: string): Promise<string> {
  const absolute = path.resolve(file);
  const boundary = path.resolve(root);
  if (!inside(boundary, absolute)) throw new Error(`Source escapes allowed root: ${file}`);
  // Walk from filesystem root, so an allowed-root directory itself cannot be a junction.
  const parsed = path.parse(absolute);
  let cursor = parsed.root;
  for (const segment of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    const stat = await fs.lstat(cursor);
    if (stat.isSymbolicLink()) throw new Error(`Symlink/junction source forbidden: ${cursor}`);
    if (cursor !== absolute && !stat.isDirectory()) throw new Error(`Invalid source parent: ${cursor}`);
    if (cursor === absolute && !stat.isFile()) throw new Error(`Source must be a regular file: ${cursor}`);
  }
  const realRoot = await fs.realpath(boundary);
  const realFile = await fs.realpath(absolute);
  if (!inside(realRoot, realFile)) throw new Error(`Real source escapes allowed root: ${file}`);
  return realFile;
}

export async function resolveSource(root: string, from: string, reference: string, approved: readonly string[] = approvedMdxImports): Promise<string> {
  const decoded = decodeReference(reference);
  if (/^[a-z][a-z0-9+.-]*:/i.test(decoded) || decoded.startsWith('/') || decoded.includes('?') || decoded.includes('#')) {
    throw new Error(`Expected relative local source path: ${reference}`);
  }
  const file = path.resolve(path.dirname(from), decoded);
  const assets = path.resolve(root, 'src/assets');
  if (inside(assets, file)) return checkedFile(file, assets);
  if (approved.some((entry) => path.resolve(root, entry) === file)) {
    return checkedFile(file, path.resolve(root, 'src/components/content'));
  }
  throw new Error(`Source escapes allowed root or unapproved MDX import: ${reference}`);
}

function sourceImports(code: string, file: string): string[] {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports: string[] = [];
  function walk(node: ts.Node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      const arg = node.arguments[0];
      if (!arg || !ts.isStringLiteral(arg)) throw new Error(`Dynamic source dependency cannot be inspected: ${file}`);
      imports.push(arg.text);
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
  return imports;
}

export async function inspectAssets(root: string, posts: readonly SourcePost[], approved: readonly string[] = approvedMdxImports): Promise<AssetGraph> {
  const graph: AssetGraph = { assets: new Set(), links: [], dependencies: new Map() };
  async function edge(from: string, refPath: string, image = false) {
    const file = await resolveSource(root, from, refPath, approved);
    if (image && !/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(file)) throw new Error(`Expected image: ${file}`);
    const edges = graph.dependencies.get(from) ?? new Set<string>();
    edges.add(file);
    graph.dependencies.set(from, edges);
    if (graph.assets.has(file)) return;
    graph.assets.add(file);
    if (/\.css$/i.test(file)) {
      const tree = postcss.parse(await fs.readFile(file, 'utf8'), { from: file });
      const refs: string[] = [];
      tree.walkAtRules('import', (rule) => {
        const parsed = values(rule.params);
        const node = parsed.nodes[0];
        if (node?.type === 'string') refs.push(node.value);
      });
      tree.walk((node) => {
        const raw = node.type === 'decl' ? node.value : node.type === 'atrule' ? node.params : '';
        values(raw).walk((part) => {
          if (part.type === 'function' && part.value.toLowerCase() === 'url') {
            const value = values.stringify(part.nodes).trim().replace(/^(['"])(.*)\1$/, '$2');
            refs.push(value);
          }
        });
      });
      for (const ref of refs) await reference(file, ref);
    } else if (/\.(?:m?[jt]sx?|astro)$/i.test(file)) {
      if (file.endsWith('.astro')) {
        const raw = await fs.readFile(file, 'utf8');
        const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? '';
        for (const ref of sourceImports(frontmatter, file)) await reference(file, ref);
        for (const match of raw.matchAll(/(?:src|href|poster)\s*=\s*["']([^"']+)["']/g)) await reference(file, match[1]!);
        return;
      }
      for (const ref of sourceImports(await fs.readFile(file, 'utf8'), file)) await reference(file, ref);
    } else if (/\.svg$/i.test(file)) {
      // SVG is an image, but its static image/style dependencies still belong to the graph.
      const svg = await fs.readFile(file, 'utf8');
      for (const match of svg.matchAll(/(?:href|xlink:href)\s*=\s*["']([^"']+)["']/g)) await reference(file, match[1]!);
      for (const match of svg.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) await reference(file, match[1]!);
    }
  }
  async function reference(from: string, ref: string, image = false) {
    if (ref.startsWith('#')) return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref) || ref.startsWith('/')) {
      const url = safeUrl(ref);
      if (image) throw new Error(`Content images must use local sources: ${ref}`);
      graph.links.push({ file: from, url });
    } else await edge(from, ref, image);
  }
  for (const post of posts) {
    if (post.data.cover) await edge(post.file, post.data.cover.image, true);
    for (const image of post.data.gallery ?? []) await edge(post.file, image.image, true);
    for (const media of post.data.media ?? []) {
      if (media.kind === 'embed') continue;
      await edge(post.file, media.src);
      if (media.poster) await edge(post.file, media.poster, true);
    }
    for (const action of post.data.actions ?? []) graph.links.push({ file: post.file, url: action.href });
    const tree = parseBody(post.body, post.file.endsWith('.mdx'));
    const refs: { ref: string; image: boolean }[] = [];
    const definitions = new Map<string, string>();
    visit(tree, 'definition', (node) => { definitions.set(node.identifier.toLowerCase(), node.url); });
    visit(tree, (node) => {
      if (node.type === 'image' || node.type === 'imageReference') {
        if (!node.alt?.trim()) throw new Error(`Content image needs alt text in ${post.file}`);
      }
      if (node.type === 'image' || node.type === 'link') refs.push({ ref: node.url, image: node.type === 'image' });
      if (node.type === 'imageReference' || node.type === 'linkReference') {
        const ref = definitions.get(node.identifier.toLowerCase());
        if (!ref) throw new Error(`Missing reference definition in ${post.file}: ${node.identifier}`);
        refs.push({ ref, image: node.type === 'imageReference' });
      }
      if (node.type === 'mdxjsEsm') {
        for (const ref of sourceImports(node.value, post.file)) refs.push({ ref, image: false });
      }
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        for (const attr of node.attributes) {
          if (attr.type === 'mdxJsxAttribute' && ['src', 'href', 'poster'].includes(attr.name) && typeof attr.value === 'string') {
            refs.push({ ref: attr.value, image: attr.name === 'poster' || (node.name === 'img' && attr.name === 'src') });
          }
        }
      }
    });
    for (const { ref, image } of refs) {
      if (ref.startsWith('#') && !image) graph.links.push({ file: post.file, url: safeUrl(`/vi/content/${post.id}/${ref}`) });
      else await reference(post.file, ref, image);
    }
  }
  return graph;
}

