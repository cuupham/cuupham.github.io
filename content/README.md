# Content model

U.U.C separates editorial content from page presentation.

Each migrated article lives in its own directory:

```text
content/articles/<slug>/
├── article.json   # metadata and taxonomy
└── content.html   # semantic article body
```

## `article.json`

Required fields:

- `slug`
- `title`
- `description`
- `topic`
- `publishedAt`

Optional fields include `updatedAt`, `publishedLabel`, `language`, and `tags`.

The slug must match the article directory name. Tags are an array of strings.

## `content.html`

Use semantic HTML for the article body: headings, paragraphs, lists, links, figures, tables, code blocks, and other content elements supported by the design system.

Do not duplicate the site header, footer, metadata shell, or page-level styles here. Those belong to `templates/` and `assets/`.

## Build

Run:

```bash
python scripts/validate_content.py
python scripts/build.py
```

The builder writes the deployable static site to `_site/`. Articles without a migrated source remain available through their existing static HTML files, which makes migration incremental and keeps existing URLs stable.
