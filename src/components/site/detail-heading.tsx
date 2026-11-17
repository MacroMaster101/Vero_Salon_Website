import { Words } from '@/components/site/words';
import type { ReactNode } from 'react';
import { t } from '@/lib/i18n/translations';
import { ImgSlot } from '@/components/site/img-slot';
import { Icon, type IconName } from '@/components/ui/icon';

export type HeadingBadge = { icon: IconName; value?: string; text: string };

/* Page header for the inner pages: title + intro on the left and, when
   `images` is given, a photo collage on the right (a large photo, a smaller
   overlapping one and a floating badge). Styles: section-polish.css §31. */
export function DetailHeading({ label, title, description, locale, children, images, badge }: {
  label: string; title: string; description: string; locale: string; children?: ReactNode;
  images?: [string, string?]; badge?: HeadingBadge;
}) {
  const [main, small] = images ?? [];
  return (
    <header className={`detail-heading home-wrap${main ? ' detail-heading--art' : ''}`}>
      <div className="detail-heading__row">
        <div className="detail-heading__text">
          <div className="detail-heading__title"><span className="home-eyebrow">{t(label, locale)}</span><h1><Words text={t(title, locale)} /></h1></div>
          <div className="detail-heading__aside"><p>{t(description, locale)}</p>{children}</div>
        </div>
        {main && (
          <div className="detail-heading__art" aria-hidden="true">
            <span className="detail-heading__glow" />
            <div className="detail-heading__main"><ImgSlot src={main} alt="" priority sizes="(max-width: 1023px) 100vw, 45vw" /></div>
            {small && <div className="detail-heading__small"><ImgSlot src={small} alt="" sizes="(max-width: 1023px) 40vw, 18vw" /></div>}
            {badge && (
              <div className="detail-heading__badge">
                <span><Icon name={badge.icon} size={18} /></span>
                <div>{badge.value && <b>{badge.value}</b>}<small>{badge.text}</small></div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
