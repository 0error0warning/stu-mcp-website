import './fonts.css';
import './side-quest.css';
import './styles.css';
import sharedDefs from './shared-defs.html?raw';
import { illustrations } from './illustrations.js';
import './reactdrops.jsx';

document.getElementById('shared-defs').innerHTML = sharedDefs;

const scenarios = [
  { id: '01', key: 'notice', category: 'study', name: '通知，连附件一起。', source: '通知 · PDF', color: 'oklch(.92 .065 96)', prompt: '帮我查最近相关的通知，读一下 PDF 附件，把重点和原文链接一起给我。' },
  { id: '02', key: 'homework', category: 'study', name: '作业，心里有个底。', source: 'MySTU · 课程', color: 'oklch(.91 .055 295)', prompt: '整理一下 MySTU 接下来两周的作业，按截止时间排一排，并保留来源。' },
  { id: '03', key: 'competition', category: 'study', name: '好机会，别错过。', source: '通知检索 · 原文', color: 'oklch(.91 .07 65)', prompt: '查查已有通知里有哪些适合我报名的竞赛，把截止时间和原文找出来。' },
  { id: '04', key: 'community', category: 'life', name: '听听，大家怎么说。', source: '狐友 · 公开讨论', color: 'oklch(.92 .05 155)', prompt: '狐友里有人聊过这门选修课吗？搜一下公开帖子和评论，给我讨论出处。' },
  { id: '05', key: 'card', category: 'life', name: '余额，查一下就好。', source: '一卡通 · 只读', color: 'oklch(.91 .055 240)', prompt: '查一下我已连接的一卡通余额和最近七天的消费流水，只读查询。' },
  { id: '06', key: 'repair', category: 'life', name: '报修，先看清再确认。', source: '宿舍报修 · 预览', color: 'oklch(.92 .055 15)', prompt: '帮我准备宿舍报修，先完整预览表单，不要提交，等我本人明确确认。' },
];

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const grid = document.getElementById('ideas-grid');
const status = document.getElementById('status');
const dialog = document.getElementById('copy-dialog');
let toastTimer;
function announce(message) {
  status.textContent = message;
  status.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => status.classList.remove('show'), 3000);
}

async function copyText(text, success, button) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    announce(success);
    if (button) {
      button.classList.add('copied');
      const label = button.querySelector('.copy-label');
      if (label) label.textContent = '已复制，交给你的 Agent';
      setTimeout(() => {
        button.classList.remove('copied');
        if (label) label.textContent = '复制问句';
      }, 2600);
    }
  } catch {
    const textarea = document.getElementById('copy-fallback');
    textarea.value = text;
    dialog.showModal();
    textarea.focus();
    textarea.select();
  }
}

const installPrompt = document.getElementById('install-prompt').textContent.trim();
const copyInstall = () => copyText(installPrompt, '安装指令已复制，把它发给你的 Agent。');
document.querySelectorAll('[data-copy-install]').forEach(button => button.addEventListener('click', copyInstall));
window.addEventListener('stu:copy-install', copyInstall);
document.getElementById('close-copy-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
});

const io = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  }
}, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.reveal, #timeline').forEach(el => io.observe(el));

function renderScenarios(filter = 'all') {
  const visible = scenarios.filter(s => filter === 'all' || s.category === filter);
  grid.innerHTML = visible.map(s => `<article class="idea-card in" style="--idea-color:${s.color}" aria-labelledby="scenario-${s.id}">
    <div class="idea-art"><span class="idea-id">${s.id}</span><svg viewBox="0 0 200 160" aria-hidden="true">${illustrations[s.key]}</svg><span class="idea-tag">${s.source}</span></div>
    <div class="card-content"><h3 id="scenario-${s.id}">${s.name}</h3><p class="idea-description">「${s.prompt}」</p>
    <button class="copy-prompt" type="button" data-prompt="${s.id}" aria-label="复制${s.name}的示例问句"><span class="copy-label">复制问句</span><span aria-hidden="true">↗</span></button></div>
  </article>`).join('');
}
renderScenarios();
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-prompt]');
  if (!button) return;
  const scenario = scenarios.find(s => s.id === button.dataset.prompt);
  copyText(scenario.prompt, '问句已复制。接入后，发给你的 Agent 试试。', button);
});

