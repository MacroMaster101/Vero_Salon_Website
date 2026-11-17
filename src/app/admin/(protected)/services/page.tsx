import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { LoadError } from '@/components/admin/load-error';
import { ServicesManager } from './services-list';
import { getAllServiceCategories } from '@/lib/queries';
import { AdminTitle } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

export default async function ServicesPage() {
  await requireRole(['webdev'], '/admin/services');
  const locale = await getLocale();
  const sb = await createClient();
  const [{ data: services, error }, categories] = await Promise.all([sb.from('services').select('*').order('sort_order'), getAllServiceCategories()]);
  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="scissors" eyebrow="Catalogue" title="Services" />
        <Link href="/services" target="_blank" className="btn btn--ghost">{t('View on site', locale)} ↗</Link>
      </div>
      <LoadError what="services" error={error} />
      <ServicesManager services={services ?? []} categories={categories} />
    </div>
  );
}
