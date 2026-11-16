'use client';
import { useState } from 'react';
import type { Stylist } from '@/lib/supabase/types';
import { stylistAvatarSrc } from '@/lib/stylist-card';
import { ImgSlot } from '@/components/site/img-slot';
import { BookButton } from '@/components/site/book-button';
import { t } from '@/lib/i18n/translations';

const filters=[{label:'All stylists',match:/.*/},{label:'Hair & colour',match:/gents|ladies|hair|cut|colour/i},{label:'Beard & grooming',match:/barber|beard|fade/i},{label:'Beauty & bridal',match:/beauty|facial|bridal/i}];
export function StylistDirectory({ stylists, locale }: { stylists:Stylist[]; locale:string }) {
  const [filter,setFilter]=useState(0);
  const matches=(stylist:Stylist,index:number)=>filters[index]!.match.test(`${stylist.role} ${stylist.tags.join(' ')}`);
  const shown=stylists.filter(stylist=>matches(stylist,filter));
  return <><div className="directory-toolbar"><div role="group" aria-label={t('Filter stylists',locale)}>{filters.map((item,index)=><button type="button" key={item.label} aria-pressed={filter===index} onClick={()=>setFilter(index)}>{t(item.label,locale)} <span>{stylists.filter(stylist=>matches(stylist,index)).length}</span></button>)}</div><p role="status">{t('{count} stylists',locale).replace('{count}',String(shown.length))}</p></div><div className="directory-grid" key={filter}>{shown.map(stylist=><article className="directory-person home-reveal" key={stylist.id}><div className="directory-person__photo"><ImgSlot src={stylistAvatarSrc(stylist)} alt={stylist.name} sizes="(max-width: 767px) 45vw, 25vw" /></div><div className="directory-person__body"><span className="directory-role">{t(stylist.role,locale)}</span><h2>{stylist.name}</h2><div className="directory-specialties"><span>{t('Specialties',locale)}</span><ul>{stylist.tags.map(tag=><li key={tag}>{t(tag,locale)}</li>)}</ul></div>{stylist.rating!=null&&stylist.rating_count>0&&<p className="directory-rating">★ {Number(stylist.rating).toFixed(1)} <span>({stylist.rating_count})</span></p>}<BookButton variant="ghost">{t('Book a visit',locale)}</BookButton></div></article>)}</div>{!shown.length&&<p className="salon-empty">{t('No stylists in this category yet.',locale)}</p>}</>;
}
