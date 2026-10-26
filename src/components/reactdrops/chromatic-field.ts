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

/**
 * Procedural color field for the chromatic material, generated in code (no
 * image asset). It is a seamless equirectangular field: the shader wraps it
 * around a sphere, rotates it and projects it, so it repeats horizontally
 * (longitude) and clamps vertically (latitude).
 *
 * Soft magenta-violet blobs on a dark ground: fractal value noise, periodic
 * in x, normalized to a fixed hue, saturation and brightness distribution.
 * Palette modes keep only its brightness; hue mode also uses its hue spread.
 */
export const chromaticFieldSize = 128;

// Target distribution (HSV): hue around magenta-violet, near-full
// saturation, dark brightness with bright blobs.
const target = {
  hue: { mean: 0.83, deviation: 0.05 },
  saturation: { mean: 0.988, deviation: 0.03 },
  // Brightness quantiles (share of texels, value): mostly dark with a long
  // tail of bright highlights, which become the material's glints.
  value: [
    [0, 0.024],
    [0.05, 0.078],
    [0.25, 0.157],
    [0.5, 0.243],
    [0.75, 0.325],
    [0.9, 0.4],
    [0.97, 0.459],
    [0.995, 0.506],
    [1, 0.533],
  ] as const,
};

function hash(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

/** Value noise on a lattice that repeats every `period` cells in x. */
function periodicNoise(x: number, y: number, period: number, seed: number) {
  const x0 = Math.floor(x),
    y0 = Math.floor(y),
    fx = x - x0,
    fy = y - y0;
  const sx = fx * fx * fx * (fx * (fx * 6 - 15) + 10),
    sy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const wrap = (value: number) => ((value % period) + period) % period;
  const a = hash(wrap(x0), y0, seed),
    b = hash(wrap(x0 + 1), y0, seed),
    c = hash(wrap(x0), y0 + 1, seed),
    d = hash(wrap(x0 + 1), y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** Fractal noise over the field, seamless across the horizontal edge. */
function fractal(size: number, basePeriod: number, octaves: number, seed: number) {
  const values = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let sum = 0,
        amplitude = 1,
        norm = 0;
      for (let octave = 0; octave < octaves; octave++) {
        const period = basePeriod << octave;
        // Latitude uses half as many cells: the field is twice as wide as tall.
        sum +=
          amplitude *
          periodicNoise((x / size) * period, (y / size) * (period / 2), period, seed + octave * 97);
        norm += amplitude;
        amplitude *= 0.5;
      }
      values[y * size + x] = sum / norm;
    }
  return values;
}

/** Maps values by rank onto a piecewise-linear quantile table. */
function matchQuantiles(values: Float32Array, quantiles: readonly (readonly [number, number])[]) {
  const order = Array.from(values.keys()).sort((a, b) => values[a] - values[b]);
  const mapped = new Float32Array(values.length);
  order.forEach((index, rank) => {
    const share = rank / (values.length - 1);
    let k = 1;
    while (k < quantiles.length - 1 && quantiles[k][0] < share) k++;
    const [s0, v0] = quantiles[k - 1],
      [s1, v1] = quantiles[k];
    mapped[index] = v0 + ((share - s0) / Math.max(1e-6, s1 - s0)) * (v1 - v0);
  });
  return mapped;
}

/** Rescales values to a given mean and deviation. */
function normalize(values: Float32Array, mean: number, deviation: number) {
  let total = 0;
  for (const value of values) total += value;
  const currentMean = total / values.length;
  let variance = 0;
  for (const value of values) variance += (value - currentMean) ** 2;
  const currentDeviation = Math.sqrt(variance / values.length) || 1;
  return values.map((value) => mean + ((value - currentMean) / currentDeviation) * deviation);
}

function hsvToRgb(h: number, s: number, v: number) {
  const i = Math.floor(h * 6),
    f = h * 6 - i,
    p = v * (1 - s),
    q = v * (1 - f * s),
    t = v * (1 - (1 - f) * s);
  switch (((i % 6) + 6) % 6) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    default:
      return [v, p, q];
  }
}

let cached: Uint8Array | null = null;

/** RGBA bytes of the field (`chromaticFieldSize` squared), computed once. */
export function chromaticField(): Uint8Array {
  if (cached) return cached;
  const size = chromaticFieldSize;
  // Brightness: soft blobs from a 4-cell base period, ranked onto the
  // target distribution so highlights keep their long bright tail.
  const value = matchQuantiles(fractal(size, 4, 4, 11), target.value);
  const hue = normalize(fractal(size, 3, 3, 29), target.hue.mean, target.hue.deviation);
  const saturation = normalize(
    fractal(size, 5, 2, 53),
    target.saturation.mean,
    target.saturation.deviation,
  );
  const bytes = new Uint8Array(size * size * 4);
  for (let index = 0; index < size * size; index++) {
    const [r, g, b] = hsvToRgb(
      ((hue[index] % 1) + 1) % 1,
      Math.min(1, Math.max(0.8, saturation[index])),
      value[index],
    );
    bytes[index * 4] = Math.round(r * 255);
    bytes[index * 4 + 1] = Math.round(g * 255);
    bytes[index * 4 + 2] = Math.round(b * 255);
    bytes[index * 4 + 3] = 255;
  }
  cached = bytes;
  return bytes;
}
