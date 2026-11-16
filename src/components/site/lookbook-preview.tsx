'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { GalleryItem } from '@/lib/supabase/types';
import { ImgSlot } from '@/components/site/img-slot';
import { LookbookLightbox } from '@/components/site/lookbook-lightbox';
import { t } from '@/lib/i18n/translations';

export function LookbookPreview({ items, locale }: { items: GalleryItem[]; locale: string }) {
  const [active, setActive] = useState<GalleryItem | null>(null);
  const feature = items.find(item => /ladies|women|colour/i.test(`${item.title} ${item.tag}`)) ?? items[0];
  if (!feature) return null;
  const available = items.filter(item => item.id !== feature.id);
  const preferred = [available.find(item => /gents|fade/i.test(item.title)), available.find(item => /bridal/i.test(item.title))];
  const supporting = [...preferred, ...available].filter((item): item is GalleryItem => !!item).filter((item,index,array) => array.findIndex(other => other.id === item.id) === index).slice(0,2);
  function photo(item: GalleryItem, featured = false) {
    return <button type="button" className={`salon-look-tile home-reveal${featured ? ' salon-look-tile--feature' : ''}`} onClick={() => setActive(item)} aria-label={`${t('View look',locale)}: ${t(item.title,locale)}`}>
      <span className="salon-look-tile__image"><ImgSlot src={item.image_url} alt={t(item.title,locale)} sizes={featured ? '(max-width: 767px) 100vw, 45vw' : '(max-width: 767px) 50vw, 25vw'} /></span>
      <span className="salon-look-tile__caption"><span><b>{t(item.title,locale)}</b><small>{t(item.category,locale)}</small></span><span>{t(item.tag,locale)}</span></span>
    </button>;
  }
  return <>
    <div className="salon-look-editorial">
      <div className="salon-look-intro home-reveal"><span className="home-eyebrow">{t('The lookbook',locale)}</span><h2 className="home-h">{t('Find your',locale)}<br /><em>{t('next look.',locale)}</em></h2><p>{t('Fresh fades, soft colour and finishing touches. A little inspiration for your next visit.',locale)}</p><Link className="salon-section-link" href="/lookbook">{t('Explore the lookbook',locale)}</Link></div>
      {photo(feature,true)}
      <div className="salon-look-pair">{supporting.map(item => <div key={item.id}>{photo(item)}</div>)}</div>
    </div>
    <LookbookLightbox active={active} locale={locale} onClose={() => setActive(null)} />
  </>;
}
