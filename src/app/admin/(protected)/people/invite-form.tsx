'use client';
import { inviteStaff } from './actions';
import { useT } from '@/lib/i18n/locale-context';
import { Field } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';

// Email-only invite as a popup: creates the account (if new), a hidden shell
// stylist card, and the staff link in one action. Shown on admin People + owner Team.
export function InviteStaffButton({ fab = true }: { fab?: boolean }) {
  const tr = useT();
  return (
    <FormModal trigger={{ label: 'Invite staff', icon: 'mail', variant: fab ? 'fab' : 'primary' }} title="Invite a staff member" icon="mail"
      subtitle="They get an email to set a password. A hidden stylist card is made for them."
      action={inviteStaff} submitLabel="Invite as staff" pendingLabel="Inviting…"
      okToast={(r) => ('note' in r && typeof r.note === 'string' ? r.note : tr('Done.'))}>
      <Field label="Email" required>
        <input type="email" name="email" className="ainput" placeholder="person@email.com" required autoComplete="off" />
      </Field>
    </FormModal>
  );
}
