'use client';

// App-level loading UI shown during route navigation / server data fetches.
// A trimmed version of the homepage splash — the Cyber Gothic brand badge + spinner.
import { LogoIcon } from '@/components/ui/logo-icon';
import { useLocale } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';

export default function Loading() {
  const locale = useLocale();

  return (
    <div className="home-route-loader" role="status" aria-label={t('Loading',locale)}>
      <div className="home-loader-badge">
        <span className="home-loader-ring home-loader-ring--outer" />
        <span className="home-loader-ring home-loader-ring--inner" />
        <span className="home-loader-mark" style={{ display: 'grid', placeItems: 'center' }}>
          <LogoIcon />
        </span>
      </div>
      <span className="home-loader-sub">
        {t('Loading',locale)}
      </span>
    </div>
  );
}
