// Site-wide switches the web developer controls from /admin/settings.
// Stored as one JSON row in site_content (key 'settings'): public read, only a
// webdev may write (RLS: auth_role() = 'admin' ⇒ webdev since migration 0016).
// Pure (no server deps) so the rules below are unit-testable.
import { z } from 'zod';
import type { Role } from '@/lib/auth/roles';

export const SETTINGS_KEY = 'settings';

export const settingsSchema = z.object({
  /** notice strip for everyone + customer sign-in and booking paused */
  maintenance: z.boolean().catch(false).default(false),
  maintenanceMessage: z.string().trim().max(300).catch('').default(
    "We're doing some maintenance — online booking and sign-in are paused for now. Call us to book.",
  ),
  /** customer sign-in and new sign-ups (the team can always sign in) */
  customerLogin: z.boolean().catch(true).default(true),
  /** online booking from the website */
  booking: z.boolean().catch(true).default(true),
  bookingMessage: z.string().trim().max(300).catch('').default(
    'Online booking is paused right now. Please call or WhatsApp us to book.',
  ),
});
export type SiteSettings = z.infer<typeof settingsSchema>;
export const DEFAULT_SETTINGS: SiteSettings = settingsSchema.parse({});

/** Parse a stored (possibly partial or junk) value over the defaults. */
export function readSettings(value: unknown): SiteSettings {
  const base = value && typeof value === 'object' ? value : {};
  const r = settingsSchema.safeParse(base);
  return r.success ? r.data : DEFAULT_SETTINGS;
}

/** Everyone except plain customers is "the team" and is never locked out. */
export function isTeam(role: Role | null | undefined): boolean {
  return !!role && role !== 'user';
}

/** May this account (null = signed out) sign in / stay signed in as a customer? */
export function customerAccessOpen(s: SiteSettings): boolean {
  return s.customerLogin && !s.maintenance;
}

/** Is online booking open to the public right now? */
export function bookingOpen(s: SiteSettings): boolean {
  return s.booking && !s.maintenance;
}
