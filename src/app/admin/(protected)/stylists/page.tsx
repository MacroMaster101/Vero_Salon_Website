import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { LoadError } from '@/components/admin/load-error';
import { StylistsList } from './stylists-list';
import { AdminTitle } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

export default async function StylistsPage() {
  await requireRole(['webdev'], '/admin/stylists');
  const locale = await getLocale();
  const sb = await createClient();
  const { data: stylists, error } = await sb.from('stylists').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="user" eyebrow="Team" title="Stylists" />
        <Link href="/#team" target="_blank" className="btn btn--ghost">{t('View on site', locale)} ↗</Link>
      </div>
      <LoadError what="stylists" error={error} />
      <StylistsList stylists={stylists ?? []} />
    </div>
  );
}
