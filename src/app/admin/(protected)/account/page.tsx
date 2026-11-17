import { redirect } from 'next/navigation';

// The admin Account page was replaced by the Edit profile popup (account menu /
// More sheet). Keep the URL working for old bookmarks.
export default function AdminAccountPage() {
  redirect('/admin');
}
