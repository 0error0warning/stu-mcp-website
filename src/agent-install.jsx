import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Copy, MessageSquareText } from 'lucide-react';
import './agent-install.css';

// Visual reference: Wensity Labs' Liquid Multimodal Input on 21st.dev.
// https://21st.dev/@wensity/components/liquid-multimodal-input
// The public preview was inspected on 2026-10-26. Its component source is
// account-gated; this product-specific implementation does not copy that code.
// The single frosted input surface, growing text area and lower action rail
// follow the visible reference. File upload/model controls are omitted because
// this page copies an installation prompt into the visitor's own Agent.
function AgentInstall({ initialText }) {
  const [text, setText] = useState(initialText);
  const textarea = useRef(null);
  const surface = useRef(null);
  const labelId = useId();
  const copy = () => {
    if (!text.trim()) return;
    window.dispatchEvent(new CustomEvent('stu:copy-install', { detail: { text } }));
  };
  const fit = () => {
    const input = textarea.current;
    if (!input) return;
    input.style.height = '0px';
    const height = Math.min(280, Math.max(84, input.scrollHeight));
    input.style.height = `${height}px`;
    input.style.overflowY = input.scrollHeight > 280 ? 'auto' : 'hidden';
  };
  useLayoutEffect(fit, [text]);
  useEffect(() => {
    let disposed = false;
    let width = 0;
    const observer = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect.width;
      if (nextWidth === width) return;
      width = nextWidth;
      fit();
    });
    if (surface.current) observer.observe(surface.current);
    document.fonts.ready.then(() => { if (!disposed) fit(); });
    return () => { disposed = true; observer.disconnect(); };
  }, []);

  return <div className="agent-install-composer" data-component="agent-prompt-composer">
    <label className="agent-install-label" htmlFor={labelId}>交给你的 Agent</label>
    <div ref={surface} className="agent-prompt-surface">
      <textarea id={labelId} ref={textarea} value={text} onChange={event => setText(event.target.value)}
        className="agent-prompt-input" aria-label="安装 Prompt" spellCheck={false} rows={3}
        onKeyDown={event => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            copy();
          }
        }} />
      <div className="agent-prompt-rail">
        <span className="agent-prompt-destination"><MessageSquareText aria-hidden="true" size={16} strokeWidth={1.6} /><span>Codex · Claude Code</span></span>
        <button type="button" className="agent-prompt-copy" onClick={copy} disabled={!text.trim()}
          aria-label="复制安装 Prompt" aria-keyshortcuts="Control+Enter Meta+Enter">
          <span>复制 Prompt</span><span className="agent-prompt-copy-icon"><Copy size={18} aria-hidden="true" strokeWidth={1.7} /></span>
        </button>
      </div>
    </div>
  </div>;
}

let mounted;
export function mountAgentInstall() {
  const host = document.getElementById('agent-install');
  const source = document.getElementById('install-prompt');
  if (!host || !source || mounted || host.dataset.agentInstallMounted) return;
  const wasHidden = source.hidden;
  source.hidden = true;
  host.dataset.agentInstallMounted = 'true';
  const root = createRoot(host);
  root.render(<AgentInstall initialText={source.textContent.trim()} />);
  mounted = { host, source, wasHidden, root };
}

if (import.meta.hot) import.meta.hot.dispose(() => {
  if (!mounted) return;
  mounted.root.unmount();
  mounted.source.hidden = mounted.wasHidden;
  delete mounted.host.dataset.agentInstallMounted;
  mounted = null;
});
