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
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  topographicDefaults,
  topographicPresets,
  type TopographicPreset,
  type TopographicLineStyle,
  type TopographicGradientColors,
  type TopographicHoverEffect,
} from './topographic-presets';
import {
  createTopographicRenderer,
  type TopographicConfig,
  type TopographicReliefProperties,
} from './topographic-renderer';
import './topographic-flow.css';

export type TopographicFlowHandle = { reset: () => void };
export type TopographicFlowProps = Partial<Omit<TopographicConfig, TopographicReliefProperties>> & {
  /** Fade in the first complete frame. Disable for an immediate entrance. */
  animateEntrance?: boolean;
  preset?: TopographicPreset;
  backgroundColor?: string;
  backgroundImage?: CSSProperties['backgroundImage'];
  /** Dense, static photographic grain across the gradient and contours. */
  grain?: number;
  height?: number | string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const TopographicFlow = forwardRef<TopographicFlowHandle, TopographicFlowProps>(
  function TopographicFlow(
    {
      animateEntrance = topographicDefaults.animateEntrance,
      preset = 'paper',
      backgroundColor,
      backgroundImage,
      gradientColors,
      gradientDiffusion,
      grain,
      height,
      children,
      className = '',
      style,
      scale,
      density,
      speed,
      distortion,
      lineWidth,
      opacity,
      dashLength,
      dashGap,
      seed,
      paused,
      lineColor,
      accentColor,
      lineStyle,
      hover,
      hoverRadius,
      hoverFollow,
      hoverFade,
      hoverEffect,
    },
    ref,
  ) {
    const host = useRef<HTMLDivElement>(null),
      canvas = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);
    const renderer = useRef<ReturnType<typeof createTopographicRenderer> | null>(null);
    const palette = topographicPresets[preset] ?? topographicPresets.paper;
    const customImage = style?.backgroundImage ?? backgroundImage;
    const gradient = customImage ?? palette.backgroundImage;
    const colors =
      customImage === 'none'
        ? topographicPresets.paper.gradientColors
        : (gradientColors ??
          (customImage === undefined || customImage === palette.backgroundImage
            ? palette.gradientColors
            : topographicPresets.paper.gradientColors));
    const grainAmount = Math.max(
      0,
      Math.min(
        1,
        Number.isFinite(grain ?? palette.grain) ? (grain ?? palette.grain) : palette.grain,
      ),
    );
    const textured = (colors.length >= 2 || gradient !== 'none') && grainAmount > 0;
    const config = useMemo<TopographicConfig>(
      () => ({
        scale: scale ?? palette.scale,
        density: density ?? palette.density,
        speed: speed ?? topographicDefaults.speed,
        distortion: distortion ?? topographicDefaults.distortion,
        lineWidth: lineWidth ?? palette.lineWidth,
        opacity: opacity ?? palette.opacity,
        dashLength: dashLength ?? topographicDefaults.dashLength,
        dashGap: dashGap ?? topographicDefaults.dashGap,
        seed: seed ?? topographicDefaults.seed,
        paused: paused ?? false,
        lineColor:
          lineColor ?? (preset === 'paper' ? 'var(--topographic-flow-ink)' : palette.lineColor),
        accentColor:
          accentColor ?? (preset === 'paper' ? 'var(--topographic-flow-ink)' : palette.accentColor),
        lineStyle: lineStyle ?? palette.lineStyle,
        hover: hover ?? topographicDefaults.hover,
        hoverRadius: hoverRadius ?? topographicDefaults.hoverRadius,
        hoverFollow: hoverFollow ?? topographicDefaults.hoverFollow,
        hoverFade: hoverFade ?? topographicDefaults.hoverFade,
        hoverEffect: hoverEffect ?? palette.hoverEffect,
        grain: textured ? grainAmount : 0,
        gradientColors: colors,
        gradientDiffusion: gradientDiffusion ?? palette.gradientDiffusion,
        backgroundColor:
          style?.backgroundColor ??
          backgroundColor ??
          (preset === 'paper' ? 'var(--topographic-flow-background)' : palette.backgroundColor),
      }),
      [
        palette,
        preset,
        textured,
        grainAmount,
        colors,
        gradientDiffusion,
        backgroundColor,
        style?.backgroundColor,
        scale,
        density,
        speed,
        distortion,
        lineWidth,
        opacity,
        dashLength,
        dashGap,
        seed,
        paused,
        lineColor,
        accentColor,
        lineStyle,
        hover,
        hoverRadius,
        hoverFollow,
        hoverFade,
        hoverEffect,
      ],
    );
    const latest = useRef(config);
    latest.current = config;
    useImperativeHandle(ref, () => ({ reset: () => renderer.current?.reset() }), []);
    useEffect(() => {
      if (!canvas.current || !host.current) return;
      const instance = createTopographicRenderer(
        canvas.current,
        host.current,
        latest.current,
        undefined,
        () => setReady(true),
      );
      renderer.current = instance;
      return () => {
        instance.destroy();
        renderer.current = null;
      };
    }, [createTopographicRenderer]);
    useEffect(() => renderer.current?.update(config), [config]);
    useEffect(() => {
      const syncTheme = () => renderer.current?.update(latest.current);
      const observer = new MutationObserver(syncTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class'],
      });
      const media = matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', syncTheme);
      return () => {
        observer.disconnect();
        media.removeEventListener('change', syncTheme);
      };
    }, []);
    return (
      <div
        ref={host}
        data-ready={ready}
        data-animate-entrance={animateEntrance}
        className={`topographic-flow ${className}`}
        style={{
          height,
          backgroundColor:
            backgroundColor ??
            (preset === 'paper' ? 'var(--topographic-flow-background)' : palette.backgroundColor),
          backgroundImage: backgroundImage ?? palette.backgroundImage,
          ...style,
        }}
      >
        <canvas ref={canvas} className="topographic-flow-canvas" aria-hidden="true" />
        {children && <div className="topographic-flow-content">{children}</div>}
      </div>
    );
  },
);

export { topographicDefaults, topographicPresets };
export type {
  TopographicPreset,
  TopographicLineStyle,
  TopographicGradientColors,
  TopographicHoverEffect,
};
