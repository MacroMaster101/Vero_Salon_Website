'use client';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { startTransition, useActionState, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/lib/i18n/locale-context';
import { Icon } from '@/components/ui/icon';

/** Labelled field. `optional` adds a quiet "Optional" tag, `required` a red dot; `hint` is helper text under the input. */
export function Field({ label, children, optional, required, hint }: { label: string; children: ReactNode; optional?: boolean; required?: boolean; hint?: string }) {
  const tr = useT();
  return (
    <label className="afield">
      <span className="alabel">
        {tr(label)}
        {required && <span className="areq" aria-hidden="true" />}
        {optional && <span className="aopt">{tr('Optional')}</span>}
      </span>
      {children}
      {hint && <span className="ahint">{tr(hint)}</span>}
    </label>
  );
}

// Placeholders go through the dictionary too (unknown strings come back as-is).
export function TextInput({ placeholder, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const tr = useT();
  return <input className="ainput" placeholder={placeholder ? tr(placeholder) : undefined} {...props} />;
}

export function TextArea({ placeholder, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const tr = useT();
  return <textarea className="atextarea" placeholder={placeholder ? tr(placeholder) : undefined} {...props} />;
}

// Segmented: native radios styled as buttons. Submits `name=value`.
export function Segmented<T extends string>({ name, options, defaultValue }: {
  name: string;
  options: { value: T; label: string }[];
  defaultValue: T;
}) {
  const tr = useT();
  return (
    <div className="aseg">
      {options.map((o) => (
        <label key={o.value} className="aseg__opt">
          <input type="radio" name={name} value={o.value} defaultChecked={o.value === defaultValue} />
          <span>{tr(o.label)}</span>
        </label>
      ))}
    </div>
  );
}

// Switch: real checkbox styled as a toggle. Submits when checked, like before.
export function Switch({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  const tr = useT();
  return (
    <label className="aswitch">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span className="track" />
      {tr(label)}
    </label>
  );
}

export function SubmitButton({ pending, children = 'Save', pendingLabel = 'Saving…' }: { pending?: boolean; children?: ReactNode; pendingLabel?: string }) {
  const tr = useT();
  return <button className="btn btn--primary" type="submit" disabled={pending}>{pending ? tr(pendingLabel) : typeof children === 'string' ? tr(children) : children}</button>;
}

export function FormStatus({ state, okLabel = 'Saved.' }: { state: undefined | { error: string } | { ok: true }; okLabel?: string }) {
  const tr = useT();
  if (!state) return null;
  if ('error' in state) return <p className="astatus astatus--err">{state.error}</p>;
  return <p className="astatus astatus--ok">{tr(okLabel)}</p>;
}

// Delete button as a self-contained form: surfaces the action's error instead
// of failing silently (e.g. rows still referenced by bookings), with optional
// native confirm before submitting.
export function DeleteForm({ action, id, name = 'id', label = 'Delete', confirm, iconOnly = false }: {
  action: (fd: FormData) => Promise<{ error: string } | { ok: true }>;
  id: string;
  name?: string;
  label?: string;
  confirm?: string;
  /** round trash button (row/card actions) instead of the outlined text button */
  iconOnly?: boolean;
}) {
  const tr = useT();
  const [ask, dialog] = useConfirm();
  const [pendingCount, setPendingCount] = useState(0);
  const [state, formAction, pending] = useActionState(
    async (_p: unknown, fd: FormData) => action(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form
      action={(fd) => { setPendingCount((n) => n + 1); formAction(fd); }}
      onSubmit={(e) => {
        if (!confirm) return;
        // Hold the submit, ask in-page, then resubmit without the question.
        e.preventDefault();
        const form = e.currentTarget;
        void ask({ message: tr(confirm), confirmLabel: label }).then((ok) => {
          if (!ok) return;
          const fd = new FormData(form);
          setPendingCount((n) => n + 1);
          startTransition(() => formAction(fd));
        });
      }}
    >
      {dialog}
      <input type="hidden" name={name} value={id} />
      {iconOnly ? (
        <button type="submit" className="afm-icon afm-icon--danger" disabled={pending} aria-label={tr(label)} title={tr(label)}>
          <Icon name="trash" size={15} />
        </button>
      ) : (
        <button type="submit" className="btn btn--danger-outline" disabled={pending}>
          {pending ? tr('Deleting…') : tr(label)}
        </button>
      )}
      {state && 'error' in state && (iconOnly
        ? <ErrorToast key={String(pendingCount)} message={state.error} />
        : <p className="astatus astatus--err">{state.error}</p>)}
    </form>
  );
}

/** Floating error for icon-only deletes, so a refusal doesn't reflow the card. */
function ErrorToast({ message }: { message: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(false), 5000);
    return () => window.clearTimeout(id);
  }, []);
  if (!show) return null;
  return createPortal(
    <div className="afm-toast afm-toast--err" role="alert">
      <span className="afm-toast__ic"><Icon name="xmark" size={13} /></span>{message}
    </div>,
    document.body,
  );
}
