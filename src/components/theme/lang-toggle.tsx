'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/app/locale-action';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සිංහල' },
] as const;

/** Segmented pill: the active language is filled, the other is plain text.
    Styled in fx.css (.lang-toggle / .lang-toggle__btn). */
export function LangToggle({ currentLocale, className }: { currentLocale: string; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale || isPending) return;
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <div
      className={`lang-toggle ${className || ''}`}
      role="group"
      aria-label={currentLocale === 'si' ? 'භාෂාව තෝරන්න' : 'Choose language'}
      aria-busy={isPending || undefined}
    >
      {LANGS.map(lang => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          className="lang-toggle__btn"
          aria-pressed={currentLocale === lang.code}
          onClick={() => switchLocale(lang.code)}
          disabled={isPending}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
