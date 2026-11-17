'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Icon } from '@/components/ui/icon';
import { setViewAs } from '@/app/view-as-action';

const OPTIONS = [
  { role: 'webdev', label: 'Web dev (you)', home: '/admin' },
  { role: 'receptionist', label: 'Receptionist', home: '/admin' },
  { role: 'owner', label: 'Owner', home: '/owner' },
  { role: 'staff', label: 'Staff', home: '/staff' },
  { role: 'user', label: 'Customer', home: '/' },
] as const;

/**
 * Floating "View as" pill, rendered only for the web developer. Picking a role
 * reloads the site as that role would see it, starting from where that role
 * lands after signing in.
 */
export function ViewAsSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const active = OPTIONS.find((o) => o.role === current) ?? OPTIONS[0];
  const previewing = active.role !== 'webdev';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const pick = (o: (typeof OPTIONS)[number]) => {
    setError(null);
    start(async () => {
      const r = await setViewAs(o.role === 'webdev' ? null : o.role);
      if ('error' in r) { setError(r.error); return; }
      window.location.assign(o.home); // full reload so every layout re-reads the role
    });
  };

  return (
    <div ref={ref} className={`viewas${previewing ? ' viewas--on' : ''}`} data-open={open || undefined}>
      {open && (
        <div className="viewas__menu" role="menu" aria-label="View the site as">
          <span className="viewas__head">View the site as</span>
          {OPTIONS.map((o) => (
            <button key={o.role} type="button" role="menuitemradio" aria-checked={o.role === active.role}
              className="viewas__opt" disabled={pending} onClick={() => pick(o)}>
              <span>{o.label}</span>
              {o.role === active.role && <Icon name="check" className="ic" />}
            </button>
          ))}
          <span className="viewas__note">Preview only — data access stays web dev.</span>
          {error && <span className="viewas__err" role="alert">{error}</span>}
        </div>
      )}
      <button type="button" className="viewas__pill" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)} disabled={pending}>
        <Icon name="eye" className="ic" />
        <span>{pending ? 'Switching…' : previewing ? `Viewing as ${active.label}` : 'View as'}</span>
      </button>
    </div>
  );
}
