import { AuthSkeleton } from '@/components/auth/auth-skeleton';

export default function Loading() {
  return <AuthSkeleton fields={4} back={{ href: '/', labelKey: 'Back to home' }} />;
}
