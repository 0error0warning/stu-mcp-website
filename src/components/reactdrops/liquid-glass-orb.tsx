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

'use client';

import { gsap } from 'gsap';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  useMemo,
} from 'react';
import './liquid-glass-orb.css';

// fluid-glass-gradient/fluid-glass-gradient-shaders.ts
// Vendored psrdnoise2.glsl, unchanged except for line endings.
// Upstream: https://raw.githubusercontent.com/stegu/psrdnoise/b169834ae3aaeb90518c263179457e4c314a8d9c/src/psrdnoise2.glsl
// Copyright and complete MIT license are included in the GLSL below.
export const licensedNoise = `//
// psrdnoise2.glsl
//
// Authors: Stefan Gustavson (stefan.gustavson@gmail.com)
// and Ian McEwan (ijm567@gmail.com)
// Version 2021-12-02, published under the MIT license (see below)
//
// Copyright (c) 2021 Stefan Gustavson and Ian McEwan.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//

//
// Periodic (tiling) 2-D simplex noise (hexagonal lattice gradient noise)
// with rotating gradients and analytic derivatives.
//
// This is (yet) another variation on simplex noise. Unlike previous
// implementations, the grid is axis-aligned and slightly stretched in
// the y direction to permit rectangular tiling.
// The noise pattern can be made to tile seamlessly to any integer period
// in x and any even integer period in y. Odd periods may be specified
// for y, but then the actual tiling period will be twice that number.
//
// The rotating gradients give the appearance of a swirling motion, and
// can serve a similar purpose for animation as motion along z in 3-D
// noise. The rotating gradients in conjunction with the analytic
// derivatives allow for "flow noise" effects as presented by Ken
// Perlin and Fabrice Neyret.
//


//
// 2-D tiling simplex noise with rotating gradients and analytical derivative.
// "vec2 x" is the point (x,y) to evaluate,
// "vec2 period" is the desired periods along x and y, and
// "float alpha" is the rotation (in radians) for the swirling gradients.
// The "float" return value is the noise value, and
// the "out vec2 gradient" argument returns the x,y partial derivatives.
//
// Setting either period to 0.0 or a negative value will skip the wrapping
// along that dimension. Setting both periods to 0.0 makes the function
// execute about 15% faster.
//
// Not using the return value for the gradient will make the compiler
// eliminate the code for computing it. This speeds up the function
// by 10-15%.
//
// The rotation by alpha uses one single addition. Unlike the 3-D version
// of psrdnoise(), setting alpha == 0.0 gives no speedup.
//
float psrdnoise(vec2 x, vec2 period, float alpha, out vec2 gradient) {

	// Transform to simplex space (axis-aligned hexagonal grid)
	vec2 uv = vec2(x.x + x.y*0.5, x.y);

	// Determine which simplex we're in, with i0 being the "base"
	vec2 i0 = floor(uv);
	vec2 f0 = fract(uv);
	// o1 is the offset in simplex space to the second corner
	float cmp = step(f0.y, f0.x);
	vec2 o1 = vec2(cmp, 1.0-cmp);

	// Enumerate the remaining simplex corners
	vec2 i1 = i0 + o1;
	vec2 i2 = i0 + vec2(1.0, 1.0);

	// Transform corners back to texture space
	vec2 v0 = vec2(i0.x - i0.y * 0.5, i0.y);
	vec2 v1 = vec2(v0.x + o1.x - o1.y * 0.5, v0.y + o1.y);
	vec2 v2 = vec2(v0.x + 0.5, v0.y + 1.0);

	// Compute vectors from v to each of the simplex corners
	vec2 x0 = x - v0;
	vec2 x1 = x - v1;
	vec2 x2 = x - v2;

	vec3 iu, iv;
	vec3 xw, yw;

	// Wrap to periods, if desired
	if(any(greaterThan(period, vec2(0.0)))) {
		xw = vec3(v0.x, v1.x, v2.x);
		yw = vec3(v0.y, v1.y, v2.y);
		if(period.x > 0.0)
			xw = mod(vec3(v0.x, v1.x, v2.x), period.x);
		if(period.y > 0.0)
			yw = mod(vec3(v0.y, v1.y, v2.y), period.y);
		// Transform back to simplex space and fix rounding errors
		iu = floor(xw + 0.5*yw + 0.5);
		iv = floor(yw + 0.5);
	} else { // Shortcut if neither x nor y periods are specified
		iu = vec3(i0.x, i1.x, i2.x);
		iv = vec3(i0.y, i1.y, i2.y);
	}

	// Compute one pseudo-random hash value for each corner
	vec3 hash = mod(iu, 289.0);
	hash = mod((hash*51.0 + 2.0)*hash + iv, 289.0);
	hash = mod((hash*34.0 + 10.0)*hash, 289.0);

	// Pick a pseudo-random angle and add the desired rotation
	vec3 psi = hash * 0.07482 + alpha;
	vec3 gx = cos(psi);
	vec3 gy = sin(psi);

	// Reorganize for dot products below
	vec2 g0 = vec2(gx.x,gy.x);
	vec2 g1 = vec2(gx.y,gy.y);
	vec2 g2 = vec2(gx.z,gy.z);

	// Radial decay with distance from each simplex corner
	vec3 w = 0.8 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2));
	w = max(w, 0.0);
	vec3 w2 = w * w;
	vec3 w4 = w2 * w2;

	// The value of the linear ramp from each of the corners
	vec3 gdotx = vec3(dot(g0, x0), dot(g1, x1), dot(g2, x2));

	// Multiply by the radial decay and sum up the noise value
	float n = dot(w4, gdotx);

	// Compute the first order partial derivatives
	vec3 w3 = w2 * w;
	vec3 dw = -8.0 * w3 * gdotx;
	vec2 dn0 = w4.x * g0 + dw.x * x0;
	vec2 dn1 = w4.y * g1 + dw.y * x1;
	vec2 dn2 = w4.z * g2 + dw.z * x2;
	gradient = 10.9 * (dn0 + dn1 + dn2);

	// Scale the return value to fit nicely into the range [-1,1]
	return 10.9 * n;
}
`;

// Static procedural motes: seeded centers and Gaussian footprints.
// Profile values describe cell spacing and radius in CSS pixels at size 1,
// and exposure gain. Only the underlying pigment brightness changes exposure.
export const filmGrainShader = `
const float fullTurn = 6.28318530718;
const float hashResolution = 4096.;

struct MoteProfile {
  float spacingPx;
  float radiusPx;
  float exposureGain;
};

MoteProfile moteProfile(float style) {
  if (style < .5) return MoteProfile(1.35, .27, .7);
  if (style < 1.5) return MoteProfile(4., .72, .65);
  return MoteProfile(2.5, .5, .9);
}

vec3 moteRandom(vec2 cell, float seed) {
  // Irrational axis strides separate the lattice coordinates. The power of
  // two fixes the sampling precision.
  float phase = dot(cell, vec2(sqrt(2.), sqrt(3.))) + seed * sqrt(5.);
  return fract(sin(phase + vec3(0., 1., 2.)) * hashResolution);
}

float sampleFilmGrain(vec2 pixels, float seed, float style, float size, float pixelRatio) {
  vec2 cssPixels = pixels / pixelRatio;
  if (style > 2.5) {
    // Monochrome uses centered cell noise with no brightness offset.
    float phase = fullTurn * moteRandom(floor(cssPixels / size), seed).z;
    return .5 * sin(phase);
  }
  MoteProfile profile = moteProfile(style);
  float cellSpan = size * profile.spacingPx;
  float radius = profile.radiusPx / profile.spacingPx;
  vec2 point = cssPixels / cellSpan;
  vec2 home = floor(point);
  float exposure = 0.;
  // Adjacent cells contribute through their Gaussian footprints without seams.
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = home + vec2(float(x), float(y));
      vec3 random = moteRandom(cell, seed);
      vec2 center = cell + random.xy;
      vec2 offset = point - center;
      float footprint = exp(-dot(offset, offset) / (2. * radius * radius));
      // Exponential exposure distributes most energy into sparse bright cores.
      float peak = -log(max(1. / hashResolution, 1. - random.z));
      exposure += footprint * peak;
    }
  }
  return profile.exposureGain * exposure;
}
`;

// Grain-only fragment pass.
export const grainCacheFragment = `
precision highp float;
uniform float uSalt, uGrainMode, uFleckSpan, uPixelScale;
${filmGrainShader}
void main() {
  float fleck = sampleFilmGrain(gl_FragCoord.xy,
    uSalt, uGrainMode, uFleckSpan, uPixelScale);
  gl_FragColor = vec4(fleck, 0., 0., 1.);
}`;

export const streamVertex = `
attribute vec2 aSpan;
varying vec2 vSheet;
void main() {
  vSheet = aSpan * .5 + .5;
  gl_Position = vec4(aSpan, 0., 1.);
}`;

