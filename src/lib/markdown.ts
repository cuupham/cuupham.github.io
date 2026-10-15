import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

export function parseBody(body: string, mdx = false): Root {
  const parser = unified().use(remarkParse);
  if (mdx) parser.use(remarkMdx);
  return parser.parse(body);
}

// Only Markdown raw HTML changes; MDX is trusted code and uses its own parser.
export function escapeMarkdownHtml() {
  return (tree: Root) => {
    visit(tree, 'html', (node, index, parent) => {
      if (parent && index !== undefined) parent.children[index] = { type: 'text', value: node.value } as Text;
    });
  };
}

export function excerpt(body: string, mdx = false): string {
  const tree = parseBody(body, mdx);
  const prose: string[] = [];
  visit(tree, 'paragraph', (paragraph) => {
    const chunks: string[] = [];
    visit(paragraph, 'text', (node) => chunks.push(node.value));
    prose.push(chunks.join(' '));
  });
  const text = prose.join(' ').replace(/\s+/g, ' ').trim();
  const points = Array.from(text);
  if (points.length <= 160) return text;
  const first = points.slice(0, 160).join('');
  const boundary = first.lastIndexOf(' ');
  return (boundary > 0 ? first.slice(0, boundary) : first).trim();
}
