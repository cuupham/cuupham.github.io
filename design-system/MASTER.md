# U.U.C Design System — Master

**Status:** Source of Truth  
**Scope:** Website-wide visual language, with article-reading patterns defined below.  
**Style:** Editorial Technology / Swiss-inspired content-first interface.

## Design intent

U.U.C is a knowledge-oriented publishing space. The interface should feel like a carefully edited publication with the precision of a modern software product: strong typography, measured spacing, restrained color, clear metadata, and almost no decorative noise.

The article experience prioritizes reading over chrome. Large display type introduces the story; the reading column remains narrow enough to scan comfortably; utility metadata stays compact; accents are reserved for navigation, taxonomy, focus and progress states.

The existing U.U.C purple-to-blue-to-cyan identity remains available as a brand accent, but it is never used as a large background treatment. Ambient effects should be subtle and secondary to content hierarchy.

## Token architecture

All UI styling follows three layers:

```text
Primitive values
      ↓
Semantic purpose tokens
      ↓
Component tokens
```

**Rules:**

- Components must consume semantic or component variables.
- Raw color, spacing, typography, radius and shadow values belong in `assets/design-tokens.json` and its CSS output only.
- Do not introduce page-specific hex values in component styles.
- Theme-specific values are remapped in the semantic layer, not repeated in components.
- When a value needs changing, update the token source first; component CSS should not need a new raw value.

## Typography

| Role | Token | Intent |
|---|---|---|
| Display | `--font-display` | Headlines, navigation emphasis, numeric labels |
| Body | `--font-body` | Article prose and supporting UI copy |
| Mono | `--font-mono` | Code, technical metadata, machine-readable values |
| Display scale | `--article-title-size` | Responsive article headline |
| Reading size | `--type-body` | Long-form text |

Headlines use compact line-height and controlled tracking. Body text uses generous line-height. Long titles must wrap naturally; never force a single line at the expense of readability.

## Color

The primary canvas is warm off-white in light mode and near-black in dark mode. Text uses ink/secondary/faint semantic levels. The brand accent is indigo-violet with a cool cyan companion. Color is semantic, not decorative.

The brand gradient is restricted to small identity moments such as the reading-progress bar or a hairline accent. Do not use gradients for large cards, page backgrounds, or body-copy surfaces.

## Spacing

Use the 4/8-based spacing scale from `assets/design-tokens.json`. Prefer the semantic aliases for component layouts. Vertical rhythm should distinguish navigation, intro, body, subsection, and metadata levels rather than relying on arbitrary margins.

## Surfaces and borders

Cards and article headers use a quiet surface separation rather than heavy elevation. Borders are 1px hairlines using semantic border tokens. Shadows are soft and low contrast; content should still remain understandable with shadows disabled.

## Article pattern

### Header

- Back navigation is compact and clearly separate from the title.
- Content language is a small semantic badge.
- Title is the strongest element on the page.
- Dek/summary is restrained and readable.
- Date and tags form one compact metadata cluster.

### Reading column

- Maximum reading measure: `--reading-max`.
- Paragraphs use long-form line-height.
- Section headings have a clear spatial jump from preceding text.
- Links use the brand token and an underline, not ambiguous color-only affordances.
- Code, quote, figure and table treatments are consistent across articles.

### Article index

Rows use a stable grid: index → content → date → affordance. Hover and focus states must not change the surrounding layout. On narrow screens, the grid collapses to a single content column.

## Interaction

Motion is subtle and functional. Use the shared easing and duration tokens. Never animate layout dimensions, causing neighboring content to jump. Respect `prefers-reduced-motion`.

Keyboard focus must remain visible. Interactive areas should have a comfortable target even when the visual glyph is small.

## Responsive behavior

Primary review widths:

- 375px — small mobile
- 620px — mobile breakpoint
- 900px — tablet / compact desktop
- wide desktop — full reading layout

The article reading width must remain constrained on large screens. Do not stretch body paragraphs to full viewport width.

## Accessibility

- Maintain readable text contrast in both themes.
- Keep visible focus styles.
- Preserve semantic headings and landmarks.
- Use real links/buttons for interaction.
- Do not rely on color alone for state.
- Support reduced motion.

## Anti-patterns

- Hardcoded component colors, font sizes, radii or spacing.
- Giant decorative gradients behind reading content.
- Excessive glassmorphism or heavy shadows.
- Pills used as large containers.
- Decorative UI that competes with the article title.
- Layout-shifting hover effects.
- Duplicate token definitions across page stylesheets.

## Change protocol

1. Update or add the primitive value in `assets/design-tokens.json`.
2. Regenerate/update `assets/css/design-tokens.css` from the same source.
3. Reference semantic/component tokens from UI CSS.
4. Review all affected breakpoints and both themes.
5. Validate that component CSS contains no new raw design values.