const filterPill = document.querySelector('.filters .pill');
function movePill() {
  const active = document.querySelector('[data-filter][aria-pressed="true"]');
  filterPill.style.width = `${active.offsetWidth}px`;
  filterPill.style.transform = `translateX(${active.offsetLeft}px)`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  renderScenarios(button.dataset.filter);
  movePill();
}));
addEventListener('resize', movePill);
document.fonts.ready.then(movePill);
movePill();

grid.addEventListener('pointermove', e => {
  if (motionQuery.matches || e.pointerType === 'touch') return;
  const card = e.target.closest('.idea-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  card.style.setProperty('--my', `${e.clientY - rect.top}px`);
});
if (matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('pointermove', e => {
      if (motionQuery.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * .12}px, ${(e.clientY - rect.top - rect.height / 2) * .2}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

const header = document.getElementById('header');
const progress = document.getElementById('progress');
let scrollPending = false;
function updateScroll() {
  header.classList.toggle('scrolled', scrollY > 12);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  scrollPending = false;
}
addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
updateScroll();

document.querySelectorAll('.faq-list details').forEach(details => details.addEventListener('toggle', () => {
  if (!details.open) return;
  document.querySelectorAll('.faq-list details').forEach(other => { if (other !== details) other.open = false; });
}));

async function loadActivity() {
  const summary = document.getElementById('activity-summary');
  const calendar = document.getElementById('activity-calendar');
  const detail = document.getElementById('activity-detail');
  try {
    const response = await fetch('/data/activity.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.days) || data.days.length === 0) throw new Error('No daily data');
    summary.textContent = `过去一年，${data.totalCommits} 次提交，${data.activeDays} 个活跃日。`;
    const dayStart = new Date(`${data.days[0].date}T00:00:00Z`);
    const offset = (dayStart.getUTCDay() + 6) % 7;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < offset; i++) {
      const pad = document.createElement('span');
      pad.className = 'calendar-pad';
      fragment.append(pad);
    }
    const max = Math.max(...data.days.map(d => d.count), 1);
    const buttons = [];
    for (const day of data.days) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.dataset.level = day.count === 0 ? 0 : Math.min(4, Math.ceil(day.count / max * 4));
      const label = `${day.date}：${day.count} 次仓库提交`;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', 'false');
      button.title = label;
      button.tabIndex = -1;
      button.addEventListener('click', () => {
        buttons.forEach(b => { b.setAttribute('aria-pressed', String(b === button)); b.tabIndex = b === button ? 0 : -1; });
        detail.textContent = `${label}。统计口径：main 分支、提交者日期（UTC）。`;
      });
      buttons.push(button);
      fragment.append(button);
    }
    buttons.at(-1).tabIndex = 0;
    calendar.replaceChildren(fragment);
    calendar.addEventListener('keydown', e => {
      const index = buttons.indexOf(document.activeElement);
      if (index === -1) return;
      const delta = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key];
      let next = delta === undefined ? undefined : Math.min(buttons.length - 1, Math.max(0, index + delta));
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      e.preventDefault();
      buttons[index].tabIndex = -1;
      buttons[next].tabIndex = 0;
      buttons[next].focus();
    });
    const months = document.createElement('div');
    months.className = 'calendar-months';
    months.setAttribute('aria-hidden', 'true');
    let lastMonth = -1;
    data.days.forEach((day, i) => {
      const date = new Date(`${day.date}T00:00:00Z`);
      if (date.getUTCMonth() === lastMonth) return;
      lastMonth = date.getUTCMonth();
      // Omit a partial first month that shares its only week with the next one.
      if (i === 0 && date.getUTCDate() > 24) return;
      const label = document.createElement('span');
      label.textContent = `${lastMonth + 1}月`;
      label.style.gridColumn = `${Math.floor((i + offset) / 7) + 1}`;
      months.append(label);
    });
    calendar.before(months);
    const updated = new Date(data.generatedAt).toLocaleDateString('zh-CN', { timeZone: 'UTC' });
    document.getElementById('activity-updated').textContent = `快照更新于 ${updated} · UTC`;
    detail.textContent = `${data.dateRange.start} — ${data.dateRange.end}。仅该仓库提交，不代表个人 GitHub 全站贡献。`;
    const scroller = document.querySelector('.activity-scroll');
    scroller.scrollLeft = scroller.scrollWidth;
  } catch {
    summary.textContent = '暂无可用的提交数据';
    document.getElementById('activity-updated').textContent = '请稍后再试，或直接查看 GitHub';
    detail.textContent = '这里仅显示真实仓库数据。';
  }
}
loadActivity();
