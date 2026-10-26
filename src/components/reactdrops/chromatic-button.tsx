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

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from 'react';
import {
  ChromaticSurface,
  chromaticDefaults,
  type ChromaticMaterialProps,
  type ChromaticHoverEffect,
} from './chromatic-surface';
import './chromatic-button.css';

export const chromaticButtonEntrances = ['blur-up', 'zoom', 'none'] as const;
export type ChromaticButtonEntrance = (typeof chromaticButtonEntrances)[number];

export type ChromaticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ChromaticMaterialProps & {
    /** Circular corner radius as a percentage of the shorter side. Defaults to 50. */
    borderRadius?: number;
    /** Hover or keyboard focus effect. Defaults to brighten with a subtle upward lift. */
    hoverEffect?: ChromaticHoverEffect;
    /** Mount animation. Defaults to a blurred upward reveal. */
    entrance?: ChromaticButtonEntrance;
    /** Entrance playback multiplier. Defaults to 1; higher values are faster. */
    entranceSpeed?: number;
    /** Initial blur in pixels for blur-up. Defaults to 10. */
    entranceBlur?: number;
    /** Upward travel in pixels for blur-up. Defaults to 20. */
    entranceDistance?: number;
    /** Initial zoom scale, from 0.05 to 1. Defaults to 0.65. */
    entranceScale?: number;
  };

export const chromaticButtonDefaults = {
  ...chromaticDefaults,
  feather: 100,
  projectionScale: 174.7,
  intensity: 1.4,
  grain: 0.105,
  borderRadius: 50,
  hoverEffect: 'brighten',
  entrance: 'blur-up',
  entranceSpeed: 1,
  entranceBlur: 10,
  entranceDistance: 20,
  entranceScale: 0.65,
} as const;

/** Keep the projection's tangent scale proportional to the rounded contour's diagonal. */
export function chromaticButtonProjectionScale(scale: number, radius: number, inverse = false) {
  const safeRadius = Math.min(
    50,
    Math.max(0, Number.isFinite(radius) ? radius : chromaticButtonDefaults.borderRadius),
  );
  const extent = (percent: number) => Math.SQRT2 * (1 - percent / 50) + percent / 50;
  const ratio = extent(safeRadius) / extent(chromaticButtonDefaults.borderRadius);
  const angle =
    (Math.min(179.5, Math.max(90, Number.isFinite(scale) ? scale : 174.7)) * Math.PI) / 360;
  return Math.min(
    179.5,
    Math.max(90, (Math.atan(Math.tan(angle) * (inverse ? 1 / ratio : ratio)) * 360) / Math.PI),
  );
}

