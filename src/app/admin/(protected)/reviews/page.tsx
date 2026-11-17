import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { ReviewsList, type AdminReview } from './reviews-list';
import { AdminTitle } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

type Row = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  likes_count: number;
  reports_count: number;
  created_at: string;
  stylists: { name: string } | null;
};

export default async function AdminReviewsPage() {
  await requireRole(['webdev'], '/admin/reviews');
  const locale = await getLocale();
  const sb = await createClient();
  const { data } = await sb
    .from('stylist_reviews')
    .select('id, customer_name, rating, comment, likes_count, reports_count, created_at, stylists(name)')
    .order('created_at', { ascending: false });

  const rows = ((data ?? []) as unknown as Row[]).map((r): AdminReview => ({
    id: r.id,
    stylistName: r.stylists?.name ?? 'Unknown stylist',
    customer_name: r.customer_name,
    rating: r.rating,
    comment: r.comment,
    likes_count: r.likes_count,
    reports_count: r.reports_count,
    created_at: r.created_at,
  }));
  // Reported reviews first, then newest.
  rows.sort((a, b) => (b.reports_count - a.reports_count) || (b.created_at.localeCompare(a.created_at)));

  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="star" eyebrow="Moderation" title="Reviews" />
      </div>
      <p className="step__hint" style={{ marginTop: -10, marginBottom: 20 }}>
        {t('Reported reviews are flagged first. Deleting a review recomputes the stylist’s rating.', locale)}
      </p>
      <ReviewsList reviews={rows} />
    </div>
  );
}
