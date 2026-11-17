import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey, splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';
import { BookingsTable } from '@/components/admin/bookings-table';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';
import { Icon } from '@/components/ui/icon';
import { StatTiles, type StatTile } from '@/components/admin/stat-tiles';
import { getSiteSettings } from '@/lib/settings/get';
import { MaintenanceButton } from './settings/settings-form';

export default async function AdminHome() {
  const profile = await requireRole(['receptionist'], '/admin');
  const isDesk = profile.role === 'receptionist';
  const settings = isDesk ? null : await getSiteSettings();
  const locale = await getLocale();
  const sb = await createClient();
  // Only today's and future bookings are shown, so filter in the query instead
  // of fetching the whole history and discarding the past rows here.
  const { data, error } = await sb
    .from('bookings')
    .select('*, services(name), stylists(name)')
    .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
    .order('starts_at', { ascending: true });

  const rows = (data ?? []) as unknown as BookingJoinRow[];

  const [{ count: serviceCount }, { count: bookableCount }, { count: stylistCount }] = await Promise.all([
    sb.from('services').select('*', { count: 'exact', head: true }),
    sb.from('services').select('*', { count: 'exact', head: true }).eq('bookable', true),
    sb.from('stylists').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  // Group by salon-local calendar date. Past bookings are excluded (Today + Upcoming only).
  const { today, upcoming } = splitTodayUpcoming(rows);

  const tiles: StatTile[] = [
    { k: 'Today', n: String(today.length), sub: 'bookings', icon: 'calendar' },
    { k: 'Upcoming', n: String(upcoming.length), sub: 'scheduled', icon: 'clock' },
    { k: 'Services', n: String(serviceCount ?? 0), sub: `${bookableCount ?? 0} ${t('bookable', locale)}`, icon: 'scissors' },
    { k: 'Stylists', n: String(stylistCount ?? 0), sub: 'active', icon: 'people' },
  ];

  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="grid" eyebrow={isDesk ? 'Front desk' : 'Overview'} title={isDesk ? 'Bookings' : 'Control room'} />
        {settings && (
          <div className="abtn-row">
            <MaintenanceButton on={settings.maintenance} />
            <Link href="/admin/blocked-slots" className="btn btn--ghost"><Icon name="ban" size={16} /> {t('Blocked slots', locale)}</Link>
          </div>
        )}
      </div>
      <StatTiles tiles={tiles} />

      {error && (
        <p className="lead" style={{ marginTop: 12, color: 'var(--accent)' }}>
          {t('Could not load bookings', locale)}: {error.message}
        </p>
      )}

      {!error && today.length === 0 && upcoming.length === 0 && (
        <AdminEmpty icon="calendar" title="No bookings yet">New bookings for today and the days ahead will show up here.</AdminEmpty>
      )}

      {!error && (today.length > 0 || upcoming.length > 0) && (
        <>
          <section style={{ marginTop: 28 }}>
            <h2 className="asec-title">{t('Today', locale)}</h2>
            <BookingsTable bookings={today} />
          </section>

          <section style={{ marginTop: 36 }}>
            <h2 className="asec-title">{t('Upcoming', locale)}</h2>
            <BookingsTable bookings={upcoming} />
          </section>
        </>
      )}
    </div>
  );
}
