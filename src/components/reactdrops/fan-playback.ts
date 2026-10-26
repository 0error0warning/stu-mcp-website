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

import { createViewportPlayback, type ViewportPlayback } from './viewport-playback';
import {
  createFanMotion,
  type FanCardElement,
  type FanLayoutInfo,
  type FanMotionOptions,
} from './fan-motion';
import { fanSettleTime } from './fan-motion';

export type FanAction = 'play' | 'reset' | 'finish';
export type FanTrigger = 'auto' | 'scroll' | 'manual' | 'hover';
export interface FanPlaybackOptions extends FanMotionOptions {
  trigger: FanTrigger;
  viewportStart: number;
  viewportStartUp?: number;
  once: boolean;
}
export interface FanPlayback {
  dispatch: (action: FanAction) => void;
  /** Focus a card (keyboard, taps); -1 clears the focus field. */
  activate: (index: number) => void;
  /** Focus the card under the pointer (stable slots, within the cards' band). */
  point: (clientX: number, clientY: number) => void;
  /** Apply new geometry and timing in place, without restarting anything. */
  update: (options: FanPlaybackOptions) => void;
  destroy: () => void;
}

/** Coordinate playback, input and observers without owning React or DOM transforms. */
export function createFanPlayback(
  element: HTMLElement,
  stage: HTMLDivElement,
  cards: FanCardElement[],
  initial: FanPlaybackOptions,
  pending: { current: FanAction | null },
  onLayout?: (info: FanLayoutInfo) => void,
): FanPlayback {
  let options = initial;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = createFanMotion(
    { stage, cards, heading: element.querySelector<HTMLElement>('.fan-gallery-heading') },
    options,
    reduced,
    onLayout,
  );
  let state: 'idle' | 'playing' | 'finished' = 'idle';
  let played = false;
  let ready = false;
  let disposed = false;
  let viewport: ViewportPlayback | undefined;

  const setState = (next: typeof state) => {
    element.dataset.state = state = next;
  };
  const finish = () => {
    motion.cancel();
    motion.finish();
    setState('finished');
  };
  const reset = () => {
    if (reduced.matches) {
      finish();
      return;
    }
    motion.cancel();
    motion.reset();
    setState('idle');
  };
  const play = () => {
    if (disposed) return;
    played = true;
    viewport?.markPlayed();
    if (reduced.matches || fanSettleTime(options.speed, options.bounce) <= 0) {
      finish();
      return;
    }
    motion.cancel();
    setState('playing');
    motion.play(() => setState('finished'));
  };
  // Focus responds at any time, also while cards are arriving.
  const activate = (index: number) => {
    if (state === 'idle') return;
    motion.focusCard(index < 0 ? null : index);
  };
  const point = (clientX: number, clientY: number) => {
    if (state === 'idle') return;
    motion.focusPoint(clientX, clientY);
  };
  const update = (next: FanPlaybackOptions) => {
    options = next;
    motion.update(next);
  };
  const dispatch = (action: FanAction) => {
    if (!ready) {
      pending.current = action;
      return;
    }
    pending.current = null;
    if (action === 'play') play();
    else if (action === 'reset') reset();
    else finish();
  };
  const measure = () => {
    // Poses are recomputed from the new layout, even mid-entrance.
    if (!motion.measure()) return;
    element.dataset.ready = 'true';
  };
  measure();
  let resizeFrame: number | undefined;
  const resize = new ResizeObserver(() => {
    if (resizeFrame !== undefined) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = undefined;
      if (!disposed) measure();
    });
  });
  resize.observe(stage);

  const onHover = () => {
    if (options.trigger === 'hover' && state !== 'playing') play();
  };
  const onFocus = (event: FocusEvent) => {
    if (!event.relatedTarget || !element.contains(event.relatedTarget as Node)) onHover();
  };
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') onHover();
  };
  const onMotionChange = () => {
    if (reduced.matches) finish();
  };
  element.addEventListener('pointerenter', onHover);
  element.addEventListener('focusin', onFocus);
  element.addEventListener('pointerdown', onPointer);
  reduced.addEventListener('change', onMotionChange);

  // A queued ref action survives StrictMode's discarded first effect.
  Promise.resolve().then(() => {
    if (disposed) return;
    ready = true;
    if (pending.current) dispatch(pending.current);
    else if (reduced.matches) finish();
    else if (options.trigger === 'auto') play();
    else reset();
    if (options.trigger === 'scroll') {
      viewport = createViewportPlayback(element, {
        viewportStart: options.viewportStart,
        viewportStartUp: options.viewportStartUp,
        once: options.once,
        played,
        play,
        reset,
        finish,
        isPlaying: () => state === 'playing',
      });
    }
  });
  const destroy = () => {
    disposed = true;
    viewport?.disconnect();
    resize.disconnect();
    if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
    reduced.removeEventListener('change', onMotionChange);
    element.removeEventListener('pointerenter', onHover);
    element.removeEventListener('focusin', onFocus);
    element.removeEventListener('pointerdown', onPointer);
    motion.destroy();
    delete element.dataset.state;
    delete element.dataset.ready;
  };
  return { dispatch, activate, point, update, destroy };
}