// A height field shapes a transparent glass surface over the flowing palette.
export const fluidGlassShaderCore = `
#ifdef USE_GLASS_DERIVATIVES
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
varying vec2 vSheet;
uniform vec2 uSpan;
uniform float uElapsed, uWarpElapsed, uZoom, uSpotSize, uBend, uTwist, uEase, uDistribution;
uniform float uClusterCount, uClusterIntensity, uClusterSize;
uniform float uRelief, uRefraction, uRoughness;
uniform float uReliefFade, uReliefFadeSide, uReliefFadeAmount, uReliefFadeWidth;
uniform float uReflection, uCaustics, uDispersion;
uniform float uFleck, uFleckSpan, uSalt, uPixelScale;
uniform float uFlowType, uGrainMode, uPointerActive;
uniform vec2 uPointer;
uniform vec3 uBase, uTintA, uTintB, uTintC;
#ifdef USE_GRAIN_CACHE
uniform highp sampler2D uGrainCache;
#endif

${licensedNoise}
${filmGrainShader}

vec2 seedPosition(float seed) {
  return vec2(seed * 2.17, seed * -1.43);
}

// A closed cycle keeps position and velocity continuous at the seam.
const float morphRadiansPerSecond = .02;
float morphPhase(float time) {
  return mod(time, fullTurn / morphRadiansPerSecond) * morphRadiansPerSecond;
}

float pigmentPhase(float time) {
  return uFlowType < .5 ? morphPhase(time) : time * .06;
}

// Centered samples keep cluster directions continuous across noise cells.
float clusterPotential(vec2 position, float phase) {
  vec2 unused;
  return psrdnoise(position, vec2(0.), phase, unused);
}

float clusterFrequency();

// Cluster curls share the pigment seed and cycle. Normalize travel by their
// spacing so broader coverage keeps the same deformation within each cluster.
vec2 clusterDeformation(vec2 position, float time) {
  if (uClusterCount <= 0. || uClusterIntensity <= 0. || uBend <= 0.) return position;
  float frequency = clusterFrequency();
  // A closed orbit carries concentrations through the pigment field.
  float phase = pigmentPhase(time);
  vec2 transport = uFlowType < .5
    ? .28 * vec2(cos(phase) - 1., sin(phase)) : vec2(0.);
  vec2 p = frequency * position + seedPosition(uSalt) + vec2(-7., 3.) + transport;
  float angle = uSalt * .1435 + phase;
  float field = clusterPotential(p, angle);
  const float footprint = .02;
  vec2 gradient = vec2(
    clusterPotential(p + vec2(footprint, 0.), angle) - clusterPotential(p - vec2(footprint, 0.), angle),
    clusterPotential(p + vec2(0., footprint), angle) - clusterPotential(p - vec2(0., footprint), angle)
  ) / (2. * footprint);
  float concentration = smoothstep(-.05, .65, field);
  vec2 curl = vec2(gradient.y, -gradient.x) / sqrt(1. + dot(gradient, gradient));
  float reach = .24 * uBend / sqrt(1. + .12 * uBend * uBend);
  float amount = smoothstep(0., 1., uClusterCount) * uClusterIntensity;
  return position + amount * reach * concentration * curl / frequency;
}

// Each shear varies perpendicular to its direction, keeping its determinant at one.
vec2 openDeformation(vec2 position, float strength) {
  vec2 unused;
  vec2 mapped = position;
  vec2 seed = seedPosition(uSalt);
  float frequency = .5 / sqrt(1. + .09 * strength * strength);
  // Bound the shear reach to keep color pools broad.
  float reach = .65 * strength / sqrt(1. + .15 * strength * strength);
  vec2 directions[4];
  directions[0] = vec2(1., 0.);
  directions[1] = vec2(0., 1.);
  directions[2] = vec2(.6, .8);
  directions[3] = vec2(-.8, .6);
  for (int index = 0; index < 4; index++) {
    float id = float(index);
    vec2 direction = directions[index];
    vec2 normal = vec2(-direction.y, direction.x);
    vec2 samplePoint = vec2(frequency * dot(mapped, normal) + .5 * dot(seed, normal), id * 7.3 + uSalt * .19);
    float shift = psrdnoise(samplePoint, vec2(0.), uSalt * (.23 + id * .13), unused);
    mapped += reach * shift * direction;
  }
  return mapped;
}

// A logarithmic response adds detail on large canvases without scaling it
// directly with their pixel count. Pace uses the same density calibration.
float canvasDensity() {
  const float referenceExtentPx = 320.;
  const float minimumDensity = .18;
  const float densityPerDoubling = .27;
  float extent = max(uSpan.x, uSpan.y) / uPixelScale;
  return minimumDensity + densityPerDoubling * log2(1. + extent / referenceExtentPx);
}

// Keep enough cluster samples across the visible area, even when large sizes
// or a low pattern scale would otherwise leave most of the screen in one pool.
// Combine scales smoothly; the original curl, reach and height profile remain.
float clusterFrequency() {
  vec2 cssSize = max(uSpan / max(.001, uPixelScale), vec2(1.));
  vec2 span = cssSize / min(cssSize.x, cssSize.y);
  float surfaceSpan = 1.85 * canvasDensity() * uZoom * (uFlowType < .5 ? 1.75 : 1.);
  float count = sqrt(max(1., uClusterCount));
  float sized = .62 * count / sqrt(uClusterSize);
  float coverage = .8 * count / (sqrt(span.x * span.y) * max(.001, surfaceSpan));
  return sqrt(sized * sized + coverage * coverage);
}

float canvasPace() {
  const float referenceDensity = .63;
  return canvasDensity() / referenceDensity;
}

float flowTime() { return uElapsed * canvasPace(); }
float warpTime() { return uWarpElapsed * canvasPace(); }

// Shared surface deformation for Wave and Vortex.
vec2 deformSurface(vec2 position) {
  float strength = .95 * uBend / sqrt(1. + .06 * uBend * uBend);
  float freeStrength = 1.1 * strength / sqrt(1. + .18 * strength * strength);
  float extraBend = max(0., uBend - 4.);
  float boost = 1. + .18 * extraBend * extraBend / (1. + extraBend);
  return openDeformation(position, freeStrength * boost);
}

// Bounded cross-axis shears keep Wave's map from reversing or collapsing.
vec2 waveMotion(vec2 position, float time) {
  float reach = .12 * uBend / sqrt(1. + .16 * uBend * uBend);
  position.x += reach * sin(1.2 * position.y - time * .12);
  position.y += .65 * reach * sin(.9 * position.x + time * .09);
  return position;
}

// A rotated sample at the same frequency breaks up shared lattice junctions.
const float morphFrequency = 1.25;
float morphNoise(vec2 p, float phase) {
  vec2 unused;
  float a = psrdnoise(p, vec2(0.), .3 * sin(phase), unused);
  float b = psrdnoise(mat2(.8, -.6, .6, .8) * p + vec2(29., -17.), vec2(0.), .3 * cos(phase), unused);
  return .96 * a + .12 * b;
}

// Two evolving fields bend the domain sampled by the pigment.
vec2 localDeformation(vec2 position, float phase) {
  vec2 bend = vec2(0.);
  vec2 seed = seedPosition(uSalt);
  float reach = .23 * uBend;
  for (int i = 0; i < 2; i++) {
    float layer = float(i);
    vec2 orbit = vec2(cos(phase * (layer + 1.)), sin(phase * (layer + 1.)));
    vec2 p = position * morphFrequency + bend + seed + vec2(17., -9.) * layer;
    bend = reach * vec2(
      morphNoise(p + .55 * orbit, phase + .7 * layer),
      morphNoise(mat2(.6, -.8, .8, .6) * p + vec2(-13., 8.) - .42 * orbit, phase - 1.3));
  }
  return position + bend / morphFrequency;
}

vec2 flowMap(vec2 position) {
  float time = warpTime();
  vec2 mapped = uFlowType < .5 ? localDeformation(position, morphPhase(time)) : deformSurface(position);
  if (uFlowType > 1.5) {
    mapped = waveMotion(mapped, time);
  } else if (uFlowType > .5) {
    vec2 center = vec2(.75, .9);
    vec2 radius = mapped - center;
    // Oscillate the vortex angle around a fixed center.
    float angle = uBend * exp(-dot(radius, radius) * .25) * sin(.8)
      + .18 * uBend / sqrt(1. + uBend * uBend) * sin(time * .09);
    float spin = cos(angle), crossSpin = sin(angle);
    mapped = center + mat2(spin, -crossSpin, crossSpin, spin) * radius;
  }
  // Add translation to Wave and Vortex.
  if (uFlowType > .5) mapped += vec2(.18 * sin(time * .06), .16 * sin(time * .05));
  if (uPointerActive > .5) {
    vec2 offset = vSheet - uPointer;
    float focus = exp(-dot(offset, offset) * 10.);
    mapped += .32 * uBend * focus * (offset + vec2(.25, -.2));
  }
  return clusterDeformation(mapped, time);
}

vec2 surfacePoint() {
  vec2 cssSize = uSpan / uPixelScale;
  vec2 span = cssSize / min(cssSize.x, cssSize.y);
  vec2 centered = (vSheet - .5) * span;
  float c = cos(uTwist), s = sin(uTwist);
  centered = mat2(c, -s, s, c) * centered;
  float density = canvasDensity();
  return (centered + span * .5) * (1.85 * density * uZoom * (uFlowType < .5 ? 1.75 : 1.));
}

// A screen-anchored height envelope, including its analytic surface gradient.
// The quintic ramp has zero slope and curvature at both shoulders.
vec3 reliefEnvelope(vec2 surface) {
  if (uReliefFade < .5 || uReliefFadeAmount <= 0.) return vec3(1., 0., 0.);
  if (uReliefFadeAmount >= 1.) return vec3(0.);
  float density = 1.85 * canvasDensity() * uZoom * (uFlowType < .5 ? 1.75 : 1.);
  vec2 span = uSpan / min(uSpan.x, uSpan.y);
  float c = cos(uTwist), s = sin(uTwist);
  // Finite-difference queries must also move through the height envelope.
  vec2 sheet = vSheet + mat2(c, s, -s, c) * (surface - surfacePoint())
    / max(.001, density) / span;
  vec2 axis = vec2(1., 0.);
  float distance = sheet.x;
  if (uReliefFadeSide > 2.5) {
    axis = vec2(0., 1.); distance = sheet.y;
  } else if (uReliefFadeSide > 1.5) {
    axis = vec2(0., -1.); distance = 1. - sheet.y;
  } else if (uReliefFadeSide > .5) {
    axis = vec2(-1., 0.); distance = 1. - sheet.x;
  }
  float pixels = abs(axis.x) > .5 ? uSpan.x : uSpan.y;
  float width = max(uPixelScale / pixels, min(uReliefFadeWidth, 1. - uReliefFadeAmount));
  float t = clamp((distance - uReliefFadeAmount) / width, 0., 1.);
  float weight = t * t * t * (t * (6. * t - 15.) + 10.);
  float derivative = 30. * t * t * (t - 1.) * (t - 1.) / width;
  vec2 gradient = mat2(c, -s, s, c) * (axis / span) * derivative / max(.001, density);
  return vec3(weight, gradient);
}

// Smooth shoulders turn the flowing scalar field into convex glass relief.
float glassHeight(float field) {
  float value = field * exp2(-.8 * uDistribution);
  return .24 * uRelief * smoothstep(-.65 - .2 * uEase, .75 + .2 * uEase, value);
}

vec2 glassPosition(vec2 surface) {
  // Blend the original flow into the relief, preserving its flowing folds.
  return mix(surface, flowMap(surface), mix(.26, .08, uEase));
}

vec3 reliefSample(vec2 position, float time) {
  float phase = pigmentPhase(time);
  vec2 samplePoint = position / uSpotSize;
  vec2 gradientA, gradientB;
  float broad;
  vec2 broadGradient;
  if (uFlowType < .5) {
    vec2 orbit = .32 * vec2(cos(2. * phase) - 1., sin(2. * phase));
    vec2 p = samplePoint * morphFrequency + seedPosition(uSalt) + orbit;
    float a = psrdnoise(p, vec2(0.), .3 * sin(phase), gradientA);
    float b = psrdnoise(mat2(.8, -.6, .6, .8) * p + vec2(29., -17.),
      vec2(0.), .3 * cos(phase), gradientB);
    broad = .96 * a + .12 * b;
    broadGradient = (.96 * gradientA + .12 * mat2(.8, .6, -.6, .8) * gradientB) * morphFrequency / uSpotSize;
  } else {
    broad = psrdnoise(samplePoint + seedPosition(uSalt) + vec2(-7., 3.),
      vec2(0.), uSalt * .1435 + phase, gradientA);
    broadGradient = gradientA / uSpotSize;
  }
  float frequency = clusterFrequency();
  float pools = psrdnoise(samplePoint * frequency + seedPosition(uSalt) + vec2(-7., 3.),
    vec2(0.), phase + uSalt * .1435, gradientB);
  vec2 poolGradient = gradientB * frequency / uSpotSize;
  float amount = .8 * smoothstep(0., 1., uClusterCount) * uClusterIntensity / (1. + uClusterIntensity);
  // Clusters contribute rounded volumes as well as the flow's deformation.
  // Blending fields avoids stacking thin pigment folds into an opaque surface.
  return vec3(mix(broad, pools, amount), mix(broadGradient, poolGradient, amount));
}

float reliefField(vec2 position, float time) {
  return reliefSample(position, time).x;
}

vec2 heightGradient(vec3 sampleValue) {
  float spread = 1.4 + .4 * uEase;
  float distribution = exp2(-.8 * uDistribution);
  float t = clamp((sampleValue.x * distribution + .65 + .2 * uEase) / spread, 0., 1.);
  return sampleValue.yz * (.24 * uRelief * 6. * t * (1. - t) * distribution / spread);
}

float heightAt(vec2 surface) {
  return glassHeight(reliefField(glassPosition(surface), warpTime())) * reliefEnvelope(surface).x;
}

vec3 glassNormal(vec2 surface, vec2 position, vec2 gradient, vec2 envelopeSlope) {
  float density = 1.85 * canvasDensity() * uZoom * (uFlowType < .5 ? 1.75 : 1.);
  vec2 slope;
#ifdef USE_GLASS_DERIVATIVES
  // Convert pixel derivatives to surface units so DPR and resizing do not
  // change the relief. The rotation is already present in the sampled height.
  // Analytic noise gradients avoid the 2x2 constant slopes of height
  // derivatives. Only the domain Jacobian needs pixel derivatives.
  slope = vec2(dot(gradient, dFdx(position)) + dot(envelopeSlope, dFdx(surface)),
    dot(gradient, dFdy(position)) + dot(envelopeSlope, dFdy(surface)))
    * min(uSpan.x, uSpan.y) / max(.001, density);
#else
  // Match the surface-to-screen basis when derivatives are unavailable.
  float angle = uTwist;
  vec2 dx = .003 * vec2(cos(angle), -sin(angle));
  vec2 dy = .003 * vec2(sin(angle), cos(angle));
  slope = vec2(heightAt(surface + dx) - heightAt(surface - dx),
    heightAt(surface + dy) - heightAt(surface - dy)) / .006;
#endif
  // Bound grazing angles at the expanded cluster settings without flattening
  // the surface or introducing a threshold in its shape.
  slope /= sqrt(1. + .08 * dot(slope, slope));
  return normalize(vec3(-slope, 1.));
}

// A local optical slope estimates light concentration behind the relief.
// It contains no pixel derivatives, so its ray Jacobian uses first derivatives
// only, including on devices that need finite differences for glass normals.
vec2 causticOffset(vec2 gradient) {
  vec3 normal = normalize(vec3(-gradient, 1.));
  vec3 ray = refract(normalize(vec3(-.35, .4, -1.)), normal, 1. / 1.46);
  return ray.xy / max(.25, abs(ray.z)) * .3 * uRefraction;
}

#ifndef USE_GLASS_DERIVATIVES
vec2 causticOffsetAt(vec2 surface) {
  vec3 sampleValue = reliefSample(glassPosition(surface), warpTime());
  vec3 envelope = reliefEnvelope(surface);
  return causticOffset(heightGradient(sampleValue) * envelope.x
    + glassHeight(sampleValue.x) * envelope.yz);
}
#endif

float causticFocus(vec2 surface, vec2 gradient) {
  vec2 dx, dy;
#ifdef USE_GLASS_DERIVATIVES
  vec2 offset = causticOffset(gradient);
  float density = 1.85 * canvasDensity() * uZoom * (uFlowType < .5 ? 1.75 : 1.);
  float pixelToSurface = min(uSpan.x, uSpan.y) / max(.001, density);
  dx = dFdx(offset) * pixelToSurface;
  dy = dFdy(offset) * pixelToSurface;
#else
  vec2 axisX = .003 * vec2(cos(uTwist), -sin(uTwist));
  vec2 axisY = .003 * vec2(sin(uTwist), cos(uTwist));
  dx = (causticOffsetAt(surface + axisX) - causticOffsetAt(surface - axisX)) / .006;
  dy = (causticOffsetAt(surface + axisY) - causticOffsetAt(surface - axisY)) / .006;
#endif
  float area = (1. + dx.x) * (1. + dy.y) - dx.y * dy.x;
  return clamp(1. / max(.35, abs(area)) - 1., -.3, 1.8);
}

// A broad colored backdrop remains visible through the glass. Refraction
// changes where it is sampled, rather than painting a white outline on top.
vec3 glassBackdrop(vec2 surface, float time) {
  vec2 unused;
  float phase = pigmentPhase(time);
  vec2 travel = .25 * vec2(sin(phase), cos(phase) - 1.);
  float pool = psrdnoise(surface * 2.4 + seedPosition(uSalt) + travel, vec2(0.), phase, unused);
  float wash = psrdnoise(surface * 1.1 + seedPosition(uSalt) + vec2(19., -11.), vec2(0.), .35 * sin(phase), unused);
  vec3 tint = mix(uTintA, uTintB, smoothstep(-.65, .65, pool));
  tint = mix(tint, uTintC, .45 * smoothstep(-.7, .8, wash));
  // Let color pools reach their pigment instead of diluting every region with
  // 42–62% of the base. The base still appears in the low parts of the field.
  return mix(uBase, tint, smoothstep(-.75, .15, pool - .4 * uDistribution));
}

// Soft studio lights reflected by the surface normal. Roughness broadens the
// highlights and reduces their peaks; they follow the glass, not screen masks.
vec3 glassEnvironment(vec3 direction, float normalVariation) {
  float width = mix(.075, .48, uRoughness);
  float band = direction.x + .4 * direction.y + .18;
  float footprint = 0.;
#ifdef USE_GLASS_DERIVATIVES
  // Integrate every studio light over its pixel footprint. Filtering only
  // the key leaves the fill and sharp softbox rims unresolved on tight bends.
  footprint = .35 * normalVariation * normalVariation;
#endif
  float resolvedWidth = sqrt(width * width + footprint);
  float key = exp(-pow(band / resolvedWidth, 2.)) * width / resolvedWidth;
  key *= smoothstep(-.35, .5, direction.z);
  float fillWidth = .17 + .5 * uRoughness;
  float resolvedFillWidth = sqrt(fillWidth * fillWidth + footprint);
  float fill = exp(-pow((direction.y - .35 * direction.z - .28) / resolvedFillWidth, 2.))
    * fillWidth / resolvedFillWidth;
  float studio = .12 + .2 * smoothstep(-.6, .8, direction.y);
  vec3 environment = mix(uTintA * .2, uBase * .6, studio);
  environment += vec3(1., .99, .97) * key * mix(4.5, 1.2, uRoughness);
  environment += mix(uBase, vec3(1.), .7) * fill * mix(1.5, .65, uRoughness);
  float power = mix(72., 6., uRoughness);
  float resolvedPower = power / (1. + 2. * power * footprint);
  float softbox = pow(max(0., dot(direction, normalize(vec3(-.45, .55, 1.)))), resolvedPower)
    * resolvedPower / power;
  environment += vec3(1.) * softbox * mix(8., 1.5, uRoughness);
  return environment;
}

`;

