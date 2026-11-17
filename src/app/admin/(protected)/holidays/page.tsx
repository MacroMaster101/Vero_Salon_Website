import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import type { Holiday } from '@/lib/supabase/types';
import { salonDayKey } from '@/lib/booking-rows';
import { HolidayForms } from '@/components/admin/holiday-form';
import { DeleteForm } from '@/components/admin/form-kit';
import { LoadError } from '@/components/admin/load-error';
import { deleteHoliday } from './holiday-actions';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

const dateFmt = new Intl.DateTimeFormat('en-LK', {
  timeZone: 'Asia/Colombo', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

function parts(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
  const dt = new Date(y, m - 1, d);
  return {
    day: String(d),
    mon: dt.toLocaleString('en-LK', { month: 'short' }),
    full: dateFmt.format(dt),
  };
}

export default async function HolidaysPage() {
  await requireRole(['receptionist'], '/admin/holidays');
  const locale = await getLocale();
  const sb = await createClient();
  // Upcoming holidays (today onward), soonest first. Salon-local "today" —
  // toISOString() is UTC, which is 5:30 behind and would drop today's holiday
  // from midnight to 5:30 AM in Sri Lanka.
  const today = salonDayKey(new Date());
  const { data, error } = await sb
    .from('holidays')
    .select('*')
    .gte('date', today)
    .order('date');
  const rows = (data ?? []) as Holiday[];

  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="sun" eyebrow="Salon" title="Holidays" />
        <HolidayForms />
      </div>
      <p className="lead apage__lead">
        {t('Days the salon is closed. These are blocked on the booking calendar. Sync public & poya holidays from Google, or add a salon-specific closure by hand.', locale)}
      </p>


      <section className="asec">
        <h2 className="asec-title">{t('Upcoming closed days', locale)}{!error && <span className="asec-count">{rows.length}</span>}</h2>
        {/* The empty copy below invites a re-sync, so it must never show for a
            failed read — that would prompt re-adding closures that already exist. */}
        <LoadError what="holidays" error={error} />
        {error ? null : rows.length === 0 ? (
          <AdminEmpty icon="sun" title="No holidays yet — sync from Google or add one above." />
        ) : (
          <ul className="adlist">
            {rows.map((h) => {
              const d = parts(h.date);
              return (
                <li key={h.date} className="adrow">
                  <span className="adrow__date"><b>{d.day}</b><small>{d.mon}</small></span>
                  <div className="adrow__main">
                    <b className="adrow__name">{h.name}</b>
                    <span className="adrow__meta">
                      <span>{d.full}</span>
                      <span className={`adrow__src${h.source === 'google' ? ' is-google' : ''}`}>{t(h.source === 'google' ? 'From Google' : 'Added manually', locale)}</span>
                    </span>
                  </div>
                  <DeleteForm action={deleteHoliday} id={h.date} name="date" label="Remove" iconOnly confirm="Remove this closed day?" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
