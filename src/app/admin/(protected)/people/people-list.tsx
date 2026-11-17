'use client';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { Field, DeleteForm } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';
import { Icon } from '@/components/ui/icon';
import { CardImg } from '@/components/admin/media-card';
import { setRole, adminDeleteUser } from './actions';
import { assignableRoles, canSetRole } from '@/lib/auth/role-rules';
import { dicebearUrl } from '@/lib/avatar';
import type { Role } from '@/lib/auth/roles';
import { useT } from '@/lib/i18n/locale-context';

export interface Person {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  stylist_id: string | null;
  /** Resolved avatar URL (auth metadata via service role); DiceBear fallback when absent. */
  avatar_src?: string;
}
export interface Stylist { id: string; name: string; }

const roleLabel = (r: string) => (r === 'webdev' ? 'Web dev' : r[0]!.toUpperCase() + r.slice(1));

function RoleForm({ p, stylists, actorRole }: { p: Person; stylists: Stylist[]; actorRole: Role }) {
  const tr = useT();
  return (
    <FormModal trigger={{ label: 'Edit access', icon: 'shield' }} title="Edit access" subtitle={p.full_name ?? p.email ?? ''} icon="shield" action={setRole}>
      <input type="hidden" name="id" value={p.id} />
      <Field label="Role" required hint="Staff see the Staff desk; admins manage the whole site.">
        <select name="role" defaultValue={p.role} className="ainput">
          {assignableRoles(actorRole).map((r) => <option key={r} value={r}>{tr(roleLabel(r))}</option>)}
        </select>
      </Field>
      <Field label="Linked stylist" optional hint="Links a staff login to their stylist card and bookings.">
        <select name="stylist_id" defaultValue={p.stylist_id ?? ''} className="ainput">
          <option value="">{tr('— no stylist —')}</option>
          {stylists.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
    </FormModal>
  );
}

export function PeopleList({ people, stylists, actorRole }: { people: Person[]; stylists: Stylist[]; actorRole: Role }) {
  const tr = useT();
  const chips: FilterChip<Person>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'lead', label: 'Owner & dev', match: (p) => p.role === 'owner' || p.role === 'webdev' },
    { id: 'receptionist', label: 'Receptionist', match: (p) => p.role === 'receptionist' },
    { id: 'staff', label: 'Staff', match: (p) => p.role === 'staff' },
    { id: 'user', label: 'User', match: (p) => p.role === 'user' },
  ];
  return (
    <ListToolbar
      items={people}
      placeholder="Search name or email…"
      searchText={(p) => `${p.full_name ?? ''} ${p.email ?? ''}`}
      chips={chips}
      emptyLabel="No people match your filters."
      empty={{ icon: 'people', title: 'No people yet', text: 'Invite a staff member to get started.' }}
      render={(rows) => (
        <ul className="aplist">
          {rows.map((p) => {
            const fallback = dicebearUrl(p.email ?? p.full_name);
            const canTouch = canSetRole(actorRole, p.role as Role, p.role as Role);
            const linked = stylists.find((s) => s.id === p.stylist_id);
            return (
              <li key={p.id} className="aperson">
                <span className="aperson__avatar">
                  <CardImg src={p.avatar_src ?? fallback} fallbackSrc={fallback} alt="" />
                </span>
                <div className="aperson__id">
                  <b>{p.full_name ?? '—'}</b>
                  <span>{p.email}</span>
                </div>
                <div className="aperson__tags">
                  <span className={`arole arole--${p.role}`}>{tr(roleLabel(p.role))}</span>
                  {linked && <span className="arole arole--link"><Icon name="scissors" size={12} />{linked.name}</span>}
                </div>
                <div className="aperson__actions">
                  {canTouch && <RoleForm p={p} stylists={stylists} actorRole={actorRole} />}
                  {canTouch && actorRole === 'webdev' && (
                    <DeleteForm
                      action={adminDeleteUser}
                      id={p.id}
                      iconOnly
                      confirm={`${p.full_name ?? p.email ?? ''} — ${tr('Delete this user and anonymize their bookings? Their linked stylist card is removed too (hidden instead if it has booking history). This cannot be undone.')}`}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    />
  );
}
