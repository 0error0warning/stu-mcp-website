# Product capabilities and Border Beam — 2026-10-26

The lifecycle surface now presents the three parallel capability groups supplied by the product-copy pass: courses and academic information, campus queries, and local tasks/preferences. `src/product-story.css` lays them out as three columns on desktop and three separated text blocks on mobile. The articles have transparent backgrounds and no nested card surfaces. `#lifecycle`, `#life-title`, and the original `#magic-border` mount remain intact. The `390px` title uses 26.13px type to keep the intended two lines without forcing `nowrap`.

The original MIT Magic UI Border Beam implementation is retained in `src/components/magicui/border-beam.tsx`, pinned to upstream commit `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`. The source notice and `licenses/Magic-UI-MIT.txt` remain. Its gradient and CSS offset-path technique are unchanged in principle; the product adapter now uses a Motion playback handle that can pause and resume the same phase. It loops every six seconds while visible. The 6500ms first-view greeting timer and finite repeat were removed.

The Border Beam directly listens for `visibilitychange` and `matchMedia('(prefers-reduced-motion: reduce)')` changes, in addition to the wrapper's viewport gate. Runtime reduced-motion changes therefore stop playback without depending on Motion's cached hook state. Pausing hides the light layer immediately, which avoids a stationary bright segment suggesting a frozen animation. Returning resumes the stored phase. The effect removes its media/document listeners and stops the playback handle on cleanup. CSS also hides the beam immediately under reduced motion.

The color pair is cool cyan `#8adce8` and pale purple `#c9b8f7`. The short gradient segment is 160px wide and the visible masked stroke is 2px. Its path uses the actual outer corner radius: 28px on desktop and 22px on mobile. No global theme rules or unrelated section layouts were changed in this pass.

## Local Chromium evidence

Used the independent `border-story` browser session at `http://127.0.0.1:5173/`. The actual `getComputedStyle(.mui-border-light).offsetDistance` and the frame's `data-playing`/opacity were sampled. These were production-duration checks, not a shortened animation.

| Condition | First offset | Later offset | Observed state |
| --- | --- | --- | --- |
| Visible, 0 / 7 / 14 / 15 seconds | 17.1167% / 34.0833% | 50.85% / 67.8% | Moving beyond two complete six-second loops |
| Offscreen, one second apart | 68.2% | 68.2% | Paused, opacity 0 |
| Returned to viewport | 74.75% | 91.55% | Resumed |
| Simulated document hidden, one second apart | 91.7333% | 91.7333% | Paused, opacity 0 |
| Foreground restored | 93.15% | 9.95% | Resumed and crossed loop boundary |
| Runtime reduced motion enabled | 13.35% | 13.35% | Paused, opacity 0 |
| Runtime reduced motion disabled | 13.3833% | 30.1333% | Resumed from the same phase |

The document-hidden test temporarily overrides the browser document's `hidden` property and dispatches the actual visibility event, then removes that override. It verifies the event handler and pause state; it is not claimed as an operating-system tab-switch test.

Four layout stages were inspected: 821×900 light/dark and 390×844 light/dark. All document widths equaled the viewport, every article had a transparent background, and the browser console contained no errors. The card widths were 757px / 350px respectively. Mobile text fit its 300px inner width, and the title occupied two lines. The scoped card-only 390px screenshot uses a taller 1100px capture viewport and temporarily hides the fixed header to capture the whole 797px surface; the regular 390×844 viewport stages preserve the header and are the basis of the overflow measurements. These screenshot-only adjustments are not production CSS.

Raw scripts, timing/coordinate JSON and screenshots are preserved under `output/playwright/border-story-*`. The parent task assembles final production screenshots under `docs/qa/`. This pass checks these card layouts and beam lifecycle behavior; general navigation, touch and installation-flow checks remain with the parent task.
