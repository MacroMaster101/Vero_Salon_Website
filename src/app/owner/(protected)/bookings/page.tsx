import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey, splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';
import { BookingsTable } from '@/components/admin/bookings-table';
import { Icon } from '@/components/ui/icon';
import { LoadError } from '@/components/admin/load-error';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';

export default async function OwnerBookingsPage() {
  await requireRole(['owner'], '/owner/bookings');
  const sb = await createClient();
  const { data, error } = await sb
    .from('bookings')
    .select('*, services(name), stylists(name)')
    .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
    .order('starts_at', { ascending: true });
  const { today, upcoming } = splitTodayUpcoming((data ?? []) as unknown as BookingJoinRow[]);

  return (
    <div className="apage">
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <div className="ahead"><AdminTitle icon="calendar" eyebrow="Today" title="Bookings" /></div>
      <p className="lead apage__lead">Tap a booking&apos;s buttons to mark it done, a no-show, or cancelled.</p>
      <LoadError what="bookings" error={error} />
      {!error && today.length === 0 && upcoming.length === 0 && (
        <AdminEmpty icon="calendar" title="No bookings yet">New bookings for today and the days ahead will show up here.</AdminEmpty>
      )}
      {today.length > 0 && (
        <section className="asec">
          <h2 className="asec-title">Today<span className="asec-count">{today.length}</span></h2>
          <BookingsTable bookings={today} />
        </section>
      )}
      {upcoming.length > 0 && (
        <section className="asec" style={{ marginTop: 32 }}>
          <h2 className="asec-title">Coming up<span className="asec-count">{upcoming.length}</span></h2>
          <BookingsTable bookings={upcoming} />
        </section>
      )}
    </div>
  );
}
