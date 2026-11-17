import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getSiteContent } from '@/lib/content/get';
import { getBusinessHours } from '@/lib/queries';
import { QuoteForm, CtaForm, StoryForm, HeroForm, StatsForm, ContactForm, HoursForm } from './content-forms';
import { AdminTitle } from '@/components/admin/admin-title';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

export default async function ContentPage() {
  await requireRole(['webdev'], '/admin/content');
  const locale = await getLocale();
  const [quote, cta, story, hero, stats, contact, hours] = await Promise.all([
    getSiteContent('quote'),
    getSiteContent('cta'),
    getSiteContent('story'),
    getSiteContent('hero'),
    getSiteContent('stats'),
    getSiteContent('contact'),
    getBusinessHours(),
  ]);
  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="pen" eyebrow="Homepage" title="Content" />
        <Link href="/" target="_blank" className="btn btn--ghost">{t('View on site', locale)} ↗</Link>
      </div>
      <div className="acontent-grid">
        <HeroForm content={hero} />
        <StatsForm content={stats} />
        <StoryForm content={story} />
        <QuoteForm content={quote} />
        <CtaForm content={cta} />
        <HoursForm hours={hours} />
        <ContactForm content={contact} />
      </div>
    </div>
  );
}
