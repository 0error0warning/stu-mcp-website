# Third-party notices

## Side Quest Adoption Center

The design baseline is Side Quest Adoption Center Page by INSTALANDING.AI,
used under the MIT license. The original HTML attribution is retained.

- Source: https://github.com/RayVelez27/instalanding.ai/tree/main/pages/side-quest-adoption-center-page
- License: see the retained baseline and `licenses/Side-Quest-MIT.txt` when supplied.

## ReactDrops

Five genuine ReactDrops components are integrated as React islands in this
finished STU-MCP product website. These files are **not MIT-licensed** and are
not offered here as a reusable component library, starter, or website template.

- Upstream: https://github.com/crisjavr/reactdrops
- Pinned commit: `b3924b92ebfce15152cf6f04ad85301c9f343672` (2026-10-25)
- License: ReactDrops Component License 1.0, Copyright (c) 2026 ReactDrops.
- Full terms: `licenses/ReactDrops-LICENSE.txt` and the notices retained in each source file.
- Components: Topographic Flow, Shape Physics, Fan Gallery, Liquid Glass Orb,
  and Chromatic Button.
- Imported files: the official `registry/*.json` source distributions for those
  five components, extracted into `src/components/reactdrops/`. Import paths
  are exactly those provided by the upstream registry.
- Local patches to upstream source: `solid-engine.ts`
  explicitly clears each dirty rectangle before transparent or translucent
  repainting and retains 2–3x render density with high-quality sprite smoothing;
  `chromatic-surface.tsx` refreshes its pixel buffer on window resize
  so changes in display density do not leave an outdated resolution.
  `shape-settings.ts` and `solid-world.ts` add an optional ellipse ground to the
  real contact solver, with slope normals, low ground friction and resting piles.
  The engine uses full-width top emission for that ground, seeded per-page
  variation and eye-only dirty repainting. Upstream
  CSS is unchanged. Product adaptations live in
  `src/reactdrops.jsx` and `src/reactdrops.css`: warm palettes, limited geometry
  counts, lower motion speeds, three original SVG gallery images, viewport and
  document-visibility gating, lazy loading, static reduced-motion fallbacks,
  full-hero physics measured from the visible CSS ellipse, an all-selection-state
  gallery fit, 60% mouse gaze following and a responsive population of 4 / 6 /
  up to 10 larger characters. Physics stays mounted while offscreen or hidden;
  those transitions pause and resume the same world rather than replaying it.
  Shape Physics is now disabled by default and is neither mounted nor imported
  until explicitly enabled by the product controller. Topographic Flow is used
  as a static rendered background, and Orb / Chromatic Button animate only
  during interaction; constrained devices use the product's static alternatives.
  Loaded gallery and shader islands remain mounted across viewport and
  background changes to avoid reinitialization. These are wrapper adaptations;
  no additional upstream renderer source was modified for this revision.
- No upstream demonstration photographs, videos, fonts, or logos are reused.
- No visible ReactDrops credit is required by the component license; its
  source and third-party notices must remain with permitted source copies.

The Liquid Glass Orb shader includes psrdnoise by Stefan Gustavson and Ian
McEwan under the MIT license. Its full license is retained inside
`src/components/reactdrops/liquid-glass-orb.tsx`.

GSAP, React, React DOM, Vite, and their dependencies retain their respective
licenses in the installed package distributions. The MIT license for STU-MCP
itself describes that separate tool; it does not relicense this website's
third-party code.

## Original artwork

`public/art/gallery-1.svg`, `gallery-2.svg`, and `gallery-3.svg` were drawn for
this website. They do not reuse official emblems, promotional photographs, or
ReactDrops demo media.

## Self-hosted fonts

Gloock regular (Latin), Schibsted Grotesk variable 400–700 (Latin), and a
Noto Serif SC regular subset are served locally from `public/fonts/`.
All three are distributed under the SIL Open Font License 1.1, retained in
`licenses/font-gloock-OFL.txt`, `licenses/font-schibstedgrotesk-OFL.txt`, and
`licenses/font-notoserifsc-OFL.txt`. The Noto Serif SC subset was supplied by
Google Fonts' official `text=` API and covers the Chinese characters and
full-width punctuation in the current HTML headings, FAQ summaries and six
dynamic scenario titles. It is not a full Chinese font; other characters use
the system fallback. All faces use `font-display: swap`.

Fonts were retrieved from the official Google Fonts CSS API and its returned
`fonts.gstatic.com` URLs. Exact source URLs, subset characters, SHA-256 hashes,
byte sizes, and download timestamp are recorded in
`public/fonts/sources.json`. The license copies come from the official
[Google Fonts repository](https://github.com/google/fonts).
