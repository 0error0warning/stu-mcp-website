# Phoenix artwork

These four original SVG files were supplied by the website owner on 2026-10-27. Their embedded provenance identifies Arrow by QuiverAI. No additional license is inferred.

The navbar uses `stu-mcp-phoenix-mascot-navbar-icon-artifact.svg`, as explicitly selected by the owner (not the `-two` alternative). The hero uses the supplied hero paths, rearranged into the existing wide stage. The other two files are retained as references.

Run `node scripts/build-phoenix-art.mjs` to regenerate the flattened navbar/favicon and day/night hero assets. Changes are limited to grouping, placement, restrained motion, mobile placement, and ring/platform colors. The phoenix silhouette and orange palette are preserved.

## Independent motion rig (2026-10-27)

The additional originals in `motion/` are owner-supplied pose/expression references, retaining their embedded Arrow / QuiverAI credit. The scene-action-loop file is a pose sheet, not executable animation. The disconnected-joint transforms from the rigged reference are not reused.

The generator also writes `src/phoenix-scene.svg`, inlined by Vite before first paint. The original continuous orange silhouette is split into overlapping torso, tail, crest and right-wing paths. Expression references are individually normalized to fixed eye and beak anchors. Behaviors and joint selectors live in `src/phoenix-behaviors.js`; movement is integrated by `src/phoenix-motion-engine.js` rather than replayed WAAPI clips.