export const streamFragment = `${fluidGlassShaderCore}void main() {
  vec2 surface = surfacePoint();
  vec2 position = glassPosition(surface);
  vec3 surfaceSample = reliefSample(position, warpTime());
  float field = surfaceSample.x;
  vec3 envelope = reliefEnvelope(surface);
  float rawHeight = glassHeight(field);
  float height = rawHeight * envelope.x;
  vec2 gradient = heightGradient(surfaceSample) * envelope.x;
  vec2 envelopeSlope = rawHeight * envelope.yz;
  vec2 opticalGradient = gradient + envelopeSlope;
  vec3 normal = glassNormal(surface, position, gradient, envelopeSlope);
  float normalVariation = 0.;
#ifdef USE_GLASS_DERIVATIVES
  // Use first derivatives of the analytic gradient for the highlight footprint.
  // Differentiating the derived normal would require undefined second derivatives.
  normalVariation = .5 * (length(dFdx(opticalGradient)) + length(dFdy(opticalGradient)));
#endif
  vec3 incident = vec3(0., 0., -1.);
  vec3 ray = refract(incident, normal, 1. / 1.46);
  vec2 displacement = ray.xy / max(.25, abs(ray.z)) * (.12 + height) * uRefraction;
  vec3 transmission = glassBackdrop(surface + displacement, flowTime());
  if (uDispersion > 0. && uRefraction > 0.) {
    float spread = .24 * uDispersion;
    vec3 red = glassBackdrop(surface + displacement * (1. + spread), flowTime());
    vec3 blue = glassBackdrop(surface + displacement * (1. - spread), flowTime());
    transmission = vec3(red.r, transmission.g, blue.b);
  }
  if (uCaustics > 0. && uRefraction > 0.) {
    transmission *= 1. + .25 * uCaustics * causticFocus(surface, opticalGradient);
  }
  // Thickness absorbs a little of the palette and gives raised regions body.
  transmission *= exp(-height * .7 * (vec3(1.) - uTintA));
  float facing = clamp(normal.z, 0., 1.);
  float fresnel = clamp((.035 + .965 * pow(1. - facing, 5.)) * uReflection, 0., 1.);
  vec3 reflection = glassEnvironment(reflect(incident, normal), normalVariation);
  vec3 color = transmission * (1. - fresnel) + reflection * fresnel;
  float sideLight = dot(normal, normalize(vec3(-.55, .65, .9)));
  color *= .88 + .12 * max(0., sideLight);

#ifdef USE_GRAIN_CACHE
  float fleck = uFleck > 0. ? texture2D(uGrainCache, gl_FragCoord.xy / uSpan).r : 0.;
#else
  float fleck = sampleFilmGrain(gl_FragCoord.xy,
    uSalt, uGrainMode, uFleckSpan, uPixelScale);
#endif
  float brightnessResponse = sqrt(dot(color, color) / 3.);
  color += vec3(fleck * uFleck * brightnessResponse);
  gl_FragColor = vec4(clamp(color, 0., 1.), 1.);
}`;

// fluid-glass-gradient/fluid-glass-gradient-renderer.ts
export const fluidGlassGradientPresets = {
  tide: {
    baseColor: '#e7f3f1',
    colorA: '#1f6669',
    colorB: '#5fa8a6',
    colorC: '#a8d7d0',
    seed: 119,
    startTime: 18,
  },
  cobalt: {
    baseColor: '#e4e9f8',
    colorA: '#3c6bc8',
    colorB: '#9cc8dc',
    colorC: '#7d9ee7',
    seed: 154,
    startTime: 0,
  },
  'cobalt-dark': {
    baseColor: '#000000',
    colorA: '#3c6bc8',
    colorB: '#5f7b88',
    colorC: '#364567',
    colorDistribution: 0,
    seed: 154,
    startTime: 0,
  },
  lilac: {
    baseColor: '#f1e9f5',
    colorA: '#70458f',
    colorB: '#9d6bb0',
    colorC: '#c9a3d5',
    seed: 118,
    startTime: 0,
  },
  dune: {
    baseColor: '#f0ece4',
    colorA: '#756a5b',
    colorB: '#aa9a85',
    colorC: '#d2c6b3',
    seed: 176,
    startTime: 0,
  },
  honey: {
    baseColor: '#fff1bd',
    colorA: '#b74308',
    colorB: '#f47e0b',
    colorC: '#ffd13b',
    seed: 89,
    startTime: 0,
  },
  berry: {
    baseColor: '#f9e8ef',
    colorA: '#a63f67',
    colorB: '#d27e9e',
    colorC: '#e8b4c8',
    seed: 48,
    startTime: 0,
  },
  frost: {
    baseColor: '#e9f3f6',
    colorA: '#4b758a',
    colorB: '#89b4c4',
    colorC: '#bfdce5',
    seed: 36,
    startTime: 0,
  },
  aqua: {
    baseColor: '#ffffff',
    colorA: '#007f79',
    colorB: '#0eb9ad',
    colorC: '#defcf7',
    seed: 107,
    startTime: 0,
  },
  red: {
    baseColor: '#ffffff',
    colorA: '#b41438',
    colorB: '#f13559',
    colorC: '#ffe4e9',
    seed: 68,
    startTime: 0,
  },
  monochrome: {
    baseColor: '#ffffff',
    colorA: '#000000',
    colorB: '#4d4d4d',
    colorC: '#a9a9a9',
    seed: 145,
    startTime: 18,
  },
} as const;

export type FluidGlassGradientPreset = keyof typeof fluidGlassGradientPresets;

export type GrainMode = 'fine' | 'coarse' | 'rough' | 'monochrome';

export type FlowType = 'drift' | 'vortex' | 'wave';

export type ReliefFadeSide = 'left' | 'right' | 'top' | 'bottom';

export type FlowTuning = {
  baseColor: string;
  colorA: string;
  colorB: string;
  colorC: string;
  speed: number;
  distortion: number;
  clusterCount: number;
  clusterIntensity: number;
  clusterSize: number;
  scale: number;
  spotSize: number;
  rotation: number;
  softness: number;
  relief: number;
  reliefFade: boolean;
  reliefFadeSide: ReliefFadeSide;
  reliefFadeAmount: number;
  reliefFadeWidth: number;
  refraction: number;
  roughness: number;
  reflection: number;
  caustics: number;
  dispersion: number;
  colorDistribution: number;
  grain: number;
  grainSize: number;
  seed: number;
  startTime: number;
  paused: boolean;
  /** @deprecated Grain is always static and responds only to pigment brightness. */
  animatedGrain: boolean;
  animateDistortion: boolean;
  interactive: boolean;
  grainMode: GrainMode;
  flowType: FlowType;
};

export const fluidGlassGradientDefaults: FlowTuning = {
  ...fluidGlassGradientPresets.tide,
  seed: 113,
  startTime: 46,
  speed: 1.5,
  distortion: 2.4,
  clusterCount: 7.2,
  clusterIntensity: 3,
  clusterSize: 22.5,
  scale: 0.23,
  spotSize: 1.15,
  rotation: 0,
  softness: 0.31,
  relief: 2.94,
  reliefFade: false,
  reliefFadeSide: 'left',
  reliefFadeAmount: 35,
  reliefFadeWidth: 25,
  refraction: 0.65,
  roughness: 0,
  reflection: 1.3,
  caustics: 0,
  dispersion: 1,
  colorDistribution: 0,
  grain: 0.02,
  grainSize: 1,
  paused: false,
  animatedGrain: false,
  animateDistortion: true,
  interactive: false,
  grainMode: 'fine',
  flowType: 'drift',
};

