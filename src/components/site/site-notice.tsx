import { t } from '@/lib/i18n/translations';
import type { SiteSettings } from '@/lib/settings/schema';

/** Which notice (if any) everyone should see at the top of the public site. */
export function siteNoticeText(s: SiteSettings): string | null {
  // Maintenance pauses customer sign-in + booking (see schema) and says why.
  if (s.maintenance) return s.maintenanceMessage || 'We’re doing some maintenance — online booking and sign-in are paused for now.';
  if (!s.booking && !s.customerLogin) return 'Online booking and customer sign-in are paused right now.';
  if (!s.booking) return s.bookingMessage || 'Online booking is paused right now.';
  if (!s.customerLogin) return 'Customer sign-in is paused right now — you can still book without an account.';
  return null;
}

/**
 * Thin strip above the site header, shown to every visitor while maintenance
 * is on or customer sign-in / online booking is switched off in Web settings. It scrolls away
 * with the page; the sticky nav underneath is unchanged.
 */
export function SiteNotice({ text, phone, locale }: { text: string; phone: string; locale: string }) {
  const tel = phone.replace(/\s/g, '');
  return (
    <div className="site-notice" role="status">
      <span className="site-notice__dot" aria-hidden="true" />
      <span className="site-notice__txt">{t(text, locale)}</span>
      <a className="site-notice__call" href={`tel:${tel}`}>{t('Call', locale)} {phone}</a>
    </div>
  );
}
