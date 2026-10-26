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

/** Static photographic grain: jittered Gaussian motes at a physical CSS-pixel
 * scale. Cache at the drawing-buffer resolution, never at the animation phase.
 */
const fragment = `#version 300 es
precision highp float;
uniform float uSeed, uPixelRatio;
out vec4 color;
vec4 randomMote(vec2 p) {
  vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)+uSeed*.013);
  q+=dot(q,q.yzx+33.33);
  return fract(vec4((q.x+q.y)*q.z,(q.x+q.z)*q.y,(q.y+q.z)*q.x,q.x*q.y*q.z)*vec4(1.,1.13,1.37,1.71));
}
void main() {
  const float spacing=1.15;
  vec2 pixels=gl_FragCoord.xy/uPixelRatio, home=floor(pixels/spacing);
  float exposure=0.;
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++) {
    vec2 cell=home+vec2(x,y);
    vec4 r=randomMote(cell);
    vec2 offset=pixels-(cell+r.xy)*spacing;
    float angle=r.w*6.2831853;
    vec2 local=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*offset;
    vec2 radius=mix(vec2(.22,.27),vec2(.31,.40),r.zw);
    // Integrate approximately over a device pixel rather than enlarging noise
    // texels. Conserved energy gives soft footprints at both DPR 1 and 2.
    vec2 filtered=sqrt(radius*radius+vec2(1./(12.*uPixelRatio*uPixelRatio)));
    float energy=(radius.x*radius.y)/(filtered.x*filtered.y);
    vec2 distance=local/filtered;
    float peak=.3+.65*r.z;
    exposure+=exp(-.5*dot(distance,distance))*peak*energy;
  }
  float grain=1.-exp(-2.2*exposure);
  color=vec4(grain,0.,0.,1.);
}`;

export function createTopographicGrain(
  gl: WebGL2RenderingContext,
  vertex: string,
  buffer: WebGLBuffer,
) {
  const program = gl.createProgram(),
    texture = gl.createTexture(),
    target = gl.createFramebuffer();
  const shaders: WebGLShader[] = [];
  let cachedWidth: number | undefined,
    cachedHeight: number | undefined,
    cachedRatio: number | undefined,
    cachedSeed: number | undefined;
  const destroy = () => {
    for (const shader of shaders) gl.deleteShader(shader);
    gl.deleteProgram(program);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(target);
  };
  try {
    if (!program || !texture || !target) throw new Error('Grain cache unavailable');
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Grain shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) ?? 'Grain compilation failed');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? 'Grain linking failed');
    const seedLocation = gl.getUniformLocation(program, 'uSeed'),
      ratioLocation = gl.getUniformLocation(program, 'uPixelRatio');
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, null);
    return {
      prepare(width: number, height: number, ratio: number, seed: number, enabled: boolean) {
        if (
          !enabled ||
          (cachedWidth === width &&
            cachedHeight === height &&
            Object.is(cachedRatio, ratio) &&
            Object.is(cachedSeed, seed))
        )
          return;
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          throw new Error('Grain framebuffer unavailable');
        }
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.viewport(0, 0, width, height);
        gl.uniform1f(seedLocation, seed);
        gl.uniform1f(ratioLocation, ratio);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        cachedWidth = width;
        cachedHeight = height;
        cachedRatio = ratio;
        cachedSeed = seed;
      },
      destroy,
    };
  } catch (error) {
    destroy();
    throw error;
  }
}

/** The Canvas fallback also caches soft white motes without a tiled asset. */
export function createCanvasGrain(width: number, height: number, ratio: number, seed: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const image = ctx.createImageData(canvas.width, canvas.height);
  const exposure = new Float32Array(canvas.width * canvas.height);
  let state = (Math.round(seed) ^ 0x9e3779b9) >>> 0;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const xWeights = new Float32Array(16);
  for (let y = 0; y < height; y += 1.15)
    for (let x = 0; x < width; x += 1.15) {
      const cx = (x + random() * 1.15) * ratio,
        cy = (y + random() * 1.15) * ratio,
        rx = (0.22 + 0.09 * random()) * ratio,
        ry = (0.27 + 0.13 * random()) * ratio;
      const sx = Math.sqrt(rx * rx + 1 / 12),
        sy = Math.sqrt(ry * ry + 1 / 12),
        peak = ((0.3 + 0.65 * random()) * rx * ry) / (sx * sy);
      const left = Math.max(0, Math.floor(cx - 3 * sx)),
        right = Math.min(canvas.width - 1, Math.ceil(cx + 3 * sx)),
        top = Math.max(0, Math.floor(cy - 3 * sy)),
        bottom = Math.min(canvas.height - 1, Math.ceil(cy + 3 * sy));
      for (let px = left; px <= right; px++) {
        const distance = (px + 0.5 - cx) / sx;
        xWeights[px - left] = Math.exp(-0.5 * distance * distance);
      }
      for (let py = top; py <= bottom; py++) {
        const distance = (py + 0.5 - cy) / sy,
          weight = peak * Math.exp(-0.5 * distance * distance);
        for (let px = left; px <= right; px++)
          exposure[py * canvas.width + px] += weight * xWeights[px - left];
      }
    }
  for (let i = 0; i < exposure.length; i++) {
    image.data[i * 4] = image.data[i * 4 + 1] = image.data[i * 4 + 2] = 255;
    image.data[i * 4 + 3] = Math.round(255 * (1 - Math.exp(-2.2 * exposure[i])));
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}
