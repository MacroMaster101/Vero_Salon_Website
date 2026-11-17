import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_SETTINGS, SETTINGS_KEY, readSettings, type SiteSettings } from './schema';

/**
 * The current site switches, read once per request. A failed read falls back
 * to the defaults (site open), so a database hiccup never locks everyone out.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const sb = await createClient();
    const { data } = await sb.from('site_content').select('value').eq('key', SETTINGS_KEY).maybeSingle();
    return readSettings(data?.value);
  } catch {
    return DEFAULT_SETTINGS;
  }
});
