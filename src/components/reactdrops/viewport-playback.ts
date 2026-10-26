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

export type ViewportEntrySide = 'above' | 'below' | null;
export type ViewportPlayback = {
  disconnect: () => void;
  markPlayed: () => void;
  getEntrySide: () => ViewportEntrySide;
};

/** IntersectionObserver also clips against ancestor scrollports, not just its root. */
function verticalVisibleBounds(element: HTMLElement, rootBounds: DOMRectReadOnly | null) {
  let top = rootBounds?.top ?? 0;
  let bottom = rootBounds?.bottom ?? innerHeight;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (!/^(auto|scroll|hidden|clip)$/.test(getComputedStyle(parent).overflowY)) continue;
    const bounds = parent.getBoundingClientRect();
    const scale = parent.offsetHeight ? bounds.height / parent.offsetHeight : 1;
    const clipTop = bounds.top + parent.clientTop * scale;
    top = Math.max(top, clipTop);
    bottom = Math.min(bottom, clipTop + parent.clientHeight * scale);
  }
  return { top, bottom };
}

/** Directional entry lines, with reset only outside the full viewport. */
export function createViewportPlayback(
  element: HTMLElement,
  {
    viewportStart = 85,
    viewportStartUp,
    once = true,
    played: initiallyPlayed = false,
    play,
    reset,
    finish,
    isPlaying = () => false,
    entryElement = element,
    entrySide = null,
  }: {
    viewportStart?: number;
    viewportStartUp?: number;
    once?: boolean;
    played?: boolean;
    play: () => void;
    reset: () => void;
    finish: () => void;
    isPlaying?: () => boolean;
    /** Stable visual bounds for entry; the outer element still controls full-exit reset. */
    entryElement?: HTMLElement;
    /** Retain the last exit side when playback settings rebuild an observer. */
    entrySide?: ViewportEntrySide;
  },
): ViewportPlayback {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let played = initiallyPlayed,
    armed = !initiallyPlayed,
    disposed = false;
  let side = entrySide;
  let frame = 0,
    generation = 0;
  let observers: IntersectionObserver[] = [];
  const stop = () => {
    generation++;
    cancelAnimationFrame(frame);
    observers.forEach((observer) => observer.disconnect());
    observers = [];
  };
  const markPlayed = () => {
    played = true;
    armed = false;
  };
  const observe = () => {
    stop();
    if (disposed || motion.matches || (once && played)) return;
    if (typeof IntersectionObserver === 'undefined') {
      markPlayed();
      play();
      return;
    }
    const down = Number.isFinite(viewportStart) ? Math.min(100, Math.max(1, viewportStart)) : 85;
    const up =
      typeof viewportStartUp === 'number' && Number.isFinite(viewportStartUp)
        ? Math.min(100, Math.max(0, viewportStartUp))
        : 100 - down;
    const run = generation;
    const intersections: { visible?: boolean; above?: boolean; below?: boolean } = {};
    const evaluate = () => {
      if (disposed || motion.matches || run !== generation) return;
      if (intersections.visible === false) {
        if (!once) {
          const shouldReset = !armed || played || isPlaying();
          played = false;
          armed = true;
          if (shouldReset) reset();
        }
      } else if (intersections.visible && armed && side && intersections[side] && !isPlaying()) {
        markPlayed();
        play();
        if (once) stop();
      }
    };
    const watch = (key: keyof typeof intersections, rootMargin: string) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (disposed || run !== generation) return;
          const entry = entries.at(-1);
          if (!entry) return;
          intersections[key] = entry.isIntersecting;
          if (key === 'visible') {
            if (!entry.isIntersecting) {
              // A gallery can leave a nested scrollport while its bounds are still
              // inside the browser viewport. Remember the actual side it left.
              const { top, bottom } = verticalVisibleBounds(element, entry.rootBounds);
              if (entry.boundingClientRect.bottom <= top) side = 'above';
              else if (entry.boundingClientRect.top >= bottom) side = 'below';
            } else if (!side) {
              // Initially visible content may already be past the downward entry line.
              // Upward entry requires having observed the element leave above first.
              side = 'below';
            }
          }
          // Batch observers so delivery order cannot trigger a spurious play/reset.
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(evaluate);
        },
        { rootMargin, threshold: 0 },
      );
      observers.push(observer);
      observer.observe(key === 'visible' ? element : entryElement);
    };
    watch('visible', '0px');
    watch('below', `0px 0px -${innerHeight * (1 - down / 100)}px 0px`);
    watch('above', `-${(innerHeight * up) / 100}px 0px 0px 0px`);
  };
  const onMotion = () => {
    if (motion.matches) {
      stop();
      finish();
    } else observe();
  };
  window.addEventListener('resize', observe);
  motion.addEventListener('change', onMotion);
  if (motion.matches) finish();
  else observe();
  return {
    markPlayed,
    getEntrySide: () => side,
    disconnect: () => {
      disposed = true;
      stop();
      window.removeEventListener('resize', observe);
      motion.removeEventListener('change', onMotion);
    },
  };
}
