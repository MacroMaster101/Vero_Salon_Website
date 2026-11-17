import { getProfile } from '@/lib/supabase/auth';
import { ViewAsSwitcher } from './view-as-switcher';

/** Server gate: only the web developer (by DB role) ever gets the switcher. */
export async function ViewAsBar() {
  const profile = await getProfile();
  if (profile?.realRole !== 'webdev') return null;
  return <ViewAsSwitcher current={profile.role} />;
}
