'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';
import { AdminEmpty } from '@/components/admin/admin-title';
import { useT } from '@/lib/i18n/locale-context';

export interface FilterChip<T> {
  id: string;
  label: string;
  match: (item: T) => boolean; // 'all' chip should match everything
}

export function ListToolbar<T>({
  items, searchText, placeholder, chips, render, emptyLabel = 'Nothing matches your filters.', right, add, empty,
}: {
  items: T[];
  searchText: (item: T) => string;     // searchable string for an item
  placeholder: string;
  chips: FilterChip<T>[];              // first chip is the default ("All")
  render: (filtered: T[]) => ReactNode;
  emptyLabel?: string;
  /** Extra toolbar control (e.g. the card/row view toggle). */
  right?: ReactNode;
  /** Primary "+ Add" control, shown at the end of the toolbar. */
  add?: ReactNode;
  /** Shown instead of the list when there are no items at all. */
  empty?: { icon?: IconName; title: string; text?: string };
}) {
  const tr = useT();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(chips[0]?.id);
  const chip = chips.find((c) => c.id === active) ?? chips[0];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      const okText = !needle || searchText(it).toLowerCase().includes(needle);
      const okChip = !chip || chip.match(it);
      return okText && okChip;
    });
  }, [items, q, chip, searchText]);

  return (
    <>
      <div className="toolbar atool">
        <div className="search">
          <Icon name="search" className="ic" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(placeholder)} aria-label={tr('Search')} />
          {q && (
            <button type="button" className="atool__clear" onClick={() => setQ('')} aria-label={tr('Clear search')}>
              <Icon name="xmark" size={13} />
            </button>
          )}
        </div>
        <div className="chips" role="group" aria-label={tr('Filters')}>
          {chips.map((c) => {
            const n = items.filter(c.match).length;
            return (
              <button key={c.id} type="button" className={`chip${c.id === active ? ' on' : ''}`} onClick={() => setActive(c.id)}>
                {tr(c.label)}<span className="chip__n">{n}</span>
              </button>
            );
          })}
        </div>
        <span className="atool__end">
          {right}
          {add}
        </span>
      </div>
      {items.length === 0 && empty ? (
        <AdminEmpty icon={empty.icon ?? 'inbox'} title={empty.title}>{empty.text}</AdminEmpty>
      ) : filtered.length === 0 ? (
        <AdminEmpty icon="search" title={emptyLabel}>
          <button type="button" className="afm-soft" onClick={() => { setQ(''); setActive(chips[0]?.id); }}>{tr('Clear filters')}</button>
        </AdminEmpty>
      ) : (
        <div className="alist-wrap" key={`${active}|${q.trim()}`}>{render(filtered)}</div>
      )}
    </>
  );
}
