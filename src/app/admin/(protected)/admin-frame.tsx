'use client';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { useT } from '@/lib/i18n/locale-context';

/** full = labels + icons, rail = icons only */
export type SideMode = 'full' | 'rail';
const KEY = 'vero-admin-side';

/**
 * The admin console frame: sidebar + page (no top bar). One button in the
 * sidebar header (or Ctrl/⌘+B) collapses the sidebar to an icon rail and back;
 * the choice is remembered on this device. Phones keep their own app bar and
 * bottom nav, so collapsing only applies from 861px up (admin-theme.css).
 */
export function AdminFrame({ side, children, bottomNav }: { side: ReactNode; children: ReactNode; bottomNav: ReactNode }) {
  const tr = useT();
  const [mode, setMode] = useState<SideMode>('full');

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore a per-device preference after hydration
      if (localStorage.getItem(KEY) === 'rail') setMode('rail');
    } catch { /* storage blocked: keep the default */ }
  }, []);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: SideMode = m === 'full' ? 'rail' : 'full';
      try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); toggle(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const label = tr(mode === 'full' ? 'Collapse sidebar' : 'Expand sidebar');
  return (
    <div className="shell shell--admin admin-x" data-side={mode}>
      <aside className="shell__side" aria-label="Admin menu">
        <button type="button" className="admin-x__collapse" onClick={toggle}
          aria-label={label} aria-expanded={mode === 'full'} data-tip={`${label} (Ctrl+B)`}>
          <Icon name={mode === 'full' ? 'panel' : 'chevron'} size={mode === 'full' ? 17 : 15} />
        </button>
        {side}
      </aside>
      <div className="admin-x__main">
        <main className="shell__main">{children}</main>
      </div>
      {bottomNav}
      <div id="admin-modals" />
    </div>
  );
}
