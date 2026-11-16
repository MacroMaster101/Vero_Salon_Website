import { Words } from '@/components/site/words';
import type { ReactNode } from 'react';
import { t } from '@/lib/i18n/translations';

export function DetailHeading({ label, title, description, locale, children }: { label:string; title:string; description:string; locale:string; children?:ReactNode }) {
  return <header className="detail-heading home-wrap"><div className="detail-heading__row"><div className="detail-heading__title"><span className="home-eyebrow">{t(label,locale)}</span><h1><Words text={t(title,locale)} /></h1></div><div className="detail-heading__aside"><p>{t(description,locale)}</p>{children}</div></div></header>;
}
