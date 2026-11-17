'use client';
import { useState } from 'react';
import type { Stylist } from '@/lib/supabase/types';
import { stylistAvatarSrc } from '@/lib/stylist-card';
import { ImgSlot } from '@/components/site/img-slot';
import { BookButton } from '@/components/site/book-button';
import { t } from '@/lib/i18n/translations';
import { Icon, type IconName } from '@/components/ui/icon';

const filters:{label:string;icon:IconName;match:RegExp}[]=[{label:'All stylists',icon:'people',match:/.*/},{label:'Hair & colour',icon:'scissors',match:/gents|ladies|hair|cut|colour/i},{label:'Beard & grooming',icon:'user',match:/barber|beard|fade/i},{label:'Beauty & bridal',icon:'star',match:/beauty|facial|bridal/i}];
export function StylistDirectory({ stylists, locale }: { stylists:Stylist[]; locale:string }) {
  const [filter,setFilter]=useState(0);
  const matches=(stylist:Stylist,index:number)=>filters[index]!.match.test(`${stylist.role} ${stylist.tags.join(' ')}`);
  const shown=stylists.filter(stylist=>matches(stylist,filter));
  return <><div className="directory-toolbar"><div role="group" aria-label={t('Filter stylists',locale)}>{filters.map((item,index)=><button type="button" key={item.label} aria-pressed={filter===index} onClick={()=>setFilter(index)}><Icon name={item.icon} size={15} />{t(item.label,locale)} <span>{stylists.filter(stylist=>matches(stylist,index)).length}</span></button>)}</div><p role="status">{t('{count} stylists',locale).replace('{count}',String(shown.length))}</p></div><div className="directory-grid" key={filter}>{shown.map(stylist=><article className="directory-person home-reveal" key={stylist.id}><div className="directory-person__photo"><ImgSlot src={stylistAvatarSrc(stylist)} alt={stylist.name} sizes="(max-width: 767px) 45vw, 25vw" />{stylist.rating!=null&&stylist.rating_count>0&&<span className="directory-person__badge"><Icon name="star" size={13} />{Number(stylist.rating).toFixed(1)}</span>}</div><div className="directory-person__body"><span className="directory-role"><Icon name="scissors" size={14} />{t(stylist.role,locale)}</span><h2>{stylist.name}</h2><div className="directory-specialties"><span>{t('Specialties',locale)}</span><ul>{stylist.tags.map(tag=><li key={tag}><Icon name="check" size={13} />{t(tag,locale)}</li>)}</ul></div>{stylist.rating!=null&&stylist.rating_count>0&&<p className="directory-rating">★ {Number(stylist.rating).toFixed(1)} <span>({stylist.rating_count})</span></p>}<BookButton variant="ghost"><Icon name="calendar" size={15} />{t('Book a visit',locale)}</BookButton></div></article>)}</div>{!shown.length&&<p className="salon-empty">{t('No stylists in this category yet.',locale)}</p>}</>;
}
