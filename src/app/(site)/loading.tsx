'use client';
import { useLocale } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';

// The shared site layout stays interactive while the next page streams in.
export default function Loading() {
  const locale = useLocale();
  return <div className="home-wrap salon-page-loading" role="status" aria-label={t('Loading',locale)}><span>{t('Loading',locale)}</span><div aria-hidden="true"><i /><i /><i /></div></div>;
}
