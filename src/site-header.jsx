import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, GitBranch, HelpCircle, Workflow } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { Dock, DockIcon } from './components/magicui/dock';
import { AnimatedThemeToggler } from './components/magicui/animated-theme-toggler';
import './site-header.css';

const links = [
  { href: '#ideas', label: '能做什么', Icon: BookOpen },
  { href: '#how', label: '如何工作', Icon: Workflow },
  { href: '#progress-section', label: '项目进展', Icon: GitBranch },
  { href: '#faq', label: '常见问题', Icon: HelpCircle },
];

function HeaderDock() {
  const reduced = useReducedMotion();
  const [finePointer, setFinePointer] = useState(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
  const [active, setActive] = useState('');
  useEffect(() => {
    const media = matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const href = `#${entry.target.id}`;
        setActive(links.some(link => link.href === href) ? href : '');
      }
    }, { rootMargin: '-20% 0px -60% 0px' });
    const hero = document.querySelector('.hero-full');
    if (hero) observer.observe(hero);
    // Unlinked sections clear the selection too; otherwise a direct jump to
    // installation incorrectly leaves the previously viewed link highlighted.
    document.querySelectorAll('main > section').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <Dock disableMagnification={reduced || !finePointer}>
    {links.map(({ href, label, Icon }) => <DockIcon key={href} href={href} label={label} active={active === href}>
      <Icon size={19} strokeWidth={1.65} />
    </DockIcon>)}
  </Dock>;
}

export function mountHeader() {
  const dock = document.getElementById('md-dock');
  const theme = document.getElementById('md-theme');
  if (dock && !dock.dataset.reactMounted) {
    dock.dataset.reactMounted = 'true';
    createRoot(dock).render(<HeaderDock />);
  }
  if (theme && !theme.dataset.reactMounted) {
    theme.dataset.reactMounted = 'true';
    createRoot(theme).render(<AnimatedThemeToggler className="theme-toggle" duration={420} variant="circle" />);
  }
}