function finiteInRange(value: number, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

export function normalizeFlow(input: FlowTuning): FlowTuning {
  const defaults = fluidGlassGradientDefaults;
  return {
    ...input,
    interactive: input.interactive === true,
    animateDistortion: input.animateDistortion !== false,
    reliefFade: input.reliefFade === true,
    reliefFadeSide: (['left', 'right', 'top', 'bottom'] as string[]).includes(input.reliefFadeSide)
      ? input.reliefFadeSide
      : defaults.reliefFadeSide,
    grainMode: (['fine', 'coarse', 'rough', 'monochrome'] as string[]).includes(input.grainMode)
      ? input.grainMode
      : defaults.grainMode,
    flowType: (['drift', 'vortex', 'wave'] as string[]).includes(input.flowType)
      ? input.flowType
      : defaults.flowType,
    startTime: finiteInRange(input.startTime, defaults.startTime, 0, 86400),
    speed: finiteInRange(input.speed, defaults.speed, 0, 3),
    distortion: finiteInRange(input.distortion, defaults.distortion, 0, 8),
    clusterCount: finiteInRange(input.clusterCount, defaults.clusterCount, 0, 64),
    clusterIntensity: finiteInRange(input.clusterIntensity, defaults.clusterIntensity, 0, 12),
    clusterSize: finiteInRange(input.clusterSize, defaults.clusterSize, 0.25, 32),
    spotSize: finiteInRange(input.spotSize, defaults.spotSize, 0.1, 5),
    scale: finiteInRange(input.scale, defaults.scale, 0.01, 5),
    rotation: finiteInRange(input.rotation, defaults.rotation, -360, 360),
    colorDistribution: finiteInRange(input.colorDistribution, defaults.colorDistribution, -1, 1),
    softness: finiteInRange(input.softness, defaults.softness, 0, 1),
    relief: finiteInRange(input.relief, defaults.relief, 0, 3),
    reliefFadeAmount: finiteInRange(input.reliefFadeAmount, defaults.reliefFadeAmount, 0, 100),
    reliefFadeWidth: finiteInRange(input.reliefFadeWidth, defaults.reliefFadeWidth, 0, 100),
    refraction: finiteInRange(input.refraction, defaults.refraction, 0, 2),
    roughness: finiteInRange(input.roughness, defaults.roughness, 0, 1),
    reflection: finiteInRange(input.reflection, defaults.reflection, 0, 2),
    caustics: finiteInRange(input.caustics, defaults.caustics, 0, 2),
    dispersion: finiteInRange(input.dispersion, defaults.dispersion, 0, 1),
    grain: finiteInRange(input.grain, defaults.grain, 0, 0.5),
    grainSize: finiteInRange(input.grainSize, defaults.grainSize, 0.5, 5),
    seed: finiteInRange(input.seed, defaults.seed, 0, 200),
  };
}

// Wrap Drift's cycle for GPU float precision without resetting the active clock.
export function flowSeconds(seconds: number, extent: number, mode: FlowType): number {
  if (mode !== 'drift') return seconds;
  const pace = (0.18 + 0.27 * Math.log2(1 + extent / 320)) / 0.63;
  const cycleSeconds = (2 * Math.PI) / 0.02 / pace;
  return seconds % cycleSeconds;
}

export type GrainCacheInput = {
  width: number;
  height: number;
  pixelRatio: number;
  size: number;
  seed: number;
  style: number;
};

// Cache grain at drawing-buffer resolution. Float storage retains signed
// noise and bright flecks without clipping or tiling.
// Unsupported devices evaluate grain in the color pass.
export function createGrainCache(gl: WebGLRenderingContext, vertexSource: string) {
  if (!gl.getExtension('OES_texture_float') || !gl.getExtension('WEBGL_color_buffer_float'))
    return null;
  const program = gl.createProgram();
  const texture = gl.createTexture();
  const target = gl.createFramebuffer();
  const buffer = gl.createBuffer();
  const shaders: WebGLShader[] = [];
  let width = 1;
  let height = 1;
  let key = '';

  function dispose() {
    for (const shader of shaders) gl.deleteShader(shader);
    gl.deleteProgram(program);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(target);
    gl.deleteBuffer(buffer);
  }

  try {
    if (!program || !texture || !target || !buffer) throw new Error('Grain cache unavailable');
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertexSource],
      [gl.FRAGMENT_SHADER, grainCacheFragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Grain shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('Grain shader compilation failed');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error('Grain shader link failed');
    const attribute = gl.getAttribLocation(program, 'aSpan');
    const uniforms = {
      seed: gl.getUniformLocation(program, 'uSalt'),
      style: gl.getUniformLocation(program, 'uGrainMode'),
      size: gl.getUniformLocation(program, 'uFleckSpan'),
      pixelRatio: gl.getUniformLocation(program, 'uPixelScale'),
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // A complete sampler is also required while grain amount is zero.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (
      gl.getError() !== gl.NO_ERROR ||
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
    ) {
      throw new Error('Float grain target unavailable');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
      prepare(input: GrainCacheInput, enabled: boolean) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if (!enabled) return true;
        const nextKey = [
          input.width,
          input.height,
          input.pixelRatio,
          input.size,
          input.seed,
          input.style,
        ].join(':');
        if (nextKey === key) return true;
        try {
          if (width !== input.width || height !== input.height) {
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              input.width,
              input.height,
              0,
              gl.RGBA,
              gl.FLOAT,
              null,
            );
            width = input.width;
            height = input.height;
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
            if (
              gl.getError() !== gl.NO_ERROR ||
              gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
            )
              return false;
          } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
          }
          gl.bindTexture(gl.TEXTURE_2D, null);
          gl.viewport(0, 0, width, height);
          gl.useProgram(program);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.enableVertexAttribArray(attribute);
          gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
          for (const name of Object.keys(uniforms) as (keyof typeof uniforms)[])
            gl.uniform1f(uniforms[name], input[name]);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          key = nextKey;
          return true;
        } finally {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.bindTexture(gl.TEXTURE_2D, texture);
        }
      },
      dispose,
    };
  } catch {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    dispose();
    return null;
  }
}

// Resolve polished glass at Retina density, including a 1080p full-screen
// surface at DPR 2. Keep a bounded allocation for larger displays.
const MAX_PIXEL_RATIO = 2;

const MAX_RENDER_PIXELS = 8_294_400;

const MAX_RENDER_DIMENSION = 4096;

const flowModes = { drift: 0, vortex: 1, wave: 2 } as const;

const grainModes = { fine: 0, coarse: 1, rough: 2, monochrome: 3 } as const;

const reliefFadeSides = { left: 0, right: 1, top: 2, bottom: 3 } as const;

const uniformNames = [
  'uSpan',
  'uElapsed',
  'uWarpElapsed',
  'uZoom',
  'uSpotSize',
  'uBend',
  'uClusterCount',
  'uClusterIntensity',
  'uClusterSize',
  'uTwist',
  'uEase',
  'uRelief',
  'uReliefFade',
  'uReliefFadeSide',
  'uReliefFadeAmount',
  'uReliefFadeWidth',
  'uRefraction',
  'uRoughness',
  'uReflection',
  'uCaustics',
  'uDispersion',
  'uDistribution',
  'uFleck',
  'uFleckSpan',
  'uSalt',
  'uPixelScale',
  'uFlowType',
  'uGrainMode',
  'uPointer',
  'uPointerActive',
  'uBase',
  'uTintA',
  'uTintB',
  'uTintC',
  'uGrainCache',
] as const;

type UniformName = (typeof uniformNames)[number];

export type FlowFrameObserver = (
  tuning: FlowTuning,
  now: number,
  moving: boolean,
  deltaSeconds: number,
  host: HTMLElement,
) => void;

export type FlowMaterialAnimation = {
  fragment: string;
  uniformNames: readonly string[];
  uniforms: () => Record<string, number | Float32Array>;
};

export function createFlowEngine(
  canvas: HTMLCanvasElement,
  initial: FlowTuning,
  observeFrame?: FlowFrameObserver,
  animation?: FlowMaterialAnimation,
) {
  const parent = canvas.parentElement;
  const doc = canvas.ownerDocument;
  const ownerWindow = doc.defaultView;
  if (!parent || !ownerWindow) return null;
  const host = parent;
  const win = ownerWindow;

  const context = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!context) return null;
  const gl = context;
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');

  let tuning = normalizeFlow(initial);
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let spanAttribute = 0;
  let grainCache: ReturnType<typeof createGrainCache> = null;
  let allowGrainCache = true;
  let uniforms = {} as Record<UniformName, WebGLUniformLocation | null>;
  const animationUniforms: Record<string, WebGLUniformLocation | null> = {};
  let frame = 0;
  let lastTime = 0;
  let phase = 0;
  let warpPhase = 0;
  let pixelScale = 1;
  let inView = true;
  let disposed = false;
  let unavailable = false;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let pointerActive = false;

  const colorCanvas = doc.createElement('canvas');
  colorCanvas.width = colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map<string, number[]>();

  // Let the browser resolve CSS colors before passing normalized RGB to WebGL.
  function parseColor(value: string) {
    const cached = colorCache.get(value);
    if (cached) return cached;
    if (!colorContext) return [1, 1, 1];

    colorContext.clearRect(0, 0, 1, 1);
    colorContext.fillStyle = '#ffffff';
    colorContext.fillStyle = value;
    colorContext.fillRect(0, 0, 1, 1);
    const bytes = colorContext.getImageData(0, 0, 1, 1).data;
    const rgb = [bytes[0] / 255, bytes[1] / 255, bytes[2] / 255];
    colorCache.set(value, rgb);
    return rgb;
  }

  function stop() {
    win.cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function scheduleFrame() {
    if (disposed || unavailable || !inView || doc.visibilityState === 'hidden' || frame) return;
    frame = win.requestAnimationFrame(drawFrame);
  }

  function drawFrame(now: number) {
    frame = 0;
    if (disposed || unavailable || !program || !inView || doc.visibilityState === 'hidden') {
      lastTime = 0;
      return;
    }

    const moving = !tuning.paused && !motion.matches;
    observeFrame?.(
      tuning,
      now,
      moving && tuning.speed > 0,
      lastTime ? Math.max(0, (now - lastTime) / 1000) : 0,
      host,
    );
    // Both clocks use active elapsed time; pause and visibility reset lastTime.
    if (moving && lastTime) {
      const step = Math.max(0, (now - lastTime) / 1000) * tuning.speed;
      phase += step;
      if (tuning.animateDistortion) warpPhase += step;
    }
    lastTime = now;

    const extent = Math.max(canvas.width, canvas.height) / pixelScale;
    const seconds = phase + tuning.startTime;
    const scalars = {
      uElapsed: flowSeconds(seconds, extent, tuning.flowType),
      uWarpElapsed: flowSeconds(warpPhase + tuning.startTime, extent, tuning.flowType),
      uZoom: tuning.scale,
      uSpotSize: tuning.spotSize,
      uBend: tuning.distortion,
      uClusterCount: tuning.clusterCount,
      uClusterIntensity: tuning.clusterIntensity,
      uClusterSize: tuning.clusterSize,
      uTwist: (tuning.rotation * Math.PI) / 180,
      uEase: tuning.softness,
      uRelief: tuning.relief,
      uReliefFade: tuning.reliefFade ? 1 : 0,
      uReliefFadeSide: reliefFadeSides[tuning.reliefFadeSide],
      uReliefFadeAmount: tuning.reliefFadeAmount / 100,
      uReliefFadeWidth: tuning.reliefFadeWidth / 100,
      uRefraction: tuning.refraction,
      uRoughness: tuning.roughness,
      uReflection: tuning.reflection,
      uCaustics: tuning.caustics,
      uDispersion: tuning.dispersion,
      uDistribution: tuning.colorDistribution,
      uFleck: tuning.grain,
      uFleckSpan: tuning.grainSize,
      uSalt: tuning.seed,
      uPixelScale: pixelScale,
      uFlowType: flowModes[tuning.flowType],
      uGrainMode: grainModes[tuning.grainMode],
      uPointerActive: tuning.interactive && pointerActive ? 1 : 0,
    };
    const colors = {
      uBase: tuning.baseColor,
      uTintA: tuning.colorA,
      uTintB: tuning.colorB,
      uTintC: tuning.colorC,
    };

    if (
      grainCache &&
      !grainCache.prepare(
        {
          width: canvas.width,
          height: canvas.height,
          pixelRatio: pixelScale,
          size: tuning.grainSize,
          seed: tuning.seed,
          style: scalars.uGrainMode,
        },
        tuning.grain > 0,
      )
    ) {
      // If a resized cache cannot allocate, compute grain in the color pass.
      allowGrainCache = false;
      initialize();
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(spanAttribute);
    gl.vertexAttribPointer(spanAttribute, 2, gl.FLOAT, false, 0, 0);
    if (grainCache) gl.uniform1i(uniforms.uGrainCache, 0);
    gl.uniform2f(uniforms.uSpan, canvas.width, canvas.height);
    for (const name of Object.keys(scalars) as (keyof typeof scalars)[]) {
      gl.uniform1f(uniforms[name], scalars[name]);
    }
    gl.uniform2f(uniforms.uPointer, pointerX, pointerY);
    for (const name of Object.keys(colors) as (keyof typeof colors)[]) {
      gl.uniform3fv(uniforms[name], parseColor(colors[name]));
    }
    if (animation) {
      for (const [name, value] of Object.entries(animation.uniforms())) {
        if (typeof value === 'number') gl.uniform1f(animationUniforms[name], value);
        else gl.uniform4fv(animationUniforms[name], value);
      }
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    host.dataset.flowReady = 'true';

    if (moving && tuning.speed > 0) scheduleFrame();
    else lastTime = 0;
  }

  function measure() {
    if (disposed || unavailable) return;
    const width = host.clientWidth;
    const height = host.clientHeight;
    const maxDimension = Math.min(
      MAX_RENDER_DIMENSION,
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,
      gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    );
    pixelScale = Math.min(
      win.devicePixelRatio || 1,
      MAX_PIXEL_RATIO,
      Math.sqrt(MAX_RENDER_PIXELS / Math.max(width * height, 1)),
      maxDimension / Math.max(width, height, 1),
    );
    const renderWidth = Math.max(1, Math.round(width * pixelScale));
    const renderHeight = Math.max(1, Math.round(height * pixelScale));
    if (canvas.width !== renderWidth) canvas.width = renderWidth;
    if (canvas.height !== renderHeight) canvas.height = renderHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    scheduleFrame();
  }

  function releaseResources() {
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    grainCache?.dispose();
    grainCache = null;
    program = null;
    buffer = null;
  }

  function initialize() {
    const shaders: WebGLShader[] = [];
    let nextProgram: WebGLProgram | null = null;
    let nextBuffer: WebGLBuffer | null = null;
    let nextGrainCache: ReturnType<typeof createGrainCache> = null;
    try {
      nextGrainCache = allowGrainCache ? createGrainCache(gl, streamVertex) : null;
      const defines =
        (gl.getExtension('OES_standard_derivatives') ? '#define USE_GLASS_DERIVATIVES\n' : '') +
        (nextGrainCache ? '#define USE_GRAIN_CACHE\n' : '');
      for (const [type, source] of [
        [gl.VERTEX_SHADER, streamVertex],
        [gl.FRAGMENT_SHADER, defines + (animation?.fragment ?? streamFragment)],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Shader unavailable');
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error('Shader compilation failed');
        }
      }

      nextProgram = gl.createProgram();
      if (!nextProgram) throw new Error('Program unavailable');
      for (const shader of shaders) gl.attachShader(nextProgram, shader);
      gl.linkProgram(nextProgram);
      if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
        throw new Error('Program link failed');
      }

      nextBuffer = gl.createBuffer();
      if (!nextBuffer) throw new Error('Buffer unavailable');
      gl.useProgram(nextProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, nextBuffer);
      // An oversized triangle covers the canvas without an internal diagonal.
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(nextProgram, 'aSpan');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (const name of uniformNames) {
        uniforms[name] = gl.getUniformLocation(nextProgram, name);
      }

      for (const name of animation?.uniformNames ?? []) {
        animationUniforms[name] = gl.getUniformLocation(nextProgram, name);
      }
      releaseResources();
      program = nextProgram;
      buffer = nextBuffer;
      spanAttribute = position;
      grainCache = nextGrainCache;
      unavailable = false;
      measure();
    } catch {
      if (nextProgram) gl.deleteProgram(nextProgram);
      if (nextBuffer) gl.deleteBuffer(nextBuffer);
      nextGrainCache?.dispose();
      releaseResources();
      unavailable = true;
      delete host.dataset.flowReady;
    } finally {
      for (const shader of shaders) gl.deleteShader(shader);
    }
  }

  function onVisibilityChange() {
    stop();
    scheduleFrame();
  }

  function onPointerMove(event: PointerEvent) {
    if (!tuning.interactive) return;
    const bounds = host.getBoundingClientRect();
    pointerX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(bounds.width, 1)));
    pointerY = Math.max(
      0,
      Math.min(1, 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)),
    );
    pointerActive = true;
    scheduleFrame();
  }

  function onPointerLeave() {
    if (!pointerActive) return;
    pointerActive = false;
    scheduleFrame();
  }

  function onContextLost(event: Event) {
    event.preventDefault();
    unavailable = true;
    stop();
    delete host.dataset.flowReady;
  }

  function onContextRestored() {
    if (!disposed) initialize();
  }

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(host);
  const intersectionObserver =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          stop();
          scheduleFrame();
        })
      : null;
  intersectionObserver?.observe(host);

  win.addEventListener('pageshow', onVisibilityChange);
  win.addEventListener('focus', onVisibilityChange);
  // Browser zoom can change DPR while the host retains the same CSS size.
  win.addEventListener('resize', measure);
  doc.addEventListener('visibilitychange', onVisibilityChange);
  motion.addEventListener('change', onVisibilityChange);
  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  initialize();

  return {
    invalidate: scheduleFrame,
    update(next: FlowTuning) {
      const normalized = normalizeFlow(next);
      if (normalized.startTime !== tuning.startTime) phase = warpPhase = 0;
      tuning = normalized;
      if (!tuning.interactive) pointerActive = false;
      colorCache.clear();
      stop();
      scheduleFrame();
    },
    reset() {
      phase = warpPhase = 0;
      stop();
      scheduleFrame();
    },
    dispose() {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      win.removeEventListener('pageshow', onVisibilityChange);
      win.removeEventListener('focus', onVisibilityChange);
      win.removeEventListener('resize', measure);
      doc.removeEventListener('visibilitychange', onVisibilityChange);
      motion.removeEventListener('change', onVisibilityChange);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      releaseResources();
      delete host.dataset.flowReady;
      colorCache.clear();
    },
  };
}

