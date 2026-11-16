'use client';
import { useEffect, useRef } from 'react';
import type { GalleryItem } from '@/lib/supabase/types';
import { ImgSlot } from '@/components/site/img-slot';
import { t } from '@/lib/i18n/translations';

export function LookbookLightbox({ active, locale, onClose }: { active: GalleryItem | null; locale: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!active) return;
    const el = dialog.current;
    el?.showModal();
    const previousOverflow = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';
    return () => { el?.close(); document.body.style.overflowY = previousOverflow; };
  }, [active]);
  return <dialog ref={dialog} className="salon-lightbox" aria-label={active ? t(active.title,locale) : t('The lookbook',locale)} onCancel={onClose} onClick={event => { if(event.target === event.currentTarget) onClose(); }}>
    {active && <div className="salon-lightbox__inner"><button type="button" className="salon-lightbox__close" aria-label={t('Close image',locale)} onClick={onClose}>×</button><div className="salon-lightbox__image"><ImgSlot src={active.image_url} alt={t(active.title,locale)} priority sizes="(max-width: 767px) 100vw, 75vw" /></div><div className="salon-lightbox__caption"><h2>{t(active.title,locale)}</h2><p>{t(active.category,locale)}</p></div></div>}
  </dialog>;
}
