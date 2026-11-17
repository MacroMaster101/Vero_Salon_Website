'use client';
import { useAccountModals } from '@/components/account/account-modals';
import { AvatarImg } from '@/components/account/avatar-img';
import { useT } from '@/lib/i18n/locale-context';

/**
 * The dashboard sidebar's "you" card. Clicking it opens the Edit profile
 * popup (the same one customers get on the public site) instead of leaving
 * the page. Needs an AccountModalsProvider above it.
 */
export function ProfileCardButton({ avatar, name, sub, badge, badgeDev = false, className = 'side__id', readOnly = false }: {
  avatar: string; name: string; sub?: string | null; badge?: string; badgeDev?: boolean; className?: string;
  /** just show who is signed in + their role (profile is edited on the public site) */
  readOnly?: boolean;
}) {
  const tr = useT();
  const { openModal } = useAccountModals();
  if (readOnly) {
    return (
      <div className={`${className} side__id--static`}>
        <span className="avatar">
          <AvatarImg src={avatar} seed={name} />
        </span>
        <span className="side__who">
          <span className="side__name"><span className="side__name-t">{name}</span>{badge && <em className={`side__role${badgeDev ? ' is-dev' : ''}`}>{tr(badge)}</em>}</span>
          {sub && <span className="side__mail">{sub}</span>}
        </span>
      </div>
    );
  }
  return (
    <button type="button" className={`${className} side__id--btn`} onClick={() => openModal('profile')}
      aria-label={tr('Edit your profile')} data-tip={tr('Edit profile')}>
      <span className="avatar">
        <AvatarImg src={avatar} seed={name} />
      </span>
      <span className="side__who">
        <span className="side__name"><span className="side__name-t">{name}</span>{badge && <em className={`side__role${badgeDev ? ' is-dev' : ''}`}>{tr(badge)}</em>}</span>
        {sub && <span className="side__mail">{sub}</span>}
      </span>
    </button>
  );
}
