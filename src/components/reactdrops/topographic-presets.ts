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

import type {
  TopographicGradientColors,
  TopographicHoverEffect,
  TopographicLineStyle,
} from './topographic-renderer';
export type {
  TopographicGradientColors,
  TopographicHoverEffect,
  TopographicLineStyle,
} from './topographic-renderer';
export const topographicDefaults = {
  animateEntrance: true,
  scale: 480,
  density: 5,
  speed: 1.5,
  distortion: 2.4,
  lineWidth: 1,
  opacity: 1,
  dashLength: 7,
  dashGap: 8,
  seed: 42,
  gradientDiffusion: 0,
  paused: false,
  hover: 0.6,
  hoverRadius: 200,
  hoverFollow: 0.16,
  hoverFade: 0.8,
  hoverEffect: 'rings' as TopographicHoverEffect,
};
export const topographicPresets = {
  terrain: {
    backgroundColor: '#292e30',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#e8ebc5',
    accentColor: '#dfb991',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 300,
    density: 5,
    lineWidth: 2,
    opacity: 0.95,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  survey: {
    backgroundColor: '#080909',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#b9bcba',
    accentColor: '#eeeeeb',
    lineStyle: 'mixed' as TopographicLineStyle,
    scale: 265,
    density: 5,
    lineWidth: 1,
    opacity: 0.8,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  aurora: {
    backgroundColor: '#6557f7',
    backgroundImage: 'linear-gradient(115deg, #7147f5 0%, #6557f7 50%, #537bf5 100%)',
    gradientColors: ['#7147f5', '#6557f7', '#537bf5'] as TopographicGradientColors,
    gradientDiffusion: 0.35,
    grain: 0.55,
    lineColor: '#ffffff',
    accentColor: '#ffffff',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 140,
    density: 5,
    lineWidth: 1.25,
    opacity: 0.9,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  dune: {
    backgroundColor: '#f5ead8',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#9e7750',
    accentColor: '#9e7750',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 400,
    density: 5,
    lineWidth: 1,
    opacity: 0.9,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  moss: {
    backgroundColor: '#102b24',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#a5c8b5',
    accentColor: '#a5c8b5',
    lineStyle: 'mixed' as TopographicLineStyle,
    scale: 340,
    density: 5,
    lineWidth: 1,
    opacity: 0.9,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  ocean: {
    backgroundColor: '#06354c',
    backgroundImage: 'linear-gradient(125deg, #0d3c5d 0%, #075778 50%, #3088ae 100%)',
    gradientColors: ['#0d3c5d', '#075778', '#3088ae'] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0.55,
    lineColor: '#d9fff5',
    accentColor: '#d9fff5',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 220,
    density: 5,
    lineWidth: 1.25,
    opacity: 0.9,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  ember: {
    backgroundColor: '#f55e42',
    backgroundImage: 'linear-gradient(120deg, #e34a42 0%, #f55e42 50%, #ff8047 100%)',
    gradientColors: ['#e34a42', '#f55e42', '#ff8047'] as TopographicGradientColors,
    gradientDiffusion: 0.35,
    grain: 0.55,
    lineColor: '#fff1dc',
    accentColor: '#fff1dc',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 140,
    density: 5,
    lineWidth: 1.25,
    opacity: 0.9,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  relief: {
    backgroundColor: '#12c4eb',
    backgroundImage:
      'linear-gradient(120deg, #2359eb 0%, #12c4eb 20%, #14c87f 40%, #ffe22e 60%, #ff932f 80%, #f53f42 100%)',
    gradientColors: [
      '#2359eb',
      '#12c4eb',
      '#14c87f',
      '#ffe22e',
      '#ff932f',
      '#f53f42',
    ] as TopographicGradientColors,
    gradientDiffusion: 0.5,
    grain: 0.55,
    lineColor: '#ffffff',
    accentColor: '#ffffff',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 140,
    density: 10,
    lineWidth: 1,
    opacity: 0.8,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  midnight: {
    backgroundColor: '#0b1026',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#7f96e8',
    accentColor: '#e3e9ff',
    lineStyle: 'mixed' as TopographicLineStyle,
    scale: 360,
    density: 6,
    lineWidth: 1,
    opacity: 0.9,
    hoverEffect: 'swirl' as TopographicHoverEffect,
  },
  blueprint: {
    backgroundColor: '#123a7a',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#cfe3ff',
    accentColor: '#ffffff',
    lineStyle: 'dashed' as TopographicLineStyle,
    scale: 220,
    density: 6,
    lineWidth: 1,
    opacity: 0.85,
    hoverEffect: 'drag' as TopographicHoverEffect,
  },
  neon: {
    backgroundColor: '#05010d',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#ff3fd8',
    accentColor: '#3ff2ff',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 300,
    density: 7,
    lineWidth: 1.5,
    opacity: 1,
    hoverEffect: 'ripple' as TopographicHoverEffect,
  },
  sunset: {
    backgroundColor: '#ff8a5b',
    backgroundImage: 'linear-gradient(120deg, #ff5f6d 0%, #ff8a5b 50%, #ffc371 100%)',
    gradientColors: ['#ff5f6d', '#ff8a5b', '#ffc371'] as TopographicGradientColors,
    gradientDiffusion: 0.4,
    grain: 0.5,
    lineColor: '#fff6e8',
    accentColor: '#fff6e8',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 160,
    density: 5,
    lineWidth: 1.25,
    opacity: 0.9,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  sage: {
    backgroundColor: '#e8eee3',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#4f6b4a',
    accentColor: '#2f4a2b',
    lineStyle: 'mixed' as TopographicLineStyle,
    scale: 420,
    density: 5,
    lineWidth: 1,
    opacity: 0.9,
    hoverEffect: 'spread' as TopographicHoverEffect,
  },
  graphite: {
    backgroundColor: '#1c1f24',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#6e7681',
    accentColor: '#c9d1d9',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 260,
    density: 8,
    lineWidth: 0.75,
    opacity: 0.95,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
  paper: {
    backgroundColor: '#ffffff',
    backgroundImage: 'none',
    gradientColors: [] as TopographicGradientColors,
    gradientDiffusion: 0,
    grain: 0,
    lineColor: '#000000',
    accentColor: '#000000',
    lineStyle: 'solid' as TopographicLineStyle,
    scale: 480,
    density: 5,
    lineWidth: 1,
    opacity: 1,
    hoverEffect: 'rings' as TopographicHoverEffect,
  },
};
export type TopographicPreset = keyof typeof topographicPresets;
