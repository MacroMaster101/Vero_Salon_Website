import { requireRole } from '@/lib/supabase/auth';
import { getSiteSettings } from '@/lib/settings/get';
import { AdminTitle } from '@/components/admin/admin-title';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  await requireRole(['webdev'], '/admin/settings');
  const settings = await getSiteSettings();
  return (
    <div className="apage">
      <div className="ahead"><AdminTitle icon="cog" eyebrow="Website" title="Web settings" /></div>
      <p className="lead apage__lead">Switch the public website into maintenance, and turn customer sign-in or online booking on and off. Changes apply to the live site straight away.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
