'use client';
import { useEffect } from 'react';

/** Animate presentation without changing attributes on React's streamed HTML. */
export function HomeEffects({ path = '/' }: { path?: string }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observed = new WeakSet<HTMLElement>();
    const delays = new WeakMap<Element, number>();
    const animations = new Set<Animation>();
    const targets = '.home-reveal, .home-hero__display .ln, .studio-hero-copy > .home-eyebrow, .home-hero__lead, .home-hero__actions, .studio-hero-rating, .home-scard, .salon-gallery__item';
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal.unobserve(entry.target);
        const element = entry.target as HTMLElement;
        if (reduce.matches || typeof element.animate !== 'function') return;
        // Web Animations do not write class/style attributes, even when this layout
        // hydrates before a streamed page or nested Suspense boundary.
        const portrait = element.matches('.studio-hero-visual');
        const animation = element.animate(
          // fade-up: opacity + transform only, so it stays on the compositor (a blur filter on large blocks dropped frames while scrolling)
          [{ opacity: 0, transform: portrait ? 'translateX(65px) scale(.96)' : 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
          { duration: portrait ? 1250 : 1000, delay: delays.get(element) ?? 0, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0.12 });
    function register(element: HTMLElement) {
      if (!element.matches(targets) || observed.has(element)) return;
      // Animate the individual lines/cards instead of fading their parent twice.
      if (element.matches('.studio-hero-copy') || (element.matches('.home-reveal') && element.querySelector('.home-scard, .salon-gallery__item'))) return;
      observed.add(element);
      const hero = element.closest('.studio-hero-copy');
      const siblings = hero ? [...hero.querySelectorAll(targets)] : [...(element.parentElement?.children ?? [])].filter(child => child.matches(targets));
      delays.set(element, Math.max(0, siblings.indexOf(element)) % 7 * (hero ? 110 : 95));
      reveal.observe(element);
    }
    function registerTree(root: HTMLElement) {
      register(root);
      root.querySelectorAll<HTMLElement>(targets).forEach(register);
    }
    const main = document.getElementById('main-content');
    if (main) registerTree(main);
    const updates = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node instanceof HTMLElement) registerTree(node);
    })));
    if (main) updates.observe(main, { childList: true, subtree: true });
    const cancelAnimations = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };
    const onPreferenceChange = () => { if (reduce.matches) cancelAnimations(); };
    reduce.addEventListener('change', onPreferenceChange);
    return () => {
      reveal.disconnect(); updates.disconnect(); cancelAnimations();
      reduce.removeEventListener('change', onPreferenceChange);
    };
  }, [path]);
  return null;
}
