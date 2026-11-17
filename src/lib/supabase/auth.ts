// Auth helpers: current user/profile lookups and the role guard (requireRole)
// used by protected layouts and server actions. authDecision is the pure,
// unit-tested core; requireRole enforces it with redirects.
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/auth/roles';
import { VIEW_AS_COOKIE, effectiveRole } from '@/lib/auth/view-as';

export async function getUser() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export type Profile = { userId: string; email: string | null; fullName: string | null; phone: string | null; role: Role; stylistId: string | null;
  /** the DB role; differs from `role` only while a webdev uses "View as" */
  realRole: Role };

// cache(): layouts, pages and the View-as bar share one lookup per request.
export const getProfile = cache(async (): Promise<Profile | null> => {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('profiles').select('role, stylist_id, full_name, email, phone').eq('id', user.id).single();
  const realRole = (data?.role ?? 'user') as Role;
  const viewAs = realRole === 'webdev' ? (await cookies()).get(VIEW_AS_COOKIE)?.value : undefined;
  return {
    userId: user.id,
    email: data?.email ?? user.email ?? null,
    fullName: data?.full_name ?? null,
    phone: data?.phone ?? null,
    role: effectiveRole(realRole, viewAs),
    stylistId: data?.stylist_id ?? null,
    realRole,
  };
});

// Pure decision (unit-tested). next is the path to return to after login.
export type AuthDecision = { kind: 'allow' } | { kind: 'login'; next: string } | { kind: 'deny' };
export function authDecision(role: Role | null, allowed: Role[], next: string): AuthDecision {
  if (role === null) return { kind: 'login', next };
  if (allowed.includes(role)) return { kind: 'allow' };
  if (role === 'webdev') return { kind: 'allow' }; // above every role
  return { kind: 'deny' };
}

// Server guard: enforces the decision with redirects. Returns the profile when allowed.
export async function requireRole(allowed: Role[], currentPath: string): Promise<Profile> {
  const profile = await getProfile();
  const decision = authDecision(profile?.role ?? null, allowed, currentPath);
  if (decision.kind === 'login') redirect(`/login?next=${encodeURIComponent(decision.next)}`);
  if (decision.kind === 'deny') redirect('/');
  return profile!;
}
