import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { BookButton } from '@/components/site/book-button';
import { LookbookGallery } from '@/components/site/lookbook-gallery';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';
import { SectionMark } from '@/components/home/section-mark';
import { ImgSlot } from '@/components/site/img-slot';
import { Icon } from '@/components/ui/icon';

export const metadata:Metadata={title:'The Lookbook | Vero Salon, Pasyala',description:'Explore cuts, colour, beard grooming, bridal looks and beauty care from the Vero Salon lookbook.'};
export default async function LookbookPage(){
  const {gallery,locale}=await getPublicSite();
  return <div className="detail-page detail-lookbook"><DetailHeading label="Lookbook" title="Find your next look." description="Explore a cut, a colour or a finishing touch. Tap any photo for a closer look." locale={locale} images={['/images/lookbook/ladies-colour.png','/images/lookbook/gents-fade.png']} badge={{icon:'eye',text:t('{count} looks',locale).replace('{count}',String(gallery.length))}}><ul className="detail-heading-chips"><li><Icon name="scissors" size={14} />{t('Hair',locale)}</li><li><Icon name="tag" size={14} />{t('Colour',locale)}</li><li><Icon name="star" size={14} />{t('Beauty',locale)}</li></ul></DetailHeading><SectionMark icon="eye" title={t('The gallery',locale)} align="right" detail={t('Real looks from our chairs',locale)} variant="dashed" /><section className="home-wrap detail-gallery"><LookbookGallery items={gallery} locale={locale} /><aside className="detail-help detail-help--art"><div className="detail-help__faces" aria-hidden="true">{['/images/lookbook/ladies-colour.png','/images/lookbook/gents-fade.png','/images/lookbook/bridal-look.png'].map(src=><span key={src}><ImgSlot src={src} alt="" sizes="72px" /></span>)}<i><Icon name="scissors" size={18} /></i></div><div><h2><Words text={t('Have a look in mind?',locale)} /></h2><p>{t('Bring your inspiration. We will talk through what works for you.',locale)}</p></div><BookButton>{t('Book a visit',locale)}</BookButton><Link className="salon-section-link" href="/services">{t('View all services',locale)}</Link></aside></section></div>;
}
