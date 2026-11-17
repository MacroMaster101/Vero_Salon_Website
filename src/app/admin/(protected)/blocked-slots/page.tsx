import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { getStylists } from '@/lib/queries';
import type { BlockedSlot } from '@/lib/supabase/types';
import { BlockForm } from '@/components/admin/block-form';
import { DeleteForm } from '@/components/admin/form-kit';
import { LoadError } from '@/components/admin/load-error';
import { deleteBlock } from './block-actions';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

const TZ = 'Asia/Colombo';
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const dayFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, day: 'numeric' });
const monFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, month: 'short' });
const wdFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'long' });
const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });

type Row = BlockedSlot & { stylists: { name: string } | null };

export default async function BlockedSlotsPage() {
  await requireRole(['receptionist'], '/admin/blocked-slots');
  const locale = await getLocale();
  const sb = await createClient();
  const [{ data, error }, stylists] = await Promise.all([
    sb
      .from('blocked_slots')
      .select('*, stylists(name)')
      .gt('ends_at', new Date().toISOString())
      .order('starts_at'),
    getStylists(),
  ]);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="ban" eyebrow="Schedule" title="Blocked slots" />
        <BlockForm stylists={stylists} />
      </div>
      <p className="lead apage__lead">
        {t('Block off time for a stylist or the whole salon. Booking availability hides these times.', locale)}
      </p>


      <section className="asec">
        <h2 className="asec-title">{t('Upcoming blocks', locale)}{!error && <span className="asec-count">{rows.length}</span>}</h2>
        {/* Never let a failed read read as "nothing is blocked" — an admin
            trusting that would book a client over blocked time. */}
        <LoadError what="blocked slots" error={error} />
        {error ? null : rows.length === 0 ? (
          <AdminEmpty icon="ban" title="No upcoming blocks.">{t('Use Add block to close off time for a stylist or the whole salon.', locale)}</AdminEmpty>
        ) : (
          <ul className="adlist">
            {rows.map((b) => {
              const start = new Date(b.starts_at); const end = new Date(b.ends_at);
              const sameDay = ymdFmt.format(start) === ymdFmt.format(end);
              return (
                <li key={b.id} className="adrow">
                  <span className="adrow__date"><b>{dayFmt.format(start)}</b><small>{monFmt.format(start)}</small></span>
                  <div className="adrow__main">
                    <b className="adrow__name">{b.stylists?.name ?? t('Whole salon', locale)}</b>
                    <span className="adrow__meta">
                      <span>{wdFmt.format(start)}</span>
                      <span>{timeFmt.format(start)} – {sameDay ? timeFmt.format(end) : `${dayFmt.format(end)} ${monFmt.format(end)}, ${timeFmt.format(end)}`}</span>
                      {b.reason && <span>{b.reason}</span>}
                    </span>
                  </div>
                  <DeleteForm action={deleteBlock} id={b.id} label="Remove" iconOnly confirm="Remove this block?" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
