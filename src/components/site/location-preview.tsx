'use client';
import { OpeningHours } from '@/components/site/opening-hours';
import { useId, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import type { BusinessHour } from '@/lib/supabase/types';
import { locationDirections, type SalonLocation } from '@/lib/salon-locations';
import { LiveStatus } from '@/components/site/live-status';
import { BookButton } from '@/components/site/book-button';
import { t } from '@/lib/i18n/translations';
import { SectionMark } from '@/components/home/section-mark';

export function LocationPreview({locations,locale,hours,phoneOther,facebookUrl,mark}:{locations:SalonLocation[];locale:string;hours:BusinessHour[];phoneOther:string;facebookUrl:string;mark?:boolean}){
  const [selected,setSelected]=useState(0);
  const id=useId();
  const location=locations[selected];
  if(!location)return null;
  function onTabKey(event:KeyboardEvent<HTMLButtonElement>,index:number){
    const next=event.key==='ArrowRight'?(index+1)%locations.length:event.key==='ArrowLeft'?(index+locations.length-1)%locations.length:event.key==='Home'?0:event.key==='End'?locations.length-1:null;
    if(next===null)return;event.preventDefault();setSelected(next);(event.currentTarget.parentElement?.querySelectorAll('button')[next] as HTMLButtonElement|undefined)?.focus();
  }
  return <section className="home-section home-visit salon-home-visit" id="visit">{mark ? <SectionMark icon="clock" title={t('Come say hello',locale)} detail={t('Two salons, one warm welcome',locale)} variant="accent" /> : null}<div className="home-wrap"><div className="home-location-tabs" role="tablist" aria-label={t('Choose a location',locale)}>{locations.map((branch,index)=><button type="button" role="tab" id={`${id}-${branch.id}`} aria-controls={`${id}-panel`} aria-selected={selected===index} tabIndex={selected===index?0:-1} key={branch.id} onClick={()=>setSelected(index)} onKeyDown={event=>onTabKey(event,index)}>{t(branch.name,locale)}</button>)}</div><div className="home-visit__grid" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${location.id}`}><div className="home-reveal"><div className="home-location-heading"><div><span className="home-eyebrow">{t('Find us',locale)} · {t(location.name,locale)}</span><h2 className="home-h">{t('Make a little',locale)}<br /><em>{t('time for you.',locale)}</em></h2></div><LiveStatus hours={hours} locale={locale} /></div><div className="salon-visit-details"><div><span>{t('Address',locale)}</span><p>{t(location.address,locale)}</p></div><div><span>{t('Call / WhatsApp',locale)}</span><a href={`tel:${location.phone.replace(/\s/g,'')}`}>{location.phone}</a>{selected===0&&<small>{phoneOther}</small>}</div></div><OpeningHours hours={hours} locale={locale} /><div className="home-visit__actions"><BookButton>{t('Book a visit',locale)}</BookButton><a href={locationDirections(location)} className="home-btn home-btn--ghost" target="_blank" rel="noopener noreferrer">{t('Get directions',locale)}</a>{selected===0&&<a href={facebookUrl} className="home-btn home-btn--ghost" target="_blank" rel="noopener noreferrer">{t('Facebook',locale)}</a>}</div><Link href={`/visit#${location.id}`} className="salon-section-link">{t('Explore our locations',locale)}</Link></div><div className="home-visit__map home-reveal"><iframe key={location.id} src={location.mapEmbedUrl} title={`${t('Map showing',locale)} Vero Salon ${t(location.name,locale)}`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div></div></div></section>;
}
