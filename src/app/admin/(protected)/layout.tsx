import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LangToggle } from '@/components/theme/lang-toggle';
import { getLocale } from '@/app/locale-action';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getAvatarInfo } from '@/lib/avatar';
import { signOut } from '../actions';
import { Icon } from '@/components/ui/icon';
import { NavLinks, type NavGroup } from './nav-links';
import { AdminFrame } from './admin-frame';
import { AccountModalsProvider } from '@/components/account/account-modals';
import { ProfileCardButton } from '@/components/account/profile-card-button';
import { LogoIcon } from '@/components/ui/logo-icon';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';
import '@/app/admin-theme.css';
import { AdminBottomNav, type AdminNavItem } from './admin-bottom-nav';

const ADMIN_GROUPS: NavGroup[] = [
  { label: 'Overview', items: [
    { href: '/admin', label: 'Control room', icon: 'grid' },
    { href: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
  ] },
  { label: 'Salon', items: [
    { href: '/admin/services', label: 'Services', icon: 'scissors' },
    { href: '/admin/stylists', label: 'Stylists', icon: 'user' },
    { href: '/admin/holidays', label: 'Holidays', icon: 'sun' },
    { href: '/admin/blocked-slots', label: 'Blocked slots', icon: 'ban' },
    { href: '/admin/reviews', label: 'Reviews', icon: 'star' },
  ] },
  { label: 'Website', items: [
    { href: '/admin/gallery', label: 'Gallery', icon: 'image' },
    { href: '/admin/content', label: 'Content', icon: 'pen' },
    { href: '/admin/settings', label: 'Web settings', icon: 'cog' },
  ] },
  { label: 'Team', items: [
    { href: '/admin/people', label: 'People', icon: 'people' },
  ] },
];
// Mobile bottom-nav split: up to 5 primary tabs in the bar, the rest go to "More".
const ADMIN_PRIMARY: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', short: 'Home', icon: 'grid' },
  { href: '/admin/people', label: 'People', icon: 'people' },
  { href: '/admin/services', label: 'Services', short: 'Serv', icon: 'scissors' },
  { href: '/admin/schedule', label: 'Schedule', short: 'Sched', icon: 'calendar' },
];
const ADMIN_OVERFLOW: AdminNavItem[] = [
  { href: '/admin/stylists', label: 'Stylists', icon: 'user' },
  { href: '/admin/blocked-slots', label: 'Blocked slots', icon: 'ban' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'image' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'star' },
  { href: '/admin/content', label: 'Content', icon: 'pen' },
  { href: '/admin/holidays', label: 'Holidays', icon: 'sun' },
  { href: '/admin/settings', label: 'Web settings', icon: 'cog' },
];

// The receptionist (front desk) sees only bookings, the schedule and time off.
const DESK_GROUPS: NavGroup[] = [
  { label: 'Front desk', items: [
    { href: '/admin', label: 'Bookings', icon: 'grid' },
    { href: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
  ] },
  { label: 'Time off', items: [
    { href: '/admin/blocked-slots', label: 'Blocked slots', icon: 'ban' },
    { href: '/admin/holidays', label: 'Holidays', icon: 'sun' },
  ] },
];
const DESK_PRIMARY: AdminNavItem[] = [
  { href: '/admin', label: 'Bookings', short: 'Home', icon: 'grid' },
  { href: '/admin/schedule', label: 'Schedule', short: 'Sched', icon: 'calendar' },
  { href: '/admin/blocked-slots', label: 'Blocked slots', short: 'Blocks', icon: 'ban' },
  { href: '/admin/holidays', label: 'Holidays', icon: 'sun' },
];

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['receptionist'], '/admin');
  const isDesk = profile.role === 'receptionist';
  const groups = isDesk ? DESK_GROUPS : ADMIN_GROUPS;
  const btmPrimary = isDesk ? DESK_PRIMARY : ADMIN_PRIMARY;
  const btmOverflow = isDesk ? [] : ADMIN_OVERFLOW;
  // Same avatar resolution as the site header and staff desk: uploaded photo →
  // Google/email photo → DiceBear fallback (never just an initial).
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const seed = profile.email ?? profile.fullName ?? 'admin';
  const avatar = getAvatarInfo(user?.user_metadata ?? null, seed).src;

  const roleLabel = profile.role === 'webdev' ? 'Web dev' : 'Receptionist';
  const locale = await getLocale();
  const userMetadata = user?.user_metadata ?? null;
  const hasPassword = (user?.identities ?? []).some((i) => i.provider === 'email') || user?.user_metadata?.has_password === true;

  return (
    <LocaleProvider locale={locale}>
    <AccountModalsProvider profile={profile} userMetadata={userMetadata} hasPassword={hasPassword} locale={locale}>
    <AdminFrame
      bottomNav={<AdminBottomNav primary={btmPrimary} overflow={btmOverflow} showTheme={false} extra={<LangToggle currentLocale={locale} />}
        account={<ProfileCardButton readOnly className="more-sheet__me" avatar={avatar} name={profile.fullName ?? profile.email ?? 'You'} sub={profile.email} badge={roleLabel} badgeDev={profile.role === 'webdev'} />} />}
      side={<>
        <Link href="/" className="side__back" target="_blank" rel="noopener noreferrer"><Icon name="arrowLeft" className="ic" /> <span className="side__back-txt">{t('Back to site', locale)}</span></Link>
        <div className="side__brand">
          <Link href="/" className="side__home" target="_blank" rel="noopener noreferrer" aria-label={t('Vero Salon home page', locale)} data-tip={t('Home page', locale)}>
            <span className="side__logo" aria-hidden="true"><LogoIcon /></span>
            <span className="side__brand-name"><b>Vero Salon</b><small>{t(isDesk ? 'Front desk' : 'Control room', locale)}</small></span>
          </Link>
          {/* phones only: the app bar shows the role; on desktop it sits on the profile card */}
          <span className={`role-badge side__brand-role${profile.role === 'webdev' ? ' role-badge--dev' : ''}`}>{t(roleLabel, locale)}</span>
        </div>
        {/* Mobile-only: the sidebar footer (with the desktop toggle) is hidden
            on phones, so the app bar carries its own theme switch. */}
        {/* phones only: the theme switch sits in the app bar; language + your account live in the bottom nav's More menu */}
        <span className="side__theme"><ThemeToggle /></span>
        {/* The profile card doubles as the shortcut to the Account page —
            on mobile the avatar in the app bar is that same tap target. */}
        <NavLinks groups={groups} />
        <div className="side__foot">
          <ProfileCardButton readOnly className="side__id side__me" avatar={avatar} name={profile.fullName ?? profile.email ?? 'You'} sub={profile.email} badge={roleLabel} badgeDev={profile.role === 'webdev'} />
          <LangToggle currentLocale={locale} className="side__lang" />
          <span className="side__foot-theme"><ThemeToggle /></span>
          <form action={signOut}><button className="side__signout" type="submit" data-tip={t('Sign out', locale)} aria-label={t('Sign out', locale)}><Icon name="logout" className="ic" /><span className="side__label">{t('Sign out', locale)}</span></button></form>
        </div>
      </>}
    >
      {children}
    </AdminFrame>
    </AccountModalsProvider>
    </LocaleProvider>
  );
}
