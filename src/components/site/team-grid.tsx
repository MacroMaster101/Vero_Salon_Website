import { ImgSlot } from '@/components/site/img-slot';
import type { Stylist } from '@/lib/supabase/types';
import { ratingLabel, stylistAvatarSrc } from '@/lib/stylist-card';
import { t } from '@/lib/i18n/translations';

export function TeamGrid({ stylists, locale }: { stylists: Stylist[]; locale: string }) {
  return <div className="home-team salon-team-grid">{stylists.map(stylist => {
    const rating = ratingLabel(stylist.rating, stylist.rating_count);
    return <article className="home-member home-reveal" key={stylist.id}><div className="home-member__photo"><ImgSlot src={stylistAvatarSrc(stylist)} alt={stylist.name} /></div><h3>{stylist.name}</h3><div className="home-member__role">{t(stylist.role, locale)}</div><div className="home-member__rating">{rating.stars === '★ New' ? t('New to Vero', locale) : rating.stars}</div><div className="home-member__tags">{stylist.tags.map(tag => <span className="home-tag" key={tag}>{t(tag, locale)}</span>)}</div></article>;
  })}</div>;
}
