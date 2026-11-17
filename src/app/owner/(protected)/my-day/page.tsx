import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { getServices } from '@/lib/queries';
import { colomboDayWindow, groupByDay, serviceLabel, type StaffBooking } from '@/lib/staff/view';
import { Icon } from '@/components/ui/icon';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';

const TZ = 'Asia/Colombo';
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const dayTitleFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });

const TAG_CLASS: Record<string, string> = {
  confirmed: 'tag--confirmed', completed: 'tag--completed', no_show: 'tag--no_show', cancelled: 'tag--cancelled',
};
const TAG_LABEL: Record<string, string> = {
  confirmed: 'Confirmed', completed: 'Completed', no_show: 'No-show', cancelled: 'Cancelled',
};

function AppointmentCard({ b, services }: { b: StaffBooking; services: { id: string; name: string }[] }) {
  return (
    <li className="oday__card">
      <span className="oday__time">{timeFmt.format(new Date(b.starts_at))}</span>
      <span className="oday__who">
        <b>{b.customer_name}</b>
        <span>{serviceLabel(services, b.service_id)} · {b.customer_phone}</span>
      </span>
      <span className={`tag ${TAG_CLASS[b.status] ?? ''}`}>{TAG_LABEL[b.status] ?? b.status}</span>
    </li>
  );
}

export default async function OwnerMyDayPage() {
  const profile = await requireRole(['owner'], '/owner/my-day');
  const stylistId = profile.stylistId;

  if (!stylistId) {
    return (
      <div className="apage">
        <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
        <div className="ahead"><AdminTitle icon="clock" eyebrow="My chair" title="My day" /></div>
        <AdminEmpty icon="user" title="Not linked to a stylist yet">
          Your account isn&apos;t linked to your stylist profile yet, so there&apos;s no chair to show. Ask your web developer to link it.
        </AdminEmpty>
      </div>
    );
  }

  const today = colomboDayWindow(0);
  const weekEnd = colomboDayWindow(7);
  const [todays, upcoming, services] = await Promise.all([
    getMyAssignedBookings({ stylistId, from: today.from, to: today.to }),
    getMyAssignedBookings({ stylistId, from: today.to, to: weekEnd.to }),
    getServices(),
  ]);
  const svc = services as { id: string; name: string }[];
  const week = groupByDay(upcoming);

  return (
    <div className="apage">
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <div className="ahead"><AdminTitle icon="clock" eyebrow="My chair" title="My day" /></div>
      <p className="lead apage__lead">{dayTitleFmt.format(new Date())} — your own appointments, not the whole shop&apos;s.</p>

      <section className="asec">
        <h2 className="asec-title">Today<span className="asec-count">{todays.length}</span></h2>
        {todays.length === 0
          ? <AdminEmpty icon="calendar" title="No appointments for you today." />
          : <ul className="oday">{todays.map((b) => <AppointmentCard key={b.id} b={b} services={svc} />)}</ul>}
      </section>

      <section className="asec" style={{ marginTop: 32 }}>
        <h2 className="asec-title">Coming up this week<span className="asec-count">{upcoming.length}</span></h2>
        {week.length === 0
          ? <AdminEmpty icon="clock" title="Nothing booked for you in the next 7 days." />
          : week.map((day) => (
              <div key={day.dayKey} style={{ marginTop: 14 }}>
                <p className="oday__day">{day.dayLabel}</p>
                <ul className="oday">{day.items.map((b) => <AppointmentCard key={b.id} b={b} services={svc} />)}</ul>
              </div>
            ))}
      </section>
    </div>
  );
}
