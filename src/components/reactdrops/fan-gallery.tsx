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
import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { fanDefaults, type FanEntrance, type FanOptions } from './fan-layout';
import { createFanPlayback, type FanPlayback, type FanAction } from './fan-playback';
import type { FanLayoutInfo } from './fan-motion';
import './fan-gallery.css';

export interface FanGalleryItem {
  src: string;
  alt: string;
  href?: string;
}
export interface FanGalleryProps extends Partial<FanOptions> {
  items: FanGalleryItem[];
  /**
   * How cards arrive: a closed stack opening like a swatch book (stack),
   * thrown from a deck (deal), rising from below (rise), flipped in place
   * (flip), swept one by one along an arc (circular) or carried as a closed
   * deck that unfolds on arrival (deck).
   */
  entrance?: FanEntrance;
  /** Card corner radius in pixels. */
  radius?: number;
  /** Seconds for one card to settle into the fan. */
  speed?: number;
  /** Seconds between successive cards. */
  stagger?: number;
  /** Entrance overshoot from 0 (soft) to 1 (springy). */
  bounce?: number;
  /** Seconds for the focus to glide to the pointed card. */
  hoverSpeed?: number;
  trigger?: 'auto' | 'scroll' | 'manual' | 'hover';
  /** Entry line from either viewport edge: 75 means 75% downward / 25% upward. */
  viewportStart?: number;
  /** Upward entry line measured from the top; omitted means 100 - viewportStart. */
  viewportStartUp?: number;
  once?: boolean;
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  /** Accessible name of the gallery region. */
  ariaLabel?: string;
  /** Reports the spacing and card scale actually used to fit the container. */
  onLayout?: (info: FanLayoutInfo) => void;
  className?: string;
  style?: CSSProperties;
}
export interface FanGalleryHandle {
  play: () => void;
  reset: () => void;
  finish: () => void;
  replay: () => void;
}
export const fanMotionDefaults = {
  entrance: 'stack' as FanEntrance,
  radius: 18,
  speed: 0.7,
  stagger: 0.09,
  bounce: 0.35,
  hoverSpeed: 0.28,
};

export const FanGallery = forwardRef<FanGalleryHandle, FanGalleryProps>(function FanGallery(
  {
    items,
    entrance = fanMotionDefaults.entrance,
    cardWidth = fanDefaults.cardWidth,
    aspectRatio = fanDefaults.aspectRatio,
    spacing = fanDefaults.spacing,
    curve = fanDefaults.curve,
    tilt = fanDefaults.tilt,
    lift = fanDefaults.lift,
    spread = fanDefaults.spread,
    stackFrom = fanDefaults.stackFrom,
    radius = fanMotionDefaults.radius,
    speed = fanMotionDefaults.speed,
    stagger = fanMotionDefaults.stagger,
    bounce = fanMotionDefaults.bounce,
    hoverSpeed = fanMotionDefaults.hoverSpeed,
    title = '',
    subtitle = '',
    showTitle = false,
    trigger = 'scroll',
    viewportStart = 75,
    viewportStartUp,
    once = true,
    ariaLabel = 'Fan gallery',
    onLayout,
    className = '',
    style,
  },
  ref,
) {
  const root = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const playback = useRef<FanPlayback | null>(null);
  const pending = useRef<FanAction | null>(null);
  useImperativeHandle(ref, () => {
    const dispatch = (action: FanAction) => {
      pending.current = action;
      playback.current?.dispatch(action);
    };
    return {
      play: () => dispatch('play'),
      reset: () => dispatch('reset'),
      finish: () => dispatch('finish'),
      replay: () => dispatch('play'),
    };
  }, []);
  const motionOptions = {
    entrance,
    cardWidth,
    aspectRatio,
    spacing,
    curve,
    tilt,
    lift,
    spread,
    stackFrom,
    radius,
    speed,
    stagger,
    bounce,
    hoverSpeed,
    trigger,
    viewportStart,
    viewportStartUp,
    once,
  };
  const latest = useRef(motionOptions);
  latest.current = motionOptions;
  const layoutCallback = useRef(onLayout);
  layoutCallback.current = onLayout;
  // The controller holds the card nodes, so it is recreated whenever a card
  // element is replaced (a new count, or a card switching between button and
  // link), and when the trigger or heading change; every other prop updates
  // it in place without restarting anything.
  const cardKinds = items.map((item) => (item.href ? 'a' : 'b')).join('');
  useEffect(() => {
    const element = root.current,
      field = stage.current;
    if (!element || !field || !items.length) return;
    const nodes = cards.current
      .slice(0, items.length)
      .filter((node): node is HTMLButtonElement | HTMLAnchorElement => !!node);
    const controller = createFanPlayback(element, field, nodes, latest.current, pending, (info) =>
      layoutCallback.current?.(info),
    );
    playback.current = controller;
    return () => {
      controller.destroy();
      playback.current = null;
    };
  }, [cardKinds, showTitle, title, subtitle, trigger, viewportStart, viewportStartUp, once]);
  const optionsKey = JSON.stringify(motionOptions);
  const appliedKey = useRef(optionsKey);
  useEffect(() => {
    if (appliedKey.current === optionsKey) return;
    appliedKey.current = optionsKey;
    playback.current?.update(latest.current);
  }, [optionsKey]);
  return (
    <section
      ref={root}
      className={`fan-gallery ${className}`}
      style={style}
      aria-label={ariaLabel}
    >
      {showTitle && (title || subtitle) && (
        <header className="fan-gallery-heading">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      <div
        ref={stage}
        className="fan-gallery-stage"
        onPointerMove={(event) => {
          if (event.pointerType === 'touch') return;
          playback.current?.point(event.clientX, event.clientY);
        }}
        onPointerLeave={() => {
          const focused = cards.current.findIndex((node) => node === document.activeElement);
          playback.current?.activate(focused);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            playback.current?.activate(-1);
        }}
      >
        {items.map((item, i) => {
          const props = {
            className: 'fan-gallery-card',
            ref: (node: HTMLButtonElement | HTMLAnchorElement | null) => {
              cards.current[i] = node;
            },
            'aria-label': item.alt || `Image ${i + 1}`,
            onFocus: () => playback.current?.activate(i),
            onKeyDown: (event: React.KeyboardEvent) => {
              const next =
                event.key === 'ArrowRight'
                  ? (i + 1) % items.length
                  : event.key === 'ArrowLeft'
                    ? (i - 1 + items.length) % items.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? items.length - 1
                        : -1;
              if (next >= 0) {
                event.preventDefault();
                cards.current[next]?.focus({ preventScroll: true });
              }
              if (event.key === 'Escape') {
                playback.current?.activate(-1);
                event.currentTarget instanceof HTMLElement && event.currentTarget.blur();
              }
            },
          };
          const image = (
            <img src={item.src} alt={item.alt} draggable={false} loading="lazy" decoding="async" />
          );
          return item.href ? (
            <a key={i} {...props} href={item.href}>
              {image}
            </a>
          ) : (
            <button key={i} {...props} type="button" onClick={() => playback.current?.activate(i)}>
              {image}
            </button>
          );
        })}
      </div>
    </section>
  );
});
