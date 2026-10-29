import React, { lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowUp, Check, ChevronDown } from 'lucide-react';
import { AGENTS, MODELS } from '../agent-catalog.js';
import './liquid-agent-input.css';

// Adapted from the complete Liquid Multimodal Input code supplied by the owner
// (Wensity Labs, https://21st.dev/@wensity/components/liquid-multimodal-input).
// Public component license: MIT. Attribution and full terms are retained in
// licenses/Wensity-Liquid-Multimodal-Input-MIT.txt; provenance is alongside this file.
// Retains its surface/noise/inner-edge/textarea/toolbar/portal-selector structure.
// Product changes: Agent + model preferences, a rotating brand mascot, existing
// Motion/Lucide imports, scoped CSS, and a send-shaped action that copies text.
const ChromaticButton = lazy(() => import('./reactdrops/chromatic-button.tsx').then(module => ({ default: module.ChromaticButton })));
const INSTALL_AGENTS = AGENTS.filter(item => item.promptTarget);

function useMedia(query) {
  const [value, setValue] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setValue(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return value;
}

function usePlayback(host) {
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, [host]);
  useEffect(() => {
    const update = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return { active: visible && foreground && !reduced, visible, reduced };
}

function BrandMark({ item, className = '' }) {
  return <img className={`liquid-brand-mark ${className}`} src={item.icon} alt="" width="24" height="24" draggable="false" />;
}

function nextTabStop(trigger, reverse) {
  const nodes = [...document.querySelectorAll('a[href],button:not(:disabled),textarea:not(:disabled),input:not(:disabled),[tabindex="0"]')]
    .filter(node => !node.closest('.liquid-option-menu') && !node.closest('[inert]') && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
  const index = nodes.indexOf(trigger);
  (nodes[index + (reverse ? -1 : 1)] ?? trigger)?.focus();
}

function CatalogSelector({ kind, items, value, onChange, reduced, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const [position, setPosition] = useState(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const frame = useRef(0);
  const listId = useId();
  const current = items.find(item => item.id === value) ?? items[0];
  const caption = kind === 'agent' ? '选择 Agent' : '选择模型';
  const updatePosition = useCallback(() => {
    if (!trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const padding = 12;
    const width = Math.min(kind === 'model' ? 310 : 290, innerWidth - padding * 2);
    const below = innerHeight - rect.bottom - padding - 8;
    const above = rect.top - padding - 8;
    const placement = below >= Math.min(330, above) ? 'bottom' : 'top';
    const maxHeight = Math.max(80, Math.min(360, placement === 'bottom' ? below : above));
    const left = Math.max(padding, Math.min(align === 'right' ? rect.right - width : rect.left, innerWidth - width - padding));
    setPosition({ left, width, maxHeight, placement, ...(placement === 'bottom' ? { top: rect.bottom + 8 } : { bottom: innerHeight - rect.top + 8 }) });
  }, [align, kind]);

  useLayoutEffect(() => { if (open) updatePosition(); }, [open, updatePosition]);
  useEffect(() => {
    if (!open) { setHoverId(null); return; }
    const outside = event => {
      if (!trigger.current?.contains(event.target) && !menu.current?.contains(event.target)) setOpen(false);
    };
    const schedule = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => { frame.current = 0; updatePosition(); });
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      menu.current?.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
    });
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [open, updatePosition]);

  const dismiss = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  const onMenuKey = event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismiss(); return; }
    if (event.key === 'Tab') {
      event.preventDefault(); setOpen(false); nextTabStop(trigger.current, event.shiftKey); return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const options = [...menu.current.querySelectorAll('[role="option"]')];
    const index = options.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    options[next]?.focus();
    options[next]?.scrollIntoView({ block: 'nearest' });
  };

  return <div className={`liquid-selector liquid-selector-${kind}`}>
    <button ref={trigger} type="button" className="liquid-selector-trigger" aria-haspopup="listbox" aria-expanded={open}
      aria-controls={open ? listId : undefined} aria-label={`${caption}：${current.name}`}
      onClick={() => setOpen(value => !value)} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); }
      }}>
      <BrandMark item={current} /><span>{current.name}</span>
      <motion.span className="liquid-selector-chevron" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduced ? 0 : .2 }}><ChevronDown size={13} aria-hidden="true" /></motion.span>
    </button>
    {createPortal(<AnimatePresence>
      {open && position && <motion.div ref={menu} key={listId} id={listId} role="listbox" aria-label={caption}
        className="liquid-option-menu" onKeyDown={onMenuKey}
        initial={reduced ? false : { opacity: 0, y: position.placement === 'bottom' ? -6 : 6, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: position.placement === 'bottom' ? -4 : 4, scale: .98 }}
        transition={{ duration: reduced ? 0 : .16, ease: [.22, 1, .36, 1] }}
        style={{ ...position, transformOrigin: `${align} ${position.placement === 'bottom' ? 'top' : 'bottom'}` }}>
        <div className="liquid-menu-caption">{kind === 'agent' ? '交给哪个 Agent' : '选择模型偏好'}</div>
        <LayoutGroup id={listId}>
          <div className="liquid-option-list" onMouseLeave={() => setHoverId(null)}>
            {items.map(item => {
              const selected = item.id === current.id;
              const highlighted = hoverId === item.id || (!hoverId && selected);
              return <button key={item.id} type="button" role="option" aria-selected={selected} tabIndex={-1}
                className="liquid-option" onMouseEnter={() => setHoverId(item.id)} onFocus={() => setHoverId(item.id)}
                onClick={() => { onChange(item.id); dismiss(); }}>
                {highlighted && <motion.span className="liquid-option-highlight" layoutId="highlight" aria-hidden="true" transition={reduced ? { duration:0 } : { type:'spring', stiffness:400, damping:32, mass:.6 }} />}
                <span className="liquid-option-icon"><BrandMark item={item} /></span>
                <span className="liquid-option-copy"><strong>{item.name}</strong><span>{kind === 'agent' ? item.description : item.provider}</span></span>
                {selected && <Check size={15} strokeWidth={2} aria-hidden="true" className="liquid-option-check" />}
              </button>;
            })}
          </div>
        </LayoutGroup>
      </motion.div>}
    </AnimatePresence>, document.body)}
  </div>;
}

