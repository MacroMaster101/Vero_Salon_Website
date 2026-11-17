import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { StylistDirectory } from '@/components/site/stylist-directory';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';
import { SectionMark } from '@/components/home/section-mark';
import { ImgSlot } from '@/components/site/img-slot';
import { Icon } from '@/components/ui/icon';
import { stylistAvatarSrc } from '@/lib/stylist-card';

export const metadata:Metadata={title:'Our Stylists | Vero Salon, Pasyala',description:'Meet Vero Salon stylists, explore their specialties and find the right person for your next visit.'};
export default async function StylistsPage(){
  const {stylists,locale,contact}=await getPublicSite();
  return <div className="detail-page detail-stylists"><DetailHeading label="Stylists" title="Meet our stylists." description="Explore our specialties, meet the people behind the chair and ask for your preferred stylist when you book." locale={locale} images={['/images/stylists/sanduni.png','/images/stylists/ruwan.png']} badge={{icon:'people',text:t('{count} stylists',locale).replace('{count}',String(stylists.length))}}><ul className="detail-heading-chips"><li><Icon name="scissors" size={14} />{t('Hair, colour, grooming and bridal',locale)}</li><li><Icon name="clock" size={14} />{t('Open daily',locale)}</li><li><Icon name="check" size={14} />{t('Walk-ins welcome',locale)}</li></ul><Link className="salon-section-link" href="/services">{t('View all services',locale)}</Link></DetailHeading><SectionMark icon="people" title={t('The team',locale)} align="center" detail={t('Every chair, a specialist',locale)} variant="solid" /><section className="home-wrap detail-directory"><StylistDirectory stylists={stylists} locale={locale} /><aside className="detail-help detail-help--art"><div className="detail-help__faces" aria-hidden="true">{stylists.slice(0,4).map(s=><span key={s.id}><ImgSlot src={stylistAvatarSrc(s)} alt="" sizes="72px" /></span>)}<i><Icon name="phone" size={17} /></i></div><div><h2><Words text={t('Not sure who to choose?',locale)} /></h2><p>{t('Tell us the look you have in mind. We will help you find the right service and stylist.',locale)}</p></div><a className="home-btn home-btn--ghost" href={`tel:${contact.phonePrimary.replace(/\s/g,'')}`}><Icon name="phone" size={15} />{t('Call the salon',locale)}</a></aside></section></div>;
}
