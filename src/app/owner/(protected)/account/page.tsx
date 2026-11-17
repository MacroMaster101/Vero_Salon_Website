import { redirect } from 'next/navigation';

// Retired like the admin Account page: name, photo and password are edited
// from the profile menu on the public site.
export default function OwnerAccountPage() {
  redirect('/owner');
}
