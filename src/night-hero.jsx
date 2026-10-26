import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const GradientASCII = lazy(() => import('./components/reactbits/GradientASCII.jsx'));
const PALETTE = ['#172c66', '#7386ce', '#8bc9dd', '#4e5497'];

// A static character field also covers the first lazy frame, constrained devices
// and unavailable WebGL. The actual React Bits component supplies normal motion.
const ASCII_STILL = Array.from({ length:56 }, (_, row) => Array.from({ length:160 }, (_, col) => {
  const x = (col - 80) / 80, y = row / 56;
  const field = Math.max(0, 1 - Math.abs(y - (.73 - .22 * x * x)) * 2.6);
  const variation = (Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
  return field + Math.abs(variation) * .35 < .36 ? ' ' : ' .:=+xX0S8#@'[Math.min(10, Math.floor(field * 7 + Math.abs(variation) * 3))];
}).join('')).join('\n');

function NightHero() {
  const host = useRef(null);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile, setMobile] = useState(() => matchMedia('(max-width:760px)').matches);
  const [started, setStarted] = useState(false);
  const constrained = mobile || navigator.connection?.saveData || (navigator.hardwareConcurrency || 8) <= 4;
  const active = dark && visible && foreground && !reduced && !constrained;
  useEffect(() => {
    const theme = new MutationObserver(() => setDark(document.documentElement.dataset.theme === 'dark'));
    theme.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
    const view = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold:0 });
    if (host.current) view.observe(host.current);
    const visibility = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange',visibility);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia('(max-width:760px)');
    const changeMotion = () => setReduced(motion.matches);
    const changePhone = () => setMobile(phone.matches);
    motion.addEventListener('change',changeMotion);phone.addEventListener('change',changePhone);
    return () => { theme.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',changeMotion);phone.removeEventListener('change',changePhone); };
  }, []);
  useEffect(() => { if (active) setStarted(true); }, [active]);
  return <div ref={host} className="night-gradient-layer" data-active={active} data-render-mode={started && !constrained && !reduced ? 'webgl' : 'static'}>
    <pre className="night-ascii-still" aria-hidden="true">{ASCII_STILL}</pre>
    <Suspense fallback={null}>
      {started && !constrained && !reduced && <GradientASCII colors={PALETTE} shape="horizon" characters=" .:=+xX0S8#@" cellSize={15}
        density={.7} glyphOpacity={.8} glow={0} flicker={.06} softness={.6} flow={.4} speed={.2} gradientOpacity={.7}
        grain={.012} variation={7} mouseInteraction={true} clickEffect="none" intro={false} dpr={1} maxFps={24} paused={!active} />}
    </Suspense>
  </div>;
}

let mounted;
export function mountNightHero() {
  const host = document.getElementById('night-gradient');
  if (!host || mounted) return;
  const root = createRoot(host);root.render(<NightHero />);mounted={host,root};
}
if (import.meta.hot) import.meta.hot.dispose(() => { mounted?.root.unmount();mounted=null; });
