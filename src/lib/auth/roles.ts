// The account roles, mirroring the profiles.role check in the DB.
// 'webdev' is the site developer: above every other role (admin powers and more).
// 'owner' is the shop owner: shop-ops powers plus their own stylist schedule.
// 'receptionist' is the front desk: bookings, blocked times and holidays only.
// (There is no 'admin' role any more — migration 0016 turned admins into
// receptionists; in the DB auth_role() still reports a webdev as 'admin'.)
export type Role = 'user' | 'staff' | 'receptionist' | 'owner' | 'webdev';

/** may use the /admin console (receptionists see only its front-desk pages) */
export function isAdminRole(role: Role | null | undefined): boolean {
  return role === 'receptionist' || role === 'webdev';
}

// Staff work the chairs — they don't place customer bookings. Everyone else
// (including signed-out guests) may book.
export function roleCanBook(role: Role | null): boolean {
  return role !== 'staff';
}
