// Who may change whose role. Mirrors the DB protect_profile_privileges()
// trigger (migrations 0011/0016): the owner may only move people between
// user/staff/receptionist (so can neither edit privileged accounts nor grant
// owner/webdev); the webdev is unrestricted; nobody else changes roles.
import type { Role } from '@/lib/auth/roles';

const TEAM: readonly Role[] = ['user', 'staff', 'receptionist'];

// webdev (migration 0015) is above everyone: only a webdev may touch a
// webdev account or grant the role.
export function canSetRole(actor: Role, targetCurrent: Role, next: Role): boolean {
  if (actor === 'webdev') return true;
  if (targetCurrent === 'webdev' || next === 'webdev') return false;
  if (actor === 'owner') return TEAM.includes(targetCurrent) && TEAM.includes(next);
  return false;
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === 'webdev') return ['user', 'staff', 'receptionist', 'owner', 'webdev'];
  if (actor === 'owner') return ['user', 'staff', 'receptionist'];
  return [];
}
