import { preflight } from '../src/lib/preflight.ts';

const { posts, routes, graph } = await preflight(process.cwd());
console.log(`Content valid: ${posts.length} posts, ${routes.length} locale routes, ${graph.assets.size} reachable assets`);
