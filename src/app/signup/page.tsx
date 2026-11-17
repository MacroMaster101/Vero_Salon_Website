import type { Metadata } from 'next';
import { SignupForm } from './signup-form';
import { safeNext } from '@/lib/auth/redirect';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/settings/get';
import { customerAccessOpen } from '@/lib/settings/schema';
import { t } from '@/lib/i18n/translations';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  if (!customerAccessOpen(await getSiteSettings())) {
    return (
      <main className="maint">
        <div className="maint__card">
          <h1 className="maint__title">{t('Sign-ups are paused', locale)}</h1>
          <p className="maint__text">{t('New accounts can’t be created right now. Please call us to book your visit.', locale)}</p>
          <div className="maint__actions"><Link className="home-btn home-btn--primary" href="/">{t('Back to home', locale)}</Link></div>
        </div>
      </main>
    );
  }
  return <main><SignupForm next={next} prefillEmail={sp.email ?? ''} locale={locale} /></main>;
}
