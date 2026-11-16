import type { BusinessHour } from '@/lib/supabase/types';
import { DAYS } from '@/lib/salon-content';
import { minutesToLabel } from '@/lib/format';
import { t } from '@/lib/i18n/translations';

export function OpeningHours({hours,locale}:{hours:BusinessHour[];locale:string}){
  const daily=hours.length===7&&hours.every(day=>!day.is_closed&&day.open_minute===600&&day.close_minute===1440);
  return <details className="salon-weekly-hours location-full-hours"><summary><span>{daily?`${t('Open daily',locale)} · ${t('10 AM – midnight',locale)}`:t('See all opening hours',locale)}</span><span aria-hidden="true">+</span></summary><ul className="location-hours-list">{DAYS.map(({dow,label})=>{const day=hours.find(item=>item.day_of_week===dow);return <li key={dow}><span>{t(label,locale)}</span><span>{!day||day.is_closed?t('Closed',locale):`${minutesToLabel(day.open_minute,locale)} – ${minutesToLabel(day.close_minute,locale)}`}</span></li>;})}</ul></details>;
}
