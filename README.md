# CPM

Personal portfolio and publishing site built with Astro, TypeScript, and Markdown/MDX.
Vietnamese and English interfaces share the same content; articles retain their original language.

**Website:** [cuupham.github.io](https://cuupham.github.io/)

## Requirements

- Node.js: version specified in [.node-version](.node-version).
- npm 11.

## Development

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run verify
```

Runs content validation, type checking, unit tests, artifact tests, and the production build.
Use `npm run preview` to inspect the build output.

## Content

Add articles to `src/content/posts/<id>.md` or `.mdx` using the [post template](content-templates/post.md).
Store published media in `src/assets/`. Unpublished drafts remain local.

## Deployment

GitHub Actions builds and deploys to GitHub Pages. Releases require an accepted `main` commit
and approval of the exact build artifact. See the [release guide](docs/publishing-and-rollback.md).

## Documentation

- [Product requirements](docs/prd.md)
- [Content and routing contract](docs/cpm-v1-technical-contract.md)
