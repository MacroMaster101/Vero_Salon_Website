import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { LoadError } from '@/components/admin/load-error';
import { GalleryList } from './gallery-list';
import { AdminTitle } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

export default async function GalleryPage() {
  await requireRole(['webdev'], '/admin/gallery');
  const locale = await getLocale();
  const sb = await createClient();
  const { data: items, error } = await sb.from('gallery').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="image" eyebrow="Lookbook" title="Gallery" />
        <Link href="/#looks" target="_blank" className="btn btn--ghost">{t('View on site', locale)} ↗</Link>
      </div>
      <LoadError what="gallery" error={error} />
      <GalleryList items={items ?? []} />
    </div>
  );
}
