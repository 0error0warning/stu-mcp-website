import React from 'react';
import { createRoot } from 'react-dom/client';
import { LiquidAgentInput } from './components/liquid-agent-input.jsx';
import './agent-install.css';

let mounted;
export function mountAgentInstall() {
  const host = document.getElementById('agent-install');
  const source = document.getElementById('install-prompt');
  if (!host || !source || mounted || host.dataset.agentInstallMounted) return;
  const wasHidden = source.hidden;
  source.hidden = true;
  host.dataset.agentInstallMounted = 'true';
  const root = createRoot(host);
  root.render(<LiquidAgentInput initialText={source.textContent.trim()} />);
  mounted = { host, source, wasHidden, root };
}

if (import.meta.hot) import.meta.hot.dispose(() => {
  if (!mounted) return;
  mounted.root.unmount();
  mounted.source.hidden = mounted.wasHidden;
  delete mounted.host.dataset.agentInstallMounted;
  mounted = null;
});
