'use client';
import { useEffect } from 'react';

/* Dependency-free ports of Magic UI motion patterns, applied by class so
   server-rendered markup stays untouched:
   - magic-card spotlight: cards track the pointer via --mx / --my
   - text-animate + highlighter: heading words rise in, last word gets marked
   - magnetic primary buttons
   - CSS-only parts live in motion.css and fx.css
   Everything is skipped under prefers-reduced-motion. */
const SPOTLIGHT = '.home-scard, .home-member, .home-review, .salon-google-reviews, .home-card, .directory-person';

export function MotionEffects({ path }: { path: string }) {
  // ── WhatsApp button: on dock-sized screens it tucks away while the reader
  //    scrolls down (so it never sits on top of prices or headings) and returns
  //    on scroll-up, after a short pause, or near the top of the page. ──
  useEffect(() => {
    const docked = window.matchMedia('(max-width: 1023px)');
    let lastY = window.scrollY;
    let idle = 0;
    const fab = () => document.querySelector<HTMLElement>('.wa-fab');
    const set = (tucked: boolean) => fab()?.classList.toggle('is-tucked', tucked);
    const header = () => document.querySelector<HTMLElement>('.home-header');
    // PC: lift the button above the footer's bottom line once that line is on
    // screen. (Phones/tablets leave empty room under that line instead.)
    const lift = () => {
      const el = fab();
      const row = document.querySelector<HTMLElement>('.home-foot__bottom');
      if (!el || !row) return;
      if (docked.matches) { el.style.setProperty('--fab-lift', '0px'); return; }
      const base = parseFloat(getComputedStyle(el).bottom) || 0;
      const overlap = window.innerHeight - base - (row.getBoundingClientRect().top - 16);
      el.style.setProperty('--fab-lift', `${Math.max(0, Math.round(overlap))}px`);
    };
    const onScroll = () => {
      const y = window.scrollY;
      lift();
      header()?.classList.toggle('is-raised', y > 8);
      window.clearTimeout(idle);
      if (!docked.matches) { set(false); lastY = y; return; }
      if (y > lastY + 4 && y > 240) set(true);
      else if (y < lastY - 4 || y <= 240) set(false);
      lastY = y;
      idle = window.setTimeout(() => set(false), 1400);
    };
    // hide while the dock's More / Account sheet is open
    const sheets = new MutationObserver(() => {
      const open = !!document.querySelector('.home-dock__sheet.is-open');
      fab()?.classList.toggle('is-hidden', open);
    });
    const dock = document.querySelector('.home-dock');
    if (dock) sheets.observe(dock, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', lift, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', lift);window.clearTimeout(idle); sheets.disconnect(); set(false); };
  }, [path]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    // ── spotlight cards (fine pointers only; touch has no hover) ──
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(SPOTLIGHT);
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - box.left}px`);
        card.style.setProperty('--my', `${event.clientY - box.top}px`);
      });
    };
    if (fine) document.addEventListener('pointermove', onMove, { passive: true });

    // ── headings: words rise in one by one, then the highlighter swipes under
    //    the last word (Magic UI text-animate + highlighter). Web Animations
    //    only, so React's server HTML is never rewritten. ──
    const ease = 'cubic-bezier(.16,1,.3,1)';
    const running = new Set<Animation>();
    const play = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = el.animate(frames, { easing: ease, fill: 'backwards', ...options });
      running.add(animation);
      animation.onfinish = () => running.delete(animation);
    };
    const headings = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      headings.unobserve(entry.target);
      const words = [...entry.target.querySelectorAll('.fx-w')];
      const base = 180;
      words.forEach((word, i) => play(word,
        [{ opacity: 0, transform: 'translateY(.4em)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: base + i * 75 }));
      const mark = entry.target.querySelector('.fx-w--mark');
      if (mark) play(mark, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 700, delay: base + words.length * 75 + 250, pseudoElement: '::after' });
      // the eyebrow chip just above gets one shine pass
      const eyebrow = entry.target.parentElement?.querySelector('.home-eyebrow');
      if (eyebrow) play(eyebrow, [{ transform: 'translateX(-110%)' }, { transform: 'translateX(110%)' }],
        { duration: 1300, delay: 120, pseudoElement: '::after', fill: 'none' });
    }), { threshold: 0.3 });
    const seen = new WeakSet<Element>();
    const scanHeadings = () => document.querySelectorAll('h1, h2').forEach(h => {
      if (seen.has(h) || !h.querySelector('.fx-w')) return;
      seen.add(h); headings.observe(h);
    });
    scanHeadings();
    // streamed sections (Suspense) arrive after this effect runs
    const streamed = new MutationObserver(scanHeadings);
    const main = document.getElementById('main-content');
    if (main) streamed.observe(main, { childList: true, subtree: true });

    // ── magnetic primary buttons: they lean a little toward the pointer ──
    const MAGNET = '.home-btn--primary, .btn--primary';
    let magnet: HTMLElement | null = null;
    const release = () => { if (magnet) { magnet.style.translate = ''; magnet = null; } };
    const onMagnet = (event: PointerEvent) => {
      const button = (event.target as Element | null)?.closest?.<HTMLElement>(MAGNET) ?? null;
      if (button !== magnet) release();
      if (!button) return;
      magnet = button;
      const box = button.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * 0.18;
      const y = (event.clientY - box.top - box.height / 2) * 0.28;
      button.style.transition = 'translate .35s cubic-bezier(.16,1,.3,1)';
      button.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };
    if (fine) {
      document.addEventListener('pointermove', onMagnet, { passive: true });
      document.addEventListener('pointerleave', release);
    }

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointermove', onMagnet);
      document.removeEventListener('pointerleave', release);
      release();
      cancelAnimationFrame(frame);
      headings.disconnect();
      streamed.disconnect();
      running.forEach(animation => animation.cancel());
    };
  }, [path]);
  return null;
}
