import { activityRange, groupActivityWeeks, validateActivity } from './activity-data.js';
import './activity.css';

const panel = document.querySelector('.activity-panel');
const fullDate = date => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const shortDate = date => `${Number(date.slice(5, 7))}.${Number(date.slice(8, 10))}`;

async function readData(url, timeout) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Activity unavailable (${response.status})`);
  return validateActivity(await response.json());
}

async function loadData() {
  try {
    return await readData('/api/activity', 6000);
  } catch {
    return await readData('/data/activity.json', 3000);
  }
}

function initializeActivity() {
  if (!panel) return;
  // The visible product has one compact chart, rather than a year of zero cells
  // and source/debug footnotes. Exact dates/counts remain in each cell's name.
  panel.classList.add('activity-compact');
  panel.innerHTML = `<div class="activity-overview"><span class="activity-kicker">项目动态</span><strong id="activity-summary" class="activity-total">—<span>次提交</span></strong><p class="activity-period" id="activity-period">读取提交记录…</p><div class="activity-period-switch" role="group" aria-label="提交记录时间范围"><button type="button" data-activity-range="30" aria-pressed="true">30 天</button><button type="button" data-activity-range="90" aria-pressed="false">90 天</button></div></div><div class="activity-chart-area"><div class="activity-chart-top"><span id="activity-unit">每天</span><span class="activity-chart-selection" id="activity-selection" aria-live="polite"></span></div><div class="activity-chart" id="activity-chart" aria-label="仓库提交记录"></div></div>`;
  const summary = panel.querySelector('#activity-summary');
  const period = panel.querySelector('#activity-period');
  const selection = panel.querySelector('#activity-selection');
  const unit = panel.querySelector('#activity-unit');
  const chart = panel.querySelector('#activity-chart');
  const switches = [...panel.querySelectorAll('[data-activity-range]')];
  let snapshot;
  let selectedLength = 30;

  function render() {
    if (!snapshot) return;
    const range = activityRange(snapshot, selectedLength);
    switches.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.activityRange) === selectedLength)));
    summary.replaceChildren(document.createTextNode(range.total.toLocaleString('zh-CN')), Object.assign(document.createElement('span'), { textContent: '次提交' }));
    period.textContent = range.start.slice(0, 4) === range.end.slice(0, 4)
      ? `${range.end.slice(0, 4)} · ${shortDate(range.start)} — ${shortDate(range.end)}`
      : `${range.start.replaceAll('-', '.')} — ${range.end.replaceAll('-', '.')}`;
    selection.textContent = '';
    chart.replaceChildren();
    const fragment = document.createDocumentFragment();
    const weekly = selectedLength === 90;
    chart.classList.toggle('activity-weeks', weekly);
    chart.classList.toggle('activity-days', !weekly);
    unit.textContent = weekly ? '每周' : '每天';
    const values = weekly ? groupActivityWeeks(range.days) : range.days;
    const maximum = Math.max(...values.map(day => day.count), 1);
    let focusedIndex = values.length - 1;
    const buttons = [];

    values.forEach((day, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = weekly ? 'activity-week' : 'activity-day';
      button.dataset.level = day.count === 0 ? '0' : String(Math.min(4, Math.ceil(day.count / maximum * 4)));
      const date = weekly ? `${fullDate(day.start)}至${fullDate(day.end)}` : fullDate(day.date);
      const label = `${date}，${day.count} 次提交`;
      button.setAttribute('aria-label', label);
      button.title = label;
      button.setAttribute('aria-pressed', 'false');
      button.tabIndex = index === focusedIndex ? 0 : -1;
      if (weekly) {
        const bar = document.createElement('span'); bar.className = 'activity-week-bar'; bar.style.setProperty('--bar-height', `${day.count === 0 ? 3 : 8 + day.count / maximum * 80}px`); bar.setAttribute('aria-hidden', 'true');
        const tick = document.createElement('span'); tick.className = 'activity-week-date'; tick.textContent = shortDate(day.start); tick.setAttribute('aria-hidden', 'true');
        button.append(bar, tick);
      } else button.textContent = String(Number(day.date.slice(8)));
      button.addEventListener('click', () => {
        buttons.forEach((item, i) => { item.setAttribute('aria-pressed', String(i === index)); item.tabIndex = i === index ? 0 : -1; });
        focusedIndex = index;
        selection.textContent = `${weekly ? `${shortDate(day.start)}–${shortDate(day.end)}` : fullDate(day.date)} · ${day.count} 次`;
      });
      button.addEventListener('keydown', event => {
        // Follow the rendered grid, including responsive column changes, rather
        // than duplicating CSS breakpoints in keyboard navigation.
        const layout = getComputedStyle(chart);
        const columns = layout.display === 'grid'
          ? Math.max(1, layout.gridTemplateColumns.trim().split(/\s+/).length)
          : 1;
        const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
        let next = delta === undefined ? undefined : Math.min(values.length - 1, Math.max(0, index + delta));
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = values.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        buttons[focusedIndex].tabIndex = -1;
        focusedIndex = next;
        buttons[next].tabIndex = 0;
        buttons[next].focus();
      });
      buttons.push(button);
      fragment.append(button);
    });
    chart.append(fragment);
  }

  switches.forEach(button => button.addEventListener('click', () => {
    selectedLength = Number(button.dataset.activityRange);
    render();
  }));
  loadData().then(data => { snapshot = data; render(); }).catch(() => {
    summary.textContent = '暂时无法读取';
    summary.classList.add('activity-unavailable');
    period.textContent = '去 GitHub 看看最新提交';
    switches.forEach(button => { button.disabled = true; });
  });
}

initializeActivity();