// shared/agent-orb-motion.ts
export const agentOrbStates = [
  'idle',
  'listening',
  'thinking',
  'searching',
  'speaking',
  'success',
  'error',
] as const;

export type AgentOrbState = (typeof agentOrbStates)[number];

export const agentOrbStateLabels: Record<AgentOrbState, string> = {
  idle: 'Ready to talk',
  listening: 'Listening',
  thinking: 'Thinking',
  searching: 'Searching',
  speaking: 'Speaking',
  success: 'Complete',
  error: 'Needs attention',
};

// Speed, rotation, breathing and energy are blended in the render loop.
// State changes retain the material seed and animation clock.
export const agentOrbProfiles: Record<AgentOrbState, readonly number[]> = {
  idle: [0.32, 0.055, 0.75, 0.14],
  listening: [0.75, 0.08, 1.1, 0.38],
  thinking: [1.4, 0.34, 1.75, 0.58],
  searching: [2.1, 0.9, 2.3, 0.8],
  speaking: [1.05, 0.12, 1.5, 0.6],
  success: [0.55, 0.07, 1, 0.42],
  error: [0.16, -0.04, 2.8, 0.24],
};

export function normalizeAudioLevel(level: number) {
  return Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0;
}

// fluid-agent-orb/fluid-agent-orb-search-curve.ts
export function agentBezierEase(t: number, points: readonly [number, number, number, number]) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cubic = (s: number, a: number, b: number) =>
    3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s * s * b + s ** 3;
  let low = 0,
    high = 1;
  // Invert time, rather than treating a Bezier parameter as elapsed time.
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    if (cubic(mid, points[0], points[2]) < t) low = mid;
    else high = mid;
  }
  return cubic((low + high) / 2, points[1], points[3]);
}

export function agentCustomLensPhase(t: number, points: readonly [number, number, number, number]) {
  return 0.5 * (1 + agentBezierEase(t, points) - agentBezierEase(1 - t, points));
}

export function createAgentCustomLensCurve(points: readonly [number, number, number, number]) {
  const count = 256;
  const travel = new Float64Array(count + 1);
  // Build only when a handle changes. The full Bezier controls timing without
  // an independent strength or area modifier. Carry 40% of the average lap
  // speed through flat tails, retaining the easing, duration and loop seam.
  for (let i = 1; i <= count; i++) {
    const time = i / count;
    travel[i] = 0.4 * time + 0.6 * agentCustomLensPhase(time, points);
  }
  return (time: number) => {
    const coordinate = Math.max(0, Math.min(1, time)) * count;
    const index = Math.min(count - 1, Math.floor(coordinate));
    return travel[index] + (travel[index + 1] - travel[index]) * (coordinate - index);
  };
}

// fluid-agent-orb/fluid-agent-orb-model.ts
export const fluidAgentOrbStates = agentOrbStates;

export const fluidAgentOrbStateLabels = agentOrbStateLabels;

export type FluidAgentOrbState = AgentOrbState;

const fluidAgentOrbPalettes = {
  ...fluidGlassGradientPresets,
  honey: { ...fluidGlassGradientPresets.honey, seed: 58 },
  // These palettes preserve the current seed and playback position.
  azure: {
    baseColor: '#3898ff',
    colorA: '#5d027e',
    colorB: '#fff0f0',
    colorC: '#e0d7ea',
  },
  indigo: {
    baseColor: '#386aff',
    colorA: '#69027e',
    colorB: '#fff0f0',
    colorC: '#e9d7ea',
  },
  mint: {
    baseColor: '#38ffbd',
    colorA: '#73008a',
    colorB: '#e5cde5',
    colorC: '#b6ecba',
  },
  coral: {
    baseColor: '#ff6038',
    colorA: '#7e1402',
    colorB: '#fff0f0',
    colorC: '#ecb6b6',
  },
  scarlet: {
    baseColor: '#ff3838',
    colorA: '#7e0202',
    colorB: '#fff0f0',
    colorC: '#e0d7ea',
  },
  fuchsia: {
    baseColor: '#ff38ee',
    colorA: '#69027e',
    colorB: '#fff0f0',
    colorC: '#e9d7ea',
  },
} as const;

export const fluidAgentOrbPresets = Object.fromEntries(
  Object.entries(fluidAgentOrbPalettes).map(([name, palette]) => [
    name,
    {
      ...palette,
      clusterCount:
        name === 'tide' || name === 'monochrome' ? fluidGlassGradientDefaults.clusterCount : 3,
    },
  ]),
) as {
  [Name in keyof typeof fluidAgentOrbPalettes]: (typeof fluidAgentOrbPalettes)[Name] & {
    clusterCount: number;
  };
};

export type FluidAgentOrbPreset = keyof typeof fluidAgentOrbPresets;

export const fluidAgentOrbThinkingAnimations = ['spiral', 'ripples', 'scan'] as const;

export type FluidAgentOrbThinkingAnimation = (typeof fluidAgentOrbThinkingAnimations)[number];

export const fluidAgentOrbThinkingAnimationLabels = {
  spiral: 'Spiral',
  ripples: 'Ripples',
  scan: 'Scan',
} satisfies Record<FluidAgentOrbThinkingAnimation, string>;

export const fluidAgentOrbSearchingAnimations = ['lens', 'small-lens'] as const;

export type FluidAgentOrbSearchingAnimation = (typeof fluidAgentOrbSearchingAnimations)[number];

export const fluidAgentOrbSearchingAnimationLabels = {
  lens: 'Lens',
  'small-lens': 'Small lens',
} satisfies Record<FluidAgentOrbSearchingAnimation, string>;

export type FluidAgentOrbSearchCurve = {
  duration: number;
  easing: 'linear' | 'power2.out' | 'power3.out' | 'power4.out' | 'custom';
  bezier: readonly [number, number, number, number];
  position: number;
};

// Lens timing at the default speed; position uses clock hours (3.5 means 3:30).
export const fluidAgentOrbSearchCurveDefaults: FluidAgentOrbSearchCurve = {
  duration: 2.83,
  easing: 'custom',
  bezier: [0.167, 0.723, 0.448, 0.924],
  position: 1.5,
};

export const fluidAgentOrbDefaults: FluidAgentOrbSettings = {
  ...fluidGlassGradientDefaults,
  ...fluidAgentOrbPresets.monochrome,
  grain: 0.3,
  distortion: 0.8,
  state: 'idle' as AgentOrbState,
  thinkingAnimation: 'ripples' as FluidAgentOrbThinkingAnimation,
  searchingAnimation: 'lens' as FluidAgentOrbSearchingAnimation,
  intensity: 1,
  preserveWhites: true,
  animateEntrance: true,
  shape: 'circle' as const,
  size: 250,
  aspectRatio: 1,
  borderRadius: 24,
};

export type FluidAgentOrbSettings = FlowTuning & {
  state: AgentOrbState;
  thinkingAnimation: FluidAgentOrbThinkingAnimation;
  searchingAnimation: FluidAgentOrbSearchingAnimation;
  intensity: number;
  preserveWhites: boolean;
  animateEntrance: boolean;
  shape: 'circle';
  size: number;
  aspectRatio: number;
  borderRadius: number;
};

export function agentState(value: AgentOrbState | undefined): AgentOrbState {
  return value && agentOrbStates.includes(value) ? value : 'idle';
}

export function agentThinkingAnimation(
  value: FluidAgentOrbThinkingAnimation | undefined,
): FluidAgentOrbThinkingAnimation {
  return value && fluidAgentOrbThinkingAnimations.includes(value)
    ? value
    : fluidAgentOrbDefaults.thinkingAnimation;
}

export function agentSearchingAnimation(
  value: FluidAgentOrbSearchingAnimation | undefined,
): FluidAgentOrbSearchingAnimation {
  return value && fluidAgentOrbSearchingAnimations.includes(value) ? value : 'lens';
}

// fluid-agent-orb/fluid-agent-orb-motion.ts
type AgentInput = {
  state: FluidAgentOrbState;
  thinkingAnimation: FluidAgentOrbThinkingAnimation;
  searchingAnimation: FluidAgentOrbSearchingAnimation;
  searchingCurve?: Partial<FluidAgentOrbSearchCurve>;
  intensity: number;
  preserveWhites?: boolean;
  audioLevel: number;
};

