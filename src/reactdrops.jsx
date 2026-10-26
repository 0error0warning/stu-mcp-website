import React, { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Bot, Code2, Copy, FileSearch, Fingerprint } from 'lucide-react';
import { fitGalleryCardWidth } from './gallery-fit.js';
import { heroGroundGeometry, heroGroundY } from './hero-physics-layout.js';
import { heroCharactersEnabled, subscribeHeroCharacters } from './hero-characters.js';
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
  const [started, setStarted] = useState(false);
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
  const active = visible && foreground && !reduced;
  useEffect(() => { if (active) setStarted(true); }, [active]);
  return { host, active, started, reduced, mobile, constrained };
}

function StillContours() {
  return <svg className="rd-still-contours" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-150 ${460 + i * 24} C80 ${80 + i * 25}, 340 ${750 - i * 10}, 610 ${345 + i * 23} S1040 ${70 + i * 28}, 1380 ${250 + i * 31}`} />)}
  </svg>;
}

function TopographyIsland() {
  const { host, started, reduced, constrained } = usePlayback();
  return <div ref={host} className="rd-island rd-topography-island" data-reactdrops="topographic-flow">
    <Suspense fallback={<StillContours />}>
      {started && !reduced && !constrained ? <TopographicFlow preset="paper" height="100%" backgroundColor="#fff6ce" backgroundImage="none" lineColor="#71602e" accentColor="#71602e" scale={560} density={4} opacity={0.25} speed={0} paused={true} distortion={0.9} lineWidth={0.8} grain={0} hover={0} animateEntrance={false} /> : <StillContours />}
    </Suspense>
  </div>;
}

function StillShapes({ scene, count, size }) {
  if (!scene) return null;
  const colors = ['#d4bfeb', '#e8cbad', '#f1d46d', '#c8d9b8', '#bfcbd9'];
  return <svg className="rd-still-shapes" viewBox={`0 0 ${scene.width} ${scene.height}`} preserveAspectRatio="none" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => {
      const fraction = i < count / 2 ? 0.04 + i / count * 0.6 : 0.66 + (i - count / 2) / count * 0.6;
      const x = Math.max(size, Math.min(scene.width - size, scene.width * fraction));
      const y = heroGroundY(scene.ground, x) - size;
      return <g key={i} transform={`translate(${x} ${y}) scale(${size / 30})`}>
        {i % 3 === 0 ? <rect x="-29" y="-29" width="58" height="58" rx="13" fill={colors[i % colors.length]} />
          : i % 3 === 1 ? <circle r="29" fill={colors[i % colors.length]} />
          : <path d="M-20 25C-42 13-36-12-20-15-18-40 13-38 19-19 42-22 42 10 27 16 22 34-6 32-20 25Z" fill={colors[i % colors.length]} />}
        <g stroke="#263b49" strokeWidth="5" strokeLinecap="round"><path d="M-8-3v8M8-3v8" /></g>
      </g>;
    })}
  </svg>;
}

function PhysicsIsland() {
  const { host, active, started, constrained, mobile, reduced } = usePlayback();
  const phone = useMedia('(max-width: 480px)');
  const finePointer = useMedia('(hover: hover) and (pointer: fine)');
  const count = phone ? 4 : mobile ? 6 : constrained ? 8 : 10;
  const size = phone ? 28 : mobile ? 34 : 42;
  const [scene, setScene] = useState(null);
  const [seed] = useState(() => {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % 100001;
  });
  useEffect(() => {
    const hero = host.current?.closest('.hero-full');
    const horizon = hero?.querySelector('.horizon');
    if (!hero || !horizon) return;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      frame = 0;
      if (disposed) return;
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      const ground = heroGroundGeometry(hero.getBoundingClientRect(), horizon.getBoundingClientRect(), width, height);
      if (!ground) return;
      const next = { width, height, ground };
      setScene(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(hero);
    observer.observe(horizon);
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    schedule();
    return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', schedule); };
  }, [host]);
  // A still scene is only a reduced-motion alternative. Never flash a settled
  // pile while the live physics module is loading or the tab is backgrounded.
  const still = reduced ? <StillShapes scene={scene} count={count} size={size} /> : null;
  return <div ref={host} className="rd-island rd-physics-island" data-reactdrops="shape-physics" data-physics-ground={scene ? JSON.stringify(scene.ground) : undefined} data-scene-count={count} data-scene-size={size} data-scene-seed={seed}>
    <Suspense fallback={still}>
      {started && scene && !reduced ? <ShapePhysics height="100%" count={count} size={size} ground={scene.ground} paused={!active} sizeVariation={0.12} shape="mixed" depth="3d" colors={['#d4bfeb', '#e8cbad', '#f1d46d', '#c8d9b8', '#bfcbd9']} background="transparent" faceColor="#263b49" gravity={370} restitution={0.32} friction={0.4} spin={0.38} spawnRate={2.2} appearanceDuration={0.45} followCursor={true} cursorFollowRatio={0.6} interactive={finePointer} seed={seed} aria-label="从顶部落下、沿黄色弧面滚动的小角色：部分角色的眼睛跟随鼠标，可拖动" /> : still}
    </Suspense>
  </div>;
}

function OptionalPhysicsIsland() {
  const enabled = useSyncExternalStore(subscribeHeroCharacters, heroCharactersEnabled);
  // No measurement observers, canvas, engine import, or still pile until opt-in.
  return enabled ? <PhysicsIsland /> : null;
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
  const { host, started, reduced, mobile } = usePlayback();
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
      {started && !reduced && width > 0 ? <FanGallery items={galleryItems} trigger="auto" entrance="stack" cardWidth={cardWidth} aspectRatio={0.78} spacing={0.55} curve={0.2} tilt={8} lift={lift} spread={0.08} radius={20} speed={0.65} stagger={0.08} bounce={0.18} ariaLabel="三个开源原则，轻触纸页展开" /> : <StillGallery />}
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
  const { host, active, started, reduced, constrained } = usePlayback();
  const [engaged, setEngaged] = useState(false);
  return <div ref={host} className="rd-island rd-orb-island" data-reactdrops="liquid-glass-orb" onPointerEnter={event => { if (event.pointerType !== 'touch') setEngaged(true); }} onPointerLeave={() => setEngaged(false)} onPointerCancel={() => setEngaged(false)}>
    <Suspense fallback={<StillOrb />}>
      {started && !reduced && !constrained ? <LiquidGlassOrb size={90} preset="honey" state="idle" speed={0.25} paused={!active || !engaged} grain={0.12} distortion={0.35} intensity={0.4} animateEntrance={false} audioLevel={0} aria-label="你的 Agent，信息流示意" /> : <StillOrb />}
    </Suspense>
  </div>;
}

function copyInstall() {
  window.dispatchEvent(new Event('stu:copy-install'));
}

function ProductButtonIsland({ install = false }) {
  const { host, active, started, reduced, constrained } = usePlayback();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const engaged = hovered || focused;
  const onClick = install ? copyInstall : () => { window.location.hash = 'install'; };
  const content = install
    ? <><span>复制安装指令</span><Copy aria-hidden="true" size={20} strokeWidth={1.8} /></>
    : <span className="hero-action-content"><span className="hero-action-label">试着接入</span><span className="hero-action-icon"><ArrowUpRight aria-hidden="true" size={21} strokeWidth={1.8} /></span></span>;
  const fallback = <button type="button" className="product-chromatic rd-install-static" onClick={onClick}>{content}</button>;
  return <div ref={host} className={`rd-island rd-install-island ${install ? 'rd-install-cta' : 'rd-hero-cta'}`} data-reactdrops="chromatic-button" onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true); }} onPointerLeave={() => setHovered(false)} onPointerCancel={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
    <Suspense fallback={fallback}>
      {started && !reduced && !constrained ? <ChromaticButton className="rd-install-button product-chromatic" colorMode="gradient-3" color="#c5b8f0" color2="#a9cfea" color3="#ead9f1" brightnessFloor={0.76} speed={0.22} paused={!active || !engaged} intensity={1.08} grain={0.018} hoverEffect="brighten" entrance="none" onClick={onClick}>{content}</ChromaticButton> : fallback}
    </Suspense>
  </div>;
}

function InstallIsland() { return <ProductButtonIsland install />; }
function HeroButtonIsland() { return <ProductButtonIsland />; }

function FeatureStrip() {
  const items = [[Bot, '你的 Agent'], [FileSearch, '真实来源'], [Fingerprint, '本地配置'], [Code2, '独立开源']];
  return <div className="feature-strip">{items.map(([Icon, label]) => <span className="feature-item" key={label}><Icon aria-hidden="true" size={21} strokeWidth={1.65} /><span>{label}</span></span>)}</div>;
}

const islands = {
  'rd-topography': TopographyIsland,
  'rd-physics': OptionalPhysicsIsland,
  'rd-gallery': GalleryIsland,
  'rd-orb': OrbIsland,
  'rd-cta': InstallIsland,
  'rd-hero-cta': HeroButtonIsland,
  'hero-features': FeatureStrip,
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
