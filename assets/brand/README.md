# U.U.C Brand System

**U.U.C** means **Understand · Use · Create.**

## Brand core

- **Promise:** Understand deeply. Use wisely. Create freely.
- **Primary slogan:** Understand. Use. Create.
- **Short slogan:** Explore. Understand. Create.
- **Positioning:** An independent space for knowledge, ideas, technology, culture, and creation.
- **Personality:** Curious, clear, practical, thoughtful, creative, calm, independent.

## Asset architecture

```text
assets/brand/
├── README.md
├── brand.css
└── mark.svg
```

`mark.svg` is the canonical U.U.C symbol asset. The website composes the full lockup from `mark.svg` + HTML text rather than storing a duplicated wordmark SVG. This keeps the wordmark selectable, localizable, responsive, and easy to maintain.

The final logo geometry is intentionally kept independent from this brand-system update. The current mark remains a temporary asset until the new U.U.C logo is approved.

## Rules

1. `mark.svg` is the canonical symbol asset used by the website until the new U.U.C logo is approved.
2. Keep logo geometry inside the SVG; do not reproduce the mark with CSS or duplicate SVG wordmarks.
3. Keep layout, responsive behavior, and component styling outside the asset; those rules belong in `brand.css` and `assets/css/site.css`.
4. Use the HTML lockup (`mark.svg` + text) for the website header.
5. Use the mark alone for the favicon and compact/mobile identity where appropriate.
6. Do not add alternate logo variants unless a real platform requirement exists.
7. Keep brand tokens in `brand.css`; component styling belongs in `assets/css/site.css`.

## Accessibility

- Decorative header mark uses an empty `alt` because the adjacent wordmark provides the accessible name.
- Standalone logo links must expose the U.U.C name through an accessible label.
- Brand colors must meet the site's WCAG 2.2 AA contrast baseline before being used for text or controls.
