import type { Metadata } from 'next';
import { Words } from '@/components/site/words';
import Link from 'next/link';
import { DetailHeading } from '@/components/site/detail-heading';
import { ImgSlot } from '@/components/site/img-slot';
import { getPublicSite } from '@/lib/public-site';
import { t } from '@/lib/i18n/translations';
import { SectionMark } from '@/components/home/section-mark';
import { Icon, type IconName } from '@/components/ui/icon';
import { Ticker } from '@/components/site/ticker';

const FACT_ICONS: IconName[] = ['star', 'people', 'scissors', 'clock'];
const VALUES: { icon: IconName; h: string; p: string }[] = [
  { icon: 'people', h: 'We listen first', p: 'Every visit starts with a chat about the look you want.' },
  { icon: 'clock', h: 'Unhurried care', p: 'We take the time to get it right, never rushed.' },
  { icon: 'tag', h: 'Clear prices', p: 'Prices are shown up front and confirmed before we start.' },
];
/* a plain number (with an optional ★) counts up; anything else shows as is */
function FactValue({ value }: { value: string }) {
  const m = /^(\d+(?:\.\d+)?)(★?)$/.exec(value);
  return m ? <><Ticker value={m[1]!} />{m[2]}</> : <>{value}</>;
}

export const metadata:Metadata={title:'Our Story | Vero Salon, Pasyala',description:'Discover Vero Salon, a welcoming unisex hair and beauty salon on Attanagalla Road, Pasyala.'};
export default async function AboutPage(){
  const {story,stats,locale}=await getPublicSite();
  return <div className="detail-page detail-story"><DetailHeading label="Our Story" title="About Vero Salon." description="A friendly neighbourhood salon in Pasyala, where every appointment starts with listening." locale={locale} images={['/images/generated/salon-care.webp','/images/how/step-5.png']} badge={{icon:'star',value:'4.9',text:t('Google rating',locale)}}><Link className="salon-section-link" href="/stylists">{t('Meet our stylists',locale)}</Link></DetailHeading><SectionMark icon="people" title={t('Our Story',locale)} detail={t('How Vero began',locale)} variant="solid" /><section className="detail-story-body home-wrap"><div className="home-reveal"><span className="home-eyebrow">{t(story.eyebrow,locale)}</span><h2><Words text={t(story.heading,locale)} /></h2><span className="detail-sign">{t(story.sign,locale)}</span><figure className="detail-story-photo"><ImgSlot src="/images/story/interior.png" alt={t('Inside Vero Salon',locale)} sizes="(max-width: 767px) 100vw, 45vw" /></figure></div><div className="home-reveal">{story.paragraphs.map((paragraph,index)=><p key={index}>{t(paragraph,locale)}</p>)}<ul className="detail-story-values">{VALUES.map(value=><li key={value.h}><span aria-hidden="true"><Icon name={value.icon} size={18} /></span><div><b>{t(value.h,locale)}</b><p>{t(value.p,locale)}</p></div></li>)}</ul></div></section><section className="detail-facts"><SectionMark icon="check" title={t('At a glance',locale)} align="center" detail={t('Vero in a few numbers',locale)} variant="fade" /><div className="home-wrap">{stats.cards.map((card,index)=><div className="home-reveal" key={index}><span className="detail-facts__icon" aria-hidden="true"><Icon name={FACT_ICONS[index % FACT_ICONS.length]!} size={18} /></span><strong><FactValue value={t(card.value,locale)} /></strong><span>{t(card.label,locale)}</span></div>)}</div></section><SectionMark icon="search" title={t('Keep exploring',locale)} align="right" detail={t('Meet the team or plan your visit',locale)} variant="dashed" /><section className="detail-story-links home-wrap"><Link id="team" href="/stylists" className="home-reveal"><div className="detail-story-links__img" aria-hidden="true"><ImgSlot src="/images/stylists/sanduni.png" alt="" sizes="(max-width: 767px) 100vw, 45vw" /></div><span>01</span><div><h2><Words text={t('The people behind your look',locale)} mark={false} /></h2><p>{t('Discover the team and find the right person for your next appointment.',locale)}</p></div><span className="detail-story-links__go" aria-hidden="true">→</span></Link><Link id="how" href="/your-visit" className="home-reveal"><div className="detail-story-links__img" aria-hidden="true"><ImgSlot src="/images/how/step-2.png" alt="" sizes="(max-width: 767px) 100vw, 45vw" /></div><span>02</span><div><h2><Words text={t('Know what to expect',locale)} mark={false} /></h2><p>{t('A simple guide from choosing your service to the final mirror check.',locale)}</p></div><span className="detail-story-links__go" aria-hidden="true">→</span></Link></section></div>;
}
