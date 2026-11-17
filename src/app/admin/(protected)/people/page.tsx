import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getPeopleAvatarMap } from '@/lib/people-avatars';
import { LoadError } from '@/components/admin/load-error';
import { PeopleList } from './people-list';
import { InviteStaffButton } from './invite-form';
import { AdminTitle } from '@/components/admin/admin-title';

export default async function PeoplePage() {
  const profile = await requireRole(['webdev'], '/admin/people');
  const sb = await createClient();
  const [{ data: profiles, error: peopleErr }, { data: stylists, error: stylistErr }, avatars] = await Promise.all([
    sb.from('profiles').select('id, full_name, email, role, stylist_id').order('created_at', { ascending: true }),
    sb.from('stylists').select('id, name').order('sort_order'),
    getPeopleAvatarMap(),
  ]);
  const people = (profiles ?? []).map((p) => ({ ...p, avatar_src: avatars[p.id] }));
  return (
    <div className="apage">
      <div className="ahead">
        <AdminTitle icon="people" eyebrow="Team &amp; access" title="People" />
        <InviteStaffButton />
      </div>
      <LoadError what="people" error={peopleErr} />
      {/* Without the stylist list the role form's dropdown silently collapses to
          "— no stylist —", so saving would unlink a staff member from their card. */}
      <LoadError what="stylists" error={stylistErr} />
      {!peopleErr && !stylistErr && (
        <PeopleList people={people} stylists={stylists ?? []} actorRole={profile.role} />
      )}
    </div>
  );
}
