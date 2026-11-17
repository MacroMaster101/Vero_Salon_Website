import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { t } from '@/lib/i18n/translations';
import { LangToggle } from '@/components/theme/lang-toggle';
import { ThemeToggle } from '@/components/theme/theme-toggle';

// Shared frame for all auth pages (sign in / sign up / forgot / reset).
// Desktop: a full-height brand panel on the left (salon name, the photo at its
// own 4:5 shape so it is never cropped, opening hours) and, on the right, a
// top bar (back link + language/theme) above the vertically centred form.
// Phones: top bar, a compact brand row, then the form. Styles: section-polish.css §18.
export function AuthShell({
  back,
  children,
  locale = 'en',
}: {
  back?: { href: string; label: string };
  children: ReactNode;
  locale?: string;
}) {
  return (
    <div className="vauth">
      <header className="vauth__top">
        {back ? (
          <Link href={back.href} className="vauth__back">
            <Icon name="arrowLeft" className="ic" /> <span className="vauth__back-label">{back.label}</span>
          </Link>
        ) : <span />}
        <div className="vauth__prefs">
          <LangToggle currentLocale={locale} className="vauth__lang" />
          <ThemeToggle />
        </div>
      </header>

      <aside className="vauth__panel" aria-hidden="true">
        <div className="vauth__frame">
          <div className="vauth__photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/generated/barber-craft.webp" alt="" width={1122} height={1402} />
          </div>
        </div>
        {/* name + hours stacked and anchored to the bottom, so a longer
            (e.g. Sinhala, two-line) hours line pushes the name up instead
            of running into it */}
        <div className="vauth__caption">
          {/* lang="en": the brand name keeps the Latin display font in Sinhala mode */}
          <p className="vauth__brand" lang="en">Vero Salon</p>
          <p className="vauth__hours">
            <span className="vauth__dot" />
            <span>{t('Open daily 10 AM – midnight', locale)}</span>
            <span className="vauth__loc">{t('Pasyala', locale)}</span>
          </p>
        </div>
      </aside>

      {/* each auth page already wraps this shell in <main> */}
      <div className="vauth__body">
        <div className="vauth__form">{children}</div>
      </div>
    </div>
  );
}
