import type { Metadata } from 'next';
import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getAvatarInfo } from '@/lib/avatar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LangToggle } from '@/components/theme/lang-toggle';
import { getLocale } from '@/app/locale-action';
import { signOut } from '@/app/admin/actions';
import { Icon } from '@/components/ui/icon';
import { LogoIcon } from '@/components/ui/logo-icon';
import { NavLinks, type NavGroup } from '@/app/admin/(protected)/nav-links';
import { AdminFrame } from '@/app/admin/(protected)/admin-frame';
import { AccountModalsProvider } from '@/components/account/account-modals';
import { ProfileCardButton } from '@/components/account/profile-card-button';
import { AdminBottomNav, type AdminNavItem } from '@/app/admin/(protected)/admin-bottom-nav';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';
import '@/app/admin-theme.css';

// Same frame as the admin console (sidebar + phone app bar + bottom nav),
// with the staff member's own pages.
const STAFF_GROUPS: NavGroup[] = [
  { label: 'My chair', items: [
    { href: '/staff', label: 'Today', icon: 'grid' },
    { href: '/staff/schedule', label: 'My week', icon: 'calendar' },
  ] },
];
const STAFF_PRIMARY: AdminNavItem[] = [
  { href: '/staff', label: 'Today', icon: 'grid' },
  { href: '/staff/schedule', label: 'My week', short: 'Week', icon: 'calendar' },
];

const ROLE_LABEL: Record<string, string> = { staff: 'Staff', owner: 'Owner', webdev: 'Web dev' };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['staff', 'owner'], '/staff');
  const locale = await getLocale();

  const sb = await createClient();
  const [{ data: { user } }, { data: stylist }] = await Promise.all([
    sb.auth.getUser(),
    profile.stylistId
      ? sb.from('stylists').select('name, role').eq('id', profile.stylistId).single()
      : Promise.resolve({ data: null }),
  ]);
  const seed = profile.email ?? profile.fullName ?? 'staff';
  const avatar = getAvatarInfo(user?.user_metadata ?? null, seed).src;
  const hasPassword = (user?.identities ?? []).some((i) => i.provider === 'email') || user?.user_metadata?.has_password === true;
  const roleLabel = ROLE_LABEL[profile.role] ?? 'Staff';
  const isDev = profile.role === 'webdev';
  const name = profile.fullName ?? profile.email ?? 'You';
  const sub = stylist ? (stylist.role || t('Stylist', locale)) : profile.email;

  return (
    <LocaleProvider locale={locale}>
    <AccountModalsProvider profile={profile} userMetadata={user?.user_metadata ?? null} hasPassword={hasPassword} locale={locale}>
    <AdminFrame
      bottomNav={<AdminBottomNav primary={STAFF_PRIMARY} overflow={[]} root="/staff" showTheme={false}
        extra={<LangToggle currentLocale={locale} />}
        account={<ProfileCardButton readOnly className="more-sheet__me" avatar={avatar} name={name} sub={sub} badge={roleLabel} badgeDev={isDev} />} />}
      side={<>
        <Link href="/" className="side__back" target="_blank" rel="noopener noreferrer"><Icon name="arrowLeft" className="ic" /> <span className="side__back-txt">{t('Back to site', locale)}</span></Link>
        <div className="side__brand">
          <Link href="/" className="side__home" target="_blank" rel="noopener noreferrer" aria-label={t('Vero Salon home page', locale)} data-tip={t('Home page', locale)}>
            <span className="side__logo" aria-hidden="true"><LogoIcon /></span>
            <span className="side__brand-name"><b>Vero Salon</b><small>{t('Staff desk', locale)}</small></span>
          </Link>
          <span className={`role-badge side__brand-role${isDev ? ' role-badge--dev' : ''}`}>{t(roleLabel, locale)}</span>
        </div>
        {/* phones only: theme in the app bar; language, you and sign out live in the More sheet */}
        <span className="side__theme"><ThemeToggle /></span>
        <NavLinks groups={STAFF_GROUPS} root="/staff" />
        <div className="side__foot">
          <ProfileCardButton readOnly className="side__id side__me" avatar={avatar} name={name} sub={sub} badge={roleLabel} badgeDev={isDev} />
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
