import type { Role } from '@/lib/auth/roles';

/**
 * Web mirror of the mobile app's routeForSession (Saloon_Vero_App
 * lib/auth/routing.ts). Single source of truth for where a session lands
 * after auth. A sanitized `next` always wins; otherwise role decides.
 */
export function routeForSession(
  role: Role | null,
  stylistId: string | null,
  isGuest: boolean,
  next?: string | null,
): string {
  if (next) return next;                              // explicit ?next= wins
  if (role === 'owner') return '/owner';              // owner → owner dashboard
  if (role === 'staff' && stylistId) return '/staff'; // staff → today
  if (role === 'receptionist' || role === 'webdev') return '/admin';       // front desk / web dev → console
  return '/';                                         // signed-in user → home (app parity)
}
