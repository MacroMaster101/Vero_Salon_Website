import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { BookButton } from '@/components/site/book-button';
import { LookbookGallery } from '@/components/site/lookbook-gallery';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';

export const metadata:Metadata={title:'The Lookbook | Vero Salon, Pasyala',description:'Explore cuts, colour, beard grooming, bridal looks and beauty care from the Vero Salon lookbook.'};
export default async function LookbookPage(){
  const {gallery,locale}=await getPublicSite();
  return <div className="detail-page detail-lookbook"><DetailHeading label="Lookbook" title="Find your next look." description="Explore a cut, a colour or a finishing touch. Tap any photo for a closer look." locale={locale}><span className="detail-collection-label">{t('Hair',locale)} / {t('Colour',locale)} / {t('Beauty',locale)}</span></DetailHeading><section className="home-wrap detail-gallery"><LookbookGallery items={gallery} locale={locale} /><aside className="detail-help"><div><h2><Words text={t('Have a look in mind?',locale)} /></h2><p>{t('Bring your inspiration. We will talk through what works for you.',locale)}</p></div><BookButton>{t('Book a visit',locale)}</BookButton><Link className="salon-section-link" href="/services">{t('View all services',locale)}</Link></aside></section></div>;
}
