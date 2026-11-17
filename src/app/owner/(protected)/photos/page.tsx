import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { GalleryList } from '@/app/admin/(protected)/gallery/gallery-list';
import { Icon } from '@/components/ui/icon';
import { AdminTitle } from '@/components/admin/admin-title';

export default async function OwnerPhotosPage() {
  await requireRole(['owner'], '/owner/photos');
  const sb = await createClient();
  const { data: items } = await sb.from('gallery').select('*').order('sort_order');
  return (
    <div className="apage">
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <div className="ahead">
        <AdminTitle icon="image" eyebrow="Lookbook" title="Photos" />
        <Link href="/#looks" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">View on site ↗</Link>
      </div>
      <GalleryList items={items ?? []} />
    </div>
  );
}
