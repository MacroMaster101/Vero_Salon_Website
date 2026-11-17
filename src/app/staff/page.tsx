import { getProfile } from '@/lib/supabase/auth';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { getServices } from '@/lib/queries';
import { colomboDayWindow } from '@/lib/staff/view';
import { TodayView } from './today-view';
import { AdminTitle, AdminEmpty } from '@/components/admin/admin-title';

const TZ = 'Asia/Colombo';
const dayTitleFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short' });

export default async function StaffTodayPage() {
  const profile = await getProfile();
  const stylistId = profile?.stylistId ?? null;

  if (!stylistId) {
    return (
      <div className="apage">
        <div className="ahead"><AdminTitle icon="grid" eyebrow="Staff desk" title="Today" /></div>
        <AdminEmpty icon="user" title="Not linked to a stylist yet">Your account isn’t linked to a stylist chair yet — contact an admin.</AdminEmpty>
      </div>
    );
  }

  const { from, to } = colomboDayWindow(0);
  const [bookings, services] = await Promise.all([
    getMyAssignedBookings({ stylistId, from, to }),
    getServices(),
  ]);

  return (
    <TodayView
      initialBookings={bookings}
      services={services as { id: string; name: string }[]}
      dayTitle={dayTitleFmt.format(new Date())}
    />
  );
}
