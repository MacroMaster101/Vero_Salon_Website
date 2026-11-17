import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey, splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';
import { BookingsTable } from '@/components/admin/bookings-table';
import { LoadError } from '@/components/admin/load-error';
import { Icon, type IconName } from '@/components/ui/icon';
import { StatTiles, type StatTile } from '@/components/admin/stat-tiles';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';

// Sidebar/bottom nav already cover Bookings and My day, so the home
// shortcuts list only the management screens.
const TILES: { href: string; label: string; hint: string; icon: IconName }[] = [
  { href: '/owner/services', label: 'Prices & services', hint: 'What you offer', icon: 'scissors' },
  { href: '/owner/team', label: 'My team', hint: 'Stylists & staff accounts', icon: 'people' },
  { href: '/owner/photos', label: 'Photos', hint: 'The lookbook gallery', icon: 'image' },
  { href: '/owner/reviews', label: 'Reviews', hint: 'What customers said', icon: 'star' },
  { href: '/owner/time-off', label: 'Days off & blocks', hint: 'Closures and blocked time', icon: 'ban' },
  { href: '/owner/hours', label: 'Opening hours', hint: 'When the shop is open', icon: 'sun' },
];

export default async function OwnerHome() {
  const profile = await requireRole(['owner'], '/owner');
  const firstName = (profile.fullName ?? 'there').split(' ')[0];
  const sb = await createClient();

  const [{ data, error }, { count: serviceCount }, { count: stylistCount }] = await Promise.all([
    sb
      .from('bookings')
      .select('*, services(name), stylists(name)')
      .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
      .order('starts_at', { ascending: true }),
    sb.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('stylists').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);
  const { today, upcoming } = splitTodayUpcoming((data ?? []) as unknown as BookingJoinRow[]);
  const tiles: StatTile[] = [
    { k: 'Today', n: String(today.length), sub: 'bookings', icon: 'calendar' },
    { k: 'Upcoming', n: String(upcoming.length), sub: 'scheduled', icon: 'clock' },
    { k: 'Services', n: String(serviceCount ?? 0), sub: 'on the menu', icon: 'scissors' },
    { k: 'Stylists', n: String(stylistCount ?? 0), sub: 'active', icon: 'people' },
  ];

  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="grid" eyebrow="My shop" title={`Hi ${firstName}`} />
        <Link href="/owner/time-off" className="btn btn--ghost"><Icon name="ban" size={16} /> Days off &amp; blocks</Link>
      </div>
      <StatTiles tiles={tiles} />

      {/* Sibling /owner/bookings already surfaces this; the home screen didn't,
          so a failed read showed a confident "0 appointments today". */}
      <LoadError what="bookings" error={error} />

      <div className="ohome" style={{ marginTop: 28 }}>
        <section>
          <h2 className="asec-title">Today<span className="asec-count">{today.length}</span></h2>
          {today.length === 0
            ? <AdminEmpty icon="calendar" title="No appointments today." />
            : <BookingsTable bookings={today} />}

          <h2 className="asec-title" style={{ marginTop: 32 }}>Coming up<span className="asec-count">{upcoming.length}</span></h2>
          {upcoming.length === 0
            ? <AdminEmpty icon="clock" title="Nothing booked further ahead yet." />
            : <BookingsTable bookings={upcoming} />}
        </section>

        <aside className="ohome__aside">
          <h2 className="asec-title">Shortcuts</h2>
          <div className="otiles">
            {TILES.map((t) => (
              <Link key={t.href} href={t.href} className="otile">
                <Icon name={t.icon} className="ic" />
                <span className="otile__txt">{t.label}<small>{t.hint}</small></span>
                <Icon name="chevron" className="otile__go" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
