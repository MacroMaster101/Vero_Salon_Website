import { Words } from '@/components/site/words';
import { t } from '@/lib/i18n/translations';
import { ImgSlot } from '@/components/site/img-slot';
import type { ReactNode } from 'react';

export function PageIntro({ eyebrow, title, description, locale, image, imageAlt, children }: { eyebrow: string; title: string; description: string; locale: string; image?: string; imageAlt?: string; children?: ReactNode }) {
  return <section className={`salon-page-intro${image ? ' salon-page-intro--visual' : ''}`}><div className="home-wrap"><div className="salon-page-intro__grid"><div className="salon-page-intro__copy home-reveal"><span className="home-eyebrow">{t(eyebrow, locale)}</span><h1><Words text={t(title, locale)} /></h1>{image && <p>{t(description,locale)}</p>}{children}</div>{image ? <div className="salon-page-intro__photo home-reveal"><ImgSlot src={image} alt={t(imageAlt ?? eyebrow,locale)} priority sizes="(max-width: 767px) 100vw, 50vw" /></div> : <p>{t(description, locale)}</p>}</div></div></section>;
}
