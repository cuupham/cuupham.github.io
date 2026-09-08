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

GitHub Pages can publish static HTML, CSS and JavaScript directly from a repository. This site uses only the HTML/CSS path so the repository itself is the published site.

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
├── assets/
│   ├── css/site.css
│   └── favicon.svg
├── about.html
├── 404.html
├── robots.txt
├── sitemap.xml
└── .nojekyll
```

## Publishing a new article

1. Create `articles/<slug>/index.html`.
2. Add the article to `articles/index.html`.
3. Add it to its relevant topic page.
4. Add the URL to `sitemap.xml`.
5. Commit and push to `main`.

There is no build command.

## Adding a new topic

Create `topics/<slug>/index.html`, then add the topic card to `index.html` and `topics/index.html`. The visual system is shared through `assets/css/site.css`, so the topic page only needs semantic HTML.

## Design principles

- Content first; no personal portfolio layer.
- Static by default; browser-native features only when they provide a clear benefit.
- Semantic HTML and accessible focus states.
- Responsive layouts with modern CSS, including container queries where useful.
- Progressive enhancement: newer CSS features enhance the experience but are not required for the content to work.
- Keep the publishing path understandable enough to maintain years from now.
