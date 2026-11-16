import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { ImgSlot } from '@/components/site/img-slot';
import { BookButton } from '@/components/site/book-button';
import { Faq } from '@/components/home/faq';
import { STEPS, FAQS } from '@/lib/salon-content';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';

export const metadata:Metadata={title:'Your Visit | Vero Salon, Pasyala',description:'Plan your first visit to Vero Salon, from choosing a service and consultation to your final style and finish.'};
const photos=['/images/how/step-1.png','/images/how/step-2.png','/images/lookbook/hair-spa.png','/images/how/step-4.png'];
export default async function YourVisitPage(){
  const {locale}=await getPublicSite();
  return <div className="detail-page detail-visit"><DetailHeading label="How it works" title="Your visit, step by step" description="Four simple steps, from your first idea to the finishing touches. We will take care of the rest." locale={locale}><BookButton>{t('Book a visit',locale)}</BookButton></DetailHeading><section className="home-wrap detail-visit-steps"><ol>{STEPS.map((step,index)=><li className="home-reveal" key={step.h}><div className="detail-step-photo"><ImgSlot src={photos[index]} alt={t(step.h,locale)} sizes="(max-width: 767px) 100vw, 50vw" /><span aria-hidden="true">0{index+1}</span></div><div><h2>{t(step.h,locale)}</h2><p>{t(step.p,locale)}</p></div></li>)}</ol></section><section className="detail-visit-questions"><div className="home-wrap"><div><span className="home-eyebrow">{t('Before your visit',locale)}</span><h2><Words text={t('A few things to know.',locale)} /></h2><Link href="/visit" className="salon-section-link">{t('Location & hours',locale)}</Link></div><Faq items={FAQS.map(item=>({q:t(item.q,locale),a:t(item.a,locale)}))} /></div></section></div>;
}
