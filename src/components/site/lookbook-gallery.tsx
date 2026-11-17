'use client';
import { useState } from 'react';
import { ImgSlot } from '@/components/site/img-slot';
import type { GalleryItem } from '@/lib/supabase/types';
import { t } from '@/lib/i18n/translations';
import { LookbookLightbox } from '@/components/site/lookbook-lightbox';
import { Icon } from '@/components/ui/icon';

export function LookbookGallery({ items, locale }: { items: GalleryItem[]; locale: string }) {
  const [filter, setFilter] = useState('All looks');
  const [active, setActive] = useState<GalleryItem | null>(null);
  const tags = ['All looks', ...new Set(items.map(item => item.tag).filter(Boolean))];
  const visible = filter === 'All looks' ? items : items.filter(item => item.tag === filter);
  return <>
    <div className="salon-gallery-toolbar"><div className="salon-gallery-filters" role="group" aria-label={t('Filter looks',locale)}>{tags.map(tag=><button key={tag} className={`home-svc__aud${filter===tag?' is-on':''}`} aria-pressed={filter===tag} onClick={()=>setFilter(tag)}>{t(tag,locale)} <span className="salon-gallery-filters__count">{tag==='All looks'?items.length:items.filter(item=>item.tag===tag).length}</span></button>)}</div>
    <p className="salon-result-count" role="status">{t('{count} looks',locale).replace('{count}',String(visible.length))}</p>
    </div>
    <div className={`salon-gallery${visible.length>=4?' salon-gallery--collection':''}`} key={filter}>{visible.map(item=><button type="button" className="salon-gallery__item" key={item.id} onClick={()=>setActive(item)} aria-label={`${t('View look',locale)}: ${t(item.title,locale)}`}><div className="salon-gallery__image"><ImgSlot src={item.image_url} alt={t(item.title,locale)} /><span className="salon-gallery__zoom" aria-hidden="true"><Icon name="eye" size={16} /></span>{item.tag && <span className="salon-gallery__tag">{t(item.tag,locale)}</span>}</div><span className="salon-gallery__caption"><b>{t(item.title,locale)}</b><span>{t(item.category,locale)}</span></span></button>)}</div>
    {items.length===0 && <p className="salon-empty">{t('New looks will appear here soon.',locale)}</p>}
    <LookbookLightbox active={active} locale={locale} onClose={()=>setActive(null)} />
  </>;
}
