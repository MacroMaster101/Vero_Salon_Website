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
import { SectionMark } from '@/components/home/section-mark';
import { Icon, type IconName } from '@/components/ui/icon';

export const metadata:Metadata={title:'Your Visit | Vero Salon, Pasyala',description:'Plan your first visit to Vero Salon, from choosing a service and consultation to your final style and finish.'};
const photos=['/images/how/step-1.png','/images/how/step-2.png','/images/how/step-3.png','/images/how/step-5.png'];
const icons:IconName[]=['calendar','people','clock','star'];
export default async function YourVisitPage(){
  const {locale,contact}=await getPublicSite();
  return <div className="detail-page detail-visit"><DetailHeading label="How it works" title="Your visit, step by step" description="Four simple steps, from your first idea to the finishing touches. We will take care of the rest." locale={locale} images={['/images/how/step-2.png','/images/how/step-1.png']} badge={{icon:'calendar',text:t('Book or just walk in',locale)}}><ul className="detail-heading-chips"><li><Icon name="clock" size={14} />{t('Open daily',locale)}</li><li><Icon name="check" size={14} />{t('Walk-ins welcome',locale)}</li><li><Icon name="tag" size={14} />{t('No deposit needed',locale)}</li></ul><BookButton>{t('Book a visit',locale)}</BookButton></DetailHeading><SectionMark icon="calendar" title={t('Four easy steps',locale)} align="center" detail={t('Book ahead or just walk in',locale)} variant="accent" /><section className="home-wrap detail-visit-steps"><ol>{STEPS.map((step,index)=><li className="home-reveal" key={step.h}><div className="detail-step-photo"><ImgSlot src={photos[index]} alt={t(step.h,locale)} sizes="(max-width: 767px) 100vw, 50vw" /><span aria-hidden="true">0{index+1}</span></div><div><h2><i className="detail-step-icon" aria-hidden="true"><Icon name={icons[index]!} size={18} /></i>{t(step.h,locale)}</h2><p>{t(step.p,locale)}</p></div></li>)}</ol></section><section className="detail-visit-questions"><SectionMark icon="search" title={t('Good to know',locale)} align="right" detail={t('Quick answers before you visit',locale)} variant="fade" /><div className="home-wrap"><div><span className="home-eyebrow">{t('Before your visit',locale)}</span><h2><Words text={t('A few things to know.',locale)} /></h2><Link href="/visit" className="salon-section-link">{t('Location & hours',locale)}</Link><figure className="detail-visit-photo home-reveal"><ImgSlot src="/images/story/interior.png" alt={t('Inside the salon, with chairs ready for guests',locale)} sizes="(max-width: 767px) 100vw, 40vw" /><figcaption><Icon name="pin" size={15} />{t('Pasyala & Kaleliya',locale)}</figcaption></figure></div><div className="detail-visit-faq"><Faq items={FAQS.map(item=>({q:t(item.q,locale),a:t(item.a,locale)}))} /><div className="detail-visit-ask home-reveal"><span className="detail-visit-ask__icon" aria-hidden="true"><Icon name="phone" size={20} /></span><div><b>{t('Questions?',locale)}</b><p>{t('Talk to the salon — we’re happy to help with any request.',locale)}</p></div><a className="home-btn home-btn--primary" href={`tel:${contact.phonePrimary.replace(/\s/g,'')}`}><Icon name="phone" size={15} />{t('Call the salon',locale)}</a></div></div></div></section></div>;
}
