# Third-party notices

## Side Quest Adoption Center

The design baseline is Side Quest Adoption Center Page by INSTALANDING.AI,
used under the MIT license. The original HTML attribution is retained.

- Source: https://github.com/RayVelez27/instalanding.ai/tree/main/pages/side-quest-adoption-center-page
- License: see the retained baseline and `licenses/Side-Quest-MIT.txt` when supplied.

## ReactDrops

Source distributions for five genuine ReactDrops components are retained in
this finished STU-MCP product website. The current page mounts Topographic Flow,
Fan Gallery, the hero Chromatic Button and the installation send-shaped Chromatic Button. Shape Physics is opt-in; the Liquid
Glass Orb and former installation-button island are not mounted. These files are **not MIT-licensed** and are
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
  as a static rendered background; the hero Chromatic Button animates only
  during interaction, and constrained devices use a static alternative.
  Loaded gallery and shader islands remain mounted across viewport and
  background changes to avoid reinitialization. These are wrapper adaptations;
  the original Liquid Glass Orb source is retained but no longer mounted.
  The latest button adaptation adds an optional `brightnessFloor` uniform to
  `chromatic-shaders.ts`, `chromatic-surface.tsx`, and `chromatic-button.tsx`.
  Its default of zero preserves the upstream material; the hero button uses
  a light lavender/blue palette and a nonzero floor to avoid black reflections.
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

## Magic UI and Lucide

Six Magic UI components are adapted from official registry sources at commit
`efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`:
Dock, Animated Beam, Terminal, Border Beam, Animated Theme Toggler, and Text Animate.
Source paths and revision are recorded in `src/components/magicui/source.json`.
The MIT license is retained in `licenses/Magic-UI-MIT.txt` and source notices.

- Source: https://github.com/magicuidesign/magicui/tree/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui
- Adaptations: ordinary scoped CSS in place of Tailwind classes, an icon-only
  fixed-height centered Dock with tooltips, original distance/spring container
  magnification, and concentric corner geometry. Theme persistence uses circular
  View Transitions with reduced-motion support. Information beams continuously
  sweep the real measured endpoint range while visible, and stop offscreen,
  in the background or for reduced motion. The capability card Border Beam now
  loops while visible, hides its light when paused and resumes its phase;
  text entrances stay finite.
- Terminal source remains for the historical integration but is no longer
  imported or mounted by the current installation section. The page now presents
  an editable Prompt composer and copies its current text to the user's Agent;
  no natural-language Prompt is displayed as a shell session.
- Lucide React icons are distributed under the ISC license; see
  `licenses/Lucide-ISC.txt` and https://github.com/lucide-icons/lucide.
- Motion and its dependencies retain their MIT license in package distributions.

## Arc Activity Heatmap

The activity chart uses the actual Arc Activity Heatmap component by Elia Kuratli,
distributed under the MIT license. Its source, motion tokens, CSS, full license
and provenance are retained in `src/components/community/arc-activity/`.

- Source: https://github.com/kuratlielia/arc-library/tree/fff39c044c6e3b86006e3a6acc9a32a821a80d99
- Pinned commit: `fff39c044c6e3b86006e3a6acc9a32a821a80d99`.
- Referenced preview: https://21st.dev/@kuratlielia/components/activity-heatmap.
- Registry URL and SHA-256 are recorded in that directory's `source.json`.
- Adaptations: Chinese labels, product color tokens, and a 90-day range supplied
  by the existing validated public-repository endpoint. The component retains
  its real calendar grid, reveal wave, tooltip, legend, selection and keyboard
  behavior. No upstream sample contribution data is used.
