'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { t } from '@/lib/i18n/translations';

const portraits = [
  { src: '/images/generated/hero-selected.webp', alt: 'Textured haircut and groomed beard' },
  { src: '/images/generated/hero-women.webp', alt: 'Soft layers and a glossy blowout' },
  { src: '/images/generated/hero-children.webp', alt: 'A fresh haircut and a happy smile' },
];
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
export function HeroPortraits({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState<boolean[]>([false, false, false]);
  const region = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
  const visible = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === 'visible', () => true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: .15 });
    if (region.current) observer.observe(region.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (reduced || !visible || !inView || !ready[(active + 1) % portraits.length]) return;
    const timer = window.setTimeout(() => setActive(previous => (previous + 1) % portraits.length), 5500);
    return () => window.clearTimeout(timer);
  }, [active, reduced, visible, inView, ready]);
  return <div className="studio-hero-visual salon-hero-rotation home-reveal" ref={region} role="region" aria-label={t('Style for everyone', locale)} aria-roledescription={t('carousel', locale)}>
    <div className="studio-hero-shape" aria-hidden="true" />
    <div className="studio-hero-image">
      {portraits.map((portrait, index) => <div className={`salon-hero-slide${active === index ? ' is-active' : ''}`} aria-hidden={active !== index} key={portrait.src}>
        <Image src={portrait.src} alt={t(portrait.alt, locale)} fill unoptimized loading="eager" fetchPriority={index === 0 ? 'high' : 'low'} sizes="(max-width: 767px) 100vw, 60vw" onLoad={() => setReady(previous => previous[index] ? previous : previous.map((value, i) => i === index || value))} />
      </div>)}
    </div>
  </div>;
}
