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
import { createSolidEngine } from './solid-engine';
import { shapeDefaults, type ShapeSettings } from './shape-settings';
import './shape-physics.css';

export type ShapePhysicsProps = Partial<ShapeSettings> & {
  height?: number | string;
  onSizeLimitChange?: (maximum: number) => void;
  onFullChange?: (full: boolean) => void;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
};
export type ShapePhysicsHandle = {
  replay: () => void;
  clear: () => void;
  addShape: () => void;
  shake: () => void;
};

export const ShapePhysics = forwardRef<ShapePhysicsHandle, ShapePhysicsProps>(function ShapePhysics(
  {
    height,
    onSizeLimitChange,
    onFullChange,
    className = '',
    style,
    'aria-label':
      label = 'Playful shapes with gravity. Drag a shape or click empty space to add one.',
    ...overrides
  },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof createSolidEngine>>(null);
  const settings = { ...shapeDefaults, ...overrides };
  const latest = useRef(settings);
  latest.current = settings;
  const sizeLimitCallback = useRef(onSizeLimitChange);
  sizeLimitCallback.current = onSizeLimitChange;
  const fullCallback = useRef(onFullChange);
  fullCallback.current = onFullChange;
  const key = JSON.stringify(settings);
  useImperativeHandle(
    ref,
    () => ({
      replay: () => engine.current?.reset(),
      clear: () => engine.current?.clear(),
      addShape: () => engine.current?.add(),
      shake: () => engine.current?.shake(),
    }),
    [],
  );
  useEffect(() => {
    if (!canvas.current) return;
    const instance = createSolidEngine(
      canvas.current,
      latest.current,
      (maximum) => sizeLimitCallback.current?.(maximum),
      (full) => fullCallback.current?.(full),
    );
    engine.current = instance;
    return () => {
      instance?.destroy();
      engine.current = null;
    };
  }, []);
  useEffect(() => engine.current?.update(settings), [key]);
  return (
    <div
      className={`shape-physics ${className}`.trim()}
      style={{ height, background: settings.background, ...style }}
    >
      <canvas
        ref={canvas}
        role="img"
        aria-label={label}
        tabIndex={settings.interactive ? 0 : undefined}
        data-interactive={settings.interactive}
        onKeyDown={(event) => {
          if (!settings.interactive || event.metaKey || event.ctrlKey || event.altKey) return;
          if (event.key === 'Enter') {
            event.preventDefault();
            engine.current?.add();
          }
          if (event.key.toLowerCase() === 'r') engine.current?.reset();
        }}
      />
    </div>
  );
});
