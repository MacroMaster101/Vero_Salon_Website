import type { Role } from '@/lib/auth/roles';

/**
 * "View as" — a web-developer-only preview of the site as another role.
 * A cookie holds the role to preview; it is honoured ONLY when the account's
 * real role (from the DB) is webdev, and it can only lower access (webdev is
 * already above every role). Database RLS still runs as the real role, so this
 * previews pages, navigation and gates, not data permissions.
 */
export const VIEW_AS_COOKIE = 'vero-view-as';
export const VIEW_AS_ROLES = ['user', 'staff', 'receptionist', 'owner'] as const;
export type ViewAsRole = (typeof VIEW_AS_ROLES)[number];

export function isViewAsRole(v: unknown): v is ViewAsRole {
  return typeof v === 'string' && (VIEW_AS_ROLES as readonly string[]).includes(v);
}

/** The role the app should act on: the preview role for a webdev, else the real role. */
export function effectiveRole(realRole: Role, cookieValue: string | undefined | null): Role {
  if (realRole !== 'webdev') return realRole;
  return isViewAsRole(cookieValue) ? cookieValue : realRole;
}
