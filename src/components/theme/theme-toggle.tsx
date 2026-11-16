'use client';
import type { MouseEvent } from 'react';
import { useLocale } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';

/* Theme switch:
   1. While the theme flips, every CSS transition is paused (data-theme-switching
      on <html>). Otherwise body, borders and text fade over .3s while section
      backgrounds change instantly, and stripes/lines flash between sections.
   2. Where the browser supports View Transitions, the new theme spreads out in a
      circle from the toggle (Magic UI "animated theme toggler"). Elsewhere, or
      with reduced motion, it switches in one clean step. */
export function ThemeToggle() {
  const locale = useLocale();
  function apply(next: 'light' | 'dark') {
    const root = document.documentElement;
    root.setAttribute('data-theme-switching', '');
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('vero-theme', next); } catch {}
    // read layout so the new colours land before transitions come back
    void root.offsetHeight;
    requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute('data-theme-switching')));
  }
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof document.startViewTransition !== 'function') { apply(next); return; }

    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.setAttribute('data-theme-switching', '');
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  }
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={t('Toggle light and dark theme', locale)} title={t('Toggle theme', locale)}>
      <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <svg className="i-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
    </button>
  );
}
