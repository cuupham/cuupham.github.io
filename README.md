# cuupham.github.io

A content-first publishing hub for knowledge, ideas, stories, games, comics, novels, music and more.

## Architecture

- **Landing** — entry point and discovery
- **Topics** — extensible subject taxonomy
- **Articles** — Markdown/MDX-ready content model
- **Collections** — reserved for curated lists and future media collections
- **Archive** — future chronological discovery layer

## Adding a topic

Add an entry to `src/data/topics.ts`. Topic pages are generated automatically.

## Adding an article

Create a Markdown file in `src/content/articles/` with frontmatter matching `src/content/config.ts`.

```yaml
---
title: 'Article title'
description: 'Short description'
pubDate: 2026-09-08
topic: technology
tags: ['example']
type: article
featured: false
draft: false
---
```

## Development

```bash
npm install
npm run dev
npm run build
```

The `main` branch deploys automatically to GitHub Pages through `.github/workflows/deploy.yml`.
