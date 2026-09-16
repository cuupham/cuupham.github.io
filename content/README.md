# Content model

U.U.C separates editorial content from page presentation and generates every content index at build time.

## Article source

Each article lives in its own directory:

```text
content/articles/<slug>/
├── article.json   # metadata, taxonomy and publication data
└── content.html   # semantic article body
```

`article.json` requires `slug`, `title`, `description`, `topic`, and `publishedAt`. Optional fields include `updatedAt`, `publishedLabel`, `language`, and `tags`.

`content.html` contains semantic editorial markup such as headings, paragraphs, lists, links, figures, tables and code blocks. It must not contain the site header, footer, SEO shell or page-level styles.

## Taxonomy

Topics are defined in `content/topics.json`. Article, archive, topic and tag listings are generated from article metadata; there is no hand-maintained article index.

## Build

Run:

```bash
python scripts/validate_content.py
python scripts/build.py
```

The builder creates `_site/`, including:

```text
_site/
├── articles/<slug>/index.html
├── archive/index.html
├── topics/index.html
├── topics/<slug>/index.html
├── tags/index.html
└── tags/<slug>/index.html
```

Generated pages are deployment output, not source content. New editorial work should only modify `content/`, `templates/`, or the design system under `assets/`.
