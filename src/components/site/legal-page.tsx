import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { t } from '@/lib/i18n/translations';

export type LegalSection = { id: string; heading: string; body: ReactNode };

// Editorial two-column legal page: a warm banner, a sticky "contents" rail with
// a contact card (left), and the prose column (right). The rail is functional —
// it indexes the document and gives a way to reach the salon — so the width is
// used with purpose instead of leaving empty rails. Uses the site's Warm Modern
// tokens (Fraunces display ≥920px, Poppins body) for brand cohesion.
export async function LegalPage({
  kicker,
  title,
  lead,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}) {
  const locale = (await cookies()).get('locale')?.value === 'si' ? 'si' : 'en';
  return (
    <div className="legal">


      {/* ── banner ── */}
      <section className="legal-banner">
        <div className="legal-wrap">
          <span className="legal-kicker">{t(kicker, locale)}</span>
          <h1 className="legal-title">{t(title, locale)}</h1>
          <p className="legal-lead">{t(lead, locale)}</p>
          <p className="legal-stamp">{t('Last updated', locale)} <span lang="en">{updated}</span></p>
          {locale === 'si' && <p className="legal-stamp legal-stamp--note">{t('The full text below is in English, which is the version that applies.', locale)}</p>}
        </div>
      </section>

      {/* ── body: sticky index + prose ── */}
      <div className="legal-wrap legal-grid">
        <aside className="legal-rail">
          <nav className="legal-index" aria-label={t('On this page', locale)}>
            <p className="legal-index__label">{t('On this page', locale)}</p>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="legal-index__n">{String(i + 1).padStart(2, '0')}</span>
                    {t(s.heading, locale)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-help">
            <p className="legal-help__h">{t('Questions?', locale)}</p>
            <p className="legal-help__p">{t('Talk to the salon — we’re happy to help with any request.', locale)}</p>
            <a className="legal-help__call" href="tel:0773699620">077 369 9620</a>
            <span className="legal-help__sub">{t('Open daily · 10 AM – 12 AM', locale)}</span>
          </div>
        </aside>

        <div className="legal-content">
          {sections.map((s) => (
            <section className="legal-section" id={s.id} key={s.id}>
              <h2 className="legal-h">{t(s.heading, locale)}</h2>
              <div className="legal-prose" lang="en">{s.body}</div>
            </section>
          ))}
        </div>
      </div>


    </div>
  );
}
