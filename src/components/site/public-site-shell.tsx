import Link from 'next/link';
import type { ReactNode } from 'react';
import { getPublicSite } from '@/lib/public-site';
import { SITE_NAVIGATION } from '@/lib/site-navigation';
import { t } from '@/lib/i18n/translations';
import { BookingProvider } from '@/components/booking/booking-provider';
import { AccountModalsProvider } from '@/components/account/account-modals';
import { LangToggle } from '@/components/theme/lang-toggle';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NavAuth } from '@/components/site/nav-auth';
import { BookButton } from '@/components/site/book-button';
import { LogoIcon } from '@/components/ui/logo-icon';
import { SiteSurface, PublicNavigation, SiteBottomNav } from '@/components/site/site-surface';
import { WhatsAppFab } from '@/components/home/whatsapp-fab';
import { avatarSrc } from '@/lib/avatar';

export async function PublicSiteShell({ children }: { children: ReactNode }) {
  const { services, stylists, profile, locale, contact, userMetadata, hasPassword } = await getPublicSite();
  const enabled = !profile || profile.role === 'user';
  const accountHref = !profile ? '/login' : profile.role === 'admin' ? '/admin' : profile.role === 'owner' ? '/owner' : profile.role === 'staff' ? '/staff' : null;
  const accountLabel = profile?.role === 'staff' ? 'Schedule' : profile?.role === 'admin' ? 'Admin' : profile?.role === 'owner' ? 'My shop' : 'Account';
  return (
      <BookingProvider services={services} stylists={stylists} enabled={enabled} prefill={profile ? { name: profile.fullName ?? '', phone: profile.phone ?? '', email: profile.email ?? '' } : null} locale={locale}>
        <AccountModalsProvider profile={profile} userMetadata={userMetadata} hasPassword={hasPassword} locale={locale}>
          <SiteSurface>
            <header className="home-header">
              <div className="home-wrap home-header__inner">
                <Link className="home-brand" href="/" aria-label={t('Vero Salon home', locale)}>
                  <span className="home-brand__mark" aria-hidden="true"><LogoIcon /></span>
                  <span className="home-brand__name"><b>Vero Salon</b><small>{t('Unisex', locale)} · {t('Pasyala', locale)}</small></span>
                </Link>
                <PublicNavigation />
                <div className="home-header__actions">
                  <LangToggle currentLocale={locale} className="home-header__lang" />
                  <ThemeToggle />
                  <NavAuth profile={profile} userMetadata={userMetadata} locale={locale} />
                  <BookButton className="home-header__book">{t('Book now', locale)}</BookButton>
                </div>
              </div>
            </header>
            <main id="main-content">{children}</main>
            <footer className="home-foot">
              <div className="home-wrap">
                <div className="home-foot__grid">
                  <div className="home-foot__brand">
                    <Link className="home-brand" href="/" aria-label={t('Vero Salon home', locale)}><span className="home-brand__mark" aria-hidden="true"><LogoIcon /></span><span className="home-brand__name"><b>Vero Salon</b><small>{t('Unisex', locale)} · {t('Pasyala', locale)}</small></span></Link>
                    <p>{t(contact.footerBlurb, locale)}</p>
                  </div>
                  <div><h3>{t('Salon', locale)}</h3><ul>{SITE_NAVIGATION.map(item => <li key={item.id}><Link href={item.href}>{t(item.label, locale)}</Link></li>)}</ul></div>
                  <div><h3>{t('Hours', locale)}</h3><ul><li>{t('Open daily', locale)}</li><li>{t('10 AM – midnight', locale)}</li><li>{t('Walk-ins welcome', locale)}</li></ul></div>
                  <div><h3>{t('Contact', locale)}</h3><ul><li><a href={`tel:${contact.phonePrimary.replace(/\s/g, '')}`}>{contact.phonePrimary}</a></li><li><a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer">{t('Facebook', locale)}</a></li><li>{t(contact.address, locale)}</li></ul></div>
                </div>
                <div className="home-foot__bottom"><span>© 2026 Vero Salon Unisex. {t('All rights reserved.', locale)}</span><span className="home-foot__legal"><Link href="/privacy">{t('Privacy', locale)}</Link><Link href="/terms">{t('Terms', locale)}</Link></span></div>
              </div>
            </footer>
            <WhatsAppFab phone={contact.phonePrimary} locale={locale} />
            <SiteBottomNav signedIn={!!profile} accountHref={accountHref} accountLabel={t(accountLabel, locale)} avatarSrc={profile ? avatarSrc(userMetadata, profile.email ?? profile.fullName ?? 'guest') : null} locale={locale} />
          </SiteSurface>
        </AccountModalsProvider>
      </BookingProvider>
  );
}
