# Hero button alignment and dark footer check

Verified locally on 2026-10-26 at `http://127.0.0.1:5173/` in an independent Chromium Playwright session. No deployment or external write was performed.

## Change

- `src/hero-actions.css` centers each literal Chinese label on its button, with an independently positioned trailing arrow and matching text clearance on both sides. `src/reactdrops.jsx` supplies the same label/content/icon structure for the real Chromatic button and its still fallback. The secondary button uses matching spans in `index.html`.
- Button outer dimensions, font sizes, and light colors are preserved. Small vertical offsets compensate the measured Noto Serif SC glyph ink at 14px/13px/12px, rather than relying on line-box centering alone.
- `src/footer-night.css` applies only under `html[data-theme="dark"] .site-footer`. It replaces the inherited yellow accent surface with a navy surface and lilac controls; it retains the footer structure and supplies readable text, rules, doodle, links, hover, and focus states.

## Alignment evidence

Originally, the *group* of text and arrow was centered, while the primary literal label was 21.5px left of the button axis and the secondary literal label was 14px left. This was not a missing `text-align` declaration. Both literal labels now have a 0px horizontal DOM/Range center difference at 1440, 821, and 390px in both themes.

Canvas `actualBoundingBoxAscent`, `actualBoundingBoxDescent`, and horizontal ink bounds were measured with the computed font after `document.fonts.ready`. A zero-size inline baseline marker was measured inside each explicit label span. The final horizontal ink difference is 0.5px for the primary and 0px for the secondary; vertical ink difference is 0px at 1440/821 and about 0.006px/0px at 390. The initial anonymous-flex secondary baseline measurement was discarded and is not used for these conclusions.

| Viewport | Primary dimensions | Secondary dimensions | Text to arrow SVG box clearance | Horizontal overflow |
| --- | --- | --- | --- | --- |
| 1440 | 178 × 58 | 160 × 56 | 21px / 6px | none |
| 821 | 178 × 58 | 160 × 56 | 21px / 6px | none |
| 390 | 145 × 52 | 132 × 52 | 12.5px / 4px | none |

All text label rectangles stay inside their button bounds. The SVG paths have further viewBox clearance beyond the box gaps above. Light and dark geometry are identical.

## Dark footer contrast

Before the change, the heading and links inherited `#f4efdf` on the global accent `#f2d475`: 1.26:1. The new surface is `#20243d`.

| Role | Foreground / background | Contrast |
| --- | --- | --- |
| Main text, brand, links | `#f1effb` / `#20243d` | 13.38:1 |
| Small copy and eyebrow | `#c5c7de` / `#20243d` | 9.12:1 |
| CTA label | `#20243d` / `#d1cafa` | 9.80:1 |
| CTA arrow | `#e3dcff` / `#353b65` | 8.12:1 |
| CTA label on hover | `#20243d` / `#e2dcff` | 11.52:1 |
| CTA arrow on hover | `#f5efff` / `#444b79` | 7.39:1 |
| Divider on base | `#737da5` / `#20243d` | 3.77:1 |

As a conservative additional check, fully compositing the maximum glow and dot alpha onto the base produces approximately `#40486d`, even though their maxima occur in different regions. Against that brighter test color the main text is 7.81:1, small copy 5.33:1, and doodle 4.74:1. Text therefore retains at least normal-text 4.5:1 contrast under this conservative composite.

## Interaction and preservation

- Keyboard focus is visible on both hero actions. Tab moves from the primary to the secondary action. Footer CTA focus is visible with a 2px lilac ring and 5px offset.
- A separate 390 × 844 context with `hasTouch: true`, `isMobile: true`, and a confirmed coarse pointer used actual `locator.tap()`: primary navigated to `#install`, secondary to `#ideas`; the footer CTA received a tap. The external footer link's default navigation was prevented inside the test only.
- Reduced motion selects the still Hero button with zero Hero canvas elements. The dark footer pseudo-element has no animation. No horizontal overflow was found.
- Temporarily disabling only these two new stylesheets in light mode produced identical computed foreground/background/border colors, font sizes, and outer dimensions for all sampled Hero/Footer elements.
- The independent touch page recorded zero page errors; the desktop session console contains React development informational messages and no error entries for this check.

## Local evidence

Screenshots and raw measurements are retained under `output/playwright/` (ignored by Git):

- `hero-actions-before-1440.png`, `footer-night-before-1440.png`
- `hero-actions-after-{1440,821,390}-{light,dark}.png`
- `footer-after-{1440,821,390}-{light,dark}.png`
- `hero-actions-hover-1440-dark.png`, `hero-actions-focus-1440-dark.png`, `hero-actions-secondary-focus-1440-dark.png`
- `footer-hover-focus-1440-dark.png`, `footer-touch-390-dark.png`
- `hero-actions-reduced-1440-dark.png`, `footer-reduced-1440-dark.png`
- `hero-footer-final-metrics.json`, `hero-footer-final-interactions.json`
- `hero-footer-after-code.txt`, `hero-footer-interaction-code.txt` contain the actual browser measurement procedures.

This is a focused check of Hero actions and the footer. It does not claim a full-site accessibility audit or validation of external GitHub pages.
