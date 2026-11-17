'use client';
import { useActionState, useCallback, useEffect, useRef, useState, useSyncExternalStore, startTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Icon, type IconName } from '@/components/ui/icon';
import { SubmitButton } from '@/components/admin/form-kit';
import { useT } from '@/lib/i18n/locale-context';

export type ActionResult = { error: string } | ({ ok: true } & Record<string, unknown>);

export interface ModalTrigger {
  label: string;
  icon?: IconName;
  /** primary = red "+ Add" button, soft = outlined row action, icon = round icon-only button,
   *  fab = the page's main add action, floating bottom-right (round icon-only on phones) */
  variant?: 'primary' | 'soft' | 'icon' | 'fab';
}

const noopSubscribe = () => () => {};

function portalRoot(): HTMLElement {
  return document.getElementById('admin-modals') ?? document.body;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Admin popup form: a trigger button that opens a dialog with the fields,
 * Cancel + Save in a sticky footer. Closes itself and shows a toast when the
 * server action returns { ok: true }; keeps the typed values on an error.
 * Desktop: centred card. Phones: bottom sheet.
 */
export function FormModal({
  trigger, title, subtitle, icon = 'pen', action, submitLabel = 'Save', pendingLabel = 'Saving…',
  okToast = 'Saved.', wide = false, children,
}: {
  trigger: ModalTrigger;
  title: string;
  subtitle?: string;
  icon?: IconName;
  action: (fd: FormData) => Promise<ActionResult>;
  submitLabel?: string;
  pendingLabel?: string;
  okToast?: string | ((res: ActionResult) => string);
  wide?: boolean;
  children: ReactNode;
}) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const onDone = useCallback((res: ActionResult) => {
    setOpen(false);
    setToast(typeof okToast === 'function' ? okToast(res) : tr(okToast));
  }, [okToast, tr]);

  // keep the portal mounted until the exit animations finish
  const [live, setLive] = useState(false);
  const v = trigger.variant ?? 'soft';
  // The floating button is portalled out of the page so a transformed
  // ancestor (the page-enter animation) can't break position: fixed.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const button = (
    <button
      type="button"
      className={v === 'primary' ? 'btn btn--primary afm-trigger' : v === 'fab' ? 'afm-fab' : v === 'icon' ? 'afm-icon' : 'afm-soft'}
      onClick={() => { setLive(true); setOpen(true); }}
      aria-label={v === 'icon' || v === 'fab' ? tr(trigger.label) : undefined}
      title={v === 'icon' || v === 'fab' ? tr(trigger.label) : undefined}
    >
      {trigger.icon && <Icon name={trigger.icon} size={v === 'fab' ? 20 : v === 'primary' ? 17 : 15} />}
      {v !== 'icon' && <span>{tr(trigger.label)}</span>}
    </button>
  );
  return (
    <>
      {v === 'fab' ? (mounted ? createPortal(button, portalRoot()) : null) : button}
      {live && createPortal(
        <>
          <AnimatePresence>
            {open && (
              <ModalShell key="m" title={tr(title)} subtitle={subtitle ? tr(subtitle) : undefined} icon={icon} wide={wide} onClose={close}>
                <ModalForm action={action} submitLabel={submitLabel} pendingLabel={pendingLabel} onDone={onDone} onCancel={close}>
                  {children}
                </ModalForm>
              </ModalShell>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {toast && (
              <motion.div key="t" className="afm-toast" role="status"
                initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.28, ease: EASE }}>
                <span className="afm-toast__ic"><Icon name="check" size={14} /></span>{toast}
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        portalRoot(),
      )}
    </>
  );
}

/** The dialog chrome on its own, for popups that are not a single form. */
export function ModalShell({ title, subtitle, icon = 'pen', wide = false, onClose, children }: {
  title: string; subtitle?: string; icon?: IconName; wide?: boolean; onClose: () => void; children: ReactNode;
}) {
  const tr = useT();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflowY = 'hidden';
    const prev = document.activeElement as HTMLElement | null;
    // focus the first field on desktop (on phones it would pop the keyboard over the sheet)
    const id = window.setTimeout(() => {
      const first = window.matchMedia?.('(min-width: 861px)').matches
        ? panel.current?.querySelector<HTMLElement>('input:not([type=hidden]):not([type=file]), select, textarea')
        : null;
      (first ?? panel.current)?.focus();
    }, 60);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflowY = '';
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div className="afm-overlay" onMouseDown={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <motion.div
        ref={panel}
        className={`afm${wide ? ' afm--wide' : ''}`}
        role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <div className="afm__grip" aria-hidden="true" />
        <header className="afm__head">
          <span className="afm__icon" aria-hidden="true"><Icon name={icon} size={19} /></span>
          <div className="afm__titles">
            <h2 className="afm__title">{title}</h2>
            {subtitle && <p className="afm__sub">{subtitle}</p>}
          </div>
          <button type="button" className="afm__x" aria-label={tr('Close')} onClick={onClose}><Icon name="xmark" size={18} /></button>
        </header>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalForm({ action, submitLabel, pendingLabel, onDone, onCancel, children }: {
  action: (fd: FormData) => Promise<ActionResult>;
  submitLabel: string; pendingLabel: string;
  onDone: (res: ActionResult) => void; onCancel: () => void;
  children: ReactNode;
}) {
  const tr = useT();
  const [state, formAction, pending] = useActionState(
    async (_p: unknown, fd: FormData) => action(fd),
    undefined as undefined | ActionResult,
  );
  useEffect(() => { if (state && 'ok' in state) onDone(state); }, [state, onDone]);
  return (
    // onSubmit + startTransition instead of `action=`: React resets a form
    // after an action prop runs, which would wipe what was typed on an error.
    <form className="afm__form" onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      startTransition(() => formAction(fd));
    }}>
      <div className="afm__body">
        {children}
        {state && 'error' in state && (
          <p className="astatus astatus--err afm__err" role="alert">{String(state.error)}</p>
        )}
      </div>
      <footer className="afm__foot">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>{tr('Cancel')}</button>
        <SubmitButton pending={pending} pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      </footer>
    </form>
  );
}
