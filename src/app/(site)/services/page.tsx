import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { ServicesTabs } from '@/components/home/services-tabs';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';
import { SectionMark } from '@/components/home/section-mark';
import { Icon } from '@/components/ui/icon';

export const metadata:Metadata={title:'Services & Pricing | Vero Salon, Pasyala',description:'Explore hair, grooming, colour, beauty and bridal services. Compare Vero Salon prices and appointment durations.'};
export default async function ServicesPage(){
  const {services,categories,locale,contact}=await getPublicSite();
  return <div className="detail-page detail-services"><DetailHeading label="Services" title="Services & pricing" description="Choose your care, compare prices and plan your time. Everything you need, before you book." locale={locale} images={['/images/services/colour.png','/images/services/facial.png']} badge={{icon:'scissors',value:String(services.length),text:t('Services',locale)}}></DetailHeading><div className="detail-service-facts home-wrap"><span><Icon name="scissors" size={15} />{t('{count} services',locale).replace('{count}',String(services.length))}</span><span><Icon name="tag" size={15} />{t('Prices in LKR',locale)}</span><span><Icon name="check" size={15} />{t('Pay at salon',locale)}</span></div><SectionMark icon="scissors" title={t('The menu',locale)} align="center" detail={t('Pick a category to compare prices',locale)} variant="accent" /><section id="menu" className="detail-menu home-wrap"><ServicesTabs services={services} categories={categories} locale={locale} /><p className="detail-price-note">{t('Prices in LKR. Your stylist will confirm the final quote before starting.',locale)}</p><aside className="detail-help"><div><h2><Words text={t('Not sure where to start?',locale)} /></h2><p>{t('Call us for help choosing your service.',locale)}</p></div><a className="home-btn home-btn--ghost" href={`tel:${contact.phonePrimary.replace(/\s/g,'')}`}>{contact.phonePrimary}</a><Link className="salon-section-link" href="/your-visit">{t('See what to expect',locale)}</Link></aside></section></div>;
}
