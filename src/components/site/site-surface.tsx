'use client';
import { type ComponentProps, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeEffects } from '@/components/home/home-effects';
import { MotionEffects } from '@/components/site/motion-effects';
import { BottomNav } from '@/components/home/bottom-nav';
import { SITE_NAVIGATION, navigationHref } from '@/lib/site-navigation';
import { useActiveSection } from '@/components/site/use-active-section';
import { useLocale } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';

export function SiteSurface({ children }: { children: ReactNode }) {
  const path = usePathname();
  return <div className={`home home--studio${path !== '/' ? ' home--inner' : ''}`} id="top"><HomeEffects path={path} /><MotionEffects path={path} />{children}</div>;
}
export function PublicNavigation() {
  const path = usePathname();
  const locale = useLocale();
  const section = useActiveSection(path);
  return <nav className="home-nav" aria-label={t('Primary navigation',locale)}>{SITE_NAVIGATION.map(item => {
    const href = navigationHref(item);
    const current = path === '/' ? item.id === section : item.href === path;
    return <Link key={item.id} href={href} className={current ? 'is-active' : undefined} aria-current={current ? path === '/' ? 'location' : 'page' : undefined}>{t(item.label,locale)}</Link>;
  })}</nav>;
}
export function SiteBottomNav(props: Omit<ComponentProps<typeof BottomNav>, 'currentPath'>) {
  const path = usePathname();
  return <BottomNav key={path} currentPath={path} {...props} />;
}
