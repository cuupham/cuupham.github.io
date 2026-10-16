import path from 'node:path';
import { readPosts } from './content-source';
import { inspectAssets } from './asset-graph';
import { routeRegistry } from './routes';
import { SITE } from './content-contract';

export async function preflight(root: string) {
  const posts = await readPosts(root);
  const routes = routeRegistry(posts.map((post) => post.id));
  const graph = await inspectAssets(root, posts);
  const targets = new Set(['/', '/404.html', ...routes.map((route) => route.path)]);
  for (const { file, url } of graph.links) {
    if (!url.startsWith('/')) continue;
    const target = new URL(url, SITE);
    if (!targets.has(target.pathname)) throw new Error(`${path.relative(root, file)}: unknown internal route ${url}`);
  }
  return { posts, routes, graph };
}
