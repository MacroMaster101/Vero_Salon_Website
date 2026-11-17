'use client';
import { syncHolidays, addManualHoliday } from '@/app/admin/(protected)/holidays/holiday-actions';
import { Field } from '@/components/admin/form-kit';
import { FormModal } from '@/components/admin/form-modal';
import { useT } from '@/lib/i18n/locale-context';

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR, THIS_YEAR + 1];

/** "Sync from Google" + "Add closure" popups (admin Holidays, owner Time off). */
export function HolidayForms({ fab = true }: { fab?: boolean }) {
  const tr = useT();
  return (
    <div className="abtn-row">
      <FormModal trigger={{ label: 'Sync from Google', icon: 'sync' }} title="Sync from Google" icon="sync"
        subtitle="Pull Sri Lankan public & poya holidays for a year. Safe to re-run — it refreshes existing entries."
        action={syncHolidays} submitLabel="Sync holidays" pendingLabel="Syncing…"
        okToast={(r) => `${tr('Synced')} ${'count' in r ? String(r.count) : ''} ${tr('holidays.')}`}>
        <Field label="Year" required>
          <select name="year" defaultValue={THIS_YEAR} className="ainput">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </FormModal>
      <FormModal trigger={{ label: 'Add closure', icon: 'plus', variant: fab ? 'fab' : 'primary' }} title="Add a closure by hand" icon="sun"
        subtitle="For a salon-specific closed day that isn't a public holiday."
        action={addManualHoliday} submitLabel="Add closure" pendingLabel="Adding…" okToast="Added.">
        <Field label="Date" required>
          <input name="date" type="date" required className="ainput" />
        </Field>
        <Field label="Name" required>
          <input name="name" type="text" required placeholder={tr('e.g. Staff training day')} className="ainput" />
        </Field>
      </FormModal>
    </div>
  );
}
