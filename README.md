# cuupham.github.io

A content-first publishing space for knowledge, ideas, stories, games, comics, novels, music and whatever is worth sharing.

## Stack

This is intentionally a **pure static site**:

- HTML5
- Modern CSS
- No Node.js
- No React / Next.js / Astro
- No runtime server
- No build step
- Hosted directly by GitHub Pages

GitHub Pages supports publishing static files directly from a repository. This site uses the branch/root publishing model, so the repository itself is the published site.

## Structure

```text
/
├── index.html
├── topics/
│   ├── index.html
│   └── <topic>/index.html
├── articles/
│   ├── index.html
│   └── <article>/index.html
├── archive/
│   └── index.html
├── tags/
│   ├── index.html
│   └── <tag>/index.html
├── assets/
│   ├── brand/
│   │   ├── README.md
│   │   ├── brand.css
│   │   └── mark.svg
│   ├── css/site.css
│   └── favicon.svg
├── about.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── rss.xml
└── .nojekyll
```

## Brand system

The site uses the **C.U.U** identity:

- **Curious. Useful. Universal.**
- Promise: **Explore widely. Understand deeply. Share usefully.**
- Primary slogan: **Curious by nature. Useful by design. Universal by intent.**
- Short slogan: **Explore. Understand. Share.**

Brand assets are intentionally modular. `assets/brand/mark.svg` is the canonical symbol, while the website header composes the wordmark and descriptor as HTML. Brand tokens and lockup rules live in `assets/brand/brand.css`; detailed maintenance rules live in `assets/brand/README.md`.

## Publishing a new article

1. Create `articles/<slug>/index.html`.
2. Add the article to `articles/index.html`.
3. Add it to its relevant topic page.
4. Add any tags to `tags/index.html` and create the corresponding tag page.
5. Add the URL to `sitemap.xml`.
6. Add the item to `rss.xml`.
7. Commit and push to `main`.

There is no build command.

## Adding a new topic

Create `topics/<slug>/index.html`, then add the topic card to `index.html` and `topics/index.html`. The visual system is shared through `assets/css/site.css`, so the topic page only needs semantic HTML.

## Adding a new tag

Create `tags/<slug>/index.html`, add the tag to `tags/index.html`, and link to it from relevant article metadata. Tags are intentionally lightweight cross-topic labels rather than a second taxonomy.

## Design principles

- Content first; no personal portfolio layer.
- Static by default; browser-native features only when they provide a clear benefit.
- Semantic HTML and accessible focus states.
- Responsive layouts with modern CSS, including container queries where useful.
- Progressive enhancement: newer CSS features enhance the experience but are not required for the content to work.
- Keep the publishing path understandable enough to maintain years from now.
