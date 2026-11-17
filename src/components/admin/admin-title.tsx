'use client';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';
import { useT } from '@/lib/i18n/locale-context';

/** Admin page heading: red icon tile + eyebrow + title (sits inside `.ahead`). */
export function AdminTitle({ icon, eyebrow, title }: { icon: IconName; eyebrow?: string; title: string }) {
  const tr = useT();
  return (
    <div className="ahead__lead">
      <span className="ahead__icon" aria-hidden="true"><Icon name={icon} size={22} /></span>
      <div className="ahead__text">
        {eyebrow && <span className="eyebrow">{tr(eyebrow)}</span>}
        <h1 className="ahead__title">{tr(title)}</h1>
      </div>
    </div>
  );
}

/** Friendly empty state with an icon, used where a list has nothing yet. */
export function AdminEmpty({ icon = 'inbox', title, children }: { icon?: IconName; title: string; children?: ReactNode }) {
  const tr = useT();
  return (
    <div className="aempty aempty--x">
      <span className="aempty__icon" aria-hidden="true"><Icon name={icon} size={26} /></span>
      <p className="aempty__title">{tr(title)}</p>
      {children && <div className="aempty__sub">{typeof children === 'string' ? tr(children) : children}</div>}
    </div>
  );
}
