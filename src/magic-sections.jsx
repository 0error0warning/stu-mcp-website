import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Files, BookOpen, MessagesSquare, Bot } from 'lucide-react';
import { AnimatedBeam } from './components/magicui/animated-beam';
import { BorderBeam } from './components/magicui/border-beam';
import { Terminal, TypingAnimation } from './components/magicui/terminal';
import { TextAnimate } from './components/magicui/text-animate';
import './magic-sections.css';

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

// One short greeting on first view. Offscreen/background changes stop the
// motion controller; returning never creates an endless repeating animation.
function useGreeting(active, duration) {
  const seen = useRef(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!active || seen.current) return;
    seen.current = true;
    setPlaying(true);
  }, [active]);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPlaying(false), duration);
    return () => clearTimeout(timer);
  }, [playing, duration]);
  return active && playing;
}

function Connection() {
  const { host, active } = usePlayback();
  const vertical = useMedia('(max-width: 760px)');
  const playing = useGreeting(active, 4600);
  const notice = useRef(null);
  const learning = useRef(null);
  const community = useRef(null);
  const hub = useRef(null);
  const agent = useRef(null);
  const sources = [
    { ref: notice, label: '通知 · 附件', Icon: Files, tone: 'paper' },
    { ref: learning, label: '课程 · 作业', Icon: BookOpen, tone: 'lavender' },
    { ref: community, label: '社区 · 日常', Icon: MessagesSquare, tone: 'sage' },
  ];
  return <div ref={host} className="mb-network" data-magicui="animated-beam">
    <div className="mb-source-grid">
      {sources.map(({ ref, label, Icon, tone }) => <div key={label} ref={ref} className={`mb-source mb-source-${tone}`}>
        <Icon aria-hidden="true" strokeWidth={1.6} />
        <span>{label}</span>
      </div>)}
    </div>
    <div ref={hub} className="mb-hub">
      <div className="mb-hub-icon"><Files aria-hidden="true" strokeWidth={1.6} /></div>
      <strong>STU-MCP</strong>
      <span>检索 · 读取 · 保留出处</span>
    </div>
    <div ref={agent} className="mb-agent">
      <div className="mb-agent-icon"><Bot aria-hidden="true" strokeWidth={1.35} /></div>
      <strong>Your Agent</strong>
      <span>理解 · 整理 · 回答</span>
    </div>
    {sources.map(({ ref, label }, index) => <AnimatedBeam key={label}
      containerRef={host} fromRef={ref} toRef={hub}
      curvature={vertical ? 0 : index === 0 ? -66 : index === 2 ? 66 : 0}
      vertical={vertical} playing={playing} repeat={0} duration={3.2} delay={index * 0.25}
      pathColor="var(--mb-path, #b9b2a5)" pathOpacity={0.55} pathWidth={1.6}
      gradientStartColor="#ddaf42" gradientStopColor="#a493c8" />)}
    <AnimatedBeam containerRef={host} fromRef={hub} toRef={agent}
      vertical={vertical} playing={playing} repeat={0} duration={3.2} delay={0.85}
      pathColor="var(--mb-path, #b9b2a5)" pathOpacity={0.55} pathWidth={1.8}
      gradientStartColor="#d1af53" gradientStopColor="#9c86c4" />
  </div>;
}

const terminalInstallText = 'uv tool install --python 3.12 https://github.com/0error0warning/stu-mcp/releases/download/v0.7.1/stu_mcp-0.7.1-py3-none-any.whl\nstu-mcp setup';

function InstallationTerminal({ text }) {
  const { host, active } = usePlayback();
  const [mode, setMode] = useState('agent');
  const tabs = useRef([]);
  const modes = [
    { value: 'agent', label: '交给 Agent' },
    { value: 'terminal', label: '终端安装' },
  ];
  const currentText = mode === 'agent' ? text : terminalInstallText;
  const selectMode = next => {
    if (next === mode) return;
    setMode(next);
    window.dispatchEvent(new CustomEvent('stu:install-mode', {
      detail: { text: next === 'agent' ? text : terminalInstallText },
    }));
  };
  const moveTab = event => {
    const index = modes.findIndex(item => item.value === mode);
    const next = event.key === 'ArrowRight' ? (index + 1) % modes.length
      : event.key === 'ArrowLeft' ? (index + modes.length - 1) % modes.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    selectMode(modes[next].value);
    tabs.current[next]?.focus();
  };
  return <div ref={host} className="mb-terminal-wrap" data-magicui="terminal">
    <div className="mb-install-tabs" role="tablist" aria-label="安装方式" onKeyDown={moveTab}>
      {modes.map((item, index) => <button key={item.value} ref={element => { tabs.current[index] = element; }}
        type="button" role="tab" id={`install-tab-${item.value}`} aria-controls="install-mode-panel"
        aria-selected={mode === item.value} tabIndex={mode === item.value ? 0 : -1}
        onClick={() => selectMode(item.value)}>{item.label}</button>)}
    </div>
    <div id="install-mode-panel" role="tabpanel" aria-labelledby={`install-tab-${mode}`} tabIndex={0}>
      <span className="mui-sr-only">{currentText}</span>
      <div aria-hidden="true">
        <Terminal key={mode} playing={active} title={mode === 'agent' ? 'STU-MCP / 给你的 Agent' : 'STU-MCP / 终端安装'}>
          <TypingAnimation duration={mode === 'agent' ? 16 : 11} className={mode === 'agent' ? 'mb-install-prompt' : 'mb-install-prompt mb-install-command'}>{currentText}</TypingAnimation>
        </Terminal>
      </div>
    </div>
  </div>;
}

function EvidenceBorder() {
  const { host, active } = usePlayback();
  const playing = useGreeting(active, 6500);
  return <div ref={host} className="mb-border-layer" data-magicui="border-beam" aria-hidden="true">
    <BorderBeam playing={playing} size={180} duration={6} borderWidth={1.5} colorFrom="#ecd783" colorTo="#bda0df" />
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
  const source = document.getElementById('install-prompt');
  const terminal = document.getElementById('magic-terminal');
  if (source && terminal) {
    const wasHidden = source.hidden;
    mount(terminal, <InstallationTerminal text={source.textContent.trim()} />, () => { source.hidden = wasHidden; });
    source.hidden = true;
  }
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
