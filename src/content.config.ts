import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertInventory, inventoryPosts } from './lib/content-source';
import { postSchema } from './lib/content-contract';
import { preflight } from './lib/preflight';

function publishedPosts(): Loader {
  return {
    name: 'validated-published-posts',
    async load(context) {
      const root = fileURLToPath(context.config.root);
      const { posts } = await preflight(root);
      const accepted = await inventoryPosts(root);
      const consumed: string[] = [];
      context.store.clear();
      if (!posts.length) return;
      const loader = glob({
        base: pathToFileURL(`${path.join(root, 'src/content/posts')}${path.sep}`),
        pattern: posts.map((post) => path.basename(post.file)),
        generateId: ({ entry }) => {
          consumed.push(path.resolve(root, 'src/content/posts', entry));
          return entry.replace(/\.mdx?$/, '');
        },
      });
      await loader.load(context);
      assertInventory(accepted, consumed);
    },
  };
}

export const collections = { posts: defineCollection({ loader: publishedPosts(), schema: postSchema }) };
