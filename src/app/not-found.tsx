import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale } from '@/app/locale-action';
import { t } from '@/lib/i18n/translations';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default async function NotFound() {
  const locale = await getLocale();
  return (
    <main className="maint">
      <div className="maint__card">
        <span className="maint__eyebrow">404</span>
        <h1 className="maint__title">{t('Page not found', locale)}</h1>
        <p className="maint__text">{t('That page doesn’t exist or has moved.', locale)}</p>
        <div className="maint__actions">
          <Link className="home-btn home-btn--primary" href="/">{t('Back to home', locale)}</Link>
        </div>
      </div>
    </main>
  );
}
