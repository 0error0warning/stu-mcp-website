import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fitGalleryCardWidth } from './gallery-fit.js';
import './reactdrops.css';

// ReactDrops source: b3924b92ebfce15152cf6f04ad85301c9f343672.
// Islands retain the original Side Quest document and its native interactions.
const component = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const TopographicFlow = component(() => import('./components/reactdrops/topographic-flow.tsx'), 'TopographicFlow');
const ShapePhysics = component(() => import('./components/reactdrops/shape-physics.tsx'), 'ShapePhysics');
const FanGallery = component(() => import('./components/reactdrops/fan-gallery.tsx'), 'FanGallery');
const LiquidGlassOrb = component(() => import('./components/reactdrops/liquid-glass-orb.tsx'), 'LiquidGlassOrb');
const ChromaticButton = component(() => import('./components/reactdrops/chromatic-button.tsx'), 'ChromaticButton');

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function usePlayback() {
  const host = useRef(null);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const mobile = useMedia('(max-width: 760px)');
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '64px' });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const update = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  const constrained = mobile || navigator.connection?.saveData || (navigator.hardwareConcurrency || 8) <= 4;
  return { host, active: visible && foreground && !reduced, reduced, mobile, constrained };
}

function StillContours() {
  return <svg className="rd-still-contours" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-150 ${460 + i * 24} C80 ${80 + i * 25}, 340 ${750 - i * 10}, 610 ${345 + i * 23} S1040 ${70 + i * 28}, 1380 ${250 + i * 31}`} />)}
  </svg>;
}

function TopographyIsland() {
  const { host, active, constrained } = usePlayback();
  return <div ref={host} className="rd-island rd-topography-island" data-reactdrops="topographic-flow">
    <Suspense fallback={<StillContours />}>
      {active ? <TopographicFlow preset="paper" height="100%" backgroundColor="#fff6ce" backgroundImage="none" gradientColors={[]} lineColor="#71602e" accentColor="#71602e" scale={560} density={constrained ? 3 : 4} opacity={0.25} speed={0.23} distortion={0.9} lineWidth={0.8} grain={0} hover={0} animateEntrance={false} /> : <StillContours />}
    </Suspense>
  </div>;
}

function StillShapes() {
  return <svg className="rd-still-shapes" viewBox="0 0 960 340" aria-hidden="true">
    <g stroke="#263b49" strokeWidth="3" strokeLinejoin="round">
      <rect x="88" y="235" width="70" height="70" rx="16" fill="#d9c6ed" transform="rotate(-12 123 270)" />
      <path d="M206 275c-21-7-24-36-4-46 1-26 36-36 50-13 26-8 42 20 25 37-4 22-42 27-71 22Z" fill="#fff2b3" />
      <path d="M773 220c-5 19-33 47-33 64a31 31 0 0 0 62 0c0-18-24-45-29-64Z" fill="#cadcc9" />
      <rect x="842" y="253" width="55" height="55" rx="12" fill="#eed5b9" transform="rotate(15 870 280)" />
    </g>
    <g fill="#263b49"><circle cx="113" cy="263" r="3"/><circle cx="132" cy="259" r="3"/><circle cx="762" cy="281" r="3"/><circle cx="782" cy="281" r="3"/></g>
  </svg>;
}

function PhysicsIsland() {
  const { host, active, constrained, mobile } = usePlayback();
  const phone = useMedia('(max-width: 480px)');
  const count = phone ? 3 : mobile ? 4 : constrained ? 5 : 7;
  const size = phone ? 22 : mobile ? 27 : 34;
  return <div ref={host} className="rd-island rd-physics-island" data-reactdrops="shape-physics">
    <Suspense fallback={<StillShapes />}>
      {active ? ['left', 'right'].map((side, i) => <div key={side} className={`rd-physics-lane rd-physics-${side}`}>
        <ShapePhysics height="100%" count={count} size={size} sizeVariation={0.16} shape="mixed" depth="3d" colors={['#d4bfeb', '#e8cbad', '#f1d46d', '#c8d9b8', '#bfcbd9']} background="transparent" faceColor="#263b49" gravity={420} restitution={0.48} friction={0.55} spin={0.45} spawnRate={4} appearanceDuration={0.55} followCursor={true} cursorFollowRatio={1} interactive={!mobile} seed={1477 + i} aria-label={mobile ? '会轻轻落下、用眼睛跟随鼠标的几何小角色' : `${i === 0 ? '左' : '右'}侧几何小角色：眼睛跟随鼠标，可拖动；按 Enter 添加，按 R 重新排列`} />
      </div>) : <StillShapes />}
    </Suspense>
  </div>;
}

const galleryItems = [
  { src: '/art/gallery-1.svg', alt: '来源可追溯：每一条线索，都留着出处' },
  { src: '/art/gallery-2.svg', alt: '登录留本地：钥匙，握在自己手里' },
  { src: '/art/gallery-3.svg', alt: 'Agent 由你选：连接你的工作方式' },
];

function StillGallery() {
  return <div className="rd-still-gallery">{galleryItems.map((item) => <img key={item.src} src={item.src} alt={item.alt} loading="lazy" />)}</div>;
}

function GalleryIsland() {
  const { host, active, mobile } = usePlayback();
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const measure = () => setWidth(Math.floor(element.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [host]);
  const lift = mobile ? 18 : 26;
  const cardWidth = fitGalleryCardWidth(width, mobile ? 140 : 210, lift);
  return <div ref={host} className="rd-island rd-gallery-island" data-reactdrops="fan-gallery">
    <Suspense fallback={<StillGallery />}>
      {active && width > 0 ? <FanGallery items={galleryItems} trigger="auto" entrance="stack" cardWidth={cardWidth} aspectRatio={0.78} spacing={0.55} curve={0.2} tilt={8} lift={lift} spread={0.08} radius={20} speed={0.65} stagger={0.08} bounce={0.18} ariaLabel="三个开源原则，轻触纸页展开" /> : <StillGallery />}
    </Suspense>
  </div>;
}

function StillOrb() {
  return <svg className="rd-still-orb" viewBox="0 0 100 100" role="img" aria-label="你的 Agent，信息流示意">
    <defs><radialGradient id="rd-orb-fill" cx="32%" cy="26%"><stop stopColor="#fffef1"/><stop offset="0.55" stopColor="#efd886"/><stop offset="1" stopColor="#bba0d9"/></radialGradient></defs>
    <circle cx="50" cy="50" r="45" fill="url(#rd-orb-fill)" stroke="#263b49" strokeWidth="1.5"/>
    <path d="m50 25 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z" fill="#fffdf1"/>
  </svg>;
}

function OrbIsland() {
  const { host, active } = usePlayback();
  return <div ref={host} className="rd-island rd-orb-island" data-reactdrops="liquid-glass-orb">
    <Suspense fallback={<StillOrb />}>
      {active ? <LiquidGlassOrb size={90} preset="honey" state="idle" speed={0.25} grain={0.12} distortion={0.35} intensity={0.4} animateEntrance={false} audioLevel={0} aria-label="你的 Agent，信息流示意" /> : <StillOrb />}
    </Suspense>
  </div>;
}

function copyInstall() {
  window.dispatchEvent(new Event('stu:copy-install'));
}

function InstallIsland() {
  const { host, active } = usePlayback();
  const content = <><span>复制安装指令</span><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h10v13H9zM5 9v12h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></>;
  const fallback = <button type="button" className="rd-install-static" onClick={copyInstall}>{content}</button>;
  return <div ref={host} className="rd-island rd-install-island" data-reactdrops="chromatic-button">
    <Suspense fallback={fallback}>
      {active ? <ChromaticButton className="rd-install-button" colorMode="gradient-3" color="#f3d26e" color2="#ddd0ef" color3="#fff4bb" speed={0.3} intensity={0.8} grain={0.06} hoverEffect="spotlight" entrance="none" onClick={copyInstall}>{content}</ChromaticButton> : fallback}
    </Suspense>
  </div>;
}

const islands = {
  'rd-topography': TopographyIsland,
  'rd-physics': PhysicsIsland,
  'rd-gallery': GalleryIsland,
  'rd-orb': OrbIsland,
  'rd-cta': InstallIsland,
};

function mountIslands() {
  for (const [id, Island] of Object.entries(islands)) {
    const host = document.getElementById(id);
    if (host && !host.dataset.reactMounted) {
      host.dataset.reactMounted = 'true';
      createRoot(host).render(<Island />);
    }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountIslands, { once: true });
else mountIslands();
