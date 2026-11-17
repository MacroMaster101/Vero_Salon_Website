import type { Metadata } from 'next';
import { LoginForm } from './login-form';
import { safeNext } from '@/lib/auth/redirect';
import { cookies } from 'next/headers';
import { getSiteSettings } from '@/lib/settings/get';
import { customerAccessOpen } from '@/lib/settings/schema';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  const oauthError = sp.error === 'oauth' ? 'Google sign-in failed. Please try again.'
    : sp.error === 'paused' || !customerAccessOpen(await getSiteSettings()) ? 'Customer sign-in is paused right now — team members can still sign in.' : null;
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  return <main><LoginForm next={next} oauthError={oauthError} locale={locale} /></main>;
}
