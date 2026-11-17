'use client';
import { AuthShell } from '@/components/auth/auth-shell';
import { useLocale } from '@/lib/i18n/locale-context';
import { t } from '@/lib/i18n/translations';

/** Route loading state for the auth pages: the real shell (photo, top bar)
    with shimmering blocks in the exact shape of the form, so nothing jumps
    when the page arrives. `fields` = number of inputs, `google` = whether the
    form starts with the Google button. */
export function AuthSkeleton({
  fields,
  google = true,
  forgotLink = false,
  back,
}: {
  fields: number;
  google?: boolean;
  /** the login form's right-aligned "Forgot password?" row */
  forgotLink?: boolean;
  back: { href: string; labelKey: string };
}) {
  const locale = useLocale();
  return (
    <AuthShell back={{ href: back.href, label: t(back.labelKey, locale) }} locale={locale}>
      <div className="vauth-sk" role="status" aria-label={t('Loading', locale)}>
        <i className="vauth-sk__eyebrow" />
        <i className="vauth-sk__title" />
        <i className="vauth-sk__lead" />
        {google && (
          <>
            <i className="vauth-sk__btn" />
            <i className="vauth-sk__divider" />
          </>
        )}
        {Array.from({ length: fields }, (_, i) => (
          <span className="vauth-sk__field" key={i}>
            <i className="vauth-sk__label" />
            <i className="vauth-sk__input" />
          </span>
        ))}
        {forgotLink && <i className="vauth-sk__link" />}
        <i className="vauth-sk__btn vauth-sk__btn--primary" />
        <i className="vauth-sk__alt" />
      </div>
    </AuthShell>
  );
}
