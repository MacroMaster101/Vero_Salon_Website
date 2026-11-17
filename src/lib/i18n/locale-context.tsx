'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { t } from './translations';

const LocaleCtx = createContext<string>('en');

export function LocaleProvider({ locale, children }: { locale: string; children: ReactNode }) {
  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>;
}

/** Read the current locale from context. Falls back to 'en'. */
export function useLocale(): string {
  return useContext(LocaleCtx);
}

/** Translate helper for client components: `const tr = useT(); tr('Save')`. */
export function useT(): (key: string) => string {
  const locale = useContext(LocaleCtx);
  return (key: string) => t(key, locale);
}
