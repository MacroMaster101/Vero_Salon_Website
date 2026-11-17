'use client';
import { createBlock } from '@/app/admin/(protected)/blocked-slots/block-actions';
import { Field } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';
import { minutesToLabel } from '@/lib/format';
import type { Stylist } from '@/lib/supabase/types';
import { useT } from '@/lib/i18n/locale-context';

function rangeOptions(from: number, to: number): number[] {
  const out: number[] = [];
  for (let m = from; m <= to; m += 30) out.push(m);
  return out;
}

const START_OPTIONS = rangeOptions(600, 1410);
const END_OPTIONS = rangeOptions(630, 1440);

export function BlockForm({ stylists, fab = true }: { stylists: Stylist[]; fab?: boolean }) {
  const tr = useT();
  return (
    <FormModal trigger={{ label: 'Add block', icon: 'plus', variant: fab ? 'fab' : 'primary' }} title="Block off time" icon="ban"
      subtitle="Bookings can't be made in this window."
      action={createBlock} submitLabel="Add block" pendingLabel="Adding…" okToast="Block added.">
      <Field label="Stylist" required>
        <select name="stylistId" defaultValue="all" className="ainput">
          <option value="all">{tr('Whole salon')}</option>
          {stylists.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Date" required>
        <input name="date" type="date" required className="ainput" />
      </Field>
      <div className="atwo">
        <Field label="Start" required>
          <select name="startMin" defaultValue={600} className="ainput">
            {START_OPTIONS.map((m) => <option key={m} value={m}>{minutesToLabel(m)}</option>)}
          </select>
        </Field>
        <Field label="End" required>
          <select name="endMin" defaultValue={630} className="ainput">
            {END_OPTIONS.map((m) => <option key={m} value={m}>{minutesToLabel(m)}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Reason" optional>
        <input name="reason" type="text" placeholder={tr('e.g. Holiday, training')} className="ainput" />
      </Field>
    </FormModal>
  );
}
