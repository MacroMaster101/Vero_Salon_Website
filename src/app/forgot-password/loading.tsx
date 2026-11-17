import { AuthSkeleton } from '@/components/auth/auth-skeleton';

export default function Loading() {
  return <AuthSkeleton fields={1} google={false} back={{ href: '/login', labelKey: 'Back to sign in' }} />;
}
