import { redirect } from 'next/navigation';

// The staff "Public card" page was retired: stylist cards are managed by the
// owner/admin (Team / Stylists), and personal profile edits live on the site.
export default function StaffAccountPage() {
  redirect('/staff');
}
