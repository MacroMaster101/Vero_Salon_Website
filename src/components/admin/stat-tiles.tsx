'use client';
// A row of dashboard stat tiles. `n` is the headline value (a count or short
// label) and is rendered as plain text — never raw HTML — so callers can pass
// derived data without opening an XSS hole. Whole numbers count up on mount.
import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { Icon, type IconName } from '@/components/ui/icon';
import { useT } from '@/lib/i18n/locale-context';

export interface StatTile { k: string; n: string; sub: string; icon?: IconName }

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const target = /^\d+$/.test(value) ? Number(value) : null;
  useEffect(() => {
    const el = ref.current;
    if (!el || target === null || !inView || reduce) return;
    const controls = animate(0, target, {
      duration: Math.min(1.4, 0.5 + target / 60),
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => { el.textContent = String(Math.round(v)); },
    });
    return () => controls.stop();
  }, [inView, reduce, target]);
  return <span ref={ref}>{value}</span>;
}

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  const tr = useT();
  return (
    <div className="adash__tiles">
      {tiles.map((t) => (
        <div key={t.k} className="atile">
          {t.icon && <span className="atile__icon" aria-hidden="true"><Icon name={t.icon} size={18} /></span>}
          <div className="atile__k">{tr(t.k)}</div>
          <div className="atile__n"><CountUp value={t.n} /></div>
          <div className="atile__sub">{tr(t.sub)}</div>
        </div>
      ))}
    </div>
  );
}
