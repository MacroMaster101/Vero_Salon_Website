import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { ServicesManager } from '@/app/admin/(protected)/services/services-list';
import { getAllServiceCategories } from '@/lib/queries';
import { Icon } from '@/components/ui/icon';
import { AdminTitle } from '@/components/admin/admin-title';

export default async function OwnerServicesPage() {
  await requireRole(['owner'], '/owner/services');
  const sb = await createClient();
  const [{ data: services }, categories] = await Promise.all([sb.from('services').select('*').order('sort_order'), getAllServiceCategories()]);
  return (
    <div className="apage">
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <div className="ahead">
        <AdminTitle icon="scissors" eyebrow="Menu" title="Prices & services" />
        <Link href="/services" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">View on site ↗</Link>
      </div>
      <p className="lead apage__lead">Your service categories. Open one to see and edit the services inside it, with prices and how long they take.</p>
      <ServicesManager services={services ?? []} categories={categories} />
    </div>
  );
}
