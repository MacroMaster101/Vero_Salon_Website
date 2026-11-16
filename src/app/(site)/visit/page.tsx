import { OpeningHours } from "@/components/site/opening-hours";
import type { Metadata } from 'next';
import { DetailHeading } from '@/components/site/detail-heading';
import { LiveStatus } from '@/components/site/live-status';
import { getPublicSite } from '@/lib/public-site';
import { salonLocations, locationDirections } from '@/lib/salon-locations';
import { t } from '@/lib/i18n/translations';

export const metadata:Metadata={title:'Visit Us | Vero Salon, Pasyala & Kaleliya',description:'Find Vero Salon in Pasyala and Kaleliya. Get directions, contact the salon and plan your visit.'};
export default async function VisitPage(){
  const {contact,hours,locale}=await getPublicSite();
  const locations=salonLocations(contact);
  return <div className="detail-page detail-locations"><DetailHeading label="Visit" title="Visit our salons." description="Find the Vero closest to you. Get directions, call the salon and make a little time for yourself." locale={locale}><div className="location-jump-links">{locations.map(location=><a key={location.id} href={`#${location.id}`}>{t(location.name,locale)} <span aria-hidden="true">↓</span></a>)}</div></DetailHeading><div className="home-wrap location-page-list">{locations.map(location=><section id={location.id} className="location-page-card" key={location.id}><div className="location-page-map"><iframe src={location.mapEmbedUrl} title={`${t('Map showing',locale)} Vero Salon ${t(location.name,locale)}`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div><div className="location-page-info"><h2>{t(location.name,locale)}</h2><LiveStatus hours={hours} locale={locale} /><dl><div><dt>{t('Address',locale)}</dt><dd>{t(location.address,locale)}</dd></div><div><dt>{t('Call / WhatsApp',locale)}</dt><dd><a href={`tel:${location.phone.replace(/\s/g,'')}`}>{location.phone}</a></dd></div></dl><OpeningHours hours={hours} locale={locale} /><div className="location-page-actions"><a href={locationDirections(location)} className="home-btn home-btn--primary" target="_blank" rel="noopener noreferrer">{t('Get directions',locale)}</a><a className="home-btn home-btn--ghost" href={`https://wa.me/${location.phone.replace(/\D/g,'').replace(/^0/,'94')}`} target="_blank" rel="noopener noreferrer">{t('WhatsApp',locale)}</a></div></div></section>)}</div></div>;
}