// The native renderer owns the only RAF and all GPU resources. State motion
// updates the motifs, speaking wrinkles and circle transforms. The base
// material settings stay intact.
export function createAgentMotion(read: () => AgentInput) {
  let clock = 0,
    lensOffset = 0,
    lensLap = fluidAgentOrbSearchCurveDefaults.duration * 1.5,
    lensPosition = fluidAgentOrbSearchCurveDefaults.position,
    lensCustomPhase = 0,
    warpOffset = 0,
    wrinkleTime = 0,
    speech = 0,
    audio = 0,
    intensity = 1,
    preserveWhites = 1,
    initialized = false,
    lastScale = '1',
    lastShift = '0px';
  const modes = new Float32Array(7);
  let startTime: number | undefined;
  let reducedMotion: MediaQueryList | undefined;
  const modesA = new Float32Array(4),
    modesB = new Float32Array(4),
    thinkingModes = new Float32Array(4),
    searchingModes = new Float32Array([1, 0, 0, 0]);
  const lensCurve = new Float32Array([lensLap, 1, 2, 6]);
  const lensBezier: [number, number, number, number] = [...fluidAgentOrbSearchCurveDefaults.bezier];
  let sampleCustom: ((time: number) => number) | undefined;
  const bounded = (value: number | undefined, fallback: number, min: number, max: number) =>
    value !== undefined && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  modes[0] = modesA[0] = 1;
  thinkingModes[fluidAgentOrbThinkingAnimations.indexOf(fluidAgentOrbDefaults.thinkingAnimation)] =
    1;
  return {
    reset() {
      clock = audio = warpOffset = wrinkleTime = speech = lensOffset = 0;
      startTime = undefined;
      initialized = false;
    },
    frame(
      base: FlowTuning,
      _now: number,
      moving: boolean,
      deltaSeconds: number,
      host: HTMLElement,
    ): void {
      const input = read();
      const tuning = input.searchingCurve;
      const lap =
        1.5 * bounded(tuning?.duration, fluidAgentOrbSearchCurveDefaults.duration, 0.8, 6);
      // Keep the current orbit phase when its duration is adjusted live.
      if (lap !== lensLap) {
        lensOffset = (clock + lensOffset) * (lap / lensLap) - clock;
        lensLap = lap;
      }
      lensCurve[0] = lap;
      const easing = tuning?.easing ?? fluidAgentOrbSearchCurveDefaults.easing;
      // Custom motion uses the full Bezier with no strength multiplier.
      lensCurve[1] = easing === 'custom' ? 1 : 0.7;
      lensCurve[3] =
        easing === 'custom'
          ? 6
          : easing === 'linear'
            ? 1
            : easing === 'power2.out'
              ? 3
              : easing === 'power4.out'
                ? 5
                : 4;
      lensPosition = bounded(tuning?.position, fluidAgentOrbSearchCurveDefaults.position, 0, 12);
      // Changing Start time restarts the native renderer's elapsed clocks.
      if (startTime !== base.startTime) {
        warpOffset = wrinkleTime = 0;
        startTime = base.startTime;
      }
      const dt = moving ? deltaSeconds : 0;
      clock += dt * base.speed;
      if (easing === 'custom') {
        let changed = false;
        for (let i = 0; i < 4; i++) {
          const value = bounded(
            tuning?.bezier?.[i],
            fluidAgentOrbSearchCurveDefaults.bezier[i],
            0,
            1,
          );
          changed ||= value !== lensBezier[i];
          lensBezier[i] = value;
        }
        if (changed || !sampleCustom) {
          sampleCustom = createAgentCustomLensCurve(lensBezier);
        }
        const phase = ((((clock + lensOffset) / lensLap) % 1) + 1) % 1;
        // Sample cached custom travel once per frame, never per fragment.
        lensCustomPhase = sampleCustom(phase);
      }
      const level = normalizeAudioLevel(input.audioLevel);
      const envelope =
        moving && initialized ? 1 - Math.exp(-dt / (level > audio ? 0.065 : 0.22)) : 1;
      audio += (level - audio) * envelope;
      intensity = Number.isFinite(input.intensity) ? Math.max(0, Math.min(2, input.intensity)) : 1;
      preserveWhites = input.preserveWhites === false ? 0 : 1;
      const selected = fluidAgentOrbStates.indexOf(input.state);
      const blend = moving && initialized ? 1 - Math.exp(-dt / 0.24) : 1;
      for (let i = 0; i < modes.length; i++) {
        const target = i === selected ? 1 : 0;
        modes[i] += (target - modes[i]) * blend;
        if (Math.abs(modes[i] - target) < 0.0001) modes[i] = target;
      }
      const thinking = fluidAgentOrbThinkingAnimations.indexOf(input.thinkingAnimation);
      for (let i = 0; i < 3; i++) {
        const target = i === thinking ? 1 : 0;
        thinkingModes[i] += (target - thinkingModes[i]) * blend;
        if (Math.abs(thinkingModes[i] - target) < 0.0001) thinkingModes[i] = target;
      }
      const searching = fluidAgentOrbSearchingAnimations.indexOf(input.searchingAnimation);
      for (let i = 0; i < 2; i++) {
        const target = i === searching ? 1 : 0;
        searchingModes[i] += (target - searchingModes[i]) * blend;
        if (Math.abs(searchingModes[i] - target) < 0.0001) searchingModes[i] = target;
      }
      modesA.set(modes.subarray(0, 4));
      modesB.set(modes.subarray(4, 7));
      reducedMotion ??= host.ownerDocument.defaultView?.matchMedia(
        '(prefers-reduced-motion: reduce)',
      );
      speech = reducedMotion?.matches ? 0 : audio * intensity * modes[4];
      // Add at most 10% to the native glass pace with voice. Integrating the
      // extra travel preserves its phase between syllables and back in Idle.
      // Local wrinkle fields still renew softly without translating the orb.
      if (base.animateDistortion) {
        warpOffset += dt * base.speed * 0.1 * Math.min(1, speech);
        wrinkleTime = (wrinkleTime + dt * base.speed * 0.4 * speech) % 256;
      }
      // Scale the existing circle in the compositor. Its layout and drawing
      // buffer stay stable, avoiding a resize and grain-cache rebuild per syllable.
      const scale = (1 + Math.min(0.24, 0.16 * intensity) * audio * modes[4]).toFixed(4);
      if (scale !== lastScale) {
        host.style.setProperty('--agent-voice-scale', scale);
        lastScale = scale;
      }
      const shift = `${(-4 * intensity * audio * modes[4]).toFixed(3)}px`;
      if (shift !== lastShift) {
        host.style.setProperty('--agent-voice-shift', shift);
        lastShift = shift;
      }
      initialized = true;
    },
    uniforms() {
      return {
        uAgentModesA: modesA,
        uAgentModesB: modesB,
        uAgentThinkingModes: thinkingModes,
        uAgentSearchingModes: searchingModes,
        uAgentClock: clock,
        uAgentLensCurve: lensCurve,
        uAgentLensOffset: lensOffset,
        uAgentLensPosition: lensPosition,
        uAgentLensCustomPhase: lensCustomPhase,
        uAgentVoice: audio,
        uAgentIntensity: intensity,
        uAgentPreserveWhites: preserveWhites,
        uAgentWarpOffset: warpOffset,
        uAgentWrinkleTime: wrinkleTime,
        uAgentSpeech: speech,
      };
    },
  };
}

// fluid-agent-orb/fluid-agent-orb-patterns.ts
const agentUniforms = `
uniform vec4 uAgentModesA, uAgentModesB, uAgentThinkingModes, uAgentSearchingModes;
uniform vec4 uAgentLensCurve;
uniform float uAgentLensOffset, uAgentLensPosition;
uniform float uAgentLensCustomPhase;
uniform float uAgentClock, uAgentVoice, uAgentIntensity, uAgentWarpOffset, uAgentWrinkleTime, uAgentSpeech, uAgentPreserveWhites;
`;

const agentWhiteSupport = `
float agentWhiteAmount(vec3 pigment) {
  float low=min(pigment.r,min(pigment.g,pigment.b));
  float high=max(pigment.r,max(pigment.g,pigment.b));
  return smoothstep(.91,.935,low)*(1.-smoothstep(.08,.15,high-low));
}
`;

const agentDomain = `
float agentSpeechReliefScale() {
  return 1.+.18*uAgentSpeech;
}
float glassHeight(float field) {
  return nativeGlassHeight(field)*agentSpeechReliefScale();
}
float agentOrganicWeight() {
  // Idle and Speaking keep the native organic folds through every transition.
  return clamp(1.-dot(uAgentModesA.yzw,vec3(1.))-uAgentModesB.y-uAgentModesB.z,0.,1.);
}
vec2 glassPosition(vec2 surface) {
  float organic=agentOrganicWeight();
  if(organic>=1.) return nativeGlassPosition(surface);
  if(organic<=0.) return surface;
  return mix(surface,nativeGlassPosition(surface),organic);
}
`;

