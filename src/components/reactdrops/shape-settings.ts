/*!
ReactDrops Component License 1.0

Copyright (c) 2026 ReactDrops

1. Scope and definitions

This license applies to ReactDrops software and associated documentation that
expressly carry this license or are distributed under a LICENSE file containing
it (the "Software"). "Licensor" means the copyright holder granting rights in
the Software, and only to the extent that holder has authority to grant them.
"You" means the individual or entity exercising these rights.

An "End Product" is a website, application, service, or other finished project
whose primary purpose is something other than providing reusable components,
source code, templates, or development assets to others.

2. Permitted uses

Subject to this license, Licensor grants You a worldwide, non-exclusive,
royalty-free license to use, copy, modify, and incorporate the Software into
unlimited personal, internal, and commercial End Products. You may charge for
End Products, subscriptions, development services, and work for clients.

You may distribute the Software as an integrated part of an End Product,
including in browser-delivered JavaScript. You may provide End Product source
code to a client, and share the Software with employees and contractors who
need it to develop or maintain End Products. Those recipients may use the
Software for those purposes subject to this license. This permission does not
authorize them to redistribute the Software as a reusable development asset.

3. Restricted redistribution

Unless You obtain separate written permission from Licensor, You may not sell,
sublicense, publish, share, or otherwise redistribute the Software, or a
substantial portion of it, whether unchanged or modified:

(a) as a standalone component, component library, UI kit, source-code bundle,
    registry, or other collection of reusable development assets;
(b) as part of a theme, template, starter project, or similar product offered
    to multiple recipients for reuse in their own projects; or
(c) through a builder or generation service that offers the Software as
    reusable blocks or source-code exports for others' projects.

These restrictions apply to paid and free redistribution. Renaming, restyling,
repackaging, translating, or modifying the Software does not remove them.
Building separate finished websites or applications for multiple clients is
permitted; offering a reusable template or kit containing the Software is not.

Public source-code hosting by Licensor is not permission to republish the
Software under another license. This license does not override any separate
rights granted directly by Licensor or applicable code-hosting terms.

4. Notices and ownership

Retain this license and applicable copyright and third-party notices in source
copies of the Software and permitted source distributions. No visible credit
or ReactDrops logo is required in an End Product's user interface.

Licensor retains ownership of its Software. You retain rights in Your own
contributions, subject to the license for any incorporated Software. No rights
to trademarks, trade names, or logos are granted by this license.

5. Third-party materials and separate grants

Dependencies, fonts, images, videos, and other third-party materials remain
subject to their respective licenses. Separately identified third-party code
is licensed under its stated terms, and these restrictions do not limit rights
granted by its copyright holders. Retain all required third-party notices.
Demo media are not licensed by this document; obtain Your own permission or
replace them with media You are entitled to use.

This license does not revoke rights granted under other valid licenses. It does
not assert ownership of third-party work or grant rights Licensor lacks.

6. Termination

The permissions granted here continue unless terminated for a material breach.
If You fail to cure a material breach within 30 days after receiving written
notice from Licensor, Your permissions terminate. On termination, cease uses
and distributions requiring this license. Rights under independently granted
licenses and rights that applicable law does not allow to be restricted remain
unaffected. Sections 3 through 7 survive termination.

7. Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. TO THE MAXIMUM EXTENT
PERMITTED BY APPLICABLE LAW, LICENSOR AND CONTRIBUTORS SHALL NOT BE LIABLE FOR
ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT, OR OTHERWISE,
ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR ITS USE.

This license does not limit rights or exceptions that applicable law makes
non-waivable. No other permissions are granted by implication.
*/

import { solidKinds, solidPalette, type SolidKind } from './solid-shapes';

/** Real 3D tumbling volumes, or the same figures kept flat. */
export type ShapeDepth = '3d' | '2d';
/** Kept for compatibility: every value renders the projected solids. */
export type ShapeVariant = 'solids';
export type ShapeKind = 'mixed' | SolidKind;

export type ShapeSettings = {
  /** @deprecated Ignored; Shape Physics always renders projected solids. */
  variant: ShapeVariant;
  shape: ShapeKind;
  depth: ShapeDepth;
  faces: boolean;
  faceColor: string;
  followCursor: boolean;
  cursorFollowRatio: number;
  count: number;
  size: number;
  sizeVariation: number;
  spawnRate: number;
  appearanceDuration: number;
  gravity: number;
  wind: number;
  restitution: number;
  friction: number;
  damping: number;
  spin: number;
  seed: number;
  paused: boolean;
  interactive: boolean;
  colors: readonly string[];
  background: string;
};

export const shapeDefaults: ShapeSettings = {
  variant: 'solids',
  shape: 'mixed',
  depth: '3d',
  faces: true,
  faceColor: '#ffffff',
  followCursor: true,
  cursorFollowRatio: 0.4,
  count: 22,
  size: 50,
  sizeVariation: 0.15,
  spawnRate: 14,
  appearanceDuration: 0.55,
  gravity: 1600,
  wind: 0,
  restitution: 0.42,
  friction: 0.45,
  damping: 0,
  spin: 1,
  seed: 52490,
  paused: false,
  interactive: true,
  colors: solidPalette,
  background: 'var(--theme-background, Canvas)',
};

/** Hard ceiling for automatic figures; capacity usually stops much earlier. */
export const shapeMaxCount = 400;

export const shapeClamp = (n: number, lo: number, hi: number, fallback: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : fallback));

export function normalizeShapeSettings(input: ShapeSettings): ShapeSettings {
  return {
    ...input,
    variant: 'solids',
    shape:
      input.shape === 'mixed' || (solidKinds as readonly string[]).includes(input.shape)
        ? input.shape
        : 'mixed',
    depth: input.depth === '2d' ? '2d' : '3d',
    followCursor: input.followCursor !== false,
    cursorFollowRatio: shapeClamp(input.cursorFollowRatio, 0, 1, shapeDefaults.cursorFollowRatio),
    count: Math.round(shapeClamp(input.count, 0, shapeMaxCount, shapeDefaults.count)),
    size: shapeClamp(input.size, 8, 80, shapeDefaults.size),
    sizeVariation: shapeClamp(input.sizeVariation, 0, 0.8, shapeDefaults.sizeVariation),
    spawnRate: shapeClamp(input.spawnRate, 0.2, 30, shapeDefaults.spawnRate),
    appearanceDuration: shapeClamp(
      input.appearanceDuration,
      0,
      5,
      shapeDefaults.appearanceDuration,
    ),
    gravity: shapeClamp(input.gravity, -4000, 4000, shapeDefaults.gravity),
    wind: shapeClamp(input.wind, -600, 600, 0),
    restitution: shapeClamp(input.restitution, 0, 0.95, shapeDefaults.restitution),
    friction: shapeClamp(input.friction, 0, 1, shapeDefaults.friction),
    damping: shapeClamp(input.damping, 0, 5, shapeDefaults.damping),
    spin: shapeClamp(input.spin, 0, 4, shapeDefaults.spin),
    seed: Math.round(shapeClamp(input.seed, 0, 100000, shapeDefaults.seed)),
    colors: input.colors?.length ? input.colors.slice(0, 12) : shapeDefaults.colors,
  };
}

/** Small seeded generator (mulberry32) so a seed replays the same scene. */
export function shapeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
