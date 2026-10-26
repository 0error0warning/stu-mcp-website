import './fonts.css';
import './side-quest.css';
import './styles.css';
import sharedDefs from './shared-defs.html?raw';
import { illustrations } from './illustrations.js';
import './reactdrops.jsx';
import './motion-regions.js';
import './activity.js';
import { mountHeader } from './site-header.jsx';
import { mountMagicSections } from './magic-sections.jsx';
import { mountAgentInstall } from './agent-install.jsx';
import { mountNightHero } from './night-hero.jsx';
import './feedback.css';
import './theme.css';
import './night-hero.css';
import './hero-actions.css';
import './footer-night.css';

document.getElementById('shared-defs').innerHTML = sharedDefs;
mountHeader();
mountMagicSections();
mountAgentInstall();
mountNightHero();

const scenarios = [
  { id: '01', key: 'notice', category: 'study', name: '通知，连附件一起。', source: '通知 · PDF', color: 'oklch(.92 .065 96)', prompt: '帮我查最近相关的通知，读一下 PDF 附件，把重点和原文链接一起给我。' },
  { id: '02', key: 'homework', category: 'study', name: '作业，心里有个底。', source: 'MySTU · 课程', color: 'oklch(.91 .055 295)', prompt: '整理一下 MySTU 接下来两周的作业，按截止时间排一排，并保留来源。' },
  { id: '03', key: 'timetable', category: 'study', name: '课表，问清下一节。', source: '教务 · 理论课表', color: 'oklch(.91 .07 65)', prompt: '查我本学期的理论课表，按星期整理课程、上课周次、节次和教室。' },
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
    return true;
  } catch {
    const textarea = document.getElementById('copy-fallback');
    textarea.value = text;
    dialog.showModal();
    textarea.focus();
    textarea.select();
    return false;
  }
}

const installPrompt = document.getElementById('install-prompt').textContent.trim();
const copyInstall = async event => {
  const copied = await copyText(event?.detail?.text ?? installPrompt, '安装 Prompt 已复制。');
  if (event?.detail?.requestId) window.dispatchEvent(new CustomEvent('stu:install-copy-result', {
    detail: { requestId: event.detail.requestId, copied },
  }));
};
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
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function renderScenarios(filter = 'all') {
  const visible = scenarios.filter(s => filter === 'all' || s.category === filter);
  grid.innerHTML = visible.map(s => `<article class="idea-card in" style="--idea-color:${s.color}" aria-labelledby="scenario-${s.id}">
    <div class="idea-art"><span class="idea-id">${s.id}</span><svg viewBox="0 0 200 160" aria-hidden="true">${illustrations[s.key]}</svg><span class="idea-tag">${s.source}</span></div>
    <div class="card-content"><h3 id="scenario-${s.id}">${s.name}</h3><p class="idea-description">「${s.prompt}」</p>
    <button class="copy-prompt" type="button" data-prompt="${s.id}" aria-label="复制${s.name}的示例问句"><span class="copy-label">复制问句</span><span aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span></button></div>
  </article>`).join('');
}
renderScenarios();

let filterAnimations = [];
let filterGhosts = [];
function transitionScenarios(filter) {
  filterAnimations.forEach(animation => animation.cancel());
  filterGhosts.forEach(ghost => ghost.remove());
  filterAnimations = [];
  filterGhosts = [];
  const before = grid.getBoundingClientRect();
  const oldCards = [...grid.children];
  const positions = new Map(oldCards.map(card => [card.getAttribute('aria-labelledby'), card.getBoundingClientRect()]));
  const oldHeight = before.height;
  const visible = new Set(scenarios.filter(s => filter === 'all' || s.category === filter).map(s => `scenario-${s.id}`));
  if (!motionQuery.matches) {
    for (const card of oldCards) {
      if (visible.has(card.getAttribute('aria-labelledby'))) continue;
      const rect = card.getBoundingClientRect();
      const ghost = card.cloneNode(true);
      ghost.classList.add('filter-exit');
      ghost.removeAttribute('aria-labelledby');
      ghost.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      ghost.setAttribute('aria-hidden', 'true');
      ghost.inert = true;
      Object.assign(ghost.style, { position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0' });
      document.body.append(ghost);
      filterGhosts.push(ghost);
      const exit = ghost.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 150, easing: 'ease-out' });
      exit.onfinish = () => ghost.remove();
      filterAnimations.push(exit);
    }
  }
  renderScenarios(filter);
  if (motionQuery.matches) return;
  [...grid.children].forEach((card, index) => {
    const key = card.getAttribute('aria-labelledby');
    const current = card.getBoundingClientRect();
    const previous = positions.get(key);
    const frames = previous ? [{ transform: `translate(${previous.left - current.left}px, ${previous.top - current.top}px)`, opacity: 1 }, { transform: 'translate(0, 0)', opacity: 1 }]
      : [{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }];
    filterAnimations.push(card.animate(frames, { duration: 320, delay: previous ? 0 : index * 25, easing: 'cubic-bezier(.2,.75,.2,1)' }));
  });
  const newHeight = grid.getBoundingClientRect().height;
  if (Math.abs(oldHeight - newHeight) > 1) filterAnimations.push(grid.animate([{ height: `${oldHeight}px` }, { height: `${newHeight}px` }], { duration: 340, easing: 'cubic-bezier(.2,.75,.2,1)' }));
}
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
  if (button.getAttribute('aria-pressed') === 'true') return;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  transitionScenarios(button.dataset.filter);
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
