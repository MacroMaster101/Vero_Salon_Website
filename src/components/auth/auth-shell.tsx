import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { t } from '@/lib/i18n/translations';
import { LangToggle } from '@/components/theme/lang-toggle';
import { ThemeToggle } from '@/components/theme/theme-toggle';

// Shared frame for all auth pages (sign in / sign up / forgot / reset):
// the salon interior in an arched mirror frame with a live "open" chip,
// beside the form column. The back pill lives here — outside the animated
// columns — so its absolute position is stable while they enter.
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
    <div className="auth">
      {back && (
        <Link href={back.href} className="auth__back">
          <Icon name="arrowLeft" className="ic" /> {back.label}
        </Link>
      )}
      <div className="auth__prefs">
        <LangToggle currentLocale={locale} className="auth__lang" />
        <ThemeToggle />
      </div>
      <aside className="auth__scene" aria-hidden="true">
        <div className="auth__mark">Vero Salon</div>
        <div className="auth__arch">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/generated/barber-craft.webp" alt="" />
        </div>
        <div className="auth__chip"><span className="auth__dot" /> {t('Open daily 10 AM – midnight', locale)}<span className="auth__chip-loc">· {t('Pasyala', locale)}</span></div>
      </aside>
      <div className="auth__form">{children}</div>
    </div>
  );
}