export const ChromaticButton = forwardRef<HTMLButtonElement, ChromaticButtonProps>(
  function ChromaticButton(
    {
      children = 'Get started',
      className = '',
      type = 'button',
      color = chromaticButtonDefaults.color,
      colorMode,
      color2 = chromaticButtonDefaults.color2,
      color3 = chromaticButtonDefaults.color3,
      fixedColor,
      speed,
      paused,
      phase,
      feather = chromaticButtonDefaults.feather,
      projectionScale = chromaticButtonDefaults.projectionScale,
      intensity = chromaticButtonDefaults.intensity,
      brightnessFloor = chromaticButtonDefaults.brightnessFloor,
      grain = chromaticButtonDefaults.grain,
      borderRadius = chromaticButtonDefaults.borderRadius,
      hoverEffect = chromaticButtonDefaults.hoverEffect,
      entrance = chromaticButtonDefaults.entrance,
      entranceSpeed = chromaticButtonDefaults.entranceSpeed,
      entranceBlur = chromaticButtonDefaults.entranceBlur,
      entranceDistance = chromaticButtonDefaults.entranceDistance,
      entranceScale = chromaticButtonDefaults.entranceScale,
      seed,
      style,
      ...buttonProps
    },
    ref,
  ) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    useImperativeHandle(ref, () => buttonRef.current!, []);
    useEffect(() => {
      const button = buttonRef.current!;
      const resize = () => {
        button.style.setProperty(
          '--chromatic-button-short-side',
          `${Math.min(button.clientWidth, button.clientHeight)}px`,
        );
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(button);
      return () => observer.disconnect();
    }, []);
    useEffect(() => {
      if (hoverEffect !== 'spotlight' || buttonProps.disabled) return;
      const button = buttonRef.current!;
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      const position = [0, 0];
      const velocity = [0, 0];
      const target = [0, 0];
      let frame = 0;
      let previous = 0;
      let pointerOver = false;
      const maxPull = () => Math.min(10, Math.min(button.clientWidth, button.clientHeight) * 0.18);
      const reset = () => {
        cancelAnimationFrame(frame);
        frame = previous = 0;
        position.fill(0);
        velocity.fill(0);
        target.fill(0);
        button.style.removeProperty('--chromatic-pointer-transform');
      };
      const tick = (now: number) => {
        frame = 0;
        if (motion.matches || button.disabled || document.hidden) {
          reset();
          return;
        }
        const delta = previous ? Math.min((now - previous) / 1000, 1 / 30) : 1 / 60;
        previous = now;
        // Small integration steps keep the underdamped spring stable on slow frames.
        const steps = Math.max(1, Math.ceil(delta * 120));
        const step = delta / steps;
        for (let i = 0; i < steps; i++) {
          for (let axis = 0; axis < 2; axis++) {
            velocity[axis] += ((target[axis] - position[axis]) * 220 - velocity[axis] * 16) * step;
            position[axis] += velocity[axis] * step;
          }
        }
        const settled = position.every(
          (value, axis) => Math.abs(value - target[axis]) < 0.01 && Math.abs(velocity[axis]) < 0.05,
        );
        if (settled) {
          position.splice(0, 2, ...target);
          velocity.fill(0);
          if (target.every((value) => value === 0)) {
            reset();
            return;
          }
        }
        const stretch = Math.max(
          -1,
          Math.min(1, (Math.abs(position[0]) - Math.abs(position[1])) / Math.max(1, maxPull())),
        );
        button.style.setProperty(
          '--chromatic-pointer-transform',
          `translate(${position[0]}px, ${position[1]}px) scale(${1 + stretch * 0.025}, ${1 - stretch * 0.025})`,
        );
        if (!settled) frame = requestAnimationFrame(tick);
        else previous = 0;
      };
      const wake = () => {
        if (!frame) frame = requestAnimationFrame(tick);
      };
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType !== 'touch' && !motion.matches) pointerOver = true;
      };
      const onMove = (event: PointerEvent) => {
        if (!pointerOver || event.pointerType === 'touch' || motion.matches || button.disabled)
          return;
        const rect = button.getBoundingClientRect();
        // Remove our own translation from the moving box to avoid cursor feedback.
        const center = [
          rect.left + rect.width / 2 - position[0],
          rect.top + rect.height / 2 - position[1],
        ];
        target[0] =
          Math.max(
            -1,
            Math.min(1, (event.clientX - center[0]) / Math.max(1, button.clientWidth / 2)),
          ) * maxPull();
        target[1] =
          Math.max(
            -1,
            Math.min(1, (event.clientY - center[1]) / Math.max(1, button.clientHeight / 2)),
          ) * maxPull();
        wake();
      };
      const onLeave = () => {
        pointerOver = false;
        target.fill(0);
        wake();
      };
      const onMotionChange = () => {
        pointerOver = false;
        reset();
      };
      const onVisibilityChange = () => {
        if (document.hidden) onMotionChange();
      };
      button.addEventListener('pointerenter', onEnter);
      button.addEventListener('pointermove', onMove);
      button.addEventListener('pointerleave', onLeave);
      button.addEventListener('pointercancel', onLeave);
      motion.addEventListener('change', onMotionChange);
      document.addEventListener('visibilitychange', onVisibilityChange);
      return () => {
        reset();
        button.removeEventListener('pointerenter', onEnter);
        button.removeEventListener('pointermove', onMove);
        button.removeEventListener('pointerleave', onLeave);
        button.removeEventListener('pointercancel', onLeave);
        motion.removeEventListener('change', onMotionChange);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }, [hoverEffect, buttonProps.disabled]);
    const radius = Math.min(
      50,
      Math.max(
        0,
        Number.isFinite(borderRadius) ? borderRadius : chromaticButtonDefaults.borderRadius,
      ),
    );
    const projectedScale = chromaticButtonProjectionScale(projectionScale, radius);
    const entranceValue = (value: number, fallback: number, min: number, max: number) =>
      Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));
    return (
      <button
        {...buttonProps}
        ref={buttonRef}
        type={type}
        data-hover-effect={hoverEffect}
        data-entrance={entrance}
        className={`chromatic-button ${className}`.trim()}
        style={
          {
            '--chromatic-button-color': color,
            '--chromatic-button-radius': radius / 100,
            '--chromatic-entrance-speed': entranceValue(entranceSpeed, 1, 0.1, 4),
            '--chromatic-entrance-blur': `${entranceValue(entranceBlur, 10, 0, 40)}px`,
            '--chromatic-entrance-distance': `${entranceValue(entranceDistance, 20, 0, 120)}px`,
            '--chromatic-entrance-scale': entranceValue(entranceScale, 0.65, 0.05, 1),
            ...style,
          } as CSSProperties
        }
      >
        <ChromaticSurface
          {...{
            color,
            colorMode,
            color2,
            color3,
            fixedColor,
            speed,
            paused,
            phase,
            feather,
            projectionScale: projectedScale,
            borderRadius: radius,
            hoverEffect,
            // Keep the face's gradient motion from the material's original
            // projection; only the rim reflections use the wider button default.
            centerProjectionScale:
              projectedScale -
              (chromaticButtonDefaults.projectionScale - chromaticDefaults.projectionScale),
            intensity,
            brightnessFloor,
            grain,
            seed,
          }}
        />
        <span className="chromatic-button-content">{children}</span>
      </button>
    );
  },
);
