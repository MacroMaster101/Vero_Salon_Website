'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';

// Route-level error boundary (Next 16: `retry` re-renders the segment).
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  const locale = useLocale();
  return (
    <main className="maint">
      <div className="maint__card" role="alert">
        <h1 className="maint__title">{t('Something went wrong', locale)}</h1>
        <p className="maint__text">{t('Please try again. If it keeps happening, call us.', locale)}</p>
        <div className="maint__actions">
          <button type="button" className="home-btn home-btn--primary" onClick={() => retry()}>{t('Try again', locale)}</button>
          <Link className="home-btn" href="/">{t('Back to home', locale)}</Link>
        </div>
      </div>
    </main>
  );
}
