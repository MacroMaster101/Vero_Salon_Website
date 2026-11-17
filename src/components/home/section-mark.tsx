import { Icon, type IconName } from '@/components/ui/icon';

/** The friendly opener of a page section: a small salon icon, a warm title and
    one line of detail ("Booking is easy · Four simple steps, start to finish").
    Each section picks its own `variant` (the style of the line that runs to
    the right), so neighbouring sections never open the same way. Decorative (the section's own
    heading carries the meaning), so it is hidden from assistive tech.
    `inset` adds the page gutter; pass false inside an element that already has
    it (.home-wrap). Styles: section-polish.css §19. */
/* `variant` is the style of the line; `align` puts the opener on the left,
   in the centre or on the right, with the line filling the empty side(s) */
export type SectionMarkVariant = 'solid' | 'accent' | 'fade' | 'dashed' | 'dotted';

export type SectionMarkAlign = 'left' | 'center' | 'right';

export function SectionMark({ title, detail, icon, variant, align = 'left', inset = true }: {
  title: string;
  align?: SectionMarkAlign;
  detail?: string;
  icon: IconName;
  variant: SectionMarkVariant;
  inset?: boolean;
}) {
  return (
    <div className={`${inset ? 'home-wrap ' : ''}section-mark section-mark--${variant} section-mark--${align}`} aria-hidden="true">
      <span className="section-mark__body">
        <span className="section-mark__icon"><Icon name={icon} size={18} /></span>
        <span className="section-mark__text">
          <span className="section-mark__title">{title}</span>
          {detail && <span className="section-mark__detail">{detail}</span>}
        </span>
      </span>
    </div>
  );
}
