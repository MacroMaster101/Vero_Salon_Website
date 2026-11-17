'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Icon, type IconName } from '@/components/ui/icon';
import { useT } from '@/lib/i18n/locale-context';

export type NavGroup = { label?: string; items: { href: string; label: string; icon: IconName }[] };

/**
 * Sidebar links in labelled groups. The red active pill slides between links
 * (Motion shared layout); in the icon rail the label shows as a tooltip.
 */
export function NavLinks({ items, groups, root = '/admin' }: { items?: NavGroup['items']; groups?: NavGroup[]; root?: string }) {
  const tr = useT();
  const path = usePathname();
  const all: NavGroup[] = groups ?? [{ items: items ?? [] }];
  return (
    <nav className="side__nav">
      {all.map((g, gi) => (
        <div className="side__group" key={g.label ?? gi}>
          {g.label && <span className="side__group-label">{tr(g.label)}</span>}
          {g.items.map((n) => {
            // the section root only matches exactly, so it doesn't stay lit on subpages
            const active = n.href === root ? path === root : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={active ? 'on' : undefined} data-tip={tr(n.label)} aria-current={active ? 'page' : undefined}>
                {active && (
                  <motion.span layoutId={`nav-pill-${root}`} className="side__pill" aria-hidden="true"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className="side__ic"><Icon name={n.icon} className="ic" /></span>
                <span className="side__label">{tr(n.label)}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
