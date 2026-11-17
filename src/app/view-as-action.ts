'use server';

import { cookies } from 'next/headers';
import { getProfile } from '@/lib/supabase/auth';
import { VIEW_AS_COOKIE, isViewAsRole } from '@/lib/auth/view-as';

/** Web developer only: preview the site as another role (or pass null to stop). */
export async function setViewAs(role: string | null): Promise<{ error: string } | { ok: true }> {
  const profile = await getProfile();
  // realRole comes from the DB, never from the cookie — nobody else can use this.
  if (profile?.realRole !== 'webdev') return { error: 'Not allowed.' };
  const store = await cookies();
  if (role === null || role === 'webdev') {
    store.delete(VIEW_AS_COOKIE);
    return { ok: true };
  }
  if (!isViewAsRole(role)) return { error: 'Unknown role.' };
  store.set(VIEW_AS_COOKIE, role, {
    maxAge: 60 * 60 * 8, // a work session; expires on its own
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return { ok: true };
}
