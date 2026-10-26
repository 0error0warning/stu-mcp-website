# Implementation direction

## Current composition

Visual thesis: a warm illustrated paper workshop, with clear ink marks, a quiet
icon-only Dock and one surface per interaction. Preserve the cream/yellow hero,
original paper illustrations and lavender accents of the retained Side Quest
Adoption Center baseline.

Content: product poster → six real question prompts → source-to-Agent beams →
evidence → principles → repository activity → editable Agent installation Prompt
→ FAQ and source links.

Interaction thesis: a compact magnifying Dock with tooltips, smooth question
filtering, visible information pulses between stable node ports, and direct
Prompt editing/copying. The page does not run shell commands, authenticate an
account or answer a query on the visitor's behalf.

The original baseline remains unchanged in `reference/side-quest/index.html`.
Product baseline: stu-mcp v0.7.1 and 50 MCP tool registrations, verified from its
documentation and registration source on 2026-10-26. This does not claim that
every live business operation was exercised by the website's browser checks.

## Navigation and motion

The current Magic UI Dock follows the inspected icon-only MacOS-style demo:
40px icon containers expand with the upstream distance/transform/spring model,
while the Dock stays centered and fixed in height. Labels appear in tooltips on
hover or keyboard focus rather than occupying a permanent second text row.
The Dock is 54px high, or 50px on phones. At the reported 821px width the header
uses one 74px row; at 390px it uses a compact 108px two-row layout. Border, inset
and inner radii share a corner center. Light/dark mode uses the requested
circular View Transition, with a direct-switch fallback and local persistence.

Information beams now loop continuously while the network is visible. Their
colored band travels between actual measured ports instead of across the
entire SVG viewport, making short connections visible throughout the cycle.
The network uses smooth routes and separate hub input/output ports; the Agent
port is centered on its node surface. Offscreen, background and reduced-motion
states stop playback. Border Beam and selected Text Animate entrances remain
finite. Internal artwork can lift on hover without moving the wire ports.

Topographic Flow remains a static rendered frame. The hero Chromatic Button
uses a bright lavender/blue material with an optional shader brightness floor;
zero retains the original component material. Constrained devices use the
static alternative. Loaded gallery/shader instances persist across scrolling.
The original external collector SVG still handles its own small animation and
reduced-motion mode; the parent viewport controller does not pause that image
document.

## Installation semantics

The default and only on-page installation interaction is a single editable
Prompt surface. It follows the inspected public Wensity Liquid Multimodal Input
preview: a frosted surface, growing text area and lower action rail. Wensity's
component source is sign-in gated and was not directly transplanted. File upload,
model selection and a fake send/execute action are omitted. The real action
copies the full current text into the visitor's clipboard for Codex, Claude Code
or another Agent. The documented installation link remains available separately.

There is no outer installation card around the composer, no terminal chrome,
and no Agent/shell tab switch. The earlier Magic UI Terminal source is retained
for provenance but is not mounted or imported by this section.

## Activity and references

The page uses the actual MIT Arc Activity Heatmap from
`kuratlielia/arc-library`, pinned at
`fff39c044c6e3b86006e3a6acc9a32a821a80d99`. It shows 90 actual dates as 90 data
squares, in seven rows and currently fourteen week columns. Month/weekday labels,
a count summary and the component's tooltips preserve exact dates and counts.
The validated same-origin public GitHub endpoint and truthful snapshot fallback
remain unchanged; the chart does not relabel or fabricate activity frequency.

The source-to-Agent node surfaces and internal-artwork hover behavior adapt the
MIT UI Layouts reference at `88d827d7ec342917ca06f6894e5add65fabbe5d8`.
ReUI Statistics Card 2 informs visual hierarchy only; no component code or example
metrics are copied. Magic UI remains pinned at
`efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`. Exact provenance, adaptation scope
and licenses are in `THIRD_PARTY_NOTICES.md`.

The four feature symbols are SVG icons rather than font glyphs. Chinese UI text
uses a self-hosted Noto Sans SC subset containing 444 requested characters, with
font coverage, source URLs, hashes and OFL notices retained. The original paper
smile explicitly has no fill to avoid an unintended closed black shape.

## Retained optional physics and historical evidence

Hero characters remain disabled on a fresh page. The inactive controller mounts
no physics canvas, measurement observers or still pile, and does not import the
engine. A future button can call `setHeroCharactersEnabled` from
`src/hero-characters.js`; no public toggle is present. The retained enabled scene
uses the real visible ellipse as curved collision ground, fewer/larger bodies,
60% gaze following and the same paused world after scrolling or backgrounding.

Earlier stages included two physics lanes, automatic falling, a number-cell
30/90-day calendar, a natural-language Prompt inside terminal chrome and finite
information beams. Those layouts and behaviors are superseded. Their QA records,
measurements and screenshots are preserved as historical evidence, not claims
about the current page. `docs/qa.md` indexes the stages; the current round's
verification and screenshots are in [the reference refinement record](reference-refinement-2026-10-26.md).
Development remains local, the repository private, and no site
has been deployed.
