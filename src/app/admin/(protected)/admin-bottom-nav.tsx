'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { signOut } from '../actions';
import { useT } from '@/lib/i18n/locale-context';

export type AdminNavItem = { href: string; label: string; icon: IconName; short?: string };

/**
 * App-style bottom navigation for admin/staff on mobile (mirrors the public
 * site's bottom nav). Shows up to 5 primary tabs in the bar; any remaining
 * items + Back-to-site + Sign out live in a slide-up "More" sheet.
 *
 * The parent decides which items are primary vs. overflow so the same
 * component serves both the long admin nav and the short staff nav.
 */
export function AdminBottomNav({
  primary,
  overflow,
  root = '/admin',
  account,
  showTheme = true,
  extra,
}: {
  primary: AdminNavItem[];
  overflow: AdminNavItem[];
  root?: string;
  /** optional "you" card shown at the top of the More sheet */
  account?: ReactNode;
  showTheme?: boolean;
  /** extra control for the bottom row of the More sheet (e.g. language) */
  extra?: ReactNode;
}) {
  const tr = useT();
  const path = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // the section root only matches exactly, so Home doesn't stay lit on subpages
  const isActive = (href: string) =>
    href === root ? path === root : path.startsWith(href);

  // any overflow item active should light up the "More" tab
  const moreActive = overflow.some((i) => isActive(i.href));
  const closeMore = () => setMoreOpen(false);

  // grid columns = primary tabs + the More button
  const cols = primary.length + 1;

  return (
    <>
      <div
        className={`more-sheet more-sheet--admin${moreOpen ? ' open' : ''}`}
        onClick={closeMore}
        aria-hidden={!moreOpen}
      >
        <div className="more-sheet__panel" onClick={(e) => e.stopPropagation()}>
          <div className="more-sheet__grip" />
          {account && <div className="more-sheet__account" onClick={closeMore}>{account}</div>}
          <nav className="more-sheet__links">
            {overflow.map((i) => (
              <Link key={i.href} href={i.href} onClick={closeMore} className={isActive(i.href) ? 'is-active' : undefined}>
                <span className="more-sheet__ic"><Icon name={i.icon} className="ic" /></span>
                <span>{tr(i.label)}</span>
              </Link>
            ))}
            <a href="/" target="_blank" rel="noopener noreferrer" onClick={closeMore}>
              <span className="more-sheet__ic"><Icon name="external" className="ic" /></span>
              <span>{tr('View site')}</span>
            </a>
          </nav>
          <div className="more-sheet__row" style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
            <form action={signOut} style={{ flex: 1 }}>
              <button className="btn btn--ghost" type="submit" style={{ width: '100%' }}>
                <Icon name="logout" className="ic" /> {tr('Sign out')}
              </button>
            </form>
            {extra}
            {showTheme && <ThemeToggle />}
          </div>
        </div>
      </div>

      <nav
        className="bottom-nav bottom-nav--admin"
        aria-label="Admin"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {primary.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`bottom-nav__tab${isActive(i.href) ? ' is-active' : ''}`}
          >
            <span className="bottom-nav__icon"><Icon name={i.icon} className="ic-lg" /></span>
            <span className="bottom-nav__label">{tr(i.short ?? i.label)}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`bottom-nav__tab${moreOpen || moreActive ? ' is-active' : ''}`}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          <span className="bottom-nav__icon"><Icon name="more" className="ic-lg" /></span>
          <span className="bottom-nav__label">{tr('More')}</span>
        </button>
      </nav>
    </>
  );
}