const agentRelief = `
vec3 agentSpeechWrinkles(vec2 position) {
  // Positive cubic B-spline weights renew four stationary organic fields.
  // Heights, normals and their temporal velocity stay continuous at renewals;
  // there is no translating domain, turning orbit or reversing phase.
  float t=fract(uAgentWrinkleTime),s=1.-t;
  vec4 weights=vec4(s*s*s,3.*t*t*t-6.*t*t+4.,
    -3.*t*t*t+3.*t*t+3.*t+1.,t*t*t)/6.;
  weights/=sqrt(dot(weights,weights));
  float frequency=1.35*clusterFrequency()/uSpotSize;
  vec2 p=position*frequency+seedPosition(uSalt)+vec2(8.7,-12.3);
  vec3 wrinkles=vec3(0.);
  for(int layer=0;layer<4;layer++) {
    float id=mod(floor(uAgentWrinkleTime)+float(layer)-1.,256.);
    vec2 gradient;
    float height=psrdnoise(p+id*vec2(13.7,19.3),vec2(0.),
      mod(.37*id+uSalt*.1435,fullTurn),gradient);
    wrinkles+=weights[layer]*vec3(height,frequency*gradient);
  }
  return wrinkles;
}
vec3 agentOrganicSample(vec2 position,float time) {
  vec3 sampleValue=nativeReliefSample(position,time);
  if(uAgentSpeech>0. && uBend>0.)
    sampleValue+=.28*uAgentSpeech*smoothstep(0.,1.,uBend)*agentSpeechWrinkles(position);
  return sampleValue;
}
vec3 agentRidge(float distance,vec2 gradient,float sharpness) {
  float ridge=exp(-sharpness*distance*distance);
  return vec3(ridge,-2.*sharpness*distance*ridge*gradient);
}
vec2 agentWave(float phase) {
  // Evaluate each slow spatial wave and its derivative together. This avoids
  // mismatched hardware sin/cos approximations in very shallow glass normals.
  const float pi=3.14159265359;
  float x=phase-2.*pi*floor(phase/(2.*pi)+.5),direction=1.;
  if(x>.5*pi) { x=pi-x; direction=-1.; }
  else if(x<-.5*pi) { x=-pi-x; direction=-1.; }
  float z=x*x;
  float value=x*(1.+z*(-1./6.+z*(1./120.+z*(-1./5040.+z*(1./362880.
    +z*(-1./39916800.+z/6227020800.))))));
  float slope=1.+z*(-.5+z*(1./24.+z*(-1./720.+z*(1./40320.
    +z*(-1./3628800.+z/479001600.)))));
  return vec2(value,direction*slope);
}
vec3 agentCapsule(vec2 p,vec2 start,vec2 end,float sharpness) {
  float halfLength=.5*length(end-start);
  vec2 axis=(end-start)/max(.0001,2.*halfLength);
  vec2 normal=vec2(-axis.y,axis.x),q=p-.5*(start+end);
  float along=dot(q,axis),across=dot(q,normal);
  float a=along-halfLength,b=along+halfLength;
  float ra=sqrt(a*a+.000625),rb=sqrt(b*b+.000625);
  // Smooth distance to the segment keeps curvature continuous at its caps.
  // Analytic normals and the finite-difference fallback see the same surface.
  float cap=.5*(ra+rb)-halfLength,capSlope=.5*(a/ra+b/rb);
  float ridge=exp(-sharpness*(across*across+cap*cap));
  return vec3(ridge,-2.*sharpness*ridge*(across*normal+cap*capSlope*axis));
}
vec3 agentUnion(vec3 a,vec3 b) {
  return vec3(a.x+b.x-a.x*b.x,a.yz*(1.-b.x)+b.yz*(1.-a.x));
}
vec3 agentMark(vec3 shape) {
  return vec3(-.62+1.25*shape.x,1.25*shape.yz);
}
vec3 agentSearchLens(vec2 p,vec2 center,float size) {
  vec2 q=(p-center)/size;
  float radius=sqrt(dot(q,q)+.004);
  vec3 lens=agentRidge(radius-.245,q/radius,210.);
  vec3 handle=agentCapsule(q,vec2(.155,-.155),vec2(.355,-.355),230.);
  vec3 shape=agentMark(agentUnion(lens,handle));
  return vec3(shape.x,shape.yz/size);
}
float agentLensEaseOut(float t) {
  float remaining=1.-t,squared=remaining*remaining;
  if(uAgentLensCurve.w<2.) return t;
  if(uAgentLensCurve.w<3.5) return 1.-remaining*squared;
  if(uAgentLensCurve.w>4.5) return 1.-remaining*squared*squared;
  return 1.-squared*squared;
}
float agentLensOrbitPhase() {
  float lap=uAgentLensCurve.x;
  float t=mod(uAgentClock+uAgentLensOffset,lap)/lap;
  if(uAgentLensCurve.w>5.5) return fullTurn*uAgentLensCustomPhase;
  if(uAgentLensCurve.y<=0. || uAgentLensCurve.w<=1.) return fullTurn*t;
  // Overlap the next power3.out pickup before the current curve reaches its
  // stationary tail. Both quartics use 70% of their range, retaining a gentle
  // slowdown with positive speed and a matching velocity across the seam.
  float extent=max(.001,uAgentLensCurve.y),travel=agentLensEaseOut(extent);
  float outgoing=agentLensEaseOut(extent*t),incoming=agentLensEaseOut(extent*(1.-t));
  float eased=.5*(1.+(outgoing-incoming)/travel);
  // Localize the easing around the slowest pass. Squaring this bell keeps
  // the same minimum speed but narrows the slow arc; speed and acceleration
  // also match at the seam. The next pickup still begins halfway through.
  float window=4.*t*(1.-t);
  float localized=uAgentLensCurve.z<=0.?1.:pow(max(0.,window),uAgentLensCurve.z);
  return fullTurn*mix(t,eased,localized);
}
vec2 agentLensOrbitCenter() {
  const float major=.045,minor=.03,tilt=.125*fullTurn;
  // Convert the clock position to an ellipse parameter, so the slowest pass
  // stays at the selected clock direction after tilting the orbit 45 degrees.
  float direction=(.25-uAgentLensPosition/12.)*fullTurn-tilt;
  float anchor=atan(major*sin(direction),minor*cos(direction));
  float phase=agentLensOrbitPhase()-.5*fullTurn+anchor;
  vec2 orbit=vec2(major*cos(phase),minor*sin(phase));
  float c=cos(tilt-uTwist),s=sin(tilt-uTwist);
  return vec2(-.075,.075)+mat2(c,s,-s,c)*orbit;
}
vec3 agentOrbitSearchLens(vec2 p,vec2 center,float amount) {
  // Deform the glass around the moving lens, never around the orb origin.
  // Its center follows the fixed tilted ellipse even at maximum Distortion.
  vec2 q=p-center;
  float denominator=dot(q,q)+.2;
  float stretch=1.+amount*(1.-.2/denominator);
  vec2 slope=.4*amount*q/(denominator*denominator);
  vec2 dx=vec2(stretch,0.)+q*slope.x;
  vec2 dy=vec2(0.,stretch)+q*slope.y;
  vec3 lens=agentSearchLens(q*stretch,vec2(0.),1.);
  return vec3(lens.x,vec2(dot(lens.yz,dx),dot(lens.yz,dy)));
}
vec2 agentSearchPoint(float index) {
  float point=mod(index,6.);
  if(point<.5) return vec2(-.22,.10);
  if(point<1.5) return vec2(-.02,.18);
  if(point<2.5) return vec2(.16,.10);
  if(point<3.5) return vec2(.14,-.10);
  if(point<4.5) return vec2(-.06,-.18);
  return vec2(-.22,-.06);
}
vec2 agentSmallSearchCenter() {
  float tick=.5*uAgentClock;
  float point=floor(tick),t=fract(tick);
  // A positive pace slows gently at each interval without a stationary tail.
  // Its first two derivatives match across intervals and the loop seam.
  float eased=t*t*t*(10.+t*(-15.+6.*t));
  float u=.55*t+.45*eased,s=1.-u;
  // A rounded C2 path carries the lens through direction changes continuously.
  // Positive spline weights keep the whole route inside the waypoint bounds.
  vec4 weights=vec4(s*s*s,3.*u*u*u-6.*u*u+4.,
    -3.*u*u*u+3.*u*u+3.*u+1.,u*u*u)/6.;
  return weights.x*agentSearchPoint(point-1.)+weights.y*agentSearchPoint(point)
    +weights.z*agentSearchPoint(point+1.)+weights.w*agentSearchPoint(point+2.);
}
// State motifs deform only the glass surface. Their analytic derivatives
// use the native height curve and material, with Relief controlled by uRelief.
vec3 agentFolds(vec2 position) {
  float density=1.85*canvasDensity()*uZoom*(uFlowType<.5?1.75:1.);
  float scale=2.*uZoom/.42/max(.001,density);
  vec2 p=(position-.5*density)*scale;
  vec2 unwarped=p;
  // Symmetric radial deformation keeps marks facing forward. Cross-axis
  // shears would tilt their stems, bars and rows even with Rotation set to 0.
  float amount=.035*uBend/(1.+.15*uBend);
  float denominator=dot(p,p)+.2;
  float stretch=1.+amount*(1.-.2/denominator);
  vec2 stretchSlope=.4*amount*p/(denominator*denominator);
  vec2 dx=vec2(stretch,0.)+p*stretchSlope.x;
  vec2 dy=vec2(0.,stretch)+p*stretchSlope.y;
  p*=stretch;
  vec3 folds=vec3(0.);
  vec3 orbital=vec3(0.);
  if(uAgentModesA.y>0.) {
    // Listening: a microphone receives voice. Its capsule widens with input;
    // the cradle, stem and base are continuous folds in the same glass field.
    float response=uAgentVoice*uAgentIntensity;
    float width=.067+.028*response;
    vec3 microphone=agentCapsule(p,vec2(0.,.015),vec2(0.,.255),1./(width*width));
    vec2 q=p-vec2(0.,.08);
    float radius=sqrt(dot(q,q)+.004);
    vec3 cradle=agentRidge(radius-(.225+.028*response),q/radius,220.);
    float open=1./(1.+exp(clamp(55.*(p.y-.12),-40.,40.)));
    vec2 openSlope=vec2(0.,-55.*open*(1.-open));
    cradle=vec3(cradle.x*open,cradle.yz*open+cradle.x*openSlope);
    microphone=agentUnion(microphone,cradle);
    microphone=agentUnion(microphone,agentCapsule(p,vec2(0.,-.15),vec2(0.,-.31),280.));
    microphone=agentUnion(microphone,agentCapsule(p,vec2(-.13,-.31),vec2(.13,-.31),280.));
    folds+=uAgentModesA.y*agentMark(microphone);
  }
  if(uAgentModesA.z>0.) {
    float r2=dot(p,p),radius=sqrt(r2+.004);
    vec3 thinking=vec3(0.);
    if(uAgentThinkingModes.x>0.) {
      // The original two-arm spiral. Radial spacing breathes slowly while
      // the Cartesian form keeps its center and normals smooth.
      float winding=11.+.7*sin(.3*uAgentClock);
      float phase=winding*radius;
      vec2 phaseSlope=winding*p/radius;
      vec2 sine=agentWave(phase),cosine=agentWave(phase+1.57079632679);
      float a=p.x*p.x-p.y*p.y,b=2.*p.x*p.y;
      float numerator=a*sine.x+b*cosine.x;
      vec2 numeratorSlope=2.*vec2(p.x,-p.y)*sine.x
        +2.*vec2(p.y,p.x)*cosine.x+(a*sine.y+b*cosine.y)*phaseSlope;
      float denominator=r2+.025;
      float spiral=numerator/denominator;
      vec2 spiralSlope=(numeratorSlope-2.*p*spiral)/denominator;
      thinking+=uAgentThinkingModes.x*.68*vec3(spiral,spiralSlope);
    }
    if(uAgentThinkingModes.y>0.) {
      // The former Listening surface: broad concentric waves pass through
      // the glass, with a smooth radial center and a slower Thinking pace.
      vec2 wave=agentWave(17.*radius-.55*uAgentClock);
      thinking+=uAgentThinkingModes.y*.62*vec3(wave.x,wave.y*17.*p/radius);
    }
    if(uAgentThinkingModes.z>0.) {
      // The former Searching surface: curved scan folds flow horizontally.
      // A fixed axis preserves the frontal orientation of the circle.
      vec2 wave=agentWave(15.*p.x+2.*p.y*p.y-.55*uAgentClock);
      thinking+=uAgentThinkingModes.z*.62*vec3(wave.x,wave.y*vec2(15.,4.*p.y));
    }
    folds+=uAgentModesA.z*thinking;
  }
  if(uAgentModesA.w>0.) {
    vec3 searching=vec3(0.);
    if(uAgentSearchingModes.x>0.) {
      orbital=uAgentModesA.w*uAgentSearchingModes.x*
        agentOrbitSearchLens(unwarped,agentLensOrbitCenter(),amount);
    }
    if(uAgentSearchingModes.y>0.)
      searching+=uAgentSearchingModes.y*agentSearchLens(p,agentSmallSearchCenter(),.58);
    folds+=uAgentModesA.w*searching;
  }
  if(uAgentModesB.y>0.) {
    // State marks keep their relief independent of voice Responsiveness.
    // Success: a rounded check, sculpted from two joined glass folds.
    float width=.065+.004*sin(.7*uAgentClock);
    float sharpness=1./(width*width);
    vec3 shortLeg=agentCapsule(p,vec2(-.285,-.015),vec2(-.085,-.205),sharpness);
    vec3 longLeg=agentCapsule(p,vec2(-.085,-.205),vec2(.30,.25),sharpness);
    folds+=uAgentModesB.y*agentMark(agentUnion(shortLeg,longLeg));
  }
  if(uAgentModesB.z>0.) {
    // Error holds a stationary cross after the normal state transition.
    vec3 a=agentCapsule(p,vec2(-.255,-.255),vec2(.255,.255),250.);
    vec3 b=agentCapsule(p,vec2(-.255,.255),vec2(.255,-.255),250.);
    folds+=uAgentModesB.z*agentMark(agentUnion(a,b));
  }
  return vec3(folds.x+orbital.x,scale*(vec2(dot(folds.yz,dx),dot(folds.yz,dy))+orbital.yz));
}
vec3 reliefSample(vec2 position,float time) {
  float weight=agentOrganicWeight();
  if(weight>=1.) return agentOrganicSample(position,time);
  vec3 organic=vec3(0.);
  if(weight>0.) organic=weight*agentOrganicSample(position,time);
  return organic+agentFolds(position);
}
`;

// Keep native optics, height mapping, grain and background sampling unchanged.
// Speaking gently speeds up the native folds and adds renewing local wrinkles.
// The base Relief knob, optical material, color clock and grain stay native.
export const fluidAgentOrbFragment = streamFragment
  .replace('uniform vec2 uSpan;', 'uniform vec2 uSpan;\n' + agentUniforms)
  .replace(
    'float warpTime() { return uWarpElapsed * canvasPace(); }',
    'float warpTime() { return (uWarpElapsed+uAgentWarpOffset)*canvasPace(); }',
  )
  .replace('float glassHeight(float field) {', 'float nativeGlassHeight(float field) {')
  .replace('vec2 glassPosition(vec2 surface) {', 'vec2 nativeGlassPosition(vec2 surface) {')
  .replace(
    'vec3 reliefSample(vec2 position, float time) {',
    agentDomain + '\nvec3 nativeReliefSample(vec2 position, float time) {',
  )
  .replace(
    'float reliefField(vec2 position, float time) {',
    agentRelief + '\nfloat reliefField(vec2 position, float time) {',
  )
  .replace(
    'vec2 heightGradient(vec3 sampleValue) {',
    'vec2 nativeHeightGradient(vec3 sampleValue) {',
  )
  .replace(
    'float heightAt(vec2 surface) {',
    `vec2 heightGradient(vec3 sampleValue) {
      return nativeHeightGradient(sampleValue)*agentSpeechReliefScale();
    }
    float heightAt(vec2 surface) {`,
  )
  .replace(
    'vec3 glassBackdrop(vec2 surface, float time) {',
    agentWhiteSupport + '\nvec4 agentBackdropSample(vec2 surface, float time) {',
  )
  .replace(
    'tint = mix(tint, uTintC, .45 * smoothstep(-.7, .8, wash));',
    `float whiteTint=mix(agentWhiteAmount(uTintA),agentWhiteAmount(uTintB),smoothstep(-.65,.65,pool));
    float accent=.45*smoothstep(-.7,.8,wash)*(1.-uAgentPreserveWhites*whiteTint);
    tint=mix(tint,uTintC,accent);
    whiteTint=mix(whiteTint,agentWhiteAmount(uTintC),accent);`,
  )
  .replace(
    'return mix(uBase, tint, smoothstep(-.75, .15, pool - .4 * uDistribution));',
    `float blend=smoothstep(-.75,.15,pool-.4*uDistribution);
    return vec4(mix(uBase,tint,blend),uAgentPreserveWhites*mix(agentWhiteAmount(uBase),whiteTint,blend));`,
  )
  .replace(
    'environment += vec3(1., .99, .97) * key',
    'environment += mix(vec3(1., .99, .97),vec3(1.),uAgentPreserveWhites) * key',
  )
  .replace(
    'vec3 transmission = glassBackdrop(surface + displacement, flowTime());',
    `vec4 backdrop=agentBackdropSample(surface+displacement,flowTime());
    vec3 transmission=backdrop.rgb,whiteAmount=vec3(backdrop.a);`,
  )
  .replace(
    'vec3 red = glassBackdrop(surface + displacement * (1. + spread), flowTime());',
    `vec4 redSample=agentBackdropSample(surface+displacement*(1.+spread),flowTime());
    vec3 red=redSample.rgb;`,
  )
  .replace(
    'vec3 blue = glassBackdrop(surface + displacement * (1. - spread), flowTime());',
    `vec4 blueSample=agentBackdropSample(surface+displacement*(1.-spread),flowTime());
    vec3 blue=blueSample.rgb;
    whiteAmount=vec3(redSample.a,whiteAmount.g,blueSample.a);`,
  )
  .replace(
    'transmission *= exp(-height * .7 * (vec3(1.) - uTintA));',
    'transmission *= mix(exp(-height*.7*(vec3(1.)-uTintA)),vec3(1.),whiteAmount);',
  )
  .replace(
    'vec3 reflection = glassEnvironment(reflect(incident, normal), normalVariation);',
    `float whiteReflection=dot(whiteAmount,vec3(1./3.));
    vec3 reflection=glassEnvironment(reflect(incident,normal),normalVariation);
    reflection=mix(reflection,vec3(max(reflection.r,max(reflection.g,reflection.b))),whiteReflection);`,
  )
  .replace(
    'color *= .88 + .12 * max(0., sideLight);',
    'color *= mix(vec3(.88+.12*max(0.,sideLight)),vec3(1.),whiteAmount);',
  );