- ContribKit (https://contribkit.app/?user=torvalds) was inspected as a visual
  reference for a compact contribution heatmap; its code and Torvalds' data are
  not included in this product.

## Additional visual references and adaptations

UI Layouts' Hover Cards were inspected and their scoped internal-artwork hover
behavior adapted for the source-to-Agent nodes. The source is MIT-licensed:
https://github.com/ui-layouts/uilayouts/tree/88d827d7ec342917ca06f6894e5add65fabbe5d8.
The full notice is retained in `licenses/UI-Layouts-MIT.txt`. The product keeps
one node surface with internal artwork movement; its measured wire ports do not
move with that artwork.

The ReUI Statistics Card 2 preview at
https://21st.dev/@sean0205/components/statistics-card-2 informed the flat surface,
caption/title/divider hierarchy. No ReUI component code, sample metrics or
demonstration data was copied.

Wensity Labs' Liquid Multimodal Input at
https://21st.dev/@wensity/components/liquid-multimodal-input is listed under the
MIT license. In the subsequent input revision, the owner supplied its complete
source directly. `src/components/liquid-agent-input.jsx` now adapts that source's
surface/noise/inner-edge/textarea/toolbar/portal-menu structure, using the existing
Motion and Lucide dependencies with scoped CSS. Its provenance and changes are in
`src/components/liquid-agent-input.source.json`; attribution and MIT terms are in
`licenses/Wensity-Liquid-Multimodal-Input-MIT.txt`. The earlier preview-only
implementation is superseded. The input copies an edited Prompt with Agent/model
preferences through a genuine ReactDrops send-shaped Chromatic Button; it makes
no chat or model request. Attachment controls are omitted because the destination
is a text clipboard. UI Factory's https://uithefactory.com/ai-mascot-input was
inspected only for the populated-input mascot position and motion; no UI Factory
source is included or relicensed.

The 16 local brand SVGs in `public/brands/agents/` come unchanged from Lobe Icons,
MIT, Copyright (c) 2023 LobeHub, pinned at
`8b7bbc433d38437fa2b0cca58ae896917162b812`. The full license is retained in
`licenses/Lobe-Icons-MIT.txt` and the public `/brands/LICENSE-Lobe-Icons.txt`.
`public/brands/source.json` records exact asset URLs, hashes and verification
sources. Brand names and logos belong to their respective owners; the code/icon
license does not transfer trademark rights or imply endorsement. Model names
were checked against their providers' official public documentation, as recorded
in `docs/agent-catalog-2026-10-26.md`; no account-specific availability is claimed.

Reference inspection, the final local verification scope and current screenshots
are recorded in [the reference refinement record](docs/reference-refinement-2026-10-26.md).

## React Bits Gradient ASCII

The night-only hero background incorporates the genuine Gradient ASCII component
from David Haz's React Bits, pinned at
`e12c22192ac7b4b452c5e2feb9b586d74765d696`:
https://github.com/DavidHDev/react-bits/tree/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/content/Backgrounds/GradientASCII.
The actual preview at https://www.reactbits.dev/backgrounds/gradient-ascii was
inspected. Its code uses **MIT + Commons Clause**, not plain MIT; the full terms
and copyright are retained in `licenses/React-Bits-LICENSE.md` and the source
notice. Provenance and the upstream source hash are in
`src/components/reactbits/source.json`.

Local component changes add pause/draw-rate control, a ready marker, context-loss
stop and early pointer-event gating. The product wrapper uses a cool palette,
DPR 1, a maximum 24 draw frames per second and no halo passes. It lazy-loads only
for an active desktop night hero, stops offscreen/hidden/in light mode, and uses
a static character field on mobile, reduced motion and unsupported WebGL. This
is part of the finished private website, not a component library or template.

`public/art/hero-collector-night.svg` is a palette-only variant of the project's
original hero illustration, preserving its geometry and motion. The light
illustration is unchanged; the theme chooses which image is displayed.

## Self-hosted fonts

Gloock regular (Latin), Schibsted Grotesk variable 400–700 (Latin), and
Noto Serif SC / Noto Sans SC variable 400–700 UI subsets are served locally
from `public/fonts/`. They are distributed under the SIL Open Font License 1.1, retained in
`licenses/font-gloock-OFL.txt`, `licenses/font-schibstedgrotesk-OFL.txt`, and
`licenses/font-notoserifsc-OFL.txt`. Both Chinese subsets are supplied by
Google Fonts' official `text=` API. They are page-specific subsets, not full
Chinese font files; arbitrary user-entered characters outside the subsets may
use configured fallbacks. All faces use `font-display: swap`. The former static
Serif heading asset is retained as inactive historical evidence.

The Chinese interface additionally uses a self-hosted Noto Sans SC variable
subset (CSS weights 400–700). Its OFL is in `licenses/font-notosanssc-OFL.txt`.
The 481 requested UI characters, actual coverage, axes, source URLs and SHA-256
are appended to `public/fonts/sources.json`. `scripts/update-ui-fonts.py`
rebuilds both subsets from explicitly listed product UI files. The same OFL
Schibsted/Noto outlines supply nine text groups in the external gallery SVGs;
their other illustration geometry is unchanged. Full actual-font verification
is recorded in `docs/font-audit-2026-10-26.md`.

Fonts were retrieved from the official Google Fonts CSS API and its returned
`fonts.gstatic.com` URLs. Exact source URLs, subset characters, SHA-256 hashes,
byte sizes, and download timestamp are recorded in
`public/fonts/sources.json`. The license copies come from the official
[Google Fonts repository](https://github.com/google/fonts).

## Owner-supplied Phoenix artwork (2026-10-27)

The four original SVG files in `reference/phoenix/` were provided by the owner.
Their embedded credit is “SVG created with Arrow, by QuiverAI (https://quiver.ai)”.
The selected navbar icon and hero illustration are used with layout adaptations;
no additional license is inferred. See `reference/phoenix/README.md` for exact
source filenames, scope and regeneration instructions.
