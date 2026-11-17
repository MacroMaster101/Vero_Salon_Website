'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { SETTINGS_KEY, readSettings, settingsSchema, type SiteSettings } from '@/lib/settings/schema';

type Result = { ok: true } | { error: string };

async function write(next: SiteSettings): Promise<Result> {
  const sb = await createClient();
  const { error } = await sb
    .from('site_content')
    .upsert({ key: SETTINGS_KEY, value: next, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return { error: error.message };
  // Every public page, the auth pages and the console read these switches.
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Save the whole Web settings form (webdev only; RLS enforces the same). */
export async function saveSettings(fd: FormData): Promise<Result> {
  await requireRole(['webdev'], '/admin/settings');
  const parsed = settingsSchema.safeParse({
    maintenance: fd.get('maintenance') === 'on',
    maintenanceMessage: String(fd.get('maintenanceMessage') ?? ''),
    customerLogin: fd.get('customerLogin') === 'on',
    booking: fd.get('booking') === 'on',
    bookingMessage: String(fd.get('bookingMessage') ?? ''),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid settings' };
  return write(parsed.data);
}

/** The one-tap maintenance switch on the Control room. */
export async function setMaintenance(fd: FormData): Promise<Result> {
  await requireRole(['webdev'], '/admin');
  const sb = await createClient();
  const { data } = await sb.from('site_content').select('value').eq('key', SETTINGS_KEY).maybeSingle();
  const current = readSettings(data?.value);
  return write({ ...current, maintenance: fd.get('on') === '1' });
}
