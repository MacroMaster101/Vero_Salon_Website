'use client';
import { useEffect, useRef, useState } from 'react';
import { signOut } from '@/app/admin/actions';
import type { Profile } from '@/lib/supabase/auth';
import { avatarSrc, type UserMetadata } from '@/lib/avatar';
import { useAccountModals } from '@/components/account/account-modals';
import { t } from '@/lib/i18n/translations';
import { Icon, type IconName } from '@/components/ui/icon';
import { AvatarImg } from '@/components/account/avatar-img';

const ROLE_NAMES: Record<string, string> = { webdev: 'Web dev', receptionist: 'Receptionist', owner: 'Owner', staff: 'Staff' };

export function NavAuth({ profile, userMetadata, locale = 'en' }: { profile: Profile | null; userMetadata?: UserMetadata | null; locale?: string }) {
  const [open, setOpen] = useState(false);
  const { openModal } = useAccountModals();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!profile) return <a href="/login" className="nav__cta">{t('Sign in', locale)}</a>;

  const isUser = profile.role === 'user';
  // Each elevated role has its own surface: console (front desk / web dev),
  // owner dashboard, staff schedule.
  const adminLike = profile.role === 'receptionist' || profile.role === 'webdev';
  const dash = adminLike ? '/admin' : profile.role === 'owner' ? '/owner' : '/staff';
  const dashLabel = profile.role === 'receptionist' ? t('Front desk', locale) : adminLike ? t('Control room', locale) : profile.role === 'owner' ? t('My shop', locale) : t('My schedule', locale);
  const dashIcon: IconName = adminLike ? 'grid' : profile.role === 'owner' ? 'scissors' : 'calendar';
  const roleName = ROLE_NAMES[profile.role];
  const seed = profile.email ?? profile.fullName ?? 'guest';
  const src = avatarSrc(userMetadata, seed);

  function pick(modal: 'profile' | 'bookings' | 'settings') {
    setOpen(false);
    openModal(modal);
  }

  return (
    <div className={`nav-profile${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="nav-profile__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('Account menu', locale)}
        onClick={() => setOpen((v) => !v)}
      >
        <AvatarImg src={src} seed={seed} className="nav-profile__avatar" />
      </button>

      <div className="nav-profile__menu" role="menu" hidden={!open}>
        <div className="nav-profile__head">
          <AvatarImg src={src} seed={seed} className="nav-profile__avatar" />
          <div className="nav-profile__id">
            <b>{profile.fullName ?? t('Account', locale)}</b>
            {profile.email && <span>{profile.email}</span>}
            {roleName && <em className={`nav-profile__role${profile.role === 'webdev' ? ' is-dev' : ''}`}>{t(roleName, locale)}</em>}
          </div>
        </div>
        {!isUser && (
          <a href={dash} role="menuitem" className="nav-profile__item nav-profile__item--dash" onClick={() => setOpen(false)}>
            <span className="nav-profile__ic"><Icon name={dashIcon} size={16} /></span>
            <span>{dashLabel}</span>
            <Icon name="arrowLeft" size={14} className="nav-profile__go" />
          </a>
        )}
        <button type="button" role="menuitem" className="nav-profile__item" onClick={() => pick('profile')}>
          <Icon name="user" size={15} className="nav-profile__ico" />{t('Edit profile', locale)}
        </button>
        <button type="button" role="menuitem" className="nav-profile__item" onClick={() => pick('bookings')}>
          <Icon name="calendar" size={15} className="nav-profile__ico" />{t('My bookings', locale)}
        </button>
        <button type="button" role="menuitem" className="nav-profile__item" onClick={() => pick('settings')}>
          <Icon name="cog" size={15} className="nav-profile__ico" />{t('Settings', locale)}
        </button>
        <form action={signOut}>
          <button type="submit" role="menuitem" className="nav-profile__item nav-profile__item--danger">
            <Icon name="logout" size={15} className="nav-profile__ico" />{t('Sign out', locale)}
          </button>
        </form>
      </div>
    </div>
  );
}
