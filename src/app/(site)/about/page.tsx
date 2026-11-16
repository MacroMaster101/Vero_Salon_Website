import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { ImgSlot } from '@/components/site/img-slot';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';

export const metadata:Metadata={title:'Our Story | Vero Salon, Pasyala',description:'Discover Vero Salon, a welcoming unisex hair and beauty salon on Attanagalla Road, Pasyala.'};
export default async function AboutPage(){
  const {story,stats,locale}=await getPublicSite();
  return <div className="detail-page detail-story"><DetailHeading label="Our Story" title="About Vero Salon." description="A friendly neighbourhood salon in Pasyala, where every appointment starts with listening." locale={locale}><Link className="salon-section-link" href="/stylists">{t('Meet our stylists',locale)}</Link></DetailHeading><figure className="detail-story-banner home-wrap"><div><ImgSlot src="/images/generated/salon-care.webp" alt={t('Personal hair care and styling',locale)} priority sizes="100vw" /></div><figcaption><span>Vero Salon</span><span>{t('Unisex',locale)} · {t('Pasyala',locale)}</span></figcaption></figure><section className="detail-story-body home-wrap"><div className="home-reveal"><span className="home-eyebrow">{t(story.eyebrow,locale)}</span><h2><Words text={t(story.heading,locale)} /></h2><span className="detail-sign">{t(story.sign,locale)}</span></div><div className="home-reveal">{story.paragraphs.map((paragraph,index)=><p key={index}>{t(paragraph,locale)}</p>)}</div></section><section className="detail-facts"><div className="home-wrap">{stats.cards.map((card,index)=><div key={index}><strong>{t(card.value,locale)}</strong><span>{t(card.label,locale)}</span></div>)}</div></section><section className="detail-story-links home-wrap"><Link id="team" href="/stylists"><span>01</span><div><h2><Words text={t('The people behind your look',locale)} mark={false} /></h2><p>{t('Discover the team and find the right person for your next appointment.',locale)}</p></div><span className="detail-story-links__go" aria-hidden="true">→</span></Link><Link id="how" href="/your-visit"><span>02</span><div><h2><Words text={t('Know what to expect',locale)} mark={false} /></h2><p>{t('A simple guide from choosing your service to the final mirror check.',locale)}</p></div><span className="detail-story-links__go" aria-hidden="true">→</span></Link></section></div>;
}
