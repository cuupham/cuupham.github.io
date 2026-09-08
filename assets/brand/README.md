# C.U.U Brand System

**C.U.U** means **Curious. Useful. Universal.**

## Brand core

- **Promise:** Explore widely. Understand deeply. Share usefully.
- **Primary slogan:** Curious by nature. Useful by design. Universal by intent.
- **Short slogan:** Explore. Understand. Share.
- **Positioning:** An independent space for exploring ideas, technology, and culture.
- **Personality:** Curious, clear, useful, independent, open.

## Asset architecture

```text
assets/brand/
├── README.md
├── brand.css
└── mark.svg
```

The website composes the full lockup from `mark.svg` + HTML text rather than storing a duplicated wordmark SVG. This keeps the wordmark selectable, localizable, responsive, and easy to maintain.

## Rules

1. `mark.svg` is the canonical symbol asset and uses the approved C.U.U primary color because it is consumed as an external SVG image.
2. Keep layout, responsive behavior, and component styling outside the asset; those rules belong in `brand.css` and `assets/css/site.css`.
3. Use the HTML lockup for the website header.
4. Use the mark alone for the favicon and compact/mobile identity.
5. Do not add alternate logo variants unless a real platform requirement exists.
6. Keep brand tokens in `brand.css`; component styling belongs in `assets/css/site.css`.

## Accessibility

- Decorative header mark uses an empty `alt` because the adjacent wordmark provides the accessible name.
- Standalone logo links must expose the C.U.U name through an accessible label.
- Brand colors must meet the site's WCAG 2.2 AA contrast baseline before being used for text or controls.
