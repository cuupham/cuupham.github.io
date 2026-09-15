# U.U.C Design System — Master

**Status:** Design-system governance / human-readable specification  
**Token SSOT:** `assets/design-tokens.json`  
**Generated token output:** `assets/css/design-tokens.css`  
**Style:** Editorial Technology / Swiss-inspired content-first interface.

## Design intent

U.U.C is a knowledge-oriented publishing space. The interface should feel like a carefully edited publication with the precision of a modern software product: strong typography, measured spacing, restrained color, clear metadata, and almost no decorative noise.

The article experience prioritizes reading over chrome. Large display type introduces the story; the reading column remains narrow enough to scan comfortably; utility metadata stays compact; accents are reserved for navigation, taxonomy, focus and progress states.

The existing U.U.C purple-to-blue-to-cyan identity remains available as a brand accent, but it is never used as a large background treatment. Ambient effects should be subtle and secondary to content hierarchy.

## SSOT and token architecture

The machine-readable token source is `assets/design-tokens.json`. `assets/css/design-tokens.css` is a generated/derived CSS artifact and must not become an independent source of truth. `MASTER.md` documents the governance and visual rules; it does not own duplicated token values.

All UI styling follows three layers:

```text
Primitive values
      ↓
Semantic purpose tokens
      ↓
Component tokens
```

**Rules:**

- Components consume semantic or component variables.
- Raw color, spacing, typography, radius, motion, shadow and opacity values are defined in the token source.
- Do not introduce page-specific design literals in component CSS.
- Theme-specific values are remapped through the token layer.
- When a design value changes, update `assets/design-tokens.json` first, then refresh the CSS output.
- Never edit a generated token output to introduce a value that does not exist in the source token file.

## Typography

| Role | Token | Intent |
|---|---|---|
| Display | `--font-display` | Headlines and display UI |
| Body | `--font-body` | Article prose and supporting UI copy |
| Mono | `--font-mono` | Code and technical metadata |
| Display scale | `--article-title-size` | Responsive article headline |
| Reading size | `--type-body` | Long-form text |
| Weight | `--weight-*` | Shared hierarchy rather than per-component literals |
| Leading | `--leading-*` | Shared line-height rhythm |

Headlines use compact line-height and controlled tracking. Body text uses generous line-height. Long titles must wrap naturally; never force a single line at the expense of readability.

## Color

The primary canvas is warm off-white in light mode and near-black in dark mode. Text uses primary/secondary/tertiary semantic levels. The brand accent is indigo-violet with a cool cyan companion. Color is semantic, not decorative.

The brand gradient is restricted to small identity moments such as the reading-progress bar or a hairline accent. Do not use gradients for large cards, page backgrounds, or body-copy surfaces.

## Spacing

Use the 4px base spacing scale from `assets/design-tokens.json`. Prefer semantic aliases for component layouts. Vertical rhythm should distinguish navigation, intro, body, subsection and metadata levels rather than relying on arbitrary margins.

## Surfaces and borders

Cards and article headers use quiet surface separation rather than heavy elevation. Borders are hairlines using semantic border tokens. Shadows are soft and low contrast; content must remain understandable with shadows disabled.

## Article pattern

### Header

- Back navigation is compact and clearly separate from the title.
- Content language is a small semantic badge.
- Title is the strongest element on the page.
- Dek/summary is restrained and readable.
- Date and tags form one compact metadata cluster.

### Reading column

- Maximum reading measure is controlled by `--reading-max`.
- Paragraphs use long-form line-height.
- Section headings create a clear spatial jump from preceding text.
- Links use the brand token and an underline, not ambiguous color-only affordances.
- Code, quote, figure and table treatments are consistent across articles.

### Article index

Rows use a stable grid: index → content → date → affordance. Hover and focus states must not change surrounding layout. On narrow screens, the grid collapses to a single content column.

## Interaction

Motion is subtle and functional. Use the shared easing and duration tokens. Never animate layout dimensions in a way that causes neighboring content to jump. Respect `prefers-reduced-motion`, including disabling scroll-driven reading progress when motion is reduced.

Keyboard focus must remain visible. Interactive areas should have a comfortable target even when the visual glyph is small.

## Responsive behavior

Primary review widths:

- 375px — small mobile reference
- 620px — mobile breakpoint
- 900px — tablet / compact desktop breakpoint
- wide desktop — full article frame with constrained reading measure

Viewport thresholds are structural CSS syntax constraints, not component design tokens, and are documented here to keep them consistent.

## Accessibility

- Maintain readable text contrast in both themes.
- Keep visible focus styles.
- Preserve semantic headings and landmarks.
- Use real links/buttons for interaction.
- Do not rely on color alone for state.
- Support reduced motion.

## Content integrity

Topic indexes, the article index and archive must reference the same canonical article URLs. Existing articles are preserved when new batches are added. Do not replace an index wholesale in a way that silently drops previously published content.

Avoid duplicate articles that cover the same canonical subject. Prefer one canonical URL and link to it from all relevant indexes/topics.

## Anti-patterns

- Hardcoded component colors, font sizes, radii, spacing, opacity or motion values.
- Duplicate token definitions across page stylesheets.
- Giant decorative gradients behind reading content.
- Excessive glassmorphism or heavy shadows.
- Pills used as large containers.
- Decorative UI that competes with the article title.
- Layout-shifting hover effects.
- Index updates that overwrite previously published entries.

## Change protocol

1. Update or add the token in `assets/design-tokens.json`.
2. Regenerate or synchronize `assets/css/design-tokens.css` from that source.
3. Reference semantic/component tokens from UI CSS.
4. Review affected breakpoints, light/dark/system themes and reduced-motion behavior.
5. Validate token references and canonical article URLs.
6. Review the final diff before merge.