export const fluidAgentOrbUniforms = [
  'uAgentModesA',
  'uAgentModesB',
  'uAgentThinkingModes',
  'uAgentSearchingModes',
  'uAgentClock',
  'uAgentLensCurve',
  'uAgentLensOffset',
  'uAgentLensPosition',
  'uAgentLensCustomPhase',
  'uAgentVoice',
  'uAgentIntensity',
  'uAgentPreserveWhites',
  'uAgentWarpOffset',
  'uAgentWrinkleTime',
  'uAgentSpeech',
] as const;

// fluid-agent-orb/fluid-agent-orb-entrance.ts
/** A single entrance per mount or re-enable, after the first visible GPU frame. */
export function createFluidAgentOrbEntrance(host: HTMLElement) {
  const preference = host.ownerDocument.defaultView!.matchMedia('(prefers-reduced-motion: reduce)');
  const context = gsap.context(() => {}, host);
  let intersection: IntersectionObserver | undefined;
  let changes: MutationObserver | undefined;
  let visible = typeof IntersectionObserver === 'undefined';
  let started = false;
  let disposed = false;
  delete host.dataset.orbEntered;

  const disconnect = () => {
    intersection?.disconnect();
    changes?.disconnect();
    host.ownerDocument.removeEventListener('visibilitychange', reveal);
  };
  const finish = () => {
    if (disposed) return;
    started = true;
    disconnect();
    host.dataset.orbEntered = 'true';
    context.revert();
  };
  function reveal() {
    if (
      disposed ||
      started ||
      !visible ||
      host.dataset.flowReady !== 'true' ||
      host.ownerDocument.visibilityState === 'hidden'
    )
      return;
    started = true;
    disconnect();
    context.add(() => {
      gsap.to(host, {
        '--agent-entrance-scale': 1,
        opacity: 1,
        duration: 1.2,
        delay: 0.15,
        ease: 'power4.out',
        onComplete: finish,
      });
    });
  }
  const onPreferenceChange = () => {
    if (preference.matches) finish();
  };
  if (preference.matches) {
    finish();
  } else {
    context.add(() => {
      // Compose with the voice scale instead of taking over its CSS transforms.
      gsap.set(host, { '--agent-entrance-scale': 0.08, opacity: 0 });
    });
    changes = new MutationObserver(reveal);
    changes.observe(host, { attributes: true, attributeFilter: ['data-flow-ready'] });
    if (!visible) {
      intersection = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? false;
          reveal();
        },
        { threshold: 0.15 },
      );
      intersection.observe(host);
    }
    host.ownerDocument.addEventListener('visibilitychange', reveal);
    preference.addEventListener('change', onPreferenceChange);
    reveal();
  }
  return () => {
    disposed = true;
    disconnect();
    preference.removeEventListener('change', onPreferenceChange);
    context.revert();
    delete host.dataset.orbEntered;
  };
}

// fluid-glass-gradient/fluid-glass-gradient.tsx
export type FluidGlassGradientHandle = {
  readonly element: HTMLDivElement | null;
  reset: () => void;
  invalidate: () => void;
};

export type FluidGlassGradientProps = Partial<FlowTuning> & {
  preset?: FluidGlassGradientPreset;
  /** Optional material animation evaluated inside the existing render loop. */
  onFrame?: FlowFrameObserver;
  materialAnimation?: FlowMaterialAnimation;
  'aria-hidden'?: boolean | 'true' | 'false';
  'data-state'?: string;
  shape?: 'background' | 'circle' | 'rounded' | 'rectangle';
  size?: number;
  aspectRatio?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
};

export const FluidGlassGradient = forwardRef<FluidGlassGradientHandle, FluidGlassGradientProps>(
  function FluidGlassGradient(
    {
      preset,
      onFrame,
      materialAnimation,
      'aria-hidden': hidden,
      'data-state': state,
      shape = 'background',
      size = 480,
      aspectRatio = 1,
      borderRadius = 24,
      className = '',
      style,
      'aria-label': label,
      ...overrides
    },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<ReturnType<typeof createFlowEngine>>(null);
    const frameObserver = useRef(onFrame);
    frameObserver.current = onFrame;
    const tuning = {
      ...fluidGlassGradientDefaults,
      ...(preset ? fluidGlassGradientPresets[preset] : {}),
      ...overrides,
    };
    // Tuning contains only scalar values; equal props should not restart the clock.
    const tuningKey = JSON.stringify(tuning);

    useImperativeHandle(
      ref,
      () => ({
        get element() {
          return hostRef.current;
        },
        reset: () => engineRef.current?.reset(),
        invalidate: () => engineRef.current?.invalidate(),
      }),
      [],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = createFlowEngine(
        canvas,
        tuning,
        onFrame
          ? (base, now, moving, dt, host) => frameObserver.current?.(base, now, moving, dt, host)
          : undefined,
        materialAnimation,
      );
      engineRef.current = engine;
      return () => {
        engine?.dispose();
        engineRef.current = null;
      };
    }, []);

    useEffect(() => {
      engineRef.current?.update(tuning);
    }, [tuningKey]);

    const isBackground = shape === 'background';
    const safeSize = Number.isFinite(size) ? Math.max(40, size) : 480;
    const ratio =
      shape === 'circle'
        ? 1
        : Number.isFinite(aspectRatio)
          ? Math.max(0.2, Math.min(5, aspectRatio))
          : 1;
    const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? Math.max(0, borderRadius) : 0;
    const containerStyle = {
      width: isBackground ? '100%' : `min(100%, ${safeSize}px)`,
      aspectRatio: isBackground ? undefined : ratio,
      borderRadius: radius,
      '--gradient-base': tuning.baseColor,
      '--gradient-a': tuning.colorA,
      '--gradient-b': tuning.colorB,
      '--gradient-c': tuning.colorC,
      ...style,
    } as CSSProperties;

    return (
      <div
        ref={hostRef}
        className={`fluid-glass-gradient ${className}`.trim()}
        data-shape={shape}
        data-state={state}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={hidden ?? (label ? undefined : true)}
        style={containerStyle}
      >
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
    );
  },
);

// fluid-agent-orb/fluid-agent-orb.tsx
const {
  state: _state,
  thinkingAnimation: _thinkingAnimation,
  searchingAnimation: _searchingAnimation,
  intensity: _intensity,
  preserveWhites: _preserveWhites,
  animateEntrance: _animateEntrance,
  ...glassDefaults
} = fluidAgentOrbDefaults;

export type FluidAgentOrbHandle = {
  setAudioLevel: (level: number) => void;
  reset: () => void;
};

export type FluidAgentOrbProps = Omit<
  FluidGlassGradientProps,
  'shape' | 'onFrame' | 'materialAnimation' | 'preset' | 'data-state'
> & {
  shape?: 'circle';
  preset?: FluidAgentOrbPreset;
  state?: FluidAgentOrbState;
  thinkingAnimation?: FluidAgentOrbThinkingAnimation;
  searchingAnimation?: FluidAgentOrbSearchingAnimation;
  /** Customize the searching lens duration, easing and clock position. */
  searchingCurve?: Partial<FluidAgentOrbSearchCurve>;
  /** Strength of voice response in Listening and Speaking, independent of icon relief. */
  intensity?: number;
  preserveWhites?: boolean;
  audioLevel?: number;
  getAudioLevel?: () => number;
  /** Grow from the center with power4.out on mount. Disabled for reduced motion. */
  animateEntrance?: boolean;
};

export const FluidAgentOrb = forwardRef<FluidAgentOrbHandle, FluidAgentOrbProps>(
  function FluidAgentOrb(
    {
      state: requestedState,
      thinkingAnimation: requestedThinkingAnimation,
      searchingAnimation: requestedSearchingAnimation,
      searchingCurve,
      intensity = 1,
      preserveWhites = true,
      audioLevel = 0.55,
      getAudioLevel,
      animateEntrance = fluidAgentOrbDefaults.animateEntrance,
      shape: _shape,
      interactive: _interactive,
      preset,
      className = '',
      'aria-label': label,
      ...props
    },
    ref,
  ) {
    const state = agentState(requestedState);
    const thinkingAnimation = agentThinkingAnimation(requestedThinkingAnimation);
    const searchingAnimation = agentSearchingAnimation(requestedSearchingAnimation);
    const gradient = useRef<FluidGlassGradientHandle>(null);
    const imperative = useRef<number | null>(null);
    const input = useRef({
      state,
      thinkingAnimation,
      searchingAnimation,
      searchingCurve,
      intensity,
      preserveWhites,
      audioLevel,
      getAudioLevel,
    });
    input.current = {
      state,
      thinkingAnimation,
      searchingAnimation,
      searchingCurve,
      intensity,
      preserveWhites,
      audioLevel,
      getAudioLevel,
    };
    const motion = useMemo(
      () =>
        createAgentMotion(() => ({
          state: input.current.state,
          thinkingAnimation: input.current.thinkingAnimation,
          searchingAnimation: input.current.searchingAnimation,
          searchingCurve: input.current.searchingCurve,
          intensity: input.current.intensity,
          preserveWhites: input.current.preserveWhites,
          audioLevel:
            input.current.getAudioLevel?.() ?? imperative.current ?? input.current.audioLevel,
        })),
      [],
    );
    const material = useMemo(
      () => ({
        fragment: fluidAgentOrbFragment,
        uniformNames: fluidAgentOrbUniforms,
        uniforms: motion.uniforms,
      }),
      [motion],
    );
    useImperativeHandle(
      ref,
      () => ({
        setAudioLevel(level) {
          imperative.current = normalizeAudioLevel(level);
          gradient.current?.invalidate();
        },
        reset() {
          motion.reset();
          gradient.current?.reset();
        },
      }),
      [motion],
    );
    useEffect(() => {
      const host = gradient.current?.element;
      if (animateEntrance && host) return createFluidAgentOrbEntrance(host);
    }, [animateEntrance]);
    useEffect(() => {
      imperative.current = null;
      gradient.current?.invalidate();
    }, [audioLevel]);
    useEffect(() => {
      gradient.current?.invalidate();
    }, [
      state,
      thinkingAnimation,
      searchingAnimation,
      searchingCurve,
      intensity,
      preserveWhites,
      getAudioLevel,
    ]);
    return (
      <FluidGlassGradient
        ref={gradient}
        {...glassDefaults}
        {...(preset ? fluidAgentOrbPresets[preset] : {})}
        {...props}
        interactive={false}
        shape="circle"
        className={`fluid-agent-orb${animateEntrance ? ' fluid-agent-orb--entrance' : ''} ${className}`.trim()}
        aria-label={label ?? `AI assistant: ${fluidAgentOrbStateLabels[state]}`}
        data-state={state}
        onFrame={motion.frame}
        materialAnimation={material}
      />
    );
  },
);

// liquid-glass-orb/liquid-glass-orb.tsx
export const LiquidGlassOrb = FluidAgentOrb;

export type LiquidGlassOrbProps = FluidAgentOrbProps;

export type LiquidGlassOrbHandle = FluidAgentOrbHandle;

export type LiquidGlassOrbState = FluidAgentOrbState;

export type LiquidGlassOrbPreset = FluidAgentOrbPreset;

export type LiquidGlassOrbSearchCurve = FluidAgentOrbSearchCurve;

export type LiquidGlassOrbThinkingAnimation = FluidAgentOrbThinkingAnimation;

export type LiquidGlassOrbSearchingAnimation = FluidAgentOrbSearchingAnimation;
