'use client';
import { useActionState, useState } from 'react';
import { Field, TextArea, FormStatus, SubmitButton } from '@/components/admin/form-kit';
import { Icon, type IconName } from '@/components/ui/icon';
import { useT } from '@/lib/i18n/locale-context';
import type { SiteSettings } from '@/lib/settings/schema';
import { FormModal } from '@/components/admin/form-modal';
import { saveSettings, setMaintenance } from './actions';

type State = undefined | { ok: true } | { error: string };

function Toggle({ name, icon, title, text, on, onChange, danger }: {
  name: string; icon: IconName; title: string; text: string; on: boolean; onChange: (v: boolean) => void; danger?: boolean;
}) {
  const tr = useT();
  return (
    <label className={`aset${on ? ' is-on' : ''}${danger ? ' aset--danger' : ''}`}>
      <span className="aset__icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
      <span className="aset__txt"><b>{tr(title)}</b><small>{tr(text)}</small></span>
      <span className="aswitch aset__switch">
        <input type="checkbox" name={name} checked={on} onChange={(e) => onChange(e.target.checked)} />
        <span className="track" />
      </span>
    </label>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const tr = useT();
  const [maint, setMaint] = useState(settings.maintenance);
  const [login, setLogin] = useState(settings.customerLogin);
  const [booking, setBooking] = useState(settings.booking);
  const [state, action, pending] = useActionState<State, FormData>((_p, fd) => saveSettings(fd), undefined);

  return (
    <form action={action} className="asettings">
      <section className="acard asettings__card">
        <h2 className="asec-title">{tr('Website')}</h2>
        <Toggle name="maintenance" icon="lock" danger title="Maintenance mode"
          text="Everyone sees a notice strip at the top of the site, and customer sign-in and online booking are paused. The team can still sign in."
          on={maint} onChange={setMaint} />
        {maint && (
          <Field label="Message in the notice strip" optional>
            <TextArea name="maintenanceMessage" rows={2} maxLength={300} defaultValue={settings.maintenanceMessage} />
          </Field>
        )}
        {!maint && <input type="hidden" name="maintenanceMessage" value={settings.maintenanceMessage} />}
      </section>

      <section className="acard asettings__card">
        <h2 className="asec-title">{tr('Customers')}</h2>
        <Toggle name="customerLogin" icon="user" title="Customer sign-in & sign-up"
          text="When off, customers can’t sign in or create accounts. Staff, owner and front desk can always sign in."
          on={login} onChange={setLogin} />
        <Toggle name="booking" icon="calendar" title="Online booking"
          text="When off, the Book buttons show your message instead of the booking form."
          on={booking} onChange={setBooking} />
        {!booking && (
          <Field label="Message when booking is off" optional>
            <TextArea name="bookingMessage" rows={2} maxLength={300} defaultValue={settings.bookingMessage} />
          </Field>
        )}
        {booking && <input type="hidden" name="bookingMessage" value={settings.bookingMessage} />}
        {maint && <p className="ahint">{tr('Maintenance mode also pauses customer sign-in and booking.')}</p>}
      </section>

      <div className="asettings__bar">
        <FormStatus state={state} okLabel="Settings saved." />
        <SubmitButton pending={pending}>Save settings</SubmitButton>
      </div>
    </form>
  );
}

/** One-tap switch for the Control room header. */
// Uses the in-page popup, not window.confirm (embedded browsers can block that).
export function MaintenanceButton({ on }: { on: boolean }) {
  const tr = useT();
  return (
    <FormModal
      trigger={{ label: on ? 'Maintenance on' : 'Maintenance', icon: 'lock', variant: on ? 'primary' : 'soft' }}
      title={on ? 'Turn maintenance off?' : 'Turn maintenance on?'}
      icon="lock"
      action={setMaintenance}
      submitLabel={on ? 'Turn off' : 'Turn on'}
      pendingLabel="Saving…"
      okToast={on ? 'Maintenance is off.' : 'Maintenance is on.'}
    >
      <input type="hidden" name="on" value={on ? '0' : '1'} />
      <p className="ahint">
        {tr(on
          ? 'The notice strip goes away, and customer sign-in and online booking open again (unless you switched them off in Web settings).'
          : 'Everyone sees a notice strip at the top of the site, and customer sign-in and online booking pause. The team can still sign in.')}
      </p>
    </FormModal>
  );
}
