import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FileText, BookOpen, MessagesSquare, Sparkles } from 'lucide-react';
import { AnimatedBeam } from './components/magicui/animated-beam';
import { BorderBeam } from './components/magicui/border-beam';
import { TextAnimate } from './components/magicui/text-animate';
import './magic-sections.css';
import './product-story.css';

// Product wrappers for Magic UI's MIT registry components, pinned at
// efe76fc5755eca1142dd4f74c1d6f0ace2887e3c. Components retain source notices.
function useMedia(query) {
  const [value, setValue] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const change = () => setValue(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, [query]);
  return value;
}

function usePlayback() {
  const host = useRef(null);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const change = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return { host, active: visible && foreground && !reduced, reduced };
}

// Composition follows the inspected UI Layouts hover card and ReUI stat card
// references: one surface per node, quiet label, strong title and lifted artwork.
function NodeArtwork({ kind }) {
  return <svg className={`mb-node-art mb-node-art-${kind}`} viewBox="0 0 240 180" aria-hidden="true">
    <circle cx="199" cy="80" r="66"/><circle cx="228" cy="44" r="45"/>
    <circle cx="160" cy="137" r="42"/><path d="M112 180 240 52M151 180 240 91"/>
  </svg>;
}

function Connection() {
  const { host, active, reduced } = usePlayback();
  const vertical = useMedia('(max-width: 680px)');
  const notice = useRef(null), learning = useRef(null), community = useRef(null);
  const hubIn = useRef(null), hubOut = useRef(null), agentIn = useRef(null);
  const sources = [
    { ref: notice, label: '通知 · 附件', detail: '正文与文件', Icon: FileText, tone: 'paper', color: '#d4a63d' },
    { ref: learning, label: '课程 · 作业', detail: '学习中的安排', Icon: BookOpen, tone: 'lavender', color: '#a78ad8' },
    { ref: community, label: '社区 · 日常', detail: '校园里的线索', Icon: MessagesSquare, tone: 'sage', color: '#70a38d' },
  ];
  return <div ref={host} className="mb-network" data-magicui="animated-beam" data-playing={active && !reduced}>
    <div className="mb-source-grid">
      {sources.map(({ ref, label, detail, Icon, tone, color }) => <div key={label} className={`mb-source mb-source-${tone}`} style={{ '--node-color': color }}>
        <Icon aria-hidden="true" strokeWidth={1.65} />
        <span className="mb-source-copy"><strong>{label}</strong><span>{detail}</span></span>
        <span ref={ref} className="mb-port mb-source-port" aria-hidden="true" />
      </div>)}
    </div>
    <div className="mb-hub mb-node">
      <NodeArtwork kind="hub" />
      <span ref={hubIn} className="mb-port mb-hub-in" aria-hidden="true" />
      <span ref={hubOut} className="mb-port mb-hub-out" aria-hidden="true" />
      <span className="mb-node-caption">把入口连接起来</span>
      <svg className="mb-brand-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M10 7h17l5 6v21H10zM27 7v7h5M16 20h10M16 26h6"/><path d="M6 12v23h20" opacity=".4"/></svg>
      <strong>STU-MCP</strong>
      <span className="mb-node-detail">检索 · 读取 · 保留出处</span>
    </div>
    <div className="mb-agent mb-node">
      <NodeArtwork kind="agent" />
      <span ref={agentIn} className="mb-port mb-agent-in" aria-hidden="true" />
      <span className="mb-node-caption">由你选择</span>
      <Sparkles className="mb-agent-mark" aria-hidden="true" strokeWidth={1.45} />
      <strong>Your Agent</strong>
      <span className="mb-node-detail">理解 · 整理 · 回答</span>
    </div>
    {sources.map(({ ref, label, color }, index) => <AnimatedBeam key={label}
      containerRef={host} fromRef={ref} toRef={hubIn} route="smooth"
      vertical={vertical} playing={active} reducedMotion={reduced} repeat={Infinity} duration={2.3} repeatDelay={0.35} delay={index * 0.5}
      pathColor="var(--mb-path, #c7c3ba)" pathOpacity={0.8} pathWidth={1.6} beamWidth={3.2}
      gradientStartColor={color} gradientStopColor="#c39bf1" />)}
    <AnimatedBeam containerRef={host} fromRef={hubOut} toRef={agentIn} route="smooth"
      vertical={vertical} playing={active} reducedMotion={reduced} repeat={Infinity} duration={2.3} repeatDelay={0.35} delay={0.8}
      pathColor="var(--mb-path, #c7c3ba)" pathOpacity={0.8} pathWidth={1.6} beamWidth={3.6}
      gradientStartColor="#d6ae48" gradientStopColor="#a880d5" />
  </div>;
}

function EvidenceBorder() {
  const { host, active } = usePlayback();
  return <div ref={host} className="mb-border-layer" data-magicui="border-beam" aria-hidden="true">
    <BorderBeam playing={active} size={160} duration={6} borderWidth={2} colorFrom="#8adce8" colorTo="#c9b8f7" />
  </div>;
}

const mounts = new Map();
function mount(element, content, cleanup) {
  if (!element || mounts.has(element) || element.dataset.magicMounted) return;
  element.dataset.magicMounted = 'true';
  const root = createRoot(element);
  root.render(content);
  mounts.set(element, { root, cleanup });
}

export function mountMagicSections() {
  mount(document.getElementById('magic-connection'), <Connection />);
  mount(document.getElementById('magic-border'), <EvidenceBorder />);
  document.querySelectorAll('[data-text-animate]').forEach(element => {
    const text = element.textContent.trim();
    mount(element, <TextAnimate as="span" animation="slideUp" by="text" once duration={0.35}>{text}</TextAnimate>, () => { element.textContent = text; });
  });
}

if (import.meta.hot) import.meta.hot.dispose(() => {
  for (const [element, { root, cleanup }] of mounts) {
    root.unmount();
    delete element.dataset.magicMounted;
    cleanup?.();
  }
  mounts.clear();
});
