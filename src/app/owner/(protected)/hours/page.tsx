import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getBusinessHours } from '@/lib/queries';
import { HoursForm } from '@/app/admin/(protected)/content/content-forms';
import { Icon } from '@/components/ui/icon';
import { AdminTitle } from '@/components/admin/admin-title';

export default async function OwnerHoursPage() {
  await requireRole(['owner'], '/owner/hours');
  const hours = await getBusinessHours();
  return (
    <div className="apage">
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <div className="ahead"><AdminTitle icon="sun" eyebrow="Schedule" title="Opening hours" /></div>
      <p className="lead apage__lead">When the shop is open. Customers can only book inside these times.</p>
      <div className="acontent-grid"><HoursForm hours={hours} /></div>
    </div>
  );
}