function SendButton({ active, visible, reduced, disabled, onClick, copied }) {
  const [engaged, setEngaged] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const constrained = useMedia('(max-width: 600px)') || navigator.connection?.saveData || (navigator.hardwareConcurrency || 8) <= 4;
  useEffect(() => { if (visible && !constrained && !reduced) setLoaded(true); }, [visible, constrained, reduced]);
  const common = {
    className:'liquid-send-button', disabled, onClick, type:'button',
    'aria-label':copied ? 'Prompt 已复制' : '发送安装 Prompt（复制到剪贴板）',
    title:copied ? '已复制，交给你的 Agent' : '复制并交给你的 Agent',
    'aria-keyshortcuts':'Enter Control+Enter Meta+Enter',
  };
  const glyph = copied ? <Check size={19} strokeWidth={2.2} aria-hidden="true" /> : <ArrowUp size={21} strokeWidth={2.2} aria-hidden="true" />;
  const fallback = <button {...common} className="liquid-send-button liquid-send-static">{glyph}</button>;
  return <div className="liquid-send-wrap" onPointerEnter={event => { if (event.pointerType !== 'touch') setEngaged(true); }}
    onPointerLeave={() => setEngaged(false)} onPointerCancel={() => setEngaged(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
    <Suspense fallback={fallback}>
      {loaded && !reduced && !constrained ? <ChromaticButton {...common} compatibleMaterial="circle" colorMode="gradient-3" color="#c5b8f0" color2="#a9cfea" color3="#ead9f1"
        brightnessFloor={.76} speed={.22} paused={!active || !(engaged || focused)} intensity={1.08} grain={.018} hoverEffect="brighten" entrance="none">{glyph}</ChromaticButton> : fallback}
    </Suspense>
  </div>;
}

export function LiquidAgentInput({ initialText }) {
  const [text, setText] = useState(initialText);
  const [agentId, setAgentId] = useState(INSTALL_AGENTS[0].id);
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [logoIndex, setLogoIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const textarea = useRef(null);
  const host = useRef(null);
  const requestId = useRef(null);
  const copiedTimer = useRef(0);
  const labelId = useId();
  const { active, visible, reduced } = usePlayback(host);
  const selectedAgent = INSTALL_AGENTS.find(agent => agent.id === agentId) ?? INSTALL_AGENTS[0];
  const selectedModel = MODELS.find(model => model.id === modelId) ?? MODELS[0];
  const logo = AGENTS[logoIndex % AGENTS.length];

  const fit = useCallback(() => {
    const input = textarea.current;
    if (!input) return;
    input.style.height = '0px';
    input.style.height = `${Math.min(280, Math.max(92, input.scrollHeight))}px`;
    input.style.overflowY = input.scrollHeight > 280 ? 'auto' : 'hidden';
  }, []);
  useLayoutEffect(fit, [text, fit]);
  useEffect(() => {
    let disposed = false;
    let width = 0;
    const observer = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect.width;
      if (width === nextWidth) return;
      width = nextWidth; fit();
    });
    if (host.current) observer.observe(host.current);
    document.fonts.ready.then(() => { if (!disposed) fit(); });
    return () => { disposed = true; observer.disconnect(); };
  }, [fit]);
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setLogoIndex(index => (index + 1) % AGENTS.length), 2800);
    return () => clearInterval(interval);
  }, [active]);
  useEffect(() => {
    const complete = event => {
      if (event.detail?.requestId !== requestId.current || !event.detail.copied) return;
      setCopied(true); clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2200);
    };
    window.addEventListener('stu:install-copy-result', complete);
    return () => { window.removeEventListener('stu:install-copy-result', complete); clearTimeout(copiedTimer.current); };
  }, []);
  const submit = () => {
    if (!text.trim()) return;
    requestId.current = crypto.randomUUID();
    const prompt = `目标 Agent：${selectedAgent.name}\n模型偏好：${selectedModel.name}\n\n${text.trim()}`;
    window.dispatchEvent(new CustomEvent('stu:copy-install', { detail:{ text:prompt, requestId:requestId.current } }));
  };
  const invalidateCopy = () => {
    requestId.current = null;
    clearTimeout(copiedTimer.current);
    copiedTimer.current = 0;
    setCopied(false);
  };

  return <div ref={host} className="agent-install-composer liquid-input" data-component="liquid-multimodal-input" data-logo-playing={active} data-has-value={Boolean(text)}>
    <div className="liquid-mascot-row">
      <div className="liquid-mascot" aria-hidden="true" data-logo-id={logo.id}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div className="liquid-mascot-logo" key={logo.id} initial={reduced ? false : { opacity:0, y:9, scale:.9 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:.92 }} transition={{ duration:reduced ? 0 : .22 }}><BrandMark item={logo} /></motion.div>
        </AnimatePresence>
      </div>
      <label htmlFor={labelId} className="liquid-input-label">安装 Prompt</label>
      {!text && <div className="liquid-mascot-copy">下一句，交给你的 Agent。</div>}
    </div>
    <div className="agent-prompt-surface liquid-input-surface">
      <div className="liquid-matte-noise" aria-hidden="true" />
      <div className="liquid-inner-edge" aria-hidden="true" />
      <div className="liquid-input-text">
        <textarea id={labelId} ref={textarea} value={text} onChange={event => { setText(event.target.value); invalidateCopy(); }}
          className="agent-prompt-input" aria-label="安装 Prompt" spellCheck={false} rows={3}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && !event.isComposing && event.keyCode !== 229) {
              event.preventDefault(); submit();
            }
          }} />
      </div>
      <div className="agent-prompt-rail liquid-input-toolbar">
        <CatalogSelector kind="agent" items={INSTALL_AGENTS} value={agentId} onChange={value => { setAgentId(value); setLogoIndex(AGENTS.findIndex(item => item.id === value)); invalidateCopy(); }} reduced={reduced} />
        <div className="liquid-toolbar-end">
          <CatalogSelector kind="model" items={MODELS} value={modelId} onChange={value => { setModelId(value); invalidateCopy(); }} reduced={reduced} align="right" />
          <SendButton active={active} visible={visible} reduced={reduced} disabled={!text.trim()} onClick={submit} copied={copied} />
        </div>
      </div>
    </div>
  </div>;
}
