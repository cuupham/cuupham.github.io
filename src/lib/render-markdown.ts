import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { visit } from 'unist-util-visit';
import type { Root, Image, Link } from 'mdast';
import { escapeMarkdownHtml } from './markdown';
import { linkFor, optimizedImage } from './render-assets';
import type { Post } from './site-content';

const rendered = new Map<string, Promise<string>>();
export function renderMarkdown(post: Post): Promise<string> {
  let result = rendered.get(post.id);
  if (!result) { result = renderPost(post); rendered.set(post.id, result); }
  return result;
}
async function renderPost(post: Post) {
  function assets() {
    return async (tree: Root) => {
      const definitions = new Map<string, string>();
      visit(tree, 'definition', (node) => { definitions.set(node.identifier.toLowerCase(), node.url); });
      visit(tree, (node, index, parent) => {
        if ((node.type === 'imageReference' || node.type === 'linkReference') && parent && index !== undefined) {
          const url = definitions.get(node.identifier.toLowerCase());
          if (!url) throw new Error(`Missing reference in ${post.id}`);
          parent.children[index] = node.type === 'imageReference'
            ? { type: 'image', url, alt: node.alt } as Image
            : { type: 'link', url, children: node.children } as Link;
        }
      });
      const tasks: Promise<void>[] = [];
      visit(tree, (node) => {
        if (node.type === 'heading' && node.depth === 1) node.depth = 2;
        if (node.type === 'image') tasks.push((async () => {
          const image = await optimizedImage(post, node.url);
          node.url = image.src;
          node.data = { ...node.data, hProperties: { ...image.attributes, srcSet: image.srcSet.attribute,
            sizes: '(max-width: 960px) 100vw, 960px', loading: 'lazy', decoding: 'async' } };
        })());
        if (node.type === 'link') tasks.push((async () => {
          node.url = await linkFor(post, node.url);
          if (node.url.startsWith('https://')) node.data = { ...node.data, hProperties: { target: '_blank', rel: 'noopener noreferrer' } };
        })());
      });
      await Promise.all(tasks);
    };
  }
  const processor = await createMarkdownProcessor({ remarkPlugins: [escapeMarkdownHtml, assets] });
  return (await processor.render(post.body ?? '')).code;
}
