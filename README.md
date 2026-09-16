# U.U.C — Understand. Use. Create.

The source repository for [cuupham.github.io](https://cuupham.github.io), an independent publishing space for exploring ideas, technology, culture, games, comics, novels, music, and things worth sharing.

> **Understand. Use. Create.**

## About

U.U.C is built around a simple progression: explore questions, understand them deeply, put that understanding into practice, and create something meaningful from it.

The site is intentionally content-first. It is not a portfolio template or a product landing page. The interface stays quiet so the content can remain the focus, while the design system provides a consistent editorial experience across articles, topics, tags, and supporting pages.

## Highlights

- **Bilingual** — English and Vietnamese.
- **Three theme modes** — Light, Dark, and System.
- **Editorial-first UI** — designed for reading, browsing, and discovery.
- **Responsive by default** — works across desktop and mobile layouts.
- **Accessible foundation** — semantic HTML, keyboard-friendly interactions, visible focus states, and reduced-motion support.
- **Progressive enhancement** — modern browser features enhance the experience without making the content dependent on a framework runtime.
- **Static publishing** — source content is validated and built into deployable HTML before GitHub Pages deployment.

## Brand

The site identity is **U.U.C**:

- **Understand** — explore, question, learn, and build a clear mental model.
- **Use** — turn understanding into practice, judgment, and useful action.
- **Create** — make, write, build, experiment, and contribute something new.

The core philosophy is:

> **Explore → Understand → Use → Create**

The brand voice is clear, curious, technical, practical, thoughtful, creative, calm, and independent. The visual identity follows the same principle: distinctive enough to have character, restrained enough to keep attention on the content.

## Design

The visual direction combines **editorial design, ambient color, and soft depth**.

The design system favors:

- strong typography and editorial hierarchy;
- restrained gradients and atmospheric surfaces;
- glass effects only where they improve navigation or context;
- semantic design tokens as the visual source of truth;
- responsive and accessible interaction states;
- minimal visual noise and unnecessary decoration.

Brand identity and site-wide visual tokens are kept separate from page content so the publishing layer can evolve without rewriting the design language.

## Content model

Content is organized around a small number of concepts:

- **Articles** — long-form writing and individual pieces.
- **Topics** — broad areas of interest such as technology, programming, AI, games, music, manga, and novels.
- **Tags** — lightweight cross-topic labels for discovery.
- **Archive** — chronological access to published work.

Migrated articles now separate editorial content from page presentation:

```text
content/articles/<slug>/
├── article.json   # metadata and taxonomy
└── content.html   # semantic article body
```

The article shell is rendered from shared templates during the build. Site-wide styling remains under `assets/`. All existing articles are migrated through the same source model; generated HTML is build output rather than source content.

## Publishing

The repository uses a lightweight, dependency-free Python build step. `scripts/validate_content.py` validates article sources, then `scripts/build.py` produces a static `_site/` directory. GitHub Actions deploys that generated site to GitHub Pages.

Run locally:

```bash
python scripts/validate_content.py
python scripts/build.py
```

New articles are added under `content/articles/<slug>/` and are rendered into the existing `/articles/<slug>/` URL during the build.

For contributors and future maintenance, the priority is to keep the publishing process understandable, the markup semantic, and the visual system centralized rather than duplicated across pages.

## Philosophy

> **Understand deeply. Use wisely. Create freely.**

U.U.C is a small independent space for learning, making sense of things, applying what is useful, and creating what is worth keeping.
