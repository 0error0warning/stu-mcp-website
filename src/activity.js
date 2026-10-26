import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ActivityHeatmap } from './components/community/arc-activity/activity-heatmap';
import { activityRange, validateActivity } from './activity-data.js';
import './activity.css';

// The owner's referenced Arc component provides the actual calendar, tooltip,
// legend, reveal and keyboard behavior. Only real public repository data enters it.
const panel = document.querySelector('.activity-panel');
let activityRoot;
let disposed = false;

async function readData(url, timeout) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Activity unavailable (${response.status})`);
  return validateActivity(await response.json());
}
async function loadData() {
  try { return await readData('/api/activity', 6000); }
  catch { return await readData('/data/activity.json', 3000); }
}
function RepositoryHeatmap({ data }) {
  const [selected, setSelected] = useState(null);
  const range = activityRange(data, 90);
  const start = range.start.replaceAll('-', '.');
  const end = range.end.slice(0, 4) === range.start.slice(0, 4) ? range.end.slice(5).replace('-', '.') : range.end.replaceAll('-', '.');
  return React.createElement(ActivityHeatmap, {
    days: range.days,
    label: `STU-MCP 仓库提交，${range.start} 至 ${range.end}`,
    period: `${start} — ${end}`,
    unit: { one: '次提交', other: '次提交' },
    locale: 'zh-CN', weekStartsOn: 1,
    selectedDate: selected, onSelectDate: setSelected,
    className: 'repository-heatmap',
  });
}
if (panel) {
  panel.className = 'activity-panel activity-heatmap-panel reveal';
  panel.dataset.activityComponent = 'arc-activity-heatmap';
  panel.innerHTML = '<p class="activity-loading" role="status">读取提交记录…</p>';
  loadData().then(data => {
    if (disposed) return;
    activityRoot = createRoot(panel);
    activityRoot.render(React.createElement(RepositoryHeatmap, { data }));
  }).catch(() => {
    if (disposed) return;
    panel.innerHTML = '<p class="activity-loading">暂时无法读取提交记录。<a href="https://github.com/0error0warning/stu-mcp/commits/main/" target="_blank" rel="noreferrer">去 GitHub 看看 ↗</a></p>';
  });
}

if (import.meta.hot) import.meta.hot.dispose(() => { disposed = true; activityRoot?.unmount(); });
