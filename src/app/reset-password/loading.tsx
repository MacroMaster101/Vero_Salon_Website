import { AuthSkeleton } from '@/components/auth/auth-skeleton';

export default function Loading() {
  return <AuthSkeleton fields={2} google={false} back={{ href: '/', labelKey: 'Back to home' }} />;
}
