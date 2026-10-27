# Hero illustration refinement

## Source and scope

This is a direct edit of the existing, project-native `public/art/hero-collector.svg`, based on the owner's annotated hero screenshot and the retained visual language in `reference/side-quest/index.html`. No stock image, generated bitmap, new component library, or external artwork was introduced. The existing paper character, connector ring, open stage and surrounding information sources remain the composition.

Visual direction: warm paper layers, soft lilac and mint, restrained ink outlines, and a more deliberate hierarchy between the main character and small supporting objects. The scene keeps its light bobbing, occasional wave and moving connection dashes. There is no new JavaScript animation loop or WebGL surface.

## Changes

- Refined the character's paper edges, fold, highlights, smile, hands, shoes and small source seal. Separated main outlines from fine internal details.
- Added a consistent bevel, engraved edge and restrained highlights to the connector ring. Reduced the visual weight of the stage base.
- Reworked the surrounding document, envelope and discussion bubble to share the same paper material. Replaced the indistinct paper stack with a calendar so courses and assignments have a distinct visual cue.
- Simplified the connection curves. Preserved SVG-native motion and its reduced-motion fallback.
- Gave the night variant a coherent blue, lavender and cool mint palette. Both files now share geometry and palette definitions: edit the light SVG, then run `node scripts/sync-hero-art.mjs` to update the night asset.
- On narrow image viewports, move the side characters inward and shorten their routes rather than shrinking the central character. Move the narrow-screen Agent label above the bubble so it does not cover the calendar. Raise the desktop source label clear of the document tab.
- Fixed an existing dark-mode mobile layout conflict: the night image overrode the shared 165% mobile width with 100% while retaining its negative margin. Both variants now use the same responsive width and offset, keeping the composition aligned across theme changes.
- Both visible theme variants now have descriptive alternative text; only the displayed image enters the accessibility tree.

## Verification

Verified against the local Vite site at `http://127.0.0.1:5173/` using an isolated Chrome session via Playwright CLI. This is a focused hero-art check, not a full-site accessibility or performance audit.

- At 1440, 663 (the owner's annotated width), and 390 CSS pixels, checked both themes, successful SVG decoding and a single displayed image. No horizontal document overflow was found.
- After fixing the night-image override, both themes measure 1200×300, 1093.9375×212 and 643.5×212 respectively at those widths. The image center differs from the stage center by 0px in all six cases; the full-width image boxes intentionally extend beyond narrow screens while the responsive SVG keeps its subjects inside the visible area.
- Visually inspected the six stage captures, with particular attention to the 390px layout. Source document, discussion bubble and calendar remain inside the phone composition; the broad ground intentionally extends to the screen edges.
- Keyboard: Tab from the primary hero action reaches the secondary action; Enter on “试着接入” reaches the installation section. The illustration adds no focusable elements.
- Touch: an independent 390×844 mobile context with `hasTouch: true` used `tap()` on the installation action and theme toggle. Installation navigation and the dark illustration both worked, with no overflow.
- Both standalone SVG assets report five running, repeating CSS animations with normal motion, and `animation-name: none` on all five animated groups under reduced motion. The stage captures use reduced motion for repeatable visual inspection.
- No page errors or console errors were recorded in the isolated Chrome session. Motion's expected development warning about the emulated reduced-motion preference was present.
- SVG XML parsing and `npm run build` passed. Light/night geometry was synchronized after the final decorative change.

No deployment was performed. The existing physics scene remains off.

## Evidence

Tracked screenshots in `docs/qa/`:

- `hero-refined-before-1440.png`
- `hero-refined-{1440,663,390}-{light,dark}.png`
- `hero-refined-context-{light,dark}.png`

The local verification procedure is retained in the ignored `output/playwright/hero-refined-check.js`. The before image and intermediate captures are also retained in `output/playwright/`.
