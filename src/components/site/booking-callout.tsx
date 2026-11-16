import { BookButton } from '@/components/site/book-button';
import { Words } from '@/components/site/words';
import { t } from '@/lib/i18n/translations';

export function BookingCallout({ locale, phone }: { locale: string; phone: string }) {
  return <section className="home-section home-cta"><div className="home-wrap home-cta__inner"><span className="home-eyebrow">{t('Your next visit', locale)}</span><h2><Words text={t('Ready for a fresh start?', locale)} /></h2><p>{t('Pick your service, or call us for a little advice. Walk-ins are welcome too.', locale)}</p><div className="home-cta__actions"><BookButton>{t('Book a visit', locale)}</BookButton><a className="home-btn home-btn--light" href={`tel:${phone.replace(/\s/g,'')}`}>{t('Call the salon', locale)} · {phone}</a></div></div></section>;
}
