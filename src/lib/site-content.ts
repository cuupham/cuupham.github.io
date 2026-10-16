import { getCollection, type CollectionEntry } from 'astro:content';
import { sortPosts } from './content-contract';
import { routeRegistry } from './routes';
import { excerpt } from './markdown';
import { readPosts } from './content-source';

declare const __CPM_ROOT__: string;

export type Post = CollectionEntry<'posts'>;
let current: Promise<{ posts: Post[]; routes: ReturnType<typeof routeRegistry> }> | undefined;
export function siteContent() {
  current ??= (async () => {
    const inventory = await readPosts(__CPM_ROOT__);
    const posts = inventory.length ? sortPosts(await getCollection('posts')) : [];
    return { posts, routes: routeRegistry(posts.map((post) => post.id)) };
  })();
  return current;
}
export function description(post: Post) {
  return post.data.description || excerpt(post.body ?? '', post.filePath?.endsWith('.mdx')) || post.data.title;
}
