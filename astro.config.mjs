import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'node:url';
import { locales, defaultLocale } from './src/lib/locales.ts';
import { escapeMarkdownHtml } from './src/lib/markdown.ts';
import { preflight } from './src/lib/preflight.ts';
import { writeMediaManifest } from './src/lib/media-assets.ts';
import { checkArtifact, fixtureMode } from './scripts/check-artifact.mjs';

let projectRoot;

export default defineConfig({
  site: 'https://cuupham.github.io',
  base: '/', output: 'static', trailingSlash: 'always',
  build: { format: 'directory' },
  image: { layout: 'constrained', responsiveStyles: true },
  vite: { build: { assetsInlineLimit: 0 } },
  i18n: {
    defaultLocale: defaultLocale.segment,
    locales: locales.map((locale) => locale.segment),
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  markdown: { processor: unified({ remarkPlugins: [escapeMarkdownHtml] }) },
  integrations: [mdx(), {
    name: 'cpm-content-preflight',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig }) => {
        const root = fileURLToPath(config.root);
        projectRoot = root;
        updateConfig({ vite: { define: { __CPM_ROOT__: JSON.stringify(root), __CPM_FIXTURE__: await fixtureMode(root) } } });
        const { graph } = await preflight(root);
        await writeMediaManifest(root, graph);
      },
      'astro:build:done': async ({ dir }) => {
        const result = await checkArtifact(projectRoot, { output: fileURLToPath(dir) });
        console.log(`Artifact valid: ${result.pages} pages, ${result.files} files${result.fixture ? ' (isolated fixture)' : ''}`);
      },
    },
  }],
});
