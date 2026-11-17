'use client';
import { useId, useState, type KeyboardEvent } from 'react';
import { money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';
import { t } from '@/lib/i18n/translations';
import type { Service, ServiceCategoryRow } from '@/lib/supabase/types';
import { BookButton } from '@/components/site/book-button';
import Link from 'next/link';
import { ImgSlot } from '@/components/site/img-slot';
import { Icon, type IconName } from '@/components/ui/icon';

type Audience = 'him' | 'her' | 'both';
const SAFE_ICONS = new Set<IconName>(['scissors','user','star','people','tag','clock','eye','calendar','check','grid','pin']);
const catIcon = (icon: string): IconName => (SAFE_ICONS.has(icon as IconName) ? icon as IconName : 'scissors');
export function audienceOf(s: Service): Audience {
  const hay = `${s.slug} ${s.name}`.toLowerCase();
  const him = /\b(gents?|men'?s?|man|male|boys?|beard|shave|moustache|barber)\b/.test(hay);
  const her = /\b(ladies|lady|women'?s?|woman|female|girls?|bridal|bride|wedding|mani|pedi|manicure|pedicure|makeup|make-up)\b/.test(hay);
  return him && !her ? 'him' : her && !him ? 'her' : 'both';
}
const MENS_EDITORIAL: Record<string, string> = {
  'gents-cut': '/images/generated/barber-craft.webp', 'beard': '/images/generated/beard-detail.webp',
  'colour-roots': '/images/generated/mens-colour.webp', 'colour-full': '/images/generated/mens-colour.webp',
  'hair-spa': '/images/generated/scalp-care.webp',
};
function ServiceCard({ s, locale, audience = 'both' }: { s: Service; locale: string; audience?: Audience }) {
  const photo = servicePhoto(s);
  const editorial = !s.image_url && audience !== 'her' ? MENS_EDITORIAL[s.slug] : undefined;
  return <article className="home-scard">
    {/* eslint-disable-next-line @next/next/no-img-element -- local assets and CMS uploads */}
    <img className="home-scard__photo" src={editorial || (photo.type === 'img' ? photo.src : '')} data-fb={photo.type === 'img' ? photo.fallbackSrc : ''} alt="" loading="lazy" onError={e => { const el=e.currentTarget; if(!el.dataset.fallback) { el.dataset.fallback='1'; el.src=el.dataset.fb || '/images/services/hair.png'; } }} />
    <div className="home-scard__body"><div className="home-scard__top"><h3 className="home-scard__name">{t(s.name, locale)}</h3><span className="home-scard__price">{money(s.price_lkr)}</span></div>
      {s.description && <p className="home-scard__desc">{t(s.description, locale)}</p>}
      <span className="home-scard__dur">{s.duration_min} {t('min', locale)}</span>
      <BookButton variant="ghost" className="studio-service-book">{t('Book a visit', locale)}</BookButton>
    </div>
  </article>;
}
export function ServicePreview({ services, locale }: { services: Service[]; locale: string }) {
  const groups = [
    { title:'Cuts & styling', note:'A fresh look for every age.', image:'/images/generated/barber-craft.webp', slugs:['gents-cut','ladies-cut','kids-cut'] },
    { title:'Colour & care', note:'Healthy hair. Beautiful colour.', image:'/images/services/colour.png', slugs:['colour-roots','colour-full','hair-spa'] },
    { title:'Beauty & occasions', note:'Everyday care to your big day.', image:'/images/services/facial.png', slugs:['facial','threading','bridal'] },
  ];
  return <div className="salon-service-menu">{groups.map((group,index) => {
    const picks=group.slugs.map(slug=>services.find(service=>service.slug===slug)).filter((service): service is Service=>!!service);
    return <article className="salon-service-group home-reveal" key={group.title}>
      <Link href="/services" className="salon-service-image" aria-label={`${t(group.title,locale)} — ${t('View all services',locale)}`}><ImgSlot src={group.image} alt={t(group.title,locale)} sizes="(max-width: 767px) 100vw, 33vw" /></Link>
      <div className="salon-service-title"><span aria-hidden="true">0{index+1}</span><h3>{t(group.title,locale)}</h3></div>
      <p>{t(group.note,locale)}</p>
      <ul>{picks.map(service=><li key={service.id}><span>{t(service.name,locale)}</span><b>{money(service.price_lkr)}</b></li>)}</ul>
    </article>;
  })}</div>;
}
export function ServicesTabs({ services, categories: rows = [], locale = 'en' }: { services: Service[]; categories?: ServiceCategoryRow[]; featured?: Service | null; locale?: string }) {
  // only categories that have something to book; admins manage them at /admin/services
  const categories = rows.filter(c => services.some(s => s.category === c.slug))
    .map(c => ({ id: c.slug, label: c.name, note: c.note, image: c.image_url || '/images/services/hair.png', icon: catIcon(c.icon) }));
  const [picked, setCat] = useState<string>('');
  const cat = categories.some(c => c.id === picked) ? picked : (categories[0]?.id ?? '');
  const [aud, setAud] = useState<Audience>('both');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const id = useId();
  const current = categories.find(c => c.id === cat) ?? categories[0];
  const inCategory = services.filter(s => s.category === cat);
  const fromPrice = inCategory.length ? Math.min(...inCategory.map(s => s.price_lkr)) : null;
  const audiences: { id: Audience; label: string }[] = [{ id:'both',label:'Everyone' },{ id:'him',label:'For him' },{ id:'her',label:'For her' }];
  const list = services.filter(s => {
    if (s.category !== cat || (aud !== 'both' && audienceOf(s) !== 'both' && audienceOf(s) !== aud)) return false;
    return `${s.name} ${s.description ?? ''} ${t(s.name, locale)} ${t(s.description ?? '', locale)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  });
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? (index+1)%categories.length : (event.key === 'ArrowLeft' || event.key === 'ArrowUp') ? (index+categories.length-1)%categories.length : event.key === 'Home' ? 0 : event.key === 'End' ? categories.length-1 : null;
    if(next === null) return;
    const category = categories[next];
    if (!category) return;
    event.preventDefault(); setCat(category.id);
    (event.currentTarget.parentElement?.querySelectorAll('button')[next] as HTMLButtonElement | undefined)?.focus();
  }
  return <div className="home-svc salon-catalog">
    {/* category switches on the left, the chosen category's photo on the right */}
    <div className="salon-catalog__hero">
      <div className="home-svc__cats salon-catalog__switch" role="tablist" aria-orientation="vertical" aria-label={t('Service category',locale)} style={{ ['--cols' as string]: categories.length <= 3 ? categories.length : categories.length === 4 ? 2 : 3 }}>{categories.map((category,index) => { const on = cat===category.id; const count = services.filter(s=>s.category===category.id).length; return <button key={category.id} type="button" role="tab" id={`${id}-${category.id}`} aria-controls={`${id}-panel`} tabIndex={on ? 0 : -1} aria-selected={on} className={`home-svc__cat salon-switch${on?' is-on':''}`} onClick={()=>setCat(category.id)} onKeyDown={event=>onTabKey(event,index)}>
        <span className="salon-switch__icon" aria-hidden="true"><Icon name={category.icon} size={18} /></span>
        <span className="salon-switch__text"><b>{t(category.label,locale)}</b><small>{t(count===1?'{count} service':'{count} services',locale).replace('{count}',String(count))}</small></span>
        <span className="salon-switch__arrow" aria-hidden="true"><Icon name="arrowLeft" size={16} /></span>
      </button>; })}</div>
      {current && <div className="salon-catalog__banner" data-cat={cat} key={`banner-${cat}`}>
        <div className="salon-catalog__banner-img"><ImgSlot src={current.image} alt={t(current.label,locale)} sizes="(max-width: 767px) 100vw, 70vw" /></div>
        <div className="salon-catalog__banner-copy">
          <h2>{t(current.label,locale)}</h2>
          <p>{t(current.note,locale)}</p>
          <ul>
            {fromPrice !== null && <li className="is-price">{t('From {price}',locale).replace('{price}',money(fromPrice))}</li>}
          </ul>
        </div>
      </div>}
    </div>
    <div className="salon-catalog__filters"><div className="home-svc__auds" role="group" aria-label={t('Who is this for',locale)}>{audiences.map(a=><button key={a.id} type="button" aria-pressed={aud===a.id} className={`home-svc__aud${aud===a.id?' is-on':''}`} onClick={()=>setAud(a.id)}>{t(a.label,locale)}</button>)}</div>
      <div className="salon-catalog__right"><label className="salon-search salon-search--inline"><span className="sr-only">{t('Find a service',locale)}</span><Icon name="search" size={16} className="salon-search__icon" /><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Search cuts, colour, care…',locale)} /></label><p role="status" className="sr-only">{t(list.length===1?'{count} service':'{count} services',locale).replace('{count}',String(list.length))}</p>
        <div className="salon-view" role="group" aria-label={t('Layout',locale)}>
          <button type="button" aria-pressed={view==='list'} aria-label={t('List view',locale)} title={t('List view',locale)} onClick={()=>setView('list')}><Icon name="more" size={17} /></button>
          <button type="button" aria-pressed={view==='grid'} aria-label={t('Card view',locale)} title={t('Card view',locale)} onClick={()=>setView('grid')}><Icon name="grid" size={17} /></button>
        </div>
      </div>
    </div>
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${cat}`} tabIndex={0}>
      {list.length ? <div className={`home-svc__cards salon-catalog__results${view==='grid'?' is-grid':''}`} key={`${cat}-${aud}-${query}-${view}`}>{list.map(s=><ServiceCard key={s.id} s={s} locale={locale} audience={aud} />)}</div> : <div className="salon-empty"><h3>{t('No services found',locale)}</h3><p>{t('Try another category or clear your search.',locale)}</p><button className="home-btn home-btn--ghost" onClick={()=>{setQuery('');setAud('both');}}>{t('Clear filters',locale)}</button></div>}
    </div>
  </div>;
}
