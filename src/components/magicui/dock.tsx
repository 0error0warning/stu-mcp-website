/*
 * Magic UI Dock — MIT, Copyright (c) Magic UI.
 * Source: magicuidesign/magicui/apps/www/registry/magicui/dock.tsx
 * Pinned upstream: efe76fc5755eca1142dd4f74c1d6f0ace2887e3c.
 * Product adaptation: icon-only links, scoped CSS, tooltips, reduced motion.
 * The original distance → transform → spring sizing acts on the full icon
 * container. The Dock's width expands while its height and center stay fixed.
 * Full terms: licenses/Magic-UI-MIT.txt.
 */
import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';

type DockProps = React.PropsWithChildren<{
  className?: string;
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
  disableMagnification?: boolean;
}>;

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(function Dock({
  children,
  className = '',
  iconSize = 40,
  iconMagnification = 52,
  iconDistance = 120,
  disableMagnification = false,
}, ref) {
  const mouseX = useMotionValue(Infinity);
  return <motion.div ref={ref} className={`magic-dock ${className}`}
    onPointerMove={event => {
      if (event.pointerType !== 'touch' && !disableMagnification) mouseX.set(event.clientX);
    }}
    onPointerLeave={() => mouseX.set(Infinity)}>
    {React.Children.map(children, child => React.isValidElement<DockIconProps>(child) && child.type === DockIcon
      ? React.cloneElement(child, { mouseX, size: iconSize, magnification: iconMagnification, distance: iconDistance, disableMagnification })
      : child)}
  </motion.div>;
});

export interface DockIconProps {
  children?: React.ReactNode;
  href: string;
  label: string;
  active?: boolean;
  size?: number;
  magnification?: number;
  distance?: number;
  disableMagnification?: boolean;
  mouseX?: MotionValue<number>;
}

export function DockIcon({ children, href, label, active, size = 40, magnification = 52, distance = 120, disableMagnification, mouseX }: DockIconProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const defaultMouseX = useMotionValue(Infinity);
  const distanceCalc = useTransform(mouseX ?? defaultMouseX, value => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });
  const sizeTransform = useTransform(distanceCalc, [-distance, 0, distance], [size, disableMagnification ? size : magnification, size]);
  const scaleSize = useSpring(sizeTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  useEffect(() => {
    if (disableMagnification) scaleSize.jump(size);
  }, [disableMagnification, scaleSize, size]);
  return <motion.a ref={ref} href={href} className="magic-dock-link"
    aria-label={label} aria-current={active ? 'location' : undefined}
    style={{ width: disableMagnification ? size : scaleSize, height: disableMagnification ? size : scaleSize }}>
    <span className="magic-dock-icon" aria-hidden="true">{children}</span>
    <span className="magic-dock-tooltip" aria-hidden="true">{label}</span>
  </motion.a>;
}
